document.getElementById('version').textContent = 'Version 0.2025.2.21.23.x';

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
  // updatePieceClasses();
});

let possibleMoves = [];
let currentTurn = 'white'; // 'white' begins the game

const flipBoardCheckbox = document.getElementById('flipBoardCheckbox');
flipBoardCheckbox.addEventListener('change', () => {
  if (flipBoardCheckbox.checked) {
    board.classList.add('flipped-board');
  } else {
    board.classList.remove('flipped-board');
  }
});

const flipTextCheckbox = document.getElementById('flipTextCheckbox');
flipTextCheckbox.addEventListener('change', () => {
  if (flipTextCheckbox.checked && currentTurn !== 'white') {
    document.querySelectorAll('.piece').forEach(piece => {
      piece.classList.add('flipped-text');
    })
  } else {
    document.querySelectorAll('.piece').forEach(piece => {
      piece.classList.remove('flipped-text');
    })
  }
});

const blockDeselectCheckbox = document.getElementById('blockDeselectCheckbox');


const enableSideManagementCheckbox = document.getElementById('enableSideManagement');
enableSideManagementCheckbox.addEventListener('change', () => {
  if (enableSideManagementCheckbox.checked) {
    xShiftSlider.value = 0;
    yShiftSlider.value = 0;
    document.getElementById('xShift').style.display = 'none';
    document.querySelector('label[for="xShift"]').style.display = 'none';
    document.getElementById('yShift').style.display = 'none';
    document.querySelector('label[for="yShift"]').style.display = 'none';
    document.querySelector('.sideConfigs').style.display = 'inline-block';
    updateBoard();
  } else {
    document.getElementById('xShift').style.display = 'inline-block';
    document.querySelector('label[for="xShift"]').style.display = 'inline-block';
    document.getElementById('yShift').style.display = 'inline-block';
    document.querySelector('label[for="yShift"]').style.display = 'inline-block';
    document.querySelector('.sideConfigs').style.display = 'none';
  }
});


document.querySelector('.sideConfigs').addEventListener('change', (event) => {
  const leftColor = document.getElementById('leftColorSwitch').value;
  const rightColor = document.getElementById('rightColorSwitch').value;
  const topColor = document.getElementById('topColorSwitch').value;
  const bottomColor = document.getElementById('bottomColorSwitch').value;

  const leftDirection = document.getElementById('leftDirectionSwitch').value;
  const rightDirection = document.getElementById('rightDirectionSwitch').value;
  const topDirection = document.getElementById('topDirectionSwitch').value;
  const bottomDirection = document.getElementById('bottomDirectionSwitch').value;

  const switches = ['leftColorSwitch', 'rightColorSwitch', 'topColorSwitch', 'bottomColorSwitch'];

  const allColors = ['red', 'blue', 'black'];

  // re-add missing color options in each selection box
  switches.forEach(id => {
    allColors.forEach(color => {
      const select = document.getElementById(id);
      if (!select.querySelector(`option[value="${color}"]`)) {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        select.appendChild(option);
      }
    })
  })

  const colors = ['red', 'blue'];

  // Check how many sides have a specific color selected
  colors.forEach(color => {
    const colorCount = [
      leftColor,
      rightColor,
      topColor,
      bottomColor
    ].filter(selectedColor => selectedColor === color).length;

    // If a color is used twice, do not add it to other selection boxes
    if (colorCount >= 2) {
      switches.forEach(id => {
        const select = document.getElementById(id);
        if (select.value !== color) {
          select.querySelectorAll(`option[value="${color}"]`).forEach(option => option.remove());
        }
      });
    }
  });

  updateArrow('left', leftColor, `to ${leftDirection}`);
  updateArrow('right', rightColor, `to ${rightDirection}`);
  updateArrow('top', topColor, `to ${topDirection}`);
  updateArrow('bottom', bottomColor, `to ${bottomDirection}`);

  enablePieceSelection();
});

const topColor = document.getElementById('topColorSwitch');
const bottomColor = document.getElementById('bottomColorSwitch');
const leftColor = document.getElementById('leftColorSwitch');
const rightColor = document.getElementById('rightColorSwitch');

