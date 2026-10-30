/**
 * Tic-tac-toe against the site. The bot plays perfect minimax, so the best
 * anyone can do is a draw.
 */

type Cell = "X" | "O" | null;

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winner(b: Cell[]): { mark: Cell; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line };
  }
  return null;
}

function minimax(b: Cell[], turn: "X" | "O", depth: number): number {
  const w = winner(b);
  if (w) return w.mark === "O" ? 10 - depth : depth - 10;
  if (b.every(Boolean)) return 0;
  let best = turn === "O" ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = turn;
    const score = minimax(b, turn === "O" ? "X" : "O", depth + 1);
    b[i] = null;
    best = turn === "O" ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function botMove(b: Cell[]): number {
  const open = b.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  let best = -Infinity;
  let moves: number[] = [];
  for (const i of open) {
    b[i] = "O";
    const s = minimax(b, "X", 0);
    b[i] = null;
    if (s > best) {
      best = s;
      moves = [i];
    } else if (s === best) moves.push(i);
  }
  return moves[(Math.random() * moves.length) | 0];
}

export function mountTicTacToe(root: HTMLElement) {
  const cells = [...root.querySelectorAll<HTMLButtonElement>("[data-cell]")];
  const status = root.querySelector<HTMLElement>("[data-status]")!;
  const youEl = root.querySelector<HTMLElement>("[data-score-you]")!;
  const botEl = root.querySelector<HTMLElement>("[data-score-bot]")!;
  const botName = root.dataset.bot ?? "me";
  const score = { you: 0, bot: 0 };
  let board: Cell[] = Array(9).fill(null);
  let locked = false;
  let youStart = true;

  const paint = (line?: number[]) => {
    cells.forEach((el, i) => {
      el.textContent = board[i] ?? "";
      el.disabled = locked || !!board[i];
      el.dataset.mark = board[i] ?? "";
      el.classList.toggle("win", !!line?.includes(i));
    });
    youEl.textContent = String(score.you);
    botEl.textContent = String(score.bot);
  };

  const reset = () => {
    board = Array(9).fill(null);
    locked = false;
    youStart = !youStart;
    if (youStart) {
      status.textContent = "You're X. Your move.";
      paint();
    } else {
      status.textContent = `${botName} goes first this time.`;
      locked = true;
      paint();
      setTimeout(() => {
        board[botMove(board)] = "O";
        locked = false;
        status.textContent = "Your move.";
        paint();
      }, 450);
    }
  };

  const finish = (): boolean => {
    const w = winner(board);
    if (w) {
      locked = true;
      if (w.mark === "X") {
        score.you++;
        status.textContent = "Okay, you got me. Again?";
      } else {
        score.bot++;
        status.textContent = "Mine. Run it back?";
      }
      paint(w.line);
      setTimeout(reset, 1800);
      return true;
    }
    if (board.every(Boolean)) {
      locked = true;
      status.textContent = "Draw. Classic.";
      paint();
      setTimeout(reset, 1500);
      return true;
    }
    return false;
  };

  cells.forEach((el, i) =>
    el.addEventListener("click", () => {
      if (locked || board[i]) return;
      board[i] = "X";
      paint();
      if (finish()) return;
      locked = true;
      status.textContent = "Thinking…";
      paint();
      setTimeout(() => {
        board[botMove(board)] = "O";
        locked = false;
        status.textContent = "Your move.";
        paint();
        finish();
      }, 380);
    }),
  );

  status.textContent = "You're X. Good luck :)";
  paint();
}
