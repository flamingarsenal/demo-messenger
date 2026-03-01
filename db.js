const Database = require('better-sqlite3');
const db = new Database('chat.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL
  );
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    createdBy INTEGER,
    FOREIGN KEY (createdBy) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomId INTEGER,
    userId INTEGER,
    content TEXT NOT NULL CHECK (LENGTH(content) > 0),
    timestamp INTEGER DEFAULT (UNIXEPOCH()),
    isGlobal INTEGER NOT NULL CHECK (isGlobal IN (0,1)) DEFAULT 0,
    FOREIGN KEY (roomId) REFERENCES rooms(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS memberships (
    userId INTEGER,
    roomId INTEGER,
    PRIMARY KEY (userId, roomId),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (roomId) REFERENCES rooms(id)
  );
`);

function createUser(username) {
  return db.prepare('INSERT INTO users (username) VALUES (?)').run(username);
}

function createRoom(name, username) {
  const createdBy = getIdFromUsername(username);
  
  if (!createdBy) throw new Error('User not found');

  const roomId = db.prepare('INSERT INTO rooms (name, createdBy) VALUES (?, ?)').run(name, createdBy).lastInsertRowid;
  db.prepare('INSERT INTO memberships (userId, roomId) VALUES (?, ?)').run(createdBy, roomId);
  return roomId;
}

function addMessage(roomId, username, text, isGlobal) {
  const userId = getIdFromUsername(username);
  
  if (!userId) throw new Error("User not found");
  
  return db.prepare('INSERT INTO messages (roomId, userId, content, isGlobal) VALUES (?, ?, ?, ?)').run(roomId, userId, text, +isGlobal);
}

function getMessagesByRoom(roomId) {
  if (!roomId) throw new Error('Room not found');
  
  let output = [];
  const messages = db.prepare('SELECT * FROM messages WHERE roomId = ? ORDER BY timestamp').all(roomId);

  const placeholder = messages.map(() => '?').join(',');
  const stmt = db.prepare(`SELECT * FROM users WHERE id IN (${placeholder})`);

  const users = stmt.all(...messages.map(message => message.userId));

  messages.forEach((message, i) => {
    const usersIndex = users.findIndex(user => user.id == message.userId);
    const username = users[usersIndex].username;
    const text = message.content;
    const isGlobal = Boolean(message.isGlobal);
    const time = message.timestamp;
    output.push({username, text, isGlobal, time});
  })

  return output;
}

function joinUser(username, newUser, roomId) {
  try {
    const user1 = getIdFromUsername(username);
    const user2 = getIdFromUsername(newUser);
    const membership = db.prepare('SELECT * FROM memberships WHERE userId = ? AND roomId = ?').get(user1, roomId);
    
    return db.prepare('INSERT INTO memberships (userId, roomId) VALUES (?, ?)').run(user2, roomId);
  } catch (e) {
    console.log(e)
    throw new Error('Cannot add user ' + newUser + ' to room');
  }
}

function getIdFromUsername(username) {
  try {
    const userId = db.prepare('SELECT id FROM users WHERE username = ?').get(username).id;
    return userId;
  } catch {
    throw new Error('Invalid username ' + username);
  }
}

function getUsers(username, roomId) {
  const userId = username ? getIdFromUsername(username) : '';
  const ids = [];
  try {
    const stmt = db.prepare('SELECT userId FROM memberships WHERE roomId = ? AND userId != ?');
    for (const row of stmt.iterate(roomId, userId)) {
      ids.push(row.userId);
    }
  } catch {
    throw new Error('Invalid roomId');
  } 
  const placeholders = ids.map(() => '?').join(',');  // "?,?,?"
  const stmt = db.prepare(`SELECT username FROM users WHERE id IN (${placeholders})`);
      
  const rows = stmt.all(...ids);
  return rows.map(r => r.username);
}

function removeUser(username) {
  if (!username) {
    throw new Error('No username provided');
  }
  const userId = getIdFromUsername(username);
  db.prepare('DELETE FROM memberships WHERE userId = ?').run(userId);
  return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

function leaveRoom(roomId, username) {
  if (!roomId) throw new Error('No room id provided');
  if (!username) throw new Error('No username provided');

  const userId = getIdFromUsername(username);
  db.prepare('DELETE FROM memberships WHERE userId = ? AND roomId = ?').run(userId, roomId);

  const members = db.prepare('SELECT * FROM memberships WHERE roomId = ?').get(roomId);
  if (!members) {
    db.prepare('DELETE FROM messages WHERE roomId = ?').run(roomId);
    db.prepare('DELETE FROM rooms WHERE id = ?').run(roomId);
    return false;
  } else {
    return true;
  }
}

module.exports = {createUser, createRoom, addMessage, getMessagesByRoom, joinUser, getIdFromUsername, getUsers, removeUser, leaveRoom};
