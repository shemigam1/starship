/**
 * ASCII starfield: parallax stars, passing ships with diffusing exhaust,
 * and click-to-warp shockwaves, all drawn on a monospace cell grid.
 *
 * The loop, cell sizing, grid painting and wake diffusion are adapted from
 * ascii-sharks by drewdi (MIT): https://github.com/stackedlol/ascii-sharks
 */
import { SPRITES, shape, type Sprite } from "./sprites";

const STEP = 1 / 60;
const MAX_STEPS = 4;
const STAR_GLYPHS = [".", "·", "+", "*"];
const HEAT_RAMP = ".:-=+*#";
const WARP_TIME = 1.4;

export interface StarfieldStats {
  ships: number;
  warps: number;
}

interface Star {
  x: number;
  y: number;
  z: number; // 0 far … 1 near
  phase: number;
}

interface Ship {
  x: number;
  y: number;
  vx: number;
  sprite: Sprite;
  rows: string[];
  left: boolean;
  bob: number;
}

interface Wave {
  x: number;
  y: number;
  t: number;
}

interface Palette {
  bg: string;
  fg: string;
  accent: string;
  heat: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export class Starfield {
  private ctx: CanvasRenderingContext2D;
  private bg = document.createElement("canvas");
  private dpr = 1;
  private width = 0;
  private height = 0;
  private cw = 12;
  private ch = 18;
  private cols = 0;
  private rows = 0;
  private heat = new Float32Array(0);
  private heatTmp = new Float32Array(0);
  private stars: Star[] = [];
  private ships: Ship[] = [];
  private waves: Wave[] = [];
  private warp = 0;
  private time = 0;
  private nextShip = 0.5;
  private warps = 0;
  private pointer = { x: 0, y: 0, active: false };
  private palette: Palette = { bg: "#000", fg: "#fff", accent: "#ff7a2f", heat: "255,122,47" };
  private font = "ui-monospace, monospace";

  private raf = 0;
  private last = 0;
  private acc = 0;
  private visible = true;
  private disposed = false;
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private resizeObserver = new ResizeObserver(() => this.resize());
  private intersectionObserver = new IntersectionObserver(([e]) => {
    this.visible = e.isIntersecting;
    this.schedule();
  });

  constructor(
    private canvas: HTMLCanvasElement,
    private onStats?: (s: StarfieldStats) => void,
  ) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.font = getComputedStyle(canvas).fontFamily || this.font;
    this.readPalette();

    this.resizeObserver.observe(canvas);
    this.intersectionObserver.observe(canvas);
    this.reducedMotion.addEventListener("change", this.onMotionPreference);
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    window.addEventListener("blur", this.onPointerLeave);

    this.resize();
    // Canvas text can't trigger a webfont load, so redraw once the mono face arrives.
    document.fonts?.load(`600 16px ${this.font}`).then(() => {
      if (!this.disposed && this.reducedMotion.matches) this.drawStill();
    });
    this.schedule();
  }

