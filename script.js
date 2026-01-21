// DOM elements
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const turnEl = document.getElementById("turn");
const substatusEl = document.getElementById("substatus");

const modeSelect = document.getElementById("mode");
const playerMarkSelect = document.getElementById("playerMark");
const cpuLevelSelect = document.getElementById("cpuLevel");

const newBtn = document.getElementById("newBtn");
const restartBtn = document.getElementById("restart");
const undoBtn = document.getElementById("undoBtn");
const autoSolve = document.getElementById("autoSolve");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDEl = document.getElementById("scoreD");
const resetScoreBtn = document.getElementById("resetScore");

// Game state
let grid = Array(9).fill(null);
let current = "X";
let humanMark = "X";
let cpuMark = "O";
let mode = "pvp";
let cpuLevel = "normal";
let lastMove = null;

let scores = { X: 0, O: 0, D: 0 };

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Build board
function buildBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", onCellClick);
    boardEl.appendChild(cell);
  }
}

// Render
function render() {
  const cells = boardEl.children;
  for (let i = 0; i < 9; i++) {
    const val = grid[i];
    const el = cells[i];
    el.className = "cell"; 
    el.textContent = val ? val : "";
    if (val) el.classList.add(val.toLowerCase());
  }
  turnEl.textContent = current;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

// Check winner
function checkWinner(b) {
  for (const combo of wins) {
    const [a, b1, c] = combo;
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return { winner: b[a], combo };
    }
  }
  if (b.every(Boolean)) return { winner: "D" };
  return null;
}

// Click handler
function onCellClick(e) {
  const i = Number(e.currentTarget.dataset.index);

  if (grid[i] || checkWinner(grid)) return;

  if (mode === "cpu" && current !== humanMark) return;

  playTurn(i);
}

// Play a turn
function playTurn(index) {
  grid[index] = current;
  lastMove = index;
  render();

  const result = checkWinner(grid);
  if (result) return finalize(result);

  current = current === "X" ? "O" : "X";
  substatusEl.textContent = current === cpuMark ? "CPU thinking..." : "Your move";

  if (mode === "cpu" && current === cpuMark)
    setTimeout(cpuPlay, 300);
}

// Highlight win
function highlightWin(combo) {
  combo.forEach(i => boardEl.children[i].classList.add("win"));
}

// End game
function finalize(result) {
  if (result.winner === "D") {
    scores.D++;
    substatusEl.textContent = "Draw!";
  } else {
    scores[result.winner]++;
    substatusEl.textContent = `${result.winner} wins!`;
    highlightWin(result.combo);
  }
  render();
  saveScores();
}

// CPU move logic
function cpuPlay() {
  let available = grid.map((v, i) => (v ? null : i)).filter(v => v !== null);
  if (available.length === 0) return;

  let move =
    available[Math.floor(Math.random() * available.length)];

  playTurn(move);
}

// Reset round
function newRound() {
  grid = Array(9).fill(null);
  current = "X";
  substatusEl.textContent = "Make your move";
  render();
}

// New game
function newGame() {
  scores = { X: 0, O: 0, D: 0 };
  saveScores();
  newRound();
}

// Undo last move
function undo() {
  if (lastMove != null) {
    grid[lastMove] = null;
    lastMove = null;
    current = "X";
    substatusEl.textContent = "Undo successful";
    render();
  }
}

// Save/load scores
function saveScores() {
  localStorage.setItem("ttt_scores", JSON.stringify(scores));
}
function loadScores() {
  const s = JSON.parse(localStorage.getItem("ttt_scores"));
  if (s) scores = s;
}

// Settings UI updates
function updateSettings() {
  mode = modeSelect.value;
  humanMark = playerMarkSelect.value;
  cpuMark = humanMark === "X" ? "O" : "X";
}

modeSelect.addEventListener("change", updateSettings);
playerMarkSelect.addEventListener("change", updateSettings);
cpuLevelSelect.addEventListener("change", updateSettings);

newBtn.addEventListener("click", newGame);
restartBtn.addEventListener("click", newRound);
undoBtn.addEventListener("click", undo);

// Init
function init() {
  buildBoard();
  loadScores();
  render();
  updateSettings();
}
init();
