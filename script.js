const board = document.getElementById('board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');
const resetScoresButton = document.getElementById('resetScores');
const modeSelect = document.getElementById('mode');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

let currentPlayer = 'X';
let cells = Array(9).fill(null);
let gameOver = false;
let mode = 'human';
let scoreX = 0;
let scoreO = 0;

// Create cells
board.innerHTML = '';
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.index = i;
  board.appendChild(cell);
}

function resetGame() {
  cells.fill(null);
  currentPlayer = 'X';
  gameOver = false;
  status.textContent = `Player ${currentPlayer}'s turn`;
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('winning');
  });
}

function checkWinner() {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const [a,b,c] of winPatterns) {
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      [a,b,c].forEach(i => document.querySelector(`[data-index="${i}"]`).classList.add('winning'));

      if (cells[a] === 'X') {
        scoreX++; scoreXDisplay.textContent = scoreX;
        winSound.play();
      } else {
        scoreO++; scoreODisplay.textContent = scoreO;
        (mode === 'human' ? winSound : loseSound).play();
      }
      return true;
    }
  }

  return false;
}

function makeMove(index) {
  if (cells[index] || gameOver) return;

  cells[index] = currentPlayer;
  const cell = document.querySelector(`[data-index="${index}"]`);
  cell.textContent = currentPlayer === 'X' ? '❌' : '🟢';

  if (checkWinner()) {
    status.textContent = `Player ${currentPlayer} wins!`;
    gameOver = true;
  } else if (cells.every(cell => cell !== null)) {
    status.textContent = "It's a draw!";
    gameOver = true;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;

    if (mode !== 'human' && currentPlayer === 'O') {
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  let index;
  if (mode === 'easy') index = getRandomMove();
  else if (mode === 'medium') index = getBlockingMove('X') ?? getRandomMove();
  else if (mode === 'hard') index = getBestMove();
  if (index !== undefined) makeMove(index);
}

function getRandomMove() {
  const empty = cells.map((val, i) => val === null ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBlockingMove(player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const [a, b, c] of winPatterns) {
    const line = [cells[a], cells[b], cells[c]];
    const indexes = [a, b, c];
    if (line.filter(val => val === player).length === 2 && line.includes(null)) {
      return indexes[line.indexOf(null)];
    }
  }
  return null;
}

function getBestMove() {
  let bestScore = -Infinity, move;
  for (let i = 0; i < 9; i++) {
    if (cells[i] === null) {
      cells[i] = 'O';
      const score = minimax(cells, 0, false);
      cells[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  const winner = getWinner(board);
  if (winner !== null) {
    const scores = { 'X': -10, 'O': 10, 'draw': 0 };
    return scores[winner];
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getWinner(board) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  return board.every(cell => cell !== null) ? 'draw' : null;
}

// Event Listeners
board.addEventListener('click', (e) => {
  if (!e.target.classList.contains('cell')) return;
  const index = e.target.dataset.index;
  if (currentPlayer === 'X' || mode === 'human') {
    makeMove(index);
  }
});

resetButton.addEventListener('click', resetGame);

resetScoresButton.addEventListener('click', () => {
  scoreX = 0;
  scoreO = 0;
  scoreXDisplay.textContent = 0;
  scoreODisplay.textContent = 0;
});

modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
  resetGame();
});
