import pygame
import random
import sys

# Configuration - EXACT SAME AS WEB
CELL = 28
COLS = 10
ROWS = 20
BOARD_W = COLS * CELL
BOARD_H = ROWS * CELL
FPS = 60

WIDTH = BOARD_W + 200
HEIGHT = BOARD_H

# Colors - EXACT SAME AS WEB
COLORS_MAP = {
    '.': (11, 11, 22),      # Background dark
    '1': (0, 255, 255),     # I - cyan
    '2': (255, 214, 80),    # O - amber
    '3': (220, 60, 255),    # T - magenta
    '4': (0, 255, 170),     # S - green
    '5': (255, 70, 120),    # Z - red/pink
    '6': (120, 170, 255),   # J - blue
    '7': (255, 160, 60),    # L - orange
    '8': (134, 134, 134),   # Garbage gray
}

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Sam Stackerz - Desktop')
clock = pygame.time.Clock()
font_small = pygame.font.SysFont('Consolas', 16)
font_medium = pygame.font.SysFont('Consolas', 20)
font_large = pygame.font.SysFont('Consolas', 24)

# Tetrominoes - EXACT SAME AS WEB
TETROMINOES = {
    'I': ['....', '1111', '....', '....'],
    'O': ['.22.', '.22.', '....', '....'],
    'T': ['.333', '..3.', '....', '....'],
    'S': ['..44', '.44.', '....', '....'],
    'Z': ['.55.', '..55', '....', '....'],
    'J': ['.6..', '.666', '....', '....'],
    'L': ['...7', '.777', '....', '....']
}



class RNG:
    """EXACT replica of web RNG"""
    def __init__(self, seed=None):
        if seed is None:
            seed = random.randint(1, 2147483646)
        self.state = seed if seed > 0 else 1
    
    def next(self):
        self.state = (self.state * 48271) % 2147483647
        return self.state / 2147483647


def rotate(shape):
    """Rotate a 4x4 shape 90 degrees clockwise - EXACT replica"""
    out = []
    for c in range(4):
        row = ''
        for r in range(3, -1, -1):
            row += shape[r][c]
        out.append(row)
    return out


def create_empty_grid():
    """Create empty grid"""
    return [['.' for _ in range(COLS)] for _ in range(ROWS)]


