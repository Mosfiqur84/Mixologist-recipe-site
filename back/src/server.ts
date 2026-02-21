import express from "express";
import { z } from "zod";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import * as argon2 from "argon2";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import moment from "moment";

// https://github.com/TryGhost/node-sqlite3/wiki/API
sqlite3.verbose(); // enable better error messages
let db: Database = await open({
  // server is run by cding into src/
  // so db is in parent directory
  filename: "../database.db",
  driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON"); 

let app = express();
app.set('trust proxy', 1);
app.use(express.static("public"))

app.use(express.json({ limit: "1kb" }));
app.use(helmet());
app.use(cookieParser());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests, please try again later."
});
app.use(limiter);

const sessions: Record<string, string> = {};

app.get("/api/me", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Not logged in" });
  res.json({ username });
});

function parseError(zodError: z.ZodError): string[] {
  let { formErrors, fieldErrors } = zodError.flatten();
  // fancy functional programming
  return [
    ...formErrors,
    ...Object.entries(fieldErrors).map(
      ([property, message]) => `"${property}": ${message}`,
    ),
  ];
}

// --- AUTHORIZATION HELPER ---
// Checks if a valid session exists for the token in the cookies 
async function getLoggedInUser(req: express.Request): Promise<string | null> {
  const token = req.cookies.token;
  if (!token || !sessions[token]) {
    return null;
  }
  return sessions[token]; // Returns the username associated with the token [cite: 28]
}


// Replace bookBodySchema with this:
const recipeBodySchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  instructions: z.string().optional(),
  ingredients: z.string().optional(),
  image_url: z.string().optional(),
  category: z.string().optional(),
});

// Replace the old GET /api/books with this
app.get("/api/recipes", async (req, res) => {
  try {
    // We use "recipes" instead of "books" now
    const recipes = await db.all("SELECT * FROM recipes ORDER BY title ASC");
    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error: Did you run npm run setup?" });
  }
});

// Update the POST /api/recipes route to use the correct columns
app.post("/api/recipes", async (req, res) => {
  // Try to get the user, but don't error out if they are null
  const username = await getLoggedInUser(req); 

  const { id, title, instructions, ingredients, image_url, category } = req.body;
  
  try {
    await db.run(
      "INSERT INTO recipes(id, title, instructions, ingredients, image_url, category, created_by) VALUES(?, ?, ?, ?, ?, ?, ?)",
      [id, title, instructions, ingredients, image_url, category, username || null] // Use null for guests
    );
    res.status(201).json({ message: "Recipe saved to the public cabinet!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "This recipe is already in the cabinet." });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Please login first." });

  try {
    // Ensure users can only delete their own recipes
    const result = await db.run(
      "DELETE FROM recipes WHERE id = ? AND created_by = ?",
      [req.params.id, username]
    );
    if (result.changes === 0) return res.status(403).json({ error: "Unauthorized" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/recipes/search", async (req, res) => {
  try {
    const searchQuery = String(req.query.q || "").trim();

    // Frontend already uses "s" (name) and "i" (ingredient),
    // matching TheCocktailDB API, so we keep that here.
    const searchType = String(req.query.type || "s");

    if (!searchQuery) {
      return res.json({ recipes: [] });
    }

    const searchPattern = `%${searchQuery}%`;

    let recipes;

    if (searchType === "i") {
      recipes = await db.all("SELECT * FROM recipes WHERE ingredients LIKE ? ORDER BY title ASC", [searchPattern]);
    } else {
      recipes = await db.all("SELECT * FROM recipes WHERE title LIKE ? ORDER BY title ASC", [searchPattern]);
    }

    res.json({ recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database search failed" });
  }
});







app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

  if (user && await argon2.verify(user.hashed_password, password)) {
    const token = Math.random().toString(36).substring(2); // Generate unique token 
    sessions[token] = username; // Store session [cite: 27]
    
    res.cookie("token", token, { 
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV === 'production' // Only send over HTTPS in production
})
    return res.json({ username });
  }
  
  res.status(401).json({ error: "Invalid credentials" }); // [cite: 6, 15]
});

// POST /api/register [cite: 7, 29]
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters." });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores." });
  }
  if (!password || typeof password !== "string" || password.length < 3) {
    return res.status(400).json({ error: "Password must be 3 letters long." });
  }

  const existing = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: "Username already taken." });

  const hashed = await argon2.hash(password);
  await db.run("INSERT INTO users (username, hashed_password) VALUES (?, ?)", [username, hashed]);
  res.status(201).json({ message: "Account created" });
});

app.post("/api/logout", (req, res) => {
  const token = req.cookies.token;
  if (token) delete sessions[token];
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

app.post("/api/cabinet/:id", async (req, res) => {
  let username = await getLoggedInUser(req);
  if (!username) {
    return res.status(401).json({ error: "Login required." });
  }

  let recipeId = req.params.id;

  try {
    const { title, instructions, ingredients, image_url, category } = req.body || {};

    if (title) {
      await db.run(
        `INSERT OR IGNORE INTO recipes (id, title, instructions, ingredients, image_url, category, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [recipeId, title, instructions ?? null, ingredients ?? null, image_url ?? null, category ?? null, null]
      );
    }

    const exists = await db.get("SELECT id FROM recipes WHERE id = ?", [recipeId]);
    if (!exists) {
      return res.status(404).json({ error: "Recipe not found." });
    }

    await db.run("INSERT OR IGNORE INTO saved_recipes (username, recipe_id) VALUES (?, ?)", [username, recipeId]);

    res.json({ message: "Saved to cabinet." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save." });
  }
});

app.get("/api/cabinet", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) {
    return res.status(401).json({ error: "Login required." });
  }

  try {
    const recipes = await db.all(
      `SELECT r.*, s.saved_at FROM recipes r JOIN saved_recipes s ON s.recipe_id = r.id WHERE s.username = ? ORDER BY s.saved_at DESC`, [username]
    );

    res.json({ recipes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load cabinet." });
  }
});


app.post("/api/favorites/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Login required." });

  const recipeId = req.params.id;
  const { title, instructions, ingredients, image_url, category } = req.body || {};

  try {
    if (title) {
      await db.run(
        `INSERT OR IGNORE INTO recipes (id, title, instructions, ingredients, image_url, category, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [recipeId, title, instructions ?? null, ingredients ?? null, image_url ?? null, category ?? null, null]
      );
    }
    await db.run(
      "INSERT OR IGNORE INTO saved_recipes (username, recipe_id) VALUES (?, ?)",
      [username, recipeId]
    );
    res.json({ message: "Added to favorites." });
  } catch (err) {
    res.status(500).json({ error: "Failed to favorite." });
  }
});

app.delete("/api/favorites/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Login required." });

  try {
    await db.run(
      "DELETE FROM saved_recipes WHERE username = ? AND recipe_id = ?",
      [username, req.params.id]
    );
    res.json({ message: "Removed from favorites." });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfavorite." });
  }
});

app.get("/api/favorites/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.json({ favorited: false });

  try {
    const row = await db.get(
      "SELECT * FROM saved_recipes WHERE username = ? AND recipe_id = ?",
      [username, req.params.id]
    );
    res.json({ favorited: !!row });
  } catch (err) {
    res.status(500).json({ error: "Database error." });
  }
});


let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
  console.log(`${protocol}://${host}:${port}`);
});

app.get("/{*whatever}", (req, res) => {
  res.sendFile("public/index.html", { root: import.meta.dirname });
});
