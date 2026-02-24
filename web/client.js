const CELL = 20;
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

const THEMES = {
  neon: {
    name: 'Neon', icon: '💜',
    bg: '#0b0b16', grid: '#1f1f35',
    colors: { '.': '#0b0b16', '1': '#00ffff', '2': '#ffd650', '3': '#dc3cff', '4': '#00ffaa', '5': '#ff4678', '6': '#78aaff', '7': '#ffa03c', '8': '#868686' },
    cssVars: { '--color-bg-deep': '#0a0e27', '--color-bg-dark': '#0f1533', '--color-bg-card': '#151d3a', '--color-accent-cyan': '#00d9ff', '--color-accent-pink': '#ff006e', '--color-accent-purple': '#8338ec', '--color-accent-green': '#06ffa5', '--color-border': '#2a3566' }
  },
  retro: {
    name: 'Retro', icon: '🕹️',
    bg: '#000000', grid: '#1a1a1a',
    colors: { '.': '#000000', '1': '#00b8d4', '2': '#e6c200', '3': '#9c27b0', '4': '#4caf50', '5': '#f44336', '6': '#2196f3', '7': '#ff9800', '8': '#757575' },
    cssVars: { '--color-bg-deep': '#0d0d0d', '--color-bg-dark': '#1a1a1a', '--color-bg-card': '#262626', '--color-accent-cyan': '#00b8d4', '--color-accent-pink': '#f44336', '--color-accent-purple': '#9c27b0', '--color-accent-green': '#4caf50', '--color-border': '#404040' }
  },
  pastel: {
    name: 'Pastel', icon: '🌸',
    bg: '#1a1525', grid: '#2a2540',
    colors: { '.': '#1a1525', '1': '#87ceeb', '2': '#ffe4b5', '3': '#dda0dd', '4': '#98fb98', '5': '#ffb6c1', '6': '#b0c4de', '7': '#ffdab9', '8': '#a9a9a9' },
    cssVars: { '--color-bg-deep': '#1a1525', '--color-bg-dark': '#221d35', '--color-bg-card': '#2a2545', '--color-accent-cyan': '#87ceeb', '--color-accent-pink': '#ffb6c1', '--color-accent-purple': '#dda0dd', '--color-accent-green': '#98fb98', '--color-border': '#3d3660' }
  },
  monochrome: {
    name: 'Mono', icon: '⬜',
    bg: '#0a0a0a', grid: '#1a1a1a',
    colors: { '.': '#0a0a0a', '1': '#ffffff', '2': '#e0e0e0', '3': '#c0c0c0', '4': '#a0a0a0', '5': '#808080', '6': '#d0d0d0', '7': '#b0b0b0', '8': '#505050' },
    cssVars: { '--color-bg-deep': '#0a0a0a', '--color-bg-dark': '#141414', '--color-bg-card': '#1e1e1e', '--color-accent-cyan': '#ffffff', '--color-accent-pink': '#c0c0c0', '--color-accent-purple': '#a0a0a0', '--color-accent-green': '#e0e0e0', '--color-border': '#333333' }
  },
  ocean: {
    name: 'Ocean', icon: '🌊',
    bg: '#0a1628', grid: '#152238',
    colors: { '.': '#0a1628', '1': '#00e5ff', '2': '#ffd54f', '3': '#7c4dff', '4': '#64ffda', '5': '#ff5252', '6': '#448aff', '7': '#ffab40', '8': '#607d8b' },
    cssVars: { '--color-bg-deep': '#0a1628', '--color-bg-dark': '#0d1f3c', '--color-bg-card': '#132840', '--color-accent-cyan': '#00e5ff', '--color-accent-pink': '#ff5252', '--color-accent-purple': '#7c4dff', '--color-accent-green': '#64ffda', '--color-border': '#1e3a5f' }
  }
};

