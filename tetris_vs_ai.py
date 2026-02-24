import pygame
import random
import sys
import math
import json
import os
import socket
from copy import deepcopy

# ----------------------------
# Configuration
# ----------------------------
CELL = 30
COLS = 10
ROWS = 20
BOARD_W = CELL * COLS
BOARD_H = CELL * ROWS
FPS = 60

PADDING = 30
SIDE_W = 220

WINDOW_W = BOARD_W * 2 + PADDING * 3 + SIDE_W
WINDOW_H = BOARD_H

pygame.init()
screen = pygame.display.set_mode((WINDOW_W, WINDOW_H))
pygame.display.set_caption("Tetris VS AI")
clock = pygame.time.Clock()
font = pygame.font.SysFont("Consolas", 20)
big_font = pygame.font.SysFont("Consolas", 34)

# Mixer (safe init)
try:
    pygame.mixer.init()
except Exception:
    pass

# ----------------------------
# Game states
# ----------------------------
STATE_START = "start"
STATE_PLAYING = "playing"
STATE_PAUSED = "paused"
STATE_GAMEOVER = "gameover"

MODE_CLASSIC = "classic"
MODE_VS_AI = "vs_ai"
MODE_VS_LOCAL = "vs_local"
MODE_ONLINE = "online"
MODE_SPRINT = "sprint"

ONLINE_HOST = os.environ.get("TETRIS_ONLINE_HOST", "127.0.0.1")
ONLINE_PORT = int(os.environ.get("TETRIS_ONLINE_PORT", "8765"))
ONLINE_ROOM = os.environ.get("TETRIS_ONLINE_ROOM", "default")

AI_DIFFICULTIES = ["Easy", "Normal", "Hard"]
AI_DIFFICULTY_SETTINGS = {
    "Easy": {"interval_ms": 180, "lookahead_weight": 0.12},
    "Normal": {"interval_ms": 120, "lookahead_weight": 0.35},
    "Hard": {"interval_ms": 70, "lookahead_weight": 0.60},
}

# ----------------------------
# Assets (optional sounds)
# ----------------------------
def load_sound(name):
    try:
        if pygame.mixer.get_init() is None:
            return None
        if not os.path.exists(name):
            return None
        return pygame.mixer.Sound(name)
    except Exception:
        return None

SND_MOVE = load_sound("move.wav")
SND_ROTATE = load_sound("rotate.wav")
SND_LOCK = load_sound("lock.wav")
SND_CLEAR = load_sound("clear.wav")
SND_DROP = load_sound("drop.wav")
SND_GAMEOVER = load_sound("gameover.wav")

def play(snd):
    if snd is not None:
        try:
            snd.play()
        except Exception:
            pass


class OnlineClient:
    def __init__(self, host, port, room, name):
        self.host = host
        self.port = int(port)
        self.room = room
        self.name = name
        self.sock = None
        self.recv_buffer = b""
        self.connected = False

    def connect(self):
        self.sock = socket.create_connection((self.host, self.port), timeout=3)
        self.sock.setblocking(False)
        self.connected = True
        self.send({"type": "join", "room": self.room, "name": self.name})

    def close(self):
        self.connected = False
        if self.sock is not None:
            try:
                self.sock.close()
            except Exception:
                pass
            self.sock = None

    def send(self, payload):
        if not self.connected or self.sock is None:
            return False
        try:
            data = (json.dumps(payload) + "\n").encode("utf-8")
            self.sock.sendall(data)
            return True
        except Exception:
            self.close()
            return False

    def poll(self):
        messages = []
        if not self.connected or self.sock is None:
            return messages

        while True:
            try:
                chunk = self.sock.recv(4096)
                if not chunk:
                    self.close()
                    break
                self.recv_buffer += chunk
            except BlockingIOError:
                break
            except Exception:
                self.close()
                break

        while b"\n" in self.recv_buffer:
            line, self.recv_buffer = self.recv_buffer.split(b"\n", 1)
            line = line.strip()
            if not line:
                continue
            try:
                messages.append(json.loads(line.decode("utf-8")))
            except Exception:
                continue

        return messages

# ----------------------------
# Tetrominoes + Colors
# ----------------------------
TETROMINOES = {
    "I": [[
        "....",
        "1111",
        "....",
        "...."
    ]],
    "O": [[
        ".22.",
        ".22.",
        "....",
        "...."
    ]],
    "T": [[
        ".333",
        "..3.",
        "....",
        "...."
    ]],
    "S": [[
        "..44",
        ".44.",
        "....",
        "...."
    ]],
    "Z": [[
        ".55.",
        "..55",
        "....",
        "...."
    ]],
    "J": [[
        ".6..",
        ".666",
        "....",
        "...."
    ]],
    "L": [[
        "...7",
        ".777",
        "....",
        "...."
    ]]
}

COLORS = {
    "1": (0, 255, 255),    # I
    "2": (255, 220, 80),   # O
    "3": (220, 60, 255),   # T
    "4": (0, 255, 170),    # S
    "5": (255, 70, 120),   # Z
    "6": (120, 170, 255),  # J
    "7": (255, 160, 60)    # L
}

def rotate(shape):
    """Rotate a 4x4 shape 90 degrees clockwise."""
    return ["".join(row[col] for row in shape[::-1]) for col in range(4)]

def lighter_color(col, amt=30):
    return tuple(min(255, c + amt) for c in col)

def darker_color(col, amt=30):
    return tuple(max(0, c - amt) for c in col)

# ----------------------------
# Highscore
# ----------------------------
HIGHSCORE_FILE = "highscore.json"
PROGRESS_FILE = "progress.json"

def load_highscore():
    try:
        with open(HIGHSCORE_FILE, "r") as f:
            return int(json.load(f).get("highscore", 0))
    except Exception:
        return 0

def save_highscore(score):
    try:
        with open(HIGHSCORE_FILE, "w") as f:
            json.dump({"highscore": int(score)}, f)
    except Exception:
        pass


def load_progress():
    default_data = {"xp": 0, "achievements": []}
    try:
        with open(PROGRESS_FILE, "r") as f:
            data = json.load(f)
            xp = int(data.get("xp", 0))
            achievements = data.get("achievements", [])
            if not isinstance(achievements, list):
                achievements = []
            return {"xp": xp, "achievements": achievements}
    except Exception:
        return default_data


def save_progress(progress):
    try:
        with open(PROGRESS_FILE, "w") as f:
            json.dump(progress, f)
    except Exception:
        pass

