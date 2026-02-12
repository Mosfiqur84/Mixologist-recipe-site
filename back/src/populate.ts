import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as argon2 from "argon2";

async function populate() {
  const db = await open({
    filename: "../database.db",
    driver: sqlite3.Database,
  });

  console.log("Clearing existing data...");
  await db.run("DELETE FROM books");
  await db.run("DELETE FROM authors");
  await db.run("DELETE FROM users");

  console.log("Inserting dummy user");
  const hashedPassword = await argon2.hash("bar");
  await db.run(
    "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
    ["foo", hashedPassword]
  );

  console.log("Inserting dummy authors and books");
  await db.run(`
    INSERT INTO authors (id, name, bio) VALUES 
    ('1', 'Author 1', 'Author of Books.'),
    ('2', 'Author 2', 'Author of Books.')
  `);

  // Insert Books
  await db.run(`
    INSERT INTO books (id, author_id, title, pub_year, genre, created_by) VALUES 
    ('101', '1', 'Book 1', '1977', 'Horror', 'foo'),
    ('102', '1', 'Book 2', '1986', 'Horror', 'foo'),
    ('103', '1', 'Book 3', '1987', 'Thriller', 'foo'),
    ('104', '2', 'Book 4', '2019', 'Romance', 'foo'),
    ('105', '2', 'Book 5', '2022', 'Romance', 'foo'),
    ('106', '2', 'Book 6', '2018', 'Romance', 'foo')
  `);

  console.log("Database populated successfully!");
}

populate().catch((err) => {
  console.error("Error populating database:", err);
  process.exit(1);
});