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

// ==================== THEME SOUNDTRACK DEFINITIONS ====================
const THEME_MUSIC = {
  neon: {
    // Synthwave driving bassline — dark & pulsing
    notes: [82, 82, 110, 131, 110, 82, 98, 131, 82, 82, 110, 131, 147, 131, 110, 98],
    type: 'sawtooth',
    tempo: 180,       // ms per note
    noteLen: 0.16,    // seconds
    volume: 0.10,
    // Add a sub-bass layer for that synthwave thump
    subBass: true,
    subNotes: [41, 41, 55, 65, 55, 41, 49, 65, 41, 41, 55, 65, 73, 65, 55, 49],
    subVol: 0.06
  },
  retro: {
    // Korobeiniki-inspired melody — the classic Tetris vibe (8-bit)
    notes: [
      330, 247, 262, 294, 262, 247, 220, 220, 262, 330, 294, 262,
      247, 262, 294, 330, 262, 220, 220, 220,
      294, 349, 440, 392, 349, 330, 262, 330, 294, 262,
      247, 262, 294, 330, 262, 220, 220, 0
    ],
    type: 'square',
    tempo: 150,
    noteLen: 0.13,
    volume: 0.07,
    subBass: false
  },
  pastel: {
    // Gentle music-box melody — soft & dreamy
    notes: [
      523, 659, 784, 1047, 784, 659, 523, 0,
      587, 698, 880, 1047, 880, 698, 587, 0,
      523, 784, 1047, 1319, 1047, 784, 659, 0,
      440, 523, 659, 784, 659, 523, 440, 0
    ],
    type: 'sine',
    tempo: 280,
    noteLen: 0.25,
    volume: 0.06,
    subBass: false
  },
  monochrome: {
    // Minimal ambient — sparse, haunting, slow
    notes: [131, 0, 156, 0, 196, 0, 262, 0, 196, 0, 156, 0, 131, 0, 0, 0],
    type: 'triangle',
    tempo: 500,
    noteLen: 0.45,
    volume: 0.05,
    subBass: false
  },
  ocean: {
    // Custom WAV file — loaded separately
    file: 'TerrariaMusic.wav',
    volume: 0.35
  }
};

// ==================== SOUND MANAGER ====================
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('tetrisSoundEnabled') !== 'false';
    this.musicEnabled = localStorage.getItem('tetrisMusicEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('tetrisVolume') || '0.5');
    this.musicInterval = null;
    this.initialized = false;
    this.masterGain = null;
    // Ocean WAV playback state
    this.oceanBuffer = null;
    this.oceanSource = null;
    this.oceanGain = null;
    this.oceanLoading = false;
    // Track which theme's music is currently playing
    this.currentMusicTheme = null;
  }
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
      // Pre-load ocean WAV in background
      this._preloadOceanAudio();
    } catch (e) { console.warn('Web Audio not supported'); }
  }
  _preloadOceanAudio() {
    if (this.oceanBuffer || this.oceanLoading) return;
    this.oceanLoading = true;
    fetch(THEME_MUSIC.ocean.file)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.arrayBuffer(); })
      .then(buf => this.ctx.decodeAudioData(buf))
      .then(decoded => { this.oceanBuffer = decoded; this.oceanLoading = false; console.log('Ocean soundtrack loaded'); })
      .catch(e => { console.warn('Could not load ocean soundtrack:', e); this.oceanLoading = false; });
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  tone(freq, duration, type = 'square', vol = 0.3) {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol * this.volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  noise(duration, vol = 0.2) {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = vol * this.volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }
  playMove() { this.tone(200, 0.05, 'square', 0.1); }
  playRotate() { this.tone(300, 0.06, 'square', 0.12); }
  playDrop() { this.noise(0.1, 0.25); this.tone(80, 0.15, 'sine', 0.25); }
  playLineClear(count) {
    for (let i = 0; i < count; i++) setTimeout(() => this.tone(400 + i * 100, 0.15, 'square', 0.2), i * 60);
  }
  playTetris() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, 'square', 0.25), i * 80)); }
  playTSpin() {
    this.tone(200, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this.tone(400, 0.3, 'sawtooth', 0.2), 100);
    setTimeout(() => this.tone(600, 0.2, 'square', 0.15), 200);
  }
  playCombo(count) {
    const freq = 300 + Math.min(count, 10) * 50;
    this.tone(freq, 0.1, 'square', 0.15);
    setTimeout(() => this.tone(freq * 1.25, 0.1, 'square', 0.15), 60);
  }
  playPerfectClear() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sine', 0.25), i * 100)); }
  playLevelUp() { [440, 554, 659].forEach((f, i) => setTimeout(() => this.tone(f, 0.15, 'triangle', 0.2), i * 80)); }
  playGameOver() { [400, 350, 300, 250, 200].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'sawtooth', 0.15), i * 150)); }
  playB2B() { this.tone(600, 0.1, 'sine', 0.15); setTimeout(() => this.tone(800, 0.15, 'sine', 0.2), 80); }
  playGarbage() { this.noise(0.15, 0.2); this.tone(60, 0.2, 'sine', 0.25); }
  playAchievement() { [660, 880, 1100].forEach((f, i) => setTimeout(() => this.tone(f, 0.2, 'triangle', 0.2), i * 100)); }

  // ---------- Ocean WAV playback ----------
  _startOceanMusic() {
    if (!this.ctx || !this.oceanBuffer) return;
    this._stopOceanMusic();
    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.value = THEME_MUSIC.ocean.volume * this.volume;
    this.oceanGain.connect(this.masterGain);
    this.oceanSource = this.ctx.createBufferSource();
    this.oceanSource.buffer = this.oceanBuffer;
    this.oceanSource.loop = true;
    this.oceanSource.connect(this.oceanGain);
    this.oceanSource.start(0, 10); // skip first 10s of silence
  }
  _stopOceanMusic() {
    if (this.oceanSource) {
      try { this.oceanSource.stop(); } catch (e) { /* already stopped */ }
      this.oceanSource.disconnect();
      this.oceanSource = null;
    }
    if (this.oceanGain) { this.oceanGain.disconnect(); this.oceanGain = null; }
  }

  // ---------- Procedural synth music ----------
  _startSynthMusic(themeName) {
    const cfg = THEME_MUSIC[themeName];
    if (!cfg || !cfg.notes || !this.ctx) return;
    let noteIdx = 0;
    const playNote = () => {
      if (!this.musicEnabled || !this.ctx) { this.stopMusic(); return; }
      const freq = cfg.notes[noteIdx % cfg.notes.length];
      if (freq > 0) {
        // Main melody voice
        const osc = this.ctx.createOscillator();
        osc.type = cfg.type;
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        g.gain.value = this.volume * cfg.volume;
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + cfg.noteLen);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + cfg.noteLen);
      }
      // Optional sub-bass layer (neon synthwave thump)
      if (cfg.subBass && cfg.subNotes) {
        const subFreq = cfg.subNotes[noteIdx % cfg.subNotes.length];
        if (subFreq > 0) {
          const osc2 = this.ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.value = subFreq;
          const g2 = this.ctx.createGain();
          g2.gain.value = this.volume * cfg.subVol;
          g2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + cfg.noteLen * 1.2);
          osc2.connect(g2);
          g2.connect(this.masterGain);
          osc2.start();
          osc2.stop(this.ctx.currentTime + cfg.noteLen * 1.2);
        }
      }
      noteIdx++;
    };
    playNote();
    this.musicInterval = setInterval(playNote, cfg.tempo);
  }

  // ---------- Public music API ----------
  startMusic() {
    if (!this.ctx || !this.musicEnabled) return;
    // If music is already playing for the current theme, don't restart
    if (this.currentMusicTheme === currentThemeName && (this.musicInterval || this.oceanSource)) return;
    this.stopMusic();
    this.resume();
    this.currentMusicTheme = currentThemeName;

    if (currentThemeName === 'ocean') {
      if (this.oceanBuffer) {
        this._startOceanMusic();
      } else {
        // WAV still loading — retry when loaded
        const checkLoad = setInterval(() => {
          if (this.oceanBuffer) {
            clearInterval(checkLoad);
            if (this.musicEnabled && currentThemeName === 'ocean' && !this.oceanSource) {
              this._startOceanMusic();
            }
          }
        }, 500);
        // Give up after 30s
        setTimeout(() => clearInterval(checkLoad), 30000);
      }
    } else {
      this._startSynthMusic(currentThemeName);
    }
  }
  stopMusic() {
    if (this.musicInterval) { clearInterval(this.musicInterval); this.musicInterval = null; }
    this._stopOceanMusic();
    this.currentMusicTheme = null;
  }
  pauseMusic() {
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }
  resumeMusic() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  /** Call when theme changes — seamlessly switches the soundtrack */
  switchThemeMusic() {
    if (!this.musicEnabled) return;
    // Only restart if music is supposed to be playing
    const wasPlaying = this.musicInterval || this.oceanSource;
    this.stopMusic();
    if (wasPlaying) this.startMusic();
  }
  setVolume(v) {
    this.volume = v;
    localStorage.setItem('tetrisVolume', String(v));
    if (this.masterGain) this.masterGain.gain.value = v;
    // Update ocean gain node in real-time
    if (this.oceanGain) this.oceanGain.gain.value = THEME_MUSIC.ocean.volume * v;
  }
  toggleSound() { this.enabled = !this.enabled; localStorage.setItem('tetrisSoundEnabled', String(this.enabled)); return this.enabled; }
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('tetrisMusicEnabled', String(this.musicEnabled));
    if (this.musicEnabled) this.startMusic(); else this.stopMusic();
    return this.musicEnabled;
  }
}
const sound = new SoundManager();

// ==================== FLOATING TEXT ====================
class FloatingText {
  constructor(text, x, y, color, size = 18, duration = 1200) {
    this.text = text; this.x = x; this.y = y; this.color = color;
    this.size = size; this.duration = duration; this.elapsed = 0; this.vy = -60;
  }
  update(dt) { this.elapsed += dt; this.y += this.vy * dt / 1000; this.vy *= 0.98; }
  isDead() { return this.elapsed >= this.duration; }
  getOpacity() { return Math.max(0, 1 - this.elapsed / this.duration); }
  draw(ctx) {
    const alpha = this.getOpacity();
    const scale = 1 + (this.elapsed / this.duration) * 0.3;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${Math.round(this.size * scale)}px Consolas, monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
let floatingTexts = [];
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0, elapsed: 0 };

function addFloatingText(text, color, size = 18) {
  floatingTexts.push(new FloatingText(text, BOARD_W / 2, BOARD_H / 2 - floatingTexts.length * 25, color, size));
}
function triggerScreenShake(intensity = 5, duration = 300) {
  screenShake = { x: 0, y: 0, intensity, duration, elapsed: 0 };
}
function updateFloatingTexts(dt) {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update(dt);
    if (floatingTexts[i].isDead()) floatingTexts.splice(i, 1);
  }
  if (screenShake.elapsed < screenShake.duration) {
    screenShake.elapsed += dt;
    const decay = 1 - screenShake.elapsed / screenShake.duration;
    screenShake.x = (Math.random() - 0.5) * screenShake.intensity * decay * 2;
    screenShake.y = (Math.random() - 0.5) * screenShake.intensity * decay * 2;
  } else { screenShake.x = 0; screenShake.y = 0; }
}
function drawFloatingTexts(ctx) { for (const ft of floatingTexts) ft.draw(ctx); }