const topDirection = document.getElementById('topDirectionSwitch');
const bottomDirection = document.getElementById('bottomDirectionSwitch');
const leftDirection = document.getElementById('leftDirectionSwitch');
const rightDirection = document.getElementById('rightDirectionSwitch');

function updateArrow(direction, color, gradientDirection) {
  const arrow = document.querySelector(`.arrow.${direction}`);

  if (!arrow) {
    console.error(`Arrow with direction "${direction}" not found.`);
    return;
  }

  // Update the gradient direction and color
  arrow.style.background = `repeating-linear-gradient(${gradientDirection}, transparent 0%, ${color} 12.5%)`;
  // console.log(`Arrow with direction "${direction}" updated with color "${color}" and gradient direction "${gradientDirection}".\n`, arrow, arrow.style.background);
}


const freePlayCheckbox = document.getElementById('FreePlay');
freePlayCheckbox.addEventListener('change', () => {
  enablePieceSelection();
});

document.body.addEventListener('click', (e) => {
  if (e.target === document.body && !blockDeselectCheckbox.checked) {
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

const obviousCheckBox = document.getElementById('obvious');
obviousCheckBox.addEventListener('change', () => {
  if (obviousCheckBox.checked) {
    document.querySelectorAll('.piece.current-turn.obvious').forEach(piece => {
      piece.style.color = 'orangered';
    });
  } else {
    document.querySelectorAll('.piece.current-turn.obvious').forEach(piece => {
      piece.style.color = '';
    })
  }
});

const board = document.getElementById('chessboard');

board.addEventListener('click', (e) => {
  if (e.target.classList.contains('square')) {
    const square = e.target;
    // if (possibleMoves.includes([selectedPiece.parentElement.dataset.row, selectedPiece.parentElement.dataset.col, square.dataset.row, square.dataset.col])){
    handleSquareClick(square.dataset.row, square.dataset.col);
    // }
  }
});

const boardState = Array(8)
  .fill(null)
  .map(() => Array(8).fill(null));

let initialPieces = {
  0: ['', '', '', '', '', '', '', ''],
  1: ['', '', '', '', '', '', '', ''],
  2: ['', '', '', '', '', '', '', ''],
  3: ['', '', '', '', '', '', '', ''],
  4: ['', '', '', '', '', '', '', ''],
  5: ['', '', '', '', '', '', '', ''],
  6: ['', '', '', '', '', '', '', ''],
  7: ['', '', '', '', '', '', '', ''],
};

// initialPieces = {
//   0: [null, "b", null, "", "", "p", "b", "p"],
//   1: ["q", "p", "", "", "", "", "r", "k"],
//   2: ["p", "p", "", null, "n", "", null, "p"],
//   3: ["", "", "", "", "", "Q", "p", ""],
//   4: ["", "", "", "", "n", "", "", "P"],
//   5: ["P", "P", "", "N", "N", "", "P", null],
//   6: [null, "R", "", "", "", "", "R", "K"],
//   7: ["P", null, "P", "", "", "P", "B", "P"]
// };

let fenString = "";
// currentTurn = "black";
// fenString = "pbp2pbp/qr4rk/pp1nn1pp/8/8/PP1NN1PP/QR4RK/PBP2PBP";  // original Torus-Chess
fenString = "8/N1PPPP1N/2RKQR2/1PBPPBP1/1pbppbp1/2rkqr2/n1pppp1n/8";  // centered Torus-Chess
// let fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";  // standard Chess
// let fenString = "8/8/5p2/1R2q1k1/2P5/2B5/1K6/8";  // stupid mode example

// const fenSelectBox = document.getElementById('defaultPosition');
// fenSelectBox.addEventListener('change', () => {
//   if (fenSelectBox.value === 'standard') {
//     fenString = "pbp2pbp/qr4rk/pp1nn1pp/8/8/PP1NN1PP/QR4RK/PBP2PBP";
//   } else if (fenSelectBox.value === 'stupid') {
//     fenString = "8/8/5p2/1R2q1k1/2P5/2B5/1K6/8";
//   } else if (fenSelectBox.value === 'plain') {
//     fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
//   }
//   convertFen(fenString);
//   initBoardState();
// })

const convertFen = (fenString) => {
  if (fenString) {
    const fenParts = fenString.split('/');
    for (let i = 0; i < 8; i++) {
      let col = 0;
      for (let j = 0; j < fenParts[i].length; j++) {
        if (fenParts[i][j] >= '1' && fenParts[i][j] <= '8') {
          for (let n = 0; n < parseInt(fenParts[i][j]); n++) {
            initialPieces[i][col] = '';
            col++;
          }
        } else {
          initialPieces[i][col] = fenParts[i][j];
          col++;
        }
      }
    }
  }
}
convertFen(fenString);

const initBoardState = () => {
  // Initialize board state
  for (let row = 0; row < 8; row++) {
    if (initialPieces[row]) {
      for (let col = 0; col < 8; col++) {
        boardState[row][col] = initialPieces[row][col];
      }
    }
  }
}
initBoardState();

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

const xShiftSlider = document.getElementById('xShift');
const yShiftSlider = document.getElementById('yShift');

xShiftSlider.addEventListener('change', updateBoard);
yShiftSlider.addEventListener('change', updateBoard);



function updateBoard() {
  const xShift = parseInt(xShiftSlider.value);
  const yShift = parseInt(yShiftSlider.value);

  const squares = document.querySelectorAll('.square');

  for (const square of squares) {
    const row = parseInt(square.dataset.row) + yShift;
    const col = parseInt(square.dataset.col) + xShift;
    square.style.gridRow = (row % 8 + 8) % 8 + 1;
    square.style.gridColumn = (col % 8 + 8) % 8 + 1;
  }
}

const isOpponentPiece = (targetSquare, isWhite) => {
  return targetSquare &&
    targetSquare !== null &&
    (isWhite ? targetSquare === targetSquare.toUpperCase() : targetSquare === targetSquare.toLowerCase());
};

const legalMove = (move, pieceIsWhite, attackCheck) => {
  if (attackCheck > 0 || freePlayCheckbox.checked) {
    return true;
  } else if (attackCheck > -1) {
    attackCheck++;
  }
  if (!document.getElementById('stupid').checked) {
    attackCheck = 1;
  }
  const [fromRow, fromCol, row, col] = move;
  let possibleBoard = [...boardState.map(row => [...row])];
  possibleBoard[row][col] = possibleBoard[fromRow][fromCol];
  possibleBoard[fromRow][fromCol] = null;
  let [kingRow, kingCol] = KingPosition(possibleBoard, currentTurn) || [null, null];
  if (kingRow === null) {
    return true;
  };
  let attacked = canBeAttacked(kingRow, kingCol, pieceIsWhite ? 'black' : 'white', possibleBoard, attackCheck = attackCheck);
  // console.log("Piece: ", row, col, " | King: ", kingRow, kingCol, " | Attacked: ", attacked, " | King Color: ", currentTurn, " | Opponent: ", currentTurn === 'white' ? 'black' : 'white', " | Possible Board: ", possibleBoard);
  if (!attacked) {
    return true;
  }

  return false;
}

const getPossibleMoves = (piece, fromRow, fromCol, boardState, attackCheck = -1) => {
  // console.log("Attack Check: ", attackCheck);
  let moves = [];

  if (!piece) return moves;

  // Determine if the piece is white or black
  const isWhite = piece === piece.toUpperCase();
  const opponentColor = isWhite ? 'black' : 'white';

  if (piece.toLowerCase() === 'p') {
    // Pawn movement
    const direction = isWhite ? -1 : 1; // White moves up, Black moves down
    const startRow = isWhite ? 6 : 1; // Starting row for pawns
    fromCol = parseInt(fromCol);

    let forward = pawn_forward(direction);
    // let double_forward = [fr_dd, fromCol];
    let capture_left = pawn_capture_left(direction);
    let capture_right = pawn_capture_right(direction);

    // Regular move
    // console.log(boardState, fr_d, fromCol, forward);
    if (forward[0] !== null && !boardState[forward[0]][forward[1]]) {
      const possibleMove = [fromRow, fromCol, forward[0], forward[1]];
      if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };

      // Double move from start position, currently disabled (no fixed double jump line a.k.a. startRow in later versions)
      // if (fromRow === startRow && !boardState[double_forward[0]][double_forward[1]]) {
      //   const possibleMove = [fromRow, fromCol, double_forward[0], double_forward[1]];
      //   if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };
      // }
    }

    // Captures (ensure it's an opponent's piece)
    if (capture_left[0] !== null &&
      boardState[capture_left[0]][capture_left[1]] && // Piece to the left
      (boardState[capture_left[0]][capture_left[1]] !== null &&
        ((boardState[capture_left[0]][capture_left[1]].toUpperCase() === boardState[capture_left[0]][capture_left[1]]) !== isWhite))
    ) {
      const possibleMove = [fromRow, fromCol, capture_left[0], capture_left[1]]
      if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };
    }

    if (capture_right[0] !== null &&
      boardState[capture_right[0]][capture_right[1]] && // Piece to the right
      (boardState[capture_right[0]][capture_right[1]] !== null &&
        ((boardState[capture_right[0]][capture_right[1]].toUpperCase() === boardState[capture_right[0]][capture_right[1]]) !== isWhite))
    ) {
      const possibleMove = [fromRow, fromCol, capture_right[0], capture_right[1]]
      if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };
    }

    return moves;
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

    let steps = 0;
    const maxSteps = 50;

    while (steps < maxSteps) {
      steps++;
      [newRow, newCol] = newCoords(newRow, dRow, newCol, dCol);
      if (newRow === null) { break; }
      const newTarget = boardState[newRow][newCol];

      if (newTarget) {
        if ((piece.toUpperCase() === piece && newTarget.toUpperCase() === newTarget) || (piece.toLowerCase() === piece && newTarget.toLowerCase() === newTarget)) {
          break;
        } else {
          const possibleMove = [fromRow, fromCol, newRow, newCol];
          if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };
          break;
        };
      }

      const possibleMove = [fromRow, fromCol, newRow, newCol];
      if (legalMove(possibleMove, isWhite, attackCheck = attackCheck)) { moves.push(possibleMove); };
      if (pieceType === 'k' || pieceType === 'n') {
        break;
      }
    }
  }

  return moves;

  function newCoords(newRow, dRow, newCol, dCol) {
    let row = newRow + dRow;
    let col = newCol + dCol;
    [row, col] = rowEval(row, col);
    [row, col] = colEval(row, col);
    [row, col] = rowEval(row, col);
    [row, col] = colEval(row, col);

    return [row, col];
  }

  function pawn_capture_right(direction) {
    let row = fromRow + direction;
    let col = fromCol + 1;
    [row, col] = rowEval(row, col);
    [row, col] = colEval(row, col);

    return [row, col];
  }

  function pawn_capture_left(direction) {
    let row = fromRow + direction;
    let col = fromCol - 1;
    [row, col] = rowEval(row, col);
    [row, col] = colEval(row, col);

    return [row, col];
  }

  function pawn_forward(direction) {
    let row = fromRow + direction;
    let col = fromCol;
    [row, col] = rowEval(row, col, direction);

    return [row, col];
  }
};

