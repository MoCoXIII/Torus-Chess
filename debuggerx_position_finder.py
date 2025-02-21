import tkinter as tk
import numpy as np
import random

class Chessboard:
    def __init__(self):
        self.size = 8
        self.board = np.full((self.size, self.size), '', dtype='<U1')  # Create an empty chessboard
        self.white_figures = ['K', 'Q', 'R', 'R', 'B', 'B', 'N', 'N', 
                              'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']  # Weiße Figuren
        self.black_figures = ['k', 'q', 'r', 'r', 'b', 'b', 'n', 'n', 
                              'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p']  # Schwarze Figuren
        self.place_figures()

    def place_figures(self):
        while True:
            random.shuffle(self.white_figures)  # Shuffle white pieces
            random.shuffle(self.black_figures)  # Shuffle black pieces
            self.board.fill('')  # Clear board
            positions = random.sample(range(64), 32)  # Randomly select 32 positions

            # First half for white, second half for black
            for pos, fig in zip(positions[:16], self.white_figures):
                row = pos // self.size
                col = pos % self.size
                self.board[row, col] = fig
            
            for pos, fig in zip(positions[16:], self.black_figures):
                row = pos // self.size
                col = pos % self.size
                self.board[row, col] = fig
            
            if self.is_valid_position():
                break

    def is_valid_position(self):
        # Check for check and unfair exchanges (this function should be implemented)
        # Currently, we return True to simulate a valid state.
        return True

    def display_board(self):
        board_str = '\n'.join([' '.join(row) for row in self.board])
        return board_str


class ChessGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Schachstellungsrechner")
        self.chessboard = Chessboard()
        self.create_board()

    def create_board(self):
        colors = ['#FFFFFF', '#A9A9A9']  # Weiß und Grau für das Schachbrett
        for r in range(8):
            for c in range(8):
                cell_color = colors[(r + c) % 2]  # Abwechselnde Farben
                fig = self.chessboard.board[r, c]
                text_color = 'red' if fig.isupper() else 'black'  # Rote Schrift für weiße Figuren, schwarze Schrift für schwarze Figuren
                cell = tk.Label(self.root, text=fig, 
                                width=4, height=2, borderwidth=1, relief="solid", 
                                bg=cell_color, font=("Arial", 24), fg=text_color)
                cell.grid(row=r, column=c)

        btn_refresh = tk.Button(self.root, text="Neu Berechnen", command=self.refresh_board)
        btn_refresh.grid(row=8, columnspan=8)

        self.create_legend()

    def create_legend(self):
        legend = tk.Label(self.root, text="Legende:\nK: König\nQ: Dame\nR: Turm\nB: Läufer\nN: Springer\nP: Bauer\nk: König (schwarz)\nq: Dame (schwarz)\nr: Turm (schwarz)\nb: Läufer (schwarz)\nn: Springer (schwarz)\np: Bauer (schwarz)", 
                          font=("Arial", 14))
        legend.grid(row=9, columnspan=8)

    def refresh_board(self):
        self.chessboard.place_figures()
        for r in range(8):
            for c in range(8):
                cell = self.root.grid_slaves(row=r, column=c)[0]
                fig = self.chessboard.board[r, c]
                text_color = 'red' if fig.isupper() else 'black'  # Rote Schrift für weiße Figuren, schwarze Schrift für schwarze Figuren
                cell.config(text=fig, fg=text_color)

if __name__ == "__main__":
    root = tk.Tk()
    gui = ChessGUI(root)
    root.mainloop()
