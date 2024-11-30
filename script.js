document.getElementById('version').textContent = 'Version 0.2024.11.30.23.x';

window.addEventListener('load', () => {
  const windowSize = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;

  const chessboard = document.getElementById('chessboard');
  chessboard.style.width = `${windowSize * 0.8}px`;
  chessboard.style.height = `${windowSize * 0.8}px`;
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    square.style.width = `${windowSize * 0.8 / 8}px`;
    square.style.height = `${windowSize * 0.8 / 8}px`;
  });
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach(piece => {
    piece.style.fontSize = `${windowSize * 0.8 / 8 / 2}px`;
    piece.style.lineHeight = `${windowSize * 0.8 / 8}px`;
    piece.style.width = `${windowSize * 0.8 / 8}px`;
    piece.style.height = `${windowSize * 0.8 / 8}px`;
  });
  chessboard.style.gridTemplateRows = `repeat(8, ${windowSize * 0.8 / 8}px)`;
  chessboard.style.gridTemplateColumns = `repeat(8, ${windowSize * 0.8 / 8}px)`;
});

let possibleMoves = [];
const flipTextCheckbox = document.getElementById('flipTextCheckbox');

document.body.addEventListener('click', (e) => {
  if (e.target === document.body) {
    // Clear highlights and selection
    highlightMoves([]);
    document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
      selectedPiece.classList.remove('selected');
    });
    selectedPiece = null;
    selectedSquare = null;

    possibleMoves = [];
  }
});

const board = document.getElementById('chessboard');

let currentTurn = 'white'; // 'white' begins the game

const boardState = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null));

const initialPieces = {
  0: ['p', 'b', 'p', '', '', 'p', 'b', 'p'], // Black major pieces
  1: ['q', 'r', '', '', '', '', 'r', 'k'],
  2: ['p', 'p', '', 'n', 'n', '', 'p', 'p'], // Black pawns
  5: ['P', 'P', '', 'N', 'N', '', 'P', 'P'], // White major pieces
  6: ['Q', 'R', '', '', '', '', 'R', 'K'], // White pawns
  7: ['P', 'B', 'P', '', '', 'P', 'B', 'P'], // White major pieces
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

        let symbol;
        switch (boardState[row][col]) {
          case 'p':
            symbol = '♟';
            break;
          case 'b':
            symbol = '♝';
            break;
          case 'n':
            symbol = '♞';
            break;
          case 'r':
            symbol = '♜';
            break;
          case 'q':
            symbol = '♛';
            break;
          case 'k':
            symbol = '♚';
            break;
          case 'P':
            symbol = '♙';
            break;
          case 'B':
            symbol = '♗';
            break;
          case 'N':
            symbol = '♘';
            break;
          case 'R':
            symbol = '♖';
            break;
          case 'Q':
            symbol = '♕';
            break;
          case 'K':
            symbol = '♔';
            break;
          default:
            symbol = boardState[row][col];
        }

        piece.textContent = symbol;
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

    let fr_d = (fromRow + direction) % 8;
    let fc_1 = (fromCol - 1) % 8;
    let fc_2 = (fromCol + 1) % 8;

    // Regular move
    if (!boardState[fr_d][fromCol]) {
      moves.push([fr_d, fromCol]);

      // Double move from start position
      if (fromRow === startRow && !boardState[fromRow + 2 * direction][fromCol]) {
        moves.push([fromRow + 2 * direction, fromCol]);
      }
    }

    // Captures (ensure it's an opponent's piece)
    if (
      boardState[fr_d][fc_1] && // Piece to the left
      (boardState[fr_d][fc_1] !== null &&
        ((boardState[fr_d][fc_1].toUpperCase() === boardState[fr_d][fc_1]) !== isWhite))
    ) {
      moves.push([fr_d, fc_1]);
    }

    if (
      boardState[fr_d][fc_2] && // Piece to the right
      (boardState[fr_d][fc_2] !== null &&
        ((boardState[fr_d][fc_2].toUpperCase() === boardState[fr_d][fc_2]) !== isWhite))
    ) {
      moves.push([fr_d, fc_2]);
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
        let pieces = document.querySelectorAll('.piece');
        if (flipTextCheckbox.checked) {
          pieces.forEach(piece => {
            piece.classList.toggle('flipped-text');
          })
        } else {
          pieces.forEach(piece => {
            piece.classList.remove('flipped-text');
          })
        }
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
const canKingBeAttacked = (kingRow, kingCol, opponentColor) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && ((opponentColor === 'white' && piece === piece.toUpperCase()) || (opponentColor === 'black' && piece === piece.toLowerCase()))) {
        const possibleMoves = getPossibleMoves(piece, row, col);
        if (possibleMoves.some(([moveRow, moveCol]) => moveRow === kingRow && moveCol === kingCol)) {
          return true;
        }
      }
    }
  }
  return false;
};

const currentKingPosition = () => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = boardState[row][col];
      if (piece && ((currentTurn === 'white' && piece === 'K') || (currentTurn === 'black' && piece === 'k'))) {
        return [row, col];
      }
    }
  }
  return null;
};
const enablePieceSelection = () => {
  const pieces = document.querySelectorAll('.piece');
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    square.style.backgroundColor = '';
  })
  pieces.forEach(piece => {
    if (piece.textContent !== null) {
      const [kingRow, kingCol] = currentKingPosition();
      const opponentColor = currentTurn === 'white' ? 'black' : 'white';
      if (kingRow !== null) {
        if (canKingBeAttacked(kingRow, kingCol, opponentColor)) {
          const kingSquare = document.querySelector(`.square[data-row="${kingRow}"][data-col="${kingCol}"]`);
          kingSquare.style.backgroundColor = 'red';
        }
      }

      if ((currentTurn === 'white' && boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)].toUpperCase() === boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)]) ||
        (currentTurn === 'black' && boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)].toLowerCase() === boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)])) {
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