  destroy() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.reducedMotion.removeEventListener("change", this.onMotionPreference);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("blur", this.onPointerLeave);
  }

  /** Re-read colours from CSS custom properties (call after a theme change). */
  readPalette() {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
    this.palette = {
      bg: v("--bg", "#0b0b0c"),
      fg: v("--fg", "#f2efe6"),
      accent: v("--accent", "#ff7a2f"),
      heat: v("--heat-rgb", "255,122,47"),
    };
    if (this.width) {
      this.paintBackground();
      if (this.reducedMotion.matches) this.drawStill();
    }
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prevCols = this.cols;
    const prevRows = this.rows;
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = dpr;
    this.cw = clamp(Math.round(rect.width / 140), 8, 12);
    this.ch = Math.round(this.cw * 1.55);
    this.cols = Math.ceil(rect.width / this.cw);
    this.rows = Math.ceil(rect.height / this.ch);
    this.canvas.width = this.bg.width = Math.round(rect.width * dpr);
    this.canvas.height = this.bg.height = Math.round(rect.height * dpr);

    if (this.cols !== prevCols || this.rows !== prevRows) {
      this.heat = new Float32Array(this.cols * this.rows);
      this.heatTmp = new Float32Array(this.cols * this.rows);
    }

    // Star density scales with area; keep existing stars where they are.
    const target = Math.round((rect.width * rect.height) / 2600);
    while (this.stars.length < target) {
      this.stars.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        z: Math.pow(Math.random(), 2.2),
        phase: Math.random() * Math.PI * 2,
      });
    }
    this.stars.length = target;
    this.paintBackground();
    if (this.reducedMotion.matches) this.drawStill();
  }

  private paintBackground() {
    const g = this.bg.getContext("2d");
    if (!g) return;
    const { width: W, height: H, dpr, cw, ch } = this;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = this.palette.bg;
    g.fillRect(0, 0, W * dpr, H * dpr);
    g.globalAlpha = 0.05;
    g.strokeStyle = this.palette.fg;
    g.lineWidth = 1;
    g.beginPath();
    for (let c = 0; c <= Math.ceil(W / cw); c++) {
      const x = Math.round(c * cw * dpr) + 0.5;
      g.moveTo(x, 0);
      g.lineTo(x, H * dpr);
    }
    for (let r = 0; r <= Math.ceil(H / ch); r++) {
      const y = Math.round(r * ch * dpr) + 0.5;
      g.moveTo(0, y);
      g.lineTo(W * dpr, y);
    }
    g.stroke();
    g.globalAlpha = 1;
  }

  private schedule() {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || this.reducedMotion.matches) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < MAX_STEPS) {
      this.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) this.acc = 0;
    this.render();
    this.raf = requestAnimationFrame(this.frame);
  };

  /** Reduced motion: let a few ships arrive, then show a single frame. */
  private drawStill() {
    if (this.time < 6) for (let i = 0; i < 360; i++) this.step(STEP);
    this.render();
  }

  // ---------------------------------------------------------------- simulation

  private step(dt: number) {
    this.time += dt;
    this.warp = Math.max(0, this.warp - dt);
    const warpBoost = 1 + 26 * Math.pow(this.warp / WARP_TIME, 1.6);

    for (const s of this.stars) {
      s.x -= (4 + s.z * 46) * warpBoost * dt;
      if (s.x < -this.cw * 4) {
        s.x = this.width + Math.random() * this.cw * 4;
        s.y = Math.random() * this.height;
      }
    }

    this.nextShip -= dt;
    if (this.nextShip <= 0 && this.ships.length < this.maxShips()) {
      this.spawnShip();
      this.nextShip = rand(2.5, 6);
    }

    const { pointer } = this;
    for (const ship of this.ships) {
      ship.x += ship.vx * (1 + (warpBoost - 1) * 0.15) * dt;
      ship.bob += dt;
      // Ships ease away from the cursor rather than flying through it.
      if (pointer.active) {
        const cy = ship.y + (ship.rows.length * this.ch) / 2;
        const cx = ship.x + (ship.rows[0].length * this.cw) / 2;
        const dx = pointer.x - cx;
        const dy = pointer.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160) ship.y -= Math.sign(dy || 1) * (1 - Math.sqrt(d2) / 160) * 90 * dt;
      }
      ship.y = clamp(ship.y, 0, this.height - ship.rows.length * this.ch);
      this.depositExhaust(ship);
    }
    this.ships = this.ships.filter((s) => s.x > -400 && s.x < this.width + 400);

    for (const w of this.waves) w.t += dt;
    this.waves = this.waves.filter((w) => w.t < 1.6);

    this.diffuse(dt);
    this.emitStats();
  }

  private maxShips() {
    return this.width < 700 ? 2 : 4;
  }

  private spawnShip(x?: number, y?: number) {
    const sprite = SPRITES[(Math.random() * SPRITES.length) | 0];
    const left = x !== undefined ? Math.random() < 0.5 : Math.random() < 0.35;
    const rows = shape(sprite, left);
    const w = rows[0].length * this.cw;
    const speed = sprite.speed * rand(0.75, 1.25);
    this.ships.push({
      x: x ?? (left ? this.width + 20 : -w - 20),
      y: y ?? rand(this.ch * 3, this.height * 0.8),
      vx: left ? -speed : speed,
      sprite,
      rows,
      left,
      bob: Math.random() * 10,
    });
  }

  private depositExhaust(ship: Ship) {
    const { cw, ch, cols, rows } = this;
    const col0 = Math.round(ship.x / cw);
    const row0 = Math.round((ship.y + Math.sin(ship.bob * 2) * 3) / ch);
    for (const r of ship.sprite.exhaust) {
      const line = ship.rows[r];
      const col = ship.left ? col0 + line.trimEnd().length : col0 + (line.length - line.trimStart().length) - 1;
      const row = row0 + r;
      if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
      this.heat[row * cols + col] = Math.min(1.4, this.heat[row * cols + col] + 0.28);
    }
  }

  /** Exhaust spreads into neighbouring cells and cools, like the sharks' wake. */
  private diffuse(dt: number) {
    const { cols, rows, heat, heatTmp } = this;
    const decay = Math.pow(0.22, dt);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const h = heat[i];
        const l = c > 0 ? heat[i - 1] : 0;
        const rt = c < cols - 1 ? heat[i + 1] : 0;
        const u = r > 0 ? heat[i - cols] : 0;
        const d = r < rows - 1 ? heat[i + cols] : 0;
        heatTmp[i] = (h * 0.84 + (l + rt) * 0.065 + (u + d) * 0.015) * decay;
      }
    }
    this.heat = heatTmp;
    this.heatTmp = heat;
  }

  private lastStats = "";
  private emitStats() {
    const key = `${this.ships.length}:${this.warps}`;
    if (key === this.lastStats) return;
    this.lastStats = key;
    this.onStats?.({ ships: this.ships.length, warps: this.warps });
  }

  // ----------------------------------------------------------------- rendering

  private render() {
    const { ctx, dpr, cw, ch, cols, rows, palette } = this;
    if (!cols) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `600 ${Math.round(ch * 0.72)}px ${this.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // Stars: glyph by depth, twinkle by phase, streaks while warping.
    ctx.fillStyle = palette.fg;
    const warpK = this.warp / WARP_TIME;
    for (const s of this.stars) {
      const col = Math.floor(s.x / cw);
      const row = Math.floor(s.y / ch);
      if (col < 0 || row < 0 || col >= cols || row >= rows) continue;
      let a = 0.18 + s.z * 0.7;
      a *= 0.7 + 0.3 * Math.sin(this.time * (1 + s.z * 2) + s.phase);
      if (this.pointer.active) {
        const d = Math.hypot(this.pointer.x - s.x, this.pointer.y - s.y);
        if (d < 140) a = Math.min(1, a + (1 - d / 140) * 0.6);
      }
      const x = col * cw + cw / 2;
      const y = row * ch + ch / 2;
      if (warpK > 0.08 && s.z > 0.15) {
        const len = Math.max(1, Math.round(s.z * warpK * 9));
        for (let k = 0; k < len && col + k < cols; k++) {
          ctx.globalAlpha = a * (1 - k / len);
          ctx.fillText(k === 0 ? "=" : "-", x + k * cw, y);
        }
      } else {
        ctx.globalAlpha = a;
        ctx.fillText(STAR_GLYPHS[Math.min(3, Math.floor(s.z * 4))], x, y);
      }
    }

    // Exhaust heat.
    ctx.fillStyle = `rgb(${palette.heat})`;
    const { heat } = this;
    for (let i = 0; i < heat.length; i++) {
      const h = heat[i];
      if (h < 0.04) continue;
      const g = HEAT_RAMP[Math.min(HEAT_RAMP.length - 1, Math.floor(h * HEAT_RAMP.length))];
      ctx.globalAlpha = Math.min(1, 0.15 + h * 0.8);
      ctx.fillText(g, (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2);
    }

    // Warp shockwaves: a ring of glyphs that thins as it grows.
    for (const w of this.waves) {
      const radius = w.t * 520;
      const fade = 1 - w.t / 1.6;
      const r0 = Math.floor((w.y - radius - ch) / ch);
      const r1 = Math.ceil((w.y + radius + ch) / ch);
      for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
        const y = r * ch + ch / 2;
        const dy = y - w.y;
        if (Math.abs(dy) > radius + ch) continue;
        const span = Math.sqrt(Math.max(0, radius * radius - dy * dy));
        for (const side of [-1, 1]) {
          const c = Math.floor((w.x + side * span) / cw);
          if (c < 0 || c >= cols) continue;
          ctx.globalAlpha = fade;
          ctx.fillStyle = palette.accent;
          ctx.fillText(fade > 0.6 ? "@" : fade > 0.3 ? "o" : ".", c * cw + cw / 2, y);
        }
      }
    }

    // Ships, snapped to the grid. Hull glyphs are sized to nearly fill a cell
    // so the art reads as connected lines rather than scattered characters.
    ctx.font = `600 ${Math.min(ch * 0.95, cw / 0.6).toFixed(1)}px ${this.font}`;
    for (const ship of this.ships) {
      const col0 = Math.round(ship.x / cw);
      const row0 = Math.round((ship.y + Math.sin(ship.bob * 2) * 3) / ch);
      ship.rows.forEach((line, r) => {
        const row = row0 + r;
        if (row < 0 || row >= rows) return;
        for (let k = 0; k < line.length; k++) {
          const c = line[k];
          const col = col0 + k;
          if (c === " " || col < 0 || col >= cols) continue;
          const lit = c === "o" || c === "^";
          ctx.fillStyle = lit ? palette.accent : palette.fg;
          ctx.globalAlpha = lit ? 0.75 + 0.25 * Math.sin(this.time * 6 + k) : 0.9;
          // Clear the grid line behind hull glyphs so ships read as solid.
          ctx.save();
          ctx.globalAlpha = 1;
          ctx.fillStyle = palette.bg;
          ctx.fillRect(col * cw + 1, row * ch + 1, cw - 1, ch - 1);
          ctx.restore();
          ctx.fillText(c, col * cw + cw / 2, row * ch + ch / 2);
        }
      });
    }
    ctx.globalAlpha = 1;
  }

  // --------------------------------------------------------------------- input

  private toLocal(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
  }

  private onPointerMove = (e: PointerEvent) => {
    const { x, y, inside } = this.toLocal(e);
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = inside && e.pointerType !== "touch";
  };

  private onPointerDown = (e: PointerEvent) => {
    const { x, y, inside } = this.toLocal(e);
    if (!inside || this.reducedMotion.matches) return;
    // Clicks on links and buttons over the canvas shouldn't warp.
    if ((e.target as HTMLElement | null)?.closest("a, button, [data-no-warp]")) return;
    this.waves.push({ x, y, t: 0 });
    this.warp = WARP_TIME;
    this.warps++;
    if (this.ships.length < this.maxShips() + 2) this.spawnShip(x, y - this.ch);
  };

  private onPointerLeave = () => {
    this.pointer.active = false;
  };

  private onMotionPreference = () => {
    if (this.reducedMotion.matches) {
      cancelAnimationFrame(this.raf);
      this.drawStill();
    } else {
      this.schedule();
    }
  };
}