// ==================== ACHIEVEMENTS ====================
const ACHIEVEMENTS = [
  { id: 'first_clear', name: 'First Blood', desc: 'Clear your first line', icon: '⚔️', check: (s) => s.totalLines >= 1 },
  { id: 'tetris_clear', name: 'Tetris!', desc: 'Clear 4 lines at once', icon: '💎' },
  { id: 'first_tspin', name: 'Spin Doctor', desc: 'Perform a T-Spin clear', icon: '🌀' },
  { id: 'combo_5', name: 'Combo Master', desc: 'Reach a 5-combo', icon: '🔥' },
  { id: 'combo_10', name: 'Unstoppable', desc: 'Reach a 10-combo', icon: '💥' },
  { id: 'score_10k', name: 'Rising Star', desc: 'Score 10,000 points', icon: '⭐', check: (s) => s.bestScore >= 10000 },
  { id: 'score_50k', name: 'Pro Player', desc: 'Score 50,000 points', icon: '🌟', check: (s) => s.bestScore >= 50000 },
  { id: 'score_100k', name: 'Legend', desc: 'Score 100,000 points', icon: '👑', check: (s) => s.bestScore >= 100000 },
  { id: 'lines_100', name: 'Century', desc: 'Clear 100 total lines', icon: '💯', check: (s) => s.totalLines >= 100 },
  { id: 'lines_500', name: 'Line Destroyer', desc: 'Clear 500 total lines', icon: '🔮', check: (s) => s.totalLines >= 500 },
  { id: 'games_10', name: 'Getting Started', desc: 'Play 10 games', icon: '🎮', check: (s) => s.gamesPlayed >= 10 },
  { id: 'games_50', name: 'Dedicated', desc: 'Play 50 games', icon: '🏅', check: (s) => s.gamesPlayed >= 50 },
  { id: 'perfect_clear', name: 'Perfectionist', desc: 'Get a perfect clear', icon: '✨' },
  { id: 'b2b_5', name: 'Chain Breaker', desc: 'Get B2B x5', icon: '🔗' },
  { id: 'level_10', name: 'Speed Demon', desc: 'Reach level 10', icon: '⚡' },
  { id: 'survive_5min', name: 'Survivor', desc: 'Survive for 5 minutes', icon: '🛡️' },
];
function loadAchievements() { return JSON.parse(localStorage.getItem('tetrisAchievements') || '{}'); }
function saveAchievements(a) { localStorage.setItem('tetrisAchievements', JSON.stringify(a)); }
function unlockAchievement(id) {
  const a = loadAchievements();
  if (a[id]) return false;
  a[id] = { unlockedAt: Date.now() };
  saveAchievements(a);
  showAchievementToast(id);
  return true;
}
function showAchievementToast(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return;
  const toast = document.createElement('div');
  toast.className = 'achievementToast';
  toast.innerHTML = `<span class="achIcon">${ach.icon}</span><div class="achInfo"><span class="achTitle">Achievement Unlocked!</span><span class="achName">${ach.name}</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
  sound.playAchievement();
}
function checkEventAchievement(event, value) {
  switch (event) {
    case 'tetris': unlockAchievement('tetris_clear'); break;
    case 'tspin': unlockAchievement('first_tspin'); break;
    case 'combo': if (value >= 5) unlockAchievement('combo_5'); if (value >= 10) unlockAchievement('combo_10'); break;
    case 'perfect_clear': unlockAchievement('perfect_clear'); break;
    case 'b2b': if (value >= 5) unlockAchievement('b2b_5'); break;
    case 'level': if (value >= 10) unlockAchievement('level_10'); break;
    case 'survive': if (value >= 300000) unlockAchievement('survive_5min'); break;
  }
}
function checkStatAchievements() {
  const stats = loadStats();
  const achs = loadAchievements();
  for (const ach of ACHIEVEMENTS) {
    if (ach.check && !achs[ach.id] && ach.check(stats)) unlockAchievement(ach.id);
  }
}

// ==================== PLAYER STATS ====================
const DEFAULT_STATS = { gamesPlayed: 0, totalScore: 0, bestScore: 0, totalLines: 0, bestLines: 0, bestCombo: 0, totalTetris: 0, totalTSpins: 0, totalPerfectClears: 0, totalTime: 0, piecesPlaced: 0, totalB2B: 0 };
function loadStats() { return JSON.parse(localStorage.getItem('tetrisStats') || JSON.stringify(DEFAULT_STATS)); }
function saveStats(s) { localStorage.setItem('tetrisStats', JSON.stringify(s)); }
function updateStatsOnGameEnd(g) {
  const s = loadStats();
  s.gamesPlayed++;
  s.totalScore += g.score;
  if (g.score > s.bestScore) s.bestScore = g.score;
  s.totalLines += g.lines;
  if (g.lines > s.bestLines) s.bestLines = g.lines;
  s.totalTime += g.elapsedMs;
  let placed = 0;
  for (const k of Object.keys(g.pieceStats)) placed += g.pieceStats[k];
  s.piecesPlaced += placed;
  saveStats(s);
  checkStatAchievements();
}
function trackGameEvent(event, value) {
  const s = loadStats();
  switch (event) {
    case 'tetris': s.totalTetris++; break;
    case 'tspin': s.totalTSpins++; break;
    case 'perfect_clear': s.totalPerfectClears++; break;
    case 'combo': if (value > s.bestCombo) s.bestCombo = value; break;
    case 'b2b': s.totalB2B++; break;
  }
  saveStats(s);
}

// ==================== REPLAY SYSTEM ====================
class ReplayRecorder {
  constructor(seed) { this.seed = seed; this.inputs = []; this.startTime = performance.now(); }
  record(action) { this.inputs.push({ t: performance.now() - this.startTime, a: action }); }
  export() { return { seed: this.seed, inputs: this.inputs, version: 1 }; }
}
class ReplayPlayer {
  constructor(data) {
    this.data = data; this.game = new Game(data.seed); this.inputIdx = 0;
    this.elapsed = 0; this.speed = 1; this.paused = false; this.finished = false;
  }
  update(dt) {
    if (this.paused || this.finished) return;
    this.elapsed += dt * this.speed;
    while (this.inputIdx < this.data.inputs.length && this.data.inputs[this.inputIdx].t <= this.elapsed) {
      const input = this.data.inputs[this.inputIdx];
      switch (input.a) {
        case 'left': this.game.move(-1, 0); break;
        case 'right': this.game.move(1, 0); break;
        case 'rotate': this.game.rotateCurrent(); break;
        case 'drop': this.game.hardDrop(); break;
        case 'softOn': this.game.softDrop = true; break;
        case 'softOff': this.game.softDrop = false; break;
      }
      this.inputIdx++;
    }
    this.game.update(dt * this.speed);
    if (this.game.gameOver || this.inputIdx >= this.data.inputs.length) this.finished = true;
  }
}
let replayRecorder = null;
let replayPlayer = null;
let savedReplays = JSON.parse(localStorage.getItem('tetrisReplays') || '[]');
function saveReplay(name) {
  if (!replayRecorder) return;
  const data = replayRecorder.export();
  data.name = name || 'Replay ' + (savedReplays.length + 1);
  data.score = game.score; data.lines = game.lines; data.date = Date.now();
  savedReplays.push(data);
  if (savedReplays.length > 20) savedReplays.shift();
  localStorage.setItem('tetrisReplays', JSON.stringify(savedReplays));
}

// ==================== AI OPPONENT ====================
class TetrisAI {
  constructor(difficulty = 0.5) {
    this.difficulty = difficulty;
    this.moveDelay = Math.max(50, 500 - difficulty * 450);
    this.moveTimer = 0;
    this.plannedMoves = [];
    this.game = null;
  }
  setGame(g) { this.game = g; }
  evaluate(grid, linesCleared) {
    const heights = new Array(COLS).fill(0);
    let aggregateHeight = 0, holes = 0, bumpiness = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) { if (grid[r][c] !== '.') { heights[c] = ROWS - r; break; } }
    }
    for (let c = 0; c < COLS; c++) {
      aggregateHeight += heights[c];
      let blockFound = false;
      for (let r = 0; r < ROWS; r++) { if (grid[r][c] !== '.') blockFound = true; else if (blockFound) holes++; }
    }
    for (let c = 0; c < COLS - 1; c++) bumpiness += Math.abs(heights[c] - heights[c + 1]);
    const w = this.difficulty > 0.5 ? { h: -0.51, l: 0.76, ho: -0.36, b: -0.18 } : { h: -0.4, l: 0.6, ho: -0.3, b: -0.15 };
    return w.h * aggregateHeight + w.l * linesCleared + w.ho * holes + w.b * bumpiness;
  }
  simulatePlacement(piece, targetRot, targetX) {
    const grid = this.game.grid.map(r => [...r]);
    const shape = piece.rotations[(targetRot + 4) % 4];
    const collideTest = (px, py) => {
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (shape[r][c] === '.') continue;
        const nx = px + c, ny = py + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx] !== '.') return true;
      }
      return false;
    };
    if (collideTest(targetX, 0)) return null;
    let y = 0;
    while (!collideTest(targetX, y + 1)) y++;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const v = shape[r][c];
      if (v === '.') continue;
      const px = targetX + c, py = y + r;
      if (py >= 0 && py < ROWS && px >= 0 && px < COLS) grid[py][px] = v;
    }
    return { grid };
  }
  generateMoves(piece, targetRot, targetX) {
    const moves = [];
    const rots = (targetRot - piece.rotation + 4) % 4;
    for (let i = 0; i < rots; i++) moves.push('rotate');
    const dx = targetX - piece.x;
    const dir = dx > 0 ? 'right' : 'left';
    for (let i = 0; i < Math.abs(dx); i++) moves.push(dir);
    moves.push('drop');
    return moves;
  }
  findBestMove() {
    if (!this.game || this.game.gameOver) return [];
    let bestScore = -Infinity, bestMoves = [];
    for (let rot = 0; rot < 4; rot++) {
      for (let x = -2; x < COLS; x++) {
        const test = this.simulatePlacement(this.game.current, rot, x);
        if (!test) continue;
        let cleared = 0;
        for (let r = 0; r < ROWS; r++) if (test.grid[r].every(c => c !== '.')) cleared++;
        const score = this.evaluate(test.grid, cleared) + (1 - this.difficulty) * (Math.random() * 2 - 1) * 5;
        if (score > bestScore) { bestScore = score; bestMoves = this.generateMoves(this.game.current, rot, x); }
      }
    }
    return bestMoves;
  }
  update(dt) {
    if (!this.game || this.game.gameOver) return;
    this.moveTimer += dt;
    if (this.plannedMoves.length === 0) this.plannedMoves = this.findBestMove();
    if (this.moveTimer >= this.moveDelay && this.plannedMoves.length > 0) {
      this.moveTimer = 0;
      const move = this.plannedMoves.shift();
      switch (move) {
        case 'left': this.game.move(-1, 0); break;
        case 'right': this.game.move(1, 0); break;
        case 'rotate': this.game.rotateCurrent(); break;
        case 'drop': this.game.hardDrop(); break;
      }
    }
  }
}
let aiOpponent = null;
let aiGame = null;
let aiDifficulty = 0.5;

// Room settings for custom games
let roomSettings = { startLevel: 1, garbageMultiplier: 1, speedMultiplier: 1 };

// ==================== KEYBIND SYSTEM ====================
const DEFAULT_KEYBINDS = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  rotate: 'ArrowUp',
  hardDrop: ' ',
  softDrop: 'ArrowDown',
};
const KEYBIND_LABELS = {
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  rotate: 'Rotate',
  hardDrop: 'Hard Drop',
  softDrop: 'Soft Drop',
};
function loadKeybinds() {
  try { return { ...DEFAULT_KEYBINDS, ...JSON.parse(localStorage.getItem('tetrisKeybinds') || '{}') }; }
  catch { return { ...DEFAULT_KEYBINDS }; }
}
function saveKeybinds(kb) { localStorage.setItem('tetrisKeybinds', JSON.stringify(kb)); }
let keybinds = loadKeybinds();

function keyDisplayName(key) {
  const names = { ' ': 'Space', 'ArrowLeft': '←', 'ArrowRight': '→', 'ArrowUp': '↑', 'ArrowDown': '↓', 'Shift': 'Shift', 'Control': 'Ctrl', 'Alt': 'Alt' };
  return names[key] || (key.length === 1 ? key.toUpperCase() : key);
}
function getActionForKey(key) {
  for (const [action, boundKey] of Object.entries(keybinds)) {
    if (boundKey === key) return action;
  }
  return null;
}
function getAllBoundKeys() {
  return new Set(Object.values(keybinds));
}

// ==================== COIN / ECONOMY SYSTEM ====================
function loadCoins() { return parseInt(localStorage.getItem('tetrisCoins') || '0', 10); }
function saveCoins(amount) { localStorage.setItem('tetrisCoins', String(amount)); }
function addCoins(amount) {
  const c = loadCoins() + amount;
  saveCoins(c);
  updateCoinDisplays();
  return c;
}
function spendCoins(amount) {
  const c = loadCoins();
  if (c < amount) return false;
  saveCoins(c - amount);
  updateCoinDisplays();
  return true;
}
function updateCoinDisplays() {
  const coins = loadCoins();
  const cd = document.getElementById('coinDisplay');
  const scd = document.getElementById('shopCoinDisplay');
  const ubc = document.getElementById('userBarCoins');
  if (cd) cd.textContent = coins;
  if (scd) scd.textContent = coins;
  if (ubc) ubc.textContent = coins;
}
// Earn coins: 1 per 1000 score, 1 per line, 5 per tetris, 3 per t-spin, bonus for wins
function earnGameCoins(g, won = false) {
  let earned = Math.floor(g.score / 1000) + g.lines;
  if (won) earned += 20;
  if (earned > 0) addCoins(earned);
  return earned;
}

// ==================== PIECE SKINS SYSTEM ====================
const PIECE_SKINS = {
  default:   { name: 'Default',    price: 0,   style: 'flat',      desc: 'Classic flat blocks' },
  rounded:   { name: 'Rounded',    price: 50,  style: 'rounded',   desc: 'Smooth rounded corners' },
  pixelated: { name: 'Pixelated',  price: 75,  style: 'pixelated', desc: 'Retro pixel art style' },
  glowing:   { name: 'Glowing',    price: 100, style: 'glowing',   desc: 'Neon glow effect' },
  gradient:  { name: 'Gradient',   price: 120, style: 'gradient',  desc: 'Smooth color gradients' },
  glass:     { name: 'Glass',      price: 150, style: 'glass',     desc: 'Transparent glass look' },
  metallic:  { name: 'Metallic',   price: 200, style: 'metallic',  desc: 'Shiny metal finish' },
  rainbow:   { name: 'Rainbow',    price: 300, style: 'rainbow',   desc: 'Shifting rainbow colors' },
  dotted:    { name: 'Dotted',     price: 80,  style: 'dotted',    desc: 'Polka-dot pattern overlay' },
  outline:   { name: 'Outline',    price: 60,  style: 'outline',   desc: 'Hollow outline blocks' },
  candy:     { name: 'Candy',      price: 160, style: 'candy',     desc: 'Sweet candy swirl effect' },
  ember:     { name: 'Ember',      price: 250, style: 'ember',     desc: 'Smoldering hot blocks' },
  ice:       { name: 'Ice',        price: 220, style: 'ice',       desc: 'Frozen crystalline look' },
  galaxy:    { name: 'Galaxy',     price: 400, style: 'galaxy',    desc: 'Swirling cosmic dust' },
  gold:      { name: '24K Gold',   price: 500, style: 'gold',      desc: 'Luxurious solid gold' },
};

// ==================== BOARD THEMES SYSTEM ====================
const BOARD_THEMES = {
  default:    { name: 'Default',     price: 0,   desc: 'Standard dark grid',       borderColor: null, bgOverlay: null },
  midnight:   { name: 'Midnight',    price: 100, desc: 'Deep blue midnight sky',    borderColor: '#1a237e', bgOverlay: 'rgba(13,71,161,0.08)' },
  sakura:     { name: 'Sakura',      price: 150, desc: 'Soft cherry-blossom pink',  borderColor: '#e91e63', bgOverlay: 'rgba(233,30,99,0.05)' },
  emerald:    { name: 'Emerald',     price: 150, desc: 'Rich emerald green',        borderColor: '#00c853', bgOverlay: 'rgba(0,200,83,0.05)' },
  volcanic:   { name: 'Volcanic',    price: 200, desc: 'Fiery molten lava border',  borderColor: '#ff3d00', bgOverlay: 'rgba(255,61,0,0.06)' },
  arctic:     { name: 'Arctic',      price: 200, desc: 'Cool icy blue tones',       borderColor: '#00b0ff', bgOverlay: 'rgba(0,176,255,0.06)' },
  royal:      { name: 'Royal',       price: 250, desc: 'Purple & gold royalty',      borderColor: '#9c27b0', bgOverlay: 'rgba(156,39,176,0.06)' },
  hologram:   { name: 'Hologram',    price: 350, desc: 'Iridescent shifting border', borderColor: '#00e5ff', bgOverlay: 'rgba(0,229,255,0.04)' },
  void:       { name: 'The Void',    price: 500, desc: 'Pure darkness, no gridlines', borderColor: '#000', bgOverlay: null, noGrid: true },
};

// ==================== TRAIL EFFECTS SYSTEM ====================
const TRAIL_EFFECTS = {
  none:      { name: 'None',       price: 0,   desc: 'No hard-drop trail' },
  spark:     { name: 'Sparks',     price: 75,  desc: 'Tiny sparks on landing' },
  flame:     { name: 'Flame',      price: 120, desc: 'Fiery flame trail' },
  ice_trail: { name: 'Frost',      price: 120, desc: 'Chilly frost particles' },
  confetti:  { name: 'Confetti',   price: 150, desc: 'Celebration confetti burst' },
  lightning: { name: 'Lightning',  price: 200, desc: 'Electric lightning bolts' },
  stardust:  { name: 'Stardust',   price: 250, desc: 'Glittering star particles' },
  toxic:     { name: 'Toxic',      price: 180, desc: 'Neon green toxic drip' },
  shockwave: { name: 'Shockwave',  price: 300, desc: 'Pulsing shockwave ring' },
};

// ==================== PLAYER TITLES SYSTEM ====================
const PLAYER_TITLES = {
  none:        { name: 'None',         price: 0,   desc: 'No title displayed', color: '#aaa' },
  rookie:      { name: 'Rookie',       price: 50,  desc: 'Just getting started', color: '#90caf9' },
  stacker:     { name: 'Stacker',      price: 100, desc: 'Dedicated block stacker', color: '#00d9ff' },
  speedster:   { name: 'Speedster',    price: 150, desc: 'Fast and furious', color: '#ffd54f' },
  tactician:   { name: 'Tactician',    price: 200, desc: 'Strategic mind', color: '#06ffa5' },
  destroyer:   { name: 'Destroyer',    price: 250, desc: 'Line-clearing machine', color: '#ff006e' },
  champion:    { name: 'Champion',     price: 400, desc: 'Proven winner', color: '#ffd700' },
  legend:      { name: 'Legend',       price: 600, desc: 'Absolutely legendary', color: '#e040fb' },
  godlike:     { name: 'Godlike',      price: 1000, desc: 'Beyond mortal skill', color: '#ff1744' },
};

// ==================== AVATAR SYSTEM ====================
const PLAYER_AVATARS = {
  default:    { name: 'Default',      price: 0,   desc: 'Standard player icon',   emoji: '👤' },
  fire:       { name: 'Fire',         price: 75,  desc: 'Bring the heat',          emoji: '🔥' },
  lightning:  { name: 'Lightning',    price: 75,  desc: 'Strike fast',             emoji: '⚡' },
  skull:      { name: 'Skull',        price: 100, desc: 'Fear the reaper',         emoji: '💀' },
  robot:      { name: 'Robot',        price: 100, desc: 'Beep boop',               emoji: '🤖' },
  alien:      { name: 'Alien',        price: 120, desc: 'From another world',      emoji: '👾' },
  wizard:     { name: 'Wizard',       price: 150, desc: 'Master of blocks',        emoji: '🧙' },
  ninja:      { name: 'Ninja',        price: 150, desc: 'Silent and deadly',       emoji: '🥷' },
  dragon:     { name: 'Dragon',       price: 200, desc: 'Unleash the beast',       emoji: '🐉' },
  crown:      { name: 'Crown',        price: 300, desc: 'Royalty arrives',          emoji: '👑' },
  diamond:    { name: 'Diamond',      price: 400, desc: 'Flawless brilliance',     emoji: '💎' },
  unicorn:    { name: 'Unicorn',      price: 500, desc: 'Rare and majestic',       emoji: '🦄' },
};

// ==================== SHOP PERSISTENCE (generic per-category) ====================
function loadOwned(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return [...fallback]; }
}
function saveOwned(key, list) { localStorage.setItem(key, JSON.stringify(list)); }
function loadEquipped(key, fallback) { return localStorage.getItem(key) || fallback; }
function saveEquipped(key, id) { localStorage.setItem(key, id); }

function loadOwnedSkins() { return loadOwned('tetrisOwnedSkins', ['default']); }
function saveOwnedSkins(list) { saveOwned('tetrisOwnedSkins', list); }
function loadEquippedSkin() { return loadEquipped('tetrisEquippedSkin', 'default'); }
function saveEquippedSkin(id) { saveEquipped('tetrisEquippedSkin', id); }

let ownedSkins  = loadOwnedSkins();
let equippedSkin = loadEquippedSkin();

let ownedBoards   = loadOwned('tetrisOwnedBoards',  ['default']);
let equippedBoard  = loadEquipped('tetrisEquippedBoard', 'default');

let ownedTrails   = loadOwned('tetrisOwnedTrails',  ['none']);
let equippedTrail  = loadEquipped('tetrisEquippedTrail', 'none');

let ownedTitles   = loadOwned('tetrisOwnedTitles',  ['none']);
let equippedTitle  = loadEquipped('tetrisEquippedTitle', 'none');

let ownedAvatars  = loadOwned('tetrisOwnedAvatars', ['default']);
let equippedAvatar = loadEquipped('tetrisEquippedAvatar', 'default');

// Current shop tab
let currentShopTab = 'skins';
let previewingItem = null; // id of item being previewed (click-to-preview)

function buyShopItem(category, id) {
  const catalogs = { skins: PIECE_SKINS, boards: BOARD_THEMES, trails: TRAIL_EFFECTS, titles: PLAYER_TITLES, avatars: PLAYER_AVATARS };
  const ownedMap = { skins: ownedSkins, boards: ownedBoards, trails: ownedTrails, titles: ownedTitles, avatars: ownedAvatars };
  const saveMap  = { skins: (l) => saveOwnedSkins(l), boards: (l) => saveOwned('tetrisOwnedBoards', l), trails: (l) => saveOwned('tetrisOwnedTrails', l), titles: (l) => saveOwned('tetrisOwnedTitles', l), avatars: (l) => saveOwned('tetrisOwnedAvatars', l) };
  const cat = catalogs[category];
  const owned = ownedMap[category];
  if (!cat || !cat[id] || owned.includes(id)) return false;
  if (!spendCoins(cat[id].price)) return false;
  owned.push(id);
  saveMap[category](owned);
  scheduleSyncProfile();
  return true;
}

function equipShopItem(category, id) {
  const ownedMap = { skins: ownedSkins, boards: ownedBoards, trails: ownedTrails, titles: ownedTitles, avatars: ownedAvatars };
  if (!ownedMap[category].includes(id)) return;
  switch(category) {
    case 'skins':  equippedSkin  = id; saveEquippedSkin(id); break;
    case 'boards': equippedBoard = id; saveEquipped('tetrisEquippedBoard', id);
      gridOverlay = buildGridOverlay(); break;
    case 'trails': equippedTrail = id; saveEquipped('tetrisEquippedTrail', id); break;
    case 'titles': equippedTitle = id; saveEquipped('tetrisEquippedTitle', id); break;
    case 'avatars': equippedAvatar = id; saveEquipped('tetrisEquippedAvatar', id); break;
  }
  scheduleSyncProfile();
}

function buySkin(id) { return buyShopItem('skins', id); }
function equipSkin(id) { equipShopItem('skins', id); }

// ==================== RANKED / ELO SYSTEM (Local) ====================
const RANK_TIERS = [
  { name: 'Bronze', icon: '🥉', min: 0 },
  { name: 'Silver', icon: '🥈', min: 1200 },
  { name: 'Gold', icon: '🥇', min: 1400 },
  { name: 'Platinum', icon: '💎', min: 1600 },
  { name: 'Diamond', icon: '👑', min: 1800 },
  { name: 'Master', icon: '🏆', min: 2000 },
];
function getRankForElo(elo) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (elo >= RANK_TIERS[i].min) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}
function loadRankedData() {
  try {
    return JSON.parse(localStorage.getItem('tetrisRanked') || JSON.stringify({ elo: 1000, wins: 0, losses: 0, history: [] }));
  } catch { return { elo: 1000, wins: 0, losses: 0, history: [] }; }
}
function saveRankedData(d) { localStorage.setItem('tetrisRanked', JSON.stringify(d)); }
function calculateEloChange(myElo, oppElo, won) {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (oppElo - myElo) / 400));
  const actual = won ? 1 : 0;
  return Math.round(K * (actual - expected));
}
function recordRankedResult(opponentName, opponentElo, won) {
  const rd = loadRankedData();
  const change = calculateEloChange(rd.elo, opponentElo, won);
  rd.elo = Math.max(0, rd.elo + change);
  if (won) rd.wins++; else rd.losses++;
  rd.history.unshift({ opponent: opponentName, result: won ? 'win' : 'loss', eloChange: change, newElo: rd.elo, date: Date.now() });
  if (rd.history.length > 50) rd.history.pop();
  saveRankedData(rd);
  return change;
}

// ==================== BACKGROUND PARTICLE SYSTEM ====================
const BG_PARTICLES = {
  neon: {
    count: 30, colors: ['#00d9ff', '#ff006e', '#8338ec', '#06ffa5'],
    speed: 0.4, size: [1, 3], glow: true, type: 'spark'
  },
  retro: {
    count: 0, type: 'scanlines' // scanlines are drawn differently
  },
  pastel: {
    count: 15, colors: ['#87ceeb', '#ffb6c1', '#dda0dd', '#98fb98'],
    speed: 0.15, size: [3, 8], glow: false, type: 'bubble'
  },
  monochrome: {
    count: 0, type: 'none'
  },
  ocean: {
    count: 20, colors: ['#00e5ff', '#64ffda', '#448aff', '#7c4dff'],
    speed: 0.25, size: [2, 5], glow: true, type: 'wave'
  }
};

class BgParticle {
  constructor(w, h, cfg) {
    this.w = w; this.h = h; this.cfg = cfg;
    this.reset(true);
  }
  reset(initial = false) {
    this.x = Math.random() * this.w;
    this.y = initial ? Math.random() * this.h : -10;
    this.size = this.cfg.size[0] + Math.random() * (this.cfg.size[1] - this.cfg.size[0]);
    this.color = this.cfg.colors[Math.floor(Math.random() * this.cfg.colors.length)];
    this.vx = (Math.random() - 0.5) * this.cfg.speed * 30;
    this.vy = this.cfg.speed * (20 + Math.random() * 30);
    this.opacity = 0.2 + Math.random() * 0.5;
    this.phase = Math.random() * Math.PI * 2;
  }
  update(dt) {
    this.x += this.vx * dt / 1000;
    this.y += this.vy * dt / 1000;
    this.phase += dt / 1000;
    if (this.cfg.type === 'wave') this.x += Math.sin(this.phase) * 0.3;
    if (this.y > this.h + 10 || this.x < -10 || this.x > this.w + 10) this.reset();
  }
  draw(ctx) {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    if (this.cfg.glow) { ctx.shadowColor = this.color; ctx.shadowBlur = this.size * 3; }
    if (this.cfg.type === 'bubble') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 0.5;
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// Per-board bg particle state (supports up to 4 boards)
const boardBgParticles = [[], [], [], []];
const boardBgCanvas = [null, null, null, null];
const boardBgCtx = [null, null, null, null];

function initBgParticles() {
  const cfg = BG_PARTICLES[currentThemeName];
  const boardIds = ['player1Board', 'player2Board', 'player3Board', 'player4Board'];
  for (let i = 0; i < 4; i++) {
    boardBgParticles[i] = [];
    const board = document.getElementById(boardIds[i]);
    if (!board || board.style.display === 'none') continue;
    if (!cfg || cfg.count === 0) continue;
    // Create canvas if not exists for this board
    if (!boardBgCanvas[i]) {
      const c = document.createElement('canvas');
      c.className = 'bgParticleCanvas';
      c.width = BOARD_W;
      c.height = BOARD_H;
      const mainCanvas = board.querySelector('.mainCanvas');
      if (mainCanvas) mainCanvas.parentNode.insertBefore(c, mainCanvas);
      boardBgCanvas[i] = c;
      boardBgCtx[i] = c.getContext('2d');
    }
    for (let j = 0; j < cfg.count; j++) {
      boardBgParticles[i].push(new BgParticle(BOARD_W, BOARD_H, cfg));
    }
  }
}

function updateBgParticles(dt) {
  for (let i = 0; i < 4; i++) {
    for (const p of boardBgParticles[i]) p.update(dt);
  }
}

function drawBgParticles() {
  const cfg = BG_PARTICLES[currentThemeName];
  for (let i = 0; i < 4; i++) {
    const ctx = boardBgCtx[i];
    if (!ctx) continue;
    ctx.clearRect(0, 0, BOARD_W, BOARD_H);
    if (!cfg) continue;
    if (cfg.type === 'scanlines') {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let y = 0; y < BOARD_H; y += 4) {
        ctx.fillRect(0, y, BOARD_W, 1);
      }
      continue;
    }
    ctx.save();
    for (const p of boardBgParticles[i]) p.draw(ctx);
    ctx.restore();
  }
}

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
      if (dx !== 0) sound.playMove();
      if (replayRecorder && dx !== 0) replayRecorder.record(dx < 0 ? 'left' : 'right');
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
        sound.playRotate();
        if (replayRecorder) replayRecorder.record('rotate');
        return true;
      }
    }
    return false;
  }

  hardDrop() {
    while (!this.collide(this.current, 0, 1)) this.current.y += 1;
    this.groundedMs = this.lockDelayMs;
    sound.playDrop();
    if (replayRecorder) replayRecorder.record('drop');
    // Trail effect at landing position
    if (equippedTrail !== 'none') {
      const shape = this.shape(this.current);
      let minC = 10, maxC = 0, maxR = 0;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (shape[r][c] !== '.') { minC = Math.min(minC, c); maxC = Math.max(maxC, c); maxR = Math.max(maxR, r); }
      }
      const bx = (this.current.x + minC) * CELL;
      const by = (this.current.y + maxR + 1) * CELL;
      const cols = maxC - minC + 1;
      spawnTrailEffect(bx, by, cols);
    }
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

    // Sound effects, floating text, screen shake, achievements, stats
    if (tSpin && cleared > 0) {
      sound.playTSpin();
      const tSpinLabel = ['', 'SINGLE', 'DOUBLE', 'TRIPLE'][cleared] || '';
      addFloatingText('T-SPIN ' + tSpinLabel, '#dc3cff', 20);
      checkEventAchievement('tspin');
      trackGameEvent('tspin');
      triggerScreenShake(6, 300);
    }
    if (cleared === 4) {
      sound.playTetris();
      addFloatingText('+' + ((base + comboBonus) * this.level) + ' TETRIS!', '#ffd650', 24);
      checkEventAchievement('tetris');
      trackGameEvent('tetris');
      triggerScreenShake(8, 400);
    } else if (cleared > 0 && !(tSpin && cleared > 0)) {
      sound.playLineClear(cleared);
      addFloatingText('+' + ((base + comboBonus) * this.level), '#06ffa5', 16);
      if (cleared >= 2) triggerScreenShake(3, 200);
    }
    if (this.combo > 0) {
      sound.playCombo(this.combo + 1);
      addFloatingText('COMBO x' + (this.combo + 1), '#00d9ff', 14);
      checkEventAchievement('combo', this.combo + 1);
      trackGameEvent('combo', this.combo + 1);
    }
    if (b2bEligible && this.backToBack && this.backToBackCount > 0) {
      sound.playB2B();
      addFloatingText('BACK-TO-BACK!', '#ff006e', 14);
      checkEventAchievement('b2b', this.backToBackCount);
      trackGameEvent('b2b');
    }
    if (perfectClear) {
      sound.playPerfectClear();
      addFloatingText('PERFECT CLEAR!', '#ffd650', 28);
      checkEventAchievement('perfect_clear');
      trackGameEvent('perfect_clear');
      triggerScreenShake(12, 500);
    }
    // Level-up check
    const prevLevel = 1 + Math.floor((this.lines - cleared) / 10);
    if (this.level > prevLevel) {
      sound.playLevelUp();
      addFloatingText('LEVEL ' + this.level, '#06ffa5', 16);
      checkEventAchievement('level', this.level);
    }

    this.spawn(this.next);
    this.next = this.makePiece(this.nextKind());
  }

  addGarbage(n) {
    const adjustedN = Math.max(1, Math.round(n * (roomSettings.garbageMultiplier || 1)));
    for (let i = 0; i < adjustedN; i++) {
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
    
    // Check survival achievement
    checkEventAchievement('survive', this.elapsedMs);
    
    // Speed calculation with both level and time-based progression
    const timeDifficulty = Math.floor(this.elapsedMs / 60000);
    const totalLevel = this.level + timeDifficulty;
    const speedMult = roomSettings.speedMultiplier || 1;
    
    const speed = this.softDrop ? 200 : Math.max(80, (700 - (totalLevel - 1) * 45) / speedMult);
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
      next: this.next ? {
        kind: this.next.kind,
        rotation: this.next.rotation
      } : null
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

// Auth page elements
const authPage = document.getElementById('authPage');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const signupUsername = document.getElementById('signupUsername');
const signupPassword = document.getElementById('signupPassword');
const signupConfirm = document.getElementById('signupConfirm');
const btnLogin = document.getElementById('btnLogin');
const btnSignup = document.getElementById('btnSignup');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const userBarName = document.getElementById('userBarName');
const userBarCoins = document.getElementById('userBarCoins');
const btnLogout = document.getElementById('btnLogout');
const finalPlayerName = document.getElementById('finalPlayerName');

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

// New feature DOM elements
const cardAI = document.getElementById('cardAI');
const cardStats = document.getElementById('cardStats');
const cardAchievements = document.getElementById('cardAchievements');
const cardReplays = document.getElementById('cardReplays');
const statsPage = document.getElementById('statsPage');
const achievementsPage = document.getElementById('achievementsPage');
const replaysPage = document.getElementById('replaysPage');
const aiSetupPage = document.getElementById('aiSetupPage');
const aiDiffSlider = document.getElementById('aiDiffSlider');
const aiDiffLabel = document.getElementById('aiDiffLabel');
const btnStartAI = document.getElementById('btnStartAI');
const btnBackFromAI = document.getElementById('btnBackFromAI');
const btnBackFromStats = document.getElementById('btnBackFromStats');
const btnBackFromAchievements = document.getElementById('btnBackFromAchievements');
const btnBackFromReplays = document.getElementById('btnBackFromReplays');
const btnClearStats = document.getElementById('btnClearStats');
const btnClearAchievements = document.getElementById('btnClearAchievements');
const btnSaveReplay = document.getElementById('btnSaveReplay');
const btnExportReplay = document.getElementById('btnExportReplay');
const btnImportReplay = document.getElementById('btnImportReplay');
const statsContent = document.getElementById('statsContent');
const achievementsList = document.getElementById('achievementsList');
const replaysList = document.getElementById('replaysList');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const volumeSlider = document.getElementById('volumeSlider');
// Room settings elements
const roomStartLevel = document.getElementById('roomStartLevel');
const roomGarbageMult = document.getElementById('roomGarbageMult');
const roomSpeedMult = document.getElementById('roomSpeedMult');
const roomSettingsPanel = document.getElementById('roomSettingsPanel');
// Replay playback controls
const replayControlsBar = document.getElementById('replayControlsBar');
const replayPauseBtn = document.getElementById('replayPauseBtn');
const replaySpeedBtn = document.getElementById('replaySpeedBtn');
const replaySkipBtn = document.getElementById('replaySkipBtn');
const replayMenuBtn = document.getElementById('replayMenuBtn');
const replayProgressText = document.getElementById('replayProgressText');
const replayProgressFill = document.getElementById('replayProgressFill');

// New feature page elements
const cardRanked = document.getElementById('cardRanked');
const cardShop = document.getElementById('cardShop');
const cardSettings = document.getElementById('cardSettings');
const cardProfile = document.getElementById('cardProfile');
const settingsPage = document.getElementById('settingsPage');
const shopPage = document.getElementById('shopPage');
const rankedPage = document.getElementById('rankedPage');
const profilePage = document.getElementById('profilePage');
const keybindsList = document.getElementById('keybindsList');
const shopGrid = document.getElementById('shopGrid');
const controlsDisplay = document.getElementById('controlsDisplay');
const touchControls = document.getElementById('touchControls');

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
  const boardTheme = BOARD_THEMES[equippedBoard] || BOARD_THEMES.default;
  const layer = document.createElement('canvas');
  layer.width = BOARD_W;
  layer.height = BOARD_H;
  const ctx = layer.getContext('2d');
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  // Board theme background overlay
  if (boardTheme.bgOverlay) {
    ctx.fillStyle = boardTheme.bgOverlay;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  }
  if (!boardTheme.noGrid) {
    ctx.strokeStyle = boardTheme.borderColor || theme.grid;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * CELL, r * CELL, CELL, CELL);
      }
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

  // Switch soundtrack to match this theme
  sound.switchThemeMusic();

  // Reinitialize background particles for new theme
  initBgParticles();
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
  const myName = getCurrentPlayerName();
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
      boards[i].style.display = '';
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
  if (mode !== 'classic' && mode !== 'online' && mode !== 'ai') return;
  if (game && game.gameOver) return;
  isPaused = !isPaused;
  if (isPaused) {
    pauseMenu.classList.add('active');
    setStatus('Game Paused');
    sound.pauseMusic();
  } else {
    pauseMenu.classList.remove('active');
    setStatus('Resumed');
    sound.resumeMusic();
  }
}

function resumeGame() {
  isPaused = false;
  pauseMenu.classList.remove('active');
  setStatus('Game Resumed');
  sound.resumeMusic();
}

function backToMenuFromGame() {
  isPaused = false;
  pauseMenu.classList.remove('active');
  if (ws) { ws.close(); ws = null; }
  mode = 'classic';
  isSpectator = false;
  game.gameOver = true;
  sound.stopMusic();
  replayPlayer = null;
  aiOpponent = null;
  aiGame = null;
  if (replayControlsBar) replayControlsBar.style.display = 'none';
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
  if (finalPlayerName) finalPlayerName.textContent = getCurrentPlayerName();
  finalScore.textContent = game.score.toLocaleString();
  finalLines.textContent = game.lines;
  finalTime.textContent = game.getElapsedTimeFormatted();
  if (btnSaveReplay) { btnSaveReplay.textContent = '💾 Save Replay'; btnSaveReplay.disabled = false; }
  // Earn coins based on performance
  const coinsEarned = earnGameCoins(game, false);
  const coinEl = document.getElementById('gameOverCoins');
  if (!coinEl) {
    const ce = document.createElement('div');
    ce.id = 'gameOverCoins';
    ce.style.cssText = 'color:#ffd54f;font-size:0.9rem;margin-top:6px;';
    ce.textContent = `🪙 +${coinsEarned} coins earned`;
    const timeEl = finalTime.parentElement;
    if (timeEl) timeEl.parentElement.appendChild(ce);
  } else {
    coinEl.textContent = `🪙 +${coinsEarned} coins earned`;
  }
  updateCoinDisplays();
  scheduleSyncProfile();
  setStatus('Game Over');
}

function showWinScreen() {
  // Reuse the game over overlay but style it as a victory
  const content = document.querySelector('.gameOverContent');
  const heading = content ? content.querySelector('h2') : null;
  if (heading) heading.textContent = '🏆 YOU WIN!';
  if (content) {
    content.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(131, 56, 236, 0.25))';
    content.style.borderColor = 'var(--color-accent-cyan)';
    content.style.boxShadow = '0 0 40px rgba(0, 217, 255, 0.4), inset 0 0 20px rgba(0, 217, 255, 0.1)';
  }
  gameOverMenu.classList.add('active');
  if (finalPlayerName) finalPlayerName.textContent = getCurrentPlayerName();
  finalScore.textContent = game.score.toLocaleString();
  finalLines.textContent = game.lines;
  finalTime.textContent = game.getElapsedTimeFormatted();
  if (btnSaveReplay) { btnSaveReplay.textContent = '💾 Save Replay'; btnSaveReplay.disabled = false; }
  // Earn bonus coins for winning
  const coinsEarned = earnGameCoins(game, true);
  const coinEl = document.getElementById('gameOverCoins');
  if (!coinEl) {
    const ce = document.createElement('div');
    ce.id = 'gameOverCoins';
    ce.style.cssText = 'color:#ffd54f;font-size:0.9rem;margin-top:6px;';
    ce.textContent = `🪙 +${coinsEarned} coins earned (WIN bonus!)`;
    const timeEl = finalTime.parentElement;
    if (timeEl) timeEl.parentElement.appendChild(ce);
  } else {
    coinEl.textContent = `🪙 +${coinsEarned} coins earned (WIN bonus!)`;
  }
  updateCoinDisplays();
  scheduleSyncProfile();
  sound.playAchievement();
  setStatus('🏆 You Win!');
}

function resetGameOverOverlayStyle() {
  const content = document.querySelector('.gameOverContent');
  const heading = content ? content.querySelector('h2') : null;
  if (heading) heading.textContent = 'GAME OVER';
  if (content) {
    content.style.background = '';
    content.style.borderColor = '';
    content.style.boxShadow = '';
  }
}

function hideGameOver() {
  gameOverMenu.classList.remove('active');
  resetGameOverOverlayStyle();
}

function playAgain() {
  hideGameOver();
  if (mode === 'classic') {
    startClassic();
  } else if (mode === 'online') {
    startOnline();
  } else if (mode === 'ai') {
    startAIMode();
  }
}

function gameOverBackToMenu() {
  hideGameOver();
  if (ws) { ws.close(); ws = null; }
  mode = 'classic';
  isSpectator = false;
  game.gameOver = true;
  sound.stopMusic();
  replayPlayer = null;
  aiOpponent = null;
  aiGame = null;
  if (replayControlsBar) replayControlsBar.style.display = 'none';
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
  replayRecorder = new ReplayRecorder(game.seed);
  floatingTexts = [];
  aiOpponent = null;
  aiGame = null;
  replayPlayer = null;
  if (ws) { ws.close(); ws = null; }
  updatePlayerCount(1);
  menu.classList.remove('active');
  leaderboardPage.classList.remove('active');
  welcomePage.classList.remove('active');
  gameOverMenu.classList.remove('active');
  if (statsPage) statsPage.classList.remove('active');
  if (achievementsPage) achievementsPage.classList.remove('active');
  if (replaysPage) replaysPage.classList.remove('active');
  if (aiSetupPage) aiSetupPage.classList.remove('active');
  if (settingsPage) settingsPage.classList.remove('active');
  if (shopPage) shopPage.classList.remove('active');
  if (rankedPage) rankedPage.classList.remove('active');
  if (profilePage) profilePage.classList.remove('active');
  gameContainer.style.display = 'flex';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (pieceStatsPanel) pieceStatsPanel.style.display = '';
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  sound.init();
  sound.startMusic();
  initBgParticles();
  updateCoinDisplays();
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
  const name = getCurrentPlayerName();

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
      // Apply room settings from server
      if (msg.settings) {
        roomSettings = { startLevel: msg.settings.startLevel || 1, garbageMultiplier: msg.settings.garbageMultiplier || 1, speedMultiplier: msg.settings.speedMultiplier || 1 };
      }
      game = new Game(seed);
      if (roomSettings.startLevel > 1) { game.level = roomSettings.startLevel; game.lines = (roomSettings.startLevel - 1) * 10; }
      sentGameOver = false;
      onlineReady = true;
      playerSlot = Number(msg.you || 0);
      replayRecorder = new ReplayRecorder(seed);
      floatingTexts = [];
      sound.init();
      sound.startMusic();
      
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
        if (amt > 0) { game.addGarbage(amt); sound.playGarbage(); triggerScreenShake(4, 200); }
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
  const color = COLORS[v] || '#fff';
  const px = x * CELL + 1;
  const py = y * CELL + 1;
  const sz = CELL - 2;

  switch (equippedSkin) {
    case 'rounded':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px, py, sz, sz, 4);
      ctx.fill();
      break;
    case 'pixelated': {
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      const ps = sz / 3;
      for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) {
        ctx.fillRect(px + gx * ps + ps - 0.5, py + gy * ps, 0.5, ps);
        ctx.fillRect(px + gx * ps, py + gy * ps + ps - 0.5, ps, 0.5);
      }
      break;
    }
    case 'glowing':
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      ctx.shadowBlur = 0;
      break;
    case 'gradient': {
      const grad = ctx.createLinearGradient(px, py, px + sz, py + sz);
      grad.addColorStop(0, color);
      grad.addColorStop(1, shadeColor(color, -40));
      ctx.fillStyle = grad;
      ctx.fillRect(px, py, sz, sz);
      break;
    }
    case 'glass':
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(px, py, sz, sz);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(px + 1, py + 1, sz - 2, sz / 3);
      break;
    case 'metallic': {
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      const mg = ctx.createLinearGradient(px, py, px, py + sz);
      mg.addColorStop(0, 'rgba(255,255,255,0.35)');
      mg.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      mg.addColorStop(1, 'rgba(0,0,0,0.2)');
      ctx.fillStyle = mg;
      ctx.fillRect(px, py, sz, sz);
      break;
    }
    case 'rainbow': {
      const hue = ((x * 37 + y * 53 + performance.now() / 20) % 360);
      ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
      ctx.fillRect(px, py, sz, sz);
      break;
    }
    case 'dotted': {
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      const dotR = sz * 0.15;
      ctx.beginPath();
      ctx.arc(px + sz * 0.3, py + sz * 0.3, dotR, 0, Math.PI * 2);
      ctx.arc(px + sz * 0.7, py + sz * 0.7, dotR, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'outline':
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, sz - 2, sz - 2);
      ctx.lineWidth = 1;
      break;
    case 'candy': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(px, py, sz, sz, 6);
      ctx.fill();
      // Swirl highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px + sz / 2, py + sz / 2, sz * 0.25, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.lineWidth = 1;
      // Shine dot
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(px + sz * 0.3, py + sz * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'ember': {
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      // Hot gradient overlay
      const eg = ctx.createRadialGradient(px + sz / 2, py + sz / 2, 0, px + sz / 2, py + sz / 2, sz);
      eg.addColorStop(0, 'rgba(255,200,0,0.3)');
      eg.addColorStop(0.6, 'rgba(255,80,0,0.15)');
      eg.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = eg;
      ctx.fillRect(px, py, sz, sz);
      break;
    }
    case 'ice': {
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
      // Frost overlay
      ctx.fillStyle = 'rgba(180,230,255,0.25)';
      ctx.fillRect(px, py, sz, sz * 0.4);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(px + 2, py + 2, 3, 3);
      ctx.fillRect(px + sz - 5, py + sz * 0.5, 2, 4);
      break;
    }
    case 'galaxy': {
      const hue2 = ((x * 47 + y * 31 + performance.now() / 30) % 360);
      const gg = ctx.createRadialGradient(px + sz / 2, py + sz / 2, 0, px + sz / 2, py + sz / 2, sz);
      gg.addColorStop(0, `hsl(${hue2}, 90%, 70%)`);
      gg.addColorStop(0.5, color);
      gg.addColorStop(1, `hsl(${(hue2 + 120) % 360}, 70%, 20%)`);
      ctx.fillStyle = gg;
      ctx.fillRect(px, py, sz, sz);
      // Tiny stars
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(px + sz * 0.2, py + sz * 0.2, 1, 1);
      ctx.fillRect(px + sz * 0.7, py + sz * 0.6, 1, 1);
      break;
    }
    case 'gold': {
      const goldGrad = ctx.createLinearGradient(px, py, px + sz, py + sz);
      goldGrad.addColorStop(0, '#ffd700');
      goldGrad.addColorStop(0.3, '#fff8b0');
      goldGrad.addColorStop(0.5, '#ffd700');
      goldGrad.addColorStop(0.7, '#b8860b');
      goldGrad.addColorStop(1, '#ffd700');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(px, py, sz, sz);
      // Sheen
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(px + 1, py + 1, sz - 2, sz * 0.3);
      break;
    }
    default: // flat
      ctx.fillStyle = color;
      ctx.fillRect(px, py, sz, sz);
  }
}

// ==================== TRAIL EFFECT RENDERING ====================
let trailParticles = [];
function spawnTrailEffect(boardX, boardY, cols) {
  const effect = equippedTrail;
  if (effect === 'none') return;
  const cx = boardX + cols * CELL / 2;
  const cy = boardY;
  const count = effect === 'shockwave' ? 1 : (effect === 'confetti' ? 20 : 12);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 2;
    const p = {
      x: cx + (Math.random() - 0.5) * cols * CELL,
      y: cy + Math.random() * 4,
      vx: Math.cos(angle) * speed * (effect === 'shockwave' ? 0 : 1),
      vy: -Math.random() * 2 - 0.5,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 0.6 + Math.random() * 0.4,
      size: 2 + Math.random() * 3,
      effect: effect,
      hue: Math.random() * 360,
      radius: 0,
    };
    if (effect === 'shockwave') { p.x = cx; p.y = cy; p.radius = 2; p.maxRadius = cols * CELL * 0.6; }
    trailParticles.push(p);
  }
}
function updateTrailParticles(dt) {
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const p = trailParticles[i];
    p.life -= dt;
    if (p.life <= 0) { trailParticles.splice(i, 1); continue; }
    p.x += p.vx;
    p.y += p.vy;
    if (p.effect === 'flame' || p.effect === 'ember') p.vy -= 0.05;
    if (p.effect === 'ice_trail') p.vy += 0.02;
    if (p.effect === 'shockwave') p.radius += (p.maxRadius - p.radius) * 0.1;
  }
}
function drawTrailParticles(ctx) {
  for (const p of trailParticles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    switch (p.effect) {
      case 'spark':
        ctx.fillStyle = `rgba(255,220,100,${alpha})`;
        ctx.fillRect(p.x, p.y, p.size * 0.8, p.size * 0.8);
        break;
      case 'flame':
        ctx.fillStyle = `rgba(255,${Math.floor(80 + 100 * alpha)},0,${alpha * 0.9})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
        break;
      case 'ice_trail':
        ctx.fillStyle = `rgba(150,220,255,${alpha * 0.8})`;
        ctx.fillRect(p.x - 1, p.y - 1, p.size * 0.6, p.size * 0.6);
        break;
      case 'confetti':
        ctx.fillStyle = `hsla(${p.hue},90%,60%,${alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.5);
        break;
      case 'lightning':
        ctx.strokeStyle = `rgba(180,200,255,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + (Math.random() - 0.5) * 8, p.y - 6 * alpha); ctx.stroke();
        ctx.lineWidth = 1;
        break;
      case 'stardust':
        ctx.fillStyle = `rgba(255,255,200,${alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
        ctx.fillRect(p.x - 0.5, p.y - p.size, 1, p.size * 2);
        ctx.fillRect(p.x - p.size, p.y - 0.5, p.size * 2, 1);
        break;
      case 'toxic':
        ctx.fillStyle = `rgba(0,255,60,${alpha * 0.7})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2); ctx.fill();
        break;
      case 'shockwave':
        ctx.strokeStyle = `rgba(0,200,255,${alpha * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 1;
        break;
    }
  }
}

function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
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
        sound.playGameOver();
        sound.stopMusic();
        updateStatsOnGameEnd(game);
      }
    }
  } else if (!isPaused && mode === 'classic') {
    updateParticles(dt);
    if (game.gameOver && !sentGameOver) {
      sentGameOver = true;
      sound.playGameOver();
      sound.stopMusic();
      updateStatsOnGameEnd(game);
      const playerName = getCurrentPlayerName();
      const gameTime = game.getElapsedTimeFormatted();
      saveLeaderboard({
        name: playerName,
        score: game.score,
        lines: game.lines,
        level: game.level || 1,
        time: gameTime,
        timestamp: Date.now()
      });
    }
  } else if (!isPaused && mode === 'ai') {
    // AI mode update
    game.update(dt);
    updateParticles(dt);
    if (aiOpponent && aiGame && !aiGame.gameOver) {
      aiGame.update(dt);
      aiOpponent.update(dt);
    }
    // Send attacks to opponent in ranked vs player
    if (isRankedVsPlayer && rankedWs && rankedWs.readyState === WebSocket.OPEN) {
      if (game.lastAttack > 0) {
        rankedWs.send(JSON.stringify({ type: 'ranked_attack', lines: game.lastAttack }));
      }
    }
    if (game.gameOver && !sentGameOver) {
      sentGameOver = true;
      sound.playGameOver();
      sound.stopMusic();
      updateStatsOnGameEnd(game);
      // Notify opponent we lost
      if (isRankedVsPlayer && rankedWs && rankedWs.readyState === WebSocket.OPEN) {
        rankedWs.send(JSON.stringify({ type: 'ranked_snapshot', grid: game.grid, score: game.score, lines: game.lines, game_over: true }));
      }
    }
  } else if (mode === 'replay') {
    // Replay playback (not affected by isPaused — uses its own pause)
    if (replayPlayer && !replayPlayer.finished) {
      replayPlayer.update(dt);
      updateReplayControls();
    } else if (replayPlayer && replayPlayer.finished) {
      updateReplayControls();
    }
    updateParticles(dt);
  } else if (!isPaused) {
    updateParticles(dt);
  }

  // Update floating texts and screen shake
  updateFloatingTexts(dt);
  updateBgParticles(dt);
  updateTrailParticles(dt);
  drawBgParticles();

  // Apply screen shake to main canvas
  bctx.save();
  bctx.translate(screenShake.x, screenShake.y);

  // Determine which game to render (replay mode uses replayPlayer.game)
  const renderGame = mode === 'replay' && replayPlayer ? replayPlayer.game : game;

  drawGrid(bctx, renderGame.grid);
  if (!renderGame.gameOver) drawPiece(bctx, renderGame.current);
  drawParticles(bctx);
  drawTrailParticles(bctx);
  drawFloatingTexts(bctx);
  bctx.restore();
  
  // Draw next piece for player
  drawNextPiece(nextCtx, renderGame.next, nextCanvas.width, nextCanvas.height);

  if (mode === 'online') {
    for (let i = 0; i < 3; i++) {
      drawGrid(octxes[i], opponents[i].grid);
      if (opponents[i].piece) drawOpponentPiece(octxes[i], opponents[i].piece);
      if (opponents[i].next && i < nextCtxes.length - 1) {
        const nextPreviewSize = (i === 0) ? nextCanvas.width : next2Canvas.width;
        drawNextPiece(nextCtxes[i + 1], opponents[i].next, nextPreviewSize, nextPreviewSize);
      }
    }
  } else if (mode === 'ai' && aiGame) {
    drawGrid(octxes[0], aiGame.grid);
    if (!aiGame.gameOver) drawPiece(octxes[0], aiGame.current);
    drawNextPiece(nextCtxes[1], aiGame.next, next2Canvas.width, next2Canvas.height);
    oppScoreEls[0].textContent = aiGame.score;
    oppLinesEls[0].textContent = aiGame.lines;
    oppStatusEls[0].textContent = aiGame.gameOver ? 'Topped Out' : 'Playing';
    for (let i = 1; i < 3; i++) drawGrid(octxes[i], blankGrid);
  } else if (mode === 'ai' && isRankedVsPlayer) {
    // Ranked vs Player — draw opponent board from WebSocket data
    drawGrid(octxes[0], opponents[0].grid);
    if (opponents[0].piece) drawOpponentPiece(octxes[0], opponents[0].piece);
    if (opponents[0].next) drawNextPiece(nextCtxes[1], opponents[0].next, next2Canvas.width, next2Canvas.height);
    oppScoreEls[0].textContent = opponents[0].score;
    oppLinesEls[0].textContent = opponents[0].lines;
    oppStatusEls[0].textContent = opponents[0].game_over ? 'Topped Out' : 'Playing';
    for (let i = 1; i < 3; i++) drawGrid(octxes[i], blankGrid);
    // Send our snapshot to opponent
    rankedSnapshotTimer += dt;
    if (rankedWs && rankedWs.readyState === WebSocket.OPEN && rankedSnapshotTimer > 100) {
      rankedSnapshotTimer = 0;
      rankedWs.send(JSON.stringify({
        type: 'ranked_snapshot',
        grid: game.grid,
        score: game.score,
        lines: game.lines,
        game_over: game.gameOver,
        piece: game.current ? { kind: game.current.kind, rotation: game.current.rotation, x: game.current.x, y: game.current.y } : null,
        next: game.next ? { kind: game.next.kind, rotation: 0 } : null
      }));
    }
  } else {
    for (let i = 0; i < 3; i++) drawGrid(octxes[i], blankGrid);
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

  if (game.gameOver || (mode === 'replay' && replayPlayer && replayPlayer.finished)) {
    if (!shownGameOver) {
      shownGameOver = true;
      if (mode === 'replay') {
        setStatus('Replay finished');
      } else {
        setStatus(mode === 'online' ? 'Game over (you topped out)' : 'Game over');
        showGameOver();
      }
      // Handle ranked match results
      if (mode === 'ai' && isRankedMatch) {
        const playerWon = !game.gameOver || (aiGame && aiGame.gameOver);
        handleRankedGameOver(playerWon);
      }
    }
    if (mode === 'online') {
      checkWinner(); // Check if you won or if it's a draw
    }
  }
  // Check if AI lost (ranked or casual)
  if (mode === 'ai' && aiGame && aiGame.gameOver && !game.gameOver && !shownGameOver) {
    shownGameOver = true;
    game.gameOver = true; // Stop the player's game — they won
    sound.stopMusic();
    if (isRankedMatch && !isRankedVsPlayer) {
      handleRankedGameOver(true);
    }
    showWinScreen();
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
    if ((mode === 'classic' || mode === 'online' || mode === 'ai') && !game.gameOver) {
      togglePause();
    }
    return;
  }
  
  const allBound = getAllBoundKeys();
  if (allBound.has(e.key) || e.key === ' ') e.preventDefault();
  if (game.gameOver) return;
  if (mode === 'online' && !onlineReady) return;
  if (mode === 'replay') {
    // Replay-specific keyboard shortcuts
    if (e.key === ' ') { e.preventDefault(); toggleReplayPause(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); cycleReplaySpeed(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); /* reverse speed not supported, just ignore */ }
    else if (e.key === 'End') { e.preventDefault(); skipReplay(); }
    return;
  }
  if (isPaused) return;

  const action = getActionForKey(e.key);
  if (action === 'moveLeft') game.move(-1, 0);
  else if (action === 'moveRight') game.move(1, 0);
  else if (action === 'rotate') game.rotateCurrent();
  else if (action === 'hardDrop') game.hardDrop();
  else if (action === 'softDrop') { game.softDrop = true; if (replayRecorder) replayRecorder.record('softOn'); }
});

window.addEventListener('keyup', (e) => {
  if (e.key === keybinds.softDrop) { game.softDrop = false; if (replayRecorder) replayRecorder.record('softOff'); }
});

// ==================== AUTH / LOGIN SYSTEM ====================
let authToken = localStorage.getItem('tetrisAuthToken') || '';
let authUsername = localStorage.getItem('tetrisAuthUser') || '';

function getPlayerName() {
  return authUsername || '';
}

function getCurrentPlayerName() {
  return authUsername || 'Player';
}

function isLoggedIn() {
  return !!(authToken && authUsername);
}

// Sync local profile data to server
async function syncProfileToServer() {
  if (!authToken) return;
  try {
    const profile = {
      coins: loadCoins(),
      ownedSkins: ownedSkins,
      equippedSkin: equippedSkin,
      ownedBoards: ownedBoards,
      equippedBoard: equippedBoard,
      ownedTrails: ownedTrails,
      equippedTrail: equippedTrail,
      ownedTitles: ownedTitles,
      equippedTitle: equippedTitle,
      ownedAvatars: ownedAvatars,
      equippedAvatar: equippedAvatar,
      stats: loadStats(),
      ranked: loadRankedData(),
      achievements: loadAchievements(),
      keybinds: keybinds
    };
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + authToken },
      body: JSON.stringify({ profile })
    });
  } catch (e) { console.warn('Profile sync failed:', e); }
}

// Load profile from server into localStorage
function loadProfileFromServer(profile) {
  if (!profile) return;
  if (typeof profile.coins === 'number') saveCoins(profile.coins);
  if (Array.isArray(profile.ownedSkins)) { ownedSkins = profile.ownedSkins; saveOwnedSkins(ownedSkins); }
  if (profile.equippedSkin) { equippedSkin = profile.equippedSkin; saveEquippedSkin(equippedSkin); }
  if (Array.isArray(profile.ownedBoards)) { ownedBoards = profile.ownedBoards; saveOwned('tetrisOwnedBoards', ownedBoards); }
  if (profile.equippedBoard) { equippedBoard = profile.equippedBoard; saveEquipped('tetrisEquippedBoard', equippedBoard); }
  if (Array.isArray(profile.ownedTrails)) { ownedTrails = profile.ownedTrails; saveOwned('tetrisOwnedTrails', ownedTrails); }
  if (profile.equippedTrail) { equippedTrail = profile.equippedTrail; saveEquipped('tetrisEquippedTrail', equippedTrail); }
  if (Array.isArray(profile.ownedTitles)) { ownedTitles = profile.ownedTitles; saveOwned('tetrisOwnedTitles', ownedTitles); }
  if (profile.equippedTitle) { equippedTitle = profile.equippedTitle; saveEquipped('tetrisEquippedTitle', equippedTitle); }
  if (Array.isArray(profile.ownedAvatars)) { ownedAvatars = profile.ownedAvatars; saveOwned('tetrisOwnedAvatars', ownedAvatars); }
  if (profile.equippedAvatar) { equippedAvatar = profile.equippedAvatar; saveEquipped('tetrisEquippedAvatar', equippedAvatar); }
  if (profile.stats) saveStats(profile.stats);
  if (profile.ranked) saveRankedData(profile.ranked);
  if (profile.achievements) localStorage.setItem('tetrisAchievements', JSON.stringify(profile.achievements));
  if (profile.keybinds) { keybinds = { ...DEFAULT_KEYBINDS, ...profile.keybinds }; saveKeybinds(keybinds); }
  updateCoinDisplays();
}

async function doLogin(username, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  authToken = data.token;
  authUsername = data.username;
  localStorage.setItem('tetrisAuthToken', authToken);
  localStorage.setItem('tetrisAuthUser', authUsername);
  loadProfileFromServer(data.profile);
  return data;
}

async function doSignup(username, password) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  authToken = data.token;
  authUsername = data.username;
  localStorage.setItem('tetrisAuthToken', authToken);
  localStorage.setItem('tetrisAuthUser', authUsername);
  loadProfileFromServer(data.profile);
  return data;
}

function doLogout() {
  authToken = '';
  authUsername = '';
  localStorage.removeItem('tetrisAuthToken');
  localStorage.removeItem('tetrisAuthUser');
  // Return to auth page
  welcomePage.classList.remove('active');
  if (authPage) authPage.classList.add('active');
}

function showWelcomeAfterAuth() {
  if (authPage) authPage.classList.remove('active');
  welcomePage.classList.add('active');
  // Update user bar
  if (userBarName) userBarName.textContent = authUsername;
  updateCoinDisplays();
}

// Debounced profile sync — called after game over, coin changes, etc.
let syncTimer = null;
function scheduleSyncProfile() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncProfileToServer(), 2000);
}

// Sync immediately before page unload so nothing is lost
window.addEventListener('beforeunload', () => {
  if (authToken) {
    const profile = {
      coins: loadCoins(),
      ownedSkins: ownedSkins,
      equippedSkin: equippedSkin,
      stats: loadStats(),
      ranked: loadRankedData(),
      achievements: loadAchievements(),
      keybinds: keybinds
    };
    // Use sendBeacon for reliable unload sync
    navigator.sendBeacon('/api/profile', new Blob([JSON.stringify({ profile, token: authToken })], { type: 'application/json' }));
  }
});

// Hook into existing save functions to trigger server sync
const _origAddCoins = addCoins;
const _origSpendCoins = spendCoins;
addCoins = function(amount) {
  const result = _origAddCoins(amount);
  if (userBarCoins) userBarCoins.textContent = loadCoins();
  scheduleSyncProfile();
  return result;
};
spendCoins = function(amount) {
  const result = _origSpendCoins(amount);
  if (userBarCoins) userBarCoins.textContent = loadCoins();
  scheduleSyncProfile();
  return result;
};

// Auth page tab switching + form handlers
if (tabLogin) tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active'); tabSignup.classList.remove('active');
  loginForm.style.display = ''; signupForm.style.display = 'none';
  if (loginError) loginError.textContent = '';
});
if (tabSignup) tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active'); tabLogin.classList.remove('active');
  signupForm.style.display = ''; loginForm.style.display = 'none';
  if (signupError) signupError.textContent = '';
});

if (btnLogin) btnLogin.addEventListener('click', async () => {
  if (loginError) loginError.textContent = '';
  const u = loginUsername ? loginUsername.value.trim() : '';
  const p = loginPassword ? loginPassword.value : '';
  if (!u || !p) { if (loginError) loginError.textContent = 'Fill in all fields'; return; }
  btnLogin.disabled = true; btnLogin.textContent = 'Logging in...';
  try {
    await doLogin(u, p);
    showWelcomeAfterAuth();
  } catch (e) {
    if (loginError) loginError.textContent = e.message;
  }
  btnLogin.disabled = false; btnLogin.textContent = 'Log In';
});

if (btnSignup) btnSignup.addEventListener('click', async () => {
  if (signupError) signupError.textContent = '';
  const u = signupUsername ? signupUsername.value.trim() : '';
  const p = signupPassword ? signupPassword.value : '';
  const c = signupConfirm ? signupConfirm.value : '';
  if (!u || !p || !c) { if (signupError) signupError.textContent = 'Fill in all fields'; return; }
  if (p !== c) { if (signupError) signupError.textContent = 'Passwords do not match'; return; }
  if (p.length < 4) { if (signupError) signupError.textContent = 'Password must be at least 4 characters'; return; }
  if (u.length < 2) { if (signupError) signupError.textContent = 'Username must be at least 2 characters'; return; }
  btnSignup.disabled = true; btnSignup.textContent = 'Creating...';
  try {
    await doSignup(u, p);
    showWelcomeAfterAuth();
  } catch (e) {
    if (signupError) signupError.textContent = e.message;
  }
  btnSignup.disabled = false; btnSignup.textContent = 'Create Account';
});

if (btnLogout) btnLogout.addEventListener('click', doLogout);

// Enter key on auth fields
[loginUsername, loginPassword].forEach(el => {
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); btnLogin.click(); } });
});
[signupUsername, signupPassword, signupConfirm].forEach(el => {
  if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); btnSignup.click(); } });
});

// ==================== LEADERBOARD ====================
function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]');
  return scores;
}

function saveLeaderboard(entry) {
  let scores = loadLeaderboard();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 50);
  localStorage.setItem('tetrisLeaderboard', JSON.stringify(scores));
}

function displayLeaderboard() {
  leaderboardEntries.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--color-text-dim);">Loading...</div>';

  // Try server leaderboard first, fall back to local
  fetch('/api/leaderboard').then(r => r.json()).then(data => {
    if (data.leaderboard && data.leaderboard.length > 0) {
      leaderboardEntries.innerHTML = '';
      data.leaderboard.forEach((entry, idx) => {
        const div = document.createElement('div');
        div.className = 'leaderboardEntry clickable';
        if (idx === 0) div.classList.add('top1');
        else if (idx === 1) div.classList.add('top2');
        else if (idx === 2) div.classList.add('top3');
        const isYou = entry.name === authUsername;
        const avatarEmoji = (PLAYER_AVATARS[entry.avatar] || PLAYER_AVATARS.default).emoji;
        div.innerHTML = `
          <div class="rankCol">${idx + 1}</div>
          <div class="avatarCol">${avatarEmoji}</div>
          <div class="nameCol"${isYou ? ' style="color:var(--color-accent-cyan);font-weight:bold;"' : ''}>${entry.name}${isYou ? ' (You)' : ''}</div>
          <div class="scoreCol">${entry.score.toLocaleString()}</div>
          <div class="linesCol">${entry.lines || '-'}</div>
          <div class="levelCol">ELO ${entry.elo || '-'}</div>
        `;
        // Click to view profile
        div.addEventListener('click', () => viewPlayerProfile(entry.name));
        leaderboardEntries.appendChild(div);
      });
    } else {
      showLocalLeaderboard();
    }
  }).catch(() => showLocalLeaderboard());

  function showLocalLeaderboard() {
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
        <div class="avatarCol">👤</div>
        <div class="nameCol">${entry.name || 'Anonymous'}</div>
        <div class="scoreCol">${entry.score.toLocaleString()}</div>
        <div class="linesCol">${entry.lines}</div>
        <div class="levelCol">${entry.level || '-'}</div>
      `;
      leaderboardEntries.appendChild(div);
    });
  }
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

