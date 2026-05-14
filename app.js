let cg;
let gameData = null;

let currentNode = null;
let path = [];
let colorChoice = "white";
let flipped = false;

let lastCorrectMoves = [];
let lastComment = "";

// ---------------- BOARD INIT ----------------

function initBoard() {
  cg = Chessground(document.getElementById("board"), {
    orientation: "white",
    movable: {
      free: false,
      color: "white",
      dests: {}
    },
    events: {
      move: onMove
    }
  });
}

initBoard();

// ---------------- JSON FROM GITHUB ----------------

const JSON_URL =
  "https://raw.githubusercontent.com/spidermandavi/RK-opening-practicer-2/main/data/game1.json";

async function loadJSONFromGitHub() {
  try {
    setStatus("Loading training data...");
    const res = await fetch(JSON_URL);

    if (!res.ok) throw new Error("HTTP error " + res.status);

    gameData = await res.json();
    startGame();

  } catch (err) {
    console.error("Failed to load JSON:", err);
    setStatus("Failed to load JSON from GitHub");
  }
}

// ---------------- GAME START ----------------

function startGame() {
  currentNode = gameData.root;
  path = [currentNode.id];

  setStatus("Game started");
  nextBotMove();
}

// ---------------- MOVE LOGIC ----------------

function getAllMoves(node) {
  return [...(node.children || []), ...(node.variations || [])];
}

function nextBotMove() {
  const moves = getAllMoves(currentNode);

  if (moves.length === 0) {
    setStatus("Line finished!");
    return;
  }

  const chosen = moves[Math.floor(Math.random() * moves.length)];
  applyMove(chosen);
}

function applyMove(node) {
  lastCorrectMoves = getAllMoves(currentNode);

  currentNode = node;
  path.push(node.id);

  setStatus("Your turn");
}

// ---------------- USER MOVE ----------------

function onMove(orig, dest) {
  const moves = getAllMoves(currentNode);

  const match = moves.find(m => matchMove(m.move, orig, dest));

  if (!match) {
    setStatus("Wrong move!");
    return;
  }

  lastComment = match.comment || "";

  applyMove(match);
  setTimeout(nextBotMove, 500);
}

// ---------------- MOVE MATCHING ----------------

function matchMove(san, from, to) {
  return san.includes(from) || san.includes(to);
}

// ---------------- UI ----------------

function setStatus(text) {
  document.getElementById("status").innerText = text;
}

function makeHint() {
  setStatus("Hint: one of the moves is available.");
}

function showSolution() {
  const moves = getAllMoves(currentNode);

  document.getElementById("output").innerText =
    "Possible moves:\n" + moves.map(m => m.san).join("\n");
}

function showComment() {
  document.getElementById("output").innerText =
    lastComment || "No comment.";
}

function restart() {
  startGame();
}

function restartLine() {
  currentNode = gameData.root;
  path = [currentNode.id];
  startGame();
}

function flip() {
  flipped = !flipped;
  cg.set({ orientation: flipped ? "black" : "white" });
}

function leave() {
  setStatus("Exited training.");
}

function summary() {
  document.getElementById("output").innerText =
    "Path:\n" + path.join(" → ");
}

function setColor(c) {
  colorChoice = c;
}

// ---------------- START AUTO LOAD ----------------

loadJSONFromGitHub();