function rowEval(row, col) {
  if (row > 7) {
    if (topColor.value === 'black') {
      [row, col] = [null, null];
    } else if (topColor.value === bottomColor.value) {
      row = row % 8;
      if ((topDirection.value === 'right') === (bottomDirection.value === 'right')) {
        col = col;
      } else {
        col = 7 - col;
      }
    } else if (topColor.value === leftColor.value) {
      if ((topDirection.value === 'right') === (leftDirection.value === 'top')) {
        [row, col] = [col, row];
      } else {
        [row, col] = [7 - row, 7 - col];
      }
    } else if (topColor.value === rightColor.value) {
      if ((topDirection.value === 'right') === (rightDirection.value === 'top')) {
        [row, col] = [7 - row, col];
      } else {
        [row, col] = [col, 7 - row];
      }
    } else {
      [row, col] = [null, null];
    }
  } else if (row < 0) {
    if (bottomColor.value === 'black') {
      [row, col] = [null, null];
    } else if (bottomColor.value === topColor.value) {
      row = row + 8;
      if ((bottomDirection.value === 'right') === (topDirection.value === 'right')) {
        col = col;
      } else {
        col = 7 - col;
      }
    } else if (bottomColor.value === leftColor.value) {
      if ((bottomDirection.value === 'right') === (leftDirection.value === 'top')) {
        [row, col] = [7 - col, 7 - row];
      } else {
        [row, col] = [row, col];
      }
    } else if (bottomColor.value === rightColor.value) {
      if ((bottomDirection.value === 'right') === (rightDirection.value === 'top')) {
        [row, col] = [row, 7 - col];
      } else {
        [row, col] = [col, row];
      }
    }
  } else {
    row = row;
    col = col;
  }
  return [row, col];
}

