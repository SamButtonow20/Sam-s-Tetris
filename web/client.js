const CELL = 14;
const COLS = 10;
const ROWS = 20;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;

const TETROMINOES = {
  I: ['....', '1111', '....', '....'],
  O: ['.22.', '.22.', '....', '....'],
  T: ['.333', '..3.', '....', '....'],
  S: ['..44', '.44.', '....', '....'],
  Z: ['.55.', '..55', '....', '....'],
  J: ['.6..', '.666', '....', '....'],
  L: ['...7', '.777', '....', '....']
};

const COLORS = {
  '.': '#0b0b16',
  '1': '#00ffff',
  '2': '#ffd650',
  '3': '#dc3cff',
  '4': '#00ffaa',
  '5': '#ff4678',
  '6': '#78aaff',
  '7': '#ffa03c',
  '8': '#868686'
};

class RNG {
  constructor(seed = Date.now() % 2147483647) {
    this.state = seed <= 0 ? 1 : seed;
  }
  next() {
    this.state = (this.state * 48271) % 2147483647;
    return this.state / 2147483647;
  }
}

class Particle {
  constructor(x, y, vx, vy, color, life = 800) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
  }

  update(dt) {
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;
    this.vy += 200 * dt / 1000;
    this.life -= dt;
  }

  isDead() {
    return this.life <= 0;
  }

  getOpacity() {
    return Math.max(0, this.life / this.maxLife);
  }

  draw(ctx) {
    const alpha = this.getOpacity();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

let particles = [];

function createLineParticles(rows, cols) {
  const colors = Object.values(COLORS).filter(c => c !== '#0b0b16');
  for (let r of rows) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * CELL + Math.random() * 10 - 5;
      const y = (r + 0.5) * CELL + Math.random() * 10 - 5;
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new Particle(x, y, vx, vy, color, 600 + Math.random() * 400));
    }
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(dt);
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles(ctx) {
  ctx.save();
  for (let p of particles) {
    const alpha = p.getOpacity();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function rotate(shape) {
  const out = [];
  for (let c = 0; c < 4; c++) {
    let row = '';
    for (let r = 3; r >= 0; r--) row += shape[r][c];
    out.push(row);
  }
  return out;
}

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
}

class Game {
  constructor(seed = null) {
    this.seed = seed ?? Math.floor(Math.random() * 1_000_000);
    this.rng = new RNG(this.seed);
    this.reset();
  }

  reset() {
    this.grid = createEmptyGrid();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = -1;
    this.backToBack = false;
    this.gameOver = false;
    this.lastAttack = 0;
    this.bag = [];
    this.next = this.makePiece(this.nextKind());
    this.current = this.makePiece(this.nextKind());
    this.spawn(this.current);
    this.fallMs = 0;
    this.lockDelayMs = 500;
    this.groundedMs = 0;
    this.softDrop = false;
    this.lastMoveWasRotate = false;
  }

  nextKind() {
    if (this.bag.length === 0) {
      this.bag = Object.keys(TETROMINOES);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng.next() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }

  makePiece(kind) {
    const rotations = [TETROMINOES[kind]];
    for (let i = 1; i < 4; i++) rotations.push(rotate(rotations[i - 1]));
    return { kind, rotation: 0, x: 3, y: 0, rotations };
  }

  spawn(piece) {
    piece.x = 3;
    piece.y = 0;
    piece.rotation = 0;
    this.current = piece;
    this.lastMoveWasRotate = false;
    this.groundedMs = 0;
    if (this.collide(this.current, 0, 0)) this.gameOver = true;
  }

  shape(piece, rot = piece.rotation) {
    return piece.rotations[(rot + 4) % 4];
  }

  collide(piece, dx, dy, rot = piece.rotation) {
    const s = this.shape(piece, rot);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = s[r][c];
        if (v === '.') continue;
        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && this.grid[ny][nx] !== '.') return true;
      }
    }
    return false;
  }

  move(dx, dy) {
    if (!this.collide(this.current, dx, dy)) {
      this.current.x += dx;
      this.current.y += dy;
      this.groundedMs = 0;
      this.lastMoveWasRotate = false;
      return true;
    }
    return false;
  }

  rotateCurrent() {
    const newRot = (this.current.rotation + 1) % 4;
    const kicks = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]];
    for (const [dx, dy] of kicks) {
      if (!this.collide(this.current, dx, dy, newRot)) {
        this.current.x += dx;
        this.current.y += dy;
        this.current.rotation = newRot;
        this.lastMoveWasRotate = true;
        this.groundedMs = 0;
        return true;
      }
    }
    return false;
  }

  hardDrop() {
    while (!this.collide(this.current, 0, 1)) this.current.y += 1;
    this.groundedMs = this.lockDelayMs;
  }

  detectTSpin() {
    if (this.current.kind !== 'T' || !this.lastMoveWasRotate) return false;
    const cx = this.current.x + 2;
    const cy = this.current.y + 1;
    const corners = [[cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy + 1]];
    let blocked = 0;
    for (const [x, y] of corners) {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) blocked++;
      else if (this.grid[y][x] !== '.') blocked++;
    }
    return blocked >= 3;
  }

  lockPiece() {
    this.lastAttack = 0;
    const s = this.shape(this.current);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = s[r][c];
        if (v === '.') continue;
        const x = this.current.x + c;
        const y = this.current.y + r;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) this.grid[y][x] = v;
      }
    }

    const tSpin = this.detectTSpin();
    const clearedRows = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every((x) => x !== '.')) clearedRows.push(r);
    }
    const cleared = clearedRows.length;

    if (cleared > 0) {
      this.combo += 1;
      createLineParticles(clearedRows, COLS);
      this.grid = this.grid.filter((_, idx) => !clearedRows.includes(idx));
      while (this.grid.length < ROWS) this.grid.unshift(Array(COLS).fill('.'));
    } else {
      this.combo = -1;
    }

    let base = 0;
    let attack = 0;
    if (tSpin) {
      base = [0, 800, 1200, 1600][cleared] || 0;
      attack = [0, 2, 4, 6][cleared] || 0;
    } else {
      base = [0, 100, 300, 500, 800][cleared] || 0;
      attack = [0, 0, 1, 2, 4][cleared] || 0;
    }

    const b2bEligible = (tSpin && cleared > 0) || cleared === 4;
    if (b2bEligible) {
      if (this.backToBack) {
        base = Math.floor(base * 1.5);
        attack += 1;
      }
      this.backToBack = true;
    } else if (cleared > 0) {
      this.backToBack = false;
    }

    const comboBonus = Math.max(0, this.combo) * 50;
    attack += Math.max(0, this.combo - 1);

    const perfectClear = cleared > 0 && this.grid.every((row) => row.every((x) => x === '.'));
    if (perfectClear) {
      base += 2000;
      attack += 6;
    }

    this.lines += cleared;
    this.level = 1 + Math.floor(this.lines / 10);
    this.score += (base + comboBonus) * this.level;
    this.lastAttack = attack;

    this.spawn(this.next);
    this.next = this.makePiece(this.nextKind());
  }

  addGarbage(n) {
    for (let i = 0; i < n; i++) {
      const hole = Math.floor(this.rng.next() * COLS);
      const row = Array(COLS).fill('8');
      row[hole] = '.';
      this.grid.shift();
      this.grid.push(row);
    }
  }

  update(dtMs) {
    if (this.gameOver) return;
    this.lastAttack = 0;

    const speed = this.softDrop ? 100 : Math.max(80, 700 - (this.level - 1) * 45);
    this.fallMs += dtMs;

    while (this.fallMs >= speed) {
      this.fallMs -= speed;
      if (!this.collide(this.current, 0, 1)) {
        this.current.y += 1;
        this.groundedMs = 0;
      } else {
        this.groundedMs += speed;
        if (this.groundedMs >= this.lockDelayMs) {
          this.lockPiece();
          break;
        }
      }
    }
  }

  snapshot() {
    return {
      grid: this.grid.map((r) => r.join('')),
      score: this.score,
      lines: this.lines,
      game_over: this.gameOver,
      piece: this.gameOver ? null : {
        kind: this.current.kind,
        rotation: this.current.rotation,
        x: this.current.x,
        y: this.current.y
      },
      next: this.gameOver ? null : {
        kind: this.next.kind,
        rotation: this.next.rotation
      }
    };
  }
}

