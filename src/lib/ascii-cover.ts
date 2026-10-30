/**
 * Build-time ASCII "planet" covers for project cards without images.
 * Each project name seeds a different planet size, position, light and ring.
 */

const RAMP = " .:-=+*#%@";
export const COVER_COLS = 72;
export const COVER_ROWS = 30;

function seeded(str: string) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function asciiCover(seed: string): string {
  const rnd = seeded(seed);
  const cx = COVER_COLS * (0.35 + rnd() * 0.3);
  const cy = COVER_ROWS * (0.4 + rnd() * 0.2);
  const radius = COVER_ROWS * (0.26 + rnd() * 0.12);
  // Light from the upper left, towards the viewer (screen y points down).
  const lx = -0.55 - rnd() * 0.3;
  const ly = -0.45 - rnd() * 0.3;
  const lz = 0.6;
  const ll = Math.hypot(lx, ly, lz);
  const tilt = -0.35 + rnd() * 0.7;
  const ringR = radius * (1.6 + rnd() * 0.4);
  const hasRing = rnd() > 0.25;
  const bands = 2 + Math.floor(rnd() * 4);
  // Characters are ~2× taller than wide, so stretch x to keep the planet round.
  const aspect = 2.1;

  const out: string[] = [];
  for (let r = 0; r < COVER_ROWS; r++) {
    let line = "";
    for (let c = 0; c < COVER_COLS; c++) {
      const dx = (c - cx) / aspect;
      const dy = r - cy;
      const d = Math.hypot(dx, dy);
      let ch = " ";

      // Ring, drawn as a tilted ellipse; hidden where it passes behind the planet.
      const rx = dx * Math.cos(tilt) + dy * Math.sin(tilt);
      const ry = (-dx * Math.sin(tilt) + dy * Math.cos(tilt)) * 3.2;
      const rd = Math.hypot(rx, ry);
      const onRing = hasRing && Math.abs(rd - ringR) < 0.9;
      const behind = ry < 0;

      if (d < radius) {
        const nx = dx / radius;
        const ny = dy / radius;
        const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
        let shade = Math.max(0, (nx * lx + ny * ly + nz * lz) / ll);
        shade *= 0.85 + 0.15 * Math.sin((ny * bands + nx * 0.4) * Math.PI);
        ch = RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(Math.pow(shade, 0.8) * (RAMP.length - 1)))];
        if (onRing && !behind) ch = "=";
      } else if (onRing) {
        ch = rd > ringR ? "-" : "=";
      } else if (rnd() < 0.018) {
        ch = rnd() < 0.2 ? "*" : rnd() < 0.5 ? "+" : ".";
      }
      line += ch;
    }
    out.push(line);
  }
  return out.join("\n");
}