class Game:
    """EXACT replica of web Game class"""
    def __init__(self, seed=None):
        if seed is None:
            seed = random.randint(1, 1000000)
        self.seed = seed
        self.rng = RNG(self.seed)
        self.reset()
    
    def reset(self):
        self.grid = create_empty_grid()
        self.score = 0
        self.lines = 0
        self.level = 1
        self.combo = -1
        self.back_to_back = False
        self.game_over = False
        self.last_attack = 0
        self.bag = []
        self.next = self.make_piece(self.next_kind())
        self.current = self.make_piece(self.next_kind())
        self.spawn(self.current)
        self.fall_ms = 0
        self.lock_delay_ms = 500
        self.grounded_ms = 0
        self.soft_drop = False
        self.last_move_was_rotate = False
    
    def next_kind(self):
        if not self.bag:
            self.bag = list(TETROMINOES.keys())
            # Shuffle using RNG
            for i in range(len(self.bag) - 1, 0, -1):
                j = int(self.rng.next() * (i + 1))
                self.bag[i], self.bag[j] = self.bag[j], self.bag[i]
        return self.bag.pop()
    
    def make_piece(self, kind):
        rotations = [TETROMINOES[kind]]
        for _ in range(3):
            rotations.append(rotate(rotations[-1]))
        return {
            'kind': kind,
            'rotation': 0,
            'x': 3,
            'y': 0,
            'rotations': rotations
        }
    
    def spawn(self, piece):
        piece['x'] = 3
        piece['y'] = 0
        piece['rotation'] = 0
        self.current = piece
        self.last_move_was_rotate = False
        self.grounded_ms = 0
        if self.collide(self.current, 0, 0):
            self.game_over = True
    
    def shape(self, piece, rot=None):
        if rot is None:
            rot = piece['rotation']
        return piece['rotations'][(rot + 4) % 4]
    
    def collide(self, piece, dx, dy, rot=None):
        if rot is None:
            rot = piece['rotation']
        s = self.shape(piece, rot)
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v == '.':
                    continue
                nx = piece['x'] + c + dx
                ny = piece['y'] + r + dy
                if nx < 0 or nx >= COLS or ny >= ROWS:
                    return True
                if ny >= 0 and self.grid[ny][nx] != '.':
                    return True
        return False
    
    def move(self, dx, dy):
        if not self.collide(self.current, dx, dy):
            self.current['x'] += dx
            self.current['y'] += dy
            self.grounded_ms = 0
            self.last_move_was_rotate = False
            return True
        return False
    
    def rotate_current(self):
        new_rot = (self.current['rotation'] + 1) % 4
        kicks = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, -1]]
        for dx, dy in kicks:
            if not self.collide(self.current, dx, dy, new_rot):
                self.current['x'] += dx
                self.current['y'] += dy
                self.current['rotation'] = new_rot
                self.last_move_was_rotate = True
                self.grounded_ms = 0
                return True
        return False
    
    def hard_drop(self):
        while not self.collide(self.current, 0, 1):
            self.current['y'] += 1
        self.grounded_ms = self.lock_delay_ms
    
    def detect_t_spin(self):
        if self.current['kind'] != 'T' or not self.last_move_was_rotate:
            return False
        cx = self.current['x'] + 2
        cy = self.current['y'] + 1
        corners = [[cx - 1, cy - 1], [cx + 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy + 1]]
        blocked = 0
        for x, y in corners:
            if x < 0 or x >= COLS or y < 0 or y >= ROWS:
                blocked += 1
            elif self.grid[y][x] != '.':
                blocked += 1
        return blocked >= 3
    
    def lock_piece(self):
        self.last_attack = 0
        s = self.shape(self.current)
        for r in range(4):
            for c in range(4):
                v = s[r][c]
                if v == '.':
                    continue
                x = self.current['x'] + c
                y = self.current['y'] + r
                if 0 <= y < ROWS and 0 <= x < COLS:
                    self.grid[y][x] = v
        
        t_spin = self.detect_t_spin()
        cleared_rows = []
        for r in range(ROWS):
            if all(cell != '.' for cell in self.grid[r]):
                cleared_rows.append(r)
        cleared = len(cleared_rows)
        
        if cleared > 0:
            self.combo += 1
            self.grid = [row for idx, row in enumerate(self.grid) if idx not in cleared_rows]
            while len(self.grid) < ROWS:
                self.grid.insert(0, ['.' for _ in range(COLS)])
        else:
            self.combo = -1
        
        base = 0
        attack = 0
        if t_spin:
            base = [0, 800, 1200, 1600][cleared if cleared < 4 else 0]
            attack = [0, 2, 4, 6][cleared if cleared < 4 else 0]
        else:
            base = [0, 100, 300, 500, 800][cleared if cleared < 5 else 0]
            attack = [0, 0, 1, 2, 4][cleared if cleared < 5 else 0]
        
        b2b_eligible = (t_spin and cleared > 0) or cleared == 4
        if b2b_eligible:
            if self.back_to_back:
                base = int(base * 1.5)
                attack += 1
            self.back_to_back = True
        elif cleared > 0:
            self.back_to_back = False
        
        combo_bonus = max(0, self.combo) * 50
        attack += max(0, self.combo - 1)
        
        perfect_clear = cleared > 0 and all(all(cell == '.' for cell in row) for row in self.grid)
        if perfect_clear:
            base += 2000
            attack += 6
        
        self.lines += cleared
        self.level = 1 + self.lines // 10
        self.score += (base + combo_bonus) * self.level
        self.last_attack = attack
        
        self.spawn(self.next)
        self.next = self.make_piece(self.next_kind())
    
    def update(self, dt_ms):
        if self.game_over:
            return
        self.last_attack = 0
        
        speed = 45 if self.soft_drop else max(80, 700 - (self.level - 1) * 45)
        self.fall_ms += dt_ms
        
        while self.fall_ms >= speed:
            self.fall_ms -= speed
            if not self.collide(self.current, 0, 1):
                self.current['y'] += 1
                self.grounded_ms = 0
            else:
                self.grounded_ms += speed
                if self.grounded_ms >= self.lock_delay_ms:
                    self.lock_piece()
                    break


