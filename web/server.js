const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const rooms = new Map(); // room -> { players: [{ws,name}], spectators: [{ws,name}], started: false, seed: null }

// ==================== USER AUTH / PROFILES ====================
const USERS_FILE = path.join(ROOT, 'users.json');

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return {}; }
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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
      const users = loadUsers();
      const nameLower = name.toLowerCase();
      if (users[nameLower]) return sendJSON(res, 409, { error: 'Username already taken' });
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      const token = generateToken();
      users[nameLower] = {
        username: name,
        salt, hash, token,
        createdAt: Date.now(),
        profile: {
          coins: 0,
          ownedSkins: ['default'],
          equippedSkin: 'default',
          stats: { gamesPlayed: 0, totalScore: 0, bestScore: 0, totalLines: 0, bestLines: 0, bestCombo: 0, totalTetris: 0, totalTSpins: 0, totalPerfectClears: 0, totalTime: 0, piecesPlaced: 0, totalB2B: 0 },
          ranked: { elo: 1000, wins: 0, losses: 0, history: [] },
          achievements: {},
          keybinds: null
        }
      };
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, token, username: name, profile: users[nameLower].profile });
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    try {
      const { username, password } = await parseBody(req);
      if (!username || !password) return sendJSON(res, 400, { error: 'Username and password required' });
      const users = loadUsers();
      const nameLower = String(username).trim().toLowerCase();
      const user = users[nameLower];
      if (!user) return sendJSON(res, 401, { error: 'Invalid username or password' });
      const hash = hashPassword(password, user.salt);
      if (hash !== user.hash) return sendJSON(res, 401, { error: 'Invalid username or password' });
      // Rotate token
      user.token = generateToken();
      saveUsers(users);
      return sendJSON(res, 200, { ok: true, token: user.token, username: user.username, profile: user.profile });
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'POST' && req.url === '/api/profile') {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) return sendJSON(res, 401, { error: 'Not authenticated' });
      const token = auth.slice(7);
      const users = loadUsers();
      const userEntry = Object.values(users).find(u => u.token === token);
      if (!userEntry) return sendJSON(res, 401, { error: 'Invalid session' });
      const { profile } = await parseBody(req);
      if (profile) {
        // Merge profile fields (don't let client set arbitrary stuff)
        if (typeof profile.coins === 'number') userEntry.profile.coins = Math.max(0, profile.coins);
        if (Array.isArray(profile.ownedSkins)) userEntry.profile.ownedSkins = profile.ownedSkins;
        if (typeof profile.equippedSkin === 'string') userEntry.profile.equippedSkin = profile.equippedSkin;
        if (profile.stats && typeof profile.stats === 'object') userEntry.profile.stats = profile.stats;
        if (profile.ranked && typeof profile.ranked === 'object') userEntry.profile.ranked = profile.ranked;
        if (profile.achievements && typeof profile.achievements === 'object') userEntry.profile.achievements = profile.achievements;
        if (profile.keybinds) userEntry.profile.keybinds = profile.keybinds;
        saveUsers(users);
      }
      return sendJSON(res, 200, { ok: true, username: userEntry.username, profile: userEntry.profile });
    } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  }

  if (req.method === 'GET' && req.url === '/api/leaderboard') {
    const users = loadUsers();
    const board = Object.values(users)
      .filter(u => u.profile.stats.gamesPlayed > 0)
      .map(u => ({ name: u.username, score: u.profile.stats.bestScore, lines: u.profile.stats.bestLines, games: u.profile.stats.gamesPlayed, elo: u.profile.ranked.elo }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    return sendJSON(res, 200, { leaderboard: board });
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

  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
});

server.listen(PORT, HOST, () => {
  console.log(`Sam Tetris Web running at http://127.0.0.1:${PORT}`);
  console.log(`WebSocket endpoint: ws://127.0.0.1:${PORT}`);
});
