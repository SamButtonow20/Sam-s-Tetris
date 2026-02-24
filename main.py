import pygame
import random
import sys
import math

# Configuration
CELL = 30
COLS = 10
ROWS = 20
WIDTH = CELL * COLS
HEIGHT = CELL * ROWS
FPS = 60

pygame.init()
screen = pygame.display.set_mode((WIDTH + 150, HEIGHT))
pygame.display.set_caption('Tetris')
clock = pygame.time.Clock()
font = pygame.font.SysFont('Consolas', 20)

# --- NEW: Game states ---
STATE_START = "start"
STATE_PLAYING = "playing"
STATE_PAUSED = "paused"
STATE_GAMEOVER = "gameover"

TETROMINOES = {
    'I': [[
        '....',
        '1111',
        '....',
        '....'
    ]],
    'O': [[
        '.22.',
        '.22.',
        '....',
        '....'
    ]],
    'T': [[
        '.333',
        '..3.',
        '....',
        '....'
    ]],
    'S': [[
        '..44',
        '.44.',
        '....',
        '....'
    ]],
    'Z': [[
        '.55.',
        '..55',
        '....',
        '....'
    ]],
    'J': [[
        '.6..',
        '.666',
        '....',
        '....'
    ]],
    'L': [[
        '...7',
        '.777',
        '....',
        '....'
    ]]
}

COLORS = {
    '1': (0, 255, 255),    # I - neon cyan (brighter)
    '2': (255, 220, 80),   # O - neon amber (more saturated)
    '3': (220, 60, 255),   # T - neon magenta (punchier)
    '4': (0, 255, 170),    # S - neon green (brighter)
    '5': (255, 70, 120),   # Z - neon red/pink (richer)
    '6': (120, 170, 255),  # J - neon blue (brighter)
    '7': (255, 160, 60)    # L - neon orange (warmer)
}


def rotate(shape):
    """Rotate a 4x4 shape 90 degrees clockwise."""
    return [''.join(row[col] for row in shape[::-1]) for col in range(4)]


class Piece:
    def __init__(self, kind=None):
        if kind is None:
            kind = random.choice(list(TETROMINOES.keys()))
        self.kind = kind
        self.rotation = 0
        base = TETROMINOES[kind][0]
        # Precompute rotations
        self.rotations = [base]
        for _ in range(3):
            self.rotations.append(rotate(self.rotations[-1]))
        self.x = COLS // 2 - 2
        self.y = 0
        self.fall_progress = 0  # pixels progressed toward next row
        # rotation animation
        self.rotating = False
        self.rot_from = self.rotation
        self.rot_to = self.rotation
        self.rot_progress = 0.0

    def shape(self):
        return self.rotations[self.rotation % 4]

    def start_rotation(self, new_rot):
        if self.rotating:
            return
        self.rot_from = self.rotation
        self.rot_to = new_rot % 4
        self.rot_progress = 0.0
        self.rotating = True

    def cells(self):
        s = self.shape()
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v != '.':
                    yield (self.x + c, self.y + r, v)


class Board:
    def __init__(self):
        self.grid = [['.' for _ in range(COLS)] for _ in range(ROWS)]
        self.score = 0
        self.level = 1
        self.lines = 0
        self.lock_bounces = []

    def inside(self, x, y):
        return 0 <= x < COLS and y < ROWS

    def collision(self, piece, dx=0, dy=0, rotation=None):
        rot = piece.rotation if rotation is None else rotation
        s = piece.rotations[rot % 4]
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v == '.':
                    continue
                nx = piece.x + c + dx
                ny = piece.y + r + dy
                if nx < 0 or nx >= COLS or ny >= ROWS:
                    return True
                if ny >= 0 and self.grid[ny][nx] != '.':
                    return True
        return False

    def lock(self, piece):
        for x, y, v in piece.cells():
            if 0 <= y < ROWS and 0 <= x < COLS:
                self.grid[y][x] = v
        cleared_rows = self.clear_lines()
        cleared = len(cleared_rows)
        self.lines += cleared
        self.score += [0, 40, 100, 300, 1200][cleared] * self.level
        return cleared_rows

    def clear_lines(self):
        cleared_rows = [i for i, row in enumerate(self.grid) if all(cell != '.' for cell in row)]
        if not cleared_rows:
            return []
        new_grid = [row for row in self.grid if any(cell == '.' for cell in row)]
        while len(new_grid) < ROWS:
            new_grid.insert(0, ['.' for _ in range(COLS)])
        self.grid = new_grid
        return cleared_rows


def lighter_color(col, amt=30):
    return tuple(min(255, c + amt) for c in col)


def darker_color(col, amt=30):
    return tuple(max(0, c - amt) for c in col)


