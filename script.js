const board = document.getElementById('chessboard');

const boardState = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null));

const initialPieces = {
  0: ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], // Black major pieces
  1: ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // Black pawns
  6: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // White pawns
  7: ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'], // White major pieces
};

// Initialize board state
for (let row = 0; row < 8; row++) {
  if (initialPieces[row]) {
    for (let col = 0; col < 8; col++) {
      boardState[row][col] = initialPieces[row][col];
    }
  }
}

// Create an 8x8 chessboard
const createBoard = () => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;

      if (boardState[row][col]) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.textContent = boardState[row][col];
        square.appendChild(piece);
      }

      board.appendChild(square);
    }
  }
};

const getPossibleMoves = (piece, fromRow, fromCol) => {
  const moves = [];
  const directions = {
    p: [[1, 0], [1, -1], [1, 1]], // Black pawn (simplified for brevity)
    P: [[-1, 0], [-1, -1], [-1, 1]], // White pawn
    r: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ], // Rook
    n: [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ], // Knight
    b: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ], // Bishop
    q: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ], // Queen
    k: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ], // King
  };

  const pieceType = piece.toLowerCase();
  if (!directions[pieceType]) return moves;

  for (const [dRow, dCol] of directions[pieceType]) {
    let newRow = (fromRow + dRow + 8) % 8;
    let newCol = (fromCol + dCol + 8) % 8;

    // Skip moves that land on pieces of the same color
    const target = boardState[newRow][newCol];
    if (target && piece.toUpperCase() === piece && target.toUpperCase() === target) continue;
    if (target && piece.toLowerCase() === piece && target.toLowerCase() === target) continue;

    moves.push([newRow, newCol]);
    if (pieceType === 'p' || pieceType === 'P') break; // Stop after one step for pawns
  }

  return moves;
};

const highlightMoves = (moves) => {
  const allSquares = document.querySelectorAll('.square');
  allSquares.forEach(square => square.classList.remove('highlight'));

  moves.forEach(([row, col]) => {
    const square = [...allSquares].find(
      sq => parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col
    );
    if (square) square.classList.add('highlight');
  });
};

// Handle piece movement and torus logic
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const piece = boardState[fromRow][fromCol];
  const possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
  const isValidMove = possibleMoves.some(
    ([row, col]) => row === toRow && col === toCol
  );

  if (isValidMove) {
    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;

    const allSquares = document.querySelectorAll('.square');
    const fromSquare = [...allSquares].find(
      sq =>
        parseInt(sq.dataset.row) === fromRow &&
        parseInt(sq.dataset.col) === fromCol
    );
    const toSquare = [...allSquares].find(
      sq =>
        parseInt(sq.dataset.row) === toRow &&
        parseInt(sq.dataset.col) === toCol
    );

    if (fromSquare && toSquare) {
      const movingPiece = fromSquare.querySelector('.piece');
      if (movingPiece) {
        toSquare.innerHTML = '';
        toSquare.appendChild(movingPiece);
        highlightMoves([]); // Clear highlights
      }
    }
  }
};


// Add event listeners for dragging and dropping
const enablePieceSelection = () => {
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach(piece => {
    piece.addEventListener('click', (e) => {
      const parent = e.target.parentElement;
      const fromRow = parseInt(parent.dataset.row);
      const fromCol = parseInt(parent.dataset.col);
      const piece = boardState[fromRow][fromCol];

      if (piece) {
        const possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
        highlightMoves(possibleMoves);
      }
    });
  });
};

// Call this after creating the board
createBoard();
enablePieceSelection();
