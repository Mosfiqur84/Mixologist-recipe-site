import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as argon2 from "argon2";

async function populate() {
  const db = await open({
    filename: "../database.db",
    driver: sqlite3.Database,
  });

  console.log("Clearing existing data...");
  // Update these to match the tables in setup.sql
  await db.run("DELETE FROM recipes");
  await db.run("DELETE FROM users");

  console.log("Inserting dummy user...");
  const hashedPassword = await argon2.hash("bar");
  await db.run(
    "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
    ["foo", hashedPassword]
  );

  console.log("Inserting dummy recipe...");
  await db.run(`
    INSERT INTO recipes (id, title, instructions, ingredients, image_url, category, created_by) VALUES 
    ('11007', 'Margarita', 'Rub the rim of the glass with the lime slice...', 'Tequila, Triple Sec, Lime Juice', 'https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg', 'Ordinary Drink', 'foo')
  `);

  console.log("Inserting Mojito...");
  await db.run(
    `INSERT INTO recipes (id, title, instructions, ingredients, image_url, category, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      "local-mojito-1",
      "Mojito (Local)",
      "Muddle mint with lime juice and sugar. Add rum, fill with ice, top with soda, and stir gently.",
      "White rum, Lime juice, Mint, Sugar, Soda water, Ice",
      "https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg",
      "Cocktail",
      "foo",
    ]
  );

  console.log("Database populated successfully!");
}

populate().catch((err) => {
  console.error("Error populating database:", err);
  process.exit(1);
});