// ==================== VIEW OTHER PLAYER PROFILE ====================
async function viewPlayerProfile(username) {
  // If it's the current user, show own profile page
  if (username === authUsername) {
    leaderboardPage.classList.remove('active');
    showProfilePage();
    return;
  }
  
  // Fetch public profile from server
  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (!res.ok || !data.publicProfile) {
      showPlayerProfileModal(username, null);
      return;
    }
    showPlayerProfileModal(data.username, data.publicProfile);
  } catch (e) {
    showPlayerProfileModal(username, null);
  }
}

function showPlayerProfileModal(username, profile) {
  // Remove any existing modal
  const existing = document.getElementById('playerProfileModal');
  if (existing) existing.remove();
  
  const modal = document.createElement('div');
  modal.id = 'playerProfileModal';
  modal.className = 'playerProfileModal';
  
  if (!profile) {
    modal.innerHTML = `
      <div class="playerProfileCard">
        <h3>👤 ${username}</h3>
        <p style="color:var(--color-text-dim);text-align:center;">Profile data unavailable</p>
        <button class="btn btn-accent" onclick="document.getElementById('playerProfileModal').remove()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
    return;
  }

  const stats = profile.stats || {};
  const rd = profile.ranked || { elo: 1000, wins: 0, losses: 0, history: [] };
  const rank = getRankForElo(rd.elo);
  const achs = profile.achievements || {};
  const avatarEmoji = (PLAYER_AVATARS[profile.equippedAvatar] || PLAYER_AVATARS.default).emoji;
  const titleData = PLAYER_TITLES[profile.equippedTitle];
  const titleStr = (titleData && profile.equippedTitle !== 'none') ? `<div class="playerProfileTitle" style="color:${titleData.color};text-shadow:0 0 8px ${titleData.color};">${titleData.name}</div>` : '';

  const badgesHtml = ACHIEVEMENTS.map(a => {
    const earned = !!achs[a.id];
    return `<span class="profileBadge ${earned ? 'earned' : 'locked'}">${a.icon} ${a.name}</span>`;
  }).join('');

  const historyHtml = rd.history && rd.history.length > 0
    ? rd.history.slice(0, 10).map(m => {
        const date = new Date(m.date).toLocaleDateString();
        return `<div class="matchRow">
          <span class="matchResult ${m.result}">${m.result === 'win' ? 'W' : 'L'}</span>
          <span class="matchOpponent">vs ${m.opponent}</span>
          <span class="matchEloChange ${m.eloChange >= 0 ? 'positive' : 'negative'}">${m.eloChange >= 0 ? '+' : ''}${m.eloChange}</span>
          <span style="font-size:0.75rem;color:var(--color-text-dim);margin-left:8px;">${date}</span>
        </div>`;
      }).join('')
    : '<div style="text-align:center;color:var(--color-text-dim);padding:8px;">No matches yet</div>';

  modal.innerHTML = `
    <div class="playerProfileCard">
      <div class="profileHeader">
        <div class="profileAvatar" style="font-size:2.5rem;">${avatarEmoji}</div>
        <div class="profileNameSection">
          <h3>${username}</h3>
          ${titleStr}
          <span class="profileRank">${rank.icon} ${rank.name} (${rd.elo})</span>
        </div>
      </div>
      <div class="profileStats">
        ${[
          ['Games Played', stats.gamesPlayed || 0],
          ['Best Score', (stats.bestScore || 0).toLocaleString()],
          ['Total Lines', stats.totalLines || 0],
          ['Best Combo', stats.bestCombo || 0],
          ['Total Tetrises', stats.totalTetris || 0],
          ['Total T-Spins', stats.totalTSpins || 0],
          ['Ranked W/L', `${rd.wins}/${rd.losses}`],
        ].map(([l, v]) => `<div class="profileStatItem"><span class="profileStatValue">${v}</span><span class="profileStatLabel">${l}</span></div>`).join('')}
      </div>
      <h4 style="color:var(--color-accent-cyan);margin:12px 0 6px;">🏅 Badges</h4>
      <div class="profileBadges">${badgesHtml}</div>
      <h4 style="color:var(--color-accent-cyan);margin:12px 0 6px;">📜 Recent Matches</h4>
      <div class="matchHistory">${historyHtml}</div>
      <button class="btn btn-accent" style="width:100%;margin-top:12px;" onclick="document.getElementById('playerProfileModal').remove()">Close</button>
    </div>
  `;
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  document.body.appendChild(modal);
}

// ==================== AI MODE ====================
function startAIMode() {
  mode = 'ai';
  isPaused = false;
  shownGameOver = false;
  isSpectator = false;
  sentGameOver = false;
  modeEl.textContent = 'Mode: VS AI';
  const seed = Math.floor(Math.random() * 1_000_000);
  game = new Game(seed);
  aiGame = new Game(seed);
  aiOpponent = new TetrisAI(aiDifficulty);
  aiOpponent.setGame(aiGame);
  replayRecorder = new ReplayRecorder(seed);
  floatingTexts = [];
  
  updatePlayerCount(2);
  oppNameEls[0].textContent = 'AI (' + ['Easy', 'Medium', 'Hard', 'Expert'][Math.min(3, Math.floor(aiDifficulty * 4))] + ')';
  oppStatusEls[0].textContent = 'Playing';
  
  welcomePage.classList.remove('active');
  menu.classList.remove('active');
  leaderboardPage.classList.remove('active');
  gameOverMenu.classList.remove('active');
  aiSetupPage.classList.remove('active');
  if (settingsPage) settingsPage.classList.remove('active');
  if (shopPage) shopPage.classList.remove('active');
  if (rankedPage) rankedPage.classList.remove('active');
  if (profilePage) profilePage.classList.remove('active');
  gameContainer.style.display = 'flex';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (pieceStatsPanel) pieceStatsPanel.style.display = '';
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  
  sound.init();
  sound.startMusic();
  initBgParticles();
  updateCoinDisplays();
  lastTs = performance.now();
  requestAnimationFrame(loop);
  setStatus('VS AI - ' + ['Easy', 'Medium', 'Hard', 'Expert'][Math.min(3, Math.floor(aiDifficulty * 4))]);
}

// ==================== STATS DASHBOARD ====================
function showStatsPage() {
  welcomePage.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  if (statsPage) {
    statsPage.classList.add('active');
    displayStats();
  }
}
function displayStats() {
  if (!statsContent) return;
  const s = loadStats();
  const avgScore = s.gamesPlayed > 0 ? Math.round(s.totalScore / s.gamesPlayed) : 0;
  const totalMinutes = Math.floor(s.totalTime / 60000);
  const avgLines = s.gamesPlayed > 0 ? Math.round(s.totalLines / s.gamesPlayed) : 0;
  statsContent.innerHTML = `
    <div class="statRow"><span class="statLabel">Games Played</span><span class="statValue">${s.gamesPlayed}</span></div>
    <div class="statRow"><span class="statLabel">Total Score</span><span class="statValue">${s.totalScore.toLocaleString()}</span></div>
    <div class="statRow"><span class="statLabel">Best Score</span><span class="statValue">${s.bestScore.toLocaleString()}</span></div>
    <div class="statRow"><span class="statLabel">Average Score</span><span class="statValue">${avgScore.toLocaleString()}</span></div>
    <div class="statRow"><span class="statLabel">Total Lines</span><span class="statValue">${s.totalLines}</span></div>
    <div class="statRow"><span class="statLabel">Best Lines (1 game)</span><span class="statValue">${s.bestLines}</span></div>
    <div class="statRow"><span class="statLabel">Average Lines</span><span class="statValue">${avgLines}</span></div>
    <div class="statRow"><span class="statLabel">Best Combo</span><span class="statValue">${s.bestCombo}</span></div>
    <div class="statRow"><span class="statLabel">Total Tetris Clears</span><span class="statValue">${s.totalTetris}</span></div>
    <div class="statRow"><span class="statLabel">Total T-Spins</span><span class="statValue">${s.totalTSpins}</span></div>
    <div class="statRow"><span class="statLabel">Perfect Clears</span><span class="statValue">${s.totalPerfectClears}</span></div>
    <div class="statRow"><span class="statLabel">Back-to-Back Bonuses</span><span class="statValue">${s.totalB2B}</span></div>
    <div class="statRow"><span class="statLabel">Pieces Placed</span><span class="statValue">${s.piecesPlaced.toLocaleString()}</span></div>
    <div class="statRow"><span class="statLabel">Total Play Time</span><span class="statValue">${totalMinutes} min</span></div>
  `;
}

// ==================== ACHIEVEMENTS PAGE ====================
function showAchievementsPage() {
  welcomePage.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  if (achievementsPage) {
    achievementsPage.classList.add('active');
    displayAchievements();
  }
}
function displayAchievements() {
  if (!achievementsList) return;
  const unlocked = loadAchievements();
  const count = Object.keys(unlocked).length;
  achievementsList.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'achProgress';
  header.textContent = `${count} / ${ACHIEVEMENTS.length} Unlocked`;
  achievementsList.appendChild(header);
  for (const ach of ACHIEVEMENTS) {
    const div = document.createElement('div');
    div.className = 'achCard' + (unlocked[ach.id] ? ' unlocked' : ' locked');
    div.innerHTML = `<span class="achCardIcon">${ach.icon}</span><div class="achCardInfo"><span class="achCardName">${ach.name}</span><span class="achCardDesc">${ach.desc}</span></div>${unlocked[ach.id] ? '<span class="achUnlocked">✓</span>' : '<span class="achLocked">🔒</span>'}`;
    achievementsList.appendChild(div);
  }
}

// ==================== REPLAYS PAGE ====================
function showReplaysPage() {
  welcomePage.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  if (replaysPage) {
    replaysPage.classList.add('active');
    displayReplays();
  }
}
function displayReplays() {
  if (!replaysList) return;
  savedReplays = JSON.parse(localStorage.getItem('tetrisReplays') || '[]');
  replaysList.innerHTML = '';
  if (savedReplays.length === 0) {
    replaysList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--color-text-dim);">No replays saved yet. Complete a game to save a replay!</div>';
    return;
  }
  savedReplays.forEach((r, idx) => {
    const div = document.createElement('div');
    div.className = 'replayEntry';
    const date = new Date(r.date).toLocaleDateString();
    div.innerHTML = `<div class="replayInfo"><span class="replayName">${r.name || 'Replay ' + (idx + 1)}</span><span class="replayMeta">Score: ${r.score} | Lines: ${r.lines} | ${date}</span></div><div class="replayActions"><button class="btn replayPlayBtn" data-idx="${idx}">▶ Play</button><button class="btn replayDeleteBtn" data-idx="${idx}">✕</button></div>`;
    replaysList.appendChild(div);
  });
  // Attach event listeners
  replaysList.querySelectorAll('.replayPlayBtn').forEach(btn => {
    btn.addEventListener('click', () => startReplay(Number(btn.dataset.idx)));
  });
  replaysList.querySelectorAll('.replayDeleteBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      savedReplays.splice(Number(btn.dataset.idx), 1);
      localStorage.setItem('tetrisReplays', JSON.stringify(savedReplays));
      displayReplays();
    });
  });
}
function startReplay(idx) {
  const data = savedReplays[idx];
  if (!data) return;
  mode = 'replay';
  isPaused = false;
  shownGameOver = false;
  sentGameOver = true; // Don't trigger game over logic
  replayPlayer = new ReplayPlayer(data);
  game = replayPlayer.game;
  floatingTexts = [];
  
  updatePlayerCount(1);
  replaysPage.classList.remove('active');
  achievementsPage.classList.remove('active');
  statsPage.classList.remove('active');
  welcomePage.classList.remove('active');
  gameContainer.style.display = 'flex';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (replayControlsBar) replayControlsBar.style.display = 'flex';
  modeEl.textContent = 'Mode: Replay';
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'Replay: ' + (data.name || 'Untitled');
  updateReplayControls();
  
  lastTs = performance.now();
  requestAnimationFrame(loop);
  setStatus('Playing replay...');
}

function updateReplayControls() {
  if (!replayPlayer) return;
  if (replayPauseBtn) replayPauseBtn.textContent = replayPlayer.paused ? '▶' : '⏸';
  if (replaySpeedBtn) replaySpeedBtn.textContent = replayPlayer.speed + 'x';
  // Progress
  const totalTime = replayPlayer.data.inputs.length > 0 ? replayPlayer.data.inputs[replayPlayer.data.inputs.length - 1].t : 0;
  const pct = totalTime > 0 ? Math.min(100, (replayPlayer.elapsed / totalTime) * 100) : 0;
  if (replayProgressFill) replayProgressFill.style.width = pct + '%';
  const sec = Math.floor(replayPlayer.elapsed / 1000);
  const min = Math.floor(sec / 60);
  if (replayProgressText) replayProgressText.textContent = min + ':' + String(sec % 60).padStart(2, '0');
}

function toggleReplayPause() {
  if (!replayPlayer) return;
  replayPlayer.paused = !replayPlayer.paused;
  updateReplayControls();
  setStatus(replayPlayer.paused ? 'Replay paused' : 'Replay playing');
}

function cycleReplaySpeed() {
  if (!replayPlayer) return;
  const speeds = [1, 2, 4, 8];
  const idx = speeds.indexOf(replayPlayer.speed);
  replayPlayer.speed = speeds[(idx + 1) % speeds.length];
  updateReplayControls();
  setStatus('Replay speed: ' + replayPlayer.speed + 'x');
}

function skipReplay() {
  if (!replayPlayer) return;
  // Fast-forward: execute all remaining inputs instantly
  while (replayPlayer.inputIdx < replayPlayer.data.inputs.length) {
    const input = replayPlayer.data.inputs[replayPlayer.inputIdx];
    switch (input.a) {
      case 'left': replayPlayer.game.move(-1, 0); break;
      case 'right': replayPlayer.game.move(1, 0); break;
      case 'rotate': replayPlayer.game.rotateCurrent(); break;
      case 'drop': replayPlayer.game.hardDrop(); break;
      case 'softOn': replayPlayer.game.softDrop = true; break;
      case 'softOff': replayPlayer.game.softDrop = false; break;
    }
    replayPlayer.inputIdx++;
    // Run game update between inputs to process locks etc.
    if (replayPlayer.inputIdx < replayPlayer.data.inputs.length) {
      const nextT = replayPlayer.data.inputs[replayPlayer.inputIdx].t;
      const gap = nextT - replayPlayer.elapsed;
      if (gap > 0) replayPlayer.game.update(gap);
      replayPlayer.elapsed = nextT;
    }
  }
  replayPlayer.finished = true;
  updateReplayControls();
  setStatus('Replay finished');
}

function exitReplay() {
  mode = 'classic';
  replayPlayer = null;
  if (replayControlsBar) replayControlsBar.style.display = 'none';
  game.gameOver = true;
  gameContainer.style.display = 'none';
  welcomePage.classList.add('active');
  const p1Title = document.querySelector('#player1Board .playerTitle');
  if (p1Title) p1Title.textContent = 'You';
  setStatus('Ready');
}

// ==================== SOUND CONTROLS ====================
function updateSoundButtons() {
  if (soundToggleBtn) soundToggleBtn.textContent = sound.enabled ? '🔊 SFX: On' : '🔇 SFX: Off';
  if (musicToggleBtn) musicToggleBtn.textContent = sound.musicEnabled ? '🎵 Music: On' : '🎵 Music: Off';
  if (volumeSlider) volumeSlider.value = sound.volume * 100;
}

// Check if player is logged in
function ensurePlayerName() {
  return isLoggedIn();
}

// ==================== SETTINGS / KEYBINDS PAGE ====================
function displayKeybinds() {
  if (!keybindsList) return;
  keybindsList.innerHTML = '';
  for (const [action, key] of Object.entries(keybinds)) {
    const row = document.createElement('div');
    row.className = 'keybindRow';
    row.innerHTML = `<span class="keybindAction">${KEYBIND_LABELS[action]}</span><button class="keybindKey" data-action="${action}">${keyDisplayName(key)}</button>`;
    keybindsList.appendChild(row);
  }
  // Keybind click-to-rebind
  keybindsList.querySelectorAll('.keybindKey').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove any existing listeners
      keybindsList.querySelectorAll('.keybindKey').forEach(b => b.classList.remove('listening'));
      btn.classList.add('listening');
      btn.textContent = 'Press a key...';
      const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') { btn.textContent = keyDisplayName(keybinds[btn.dataset.action]); btn.classList.remove('listening'); window.removeEventListener('keydown', handler, true); return; }
        keybinds[btn.dataset.action] = e.key;
        saveKeybinds(keybinds);
        btn.textContent = keyDisplayName(e.key);
        btn.classList.remove('listening');
        window.removeEventListener('keydown', handler, true);
        updateControlsDisplay();
      };
      window.addEventListener('keydown', handler, true);
    });
  });
}

function updateControlsDisplay() {
  if (!controlsDisplay) return;
  controlsDisplay.textContent = `${keyDisplayName(keybinds.moveLeft)} / ${keyDisplayName(keybinds.moveRight)} Move  •  ${keyDisplayName(keybinds.rotate)} Rotate  •  ${keyDisplayName(keybinds.hardDrop)} Hard Drop  •  ${keyDisplayName(keybinds.softDrop)} Soft Drop`;
}

function showSettingsPage() {
  welcomePage.classList.remove('active');
  settingsPage.classList.add('active');
  displayKeybinds();
}

// ==================== SHOP PAGE ====================
function getShopCatalog(category) {
  switch(category) {
    case 'skins':   return { catalog: PIECE_SKINS,    owned: ownedSkins,   equipped: equippedSkin };
    case 'boards':  return { catalog: BOARD_THEMES,    owned: ownedBoards,  equipped: equippedBoard };
    case 'trails':  return { catalog: TRAIL_EFFECTS,   owned: ownedTrails,  equipped: equippedTrail };
    case 'titles':  return { catalog: PLAYER_TITLES,   owned: ownedTitles,  equipped: equippedTitle };
    case 'avatars': return { catalog: PLAYER_AVATARS,  owned: ownedAvatars, equipped: equippedAvatar };
    default:        return { catalog: PIECE_SKINS,     owned: ownedSkins,   equipped: equippedSkin };
  }
}

function drawShopPreview() {
  const pc = document.getElementById('shopPreviewCanvas');
  if (!pc) return;
  const ctx = pc.getContext('2d');
  ctx.clearRect(0, 0, pc.width, pc.height);

  // Use previewing item if set, otherwise fall back to equipped
  const { equipped } = getShopCatalog(currentShopTab);
  const previewId = previewingItem || equipped;

  if (currentShopTab === 'skins') {
    // Draw a 4x4 T-piece preview with the previewed skin
    const scale = 200 / (5 * CELL);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 5 * CELL, 5 * CELL);
    const shape = [['.','1','.'],['.','.','.'],['1','1','1'],['.','.','.']];
    const savedSkin = equippedSkin;
    equippedSkin = previewId;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      if (shape[r][c] !== '.') drawCell(ctx, c + 1, r + 0.5, shape[r][c]);
    }
    equippedSkin = savedSkin;
    ctx.restore();
  } else if (currentShopTab === 'boards') {
    const bTheme = BOARD_THEMES[previewId] || BOARD_THEMES.default;
    const theme = THEMES[currentThemeName];
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, 200, 200);
    if (bTheme.bgOverlay) { ctx.fillStyle = bTheme.bgOverlay; ctx.fillRect(0, 0, 200, 200); }
    if (!bTheme.noGrid) {
      ctx.strokeStyle = bTheme.borderColor || theme.grid;
      const cs = 20;
      for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) ctx.strokeRect(c * cs, r * cs, cs, cs);
    }
    const scale = 200 / (10 * CELL);
    ctx.save(); ctx.scale(scale, scale);
    drawCell(ctx, 2, 7, '1'); drawCell(ctx, 3, 7, '1'); drawCell(ctx, 4, 7, '1'); drawCell(ctx, 5, 7, '1');
    drawCell(ctx, 3, 6, '2'); drawCell(ctx, 4, 6, '2'); drawCell(ctx, 3, 5, '2'); drawCell(ctx, 4, 5, '2');
    ctx.restore();
  } else if (currentShopTab === 'trails') {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#666';
    ctx.font = '14px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText('Trail shows on hard drop', 100, 100);
    const effect = previewId;
    if (effect !== 'none') {
      const t = performance.now() / 1000;
      for (let i = 0; i < 8; i++) {
        const px = 60 + i * 12;
        const py = 120 + Math.sin(t * 3 + i) * 15;
        const alpha = 0.4 + 0.4 * Math.sin(t * 2 + i * 0.5);
        switch(effect) {
          case 'spark': ctx.fillStyle = `rgba(255,220,100,${alpha})`; break;
          case 'flame': ctx.fillStyle = `rgba(255,120,0,${alpha})`; break;
          case 'ice_trail': ctx.fillStyle = `rgba(150,220,255,${alpha})`; break;
          case 'confetti': ctx.fillStyle = `hsla(${i*45},90%,60%,${alpha})`; break;
          case 'lightning': ctx.fillStyle = `rgba(180,200,255,${alpha})`; break;
          case 'stardust': ctx.fillStyle = `rgba(255,255,200,${alpha})`; break;
          case 'toxic': ctx.fillStyle = `rgba(0,255,60,${alpha})`; break;
          case 'shockwave': ctx.fillStyle = `rgba(0,200,255,${alpha})`; break;
          default: ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        }
        ctx.beginPath(); ctx.arc(px, py, 3 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (currentShopTab === 'titles') {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 200, 200);
    const titleData = PLAYER_TITLES[previewId];
    if (titleData && previewId !== 'none') {
      ctx.font = 'bold 22px Consolas';
      ctx.textAlign = 'center';
      ctx.fillStyle = titleData.color;
      ctx.shadowColor = titleData.color;
      ctx.shadowBlur = 10;
      ctx.fillText(titleData.name, 100, 90);
      ctx.shadowBlur = 0;
      ctx.font = '14px Consolas';
      ctx.fillStyle = '#aaa';
      ctx.fillText(previewingItem ? 'Preview' : 'Your display title', 100, 120);
    } else {
      ctx.font = '14px Consolas';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('No title equipped', 100, 100);
    }
  } else if (currentShopTab === 'avatars') {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 200, 200);
    const avatarData = PLAYER_AVATARS[previewId];
    if (avatarData) {
      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(avatarData.emoji, 100, 90);
      ctx.font = '14px Consolas';
      ctx.fillStyle = '#aaa';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(previewingItem ? 'Preview: ' + avatarData.name : avatarData.name, 100, 140);
    }
  }

  // Show preview label
  const previewLabel = document.getElementById('shopPreviewLabel');
  if (previewLabel) {
    previewLabel.textContent = previewingItem ? '👁 Previewing' : '✓ Equipped';
    previewLabel.className = 'shopPreviewLabel' + (previewingItem ? ' previewing' : '');
  }
}

function displayShop() {
  if (!shopGrid) return;
  shopGrid.innerHTML = '';
  updateCoinDisplays();

  // Update tab active states
  const tabContainer = document.getElementById('shopTabs');
  if (tabContainer) {
    tabContainer.querySelectorAll('.shopTab').forEach(t => {
      t.classList.toggle('active', t.dataset.category === currentShopTab);
    });
  }

  const { catalog, owned, equipped } = getShopCatalog(currentShopTab);

  for (const [id, item] of Object.entries(catalog)) {
    const isOwned = owned.includes(id);
    const isEquipped = equipped === id;
    const el = document.createElement('div');
    el.className = `shopItem${isOwned ? ' owned' : ''}${isEquipped ? ' equipped' : ''}`;

    // Create preview
    if (currentShopTab === 'skins') {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 60;
      previewCanvas.height = 60;
      previewCanvas.className = 'shopItemPreview';
      const pctx = previewCanvas.getContext('2d');
      const savedSkin = equippedSkin;
      equippedSkin = id;
      const sampleColors = ['1', '2', '3', '4'];
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        pctx.save();
        pctx.scale(60 / (2 * CELL), 60 / (2 * CELL));
        drawCell(pctx, c, r, sampleColors[(r * 2 + c) % 4]);
        pctx.restore();
      }
      equippedSkin = savedSkin;
      el.appendChild(previewCanvas);
    } else if (currentShopTab === 'boards') {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 60;
      previewCanvas.height = 60;
      previewCanvas.className = 'shopItemPreview';
      const pctx = previewCanvas.getContext('2d');
      const theme = THEMES[currentThemeName];
      pctx.fillStyle = theme.bg;
      pctx.fillRect(0, 0, 60, 60);
      if (item.bgOverlay) { pctx.fillStyle = item.bgOverlay; pctx.fillRect(0, 0, 60, 60); }
      if (!item.noGrid) {
        pctx.strokeStyle = item.borderColor || theme.grid;
        for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) pctx.strokeRect(c * 10, r * 10, 10, 10);
      }
      el.appendChild(previewCanvas);
    } else if (currentShopTab === 'trails') {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 60;
      previewCanvas.height = 60;
      previewCanvas.className = 'shopItemPreview';
      const pctx = previewCanvas.getContext('2d');
      pctx.fillStyle = '#111';
      pctx.fillRect(0, 0, 60, 60);
      if (id !== 'none') {
        for (let i = 0; i < 5; i++) {
          const alpha = 0.3 + i * 0.14;
          const px = 10 + i * 10;
          const py = 20 + Math.sin(i * 1.2) * 8;
          switch(id) {
            case 'spark': pctx.fillStyle = `rgba(255,220,100,${alpha})`; break;
            case 'flame': pctx.fillStyle = `rgba(255,120,0,${alpha})`; break;
            case 'ice_trail': pctx.fillStyle = `rgba(150,220,255,${alpha})`; break;
            case 'confetti': pctx.fillStyle = `hsla(${i*72},90%,60%,${alpha})`; break;
            case 'lightning': pctx.fillStyle = `rgba(180,200,255,${alpha})`; break;
            case 'stardust': pctx.fillStyle = `rgba(255,255,200,${alpha})`; break;
            case 'toxic': pctx.fillStyle = `rgba(0,255,60,${alpha})`; break;
            case 'shockwave': pctx.fillStyle = `rgba(0,200,255,${alpha})`; break;
            default: pctx.fillStyle = `rgba(255,255,255,${alpha})`;
          }
          pctx.beginPath(); pctx.arc(px, py, 3, 0, Math.PI * 2); pctx.fill();
        }
      }
      el.appendChild(previewCanvas);
    } else if (currentShopTab === 'titles') {
      const titlePreview = document.createElement('div');
      titlePreview.className = 'shopItemPreview shopTitlePreview';
      titlePreview.style.color = item.color;
      titlePreview.style.textShadow = `0 0 8px ${item.color}`;
      titlePreview.textContent = id === 'none' ? '—' : item.name;
      el.appendChild(titlePreview);
    } else if (currentShopTab === 'avatars') {
      const avatarPreview = document.createElement('div');
      avatarPreview.className = 'shopItemPreview shopAvatarPreview';
      avatarPreview.textContent = item.emoji;
      el.appendChild(avatarPreview);
    }

    let btnHtml = '';
    if (isEquipped) {
      btnHtml = `<button class="shopItemBtn equipped" disabled>✓ Equipped</button>`;
    } else if (isOwned || item.price === 0) {
      btnHtml = `<button class="shopItemBtn equip" data-id="${id}" data-cat="${currentShopTab}">Equip</button>`;
    } else {
      const canAfford = loadCoins() >= item.price;
      btnHtml = `<button class="shopItemBtn ${canAfford ? 'buy' : 'locked'}" data-id="${id}" data-cat="${currentShopTab}" ${canAfford ? '' : 'disabled'}>🪙 ${item.price}</button>`;
    }

    el.innerHTML += `<div class="shopItemName">${item.name}</div><div class="shopItemDesc">${item.desc}</div><div class="shopItemPrice${item.price === 0 ? ' free' : ''}">${item.price === 0 ? 'Free' : '🪙 ' + item.price}</div>${btnHtml}`;
    
    // Click-to-preview: clicking the item card (not the button) shows a preview
    el.addEventListener('click', (e) => {
      if (e.target.closest('.shopItemBtn')) return; // don't trigger on button clicks
      previewingItem = id;
      // Update visual highlight
      shopGrid.querySelectorAll('.shopItem').forEach(si => si.classList.remove('previewing'));
      el.classList.add('previewing');
      drawShopPreview();
    });

    shopGrid.appendChild(el);
  }

  // Event delegation for shop buttons
  shopGrid.querySelectorAll('.shopItemBtn.buy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Confirm before buying
      if (btn.dataset.confirming !== 'true') {
        btn.dataset.confirming = 'true';
        btn.dataset.origText = btn.textContent;
        btn.textContent = '✓ Confirm?';
        btn.classList.add('confirming');
        // Auto-reset after 3 seconds
        setTimeout(() => {
          if (btn.dataset.confirming === 'true') {
            btn.dataset.confirming = 'false';
            btn.textContent = btn.dataset.origText;
            btn.classList.remove('confirming');
          }
        }, 3000);
        return;
      }
      // Confirmed — buy it
      const cat = btn.dataset.cat;
      const id = btn.dataset.id;
      btn.dataset.confirming = 'false';
      if (buyShopItem(cat, id)) { equipShopItem(cat, id); displayShop(); }
    });
  });
  shopGrid.querySelectorAll('.shopItemBtn.equip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      equipShopItem(btn.dataset.cat, btn.dataset.id);
      displayShop();
    });
  });

  drawShopPreview();
}

function showShopPage() {
  welcomePage.classList.remove('active');
  shopPage.classList.add('active');
  currentShopTab = 'skins';
  previewingItem = null;
  displayShop();

  // Tab click listeners
  const tabContainer = document.getElementById('shopTabs');
  if (tabContainer) {
    tabContainer.querySelectorAll('.shopTab').forEach(tab => {
      tab.onclick = () => {
        currentShopTab = tab.dataset.category;
        previewingItem = null;
        displayShop();
      };
    });
  }
}

// ==================== RANKED PAGE ====================
function displayRankedInfo() {
  const rd = loadRankedData();
  const rank = getRankForElo(rd.elo);
  const ri = document.getElementById('rankIcon');
  const rn = document.getElementById('rankName');
  const ev = document.getElementById('eloValue');
  const rw = document.getElementById('rankedWins');
  const rl = document.getElementById('rankedLosses');
  if (ri) ri.textContent = rank.icon;
  if (rn) rn.textContent = rank.name;
  if (ev) ev.textContent = rd.elo;
  if (rw) rw.textContent = rd.wins;
  if (rl) rl.textContent = rd.losses;

  // Display rank ladder
  const ladder = document.getElementById('rankedLadder');
  if (ladder) {
    ladder.innerHTML = '';
    for (const tier of RANK_TIERS) {
      const row = document.createElement('div');
      const isCurrent = rank.name === tier.name;
      row.className = `ladderRow${isCurrent ? ' you' : ''}`;
      row.innerHTML = `<span class="ladderPos">${tier.icon}</span><span class="ladderName">${tier.name}</span><span class="ladderElo">${tier.min}+</span>`;
      ladder.appendChild(row);
    }
  }
}

let rankedSearching = false;
let rankedSearchTimeout = null;
let rankedModeVsPlayer = false; // false = AI, true = Player
let rankedWs = null; // separate websocket for ranked matchmaking

function findRankedMatch() {
  if (rankedSearching) return;
  if (!ensurePlayerName()) return;
  rankedSearching = true;
  const queueStatus = document.getElementById('rankedQueueStatus');
  const findBtn = document.getElementById('btnFindRankedMatch');
  const cancelBtn = document.getElementById('btnCancelQueue');
  if (queueStatus) { queueStatus.style.display = 'block'; queueStatus.textContent = 'Searching for opponent...'; }
  if (findBtn) findBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'block';

  if (rankedModeVsPlayer) {
    // Real matchmaking via WebSocket
    const rd = loadRankedData();
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    rankedWs = new WebSocket(`${protocol}//${location.host}`);
    rankedWs.onopen = () => {
      rankedWs.send(JSON.stringify({ type: 'ranked_queue', name: getCurrentPlayerName(), elo: rd.elo }));
    };
    rankedWs.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.type === 'ranked_matched') {
        rankedSearching = false;
        if (queueStatus) queueStatus.style.display = 'none';
        if (findBtn) findBtn.style.display = 'block';
        if (cancelBtn) cancelBtn.style.display = 'none';
        rankedPage.classList.remove('active');
        startRankedMatchVsPlayer(msg);
      } else if (msg.type === 'ranked_queue_pos') {
        if (queueStatus) queueStatus.textContent = `Searching... (${msg.count} in queue)`;
      } else if (msg.type === 'ranked_opponent_snapshot') {
        // Receive opponent board data during ranked match
        opponents[0].grid = msg.grid || opponents[0].grid;
        opponents[0].score = msg.score || 0;
        opponents[0].lines = msg.lines || 0;
        opponents[0].game_over = msg.game_over || false;
        if (msg.piece) opponents[0].piece = msg.piece;
        if (msg.next) opponents[0].next = msg.next;
        oppScoreEls[0].textContent = opponents[0].score;
        oppLinesEls[0].textContent = opponents[0].lines;
        if (msg.game_over && !opponents[0]._notifiedOver) {
          opponents[0]._notifiedOver = true;
          if (!game.gameOver) handleRankedGameOver(true);
        }
      } else if (msg.type === 'ranked_attack') {
        const lines = msg.lines || 0;
        if (lines > 0 && game && !game.gameOver) game.addGarbage(lines);
      } else if (msg.type === 'ranked_opponent_left') {
        if (!game.gameOver && !shownGameOver) handleRankedGameOver(true);
      }
    };
    rankedWs.onclose = () => {
      if (rankedSearching) {
        rankedSearching = false;
        if (queueStatus) queueStatus.style.display = 'none';
        if (findBtn) findBtn.style.display = 'block';
        if (cancelBtn) cancelBtn.style.display = 'none';
      }
    };
  } else {
    // AI matchmaking — simulate search delay then start
    rankedSearchTimeout = setTimeout(() => {
      if (!rankedSearching) return;
      rankedSearching = false;
      if (queueStatus) queueStatus.style.display = 'none';
      if (findBtn) findBtn.style.display = 'block';
      if (cancelBtn) cancelBtn.style.display = 'none';
      rankedPage.classList.remove('active');
      startRankedMatch();
    }, 2000 + Math.random() * 3000);
  }
}

