const board = document.getElementById('chessboard');

// Create an 8x8 chessboard
const createBoard = () => {
  const pieces = {
    0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    1: ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    6: ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  };

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      square.dataset.row = row;
      square.dataset.col = col;

      if (pieces[row] && pieces[row][col]) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.textContent = pieces[row][col];
        square.appendChild(piece);
      }

      board.appendChild(square);
    }
  }
};

// Handle piece movement and torus logic
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const allSquares = document.querySelectorAll('.square');
  const getSquare = (row, col) =>
    [...allSquares].find(
      sq =>
        parseInt(sq.dataset.row) === (row + 8) % 8 &&
        parseInt(sq.dataset.col) === (col + 8) % 8
    );

  const fromSquare = getSquare(fromRow, fromCol);
  const toSquare = getSquare(toRow, toCol);

  if (fromSquare && toSquare) {
    const piece = fromSquare.querySelector('.piece');
    if (piece) {
      toSquare.innerHTML = '';
      toSquare.appendChild(piece);
    }
  }
};

// Add event listeners for dragging and dropping
const enableMovement = () => {
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach(piece => {
    piece.draggable = true;

    piece.addEventListener('dragstart', e => {
      const parent = e.target.parentElement;
      e.dataTransfer.setData('fromRow', parent.dataset.row);
      e.dataTransfer.setData('fromCol', parent.dataset.col);
    });
  });

  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    square.addEventListener('dragover', e => e.preventDefault());

    square.addEventListener('drop', e => {
      const fromRow = parseInt(e.dataTransfer.getData('fromRow'));
      const fromCol = parseInt(e.dataTransfer.getData('fromCol'));
      const toRow = parseInt(square.dataset.row);
      const toCol = parseInt(square.dataset.col);

      movePiece(fromRow, fromCol, toRow, toCol);
    });
  });
};

// Initialize the game
createBoard();
enableMovement();