def draw_cell(surface, x, y, color_key):
    """Draw a single cell"""
    color = COLORS_MAP.get(color_key, (255, 255, 255))
    rect = pygame.Rect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2)
    pygame.draw.rect(surface, color, rect)


def draw_grid_background(surface):
    """Draw grid background"""
    surface.fill(COLORS_MAP['.'])
    for r in range(ROWS):
        for c in range(COLS):
            rect = pygame.Rect(c * CELL, r * CELL, CELL, CELL)
            pygame.draw.rect(surface, (31, 31, 53), rect, 1)


def draw_grid(surface, grid):
    """Draw grid cells"""
    for r in range(ROWS):
        for c in range(COLS):
            v = grid[r][c]
            if v != '.':
                draw_cell(surface, c, r, v)


def draw_piece(surface, piece):
    """Draw falling piece"""
    shape = piece['rotations'][piece['rotation']]
    for r in range(4):
        for c in range(4):
            v = shape[r][c]
            if v == '.':
                continue
            x = piece['x'] + c
            y = piece['y'] + r
            if y >= 0:
                draw_cell(surface, x, y, v)


def main():
    """Main game loop"""
    game = Game()
    running = True
    paused = False
    
    # Create board surface
    board_surface = pygame.Surface((BOARD_W, BOARD_H))
    
    while running:
        dt = clock.tick(FPS) / 1000.0 * 1000  # Convert to ms
        
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_p:
                    paused = not paused
                elif not game.game_over and not paused:
                    if event.key == pygame.K_LEFT:
                        game.move(-1, 0)
                    elif event.key == pygame.K_RIGHT:
                        game.move(1, 0)
                    elif event.key == pygame.K_UP:
                        game.rotate_current()
                    elif event.key == pygame.K_DOWN:
                        game.soft_drop = True
                    elif event.key == pygame.K_SPACE:
                        game.hard_drop()
            elif event.type == pygame.KEYUP:
                if event.key == pygame.K_DOWN:
                    game.soft_drop = False
        
        # Update game
        if not game.game_over and not paused:
            game.update(dt)
        
        # Draw board
        draw_grid_background(board_surface)
        draw_grid(board_surface, game.grid)
        if not game.game_over:
            draw_piece(board_surface, game.current)
        
        # Draw to screen
        screen.fill((0, 0, 0))
        screen.blit(board_surface, (0, 0))
        
        # Draw info panel
        info_x = BOARD_W + 20
        texts = [
            ("SAM STACKERZ", 24, (255, 255, 255)),
            ("", 16, (255, 255, 255)),
            (f"Score: {game.score}", 16, (0, 255, 255)),
            (f"Lines: {game.lines}", 16, (0, 255, 255)),
            (f"Level: {game.level}", 16, (0, 255, 255)),
            ("", 16, (255, 255, 255)),
            ("Controls:", 16, (220, 60, 255)),
            ("← → Move", 14, (255, 255, 255)),
            ("↑ Rotate", 14, (255, 255, 255)),
            ("↓ Soft Drop", 14, (255, 255, 255)),
            ("Space Hard Drop", 14, (255, 255, 255)),
            ("P Pause", 14, (255, 255, 255)),
            ("ESC Quit", 14, (255, 255, 255)),
        ]
        
        y = 20
        for text, size, color in texts:
            if size == 24:
                surf = font_large.render(text, True, color)
            elif size == 20:
                surf = font_medium.render(text, True, color)
            else:
                surf = font_small.render(text, True, color)
            screen.blit(surf, (info_x, y))
            y += size + 5
        
        # Draw status
        if paused:
            pause_text = font_large.render("PAUSED", True, (255, 0, 0))
            text_rect = pause_text.get_rect(center=(BOARD_W // 2, BOARD_H // 2))
            screen.blit(pause_text, text_rect)
        elif game.game_over:
            gameover_text = font_large.render("GAME OVER", True, (255, 0, 0))
            text_rect = gameover_text.get_rect(center=(BOARD_W // 2, BOARD_H // 2))
            screen.blit(gameover_text, text_rect)
        
        pygame.display.flip()
    
    pygame.quit()


if __name__ == '__main__':
    main()