# ----------------------------
# Background (stars + scanlines)
# ----------------------------
class Star:
    def __init__(self):
        self.reset(True)

    def reset(self, initial=False):
        self.x = random.uniform(0, WINDOW_W)
        self.y = random.uniform(0, WINDOW_H) if initial else -random.uniform(10, 200)
        self.speed = random.uniform(30, 140)
        self.size = random.choice([1, 1, 1, 2])
        self.tw = random.uniform(0, math.pi * 2)

    def update(self, dt):
        self.tw += dt * 3.5
        self.y += self.speed * dt
        if self.y > WINDOW_H + 5:
            self.reset(False)

    def draw(self, surf):
        # gentle twinkle by alpha-ish brightness using color intensity
        b = int(140 + 80 * (0.5 + 0.5 * math.sin(self.tw)))
        col = (b, b, b)
        pygame.draw.rect(surf, col, (int(self.x), int(self.y), self.size, self.size))

stars = [Star() for _ in range(120)]

def draw_scanlines(surf):
    # faint scanlines
    overlay = pygame.Surface((WINDOW_W, WINDOW_H), pygame.SRCALPHA)
    for y in range(0, WINDOW_H, 4):
        overlay.fill((0, 0, 0, 18), rect=pygame.Rect(0, y, WINDOW_W, 1))
    surf.blit(overlay, (0, 0))

def draw_background(surf, dt):
    # deep gradient background
    top = (6, 0, 24)
    bottom = (2, 0, 48)
    for y in range(WINDOW_H):
        t = y / WINDOW_H
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        pygame.draw.line(surf, (r, g, b), (0, y), (WINDOW_W, y))

    # stars
    for s in stars:
        s.update(dt)
        s.draw(surf)

    draw_scanlines(surf)

# ----------------------------
# Core classes
# ----------------------------
class Bag:
    def __init__(self, seed=None):
        self.pool = []
        self.rng = random.Random(seed)

    def next_kind(self):
        if not self.pool:
            self.pool = list(TETROMINOES.keys())
            self.rng.shuffle(self.pool)
        return self.pool.pop()

class Piece:
    def __init__(self, kind=None):
        if kind is None:
            kind = random.choice(list(TETROMINOES.keys()))
        self.kind = kind
        self.rotation = 0
        base = TETROMINOES[kind][0]
        self.rotations = [base]
        for _ in range(3):
            self.rotations.append(rotate(self.rotations[-1]))
        self.x = COLS // 2 - 2
        self.y = 0
        self.fall_progress = 0

        # rotation animation
        self.rotating = False
        self.rot_from = self.rotation
        self.rot_to = self.rotation
        self.rot_progress = 0.0

    def shape(self, rot=None):
        r = self.rotation if rot is None else rot
        return self.rotations[r % 4]

    def start_rotation(self, new_rot):
        if self.rotating:
            return
        self.rot_from = self.rotation
        self.rot_to = new_rot % 4
        self.rot_progress = 0.0
        self.rotating = True

    def cells(self, rot=None, x=None, y=None):
        s = self.shape(rot)
        ox = self.x if x is None else x
        oy = self.y if y is None else y
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v != ".":
                    yield (ox + c, oy + r, v)

class Bounce:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.t = 0.0
        self.dur = 0.45

    def update(self, dt):
        self.t += dt
        return self.t < self.dur

    def offset(self):
        p = self.t / self.dur
        return -abs(math.sin(p * math.pi) * 8) * (1 - p)

class Particle:
    def __init__(self, x, y, col=None):
        self.x = x
        self.y = y
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(50, 220)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed - 120
        self.life = random.uniform(0.4, 0.9)
        self.age = 0
        self.size = random.uniform(2, 5)
        self.col = col if col is not None else (255, 220, 120)

    def update(self, dt):
        self.age += dt
        if self.age >= self.life:
            return False
        self.vy += 400 * dt
        self.x += self.vx * dt
        self.y += self.vy * dt
        return True

    def draw(self, surf):
        alpha = max(0, int(255 * (1 - self.age / self.life)))
        base = self.col
        col = (base[0], base[1], base[2], alpha)
        s = pygame.Surface((int(self.size), int(self.size)), pygame.SRCALPHA)
        s.fill(col)
        surf.blit(s, (self.x - self.size / 2, self.y - self.size / 2))

class Board:
    def __init__(self):
        self.grid = [["." for _ in range(COLS)] for _ in range(ROWS)]
        self.score = 0
        self.level = 1
        self.lines = 0
        self.combo = -1
        self.back_to_back = False
        self.lock_bounces = []

    def collision(self, piece, dx=0, dy=0, rotation=None):
        rot = piece.rotation if rotation is None else rotation
        s = piece.shape(rot)
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v == ".":
                    continue
                nx = piece.x + c + dx
                ny = piece.y + r + dy
                if nx < 0 or nx >= COLS or ny >= ROWS:
                    return True
                if ny >= 0 and self.grid[ny][nx] != ".":
                    return True
        return False

    def lock(self, piece, t_spin=False):
        for x, y, v in piece.cells():
            if 0 <= y < ROWS and 0 <= x < COLS:
                self.grid[y][x] = v

        cleared_rows = self.clear_lines()
        cleared = len(cleared_rows)
        self.lines += cleared

        if cleared > 0:
            self.combo += 1
        else:
            self.combo = -1

        if t_spin:
            base_points = [0, 800, 1200, 1600][cleared]
            attack = [0, 2, 4, 6][cleared]
        else:
            base_points = [0, 100, 300, 500, 800][cleared]
            attack = [0, 0, 1, 2, 4][cleared]

        b2b_eligible = t_spin and cleared > 0 or cleared == 4
        if b2b_eligible:
            if self.back_to_back:
                base_points = int(base_points * 1.5)
                attack += 1
            self.back_to_back = True
        elif cleared > 0:
            self.back_to_back = False

        combo_bonus = max(0, self.combo) * 50
        attack += max(0, self.combo - 1)

        perfect_clear = cleared > 0 and all(cell == "." for row in self.grid for cell in row)
        if perfect_clear:
            base_points += 2000
            attack += 6

        self.level = 1 + self.lines // 10
        self.score += (base_points + combo_bonus) * self.level
        return cleared_rows, attack, perfect_clear

    def clear_lines(self):
        cleared_rows = [i for i, row in enumerate(self.grid) if all(cell != "." for cell in row)]
        if not cleared_rows:
            return []

        new_grid = [row for row in self.grid if any(cell == "." for cell in row)]
        while len(new_grid) < ROWS:
            new_grid.insert(0, ["." for _ in range(COLS)])
        self.grid = new_grid
        return cleared_rows

    def add_garbage(self, n):
        """Add n garbage lines at bottom, push board up. One hole each row."""
        for _ in range(n):
            hole = random.randrange(COLS)
            garbage = ["8" for _ in range(COLS)]
            garbage[hole] = "."
            # push up: remove top row, add garbage at bottom
            self.grid.pop(0)
            self.grid.append(garbage)

