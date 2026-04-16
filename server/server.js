require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'talkify_v2_super_secret_key_change_me';
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

// Serve React production build (../dist created by `npm run build`)
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Setup Multer for media uploads (configurable for persistent volumes like Fly.io)
const dataDir = process.env.DATA_DIR || __dirname;
const uploadDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

let db;
getDb().then(database => {
  db = database;
  console.log('[DB] SQLite Initialized');
}).catch(e => console.error('[DB] Failed to init DB', e));

// ── REST API ROUTES ─────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(400).json({ error: 'Username taken' });

    const id = Date.now().toString(); // simple ID generator
    const hash = await bcrypt.hash(password, 10);
    
    await db.run('INSERT INTO users (id, username, passwordHash) VALUES (?, ?, ?)', [id, username, hash]);
    
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, avatarUrl: user.avatarUrl } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    // Return all users (excluding passwords). In huge apps, paginate this.
    const users = await db.all('SELECT id, username, avatarUrl, isOnline, lastSeen FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch chat history between two users
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    // Validate JWT via headers (simplified for script footprint)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const myId = decoded.id;
    const { chatId } = req.params;

    const messages = await db.all(`
      SELECT * FROM messages 
      WHERE (senderId = ? AND receiverId = ?) 
         OR (senderId = ? AND receiverId = ?)
      ORDER BY timestamp ASC
    `, [myId, chatId, chatId, myId]);
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const mediaUrl = `/uploads/${req.file.filename}`;
  res.json({ url: mediaUrl });
});

