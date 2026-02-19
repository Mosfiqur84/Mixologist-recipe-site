CREATE TABLE users (
    username TEXT PRIMARY KEY,
    hashed_password TEXT NOT NULL
);

CREATE TABLE recipes (
    id TEXT PRIMARY KEY, 
    title TEXT NOT NULL,
    instructions TEXT,
    ingredients TEXT,  
    image_url TEXT,
    category TEXT,
    created_by TEXT,
    FOREIGN KEY(created_by) REFERENCES users(username)
);