# garbage color key "8"
COLORS["8"] = (120, 120, 120)

# ----------------------------
# Rendering
# ----------------------------
def draw_board(surf, board, offset_x=0):
    # board background vignette
    vignette = pygame.Surface((BOARD_W, BOARD_H), pygame.SRCALPHA)
    for i in range(120):
        a = int(110 * (i / 120))
        pygame.draw.rect(vignette, (0, 0, 0, a), (-i, -i, BOARD_W + i * 2, BOARD_H + i * 2), 1)
    surf.blit(vignette, (offset_x, 0))

    # grid + blocks
    for r in range(ROWS):
        for c in range(COLS):
            cell = board.grid[r][c]
            offy = 0
            for b in board.lock_bounces:
                if b.x == c and b.y == r:
                    offy += b.offset()
            rect = pygame.Rect(offset_x + c * CELL, r * CELL + int(offy), CELL, CELL)
            pygame.draw.rect(surf, (24, 24, 30), rect, 1)

            if cell != ".":
                color = COLORS.get(cell, (200, 200, 200))
                inner = rect.inflate(-4, -4)
                pygame.draw.rect(surf, darker_color(color, 10), inner)
                glow = pygame.Surface((inner.width, inner.height), pygame.SRCALPHA)
                gc = lighter_color(color, 40)
                glow.fill((gc[0], gc[1], gc[2], 150))
                surf.blit(glow, inner.topleft)
                pygame.draw.rect(surf, lighter_color(color, 40), inner, 1)


def draw_grid_snapshot(surf, grid, offset_x=0):
    class _TempBoard:
        def __init__(self, g):
            self.grid = g
            self.lock_bounces = []

    draw_board(surf, _TempBoard(grid), offset_x=offset_x)

def draw_piece(surf, piece, offset_x=0, glow_pulse=0.0):
    local = pygame.Surface((CELL * 4, CELL * 4), pygame.SRCALPHA)
    for r in range(4):
        for c in range(4):
            ch = piece.shape()[r][c]
            if ch == ".":
                continue
            color = COLORS[ch]
            rect = pygame.Rect(c * CELL, r * CELL, CELL, CELL)
            inner = rect.inflate(-4, -4)

            # pulse
            pulse_amt = int(10 + 12 * glow_pulse)

            pygame.draw.rect(local, darker_color(color, 10), inner)
            glow = pygame.Surface((inner.width, inner.height), pygame.SRCALPHA)
            gc = lighter_color(color, 30 + pulse_amt)
            glow.fill((gc[0], gc[1], gc[2], 140))
            local.blit(glow, inner.topleft)
            pygame.draw.rect(local, lighter_color(color, 35 + pulse_amt), inner, 1)

    # rotation animation angle
    angle = 0
    if getattr(piece, "rotating", False):
        t = piece.rot_progress
        et = (1 - math.cos(t * math.pi)) / 2
        diff = (piece.rot_to - piece.rot_from) % 4
        if diff == 3:
            diff = -1
        angle = 90 * diff * et
        if t >= 1.0:
            piece.rotating = False
            piece.rotation = piece.rot_to
            piece.rot_progress = 0.0

    if abs(angle) > 0.01:
        rotated = pygame.transform.rotate(local, -angle)
        rw, rh = rotated.get_size()
        px = offset_x + piece.x * CELL + (CELL * 4) // 2 - rw // 2
        py = piece.y * CELL + int(getattr(piece, "fall_progress", 0)) + (CELL * 4) // 2 - rh // 2
        surf.blit(rotated, (px, py))
    else:
        px = offset_x + piece.x * CELL
        py = piece.y * CELL + int(getattr(piece, "fall_progress", 0))
        surf.blit(local, (px, py))

