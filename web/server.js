const fs = require('fs');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const rooms = new Map(); // room -> { players: [{ws,name}], spectators: [{ws,name}], started: false, seed: null }

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

const server = http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
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
      'text/plain';
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