const boardCanvas = document.getElementById('board');
const board2Canvas = document.getElementById('board2');
const board3Canvas = document.getElementById('board3');
const board4Canvas = document.getElementById('board4');
const nextCanvas = document.getElementById('nextBoard');
const next2Canvas = document.getElementById('nextBoard2');
const next3Canvas = document.getElementById('nextBoard3');
const next4Canvas = document.getElementById('nextBoard4');
const bctx = boardCanvas.getContext('2d');
const octx2 = board2Canvas.getContext('2d');
const octx3 = board3Canvas.getContext('2d');
const octx4 = board4Canvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');
const next2Ctx = next2Canvas.getContext('2d');
const next3Ctx = next3Canvas.getContext('2d');
const next4Ctx = next4Canvas.getContext('2d');
const octxes = [octx2, octx3, octx4];
const nextCtxes = [nextCtx, next2Ctx, next3Ctx, next4Ctx];

const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const modeEl = document.getElementById('mode');
const statusEl = document.getElementById('status');

const oppScoreEls = [document.getElementById('score2'), document.getElementById('score3'), document.getElementById('score4')];
const oppLinesEls = [document.getElementById('lines2'), document.getElementById('lines3'), document.getElementById('lines4')];
const oppStatusEls = [document.getElementById('status2'), document.getElementById('status3'), document.getElementById('status4')];
const oppNameEls = [document.getElementById('player2Name'), document.getElementById('player3Name'), document.getElementById('player4Name')];

