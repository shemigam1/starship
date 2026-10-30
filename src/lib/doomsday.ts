/**
 * Loading-screen animation: an ASCII planet spins, an asteroid streaks in,
 * and the planet shatters into debris. Drawn on a monospace cell grid.
 */

const COLS = 72;
const ROWS = 30;
const RAMP = " .:-=+*#%@";
const IMPACT = 1.35; // seconds until the asteroid hits
export const DURATION = 3.1; // seconds until the loader should leave

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ch: string;
  hot: number;
}

interface Colors {
  fg: string;
  accent: string;
  muted: string;
}

const CAPTIONS: [number, string][] = [
  [0, "> booting semilore.exe"],
  [0.75, "> incoming object detected"],
  [IMPACT + 0.05, "> planet.exe has stopped responding"],
  [IMPACT + 0.9, "> rebuilding the universe…"],
];

export class Doomsday {
  private ctx: CanvasRenderingContext2D;
  private cx = COLS / 2;
  private cy = ROWS / 2 - 1;
  private r = 8.5;
  private debris: Debris[] = [];
  private exploded = false;
  private cw = 10;
  private ch = 16;

  constructor(
    private canvas: HTMLCanvasElement,
    private caption: HTMLElement,
    private colors: Colors,
    private font: string,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Fit the grid to the screen, keeping cells ~1.6x taller than wide.
    this.cw = Math.max(5, Math.min(12, Math.floor((window.innerWidth * 0.92) / COLS)));
    this.ch = Math.round(this.cw * 1.6);
    const w = this.cw * COLS;
    const h = this.ch * ROWS;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Draw the frame at `t` seconds. */
  frame(t: number) {
    const { ctx, cw, ch, colors } = this;
    ctx.clearRect(0, 0, cw * COLS, ch * ROWS);
    ctx.font = `600 ${Math.round(ch * 0.78)}px ${this.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const put = (c: number, r: number, g: string, color: string, alpha = 1) => {
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS || g === " ") return;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillText(g, c * cw + cw / 2, r * ch + ch / 2);
    };

    this.stars(t, put);

    if (t < IMPACT) {
      this.planet(t, put);
      this.asteroid(t, put);
    } else {
      if (!this.exploded) this.explode();
      this.blast(t - IMPACT, put);
    }

    this.captions(t);
    ctx.globalAlpha = 1;
  }

  private stars(t: number, put: (c: number, r: number, g: string, color: string, a?: number) => void) {
    for (let i = 0; i < 70; i++) {
      const c = (i * 37 + 11) % COLS;
      const r = (i * 53 + 7) % ROWS;
      const twinkle = 0.25 + 0.25 * Math.sin(t * 3 + i);
      put(c, r, i % 7 === 0 ? "+" : ".", this.colors.fg, twinkle);
    }
  }

  /** Shaded sphere with bands that scroll sideways so it looks like it's spinning. */
  private planet(t: number, put: (c: number, r: number, g: string, color: string, a?: number) => void) {
    const { cx, cy, r } = this;
    // It trembles in the last moments before impact.
    const shake = t > IMPACT - 0.25 ? (Math.random() - 0.5) * 0.8 : 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const dx = (col - cx - shake) / 2;
        const dy = row - cy;
        const d = Math.hypot(dx, dy);
        if (d > r) {
          // Thin ring around the planet.
          const rx = dx * 0.95 + dy * 0.3;
          const ry = (-dx * 0.3 + dy * 0.95) * 3.4;
          const rd = Math.hypot(rx, ry);
          if (Math.abs(rd - r * 1.55) < 0.55 && ry > -r * 0.4) put(col, row, "-", this.colors.muted, 0.8);
          continue;
        }
        const nx = dx / r;
        const ny = dy / r;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        let shade = Math.max(0, -0.55 * nx - 0.5 * ny + 0.68 * nz);
        // Longitude of this point; scrolling it with time spins the surface.
        const lon = Math.atan2(nx, nz) + t * 1.4;
        shade *= 0.78 + 0.22 * Math.sin(lon * 3 + ny * 4);
        const g = RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(shade * (RAMP.length - 1)))];
        put(col, row, g, this.colors.fg, 0.9);
      }
    }
  }

  private asteroid(t: number, put: (c: number, r: number, g: string, color: string, a?: number) => void) {
    // From the top-left corner to the planet's upper-left limb.
    const k = Math.pow(t / IMPACT, 1.6);
    const sx = -4;
    const sy = 1;
    const ex = this.cx - this.r * 1.3;
    const ey = this.cy - this.r * 0.55;
    const x = sx + (ex - sx) * k;
    const y = sy + (ey - sy) * k;
    const trail = "@%*+=-~.";
    for (let i = trail.length - 1; i >= 0; i--) {
      const back = i * 1.3;
      const len = Math.hypot(ex - sx, ey - sy);
      const tx = x - ((ex - sx) / len) * back * 1.6;
      const ty = y - ((ey - sy) / len) * back * 0.55;
      put(Math.round(tx), Math.round(ty), trail[i], this.colors.accent, 1 - i / trail.length);
    }
  }

  private explode() {
    this.exploded = true;
    const ix = this.cx - this.r * 1.1;
    const iy = this.cy - this.r * 0.45;
    const { cx, cy, r } = this;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const dx = (col - cx) / 2;
        const dy = row - cy;
        if (Math.hypot(dx, dy) > r || Math.random() < 0.35) continue;
        // Fly away from the impact point, faster the closer they were to it.
        const ax = col - ix;
        const ay = (row - iy) * 2;
        const dist = Math.hypot(ax, ay) || 1;
        const speed = (14 + Math.random() * 26) * (1.3 - Math.min(1, dist / 30) * 0.6);
        this.debris.push({
          x: col,
          y: row,
          vx: (ax / dist) * speed * (0.6 + Math.random() * 0.8),
          vy: (ay / dist) * speed * 0.5 * (0.6 + Math.random() * 0.8),
          ch: "#%*+=:."[Math.floor(Math.random() * 7)],
          hot: Math.random(),
        });
      }
    }
  }

  private blast(dt: number, put: (c: number, r: number, g: string, color: string, a?: number) => void) {
    const ix = this.cx - this.r * 1.1;
    const iy = this.cy - this.r * 0.45;
    // White-hot flash, then an expanding shockwave ring.
    if (dt < 0.12) {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (Math.hypot((col - ix) / 2, row - iy) < 6 + dt * 80) put(col, row, "#", this.colors.accent, 1 - dt * 6);
        }
      }
    }
    const radius = dt * 34;
    const fade = Math.max(0, 1 - dt / 1.2);
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      put(Math.round(ix + Math.cos(a) * radius * 2), Math.round(iy + Math.sin(a) * radius), fade > 0.5 ? "o" : ".", this.colors.accent, fade);
    }
    // Debris drifts outward and cools from orange to grey.
    const drag = Math.exp(-dt * 1.2);
    for (const d of this.debris) {
      const x = d.x + d.vx * dt * drag;
      const y = d.y + d.vy * dt * drag;
      const hot = d.hot > dt * 1.4;
      const g = dt > 1.2 ? (d.ch === "#" || d.ch === "%" ? "*" : ".") : d.ch;
      put(Math.round(x), Math.round(y), g, hot ? this.colors.accent : this.colors.fg, Math.max(0.15, 1 - dt * 0.45));
    }
  }

  private shown = "";
  private captions(t: number) {
    let line = CAPTIONS[0];
    for (const c of CAPTIONS) if (t >= c[0]) line = c;
    // Type each caption out over ~0.35s.
    const n = Math.min(line[1].length, Math.floor(((t - line[0]) / 0.35) * line[1].length) + 1);
    const text = line[1].slice(0, n);
    if (text !== this.shown) {
      this.shown = text;
      this.caption.textContent = text;
    }
  }
}
