import random
from copy import deepcopy
import pprint


def ppnput(text):
    input(pprint.pformat(text, indent=1, width=80, depth=10, compact=True, sort_dicts=False, underscore_numbers=True))


class Piece:
    def __init__(self, type, color):
        self.type = type
        self.color = color

    def __repr__(self):
        representation = f"'{self.type.upper() if self.color == 'white' else self.type.lower()}'"
        return representation

class ChessPositionGenerator:
    def __init__(self):
        self.board = self.empty_board()
        self.white_pieces = []
        self.black_pieces = []
        self.standard_set = [
            'k', 'n', 'n', 'b', 'b', 'r', 'r', 
            'q'
        ]

    def generate_position(self):
        while True:
            try:
                self.board = self.empty_board()
                # print("Empty board")
                # ppnput(self.human_board())
                self.place_kings()
                # print("+ kings")
                # ppnput(self.human_board())
                self.place_pawns()
                # print("+ pawns")
                # ppnput(self.human_board())
                self.place_non_pawn_pieces()
                # print("+ other pieces")
                # ppnput(self.human_board())

                if self.is_valid_position(self.board):
                    # ppnput("Board is good.")
                    return self.board
                else:
                    ppnput("Board is bad.")
                    ppnput(self.human_board())
                    pass
            except Exception as e:
                ppnput(f"{e}")
                continue

    def human_board(self, board=None):
        if board is None:
            board = self.board
        
        return [['-' if cell is None else cell for cell in row] for row in board]

    def empty_board(self):
        return [[None for _ in range(8)] for _ in range(8)]

    def wrap(self, x, y):
        return (x + 8) % 8, (y + 8) % 8

    def place_kings(self):
        while True:
            wx, wy = random.randint(0,7), random.randint(0,7)
            # ppnput(f"Trying to place white king at {wx}, {wy}")
            bk_pos = self.wrap(wx, 7 - wy)
            # ppnput(f"Calculated black king position at {bk_pos}")

            if (
                (
                    wx == bk_pos[0]
                    and
                    wy == bk_pos[1]
                )
                or
                (
                    min(abs(wx - bk_pos[0]), 8 - abs(wx - bk_pos[0])) <= 1
                    and
                    min(abs(wy - bk_pos[1]), 8 - abs(wy - bk_pos[1])) <= 1
                )
            ):
                # ppnput(f"King overlap detected, retrying")
                continue  # Prevent overlapping kings

            self.board[wy][wx] = Piece(self.standard_set[0], 'white')
            self.board[bk_pos[1]][bk_pos[0]] = Piece(self.standard_set[0], 'black')
            # ppnput(self.board)

            if not self.under_attack((wx, wy), 'black') and \
               not self.under_attack(bk_pos, 'white'):
                # ppnput("King placement successful")
                break

            # ppnput("King placement failed: under attack")
            self.board[wy][wx] = None
            self.board[bk_pos[1]][bk_pos[0]] = None

    def place_non_pawn_pieces(self):
        white_pieces = self.standard_set.copy()
        white_pieces.remove(self.standard_set[0])
        # ppnput(f"White pieces: {white_pieces}")

        available = [(x, y) for x in range(8) for y in range(8)
                     if self.board[y][x] is None and self.board[7-y][x] is None]
        # ppnput(f"Available: {available}")

        random.shuffle(available)

        for piece_type in white_pieces:
            # ppnput(f"Placing {piece_type}")
            placed = False
            for (x, y) in available:
                # ppnput(f"Trying to place {piece_type} at {x}, {y}")
                if piece_type == 'b' and len([p for p in self.white_pieces if p.type == 'b']) == 1:
                    # ppnput("Is last bishop left.")
                    if (x + y) % 2 == (self.white_pieces[-1].x + self.white_pieces[-1].y) % 2:
                        # ppnput("Square is same color as other bishop, trying again.")
                        continue

                if self.safe_to_place(piece_type, (x, y)):
                    # ppnput("Got: Safe to place")
                    self.place_piece_pair(piece_type, (x, y))
                    # ppnput(f"Placed {piece_type} at {x}, {y}")
                    available.remove((x, y))
                    # ppnput(f"Removed {x}, {y} from available sqaures.")
                    placed = True
                    break
            if not placed:
                raise RuntimeError(f"Couldn't place piece {piece_type}")

    def safe_to_place(self, piece_type, pos):
        temp_board = deepcopy(self.board)
        # print(f"Initialized temp board")
        # ppnput(temp_board)
        x, y = pos
        # ppnput(f"Trying to place {piece_type} at {pos}")

        temp_board[y][x] = Piece(piece_type, 'white')
        temp_board[7-y][x] = Piece(piece_type, 'black')
        
        # print(f"New board might be:")
        # ppnput(self.human_board(temp_board))

        # wk_pos = next(( (i,j) for i in range(8) for j in range(8) if temp_board[j][i] and temp_board[j][i].type == self.standard_set[0]))
        # bk_pos = (wk_pos[0], 7 - wk_pos[1])
        # # ppnput(f"Suspecting white king at {wk_pos}, black king at {bk_pos}")

        # result = not self.under_attack(wk_pos, 'black', temp_board) and not self.under_attack(bk_pos, 'white', temp_board)

        # # ppnput(f"Both kings not under attack: {result}")
        
        result = self.is_valid_position(temp_board)

        return result

    def place_piece_pair(self, piece_type, pos):
        x, y = pos
        self.board[y][x] = Piece(piece_type, 'white')
        self.board[7-y][x] = Piece(piece_type, 'black')

    def place_pawns(self):
        available = [(x, y) for x in range(8) for y in range(8) if not self.board[y][x]]
        for _ in range(8):
            random.shuffle(available)
            for x, y in available:
                temp_board = deepcopy(self.board)
                temp_board[y][x] = Piece('p', 'white')
                temp_board[7-y][x] = Piece('p', 'black')
                if self.is_valid_position(temp_board):
                    self.board[y][x] = Piece('p', 'white')
                    self.board[7-y][x] = Piece('p', 'black')
                    available.remove((x, y))
                    break

    def under_attack(self, pos, attacker_color, board=None):
        if board is None:
            board = self.board
        x, y = pos

        # Check knight attacks
        for dx, dy in [(-2,-1), (-1,-2), (1,-2), (2,-1),
                       (-2,1), (-1,2), (1,2), (2,1)]:
            nx, ny = self.wrap(x + dx, y + dy)
            piece = board[ny][nx]
            if piece and piece.color == attacker_color and piece.type.lower() == 'n':
                # ppnput(f"Knight at {nx}, {ny} is attacking {x}, {y}")
                return True

        # Check sliding attacks
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1),
                       (-1,-1), (-1,1), (1,-1), (1,1)]:
            nx, ny = x, y
            for _ in range(20):
                nx, ny = self.wrap(nx + dx, ny + dy)
                piece = board[ny][nx]
                if piece:
                    if piece.color == attacker_color:
                        if (dx == 0 or dy == 0) and piece.type.lower() in ['r', 'q']:
                            # ppnput(f"H/V piece at {nx}, {ny} is attacking {x}, {y}")
                            return True
                        if (dx != 0 and dy != 0) and piece.type.lower() in ['b', 'q']:
                            # ppnput(f"Diagonally moving piece {piece.type} at {nx}, {ny} is attacking {x}, {y}")
                            return True
                    break

        if attacker_color == 'white':
            for dx, dy in [(-1,1), (1,1)]:
                nx, ny = self.wrap(x + dx, y + dy)
                piece = board[ny][nx]
                if piece and piece.color == attacker_color and piece.type.lower() == 'p':
                    # ppnput(f"White pawn at {nx}, {ny} is attacking {x}, {y}")
                    return True
        else:
            for dx, dy in [(-1,-1), (1,-1)]:
                nx, ny = self.wrap(x + dx, y + dy)
                piece = board[ny][nx]
                if piece and piece.color == attacker_color and piece.type.lower() == 'p':
                    # ppnput(f"Black pawn at {nx}, {ny} is attacking {x}, {y}")
                    return True

        return False

    def is_valid_position(self, board):
        # ppnput(self.human_board())
        
        for y, row in enumerate(board):
            for x, piece in enumerate(row):
                if piece:
                    opponent_color = 'black' if piece.color == 'white' else 'white'
                    if self.under_attack((x, y), opponent_color, board):
                        # ppnput(f"Piece at {x}, {y} is assumed to be under attack")
                        # ppnput(self.human_board(board))
                        return False
        # ppnput(f"All pieces are supposedly not under attack")
        # ppnput("Position is valid:")
        # ppnput(self.human_board(board))
        return True
    
    def position_to_fen(self, position):
        fen = ''
        for row in position:
            empty = 0
            for cell in row:
                if cell is None:
                    empty += 1
                else:
                    if empty > 0:
                        fen += str(empty)
                        empty = 0
                    fen += cell.type[0].upper() if cell.color == 'white' else cell.type[0].lower()
            if empty > 0:
                fen += str(empty)
            fen += '/'
        return fen[:-1]

