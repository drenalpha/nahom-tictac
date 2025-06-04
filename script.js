const board = Array(9).fill(null);
const cells = document.querySelectorAll('.cell');
const modeSelect = document.getElementById('modeSelect');
const resetBtn = document.getElementById('resetBtn');
const currentTurnEl = document.getElementById('currentTurn');

let currentPlayer = 'X';  // X is ❌, O is ⭕ internally
let gameActive = true;

// Emoji mapping
const emojiMap = { 'X': '❌', 'O': '⭕' };

function updateTurnMessage() {
  if (!gameActive) {
    return; // keep the final message as is
  }
  currentTurnEl.textContent = `Player ${emojiMap[currentPlayer]}'s turn`;
}

function checkWin(board, player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],  // rows
    [0,3,6],[1,4,7],[2,5,8],  // cols
    [0,4,8],[2,4,6]           // diagonals
  ];
  for (const pattern of winPatterns) {
    if (pattern.every(index => board[index] === player)) {
      return pattern;
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null);
}

function highlightWin(cellsToHighlight) {
  cellsToHighlight.forEach(index => {
    cells[index].classList.add('win-cell');
  });
}

function resetGame() {
  board.fill(null);
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win-cell', 'disabled');
  });
  currentPlayer = 'X';
  gameActive = true;
  updateTurnMessage();
}

function switchPlayer() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateTurnMessage();
}

function playerMove(index) {
  if (!gameActive || board[index] !== null) return;

  board[index] = currentPlayer;
  cells[index].textContent = emojiMap[currentPlayer];
  cells[index].classList.add('disabled');

  const winningCells = checkWin(board, currentPlayer);
  if (winningCells) {
    highlightWin(winningCells);
    currentTurnEl.textContent = `Player ${emojiMap[currentPlayer]} wins!`;
    gameActive = false;
    return;
  }
  if (checkDraw(board)) {
    currentTurnEl.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  switchPlayer();
  if (modeSelect.value !== 'human' && currentPlayer === 'O') {
    aiMove(modeSelect.value);
  }
}

// Easy AI: random empty cell
function easyAI() {
  const emptyIndices = board.map((v,i) => v === null ? i : null).filter(i => i !== null);
  const choice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  return choice;
}

// Medium AI: tries to win or block immediate threats, else random
function mediumAI() {
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      if (checkWin(board, 'O')) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'X';
      if (checkWin(board, 'X')) {
        board[i] = null;
        return i;
      }
      board[i] = null;
    }
  }
  return easyAI();
}

// Hard AI: Minimax algorithm
function minimax(newBoard, player) {
  const availSpots = newBoard.map((v,i) => v === null ? i : null).filter(i => i !== null);

  if (checkWin(newBoard, 'X')) {
    return { score: -10 };
  } else if (checkWin(newBoard, 'O')) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  const moves = [];
  for (const i of availSpots) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    if (player ===