function cancelRankedQueue() {
  rankedSearching = false;
  if (rankedSearchTimeout) { clearTimeout(rankedSearchTimeout); rankedSearchTimeout = null; }
  if (rankedWs) {
    rankedWs.send(JSON.stringify({ type: 'ranked_cancel' }));
    rankedWs.close();
    rankedWs = null;
  }
  const queueStatus = document.getElementById('rankedQueueStatus');
  const findBtn = document.getElementById('btnFindRankedMatch');
  const cancelBtn = document.getElementById('btnCancelQueue');
  if (queueStatus) queueStatus.style.display = 'none';
  if (findBtn) findBtn.style.display = 'block';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function startRankedMatch() {
  // Use ELO to determine AI difficulty  
  const rd = loadRankedData();
  const eloBasedDiff = Math.min(0.95, Math.max(0.2, (rd.elo - 600) / 1600));
  aiDifficulty = eloBasedDiff;

  // Generate AI opponent with ELO near player's
  const aiEloOffset = Math.floor(Math.random() * 200 - 100);
  rankedOpponentElo = Math.max(100, rd.elo + aiEloOffset);
  rankedOpponentName = ['TetrisMaster', 'BlockBuster', 'LineCleared', 'T-SpinKing', 'StackAttack', 'ComboHero', 'NeonPlayer'][Math.floor(Math.random() * 7)];
  isRankedMatch = true;

  // Start AI mode
  const seed = Math.floor(Math.random() * 1000000);
  game = new Game(seed);
  aiGame = new Game(seed);
  aiOpponent = new TetrisAI(eloBasedDiff);
  aiOpponent.setGame(aiGame);
  replayRecorder = new ReplayRecorder(seed);
  floatingTexts = [];
  mode = 'ai';
  isPaused = false;
  onlineReady = false;
  sentGameOver = false;
  shownGameOver = false;

  welcomePage.classList.remove('active');
  menu.classList.remove('active');
  onlineForm.classList.remove('active');
  if (settingsPage) settingsPage.classList.remove('active');
  if (shopPage) shopPage.classList.remove('active');
  if (rankedPage) rankedPage.classList.remove('active');
  if (profilePage) profilePage.classList.remove('active');
  gameContainer.style.display = 'flex';
  gameArea.className = 'gameArea players-2';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (pieceStatsPanel) pieceStatsPanel.style.display = '';
  opponents = [{ grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null }, { grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null }, { grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null }];
  oppNameEls[0].textContent = rankedOpponentName;
  modeEl.textContent = 'Mode: Ranked 1v1';
  updatePlayerCount(2);
  sound.init();
  sound.startMusic();
  initBgParticles();
  updateCoinDisplays();
  lastTs = performance.now();
  requestAnimationFrame(loop);
}

let isRankedMatch = false;
let isRankedVsPlayer = false;
let rankedOpponentElo = 1000;
let rankedOpponentName = 'Opponent';
let rankedSnapshotTimer = 0;

function startRankedMatchVsPlayer(msg) {
  const rd = loadRankedData();
  rankedOpponentElo = msg.opponentElo || 1000;
  rankedOpponentName = msg.opponentName || 'Opponent';
  isRankedMatch = true;
  isRankedVsPlayer = true;

  const seed = msg.seed;
  game = new Game(seed);
  aiGame = null;
  aiOpponent = null;
  replayRecorder = new ReplayRecorder(seed);
  floatingTexts = [];
  mode = 'ai'; // reuse 2-player layout
  isPaused = false;
  onlineReady = false;
  sentGameOver = false;
  shownGameOver = false;
  rankedSnapshotTimer = 0;

  welcomePage.classList.remove('active');
  menu.classList.remove('active');
  onlineForm.classList.remove('active');
  if (settingsPage) settingsPage.classList.remove('active');
  if (shopPage) shopPage.classList.remove('active');
  if (rankedPage) rankedPage.classList.remove('active');
  if (profilePage) profilePage.classList.remove('active');
  gameContainer.style.display = 'flex';
  gameArea.className = 'gameArea players-2';
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';
  if (pieceStatsPanel) pieceStatsPanel.style.display = '';
  opponents = [{ grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null, _notifiedOver: false }, { grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null }, { grid: createEmptyGrid(), score: 0, lines: 0, game_over: false, next: null }];
  oppNameEls[0].textContent = rankedOpponentName;
  modeEl.textContent = 'Mode: Ranked 1v1';
  updatePlayerCount(2);
  sound.init();
  sound.startMusic();
  initBgParticles();
  updateCoinDisplays();
  lastTs = performance.now();
  requestAnimationFrame(loop);
}

function showRankedPage() {
  welcomePage.classList.remove('active');
  rankedPage.classList.add('active');
  displayRankedInfo();
}

// ==================== PROFILE PAGE ====================
function showProfilePage() {
  welcomePage.classList.remove('active');
  profilePage.classList.add('active');
  displayProfile();
}

function displayProfile() {
  const name = getPlayerName() || 'Player';
  const stats = loadStats();
  const rd = loadRankedData();
  const rank = getRankForElo(rd.elo);
  const achs = loadAchievements();

  const pn = document.getElementById('profileName');
  const prb = document.getElementById('profileRankBadge');
  const ps = document.getElementById('profileStats');
  const pb = document.getElementById('profileBadges');
  const mh = document.getElementById('matchHistory');
  const pa = document.getElementById('profileAvatar');
  const pt = document.getElementById('profileTitle');

  if (pn) pn.textContent = name;
  if (prb) prb.textContent = `${rank.icon} ${rank.name} (${rd.elo})`;
  if (pa) pa.textContent = (PLAYER_AVATARS[equippedAvatar] || PLAYER_AVATARS.default).emoji;
  if (pt) {
    const titleData = PLAYER_TITLES[equippedTitle];
    if (titleData && equippedTitle !== 'none') {
      pt.textContent = titleData.name;
      pt.style.color = titleData.color;
      pt.style.textShadow = `0 0 8px ${titleData.color}`;
      pt.style.display = 'block';
    } else {
      pt.style.display = 'none';
    }
  }

  if (ps) {
    ps.innerHTML = [
      ['Games Played', stats.gamesPlayed],
      ['Best Score', stats.bestScore.toLocaleString()],
      ['Total Lines', stats.totalLines],
      ['Best Combo', stats.bestCombo],
      ['Total Tetrises', stats.totalTetris],
      ['Total T-Spins', stats.totalTSpins],
      ['Ranked W/L', `${rd.wins}/${rd.losses}`],
      ['Coins', loadCoins()],
    ].map(([l, v]) => `<div class="profileStatItem"><span class="profileStatValue">${v}</span><span class="profileStatLabel">${l}</span></div>`).join('');
  }

  if (pb) {
    pb.innerHTML = ACHIEVEMENTS.map(a => {
      const earned = !!achs[a.id];
      return `<span class="profileBadge ${earned ? 'earned' : 'locked'}">${a.icon} ${a.name}</span>`;
    }).join('');
  }

  if (mh) {
    if (rd.history.length === 0) {
      mh.innerHTML = '<div style="text-align:center;color:var(--color-text-dim);padding:12px;">No matches yet</div>';
    } else {
      mh.innerHTML = rd.history.slice(0, 20).map(m => {
        const date = new Date(m.date).toLocaleDateString();
        return `<div class="matchRow">
          <span class="matchResult ${m.result}">${m.result === 'win' ? 'W' : 'L'}</span>
          <span class="matchOpponent">vs ${m.opponent}</span>
          <span class="matchEloChange ${m.eloChange >= 0 ? 'positive' : 'negative'}">${m.eloChange >= 0 ? '+' : ''}${m.eloChange}</span>
          <span style="font-size:0.75rem;color:var(--color-text-dim);margin-left:8px;">${date}</span>
        </div>`;
      }).join('');
    }
  }
}

// ==================== TOUCH CONTROLS ====================
function initTouchControls() {
  const tl = document.getElementById('touchLeft');
  const tr = document.getElementById('touchRight');
  const td = document.getElementById('touchDown');
  const trot = document.getElementById('touchRotate');
  const thd = document.getElementById('touchHardDrop');
  const tpause = document.getElementById('touchPause');

  if (!tl) return; // No touch controls in DOM

  function touchAction(action) {
    if (game.gameOver || isPaused) return;
    if (mode === 'replay') return;
    if (action === 'left') game.move(-1, 0);
    else if (action === 'right') game.move(1, 0);
    else if (action === 'rotate') game.rotateCurrent();
    else if (action === 'hardDrop') game.hardDrop();
    else if (action === 'softDrop') game.softDrop = true;
    sound.init();
  }

  // Use touchstart for responsive feel
  trot.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction('rotate'); }, { passive: false });
  thd.addEventListener('touchstart', (e) => { e.preventDefault(); touchAction('hardDrop'); }, { passive: false });

  // Pause button
  if (tpause) {
    tpause.addEventListener('touchstart', (e) => {
      e.preventDefault();
      sound.init();
      togglePause();
    }, { passive: false });
  }

  // Hold-to-repeat for left/right (initial delay then repeat)
  function setupRepeat(btn, action) {
    let repeatTimeout = null, repeatInterval = null;
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchAction(action);
      repeatTimeout = setTimeout(() => {
        repeatInterval = setInterval(() => touchAction(action), 60);
      }, 180); // DAS-like initial delay
    }, { passive: false });
    const stop = () => {
      if (repeatTimeout) { clearTimeout(repeatTimeout); repeatTimeout = null; }
      if (repeatInterval) { clearInterval(repeatInterval); repeatInterval = null; }
    };
    btn.addEventListener('touchend', stop);
    btn.addEventListener('touchcancel', stop);
  }
  setupRepeat(tl, 'left');
  setupRepeat(tr, 'right');

  // Soft drop hold
  let softDropInterval = null;
  td.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchAction('softDrop');
    softDropInterval = setInterval(() => touchAction('softDrop'), 50);
  }, { passive: false });
  td.addEventListener('touchend', () => { game.softDrop = false; if (softDropInterval) { clearInterval(softDropInterval); softDropInterval = null; } });
  td.addEventListener('touchcancel', () => { game.softDrop = false; if (softDropInterval) { clearInterval(softDropInterval); softDropInterval = null; } });

  // Also add swipe support on the canvas
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
  boardCanvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
  }, { passive: true });
  boardCanvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    if (dt > 300) return; // Too slow for a swipe
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < 20 && absDy < 20) {
      // Tap → rotate
      touchAction('rotate');
    } else if (absDy > absDx && dy > 30) {
      // Swipe down → hard drop
      touchAction('hardDrop');
    }
  }, { passive: true });
}