let currentThemeName = localStorage.getItem('tetrisTheme') || 'neon';
let COLORS = { ...THEMES[currentThemeName].colors };

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
    this.backToBackCount = 0;
    this.gameOver = false;
    this.lastAttack = 0;
    this.bag = [];
    this.pieceStats = { I: 0, O: 0, T: 0, S: 0, Z: 0, J: 0, L: 0 };
    this.next = this.makePiece(this.nextKind());
    this.current = this.makePiece(this.nextKind());
    this.spawn(this.current);
    this.fallMs = 0;
    this.lockDelayMs = 500;
    this.groundedMs = 0;
    this.softDrop = false;
    this.lastMoveWasRotate = false;
    this.elapsedMs = 0; // Track total game time for difficulty progression
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
    if (this.pieceStats[piece.kind] !== undefined) this.pieceStats[piece.kind]++;
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
        this.backToBackCount++;
      }
      this.backToBack = true;
    } else if (cleared > 0) {
      this.backToBack = false;
      this.backToBackCount = 0;
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
    
    // Track elapsed time for progressive difficulty
    this.elapsedMs += dtMs;
    
    // Speed calculation with both level and time-based progression
    // Base speed from level + additional difficulty from elapsed time
    // Every 60 seconds adds difficulty equivalent to ~1 level
    const timeDifficulty = Math.floor(this.elapsedMs / 60000); // Difficulty tier every minute
    const totalLevel = this.level + timeDifficulty;
    
    const speed = this.softDrop ? 200 : Math.max(80, 700 - (totalLevel - 1) * 45);
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

  getElapsedTimeFormatted() {
    const totalSeconds = Math.floor(this.elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  getTimeBonus() {
    return Math.floor(this.elapsedMs / 60000);
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
const timeBadgeEl = document.getElementById('timeBadge');
const modeEl = document.getElementById('mode');
const statusEl = document.getElementById('status');

const oppScoreEls = [document.getElementById('score2'), document.getElementById('score3'), document.getElementById('score4')];
const oppLinesEls = [document.getElementById('lines2'), document.getElementById('lines3'), document.getElementById('lines4')];
const oppStatusEls = [document.getElementById('status2'), document.getElementById('status3'), document.getElementById('status4')];
const oppNameEls = [document.getElementById('player2Name'), document.getElementById('player3Name'), document.getElementById('player4Name')];

const gameArea = document.getElementById('gameArea');
const gameContainer = document.querySelector('.gameContainer');
const menu = document.getElementById('menu');
const btnConnect = document.getElementById('btnConnect');
const onlineForm = document.getElementById('onlineForm');
const roomInput = document.getElementById('room');
const nameInput = document.getElementById('name');

const formWrapper = onlineForm.querySelector('.formWrapper');
const connectingState = document.getElementById('connectingState');
const waitingState = document.getElementById('waitingState');
const lobbyState = document.getElementById('lobbyState');
const sharedRoom = document.getElementById('sharedRoom');
const lobbyRoom = document.getElementById('lobbyRoom');
const playersList = document.getElementById('playersList');
const btnStartGame = document.getElementById('btnStartGame');
const btnBackFromOnline = document.getElementById('btnBackFromOnline');
const btnLeaveLobby = document.getElementById('btnLeaveLobby');
const waitingForPlayers = document.getElementById('waitingForPlayers');

const leaderboardPage = document.getElementById('leaderboardPage');
const btnBackFromLeaderboard = document.getElementById('btnBackFromLeaderboard');
const btnClearLeaderboard = document.getElementById('btnClearLeaderboard');
const leaderboardEntries = document.getElementById('leaderboardEntries');

const welcomePage = document.getElementById('welcomePage');
const cardClassic = document.getElementById('cardClassic');
const cardOnline = document.getElementById('cardOnline');
const cardLeaderboard = document.getElementById('cardLeaderboard');
const pauseMenu = document.getElementById('pauseMenu');
const btnResume = document.getElementById('btnResume');
const btnBackToMenu = document.getElementById('btnBackToMenu');
const btnLeaderboardPause = document.getElementById('btnLeaderboardPause');

const gameOverMenu = document.getElementById('gameOverMenu');
const finalScore = document.getElementById('finalScore');
const finalLines = document.getElementById('finalLines');
const finalTime = document.getElementById('finalTime');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const btnGameOverBackToMenu = document.getElementById('btnGameOverBackToMenu');
const btnLeaderboardGameOver = document.getElementById('btnLeaderboardGameOver');

// Piece stats elements
const pieceStatsPanel = document.getElementById('pieceStatsPanel');
const statEls = { I: document.getElementById('statI'), O: document.getElementById('statO'), T: document.getElementById('statT'), S: document.getElementById('statS'), Z: document.getElementById('statZ'), J: document.getElementById('statJ'), L: document.getElementById('statL') };
const pieceColorMap = { I: '1', O: '2', T: '3', S: '4', Z: '5', J: '6', L: '7' };

// B2B indicator
const b2bIndicator = document.getElementById('b2bIndicator');

// Chat elements
const lobbyChatMessages = document.getElementById('lobbyChatMessages');
const lobbyChatInput = document.getElementById('lobbyChatInput');
const lobbyChatSend = document.getElementById('lobbyChatSend');
const gameChatBox = document.getElementById('gameChatBox');
const gameChatMessages = document.getElementById('gameChatMessages');
const gameChatInput = document.getElementById('gameChatInput');
const gameChatSend = document.getElementById('gameChatSend');
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');

// Spectator elements
const spectatorCheck = document.getElementById('spectatorCheck');
const spectatorBanner = document.getElementById('spectatorBanner');

// Theme selector
const themeOptions = document.getElementById('themeOptions');

let lastOppScores = [-1, -1, -1];
let lastOppLines = [-1, -1, -1];

// Chat state
let chatMessages = [];
let chatOpen = false;

// Spectator state
let isSpectator = false;
let spectatorData = [null, null, null, null];

// Auto-detect WebSocket URL based on current page location
function getWebSocketURL() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}`;
}

const blankGrid = createEmptyGrid();

function buildGridOverlay() {
  const theme = THEMES[currentThemeName];
  const layer = document.createElement('canvas');
  layer.width = BOARD_W;
  layer.height = BOARD_H;
  const ctx = layer.getContext('2d');
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  ctx.strokeStyle = theme.grid;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
    }
  }
  return layer;
}

let gridOverlay = buildGridOverlay();

function applyTheme(name) {
  if (!THEMES[name]) return;
  currentThemeName = name;
  const theme = THEMES[name];
  COLORS = { ...theme.colors };
  localStorage.setItem('tetrisTheme', name);

  // Update CSS variables
  const root = document.documentElement;
  for (const [prop, val] of Object.entries(theme.cssVars)) {
    root.style.setProperty(prop, val);
  }

  // Rebuild grid overlay
  gridOverlay = buildGridOverlay();

  // Update theme buttons
  document.querySelectorAll('.themeBtn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });

  // Update piece stats colors
  updatePieceStatsColors();
}

function updatePieceStatsColors() {
  for (const [kind, colorKey] of Object.entries(pieceColorMap)) {
    const mini = document.getElementById(`mini${kind}`);
    if (mini) mini.style.backgroundColor = COLORS[colorKey];
  }
}

function updatePieceStatsDisplay() {
  if (!game) return;
  for (const [kind, el] of Object.entries(statEls)) {
    if (el) el.textContent = game.pieceStats[kind] || 0;
  }
}

function updateB2BIndicator() {
  if (!b2bIndicator) return;
  if (game && game.backToBack && !game.gameOver) {
    b2bIndicator.classList.add('active');
    b2bIndicator.textContent = game.backToBackCount > 0 ? `B2B x${game.backToBackCount}` : 'B2B';
  } else {
    b2bIndicator.classList.remove('active');
  }
}

// Chat functions
function addChatMessage(name, text, isSpec, target) {
  const el = target === 'lobby' ? lobbyChatMessages : gameChatMessages;
  if (!el) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chatMsg' + (isSpec ? ' spectator' : '');
  const nameSpan = document.createElement('span');
  nameSpan.className = 'chatName';
  nameSpan.textContent = (isSpec ? '👁 ' : '') + name + ': ';
  const textSpan = document.createElement('span');
  textSpan.className = 'chatText';
  textSpan.textContent = text;
  msgDiv.appendChild(nameSpan);
  msgDiv.appendChild(textSpan);
  el.appendChild(msgDiv);
  el.scrollTop = el.scrollHeight;
}

function sendChat(inputEl) {
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text || !ws) return;
  send({ type: 'chat', text });
  const myName = nameInput.value.trim() || 'You';
  addChatMessage(myName, text, isSpectator, gameChatMessages && gameChatBox && gameChatBox.style.display !== 'none' ? 'game' : 'lobby');
  inputEl.value = '';
}

function toggleGameChat() {
  chatOpen = !chatOpen;
  if (chatPanel) chatPanel.classList.toggle('open', chatOpen);
}

let mode = 'classic';
let isPaused = false;
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
let shownGameOver = false;

let lastScore = -1;
let lastLines = -1;
let lastLevel = -1;

function setStatus(text) { statusEl.textContent = text; }

function togglePause() {
  if (mode !== 'classic' && mode !== 'online') return;
  isPaused = !isPaused;
  if (isPaused) {
    pauseMenu.classList.add('active');
    setStatus('Game Paused');
  } else {
    pauseMenu.classList.remove('active');
    setStatus('Resumed');
  }
}

function resumeGame() {
  isPaused = false;
  pauseMenu.classList.remove('active');
  setStatus('Game Resumed');
}

function backToMenuFromGame() {
  isPaused = false;
  pauseMenu.classList.remove('active');
  if (ws) { ws.close(); ws = null; }
  mode = 'classic';
  isSpectator = false;
  game.gameOver = true;
  welcomePage.classList.add('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  menu.classList.remove('active');
  onlineForm.classList.remove('active');
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  setStatus('Ready');
}

function showLeaderboardFromPause() {
  pauseMenu.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.add('active');
  displayLeaderboard();
}

function showGameOver() {
  gameOverMenu.classList.add('active');
  finalScore.textContent = game.score;
  finalLines.textContent = game.lines;
  finalTime.textContent = game.getElapsedTimeFormatted();
  setStatus('Game Over');
}

function hideGameOver() {
  gameOverMenu.classList.remove('active');
}

function playAgain() {
  hideGameOver();
  if (mode === 'classic') {
    startClassic();
  } else if (mode === 'online') {
    startOnline();
  }
}

function gameOverBackToMenu() {
  hideGameOver();
  if (ws) { ws.close(); ws = null; }
  mode = 'classic';
  isSpectator = false;
  game.gameOver = true;
  welcomePage.classList.add('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  menu.classList.remove('active');
  onlineForm.classList.remove('active');
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  setStatus('Ready');
}

function showLeaderboardFromGameOver() {
  hideGameOver();
  gameContainer.style.display = 'none';
  leaderboardPage.classList.add('active');
  displayLeaderboard();
}

function setStatus(text) { statusEl.textContent = text; }

function startClassic() {
  mode = 'classic';
  isPaused = false;
  shownGameOver = false;
  isSpectator = false;
  modeEl.textContent = 'Mode: Classic';
  game = new Game();
  sentGameOver = false;
  onlineReady = false;
  if (ws) { ws.close(); ws = null; }
  updatePlayerCount(1); // Solo mode - show only player 1 board
  menu.classList.remove('active');
  leaderboardPage.classList.remove('active');
  welcomePage.classList.remove('active');
  gameOverMenu.classList.remove('active');
  gameContainer.style.display = 'flex';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (pieceStatsPanel) pieceStatsPanel.style.display = '';
  // Reset player 1 board title
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  lastTs = performance.now();
  requestAnimationFrame(loop);
  setStatus('Classic mode started');
}

function checkWinner() {
  if (mode !== 'online') return;
  
  // Count how many opponents are still playing
  let playersStillPlaying = game.gameOver ? 0 : 1; // 1 if you're still playing
  let topOutCount = 0;
  
  for (let i = 0; i < 3; i++) {
    if (opponents[i].game_over) {
      topOutCount++;
    } else {
      playersStillPlaying++;
    }
  }
  
  // If you're the last one playing, you win!
  if (!game.gameOver && playersStillPlaying === 1) {
    setStatus('🏆 YOU WIN! All opponents topped out!');
    return true;
  }
  
  // If you topped out but at least one opponent hasn't yet, wait for them
  if (game.gameOver && playersStillPlaying > 0) {
    return false;
  }
  
  // If everyone has topped out (including you), there's no winner
  if (game.gameOver && playersStillPlaying === 0) {
    setStatus('Game Over - Draw (everyone topped out)');
    return false;
  }
  
  return false;
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
  shownGameOver = false;
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
    const spectate = spectatorCheck && spectatorCheck.checked;
    isSpectator = spectate;
    send({ type: 'join', room, name, spectator: spectate });
  };

  ws.onmessage = (evt) => {
    let msg;
    try { msg = JSON.parse(evt.data); } catch { return; }

    if (msg.type === 'waiting') {
      onlineReady = false;
      // Show waiting state
      connectingState.classList.remove('active');
      waitingState.classList.add('active');
      lobbyState.classList.remove('active');
      sharedRoom.textContent = room;
      setStatus('Waiting for opponent...');
    } else if (msg.type === 'lobby') {
      onlineReady = false;
      // Show lobby with list of players
      connectingState.classList.remove('active');
      waitingState.classList.remove('active');
      lobbyState.classList.add('active');
      lobbyRoom.textContent = room;
      if (!msg.isSpectator) playerSlot = Number(msg.you || 0);
      
      // Update players list
      if (msg.players && Array.isArray(msg.players)) {
        playersList.innerHTML = '';
        msg.players.forEach((player, idx) => {
          const playerEl = document.createElement('div');
          playerEl.className = 'playerItem';
          if (!msg.isSpectator && idx === playerSlot) playerEl.classList.add('you');
          playerEl.textContent = player.name;
          playersList.appendChild(playerEl);
        });
        
        // Show spectators
        if (msg.spectators && Array.isArray(msg.spectators)) {
          msg.spectators.forEach(spec => {
            const specEl = document.createElement('div');
            specEl.className = 'playerItem spectatorItem';
            specEl.textContent = '👁 ' + spec.name + ' (spectator)';
            playersList.appendChild(specEl);
          });
        }
        
        // Show/hide start button and waiting message based on player count
        if (msg.players.length >= 2 && !msg.isSpectator) {
          btnStartGame.style.display = 'block';
          waitingForPlayers.style.display = 'none';
        } else if (msg.isSpectator) {
          btnStartGame.style.display = 'none';
          waitingForPlayers.textContent = 'Watching as spectator...';
          waitingForPlayers.style.display = 'block';
        } else {
          btnStartGame.style.display = 'none';
          waitingForPlayers.style.display = 'block';
        }
      }
      
      setStatus(`Lobby: ${msg.players ? msg.players.length : 1} player(s)${msg.spectators && msg.spectators.length ? ' + ' + msg.spectators.length + ' spectator(s)' : ''}`);
    } else if (msg.type === 'start') {
      const seed = Number(msg.seed || Math.floor(Math.random() * 1_000_000));
      game = new Game(seed);
      sentGameOver = false;
      onlineReady = true;
      playerSlot = Number(msg.you || 0);
      
      // Hide lobby and form states
      lobbyState.classList.remove('active');
      waitingState.classList.remove('active');
      connectingState.classList.remove('active');
      
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
      
      // Hide menu and show game
      menu.classList.remove('active');
      leaderboardPage.classList.remove('active');
      gameContainer.style.display = 'flex';
      if (gameChatBox) gameChatBox.style.display = 'flex';
      if (spectatorBanner) spectatorBanner.style.display = 'none';
      isSpectator = false;
      
      lastTs = performance.now();
      requestAnimationFrame(loop);
      
      setStatus(`Match started (${oppCount + 1} players): ${oppNames}`);
    } else if (msg.type === 'snapshot') {
      const playerIdx = Number(msg.player || 0);
      if (isSpectator) {
        // Spectator: store all player data
        if (playerIdx >= 0 && playerIdx < 4) {
          if (!spectatorData[playerIdx]) {
            spectatorData[playerIdx] = { name: 'Player ' + (playerIdx + 1), grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, piece: null, next: null };
          }
          if (Array.isArray(msg.grid) && msg.grid.length === ROWS) {
            const parsed = [];
            let ok = true;
            for (const row of msg.grid) {
              if (typeof row !== 'string' || row.length !== COLS) { ok = false; break; }
              parsed.push(row.split(''));
            }
            if (ok) spectatorData[playerIdx].grid = parsed;
          }
          spectatorData[playerIdx].score = Number(msg.score || 0);
          spectatorData[playerIdx].lines = Number(msg.lines || 0);
          spectatorData[playerIdx].game_over = Boolean(msg.game_over);
          if (msg.piece) spectatorData[playerIdx].piece = msg.piece;
          if (msg.next) spectatorData[playerIdx].next = msg.next;
        }
      } else if (playerIdx >= 1 && playerIdx <= 3 && playerIdx !== playerSlot) {
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
      if (!isSpectator) {
        const amt = Number(msg.amount || 0);
        if (amt > 0) game.addGarbage(amt);
      }
    } else if (msg.type === 'gameover') {
      const playerIdx = Number(msg.player || 0);
      if (isSpectator) {
        if (playerIdx >= 0 && playerIdx < 4 && spectatorData[playerIdx]) {
          spectatorData[playerIdx].game_over = true;
        }
      } else if (playerIdx >= 1 && playerIdx <= 3 && playerIdx !== playerSlot) {
        const oppIdx = playerIdx - 1;
        opponents[oppIdx].game_over = true;
        oppStatusEls[oppIdx].textContent = 'TOPOUT';
      }
    } else if (msg.type === 'start_spectator') {
      // Spectator mode game start
      isSpectator = true;
      mode = 'spectating';
      const players = msg.players || [];
      spectatorData = [null, null, null, null];
      for (let i = 0; i < players.length; i++) {
        spectatorData[i] = { name: players[i].name, grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, piece: null, next: null };
      }
      updatePlayerCount(players.length);
      // Update board headers for spectator view
      const boardTitles = [
        document.querySelector('#player1Board .playerTitle'),
        document.querySelector('#player2Board .playerTitle'),
        document.querySelector('#player3Board .playerTitle'),
        document.querySelector('#player4Board .playerTitle')
      ];
      for (let i = 0; i < players.length; i++) {
        if (boardTitles[i]) boardTitles[i].textContent = spectatorData[i].name;
      }
      // Hide lobby, show game
      lobbyState.classList.remove('active');
      waitingState.classList.remove('active');
      connectingState.classList.remove('active');
      formWrapper.classList.remove('hidden');
      menu.classList.remove('active');
      leaderboardPage.classList.remove('active');
      gameContainer.style.display = 'flex';
      if (spectatorBanner) spectatorBanner.style.display = 'flex';
      if (gameChatBox) gameChatBox.style.display = 'flex';
      // Hide piece stats for spectator
      if (pieceStatsPanel) pieceStatsPanel.style.display = 'none';
      if (b2bIndicator) b2bIndicator.classList.remove('active');
      lastTs = performance.now();
      requestAnimationFrame(loop);
      setStatus('Spectating match');
    } else if (msg.type === 'spectating') {
      // Mid-game spectator join
      isSpectator = true;
      mode = 'spectating';
      const players = msg.players || [];
      spectatorData = [null, null, null, null];
      for (let i = 0; i < players.length; i++) {
        spectatorData[i] = { name: players[i].name, grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, piece: null, next: null };
      }
      updatePlayerCount(players.length);
      const boardTitles2 = [
        document.querySelector('#player1Board .playerTitle'),
        document.querySelector('#player2Board .playerTitle'),
        document.querySelector('#player3Board .playerTitle'),
        document.querySelector('#player4Board .playerTitle')
      ];
      for (let i = 0; i < players.length; i++) {
        if (boardTitles2[i]) boardTitles2[i].textContent = spectatorData[i].name;
      }
      lobbyState.classList.remove('active');
      waitingState.classList.remove('active');
      connectingState.classList.remove('active');
      formWrapper.classList.remove('hidden');
      menu.classList.remove('active');
      leaderboardPage.classList.remove('active');
      gameContainer.style.display = 'flex';
      if (spectatorBanner) spectatorBanner.style.display = 'flex';
      if (gameChatBox) gameChatBox.style.display = 'flex';
      if (pieceStatsPanel) pieceStatsPanel.style.display = 'none';
      if (b2bIndicator) b2bIndicator.classList.remove('active');
      lastTs = performance.now();
      requestAnimationFrame(loop);
      setStatus('Spectating match (joined mid-game)');
    } else if (msg.type === 'chat') {
      const target = lobbyState.classList.contains('active') ? 'lobby' : 'game';
      addChatMessage(msg.name, msg.text, msg.isSpectator, target);
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
  const theme = THEMES[currentThemeName];
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvasW, canvasH);
  
  // Draw grid
  const smallCell = canvasW / 4;
  ctx.strokeStyle = theme.grid;
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

  // Spectator mode rendering
  if (mode === 'spectating') {
    const allCtx = [bctx, octx2, octx3, octx4];
    const allNextCtx = nextCtxes;
    for (let i = 0; i < 4; i++) {
      if (!spectatorData[i]) {
        drawGrid(allCtx[i], blankGrid);
        continue;
      }
      drawGrid(allCtx[i], spectatorData[i].grid);
      if (spectatorData[i].piece) drawOpponentPiece(allCtx[i], spectatorData[i].piece);
      if (spectatorData[i].next) drawNextPiece(allNextCtx[i], spectatorData[i].next, 70, 70);
    }
    // Update score/lines for spectated players
    if (spectatorData[0]) {
      scoreEl.textContent = `Score: ${spectatorData[0].score}`;
      linesEl.textContent = `Lines: ${spectatorData[0].lines}`;
    }
    for (let i = 1; i < 4; i++) {
      if (spectatorData[i]) {
        oppScoreEls[i-1].textContent = spectatorData[i].score;
        oppLinesEls[i-1].textContent = spectatorData[i].lines;
        oppStatusEls[i-1].textContent = spectatorData[i].game_over ? 'Topped Out' : 'Playing';
      }
    }
    requestAnimationFrame(loop);
    return;
  }

  // Skip game logic updates if paused, but still render
  if (!isPaused && !game.gameOver && (mode === 'classic' || (mode === 'online' && onlineReady))) {
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
  } else if (!isPaused && mode === 'classic') {
    updateParticles(dt);
    if (game.gameOver && !sentGameOver) {
      sentGameOver = true;
      const playerName = nameInput.value || 'Player';
      const gameTime = game.getElapsedTimeFormatted();
      saveLeaderboard({
        name: playerName,
        score: game.score,
        lines: game.lines,
        time: gameTime,
        timestamp: Date.now()
      });
    }
  } else if (!isPaused) {
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
    const timeBonus = game.getTimeBonus();
    const totalLevel = game.level + timeBonus;
    levelEl.textContent = totalLevel;
    if (timeBonus > 0) {
      levelEl.title = `Level ${game.level} + ${timeBonus} time bonus = ${totalLevel}`;
    }
  }

  // Update elapsed time display (every frame)
  if (timeBadgeEl) {
    timeBadgeEl.textContent = game.getElapsedTimeFormatted();
  }

  // Update piece stats and B2B indicator
  updatePieceStatsDisplay();
  updateB2BIndicator();

  if (game.gameOver) {
    setStatus(mode === 'online' ? 'Game over (you topped out)' : 'Game over');
    if (!shownGameOver) {
      shownGameOver = true;
      showGameOver();
    }
    if (mode === 'online') {
      checkWinner(); // Check if you won or if it's a draw
    }
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
  // Don't capture keys when typing in chat
  if (document.activeElement && (document.activeElement.id === 'gameChatInput' || document.activeElement.id === 'lobbyChatInput')) {
    if (e.key === 'Enter') {
      sendChat(document.activeElement);
    }
    return;
  }

  // Allow ESC at any time to pause/resume
  if (e.key === 'Escape') {
    e.preventDefault();
    if ((mode === 'classic' || mode === 'online') && !game.gameOver) {
      togglePause();
    }
    return;
  }
  
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
  if (game.gameOver) return;
  if (mode === 'online' && !onlineReady) return;
  if (isPaused) return;

  if (e.key === 'ArrowLeft') game.move(-1, 0);
  else if (e.key === 'ArrowRight') game.move(1, 0);
  else if (e.key === 'ArrowUp') game.rotateCurrent();
  else if (e.key === ' ') game.hardDrop();
  else if (e.key === 'ArrowDown') game.softDrop = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowDown') game.softDrop = false;
});

function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]');
  return scores;
}

function saveLeaderboard(entry) {
  let scores = loadLeaderboard();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 50); // Keep top 50
  localStorage.setItem('tetrisLeaderboard', JSON.stringify(scores));
}

function displayLeaderboard() {
  const scores = loadLeaderboard();
  leaderboardEntries.innerHTML = '';
  
  if (scores.length === 0) {
    leaderboardEntries.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--color-text-dim);">No scores yet. Play a game to get on the leaderboard!</div>';
    return;
  }
  
  scores.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = 'leaderboardEntry';
    if (idx === 0) div.classList.add('top1');
    else if (idx === 1) div.classList.add('top2');
    else if (idx === 2) div.classList.add('top3');
    
    div.innerHTML = `
      <div class="rankCol">${idx + 1}</div>
      <div class="nameCol">${entry.name || 'Anonymous'}</div>
      <div class="scoreCol">${entry.score}</div>
      <div class="linesCol">${entry.lines}</div>
      <div class="timeCol">${entry.time}</div>
    `;
    leaderboardEntries.appendChild(div);
  });
}

function showLeaderboard() {
  menu.classList.remove('active');
  onlineForm.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.add('active');
  displayLeaderboard();
}

function hideLeaderboard() {
  leaderboardPage.classList.remove('active');
  welcomePage.classList.add('active');
  gameContainer.style.display = 'none';
}

// Card click handlers from welcome page
cardClassic.addEventListener('click', startClassic);
cardOnline.addEventListener('click', () => {
  welcomePage.classList.remove('active');
  menu.classList.remove('active');
  onlineForm.classList.add('active');
});
cardLeaderboard.addEventListener('click', () => {
  welcomePage.classList.remove('active');
  menu.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.add('active');
  displayLeaderboard();
});

btnConnect.addEventListener('click', connectOnline);
btnStartGame.addEventListener('click', () => {
  send({ type: 'startgame' });
});
btnBackFromOnline.addEventListener('click', () => {
  if (ws) { ws.close(); ws = null; }
  onlineForm.classList.remove('active');
  connectingState.classList.remove('active');
  waitingState.classList.remove('active');
  lobbyState.classList.remove('active');
  formWrapper.classList.remove('hidden');
  btnConnect.disabled = false;
  btnConnect.classList.remove('loading');
  welcomePage.classList.add('active');
});
btnLeaveLobby.addEventListener('click', () => {
  if (ws) { ws.close(); ws = null; }
  onlineForm.classList.remove('active');
  connectingState.classList.remove('active');
  waitingState.classList.remove('active');
  lobbyState.classList.remove('active');
  formWrapper.classList.remove('hidden');
  btnConnect.disabled = false;
  btnConnect.classList.remove('loading');
  welcomePage.classList.add('active');
});
btnBackFromLeaderboard.addEventListener('click', hideLeaderboard);
btnClearLeaderboard.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
    localStorage.removeItem('tetrisLeaderboard');
    displayLeaderboard();
  }
});

// Pause menu buttons
btnResume.addEventListener('click', resumeGame);
btnBackToMenu.addEventListener('click', backToMenuFromGame);
btnLeaderboardPause.addEventListener('click', showLeaderboardFromPause);

// Game over menu buttons
btnPlayAgain.addEventListener('click', playAgain);
btnGameOverBackToMenu.addEventListener('click', gameOverBackToMenu);
btnLeaderboardGameOver.addEventListener('click', showLeaderboardFromGameOver);

// Theme selector
if (themeOptions) {
  themeOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('.themeBtn');
    if (btn && btn.dataset.theme) {
      applyTheme(btn.dataset.theme);
    }
  });
}

// Chat event listeners
if (lobbyChatSend) lobbyChatSend.addEventListener('click', () => sendChat(lobbyChatInput));
if (gameChatSend) gameChatSend.addEventListener('click', () => sendChat(gameChatInput));
if (chatToggle) chatToggle.addEventListener('click', toggleGameChat);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  updatePlayerCount(1);
  welcomePage.classList.add('active');
  menu.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  pauseMenu.classList.remove('active');
  gameOverMenu.classList.remove('active');
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  // Apply saved theme
  applyTheme(currentThemeName);
  updatePieceStatsColors();
});