def print_board(board):
    for row in board:
        print(' '.join([cell.__repr__() if cell else "'.'" for cell in row]))

if __name__ == "__main__":
    # ppnput("Generating position...")
    # generator = ChessPositionGenerator()
    # position = generator.generate_position()
    # print_board(position)

    import matplotlib.pyplot as plt
    import matplotlib.patches as patches

    def display_position(board):
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.set_xlim(0, 8)
        ax.set_ylim(0, 8)
        colors = ['#f0d9b5', '#b58863']  # light and dark squares

        # Draw the board
        for x in range(8):
            for y in range(8):
                color = colors[(x + y) % 2]
                ax.add_patch(patches.Rectangle((x, y), 1, 1, facecolor=color))

        # Draw the pieces
        pieces = ['p', 'r', 'n', 'b', 'q', 'k']

        for y, row in enumerate(board):
            for x, piece in enumerate(row):
                if piece:
                    # if piece.color == 'white':
                    piece_char = ['♟', '♜', '♞', '♝', '♛', '♚'][pieces.index(piece.type.lower())]
                    # else:
                    #     piece_char = ["♙", "♖", "♘", "♗", "♕", "♔"][pieces.index(piece.type.lower())]
                    ax.text(x + 0.5, y + 0.5, piece_char,
                            fontsize=32, ha='center', va='center', color='black' if piece.color == 'white' else 'white')

        ax.set_xticks([])
        ax.set_yticks([])
        
        ax.set_xticks(range(8))
        ax.set_xticklabels('abcdefgh')
        ax.set_yticks(range(8))
        ax.set_yticklabels('12345678')
                
        plt.show()

    # Example usage:
    generator = ChessPositionGenerator()
    position = generator.generate_position()
    print(generator.position_to_fen(position))
    display_position(position)
