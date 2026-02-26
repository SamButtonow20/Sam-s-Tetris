const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { Pool } = require('pg');

const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const rooms = new Map(); // room -> { players: [{ws,name}], spectators: [{ws,name}], started: false, seed: null }
const rankedQueue = []; // [{ws, name, elo}] — players waiting for ranked match

// ==================== USER AUTH / PROFILES ====================
// Uses PostgreSQL when DATABASE_URL is set (Railway), otherwise falls back to local JSON file.

const DATABASE_URL = process.env.DATABASE_URL;
let pool = null;
let useDB = false;

if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  useDB = true;
  console.log('[DB] Using PostgreSQL for account storage');
} else {
  console.log('[DB] No DATABASE_URL — using local users.json (data will not persist across deploys)');
}

async function initDB() {
  if (!useDB) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        username_lower VARCHAR(20) PRIMARY KEY,
        username      VARCHAR(20) NOT NULL,
        salt          VARCHAR(32) NOT NULL,
        hash          VARCHAR(128) NOT NULL,
        token         VARCHAR(64),
        created_at    BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
        profile       JSONB NOT NULL DEFAULT '{}'::jsonb
      );
    `);
    console.log('[DB] users table ready');
  } finally {
    client.release();
  }
}

// ----- JSON file fallback (local dev) -----
const USERS_FILE = path.join(ROOT, 'users.json');
function loadUsersFile() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch { return {}; }
}
function saveUsersFile(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ----- DB helpers -----
async function dbGetUser(usernameLower) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username_lower = $1', [usernameLower]);
  return rows[0] || null;
}
async function dbGetUserByToken(token) {
  const { rows } = await pool.query('SELECT * FROM users WHERE token = $1', [token]);
  return rows[0] || null;
}
async function dbCreateUser(usernameLower, username, salt, hash, token, profile) {
  await pool.query(
    'INSERT INTO users (username_lower, username, salt, hash, token, profile) VALUES ($1,$2,$3,$4,$5,$6)',
    [usernameLower, username, salt, hash, token, JSON.stringify(profile)]
  );
}
async function dbUpdateToken(usernameLower, token) {
  await pool.query('UPDATE users SET token = $1 WHERE username_lower = $2', [token, usernameLower]);
}
async function dbUpdateProfile(usernameLower, profile) {
  await pool.query('UPDATE users SET profile = $1 WHERE username_lower = $2', [JSON.stringify(profile), usernameLower]);
}
async function dbGetLeaderboard() {
  const { rows } = await pool.query('SELECT username, profile FROM users');
  return rows;
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Parse JSON body from request
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 10000) reject(new Error('Too large')); });
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
    req.on('error', reject);
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function getRoom(name) {
  if (!rooms.has(name)) {
    rooms.set(name, { players: [], spectators: [], started: false, seed: null });
  }
  return rooms.get(name);
}

function broadcastAll(roomName, payload, exceptWs = null) {
  const r = rooms.get(roomName);
  if (!r) return;
  for (const m of r.players) {
    if (m.ws !== exceptWs) send(m.ws, payload);
  }
  for (const s of r.spectators) {
    if (s.ws !== exceptWs) send(s.ws, payload);
  }
}

function sendLobbyUpdate(roomName) {
  const room = rooms.get(roomName);
  if (!room) return;
  const playerList = room.players.map((p, i) => ({ slot: i, name: p.name }));
  const spectatorList = room.spectators.map(s => ({ name: s.name }));
  for (let i = 0; i < room.players.length; i++) {
    send(room.players[i].ws, {
      type: 'lobby', you: i, players: playerList, spectators: spectatorList, isSpectator: false
    });
  }
  for (const s of room.spectators) {
    send(s.ws, {
      type: 'lobby', players: playerList, spectators: spectatorList, isSpectator: true
    });
  }
}

function removeClient(ws) {
  for (const [roomName, room] of rooms.entries()) {
    const pidx = room.players.findIndex(m => m.ws === ws);
    if (pidx >= 0) {
      room.players.splice(pidx, 1);
      if (room.started) {
        broadcastAll(roomName, { type: 'opponent_left', player: pidx });
      } else {
        sendLobbyUpdate(roomName);
      }
      if (room.players.length === 0 && room.spectators.length === 0) rooms.delete(roomName);
      return;
    }
    const sidx = room.spectators.findIndex(m => m.ws === ws);
    if (sidx >= 0) {
      room.spectators.splice(sidx, 1);
      if (!room.started) sendLobbyUpdate(roomName);
      if (room.players.length === 0 && room.spectators.length === 0) rooms.delete(roomName);
      return;
    }
  }
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==================== AUTH API ROUTES ====================
  if (req.method === 'POST' && req.url === '/api/register') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) return sendJSON(res, 400, { error: 'Username and password required' });
      const name = String(username).trim().substring(0, 20);
      if (name.length < 2) return sendJSON(res, 400, { error: 'Username must be at least 2 characters' });
      if (password.length < 4) return sendJSON(res, 400, { error: 'Password must be at least 4 characters' });
      const nameLower = name.toLowerCase();
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      const token = generateToken();
      const defaultProfile = {
        coins: 0,
        ownedSkins: ['default'],
        equippedSkin: 'default',
        stats: { gamesPlayed: 0, totalScore: 0, bestScore: 0, totalLines: 0, bestLines: 0, bestCombo: 0, totalTetris: 0, totalTSpins: 0, totalPerfectClears: 0, totalTime: 0, piecesPlaced: 0, totalB2B: 0 },
        ranked: { elo: 1000, wins: 0, losses: 0, history: [] },
        achievements: {},
        keybinds: null
      };

      if (useDB) {
        const existing = await dbGetUser(nameLower);
        if (existing) return sendJSON(res, 409, { error: 'Username already taken' });
        await dbCreateUser(nameLower, name, salt, hash, token, defaultProfile);
      } else {
        const users = loadUsersFile();
        if (users[nameLower]) return sendJSON(res, 409, { error: 'Username already taken' });
        users[nameLower] = { username: name, salt, hash, token, createdAt: Date.now(), profile: defaultProfile };
        saveUsersFile(users);
      }
      return sendJSON(res, 200, { ok: true, token, username: name, profile: defaultProfile });
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) return sendJSON(res, 400, { error: 'Username and password required' });
      const nameLower = String(username).trim().toLowerCase();

      if (useDB) {
        const row = await dbGetUser(nameLower);
        if (!row) return sendJSON(res, 401, { error: 'Invalid username or password' });
        const hash = hashPassword(password, row.salt);
        if (hash !== row.hash) return sendJSON(res, 401, { error: 'Invalid username or password' });
        const token = generateToken();
        await dbUpdateToken(nameLower, token);
        return sendJSON(res, 200, { ok: true, token, username: row.username, profile: row.profile });
      } else {
        const users = loadUsersFile();
        const user = users[nameLower];
        if (!user) return sendJSON(res, 401, { error: 'Invalid username or password' });
        const hash = hashPassword(password, user.salt);
        if (hash !== user.hash) return sendJSON(res, 401, { error: 'Invalid username or password' });
        user.token = generateToken();
        saveUsersFile(users);
        return sendJSON(res, 200, { ok: true, token: user.token, username: user.username, profile: user.profile });
      }
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'POST' && req.url === '/api/profile') {
    try {
      const auth = req.headers.authorization;
      const body = await parseBody(req);
      let token;
      if (auth && auth.startsWith('Bearer ')) { token = auth.slice(7); }
      else if (body.token) { token = body.token; }
      if (!token) return sendJSON(res, 401, { error: 'Not authenticated' });

      if (useDB) {
        const row = await dbGetUserByToken(token);
        if (!row) return sendJSON(res, 401, { error: 'Invalid session' });
        let prof = row.profile || {};
        const { profile } = body;
        if (profile) {
          if (typeof profile.coins === 'number') prof.coins = Math.max(0, profile.coins);
          if (Array.isArray(profile.ownedSkins)) prof.ownedSkins = profile.ownedSkins;
          if (typeof profile.equippedSkin === 'string') prof.equippedSkin = profile.equippedSkin;
          if (profile.stats && typeof profile.stats === 'object') prof.stats = profile.stats;
          if (profile.ranked && typeof profile.ranked === 'object') prof.ranked = profile.ranked;
          if (profile.achievements && typeof profile.achievements === 'object') prof.achievements = profile.achievements;
          if (profile.keybinds) prof.keybinds = profile.keybinds;
          await dbUpdateProfile(row.username_lower, prof);
        }
        return sendJSON(res, 200, { ok: true, username: row.username, profile: prof });
      } else {
        const users = loadUsersFile();
        const userEntry = Object.values(users).find(u => u.token === token);
        if (!userEntry) return sendJSON(res, 401, { error: 'Invalid session' });
        const { profile } = body;
        if (profile) {
          if (typeof profile.coins === 'number') userEntry.profile.coins = Math.max(0, profile.coins);
          if (Array.isArray(profile.ownedSkins)) userEntry.profile.ownedSkins = profile.ownedSkins;
          if (typeof profile.equippedSkin === 'string') userEntry.profile.equippedSkin = profile.equippedSkin;
          if (profile.stats && typeof profile.stats === 'object') userEntry.profile.stats = profile.stats;
          if (profile.ranked && typeof profile.ranked === 'object') userEntry.profile.ranked = profile.ranked;
          if (profile.achievements && typeof profile.achievements === 'object') userEntry.profile.achievements = profile.achievements;
          if (profile.keybinds) userEntry.profile.keybinds = profile.keybinds;
          saveUsersFile(users);
        }
        return sendJSON(res, 200, { ok: true, username: userEntry.username, profile: userEntry.profile });
      }
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  // GET /api/profile — read profile via token (no body needed)
  if (req.method === 'GET' && req.url === '/api/profile') {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) return sendJSON(res, 401, { error: 'Not authenticated' });
      const token = auth.slice(7);

      if (useDB) {
        const row = await dbGetUserByToken(token);
        if (!row) return sendJSON(res, 401, { error: 'Invalid session' });
        return sendJSON(res, 200, { ok: true, username: row.username, profile: row.profile });
      } else {
        const users = loadUsersFile();
        const userEntry = Object.values(users).find(u => u.token === token);
        if (!userEntry) return sendJSON(res, 401, { error: 'Invalid session' });
        return sendJSON(res, 200, { ok: true, username: userEntry.username, profile: userEntry.profile });
      }
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'GET' && req.url === '/api/leaderboard') {
    try {
      if (useDB) {
        const rows = await dbGetLeaderboard();
        const board = rows
          .filter(r => r.profile && r.profile.stats && r.profile.stats.gamesPlayed > 0)
          .map(r => ({ name: r.username, score: r.profile.stats.bestScore, lines: r.profile.stats.bestLines, games: r.profile.stats.gamesPlayed, elo: (r.profile.ranked || {}).elo || 1000 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 50);
        return sendJSON(res, 200, { leaderboard: board });
      } else {
        const users = loadUsersFile();
        const board = Object.values(users)
          .filter(u => u.profile.stats.gamesPlayed > 0)
          .map(u => ({ name: u.username, score: u.profile.stats.bestScore, lines: u.profile.stats.bestLines, games: u.profile.stats.gamesPlayed, elo: u.profile.ranked.elo }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 50);
        return sendJSON(res, 200, { leaderboard: board });
      }
    } catch (e) { return sendJSON(res, 500, { error: 'Leaderboard error' }); }
  }

  // ==================== STATIC FILE SERVER ====================
  const reqPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(reqPath).replace(/^\\.\\.[/\\]/, '');
  const filePath = path.join(ROOT, safePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const type =
      ext === '.html' ? 'text/html' :
      ext === '.css' ? 'text/css' :
      ext === '.js' ? 'application/javascript' :
      ext === '.wav' ? 'audio/wav' :
      ext === '.mp3' ? 'audio/mpeg' :
      ext === '.json' ? 'application/json' :
      ext === '.png' ? 'image/png' :
      ext === '.svg' ? 'image/svg+xml' :
      'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    // ==================== RANKED MATCHMAKING ====================
    if (msg.type === 'ranked_queue') {
      const name = String(msg.name || 'Player');
      const elo = Number(msg.elo) || 1000;
      // Remove if already in queue
      const existIdx = rankedQueue.findIndex(q => q.ws === ws);
      if (existIdx >= 0) rankedQueue.splice(existIdx, 1);
      rankedQueue.push({ ws, name, elo });
      ws._ranked = true;
      ws._rankedOpponent = null;

      // Try to match two players
      if (rankedQueue.length >= 2) {
        const p1 = rankedQueue.shift();
        const p2 = rankedQueue.shift();
        const seed = Math.floor(Math.random() * 1_000_000);
        // Link them
        p1.ws._rankedOpponent = p2.ws;
        p2.ws._rankedOpponent = p1.ws;
        send(p1.ws, { type: 'ranked_matched', seed, opponentName: p2.name, opponentElo: p2.elo });
        send(p2.ws, { type: 'ranked_matched', seed, opponentName: p1.name, opponentElo: p1.elo });
      } else {
        // Notify queue position
        send(ws, { type: 'ranked_queue_pos', count: rankedQueue.length });
      }
      return;
    }

    if (msg.type === 'ranked_cancel') {
      const idx = rankedQueue.findIndex(q => q.ws === ws);
      if (idx >= 0) rankedQueue.splice(idx, 1);
      ws._ranked = false;
      return;
    }

    if (msg.type === 'ranked_snapshot' || msg.type === 'ranked_attack') {
      // Forward to opponent
      const opp = ws._rankedOpponent;
      if (opp && opp.readyState === opp.OPEN) {
        const fwdType = msg.type === 'ranked_snapshot' ? 'ranked_opponent_snapshot' : 'ranked_attack';
        send(opp, { ...msg, type: fwdType });
      }
      return;
    }

    if (msg.type === 'join') {
      const roomName = String(msg.room || 'default');
      const name = String(msg.name || 'Player');
      const isSpectator = Boolean(msg.spectator);
      const room = getRoom(roomName);

      if (room.started) {
        if (!isSpectator) {
          send(ws, { type: 'error', message: 'Game already in progress. Join as spectator to watch.' });
          return;
        }
        room.spectators.push({ ws, name });
        ws.room = roomName;
        ws.name = name;
        ws.isSpectator = true;
        send(ws, { type: 'spectating', room: roomName, players: room.players.map((p, i) => ({ slot: i, name: p.name })) });
        return;
      }

      if (isSpectator) {
        room.spectators.push({ ws, name });
        ws.room = roomName;
        ws.name = name;
        ws.isSpectator = true;
      } else {
        if (room.players.length >= 4) {
          send(ws, { type: 'error', message: 'Room full (4 players max)' });
          return;
        }
        room.players.push({ ws, name });
        ws.room = roomName;
        ws.name = name;
        ws.isSpectator = false;
        ws.playerSlot = room.players.length - 1;
      }

      if (room.players.length <= 1 && room.spectators.length === 0) {
        send(ws, { type: 'waiting', count: 1 });
      } else {
        sendLobbyUpdate(roomName);
      }
      return;
    }

    if (msg.type === 'startgame') {
      const roomName = ws.room;
      if (!roomName) return;
      const room = rooms.get(roomName);
      if (!room || room.started || room.players.length < 2) return;

      room.started = true;
      room.seed = Math.floor(Math.random() * 1_000_000);
      
      // Store room settings from the host
      const settings = msg.settings || {};
      room.settings = {
        startLevel: Number(settings.startLevel) || 1,
        garbageMultiplier: Number(settings.garbageMultiplier) || 1,
        speedMultiplier: Number(settings.speedMultiplier) || 1
      };

      for (let i = 0; i < room.players.length; i++) {
        const opps = room.players.map((m, idx) => ({ slot: idx, name: m.name })).filter(o => o.slot !== i);
        send(room.players[i].ws, { type: 'start', seed: room.seed, you: i, opponents: opps, settings: room.settings });
      }
      const allPlayers = room.players.map((p, i) => ({ slot: i, name: p.name }));
      for (const s of room.spectators) {
        send(s.ws, { type: 'start_spectator', seed: room.seed, players: allPlayers, settings: room.settings });
      }
      return;
    }

    if (msg.type === 'chat') {
      const roomName = ws.room;
      if (!roomName) return;
      const text = String(msg.text || '').slice(0, 200);
      if (!text) return;
      broadcastAll(roomName, { type: 'chat', name: ws.name, text, isSpectator: ws.isSpectator || false }, ws);
      return;
    }

    if (!ws.room) return;
    const roomName = ws.room;
    const room = rooms.get(roomName);
    if (!room) return;

    if (msg.type === 'snapshot' || msg.type === 'attack' || msg.type === 'gameover') {
      const senderIdx = room.players.findIndex(m => m.ws === ws);
      if (senderIdx < 0) return;
      for (let i = 0; i < room.players.length; i++) {
        if (i !== senderIdx) {
          send(room.players[i].ws, { ...msg, player: senderIdx });
        }
      }
      for (const s of room.spectators) {
        send(s.ws, { ...msg, player: senderIdx });
      }
    }
  });

  ws.on('close', () => {
    // Clean up ranked queue
    const rIdx = rankedQueue.findIndex(q => q.ws === ws);
    if (rIdx >= 0) rankedQueue.splice(rIdx, 1);
    // Notify ranked opponent if in a match
    if (ws._rankedOpponent) {
      const opp = ws._rankedOpponent;
      opp._rankedOpponent = null;
      send(opp, { type: 'ranked_opponent_left' });
    }
    removeClient(ws);
  });
  ws.on('error', () => {
    const rIdx = rankedQueue.findIndex(q => q.ws === ws);
    if (rIdx >= 0) rankedQueue.splice(rIdx, 1);
    if (ws._rankedOpponent) {
      const opp = ws._rankedOpponent;
      opp._rankedOpponent = null;
      send(opp, { type: 'ranked_opponent_left' });
    }
    removeClient(ws);
  });
});

// Initialize DB (if configured) then start listening
(async () => {
  try {
    await initDB();
  } catch (e) {
    console.error('[DB] Failed to initialize database:', e.message);
    console.log('[DB] Falling back to local users.json');
    useDB = false;
  }
  server.listen(PORT, HOST, () => {
    console.log(`Sam Stackerz Web running at http://127.0.0.1:${PORT}`);
    console.log(`WebSocket endpoint: ws://127.0.0.1:${PORT}`);
  });
})();
