document.getElementById('version').textContent = 'Version 0.2024.11.30.15.x';

const board = document.getElementById('chessboard');

let currentTurn = 'white'; // 'white' begins the game

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

const isOpponentPiece = (targetSquare, isWhite) => {
  return targetSquare &&
    targetSquare !== null &&
    (isWhite ? targetSquare === targetSquare.toUpperCase() : targetSquare === targetSquare.toLowerCase());
};

const getPossibleMoves = (piece, fromRow, fromCol) => {
  const moves = [];

  if (!piece) return moves;

  // Determine if the piece is white or black
  const isWhite = piece === piece.toUpperCase();
  const opponentColor = isWhite ? 'black' : 'white';

  if (piece.toLowerCase() === 'p') {
    // Pawn movement
    const direction = isWhite ? -1 : 1; // White moves up, Black moves down
    const startRow = isWhite ? 6 : 1; // Starting row for pawns

    // Regular move
    if (!boardState[fromRow + direction][fromCol]) {
      moves.push([fromRow + direction, fromCol]);

      // Double move from start position
      if (fromRow === startRow && !boardState[fromRow + 2 * direction][fromCol]) {
        moves.push([fromRow + 2 * direction, fromCol]);
      }
    }

    // Captures (ensure it's an opponent's piece)
    if (
      boardState[fromRow + direction][fromCol - 1] && // Piece to the left
      (boardState[fromRow + direction][fromCol - 1] !== null &&
        ((boardState[fromRow + direction][fromCol - 1].toUpperCase() === boardState[fromRow + direction][fromCol - 1]) !== isWhite))
    ) {
      moves.push([fromRow + direction, fromCol - 1]);
    }

    if (
      boardState[fromRow + direction][fromCol + 1] && // Piece to the right
      (boardState[fromRow + direction][fromCol + 1] !== null &&
        ((boardState[fromRow + direction][fromCol + 1].toUpperCase() === boardState[fromRow + direction][fromCol + 1]) !== isWhite))
    ) {
      moves.push([fromRow + direction, fromCol + 1]);
    }
  }

  // Add other piece logic (e.g., rook, knight, etc.)
  const directions = {
    // p: [[1, 0], [1, -1], [1, 1]], // Black pawn (simplified for brevity)
    // P: [[-1, 0], [-1, -1], [-1, 1]], // White pawn
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
    // let newRow = (fromRow + dRow + 8) % 8;
    // let newCol = (fromCol + dCol + 8) % 8;
    let newRow = fromRow;
    let newCol = fromCol;

    // Skip moves that land on pieces of the same color
    const target = boardState[newRow][newCol];
    // if (target && piece.toUpperCase() === piece && target.toUpperCase() === target) continue;
    // if (target && piece.toLowerCase() === piece && target.toLowerCase() === target) continue;

    // moves.push([newRow, newCol]);

    // Continue moving in the same direction

    while (true) {
      newRow = (newRow + dRow + 8) % 8;
      newCol = (newCol + dCol + 8) % 8;
      const newTarget = boardState[newRow][newCol];

      if (newTarget) {
        if ((piece.toUpperCase() === piece && newTarget.toUpperCase() === newTarget) || (piece.toLowerCase() === piece && newTarget.toLowerCase() === newTarget)) {
          break;
        } else {
          moves.push([newRow, newCol]);
          break;
        };
      }

      moves.push([newRow, newCol]);
      if (pieceType === 'k' || pieceType === 'n') {
        break;
      }
    }
  }

  return moves;
};

function updatePieceClasses() {
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach((piece) => {
    const pieceColor = piece.textContent === piece.textContent.toUpperCase() ? 'white' : 'black';
    if (pieceColor === currentTurn) {
      piece.classList.add('current-turn');
    } else {
      piece.classList.remove('current-turn');
    }
  });
}

const highlightMoves = (moves, fromRow, fromCol) => {
  const allSquares = document.querySelectorAll('.square');
  allSquares.forEach(square => {
    square.classList.remove('highlight');
    square.removeEventListener('click', handleSquareClick); // Remove previous listeners
  });

  moves.forEach(([row, col]) => {
    const square = [...allSquares].find(
      sq => parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col
    );
    if (square) {
      square.classList.add('highlight');
      square.addEventListener('click', (e) => handleSquareClick(e, fromRow, fromCol, row, col));
    }
  });
};

let selectedPiece = null;

const handleSquareClick = (e, fromRow, fromCol, toRow, toCol) => {
  // Try to move the selected piece to the clicked square
  movePiece(fromRow, fromCol, toRow, toCol);
  selectedPiece = null;
};


// Handle piece movement and torus logic
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const piece = boardState[fromRow][fromCol];
  let possibleMoves;

  // if (selectedPiece) {
  possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
  // }
  // else {
  //   possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
  // }

  console.log('Possible moves:', possibleMoves);
  const isValidMove = possibleMoves.some(
    ([row, col]) => row === toRow && col === toCol
  );
  console.log('isValidMove:', piece, fromRow, fromCol, toRow, toCol, isValidMove);

  if (isValidMove) {
    // Move the piece in the board state
    boardState[toRow][toCol] = piece;
    boardState[fromRow][fromCol] = null;

    // Update the DOM
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

        // Clear highlights and selection
        highlightMoves([]);
        document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
          selectedPiece.classList.remove('selected');
        });

        // Switch turns
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        updatePieceClasses();
        document.getElementById('turn-indicator').textContent =
          `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s Turn`;
        enablePieceSelection();
      }
    }
  } else {
    console.log("Invalid move!");
  }
};

const handlePieceClick = (e) => {
  e.preventDefault();
  e.stopPropagation();

  // Clear previous selection
  document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
    selectedPiece.classList.remove('selected');
  });

  const parent = e.target.parentElement;
  const fromRow = parseInt(parent.dataset.row);
  const fromCol = parseInt(parent.dataset.col);
  const piece = boardState[fromRow][fromCol];

  // Check if a piece is already selected
  if (selectedPiece !== null) {
    // Try to move the selected piece to the clicked square
    movePiece(fromRow, fromCol, fromRow, fromCol);
  } else {
    // Enforce turn-based rules
    if ((currentTurn === 'white' && piece === piece.toUpperCase()) ||
      (currentTurn === 'black' && piece === piece.toLowerCase())) {
      // Mark the piece as selected
      e.target.classList.add('selected');

      // Highlight possible moves
      const possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
      highlightMoves(possibleMoves, fromRow, fromCol);
      selectedPiece = piece; // Set the selected piece
    } else {
      console.log("It's not your turn!");
    }
  }
};

const enablePieceSelection = () => {
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach(piece => {
    if (piece.textContent !== null) {
      if ((currentTurn === 'white') === (piece.textContent.toUpperCase() === piece.textContent)) {
        piece.removeEventListener('click', handlePieceClick);
        piece.addEventListener('click', handlePieceClick);
      } else {
        piece.removeEventListener('click', handlePieceClick);
      }
    }
  });
};


// Call this after creating the board
createBoard();
enablePieceSelection();
