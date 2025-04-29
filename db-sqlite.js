import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open a database connection
const db = await open({
  filename: process.env.DATABASE_FILE || './database.sqlite',
  driver: sqlite3.Database,
});

// Create the tweet table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS tweet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    author_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Create the user table if it doesn't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255),
    password VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
// Insert a default user if the table is empty
const userCount = await db.get('SELECT COUNT(*) AS count FROM user');
if (userCount.count === 0) {
  await db.run('INSERT INTO user (name, password) VALUES (?, ?)', 'testUser', '$2b$10$eyPmFRSBS7/Q5vRT/Eda1.cjN/IKRsGAmqbT0ucu/bf97DkJhKyjq');
}


// Export the database connection
export default db;