def draw_board(surf, board, offset_x=0):
    top = (6, 0, 24)
    bottom = (2, 0, 48)
    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        pygame.draw.line(surf, (r, g, b), (offset_x, y), (offset_x + WIDTH, y))

    vignette = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    for i in range(200):
        a = int(120 * (i / 200))
        pygame.draw.rect(vignette, (0, 0, 0, a), (-i, -i, WIDTH + i * 2, HEIGHT + i * 2), 1)
    surf.blit(vignette, (offset_x, 0))

    for r in range(ROWS):
        for c in range(COLS):
            cell = board.grid[r][c]
            offy = 0
            for b in board.lock_bounces:
                if b.x == c and b.y == r:
                    offy += b.offset()
            rect = pygame.Rect(offset_x + c * CELL, r * CELL + int(offy), CELL, CELL)
            pygame.draw.rect(surf, (24, 24, 30), rect, 1)
            if cell != '.':
                color = COLORS[cell]
                inner = rect.inflate(-4, -4)
                pygame.draw.rect(surf, darker_color(color, 10), inner)
                glow = pygame.Surface((inner.width, inner.height), pygame.SRCALPHA)
                gc = lighter_color(color, 40)
                glow.fill((gc[0], gc[1], gc[2], 160))
                surf.blit(glow, inner.topleft)
                pygame.draw.rect(surf, lighter_color(color, 40), inner, 1)


def draw_piece(surf, piece, offset_x=0):
    local = pygame.Surface((CELL * 4, CELL * 4), pygame.SRCALPHA)
    for r in range(4):
        for c in range(4):
            ch = piece.shape()[r][c]
            if ch == '.':
                continue
            color = COLORS[ch]
            rect = pygame.Rect(c * CELL, r * CELL, CELL, CELL)
            inner = rect.inflate(-4, -4)
            pygame.draw.rect(local, darker_color(color, 10), inner)
            glow = pygame.Surface((inner.width, inner.height), pygame.SRCALPHA)
            gc = lighter_color(color, 40)
            glow.fill((gc[0], gc[1], gc[2], 150))
            local.blit(glow, inner.topleft)
            pygame.draw.rect(local, lighter_color(color, 40), inner, 1)

    angle = 0
    if getattr(piece, 'rotating', False):
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
        py = piece.y * CELL + int(getattr(piece, 'fall_progress', 0)) + (CELL * 4) // 2 - rh // 2
        surf.blit(rotated, (px, py))
    else:
        px = offset_x + piece.x * CELL
        py = piece.y * CELL + int(getattr(piece, 'fall_progress', 0))
        surf.blit(local, (px, py))


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
    def __init__(self, x, y):
        self.x = x
        self.y = y
        angle = random.uniform(0, math.pi * 2)
        speed = random.uniform(50, 220)
        self.vx = math.cos(angle) * speed
        self.vy = math.sin(angle) * speed - 120
        self.life = random.uniform(0.4, 0.9)
        self.age = 0
        self.size = random.uniform(2, 5)
        self.color = (255, 220, 120)
        self.col = None

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
        base = self.col if self.col is not None else self.color
        col = (base[0], base[1], base[2], alpha)
        s = pygame.Surface((int(self.size), int(self.size)), pygame.SRCALPHA)
        s.fill(col)
        surf.blit(s, (self.x - self.size / 2, self.y - self.size / 2))


def draw_ui(surf, board, next_piece):
    x0 = WIDTH + 10
    surf.fill((10, 10, 10), (WIDTH, 0, 150, HEIGHT))
    surf.blit(font.render(f'Score: {board.score}', True, (255, 255, 255)), (x0, 10))
    surf.blit(font.render(f'Lines: {board.lines}', True, (255, 255, 255)), (x0, 40))
    surf.blit(font.render(f'Level: {board.level}', True, (255, 255, 255)), (x0, 70))

    surf.blit(font.render('Next:', True, (255, 255, 255)), (x0, 110))
    for r in range(4):
        for c in range(4):
            v = next_piece.shape()[r][c]
            rect = pygame.Rect(x0 + c * CELL, 140 + r * CELL, CELL, CELL)
            pygame.draw.rect(surf, (50, 50, 50), rect, 1)
            if v != '.':
                pygame.draw.rect(surf, COLORS[v], rect.inflate(-2, -2))


