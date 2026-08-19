(function () {
  'use strict';

  // ---------- Gameboard module ----------
  const Gameboard = (function () {
    let board = Array(9).fill('');
    const getBoard = () => board.slice();
    const setCell = (i, mark) => {
      if (board[i] !== '') return false;
      board[i] = mark;
      return true;
    };
    const reset = () => { board = Array(9).fill(''); };
    const isFull = () => board.every((c) => c !== '');
    return { getBoard, setCell, reset, isFull };
  })();

  // ---------- Player factory ----------
  const Player = (mark, isAI = false) => ({ mark, isAI });

  // ---------- Win detection ----------
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  function getWinner(board) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { mark: board[a], line };
      }
    }
    return null;
  }

  // ---------- Minimax AI ----------
  function minimax(board, depth, isMaximizing, aiMark, humanMark) {
    const winner = getWinner(board);
    if (winner) return winner.mark === aiMark ? 10 - depth : depth - 10;
    if (board.every((c) => c !== '')) return 0;

    const mark = isMaximizing ? aiMark : humanMark;
    let best = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] !== '') continue;
      board[i] = mark;
      const score = minimax(board, depth + 1, !isMaximizing, aiMark, humanMark);
      board[i] = '';
      best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
  }

  function bestMove(board, aiMark, humanMark) {
    let move = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== '') continue;
      board[i] = aiMark;
      const score = minimax(board, 0, false, aiMark, humanMark);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
    return move;
  }

  // ---------- Game controller ----------
  const GameController = (function () {
    let mode = 'ai';
    let current = null;
    let over = false;
    const playerX = Player('X');
    const playerO = Player('O', true);
    const scores = { X: 0, O: 0, tie: 0 };

    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const tallyX = document.getElementById('tallyX');
    const tallyO = document.getElementById('tallyO');
    const tallyTie = document.getElementById('tallyTie');
    const countX = document.getElementById('countX');
    const countO = document.getElementById('countO');
    const countTie = document.getElementById('countTie');

    function buildCells() {
      boardEl.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'cell';
        btn.dataset.index = i;
        btn.addEventListener('click', onCellClick);
        boardEl.appendChild(btn);
      }
    }

    function markSVG(mark) {
      if (mark === 'X') {
        return `<svg class="mark mark-x" viewBox="0 0 100 100"><path d="M20 18 C45 45, 55 55, 82 84"></path><path d="M82 18 C58 44, 44 56, 18 84"></path></svg>`;
      }
      return `<svg class="mark mark-o" viewBox="0 0 100 100"><circle cx="50" cy="50" r="34"></circle></svg>`;
    }

    function render(winnerInfo) {
      const board = Gameboard.getBoard();
      [...boardEl.children].forEach((cell, i) => {
        cell.innerHTML = board[i] ? markSVG(board[i]) : '';
        cell.classList.toggle('filled', !!board[i]);
        cell.classList.toggle('locked', over);
        cell.classList.remove('winning');
      });
      if (winnerInfo) {
        winnerInfo.line.forEach((i) => boardEl.children[i].classList.add('winning'));
      }
    }

    function setStatus(text, isWin) {
      statusEl.innerHTML = text;
      statusEl.classList.toggle('win', !!isWin);
    }

    // Render a running score as hand-tally strokes: 4 uprights, 5th crosses them.
    function tallyMarks(n) {
      if (n === 0) return '—';
      let out = '';
      for (let i = 1; i <= n; i++) {
        out += (i % 5 === 0) ? '\u0338' : '|';
        out += ' ';
      }
      return out.trim();
    }

    function updateScoreboard() {
      tallyX.textContent = tallyMarks(scores.X);
      tallyO.textContent = tallyMarks(scores.O);
      tallyTie.textContent = tallyMarks(scores.tie);
      countX.textContent = `(${scores.X})`;
      countO.textContent = `(${scores.O})`;
      countTie.textContent = `(${scores.tie})`;
    }

    function endTurnChecks() {
      const board = Gameboard.getBoard();
      const winner = getWinner(board);
      if (winner) {
        over = true;
        scores[winner.mark] += 1;
        updateScoreboard();
        render(winner);
        setStatus(`<span class="who">${winner.mark}</span> wins the round`, true);
        return true;
      }
      if (Gameboard.isFull()) {
        over = true;
        scores.tie += 1;
        updateScoreboard();
        render(null);
        setStatus("Board full — nobody's round", true);
        return true;
      }
      return false;
    }

    function aiTurn() {
      const aiMark = playerO.mark;
      const humanMark = playerX.mark;
      const move = bestMove(Gameboard.getBoard(), aiMark, humanMark);
      if (move === -1) return;
      Gameboard.setCell(move, aiMark);
      render(null);
      if (endTurnChecks()) return;
      current = 'X';
      setStatus(`<span class="who">${current}</span>'s turn to mark`);
    }

    function onCellClick(e) {
      if (over) return;
      const i = Number(e.currentTarget.dataset.index);
      if (mode === 'ai' && current === 'O') return;

      if (!Gameboard.setCell(i, current)) return;
      render(null);
      if (endTurnChecks()) return;

      current = current === 'X' ? 'O' : 'X';
      setStatus(`<span class="who">${current}</span>'s turn to mark`);

      if (mode === 'ai' && current === 'O' && !over) {
        setTimeout(aiTurn, 350);
      }
    }

    function newRound() {
      Gameboard.reset();
      over = false;
      current = 'X';
      buildCells();
      render(null);
      setStatus(`<span class="who">${current}</span>'s turn to mark`);
    }

    function setMode(newMode) {
      mode = newMode;
      newRound();
    }

    function init() {
      buildCells();
      newRound();
      updateScoreboard();
      document.getElementById('resetBtn').addEventListener('click', newRound);
      document.querySelectorAll('.mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          setMode(btn.dataset.mode);
        });
      });
    }

    return { init };
  })();

  GameController.init();
})();
