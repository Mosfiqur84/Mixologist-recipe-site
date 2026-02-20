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

CREATE TABLE saved_recipes (
  username TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (username, recipe_id),
  FOREIGN KEY (username) REFERENCES users(username),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
