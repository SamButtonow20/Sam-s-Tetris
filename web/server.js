const fs = require('fs');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || process.argv[2] || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const rooms = new Map(); // room -> [{ws,name}]

function send(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function broadcastRoom(room, payload, exceptWs = null) {
  const members = rooms.get(room) || [];
  for (const m of members) {
    if (m.ws !== exceptWs) send(m.ws, payload);
  }
}

function removeClient(ws) {
  for (const [room, members] of rooms.entries()) {
    const idx = members.findIndex((m) => m.ws === ws);
    if (idx >= 0) {
      members.splice(idx, 1);
      broadcastRoom(room, { type: 'opponent_left' }, ws);
      if (members.length === 0) rooms.delete(room);
      break;
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
      const room = String(msg.room || 'default');
      const name = String(msg.name || 'Player');
      const members = rooms.get(room) || [];

      if (members.length >= 2) {
        send(ws, { type: 'error', message: 'Room full' });
        ws.close();
        return;
      }

      members.push({ ws, name });
      rooms.set(room, members);
      ws.room = room;
      ws.name = name;

      send(ws, { type: 'joined', room, slot: members.length });
      if (members.length === 1) {
        send(ws, { type: 'waiting' });
      } else if (members.length === 2) {
        const seed = Math.floor(Math.random() * 1_000_000);
        send(members[0].ws, { type: 'start', seed, you: 0, opponent: members[1].name });
        send(members[1].ws, { type: 'start', seed, you: 1, opponent: members[0].name });
      }
      return;
    }

    if (!ws.room) return;

    if (msg.type === 'snapshot' || msg.type === 'attack' || msg.type === 'gameover' || msg.type === 'ping') {
      broadcastRoom(ws.room, msg, ws);
    }
  });

  ws.on('close', () => removeClient(ws));
  ws.on('error', () => removeClient(ws));
});

server.listen(PORT, HOST, () => {
  console.log(`Sam Tetris Web running at http://127.0.0.1:${PORT}`);
  console.log(`WebSocket endpoint: ws://127.0.0.1:${PORT}`);
});