app.post('/api/settings/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { username, avatarUrl } = req.body;
    await db.run('UPDATE users SET username = ?, avatarUrl = ? WHERE id = ?', [username, avatarUrl, decoded.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: extract userId from JWT
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── CONTACT / FRIEND REQUEST API ────────────────────────────

// Search users by username (excludes self)
app.get('/api/contacts/search', authMiddleware, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 1) return res.json([]);
    
    const users = await db.all(
      'SELECT id, username, avatarUrl FROM users WHERE username LIKE ? AND id != ? LIMIT 10',
      [`%${q}%`, req.user.id]
    );

    // For each result, check if we already have a contact relationship
    const results = [];
    for (const u of users) {
      const existing = await db.get(
        `SELECT * FROM contacts WHERE 
          (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)`,
        [req.user.id, u.id, u.id, req.user.id]
      );
      results.push({
        ...u,
        contactStatus: existing ? existing.status : null,
        isSender: existing ? existing.senderId === req.user.id : false,
      });
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a friend request
app.post('/api/contacts/request', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot add yourself' });

    // Check if already exists
    const existing = await db.get(
      `SELECT * FROM contacts WHERE 
        (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)`,
      [req.user.id, userId, userId, req.user.id]
    );
    if (existing) return res.status(400).json({ error: 'Request already exists', status: existing.status });

    await db.run(
      'INSERT INTO contacts (senderId, receiverId, status, createdAt) VALUES (?, ?, ?, ?)',
      [req.user.id, userId, 'PENDING', Date.now()]
    );

    // Notify the receiver in real-time via WebSocket
    const sender = await db.get('SELECT id, username, avatarUrl FROM users WHERE id = ?', [req.user.id]);
    sendToUser(userId, JSON.stringify({
      type: 'FRIEND_REQUEST',
      payload: { from: sender }
    }));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a friend request
app.post('/api/contacts/accept', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    // The request was sent by userId TO me → (senderId = userId, receiverId = me)
    await db.run(
      'UPDATE contacts SET status = ? WHERE senderId = ? AND receiverId = ? AND status = ?',
      ['ACCEPTED', userId, req.user.id, 'PENDING']
    );

    // Notify both users of the updated contact list
    broadcastContactsToUser(req.user.id);
    broadcastContactsToUser(userId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline a friend request
app.post('/api/contacts/decline', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    await db.run(
      'DELETE FROM contacts WHERE senderId = ? AND receiverId = ? AND status = ?',
      [userId, req.user.id, 'PENDING']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get accepted contacts (for sidebar)
app.get('/api/contacts', authMiddleware, async (req, res) => {
  try {
    const contacts = await db.all(`
      SELECT u.id as userId, u.username, u.avatarUrl, u.isOnline, u.lastSeen FROM users u
      INNER JOIN contacts c ON 
        (c.senderId = ? AND c.receiverId = u.id AND c.status = 'ACCEPTED')
        OR (c.receiverId = ? AND c.senderId = u.id AND c.status = 'ACCEPTED')
    `, [req.user.id, req.user.id]);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending incoming requests
app.get('/api/contacts/pending', authMiddleware, async (req, res) => {
  try {
    const pending = await db.all(`
      SELECT u.id as userId, u.username, u.avatarUrl FROM users u
      INNER JOIN contacts c ON c.senderId = u.id
      WHERE c.receiverId = ? AND c.status = 'PENDING'
    `, [req.user.id]);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── WEBSOCKET ENGINE ────────────────────────────────────────

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Active connections mapping: userId -> Set of session logic
const connectedUsers = new Map();

function sendToUser(userId, messageString) {
  if (connectedUsers.has(userId)) {
    for (const conn of connectedUsers.get(userId)) {
      if (conn.session.readyState === WebSocket.OPEN) {
        conn.session.send(messageString);
      }
    }
  }
}

async function broadcastPresence() {
  try {
    for (const [userId, connections] of connectedUsers.entries()) {
      // Just check if there's any active connection
      let hasActive = false;
      for (const conn of connections) {
        if (conn.session.readyState === WebSocket.OPEN) {
          hasActive = true;
          break;
        }
      }
      if (hasActive) {
        await broadcastContactsToUser(userId);
      }
    }
  } catch (err) { console.error("[WS] broadcastPresence Error:", err); }
}

async function broadcastContactsToUser(userId) {
  try {
    const contacts = await db.all(`
      SELECT u.id as userId, u.username, u.avatarUrl, u.isOnline, u.lastSeen FROM users u
      INNER JOIN contacts c ON 
        (c.senderId = ? AND c.receiverId = u.id AND c.status = 'ACCEPTED')
        OR (c.receiverId = ? AND c.senderId = u.id AND c.status = 'ACCEPTED')
    `, [userId, userId]);

    const presenceMessage = JSON.stringify({
      type: 'PRESENCE_UPDATE',
      payload: contacts
    });

    sendToUser(userId, presenceMessage);
  } catch (err) { console.error("[WS] broadcastContacts Error:", err); }
}

wss.on('connection', async (ws, req) => {
  // Extract token from query params: ws://localhost:8080/?token=JWT
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const token = urlParams.get('token');
  
  if (!token) {
    ws.close(4001, 'Unauthorized');
    return;
  }

  let currentUserId = null;
  let currentUsername = null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    currentUserId = decoded.id;
    currentUsername = decoded.username;
    
    if (!connectedUsers.has(currentUserId)) {
      connectedUsers.set(currentUserId, new Set());
    }
    const connectionData = { session: ws };
    connectedUsers.get(currentUserId).add(connectionData);
    
    // Mark online in DB
    await db.run('UPDATE users SET isOnline = 1 WHERE id = ?', [currentUserId]);
    console.log(`[+] User Online: ${decoded.username}`);
    
    // Broadcast active states to everyone
    broadcastPresence();
    
    ws.send(JSON.stringify({ type: 'IDENTIFIED', userId: currentUserId, username: decoded.username }));

  } catch (err) {
    ws.close(4001, 'Invalid Token');
    return;
  }

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'PRIVATE_MESSAGE') {
        const { receiverId, content, mediaUrl, timestamp } = message.payload;
        if (!receiverId || (!content && !mediaUrl)) return;
        
        const msgId = 'msg_' + Date.now() + Math.floor(Math.random() * 1000);
        const time = timestamp || Date.now();
        const status = 'SENT';

        // Persist to database
        await db.run(
          'INSERT INTO messages (id, senderId, receiverId, content, mediaUrl, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [msgId, currentUserId, receiverId, content, mediaUrl, status, time]
        );

        const outgoingMsg = JSON.stringify({
          type: 'RECEIVE_MESSAGE',
          payload: { id: msgId, senderId: currentUserId, receiverId, content, mediaUrl, status, timestamp: time }
        });

        // 1-to-1 strict routing
        let sentToReceiver = false;
        if (connectedUsers.has(receiverId)) {
          for (const conn of connectedUsers.get(receiverId)) {
            if (conn.session.readyState === WebSocket.OPEN) {
              conn.session.send(outgoingMsg);
              sentToReceiver = true;
            }
          }
        }
        
        if (sentToReceiver) {
          // Auto-update to DELIVERED since the backend knows it passed through actively
          await db.run('UPDATE messages SET status = "DELIVERED" WHERE id = ?', [msgId]);
          const deliveredEcho = JSON.stringify({
            type: 'MESSAGE_STATUS',
            payload: { messageId: msgId, status: 'DELIVERED', chatId: receiverId } 
          });
          sendToUser(currentUserId, deliveredEcho); // Tell sender's devices it was delivered
        }

        // Echo back to all of sender's devices
        sendToUser(currentUserId, outgoingMsg);
      }
      
      else if (message.type === 'MARK_SEEN') {
        // payload: { senderId: "person who sent the msg" }
        const { senderId } = message.payload;
        
        // Mark all DELIVERED/SENT messages from sender to ME as SEEN
        await db.run(
          'UPDATE messages SET status = "SEEN" WHERE senderId = ? AND receiverId = ? AND status != "SEEN"',
          [senderId, currentUserId]
        );

        // Tell the original sender I've seen them
        sendToUser(senderId, JSON.stringify({
          type: 'MESSAGES_SEEN',
          payload: { seenBy: currentUserId }
        }));
      }

      else if (message.type === 'TYPING') {
        // Volatile (No DB)
        const { receiverId, isTyping } = message.payload;
        sendToUser(receiverId, JSON.stringify({
          type: 'TYPING_INDICATOR',
          payload: { senderId: currentUserId, isTyping }
        }));
      }
      else if (message.type === 'START_CALL') {
        const { targetUserId, callType, roomID } = message.payload;
        sendToUser(targetUserId, JSON.stringify({
          type: 'INCOMING_CALL',
          payload: { fromUserId: currentUserId, fromName: currentUsername, callType, roomID }
        }));
      }
      else if (message.type === 'CANCEL_CALL') {
        const { targetUserId } = message.payload;
        sendToUser(targetUserId, JSON.stringify({
          type: 'CALL_CANCELLED',
          payload: { fromUserId: currentUserId }
        }));
      }
      else if (message.type === 'END_CALL') {
        const { targetUserId } = message.payload;
        sendToUser(targetUserId, JSON.stringify({
          type: 'CALL_ENDED',
          payload: { fromUserId: currentUserId }
        }));
      }
    } catch (e) {
      console.error("Message parse error", e);
    }
  });

  ws.on('close', async () => {
    if (currentUserId && connectedUsers.has(currentUserId)) {
      const connections = connectedUsers.get(currentUserId);
      for (const conn of connections) {
        if (conn.session === ws) {
          connections.delete(conn);
          break;
        }
      }
      
      if (connections.size === 0) {
        connectedUsers.delete(currentUserId);
        await db.run('UPDATE users SET isOnline = 0, lastSeen = ? WHERE id = ?', [new Date().toISOString(), currentUserId]);
        broadcastPresence();
        console.log(`[-] User Offline: ${currentUserId}`);
      }
    }
  });
});

// SPA catch-all: serve React app for any non-API route in production
if (fs.existsSync(distDir)) {
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Talkify server running on port ${PORT}`);
});