function colEval(row, col) {
  if (col > 7) {
    if (rightColor.value === 'black') {
      [row, col] = [null, null];
    } else if (rightColor.value === leftColor.value) {
      col = col % 8;
      if ((rightDirection.value === 'top') === (leftDirection.value === 'top')) {
        row = row;
      } else {
        row = 7 - row;
      }
    } else if (rightColor.value === topColor.value) {
      if ((rightDirection.value === 'top') === (topDirection.value === 'right')) {
        [row, col] = [7 - row, 7 - col];
      } else {
        [row, col] = [7 - col, row];
      }
    } else if (rightColor.value === bottomColor.value) {
      if ((rightDirection.value === 'top') === (bottomDirection.value === 'right')) {
        [row, col] = [col, 7 - row];
      } else {
        [row, col] = [7 - row, col];
      }
    } else {
      [row, col] = [null, null];
    }
  } else if (col < 0) {
    if (leftColor.value === 'black') {
      [row, col] = [null, null];
    } else if (leftColor.value === rightColor.value) {
      col = col + 8;
      if ((leftDirection.value === 'top') === (rightDirection.value === 'top')) {
        row = row;
      } else {
        row = 7 - row;
      }
    } else if (leftColor.value === bottomColor.value) {
      if ((leftDirection.value === 'top') === (bottomDirection.value === 'right')) {
        [row, col] = [7 - col, 7 - row];
      } else {
        [row, col] = [7 - col, row];
      }
    } else if (leftColor.value === topColor.value) {
      if ((leftDirection.value === 'top') === (topDirection.value === 'right')) {
        [row, col] = [col, 7 - row];
      } else {
        [row, col] = [col, row];
      }
    }
  } else {
    row = row;
    col = col;
  }
  return [row, col];
}