# --- NEW: overlay helper for START/PAUSE/GAMEOVER ---
def draw_center_overlay(surf, title, subtitle=None):
    overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    overlay.fill((0, 0, 0, 160))
    surf.blit(overlay, (0, 0))

    title_surf = font.render(title, True, (255, 255, 255))
    surf.blit(title_surf, (WIDTH // 2 - title_surf.get_width() // 2, HEIGHT // 2 - 30))

    if subtitle:
        sub_surf = font.render(subtitle, True, (200, 200, 200))
        surf.blit(sub_surf, (WIDTH // 2 - sub_surf.get_width() // 2, HEIGHT // 2 + 5))


# --- UPDATED MAIN ---
def main():
    board = Board()
    current = Piece()
    next_piece = Piece()
    particles = []

    fall_speed = 500  # ms per cell
    running = True

    state = STATE_START

    while running:
        dt = clock.tick(FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

            elif event.type == pygame.KEYDOWN:
                # START SCREEN
                if state == STATE_START:
                    if event.key == pygame.K_SPACE:
                        state = STATE_PLAYING
                    elif event.key == pygame.K_ESCAPE:
                        running = False
                    continue

                # GAME OVER: ESC quits
                if state == STATE_GAMEOVER:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    continue

                # ESC toggles pause while playing
                if event.key == pygame.K_ESCAPE:
                    if state == STATE_PLAYING:
                        state = STATE_PAUSED
                    elif state == STATE_PAUSED:
                        state = STATE_PLAYING
                    continue

                # ignore gameplay input while paused
                if state == STATE_PAUSED:
                    continue

                # gameplay input
                if event.key == pygame.K_LEFT:
                    if not board.collision(current, dx=-1):
                        current.x -= 1
                elif event.key == pygame.K_RIGHT:
                    if not board.collision(current, dx=1):
                        current.x += 1
                elif event.key == pygame.K_DOWN:
                    if not board.collision(current, dy=1):
                        current.y += 1
                        current.fall_progress = 0
                elif event.key == pygame.K_UP:
                    new_rot = (current.rotation + 1) % 4
                    if not board.collision(current, rotation=new_rot):
                        current.start_rotation(new_rot)
                elif event.key == pygame.K_SPACE:
                    # hard drop
                    while not board.collision(current, dy=1):
                        current.y += 1
                    current.fall_progress = 0

                    cleared_rows = board.lock(current)
                    if cleared_rows:
                        for r in cleared_rows:
                            for _ in range(18):
                                px = random.uniform(0, WIDTH)
                                py = r * CELL + CELL / 2
                                particles.append(Particle(px, py))

                    for x, y, v in current.cells():
                        if 0 <= y < ROWS:
                            board.lock_bounces.append(Bounce(x, y))
                            for _ in range(6):
                                px = x * CELL + random.uniform(0, CELL)
                                py = y * CELL + random.uniform(0, CELL)
                                p = Particle(px, py)
                                p.col = COLORS[v]
                                particles.append(p)

        # UPDATE only when playing
        if state == STATE_PLAYING:
            keys = pygame.key.get_pressed()
            soft_drop = keys[pygame.K_DOWN]

            active_speed = max(50, fall_speed - (board.level - 1) * 30)
            if soft_drop:
                active_speed = max(20, active_speed // 6)

            pixels_per_ms = CELL / active_speed

            if not board.collision(current, dy=1):
                current.fall_progress += pixels_per_ms * dt
                if current.fall_progress >= CELL:
                    current.y += 1
                    current.fall_progress -= CELL
            else:
                current.fall_progress = 0
                cleared_rows = board.lock(current)

                if cleared_rows:
                    for r in cleared_rows:
                        for _ in range(18):
                            px = random.uniform(0, WIDTH)
                            py = r * CELL + CELL / 2
                            particles.append(Particle(px, py))

                    for x, y, v in current.cells():
                        if 0 <= y < ROWS:
                            board.lock_bounces.append(Bounce(x, y))
                            for _ in range(6):
                                px = x * CELL + random.uniform(0, CELL)
                                py = y * CELL + random.uniform(0, CELL)
                                p = Particle(px, py)
                                p.col = COLORS[v]
                                particles.append(p)

                current = next_piece
                next_piece = Piece()
                current.fall_progress = 0

                if board.collision(current):
                    state = STATE_GAMEOVER

            # rotation progress
            rotate_ms = 180.0
            if getattr(current, 'rotating', False):
                current.rot_progress += dt / rotate_ms
                if current.rot_progress >= 1.0:
                    current.rot_progress = 1.0
                    current.rotating = False
                    current.rotation = current.rot_to

        # particles + bounces update (keep these running even on pause/start; remove if you want frozen pause)
        ndt = dt / 1000.0
        particles = [p for p in particles if p.update(ndt)]
        board.lock_bounces = [b for b in board.lock_bounces if b.update(ndt)]

        # DRAW
        screen.fill((0, 0, 0))
        draw_board(screen, board)
        draw_piece(screen, current)
        for p in particles:
            p.draw(screen)
        draw_ui(screen, board, next_piece)

        if state == STATE_START:
            draw_center_overlay(screen, "TETRIS", "Press SPACE to start (ESC to quit)")
        elif state == STATE_PAUSED:
            draw_center_overlay(screen, "PAUSED", "Press ESC to resume")
        elif state == STATE_GAMEOVER:
            draw_center_overlay(screen, "GAME OVER", "Press ESC to quit")

        pygame.display.flip()

    pygame.quit()
    sys.exit()


if __name__ == '__main__':
    main()