def draw_next_box(surf, piece, x, y, label="Next"):
    surf.blit(font.render(label + ":", True, (255, 255, 255)), (x, y))
    y0 = y + 25
    for r in range(4):
        for c in range(4):
            v = piece.shape()[r][c]
            rect = pygame.Rect(x + c * (CELL // 1), y0 + r * (CELL // 1), CELL, CELL)
            pygame.draw.rect(surf, (50, 50, 50), rect, 1)
            if v != ".":
                pygame.draw.rect(surf, COLORS[v], rect.inflate(-4, -4))

def draw_center_overlay(surf, title, subtitle=None):
    overlay = pygame.Surface((WINDOW_W, WINDOW_H), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 170))
    surf.blit(overlay, (0, 0))

    title_s = big_font.render(title, True, (255, 255, 255))
    surf.blit(title_s, (WINDOW_W // 2 - title_s.get_width() // 2, WINDOW_H // 2 - 60))

    if subtitle:
        sub_s = font.render(subtitle, True, (200, 200, 200))
        surf.blit(sub_s, (WINDOW_W // 2 - sub_s.get_width() // 2, WINDOW_H // 2 - 15))

# ----------------------------
# AI (heuristic)
# ----------------------------
def simulate_lock(grid, piece_kind, rot, x):
    """Return (new_grid, lines_cleared) after dropping a piece. If invalid placement, return (None, 0)."""
    grid = deepcopy(grid)
    p = Piece(piece_kind)
    p.rotation = rot % 4
    p.x = x
    p.y = 0

    # collision helper
    def coll(dx=0, dy=0):
        s = p.shape(p.rotation)
        for rr in range(4):
            for cc in range(4):
                v = s[rr][cc]
                if v == ".":
                    continue
                nx = p.x + cc + dx
                ny = p.y + rr + dy
                if nx < 0 or nx >= COLS or ny >= ROWS:
                    return True
                if ny >= 0 and grid[ny][nx] != ".":
                    return True
        return False

    # if spawn collides, invalid
    if coll(0, 0):
        return None, 0

    # drop
    while not coll(0, 1):
        p.y += 1

    # lock
    for cx, cy, v in p.cells(rot=p.rotation, x=p.x, y=p.y):
        if 0 <= cy < ROWS and 0 <= cx < COLS:
            grid[cy][cx] = v

    # clear lines
    cleared = [i for i, row in enumerate(grid) if all(cell != "." for cell in row)]
    if cleared:
        grid = [row for row in grid if any(cell == "." for cell in row)]
        while len(grid) < ROWS:
            grid.insert(0, ["." for _ in range(COLS)])
    return grid, len(cleared)

def board_features(grid):
    heights = [0] * COLS
    holes = 0
    for c in range(COLS):
        seen_block = False
        col_h = 0
        for r in range(ROWS):
            if grid[r][c] != ".":
                if not seen_block:
                    col_h = ROWS - r
                    seen_block = True
            else:
                if seen_block:
                    holes += 1
        heights[c] = col_h

    agg_height = sum(heights)
    bumpiness = sum(abs(heights[c] - heights[c + 1]) for c in range(COLS - 1))
    max_height = max(heights)

    return agg_height, holes, bumpiness, max_height

def evaluate_grid_score(grid, cleared):
    # tuned weights: stronger penalty for holes/bumpiness, reward clears
    W_AGG = -0.55
    W_HOLES = -1.35
    W_BUMP = -0.40
    W_LINES = 1.30
    W_MAXH = -0.12

    agg_h, holes, bump, max_h = board_features(grid)
    return (
        W_AGG * agg_h +
        W_HOLES * holes +
        W_BUMP * bump +
        W_LINES * cleared +
        W_MAXH * max_h
    )


def ai_best_move(grid, kind, next_kind=None, lookahead_weight=0.35):
    best = None
    best_score = -1e18

    for rot in range(4):
        # x range generous because pieces can hang outside 4x4 frame
        for x in range(-2, COLS + 2):
            new_grid, cleared = simulate_lock(grid, kind, rot, x)
            if new_grid is None:
                continue

            score = evaluate_grid_score(new_grid, cleared)

            # one-piece lookahead on the next piece makes choices less random
            if next_kind is not None and lookahead_weight > 0:
                next_best = -1e18
                for nrot in range(4):
                    for nx in range(-2, COLS + 2):
                        g2, c2 = simulate_lock(new_grid, next_kind, nrot, nx)
                        if g2 is None:
                            continue
                        next_best = max(next_best, evaluate_grid_score(g2, c2))
                if next_best > -1e17:
                    score += lookahead_weight * next_best

            if score > best_score:
                best_score = score
                best = (rot, x)

    # fallback
    if best is None:
        best = (0, COLS // 2 - 2)
    return best

# ----------------------------
# Game wrapper (engine + renderer-friendly)
# ----------------------------
class Game:
    def __init__(self, seed=None, ai_interval_ms=120, ai_lookahead_weight=0.35):
        self.board = Board()
        self.bag = Bag(seed=seed)
        self.current = Piece(self.bag.next_kind())
        self.next_piece = Piece(self.bag.next_kind())
        self.particles = []
        self.fall_speed = 500  # ms per cell
        self.soft_drop = False
        self.game_over = False
        self.lock_delay_ms = 500
        self.grounded_ms = 0
        self.last_move_was_rotate = False
        self.last_attack = 0
        self.last_t_spin = False
        self.last_perfect_clear = False
        self.last_clear_count = 0

        # rotation
        self.rotate_ms = 180.0

        # AI plan fields (used only for ai game)
        self.ai_plan = None
        self.ai_action_cooldown_ms = 0
        self.ai_action_interval_ms = ai_interval_ms
        self.ai_lookahead_weight = ai_lookahead_weight

    def spawn_next(self):
        self.current = self.next_piece
        self.next_piece = Piece(self.bag.next_kind())
        self.current.fall_progress = 0
        self.grounded_ms = 0
        self.last_move_was_rotate = False
        if self.board.collision(self.current):
            self.game_over = True

    def try_move(self, dx, dy):
        if not self.board.collision(self.current, dx=dx, dy=dy):
            self.current.x += dx
            self.current.y += dy
            if dy != 0:
                self.current.fall_progress = 0
            self.grounded_ms = 0
            self.last_move_was_rotate = False
            return True
        return False

    def try_rotate(self):
        new_rot = (self.current.rotation + 1) % 4
        kicks = [(0, 0), (-1, 0), (1, 0), (-2, 0), (2, 0), (0, -1)]
        for dx, dy in kicks:
            if not self.board.collision(self.current, dx=dx, dy=dy, rotation=new_rot):
                self.current.x += dx
                self.current.y += dy
                self.current.start_rotation(new_rot)
                self.grounded_ms = 0
                self.last_move_was_rotate = True
                return True
        return False

    def hard_drop(self):
        moved = False
        while not self.board.collision(self.current, dy=1):
            self.current.y += 1
            moved = True
        self.current.fall_progress = 0
        self.grounded_ms = self.lock_delay_ms
        return moved

    def detect_t_spin(self):
        if self.current.kind != "T" or not self.last_move_was_rotate:
            return False

        cx = self.current.x + 2
        cy = self.current.y + 1
        corners = [
            (cx - 1, cy - 1),
            (cx + 1, cy - 1),
            (cx - 1, cy + 1),
            (cx + 1, cy + 1),
        ]

        blocked = 0
        for x, y in corners:
            if x < 0 or x >= COLS or y < 0 or y >= ROWS:
                blocked += 1
            elif self.board.grid[y][x] != ".":
                blocked += 1

        return blocked >= 3

    def lock_current(self):
        t_spin = self.detect_t_spin()
        cleared_rows, attack, perfect_clear = self.board.lock(self.current, t_spin=t_spin)
        self.last_attack = attack
        self.last_t_spin = t_spin and len(cleared_rows) > 0
        self.last_perfect_clear = perfect_clear
        self.last_clear_count = len(cleared_rows)

        # particles for lock tiles
        for x, y, v in self.current.cells():
            if 0 <= y < ROWS:
                self.board.lock_bounces.append(Bounce(x, y))
                for _ in range(4):
                    px = x * CELL + random.uniform(0, CELL)
                    py = y * CELL + random.uniform(0, CELL)
                    self.particles.append(Particle(px, py, col=COLORS[v]))

        # particles for cleared rows
        if cleared_rows:
            for r in cleared_rows:
                for _ in range(16):
                    px = random.uniform(0, BOARD_W)
                    py = r * CELL + CELL / 2
                    self.particles.append(Particle(px, py, col=(255, 220, 120)))

        return len(cleared_rows)

    def update(self, dt_ms):
        if self.game_over:
            # still update effects a bit
            ndt = dt_ms / 1000.0
            self.particles = [p for p in self.particles if p.update(ndt)]
            self.board.lock_bounces = [b for b in self.board.lock_bounces if b.update(ndt)]
            return 0

        self.last_attack = 0
        self.last_t_spin = False
        self.last_perfect_clear = False
        self.last_clear_count = 0

        # falling logic
        keys = pygame.key.get_pressed()
        # soft drop only for human-controlled game; AI sets it in its own logic
        active_speed = max(50, self.fall_speed - (self.board.level - 1) * 30)
        if self.soft_drop:
            active_speed = max(20, active_speed // 6)

        pixels_per_ms = CELL / active_speed

        if not self.board.collision(self.current, dy=1):
            self.current.fall_progress += pixels_per_ms * dt_ms
            if self.current.fall_progress >= CELL:
                self.current.y += 1
                self.current.fall_progress -= CELL
            self.grounded_ms = 0
        else:
            self.current.fall_progress = 0
            self.grounded_ms += dt_ms
            if self.grounded_ms >= self.lock_delay_ms:
                cleared = self.lock_current()
                self.spawn_next()
                return cleared

        # update rotation progress
        if getattr(self.current, "rotating", False):
            self.current.rot_progress += dt_ms / self.rotate_ms
            if self.current.rot_progress >= 1.0:
                self.current.rot_progress = 1.0
                self.current.rotating = False
                self.current.rotation = self.current.rot_to

        # effects update
        ndt = dt_ms / 1000.0
        self.particles = [p for p in self.particles if p.update(ndt)]
        self.board.lock_bounces = [b for b in self.board.lock_bounces if b.update(ndt)]

        return 0

    def update_ai(self, dt_ms):
        """AI decides where to place current piece and performs actions gradually."""
        if self.game_over:
            return self.update(dt_ms)

        # compute/refresh plan
        if self.ai_plan is None:
            rot, x = ai_best_move(
                self.board.grid,
                self.current.kind,
                self.next_piece.kind,
                lookahead_weight=self.ai_lookahead_weight,
            )
            self.ai_plan = {"rot": rot, "x": x}
            self.ai_action_cooldown_ms = 0

        # act slower to look less robotic
        self.ai_action_cooldown_ms -= dt_ms
        if self.ai_action_cooldown_ms <= 0:
            self.ai_action_cooldown_ms = self.ai_action_interval_ms

            # rotate toward target
            target_rot = self.ai_plan["rot"] % 4
            if self.current.rotation != target_rot and not self.current.rotating:
                if self.try_rotate():
                    play(SND_ROTATE)

            # move toward target x
            elif self.current.x < self.ai_plan["x"]:
                if self.try_move(1, 0):
                    play(SND_MOVE)
            elif self.current.x > self.ai_plan["x"]:
                if self.try_move(-1, 0):
                    play(SND_MOVE)
            else:
                # once aligned, let gravity finish (more natural pace)
                pass

        # normal gravity update
        prev_piece = self.current
        cleared = self.update(dt_ms)

        # if gravity spawned a new piece, reset plan (critical for correctness)
        if self.current is not prev_piece:
            self.ai_plan = None
            play(SND_LOCK)
            if cleared > 0:
                play(SND_CLEAR)

        return cleared

# ----------------------------
# UI helpers
# ----------------------------
def draw_side_panel(surf, x, title, game: Game, highscore, is_ai=False):
    panel_rect = pygame.Rect(x, 0, SIDE_W, WINDOW_H)
    surf.fill((10, 10, 10), panel_rect)

    surf.blit(font.render(title, True, (255, 255, 255)), (x + 12, 10))

    surf.blit(font.render(f"Score: {game.board.score}", True, (255, 255, 255)), (x + 12, 45))
    surf.blit(font.render(f"Lines: {game.board.lines}", True, (255, 255, 255)), (x + 12, 70))
    surf.blit(font.render(f"Level: {game.board.level}", True, (255, 255, 255)), (x + 12, 95))

    if not is_ai:
        surf.blit(font.render(f"High: {highscore}", True, (255, 255, 255)), (x + 12, 125))

    # Next piece
    draw_next_box(surf, game.next_piece, x + 12, 160, label="Next")

    # Controls hint (only on player panel)
    if not is_ai:
        y = 330
        hints = [
            "Controls:",
            "← → move",
            "↑ rotate",
            "↓ soft drop",
            "SPACE hard drop",
            "ESC pause"
        ]
        for i, t in enumerate(hints):
            surf.blit(font.render(t, True, (200, 200, 200)), (x + 12, y + i * 22))

# ----------------------------
# Main loop (menu + Classic/VS AI/Sprint)
# ----------------------------
def main():
    state = STATE_START
    running = True
    highscore = load_highscore()
    progress = load_progress()
    unlocked = set(progress.get("achievements", []))
    total_xp = int(progress.get("xp", 0))
    notifications = []
    t_accum = 0.0

    menu_modes = [MODE_CLASSIC, MODE_VS_AI, MODE_VS_LOCAL, MODE_ONLINE, MODE_SPRINT]
    menu_labels = {
        MODE_CLASSIC: "Classic",
        MODE_VS_AI: "VS AI",
        MODE_VS_LOCAL: "VS Local",
        MODE_ONLINE: "Online (Room)",
        MODE_SPRINT: "Sprint (40 lines)",
    }
    menu_idx = 0
    active_mode = MODE_CLASSIC
    ai_diff_idx = 1
    active_ai_difficulty = AI_DIFFICULTIES[ai_diff_idx]

    player = None
    ai = None
    online = None
    online_ready = False
    online_status = ""
    online_sent_gameover = False
    remote_state = {
        "grid": [["." for _ in range(COLS)] for _ in range(ROWS)],
        "score": 0,
        "lines": 0,
        "game_over": False,
    }
    snapshot_timer_ms = 0
    sprint_target_lines = 40
    sprint_time_ms = 0
    sprint_complete = False

    # layout offsets
    player_x_single = PADDING
    player_x_vs = PADDING
    ai_x = PADDING * 2 + BOARD_W
    side_x = PADDING * 3 + BOARD_W * 2

    def save_progress_state():
        save_progress({"xp": total_xp, "achievements": sorted(list(unlocked))})

    def add_xp(amount):
        nonlocal total_xp
        if amount <= 0:
            return
        total_xp += int(amount)
        save_progress_state()

    def unlock_achievement(key, label, xp_gain=120):
        if key in unlocked:
            return
        unlocked.add(key)
        add_xp(xp_gain)
        notifications.append({"text": f"Unlocked: {label}", "ms": 3000})

    def start_mode(mode):
        nonlocal player, ai, online, online_ready, online_status, online_sent_gameover
        nonlocal remote_state, snapshot_timer_ms
        nonlocal state, active_mode, sprint_time_ms, sprint_complete, active_ai_difficulty
        seed = random.randrange(1_000_000)
        active_mode = mode
        player = Game(seed=seed)
        online_ready = False
        online_sent_gameover = False
        snapshot_timer_ms = 0
        remote_state = {
            "grid": [["." for _ in range(COLS)] for _ in range(ROWS)],
            "score": 0,
            "lines": 0,
            "game_over": False,
        }

        if online is not None:
            online.close()
            online = None

        if mode == MODE_VS_AI:
            active_ai_difficulty = AI_DIFFICULTIES[ai_diff_idx]
            cfg = AI_DIFFICULTY_SETTINGS[active_ai_difficulty]
            ai = Game(
                seed=seed + 1337,
                ai_interval_ms=cfg["interval_ms"],
                ai_lookahead_weight=cfg["lookahead_weight"],
            )
            online_status = ""
        elif mode == MODE_VS_LOCAL:
            ai = Game(seed=seed + 1337)
            online_status = ""
        elif mode == MODE_ONLINE:
            ai = None
            try:
                online = OnlineClient(ONLINE_HOST, ONLINE_PORT, ONLINE_ROOM, "Player")
                online.connect()
                online_status = f"Connected to {ONLINE_HOST}:{ONLINE_PORT} room '{ONLINE_ROOM}'"
            except Exception:
                online = None
                online_status = "Could not connect to online server"
        else:
            ai = None
            online_status = ""
        sprint_time_ms = 0
        sprint_complete = False
        state = STATE_PLAYING

    while running:
        dt_ms = clock.tick(FPS)
        dt = dt_ms / 1000.0
        t_accum += dt

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN:
                # MENU
                if state == STATE_START:
                    if event.key in (pygame.K_UP, pygame.K_w):
                        menu_idx = (menu_idx - 1) % len(menu_modes)
                    elif event.key in (pygame.K_DOWN, pygame.K_s):
                        menu_idx = (menu_idx + 1) % len(menu_modes)
                    elif event.key in (pygame.K_LEFT, pygame.K_a):
                        ai_diff_idx = (ai_diff_idx - 1) % len(AI_DIFFICULTIES)
                    elif event.key in (pygame.K_RIGHT, pygame.K_d):
                        ai_diff_idx = (ai_diff_idx + 1) % len(AI_DIFFICULTIES)
                    elif event.key in (pygame.K_RETURN, pygame.K_SPACE):
                        start_mode(menu_modes[menu_idx])
                    elif event.key == pygame.K_ESCAPE:
                        running = False
                    continue

                # GAMEOVER
                if state == STATE_GAMEOVER:
                    if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                        if online is not None:
                            online.close()
                            online = None
                        state = STATE_START
                    elif event.key == pygame.K_ESCAPE:
                        if online is not None:
                            online.close()
                            online = None
                        running = False
                    continue

                # PAUSE toggle
                if event.key == pygame.K_ESCAPE:
                    if state == STATE_PLAYING:
                        state = STATE_PAUSED
                    elif state == STATE_PAUSED:
                        state = STATE_PLAYING
                    continue

                # ignore gameplay input when paused
                if state != STATE_PLAYING or player is None:
                    continue

                # player controls
                if event.key == pygame.K_LEFT:
                    if player.try_move(-1, 0):
                        play(SND_MOVE)
                elif event.key == pygame.K_RIGHT:
                    if player.try_move(1, 0):
                        play(SND_MOVE)
                elif event.key == pygame.K_UP:
                    if player.try_rotate():
                        play(SND_ROTATE)
                elif event.key == pygame.K_SPACE:
                    if player.hard_drop():
                        play(SND_DROP)
                    cleared = player.lock_current()
                    play(SND_LOCK)
                    if cleared > 0:
                        play(SND_CLEAR)
                    player.spawn_next()

                # P2 controls in local versus
                if active_mode == MODE_VS_LOCAL and ai is not None:
                    if event.key == pygame.K_j:
                        if ai.try_move(-1, 0):
                            play(SND_MOVE)
                    elif event.key == pygame.K_l:
                        if ai.try_move(1, 0):
                            play(SND_MOVE)
                    elif event.key == pygame.K_i:
                        if ai.try_rotate():
                            play(SND_ROTATE)
                    elif event.key == pygame.K_u:
                        if ai.hard_drop():
                            play(SND_DROP)
                        cleared = ai.lock_current()
                        play(SND_LOCK)
                        if cleared > 0:
                            play(SND_CLEAR)
                        ai.spawn_next()

        # Soft drop is hold-based for player
        keys = pygame.key.get_pressed()
        if player is not None:
            player.soft_drop = (state == STATE_PLAYING) and keys[pygame.K_DOWN]
        if ai is not None and active_mode == MODE_VS_LOCAL:
            ai.soft_drop = (state == STATE_PLAYING) and keys[pygame.K_k]

        if online is not None:
            for msg in online.poll():
                mtype = msg.get("type")
                if mtype == "start":
                    seed = int(msg.get("seed", random.randrange(1_000_000)))
                    player = Game(seed=seed)
                    remote_state = {
                        "grid": [["." for _ in range(COLS)] for _ in range(ROWS)],
                        "score": 0,
                        "lines": 0,
                        "game_over": False,
                    }
                    online_ready = True
                    online_status = "Match started"
                elif mtype == "waiting":
                    online_ready = False
                    online_status = "Waiting for opponent..."
                elif mtype == "opponent_left":
                    online_ready = False
                    online_status = "Opponent left room"
                    remote_state["game_over"] = True
                elif mtype == "attack":
                    amount = int(msg.get("amount", 0))
                    if amount > 0 and player is not None:
                        player.board.add_garbage(amount)
                elif mtype == "snapshot":
                    grid = msg.get("grid")
                    if isinstance(grid, list) and len(grid) == ROWS:
                        parsed = []
                        ok = True
                        for row in grid:
                            if isinstance(row, str) and len(row) == COLS:
                                parsed.append(list(row))
                            else:
                                ok = False
                                break
                        if ok:
                            remote_state["grid"] = parsed
                    remote_state["score"] = int(msg.get("score", remote_state["score"]))
                    remote_state["lines"] = int(msg.get("lines", remote_state["lines"]))
                    remote_state["game_over"] = bool(msg.get("game_over", remote_state["game_over"]))
                elif mtype == "gameover":
                    remote_state["game_over"] = True
                elif mtype == "error":
                    online_status = str(msg.get("message", "Online error"))

        notifications = [n for n in notifications if n["ms"] > 0]
        for n in notifications:
            n["ms"] -= dt_ms

        # UPDATE
        if state == STATE_PLAYING and player is not None:
            if active_mode == MODE_VS_AI and ai is not None:
                cleared_p = player.update(dt_ms)
                if cleared_p > 0:
                    play(SND_CLEAR)
                    add_xp(cleared_p * 20 + (40 if player.last_t_spin else 0))

                cleared_ai = ai.update_ai(dt_ms)

                if player.last_attack > 0:
                    ai.board.add_garbage(player.last_attack)
                if ai.last_attack > 0:
                    player.board.add_garbage(ai.last_attack)

                if player.last_clear_count == 4:
                    unlock_achievement("first_tetris", "First Tetris")
                if player.last_t_spin:
                    unlock_achievement("first_tspin", "First T-Spin")
                if player.board.combo >= 5:
                    unlock_achievement("combo_5", "Combo x5")
                if player.last_perfect_clear:
                    unlock_achievement("perfect_clear", "Perfect Clear")

                if player.game_over or ai.game_over:
                    state = STATE_GAMEOVER
                    play(SND_GAMEOVER)
                    if player.board.score > highscore:
                        highscore = player.board.score
                        save_highscore(highscore)
                    if not player.game_over:
                        unlock_achievement("beat_ai", "Beat the AI", xp_gain=180)
            elif active_mode == MODE_VS_LOCAL and ai is not None:
                cleared_p = player.update(dt_ms)
                cleared_o = ai.update(dt_ms)

                if cleared_p > 0:
                    add_xp(cleared_p * 15)
                if player.last_attack > 0:
                    ai.board.add_garbage(player.last_attack)
                if ai.last_attack > 0:
                    player.board.add_garbage(ai.last_attack)

                if player.game_over or ai.game_over:
                    state = STATE_GAMEOVER
                    play(SND_GAMEOVER)
            elif active_mode == MODE_ONLINE and online is not None:
                if online_ready:
                    cleared_p = player.update(dt_ms)
                    if cleared_p > 0:
                        play(SND_CLEAR)
                        add_xp(cleared_p * 20 + (40 if player.last_t_spin else 0))

                    if player.last_attack > 0:
                        online.send({"type": "attack", "amount": int(player.last_attack)})

                    snapshot_timer_ms += dt_ms
                    if snapshot_timer_ms >= 150:
                        snapshot_timer_ms = 0
                        online.send(
                            {
                                "type": "snapshot",
                                "grid": ["".join(row) for row in player.board.grid],
                                "score": int(player.board.score),
                                "lines": int(player.board.lines),
                                "game_over": bool(player.game_over),
                            }
                        )

                    if player.game_over and not online_sent_gameover:
                        online.send({"type": "gameover"})
                        online_sent_gameover = True

                    if player.game_over or remote_state["game_over"]:
                        state = STATE_GAMEOVER
                        play(SND_GAMEOVER)
                        if player.board.score > highscore:
                            highscore = player.board.score
                            save_highscore(highscore)
                else:
                    snapshot_timer_ms = 0
            else:
                cleared_p = player.update(dt_ms)
                if cleared_p > 0:
                    play(SND_CLEAR)
                    add_xp(cleared_p * 15 + (40 if player.last_t_spin else 0))
                    if player.last_clear_count == 4:
                        unlock_achievement("first_tetris", "First Tetris")
                    if player.last_t_spin:
                        unlock_achievement("first_tspin", "First T-Spin")
                    if player.board.combo >= 5:
                        unlock_achievement("combo_5", "Combo x5")
                    if player.last_perfect_clear:
                        unlock_achievement("perfect_clear", "Perfect Clear")

                if active_mode == MODE_SPRINT and not sprint_complete:
                    sprint_time_ms += dt_ms
                    if player.board.lines >= sprint_target_lines:
                        sprint_complete = True
                        state = STATE_GAMEOVER
                        unlock_achievement("sprint_40", "Sprint 40 Completed", xp_gain=220)
                        if player.board.score > highscore:
                            highscore = player.board.score
                            save_highscore(highscore)
                elif player.game_over:
                    state = STATE_GAMEOVER
                    play(SND_GAMEOVER)
                    if player.board.score > highscore:
                        highscore = player.board.score
                        save_highscore(highscore)

        # DRAW
        draw_background(screen, dt)
        pulse = 0.5 + 0.5 * math.sin(t_accum * 2.0)
        border_col = (120, 80, 255) if state != STATE_GAMEOVER else (255, 80, 80)

        if state == STATE_START:
            draw_center_overlay(screen, "TETRIS", "Modes ↑/↓ | AI diff ←/→ | Enter start")
            y0 = WINDOW_H // 2 + 30
            for i, mode in enumerate(menu_modes):
                selected = (i == menu_idx)
                col = (255, 255, 255) if selected else (180, 180, 180)
                prefix = "> " if selected else "  "
                txt = font.render(prefix + menu_labels[mode], True, col)
                screen.blit(txt, (WINDOW_W // 2 - txt.get_width() // 2, y0 + i * 30))
            diff_label = f"AI Difficulty: {AI_DIFFICULTIES[ai_diff_idx]}"
            diff_txt = font.render(diff_label, True, (220, 220, 255))
            screen.blit(diff_txt, (WINDOW_W // 2 - diff_txt.get_width() // 2, y0 + len(menu_modes) * 30 + 18))
            tip = font.render("P2 controls (VS Local): J/L move, I rotate, K soft, U drop", True, (170, 170, 190))
            screen.blit(tip, (WINDOW_W // 2 - tip.get_width() // 2, y0 + len(menu_modes) * 30 + 50))
            pygame.display.flip()
            continue

        if player is not None:
            if active_mode in (MODE_VS_AI, MODE_VS_LOCAL, MODE_ONLINE):
                pygame.draw.rect(screen, border_col, (player_x_vs - 4, -4, BOARD_W + 8, BOARD_H + 8), 2)
                pygame.draw.rect(screen, border_col, (ai_x - 4, -4, BOARD_W + 8, BOARD_H + 8), 2)

                draw_board(screen, player.board, offset_x=player_x_vs)
                if active_mode == MODE_ONLINE:
                    draw_grid_snapshot(screen, remote_state["grid"], offset_x=ai_x)
                else:
                    draw_board(screen, ai.board, offset_x=ai_x)

                draw_piece(screen, player.current, offset_x=player_x_vs, glow_pulse=pulse)
                if active_mode != MODE_ONLINE and ai is not None:
                    draw_piece(screen, ai.current, offset_x=ai_x, glow_pulse=pulse)

                for p in player.particles:
                    p.draw(screen)
                if active_mode != MODE_ONLINE and ai is not None:
                    for p in ai.particles:
                        pp = Particle(p.x + ai_x, p.y, col=p.col)
                        pp.age = p.age
                        pp.life = p.life
                        pp.size = p.size
                        pp.draw(screen)

                draw_side_panel(screen, side_x, "PLAYER", player, highscore, is_ai=False)
                if active_mode == MODE_VS_AI:
                    opponent_label = "AI"
                elif active_mode == MODE_VS_LOCAL:
                    opponent_label = "P2"
                else:
                    opponent_label = "ONLINE"
                screen.blit(font.render(f"{opponent_label}:", True, (255, 255, 255)), (side_x + 12, 470))
                if active_mode == MODE_VS_AI:
                    screen.blit(font.render(f"Diff: {active_ai_difficulty}", True, (200, 200, 255)), (side_x + 12, 494))
                elif active_mode == MODE_VS_LOCAL:
                    screen.blit(font.render("Local Multiplayer", True, (200, 200, 255)), (side_x + 12, 494))
                else:
                    room_text = f"Room: {ONLINE_ROOM}"
                    screen.blit(font.render(room_text, True, (200, 200, 255)), (side_x + 12, 494))
                opp_score = ai.board.score if (ai is not None and active_mode != MODE_ONLINE) else int(remote_state["score"])
                opp_lines = ai.board.lines if (ai is not None and active_mode != MODE_ONLINE) else int(remote_state["lines"])
                screen.blit(font.render(f"Score: {opp_score}", True, (200, 200, 200)), (side_x + 12, 518))
                screen.blit(font.render(f"Lines: {opp_lines}", True, (200, 200, 200)), (side_x + 12, 542))
                screen.blit(font.render(f"XP: {total_xp}", True, (220, 220, 180)), (side_x + 12, 566))
            else:
                pygame.draw.rect(screen, border_col, (player_x_single - 4, -4, BOARD_W + 8, BOARD_H + 8), 2)
                draw_board(screen, player.board, offset_x=player_x_single)
                draw_piece(screen, player.current, offset_x=player_x_single, glow_pulse=pulse)
                for p in player.particles:
                    p.draw(screen)

                panel_title = "SPRINT" if active_mode == MODE_SPRINT else "CLASSIC"
                draw_side_panel(screen, side_x, panel_title, player, highscore, is_ai=False)
                if active_mode == MODE_SPRINT:
                    remain = max(0, sprint_target_lines - player.board.lines)
                    screen.blit(font.render(f"Goal: {sprint_target_lines}", True, (255, 255, 255)), (side_x + 12, 470))
                    screen.blit(font.render(f"Left: {remain}", True, (220, 220, 220)), (side_x + 12, 494))
                    sec = sprint_time_ms // 1000
                    mm = sec // 60
                    ss = sec % 60
                    screen.blit(font.render(f"Time: {mm:02d}:{ss:02d}", True, (220, 220, 220)), (side_x + 12, 518))
                screen.blit(font.render(f"XP: {total_xp}", True, (220, 220, 180)), (side_x + 12, 566))

        for i, n in enumerate(notifications[:3]):
            txt = font.render(n["text"], True, (255, 230, 130))
            screen.blit(txt, (24, 18 + i * 24))

        # overlays
        if state == STATE_PAUSED:
            draw_center_overlay(screen, "PAUSED", "Press ESC to resume")
        elif state == STATE_PLAYING and active_mode == MODE_ONLINE and not online_ready:
            subtitle = online_status if online_status else "Waiting for opponent..."
            draw_center_overlay(screen, "ONLINE", subtitle)
        elif state == STATE_GAMEOVER and player is not None:
            if active_mode in (MODE_VS_AI, MODE_VS_LOCAL, MODE_ONLINE):
                opp_game_over = remote_state["game_over"] if active_mode == MODE_ONLINE else (ai.game_over if ai is not None else False)
                opp_score = remote_state["score"] if active_mode == MODE_ONLINE else (ai.board.score if ai is not None else 0)
                if player.game_over and opp_game_over:
                    msg = "TIE (both topped out)"
                elif player.game_over:
                    if active_mode == MODE_VS_AI:
                        msg = "AI WINS"
                    elif active_mode == MODE_VS_LOCAL:
                        msg = "P2 WINS"
                    else:
                        msg = "OPPONENT WINS"
                else:
                    msg = "YOU WIN" if active_mode in (MODE_VS_AI, MODE_ONLINE) else "P1 WINS"
                if active_mode == MODE_ONLINE:
                    subtitle = f"{msg} — You {player.board.score} : Opp {opp_score}"
                else:
                    subtitle = f"{msg} — P1 {player.board.score} : P2 {ai.board.score}"
            elif active_mode == MODE_SPRINT:
                if sprint_complete:
                    sec = sprint_time_ms // 1000
                    mm = sec // 60
                    ss = sec % 60
                    subtitle = f"Sprint clear in {mm:02d}:{ss:02d} — Score {player.board.score}"
                else:
                    subtitle = f"Topped out — Lines {player.board.lines}/{sprint_target_lines}"
            else:
                subtitle = f"Score {player.board.score} — Lines {player.board.lines}"

            draw_center_overlay(screen, "GAME OVER", subtitle + " (Enter: menu, ESC: quit)")

        pygame.display.flip()

    if online is not None:
        online.close()
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