function updatePieceClasses() {
  const pieces = document.querySelectorAll('.piece');
  pieces.forEach((piece) => {
    // const pieceColor = (
    //   (
    //     boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)].toUpperCase() === boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)]
    //   )
    // ) ? 'white' : 'black';
    if (pieceColor === currentTurn) {
      piece.classList.add('current-turn');
    } else {
      piece.classList.remove('current-turn');
    }
  });
}

const highlightMoves = (moves) => {
  // let available_moves = 0;
  const allSquares = document.querySelectorAll('.square');
  allSquares.forEach(square => {
    square.classList.remove('highlight');
    // square.style.backgroundColor = '';
    // square.removeEventListener('click', handleSquareClick); // Remove previous listeners
  });

  moves.forEach(([fr, fc, row, col]) => {
    const square = [...allSquares].find(
      sq => parseInt(sq.dataset.row) === row && parseInt(sq.dataset.col) === col
    );
    // square.classList.remove('dangerous-move');
    if (square) {
      if (square.classList.contains('highlight')) {
        square.classList.remove('highlight');
        // square.removeEventListener('click', handleSquareClick);
      }
      // let possibleBoard = [...boardState.map(row => [...row])];
      // possibleBoard[row][col] = possibleBoard[fromRow][fromCol];
      // possibleBoard[fromRow][fromCol] = null;
      // let [kingRow, kingCol] = KingPosition(possibleBoard, currentTurn) || [null, null];
      // let attacked = canBeAttacked(kingRow, kingCol, currentTurn === 'white' ? 'black' : 'white', possibleBoard);
      // // console.log("Piece: ", row, col, " | King: ", kingRow, kingCol, " | Attacked: ", attacked, " | King Color: ", currentTurn, " | Opponent: ", currentTurn === 'white' ? 'black' : 'white', " | Possible Board: ", possibleBoard);
      // if (kingCol !== null && attacked) {
      //   // square.classList.add('dangerous-move');
      // } else {
      square.classList.add('highlight');
      // const squareClickArgs = (e) => handleSquareClick(fr, fc, row, col);
      // square.addEventListener('click', squareClickArgs);
      // available_moves++;
      // }
      let piece = square.firstChild;
      if (piece) {
        // console.log(piece);
        piece.addEventListener('click', handlePieceClick);
      }
    }
  });
  // return available_moves;
};