// ==================== RANKED GAME OVER HANDLER ====================
function handleRankedGameOver(playerWon) {
  if (!isRankedMatch) return;
  isRankedMatch = false;
  const wasVsPlayer = isRankedVsPlayer;
  isRankedVsPlayer = false;
  const change = recordRankedResult(rankedOpponentName, rankedOpponentElo, playerWon);
  // Clean up ranked websocket
  if (wasVsPlayer && rankedWs) {
    try { rankedWs.close(); } catch {}
    rankedWs = null;
  }
  // Show rank change notification
  const changeText = change >= 0 ? `+${change}` : `${change}`;
  const changeColor = change >= 0 ? 'var(--color-accent-green)' : 'var(--color-accent-pink)';
  const toast = document.createElement('div');
  toast.className = 'achievementToast';
  toast.innerHTML = `<span class="achIcon">⚔️</span><div class="achInfo"><span class="achTitle">${playerWon ? 'Victory!' : 'Defeat'}</span><span class="achName" style="color:${changeColor}">ELO ${changeText}</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
  if (playerWon) addCoins(20); // Ranked win bonus
  scheduleSyncProfile();
}

// Card click handlers from welcome page
cardClassic.addEventListener('click', () => {
  ensurePlayerName();
  startClassic();
});
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

// New card click handlers
if (cardAI) cardAI.addEventListener('click', () => {
  ensurePlayerName();
  welcomePage.classList.remove('active');
  if (aiSetupPage) aiSetupPage.classList.add('active');
});
if (cardStats) cardStats.addEventListener('click', showStatsPage);
if (cardAchievements) cardAchievements.addEventListener('click', showAchievementsPage);
if (cardReplays) cardReplays.addEventListener('click', showReplaysPage);

// New page card handlers
if (cardRanked) cardRanked.addEventListener('click', showRankedPage);
if (cardShop) cardShop.addEventListener('click', showShopPage);
if (cardSettings) cardSettings.addEventListener('click', showSettingsPage);
if (cardProfile) cardProfile.addEventListener('click', showProfilePage);

// AI setup
if (btnStartAI) btnStartAI.addEventListener('click', startAIMode);
if (btnBackFromAI) btnBackFromAI.addEventListener('click', () => {
  if (aiSetupPage) aiSetupPage.classList.remove('active');
  welcomePage.classList.add('active');
});
if (aiDiffSlider) aiDiffSlider.addEventListener('input', () => {
  aiDifficulty = aiDiffSlider.value / 100;
  if (aiDiffLabel) aiDiffLabel.textContent = ['Easy', 'Medium', 'Hard', 'Expert'][Math.min(3, Math.floor(aiDifficulty * 4))];
});

// Back buttons for new pages
if (btnBackFromStats) btnBackFromStats.addEventListener('click', () => {
  if (statsPage) statsPage.classList.remove('active');
  welcomePage.classList.add('active');
});
if (btnBackFromAchievements) btnBackFromAchievements.addEventListener('click', () => {
  if (achievementsPage) achievementsPage.classList.remove('active');
  welcomePage.classList.add('active');
});
if (btnBackFromReplays) btnBackFromReplays.addEventListener('click', () => {
  if (replaysPage) replaysPage.classList.remove('active');
  welcomePage.classList.add('active');
});
if (btnClearStats) btnClearStats.addEventListener('click', () => {
  if (confirm('Clear all stats?')) { localStorage.removeItem('tetrisStats'); displayStats(); }
});
if (btnClearAchievements) btnClearAchievements.addEventListener('click', () => {
  if (confirm('Reset all achievements?')) { localStorage.removeItem('tetrisAchievements'); displayAchievements(); }
});

// New page back buttons
const btnBackFromSettings = document.getElementById('btnBackFromSettings');
const btnResetKeybinds = document.getElementById('btnResetKeybinds');
const btnBackFromShop = document.getElementById('btnBackFromShop');
const btnBackFromRanked = document.getElementById('btnBackFromRanked');
const btnFindRankedMatch = document.getElementById('btnFindRankedMatch');
const btnCancelQueue = document.getElementById('btnCancelQueue');
const btnBackFromProfile = document.getElementById('btnBackFromProfile');

if (btnBackFromSettings) btnBackFromSettings.addEventListener('click', () => { settingsPage.classList.remove('active'); welcomePage.classList.add('active'); });
if (btnResetKeybinds) btnResetKeybinds.addEventListener('click', () => { keybinds = { ...DEFAULT_KEYBINDS }; saveKeybinds(keybinds); displayKeybinds(); updateControlsDisplay(); });
if (btnBackFromShop) btnBackFromShop.addEventListener('click', () => { shopPage.classList.remove('active'); welcomePage.classList.add('active'); });
if (btnBackFromRanked) btnBackFromRanked.addEventListener('click', () => { cancelRankedQueue(); rankedPage.classList.remove('active'); welcomePage.classList.add('active'); });
if (btnFindRankedMatch) btnFindRankedMatch.addEventListener('click', findRankedMatch);
if (btnCancelQueue) btnCancelQueue.addEventListener('click', cancelRankedQueue);

// Ranked mode toggle (AI / Player)
const btnRankedVsAI = document.getElementById('btnRankedVsAI');
const btnRankedVsPlayer = document.getElementById('btnRankedVsPlayer');
if (btnRankedVsAI) btnRankedVsAI.addEventListener('click', () => {
  rankedModeVsPlayer = false;
  btnRankedVsAI.classList.add('active');
  if (btnRankedVsPlayer) btnRankedVsPlayer.classList.remove('active');
});
if (btnRankedVsPlayer) btnRankedVsPlayer.addEventListener('click', () => {
  rankedModeVsPlayer = true;
  btnRankedVsPlayer.classList.add('active');
  if (btnRankedVsAI) btnRankedVsAI.classList.remove('active');
});
if (btnBackFromProfile) btnBackFromProfile.addEventListener('click', () => { profilePage.classList.remove('active'); welcomePage.classList.add('active'); });

// Save replay button in game over
if (btnSaveReplay) btnSaveReplay.addEventListener('click', () => {
  const name = prompt('Name this replay:', 'Replay ' + (savedReplays.length + 1));
  if (name !== null) { saveReplay(name); btnSaveReplay.textContent = '✓ Saved!'; btnSaveReplay.disabled = true; }
});
if (btnExportReplay) btnExportReplay.addEventListener('click', () => {
  if (savedReplays.length === 0) return alert('No replays to export');
  const blob = new Blob([JSON.stringify(savedReplays)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tetris-replays.json';
  a.click();
});
// Replay playback controls
if (replayPauseBtn) replayPauseBtn.addEventListener('click', toggleReplayPause);
if (replaySpeedBtn) replaySpeedBtn.addEventListener('click', cycleReplaySpeed);
if (replaySkipBtn) replaySkipBtn.addEventListener('click', skipReplay);
if (replayMenuBtn) replayMenuBtn.addEventListener('click', exitReplay);

if (btnImportReplay) btnImportReplay.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) { savedReplays.push(...data); }
        else if (data.seed && data.inputs) { savedReplays.push(data); }
        if (savedReplays.length > 50) savedReplays.splice(0, savedReplays.length - 50);
        localStorage.setItem('tetrisReplays', JSON.stringify(savedReplays));
        displayReplays();
      } catch (e) { alert('Invalid replay file'); }
    };
    reader.readAsText(file);
  };
  input.click();
});

// Sound controls
if (soundToggleBtn) soundToggleBtn.addEventListener('click', () => { sound.init(); sound.toggleSound(); updateSoundButtons(); });
if (musicToggleBtn) musicToggleBtn.addEventListener('click', () => { sound.init(); sound.toggleMusic(); updateSoundButtons(); });
if (volumeSlider) volumeSlider.addEventListener('input', () => { sound.init(); sound.setVolume(volumeSlider.value / 100); updateSoundButtons(); });

// Room settings listeners
if (roomStartLevel) roomStartLevel.addEventListener('change', () => { roomSettings.startLevel = Number(roomStartLevel.value) || 1; });
if (roomGarbageMult) roomGarbageMult.addEventListener('change', () => { roomSettings.garbageMultiplier = Number(roomGarbageMult.value) || 1; });
if (roomSpeedMult) roomSpeedMult.addEventListener('change', () => { roomSettings.speedMultiplier = Number(roomSpeedMult.value) || 1; });

btnConnect.addEventListener('click', connectOnline);
btnStartGame.addEventListener('click', () => {
  send({ type: 'startgame', settings: roomSettings });
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
  menu.classList.remove('active');
  gameContainer.style.display = 'none';
  leaderboardPage.classList.remove('active');
  pauseMenu.classList.remove('active');
  gameOverMenu.classList.remove('active');
  if (statsPage) statsPage.classList.remove('active');
  if (achievementsPage) achievementsPage.classList.remove('active');
  if (replaysPage) replaysPage.classList.remove('active');
  if (aiSetupPage) aiSetupPage.classList.remove('active');
  if (settingsPage) settingsPage.classList.remove('active');
  if (shopPage) shopPage.classList.remove('active');
  if (rankedPage) rankedPage.classList.remove('active');
  if (profilePage) profilePage.classList.remove('active');
  if (gameChatBox) gameChatBox.style.display = 'none';
  if (spectatorBanner) spectatorBanner.style.display = 'none';

  // Show auth page or welcome page depending on login state
  if (isLoggedIn()) {
    // Validate token with server and pull latest profile
    fetch('/api/profile', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + authToken }
    }).then(r => r.json()).then(data => {
      if (data.ok) {
        authUsername = data.username;
        loadProfileFromServer(data.profile);
        showWelcomeAfterAuth();
      } else {
        // Token invalid, show login
        doLogout();
      }
    }).catch(() => {
      // Server unreachable, proceed with cached data
      showWelcomeAfterAuth();
    });
  } else {
    if (authPage) authPage.classList.add('active');
    welcomePage.classList.remove('active');
  }

  // Apply saved theme
  applyTheme(currentThemeName);
  updatePieceStatsColors();
  updateSoundButtons();
  updateControlsDisplay();
  updateCoinDisplays();
  initTouchControls();
});
