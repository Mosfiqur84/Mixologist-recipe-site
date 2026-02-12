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

const authorBodySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"), 
  bio: z.optional(z.string()), 
});

type Author = z.infer<typeof authorBodySchema>;
type AuthorDB = Author; 

const bookBodySchema = z.object({
  id: z.string(), 
  author_id: z.string(), 
  title: z.string().min(1, "Title is required"), 
  pub_year: z.string().regex(/^\d{4}$/, "Must be a 4-digit year (e.g. 1995)"), 
  genre: z.string().optional(), 
});

type Book = z.infer<typeof bookBodySchema>;
type BookDB = Book; 


// POST /authors - Create a new author (Login Required) 
app.post("/api/authors", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Unauthorized: Please log in." });

  let parseResult = authorBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  const { id, name, bio } = parseResult.data;
  try {
    await db.run(
      "INSERT INTO authors(id, name, bio) VALUES(?, ?, ?)",
      [id, name, bio]
    );
    res.status(201).set("Location", id).json();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /authors - Get all authors
app.get("/api/authors", async (req, res) => {
  try {
    const authors = await db.all<AuthorDB[]>("SELECT * FROM authors");
    res.json({ authors });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// GET /books - Get all books with optional genre filter
app.get("/api/books", async (req, res) => {
  const { genre } = req.query; // e.g., /books?genre=sci-fi
  let query = "SELECT * FROM books";
  let params: any[] = [];

  if (genre) {
    query += " WHERE genre = ?";
    params.push(genre);
  }

  query += " ORDER BY title ASC";

  try {
    const books = await db.all<BookDB[]>(query, params);
    res.json({ books });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// POST /books - Create a new book (Login Required) 
app.post("/api/books", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Unauthorized: Please log in." });

  let parseResult = bookBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  const { id, author_id, title, pub_year, genre } = parseResult.data;
  try {
    // We include the 'created_by' field to track ownership 
    await db.run(
      "INSERT INTO books(id, author_id, title, pub_year, genre, created_by) VALUES(?, ?, ?, ?, ?, ?)",
      [id, author_id, title, pub_year, genre, username]
    );
    res.status(201).set("Location", id).json();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /books/:id - Get a single book
app.get("/api/books/:id", async (req, res) => {
  const { id } = req.params;
  const book = await db.get<BookDB>("SELECT * FROM books WHERE id = ?", [id]);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// DELETE /books/:id - Remove a book (Login Required + Ownership Required) 
app.delete("/api/books/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Unauthorized: Please log in." });

  const { id } = req.params;

  // 1. Check ownership [cite: 26]
  const book = await db.get("SELECT created_by FROM books WHERE id = ?", [id]);
  if (!book) return res.status(404).json({ error: "Book not found" });

  // 2. Authorization check 
  if (book.created_by !== username) {
    return res.status(403).json({ error: "Forbidden: You can only delete books you created." });
  }

  await db.run("DELETE FROM books WHERE id = ?", [id]);
  res.status(204).send();
});

// PUT /books/:id - Update a book (Login Required + Ownership Required) 
app.put("/api/books/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Unauthorized: Please log in." });

  const { id } = req.params;
  
  // 1. Check if the book exists and who created it [cite: 26]
  const book = await db.get("SELECT created_by FROM books WHERE id = ?", [id]);
  if (!book) return res.status(404).json({ error: "Book not found" });

  // 2. Authorization check: must be the creator 
  if (book.created_by !== username) {
    return res.status(403).json({ error: "Forbidden: You can only edit books you created." });
  }

  let parseResult = bookBodySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseError(parseResult.error) });
  }

  const { author_id, title, pub_year, genre } = parseResult.data;

  try {
    await db.run(
      `UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?`,
      [author_id, title, pub_year, genre, id]
    );
    res.json({ message: "Book updated successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /authors/:id - Get a single author
app.get("/api/authors/:id", async (req, res) => {
  const { id } = req.params;
  const author = await db.get<AuthorDB>("SELECT * FROM authors WHERE id = ?", [id]);
  if (!author) return res.status(404).json({ error: "Author not found" });
  res.json(author);
});

// DELETE /authors/:id - Remove an author (Login Required) 
app.delete("/api/authors/:id", async (req, res) => {
  const username = await getLoggedInUser(req);
  if (!username) return res.status(401).json({ error: "Unauthorized: Please log in." });

  const { id } = req.params;
  const result = await db.run("DELETE FROM authors WHERE id = ?", [id]);
  if (result.changes === 0) return res.status(404).json({ error: "Author not found" });
  res.status(204).send();
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
  
  // Server-side validation for existing user [cite: 7, 29]
  const existing = await db.get("SELECT * FROM users WHERE username = ?", [username]);
  if (existing) return res.status(400).json({ error: "Username taken" });

  const hashed = await argon2.hash(password); // [cite: 4]
  await db.run("INSERT INTO users (username, hashed_password) VALUES (?, ?)", [username, hashed]);
  res.status(201).json({ message: "Account created" });
});

app.post("/api/logout", (req, res) => {
  const token = req.cookies.token;
  if (token) delete sessions[token];
  res.clearCookie("token");
  res.json({ message: "Logged out" });
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