let selectedPiece = null;

const handleSquareClick = (row, col) => {
  // Try to move the selected piece to the clicked square
  [row, col] = [parseInt(row), parseInt(col)];
  // console.log(selectedPiece, selectedPiece.parentElement.dataset, row, col);
  if (!selectedPiece) {
    return;
  }
  const fromRow = parseInt(selectedPiece.parentElement.dataset.row);
  const fromCol = parseInt(selectedPiece.parentElement.dataset.col);
  movePiece(fromRow, fromCol, row, col);
  if (blockDeselectCheckbox.checked) {
    return;
  }
  // selectedPiece = null;
  // // Clear highlights and selection
  // highlightMoves([]);
  // document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
  //   selectedPiece.classList.remove('selected');
  // });
};


// Handle piece movement and torus logic
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const piece = boardState[fromRow][fromCol];
  if (piece && boardState[toRow][toCol] &&
    (piece.toUpperCase() === piece && boardState[toRow][toCol].toUpperCase() === boardState[toRow][toCol] ||
      piece.toLowerCase() === piece && boardState[toRow][toCol].toLowerCase() === boardState[toRow][toCol])) {
    console.log("Trying to capture same color piece " + boardState[toRow][toCol] + " using " + piece + ", aborting move.");
    return;
  }
  // let possibleMoves;

  // if (selectedPiece) {
  possibleMoves = [];
  possibleMoves = getPossibleMoves(piece, fromRow, fromCol, boardState);
  // }
  // else {
  //   possibleMoves = getPossibleMoves(piece, fromRow, fromCol);
  // }

  //  if (possibleMoves.length === 0 && [fromRow, fromCol] === [toRow, toCol]) {
  //    selectedPiece = null;
  //  // Clear highlights and selection
  //  highlightMoves([]);
  //  document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
  //    selectedPiece.classList.remove('selected');
  //  });
  //  }

  // console.log('Possible moves:', possibleMoves);
  const isValidMove = possibleMoves.some(
    ([fr, fc, row, col]) => row === toRow && col === toCol
  );
  // console.log('isValidMove:', piece, fromRow, fromCol, toRow, toCol, isValidMove);

  if (isValidMove) {
    document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('fromSquare', "move");
      square.classList.remove('toSquare', "move");
    })
    // document.querySelectorAll('.piece').forEach(piece => {
    //   piece.classList.remove('movingPiece');
    // })

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

        // fromSquare.style.backgroundColor = 'lightblue';
        fromSquare.classList.add('fromSquare', "move");
        // toSquare.style.backgroundColor = 'darkblue';
        toSquare.classList.add('toSquare', "move");
        // movingPiece.style.color = 'blue';
        // movingPiece.classList.add('movingPiece');

        // Clear highlights and selection
        highlightMoves([]);
        document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
          selectedPiece.classList.remove('selected');
        });
        selectedPiece = null;

        // Switch turns
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        let pieces = document.querySelectorAll('.piece');
        // if (flipBoardCheckbox.checked) {
        if (currentTurn === 'black') {
          board.classList.add('flipped');
        } else {
          board.classList.remove('flipped');
        }
        // } else {
        //   board.classList.remove('flipped');
        // }
        if (flipTextCheckbox.checked) {
          pieces.forEach(piece => {
            piece.classList.toggle('flipped-text');
          })
        } else {
          pieces.forEach(piece => {
            piece.classList.remove('flipped-text');
          })
        }
        // updatePieceClasses();
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
  // if (
  //   !e.target.classList.contains('current-turn')
  //   // ||
  //   // (currentTurn === 'white' && piece === piece.toUpperCase())
  //   // ||
  //   // (currentTurn === 'black' && piece === piece.toLowerCase())
  // ) {
  //   return;
  // }
  e.preventDefault();
  e.stopPropagation();

  // Clear highlights and selection
  // highlightMoves([]);
  // if (!blockDeselectCheckbox.checked && selectedPiece === null) {
  //   document.querySelectorAll('.piece.selected').forEach(selectedPiece => {
  //     selectedPiece.classList.remove('selected');
  //   });
  // }

  // Check if a piece is already selected
  // console.log(selectedPiece);
  if (selectedPiece !== null) {
    const parent = e.target.parentElement;
    const fR = parseInt(parent.dataset.row);
    const fC = parseInt(parent.dataset.col);
    const piece = boardState[fR][fC];

    if ((currentTurn === 'white' && piece === piece.toUpperCase()) ||
      (currentTurn === 'black' && piece === piece.toLowerCase())) {
      if (blockDeselectCheckbox.checked) {
        return;
      }
      selectedPiece.classList.remove('selected');
      e.target.classList.add('selected');

      let possibleMoves = getPossibleMoves(piece, fR, fC, boardState);
      selectedPiece = e.target;
      highlightMoves(possibleMoves);
      return;
    }

    // Try to move the selected piece to the clicked square
    // console.log("Moving onto piece...");
    let fromRow = parseInt(selectedPiece.parentElement.dataset.row);
    let fromCol = parseInt(selectedPiece.parentElement.dataset.col);
    let toRow = parseInt(e.target.parentElement.dataset.row);
    let toCol = parseInt(e.target.parentElement.dataset.col);
    movePiece(fromRow, fromCol, toRow, toCol);
  } else {
    const parent = e.target.parentElement;
    const fR = parseInt(parent.dataset.row);
    const fC = parseInt(parent.dataset.col);
    const piece = boardState[fR][fC];

    if ((currentTurn === 'white' && piece === piece.toUpperCase()) ||
      (currentTurn === 'black' && piece === piece.toLowerCase())) {
      e.target.classList.add('selected');

      let possibleMoves = getPossibleMoves(piece, fR, fC, boardState);
      selectedPiece = e.target;
      highlightMoves(possibleMoves);
      // Enforce turn-based rules
      // Mark the piece as selected
      // Highlight possible moves
      // selectedPiece = piece; // Set the selected piece
      // let available_moves = 
      // if (available_moves === 0) {
      //   const pieces = Array.from(document.querySelectorAll('.piece'))
      //     .filter(piece => (currentTurn === 'white' && piece.textContent === piece.textContent.toUpperCase()) ||
      //       (currentTurn === 'black' && piece.textContent === piece.textContent.toLowerCase()));
      //   pieces.forEach(piece => {
      //     possibleMoves = getPossibleMoves(piece, fromRow, fromCol, boardState);
      //     available_moves = highlightMoves(possibleMoves, fromRow, fromCol);
      //     if (available_moves > 0) {
      //       return;
      //     }
      //   })
      //   document.title = "Checkmate!";
      //   document.getElementById('title').textContent = "Checkmate!";
      // }
    } else {
      console.log("It's not your turn!");
    }
  }
};