const gameArea = document.getElementById('gameArea');
const btnClassic = document.getElementById('btnClassic');
const btnOnline = document.getElementById('btnOnline');
const btnConnect = document.getElementById('btnConnect');
const onlineForm = document.getElementById('onlineForm');
const roomInput = document.getElementById('room');
const nameInput = document.getElementById('name');

const formWrapper = onlineForm.querySelector('.formWrapper');
const connectingState = document.getElementById('connectingState');
const waitingState = document.getElementById('waitingState');
const sharedRoom = document.getElementById('sharedRoom');

let lastOppScores = [-1, -1, -1];
let lastOppLines = [-1, -1, -1];

// Auto-detect WebSocket URL based on current page location
function getWebSocketURL() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}`;
}

const blankGrid = createEmptyGrid();

function buildGridOverlay() {
  const layer = document.createElement('canvas');
  layer.width = BOARD_W;
  layer.height = BOARD_H;
  const ctx = layer.getContext('2d');
  ctx.fillStyle = '#0b0b16';
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  ctx.strokeStyle = '#1f1f35';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
    }
  }
  return layer;
}

const gridOverlay = buildGridOverlay();

let mode = 'classic';
let game = new Game();
let ws = null;
let onlineReady = false;
let playerSlot = -1;
let opponents = [{grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, name: 'Player 2', piece: null, next: null}, {grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, name: 'Player 3', piece: null, next: null}, {grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, name: 'Player 4', piece: null, next: null}];

// Function to update player count and show/hide boards
function updatePlayerCount(totalPlayers) {
  // Remove all player count classes
  gameArea.classList.remove('players-1', 'players-2', 'players-3', 'players-4');
  
  // Show/hide boards based on player count
  const boards = [
    document.getElementById('player1Board'),
    document.getElementById('player2Board'),
    document.getElementById('player3Board'),
    document.getElementById('player4Board')
  ];
  
  for (let i = 0; i < boards.length; i++) {
    if (i < totalPlayers) {
      boards[i].style.display = 'flex';
    } else {
      boards[i].style.display = 'none';
    }
  }
  
  // Add the appropriate player count class
  gameArea.classList.add(`players-${totalPlayers}`);
}
let snapshotMs = 0;
let sentGameOver = false;

let lastScore = -1;
let lastLines = -1;
let lastLevel = -1;

function setStatus(text) { statusEl.textContent = text; }

function startClassic() {
  mode = 'classic';
  modeEl.textContent = 'Mode: Classic';
  game = new Game();
  sentGameOver = false;
  onlineReady = false;
  if (ws) { ws.close(); ws = null; }
  updatePlayerCount(4); // Show all 4 boards side by side
  setStatus('Classic mode started');
}

function resetOpponents() {
  for (let i = 0; i < 3; i++) {
    opponents[i] = {grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, name: 'Player ' + (i + 2), piece: null, next: null};
    oppScoreEls[i].textContent = '0';
    oppLinesEls[i].textContent = '0';
    oppStatusEls[i].textContent = 'Ready';
    oppNameEls[i].textContent = 'Player ' + (i + 2);
    lastOppScores[i] = -1;
    lastOppLines[i] = -1;
  }
}

function startOnline() {
  mode = 'online';
  resetOpponents();
  modeEl.textContent = 'Mode: Online';
  game = new Game();
  sentGameOver = false;
  onlineReady = false;
  playerSlot = -1;
}

function send(payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify(payload));
}

function connectOnline() {
  startOnline();
  const url = getWebSocketURL();
  const room = roomInput.value.trim() || 'default';
  const name = nameInput.value.trim() || 'Player';

  // Show connecting state
  btnConnect.disabled = true;
  btnConnect.classList.add('loading');
  formWrapper.classList.add('hidden');
  connectingState.classList.add('active');

  try {
    ws = new WebSocket(url);
    console.log(`Connecting to ${url}`);
  } catch (err) {
    setStatus(`Failed to create WebSocket: ${err.message}`);
    console.error(err);
    btnConnect.disabled = false;
    btnConnect.classList.remove('loading');
    formWrapper.classList.remove('hidden');
    connectingState.classList.remove('active');
    return;
  }

  ws.onopen = () => {
    console.log('WebSocket connected, joining room:', room);
    send({ type: 'join', room, name });
  };

  ws.onmessage = (evt) => {
    let msg;
    try { msg = JSON.parse(evt.data); } catch { return; }

    if (msg.type === 'waiting') {
      onlineReady = false;
      // Show waiting state
      connectingState.classList.remove('active');
      waitingState.classList.add('active');
      sharedRoom.textContent = room;
      setStatus('Waiting for opponent...');
    } else if (msg.type === 'start') {
      const seed = Number(msg.seed || Math.floor(Math.random() * 1_000_000));
      game = new Game(seed);
      sentGameOver = false;
      onlineReady = true;
      playerSlot = Number(msg.you || 0);
      
      // Update opponent names and initialize slots
      if (msg.opponents && Array.isArray(msg.opponents)) {
        for (let i = 0; i < msg.opponents.length; i++) {
          opponents[i].name = msg.opponents[i].name || `Player ${i + 2}`;
          oppNameEls[i].textContent = opponents[i].name;
        }
      }
      
      const oppCount = msg.opponents ? msg.opponents.length : 1;
      const totalPlayers = oppCount + 1; // +1 for you
      const oppNames = msg.opponents ? msg.opponents.map(o => o.name).join(', ') : 'opponents';
      
      // Update player display based on count
      updatePlayerCount(totalPlayers);
      
      // Hide form states
      waitingState.classList.remove('active');
      connectingState.classList.remove('active');
      formWrapper.classList.remove('hidden');
      setStatus(`Match started (${oppCount + 1} players): ${oppNames}`);
    } else if (msg.type === 'snapshot') {
      const playerIdx = Number(msg.player || 0);
      if (playerIdx >= 1 && playerIdx <= 3 && playerIdx !== playerSlot) {
        const oppIdx = playerIdx - 1;
        if (Array.isArray(msg.grid) && msg.grid.length === ROWS) {
          const parsed = [];
          let ok = true;
          for (const row of msg.grid) {
            if (typeof row !== 'string' || row.length !== COLS) { ok = false; break; }
            parsed.push(row.split(''));
          }
          if (ok) opponents[oppIdx].grid = parsed;
        }
        opponents[oppIdx].score = Number(msg.score || opponents[oppIdx].score);
        opponents[oppIdx].lines = Number(msg.lines || opponents[oppIdx].lines);
        opponents[oppIdx].game_over = Boolean(msg.game_over || false);
        if (msg.piece) opponents[oppIdx].piece = msg.piece;
        if (msg.next) opponents[oppIdx].next = msg.next;
      }
    } else if (msg.type === 'attack') {
      const amt = Number(msg.amount || 0);
      if (amt > 0) game.addGarbage(amt);
    } else if (msg.type === 'gameover') {
      const playerIdx = Number(msg.player || 0);
      if (playerIdx >= 1 && playerIdx <= 3 && playerIdx !== playerSlot) {
        const oppIdx = playerIdx - 1;
        opponents[oppIdx].game_over = true;
        oppStatusEls[oppIdx].textContent = 'TOPOUT';
      }
    } else if (msg.type === 'error') {
      setStatus(`Server error: ${msg.message || 'unknown'}`);
      btnConnect.disabled = false;
      btnConnect.classList.remove('loading');
      formWrapper.classList.remove('hidden');
      connectingState.classList.remove('active');
      waitingState.classList.remove('active');
    } else if (msg.type === 'opponent_left') {
      const playerIdx = Number(msg.player || 0);
      if (playerIdx >= 1 && playerIdx <= 3 && playerIdx !== playerSlot) {
        const oppIdx = playerIdx - 1;
        opponents[oppIdx].name = 'Player ' + (oppIdx + 2) + ' (left)';
        oppNameEls[oppIdx].textContent = opponents[oppIdx].name;
      }
      setStatus('A player has left');
    }
  };

  ws.onclose = () => {
    onlineReady = false;
    setStatus('Disconnected from server');
    btnConnect.disabled = false;
    btnConnect.classList.remove('loading');
    formWrapper.classList.remove('hidden');
    connectingState.classList.remove('active');
    waitingState.classList.remove('active');
  };

  ws.onerror = () => {
    onlineReady = false;
    setStatus('WebSocket error');
    btnConnect.disabled = false;
    btnConnect.classList.remove('loading');
    formWrapper.classList.remove('hidden');
    connectingState.classList.remove('active');
    waitingState.classList.remove('active');
  };
}

function drawCell(ctx, x, y, v) {
  ctx.fillStyle = COLORS[v] || '#fff';
  ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
}

function drawGrid(ctx, grid) {
  ctx.drawImage(gridOverlay, 0, 0);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c];
      if (v !== '.') drawCell(ctx, c, r, v);
    }
  }
}

function drawPiece(ctx, piece) {
  const shape = piece.rotations[piece.rotation];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = shape[r][c];
      if (v === '.') continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (y >= 0) drawCell(ctx, x, y, v);
    }
  }
}

function drawOpponentPiece(ctx, oppPiece) {
  if (!oppPiece) return;
  const kind = oppPiece.kind;
  const rotation = oppPiece.rotation;
  const x = oppPiece.x;
  const y = oppPiece.y;
  
  const shape = TETROMINOES[kind];
  if (!shape) return;
  
  let rotShape = shape;
  for (let i = 0; i < rotation; i++) rotShape = rotate(rotShape);
  
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = rotShape[r][c];
      if (v === '.') continue;
      const col = x + c;
      const row = y + r;
      if (row >= 0) drawCell(ctx, col, row, v);
    }
  }
}

function drawNextPiece(ctx, piece, canvasW, canvasH) {
  if (!piece) return;
  
  let shape;
  let rotation = 0;
  
  // Handle different piece formats
  if (piece.rotations) {
    // Full piece object from game
    shape = piece.rotations[piece.rotation];
    rotation = piece.rotation;
  } else if (piece.kind) {
    // Simple piece info from opponent (just kind and rotation)
    const kind = piece.kind;
    const rot = piece.rotation || 0;
    if (!TETROMINOES[kind]) return;
    
    let rotShape = TETROMINOES[kind];
    for (let i = 0; i < rot; i++) rotShape = rotate(rotShape);
    shape = rotShape;
    rotation = rot;
  } else {
    return;
  }
  
  if (!shape) return;
  
  // Clear the canvas
  ctx.fillStyle = '#0b0b16';
  ctx.fillRect(0, 0, canvasW, canvasH);
  
  // Draw grid
  const smallCell = canvasW / 4;
  ctx.strokeStyle = '#1f1f35';
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * smallCell, 0);
    ctx.lineTo(i * smallCell, canvasH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * smallCell);
    ctx.lineTo(canvasW, i * smallCell);
    ctx.stroke();
  }
  
  // Draw piece centered
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const v = shape[r][c];
      if (v !== '.') {
        ctx.fillStyle = COLORS[v] || '#fff';
        const x = c * smallCell + 1;
        const y = r * smallCell + 1;
        ctx.fillRect(x, y, smallCell - 2, smallCell - 2);
      }
    }
  }
}

let lastTs = performance.now();
function loop(ts) {
  const dt = Math.min(50, ts - lastTs);
  lastTs = ts;

  if (!game.gameOver && (mode === 'classic' || (mode === 'online' && onlineReady))) {
    game.update(dt);
    updateParticles(dt);

    if (mode === 'online') {
      if (game.lastAttack > 0) send({ type: 'attack', amount: game.lastAttack });
      snapshotMs += dt;
      if (snapshotMs >= 200) {
        snapshotMs = 0;
        send({ type: 'snapshot', ...game.snapshot() });
      }
      if (game.gameOver && !sentGameOver) {
        sentGameOver = true;
        send({ type: 'gameover' });
      }
    }
  } else {
    updateParticles(dt);
  }

  drawGrid(bctx, game.grid);
  if (!game.gameOver) drawPiece(bctx, game.current);
  drawParticles(bctx);
  
  // Draw next piece for player
  drawNextPiece(nextCtx, game.next, nextCanvas.width, nextCanvas.height);

  if (mode === 'online') {
    for (let i = 0; i < 3; i++) {
      drawGrid(octxes[i], opponents[i].grid);
      if (opponents[i].piece) drawOpponentPiece(octxes[i], opponents[i].piece);
      // Draw opponent next piece previews
      if (opponents[i].next && i < nextCtxes.length - 1) {
        const nextPreviewSize = (i === 0) ? nextCanvas.width : next2Canvas.width;
        drawNextPiece(nextCtxes[i + 1], opponents[i].next, nextPreviewSize, nextPreviewSize);
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      drawGrid(octxes[i], blankGrid);
    }
  }

  if (game.score !== lastScore) {
    lastScore = game.score;
    scoreEl.textContent = `Score: ${game.score}`;
  }
  if (game.lines !== lastLines) {
    lastLines = game.lines;
    linesEl.textContent = `Lines: ${game.lines}`;
  }
  if (game.level !== lastLevel) {
    lastLevel = game.level;
    levelEl.textContent = `Level: ${game.level}`;
  }

  if (game.gameOver) {
    setStatus(mode === 'online' ? 'Game over (you topped out)' : 'Game over');
  }

  if (mode === 'online') {
    for (let i = 0; i < 3; i++) {
      if (opponents[i].score !== lastOppScores[i]) {
        lastOppScores[i] = opponents[i].score;
        oppScoreEls[i].textContent = opponents[i].score;
      }
      if (opponents[i].lines !== lastOppLines[i]) {
        lastOppLines[i] = opponents[i].lines;
        oppLinesEls[i].textContent = opponents[i].lines;
      }
      oppStatusEls[i].textContent = opponents[i].game_over ? 'Topped Out' : 'Playing';
    }
  }

  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
  if (game.gameOver) return;
  if (mode === 'online' && !onlineReady) return;

  if (e.key === 'ArrowLeft') game.move(-1, 0);
  else if (e.key === 'ArrowRight') game.move(1, 0);
  else if (e.key === 'ArrowUp') game.rotateCurrent();
  else if (e.key === ' ') game.hardDrop();
  else if (e.key === 'ArrowDown') game.softDrop = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowDown') game.softDrop = false;
});

btnClassic.addEventListener('click', startClassic);
btnOnline.addEventListener('click', () => {
  onlineForm.classList.toggle('active');
});
btnConnect.addEventListener('click', connectOnline);

startClassic();
requestAnimationFrame(loop);
