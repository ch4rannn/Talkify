const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const fs = require('fs');

async function getDb() {
  const dataDir = process.env.DATA_DIR || __dirname;
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = await open({
    filename: path.join(dataDir, 'talkify.db'),
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  // Initialize Tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      avatarUrl TEXT,
      isOnline INTEGER DEFAULT 0,
      lastSeen TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      content TEXT,
      mediaUrl TEXT,
      status TEXT DEFAULT 'SENT', 
      timestamp INTEGER NOT NULL,
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      createdAt INTEGER NOT NULL,
      PRIMARY KEY (senderId, receiverId),
      FOREIGN KEY(senderId) REFERENCES users(id),
      FOREIGN KEY(receiverId) REFERENCES users(id)
    );
  `);

  return db;
}

module.exports = { getDb };
