CREATE TABLE users (
    username TEXT PRIMARY KEY,
    hashed_password TEXT NOT NULL
);

CREATE TABLE authors (
    id TEXT PRIMARY KEY,
    name TEXT,
    bio TEXT
);

CREATE TABLE books (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    title TEXT,
    pub_year TEXT,
    genre TEXT,
    created_by TEXT, -- Tracks which user created this book
    FOREIGN KEY(author_id) REFERENCES authors(id),
    FOREIGN KEY(created_by) REFERENCES users(username)
);