const canBeAttacked = (kingRow, kingCol, opponentColor, possibleState, attackCheck = 0) => {
  if (attackCheck < 0) {
    attackCheck = 0;
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = possibleState[row][col];
      if (piece && ((opponentColor === 'white' && piece === piece.toUpperCase()) || (opponentColor === 'black' && piece === piece.toLowerCase()))) {
        const possibleMoves = getPossibleMoves(piece, row, parseInt(col), possibleState, attackCheck = attackCheck);
        if (possibleMoves.some(([fr, fc, moveRow, moveCol]) => moveRow === kingRow && moveCol === kingCol)) {
          return true;
        }
      }
    }
  }
  return false;
};

const KingPosition = (boardState, currentTurn) => {
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
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    // square.style.backgroundColor = '';
    square.classList.remove('endangered');
  })

  const pieces = document.querySelectorAll('.piece');
  let totalPossibleMoves = [];
  pieces.forEach(piece => {
    if (piece.textContent !== null) {
      piece.removeEventListener('click', handlePieceClick);
      if (piece.classList.contains('obvious')) {
        piece.style.color = '';
      }
      piece.classList.remove('obvious');
      piece.classList.remove('current-turn');

      if ((currentTurn === 'white' && boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)].toUpperCase() === boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)]) ||
        (currentTurn === 'black' && boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)].toLowerCase() === boardState[parseInt(piece.parentElement.dataset.row)][parseInt(piece.parentElement.dataset.col)])) {

        let row = parseInt(piece.parentElement.dataset.row);
        let col = parseInt(piece.parentElement.dataset.col);
        let thisPiecesPossibleMoves = getPossibleMoves(boardState[row][col], row, col, boardState);
        if (thisPiecesPossibleMoves.length !== 0) {
          // piece.style.boxShadow = "0 0 10px rgba(255, 165, 0, 0.8)";
          // if (document.getElementById('obvious').checked) {
          // piece.style.color = 'rgba(255, 165, 0, 0.8)';
          piece.classList.add('obvious');
          if (obviousCheckBox.checked) {
            piece.style.color = "orangered";
          }
          // }
          // piece.style.textShadow = "2px 2px 2px rgba(0,0,0,0.5)";

          piece.addEventListener('click', handlePieceClick);
          piece.classList.add('current-turn');

          totalPossibleMoves = totalPossibleMoves.concat(thisPiecesPossibleMoves);
        }

        // } else {
        // piece.removeEventListener('click', handlePieceClick);
        // piece.classList.remove('current-turn');

        // piece.style.boxShadow = "";
        // piece.style.color = '';
        // piece.classList.remove('obvious');
        // piece.style.textShadow = "";
      }
    }
  });

  if (totalPossibleMoves.length === 0) {
    let king = KingPosition(boardState, currentTurn);
    if (canBeAttacked(king[0], king[1], currentTurn === 'white' ? 'black' : 'white', boardState)) {
      document.title = "Checkmate!";
      document.getElementById('title').textContent = "Checkmate!";
    } else {
      document.title = "Stalemate!";
      document.getElementById('title').textContent = "Stalemate!";
    }
  } else if (totalPossibleMoves.length === 1) {
    let firstLetter = totalPossibleMoves[0][0] === 7 ? 'a' : totalPossibleMoves[0][0] === 6 ? 'b' : totalPossibleMoves[0][0] === 5 ? 'c' : totalPossibleMoves[0][0] === 4 ? 'd' : totalPossibleMoves[0][0] === 3 ? 'e' : totalPossibleMoves[0][0] === 2 ? 'f' : totalPossibleMoves[0][0] === 1 ? 'g' : totalPossibleMoves[0][0] === 0 ? 'h' : totalPossibleMoves[0][0];
    let thirdLetter = totalPossibleMoves[0][2] === 7 ? 'a' : totalPossibleMoves[0][2] === 6 ? 'b' : totalPossibleMoves[0][2] === 5 ? 'c' : totalPossibleMoves[0][2] === 4 ? 'd' : totalPossibleMoves[0][2] === 3 ? 'e' : totalPossibleMoves[0][2] === 2 ? 'f' : totalPossibleMoves[0][2] === 1 ? 'g' : totalPossibleMoves[0][2] === 0 ? 'h' : totalPossibleMoves[0][2];
    document.getElementById('title').textContent = (firstLetter) + (totalPossibleMoves[0][1] + 1) + (thirdLetter) + (totalPossibleMoves[0][3] + 1) + " Forced";
  } else {
    document.title = "Torus Chess " + totalPossibleMoves.length;
    document.getElementById('title').textContent = "Torus Chess " + totalPossibleMoves.length;
  }

  if (totalPossibleMoves.length !== 0 && currentTurn === 'black' && document.getElementById('bot').checked) {
    const randomMove = totalPossibleMoves[Math.floor(Math.random() * totalPossibleMoves.length)];
    movePiece(randomMove[0], randomMove[1], randomMove[2], randomMove[3]);
  }

  // const currentKingPosition = currentKingPosition();
  const [kingRow, kingCol] = KingPosition(boardState, currentTurn) || [null, null];
  const opponentColor = currentTurn === 'white' ? 'black' : 'white';
  if (kingRow !== null) {
    if (canBeAttacked(kingRow, kingCol, opponentColor, boardState)) {
      const kingSquare = document.querySelector(`.square[data-row="${kingRow}"][data-col="${kingCol}"]`);
      // kingSquare.style.backgroundColor = 'red';
      kingSquare.classList.add('endangered');
    }
  }
};


// Call this after creating the board
createBoard();
enablePieceSelection();
