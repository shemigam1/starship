/**
 * Ships are drawn facing right. `exhaust` lists the rows whose tail emits
 * engine heat; an empty list means the ship drifts without a trail.
 */
export interface Sprite {
  rows: string[];
  exhaust: number[];
  /** Pixels per second, before the per-ship random factor. */
  speed: number;
}

export const SPRITES: Sprite[] = [
  {
    rows: ["  \\\\", "==[o]>", "  //"],
    exhaust: [1],
    speed: 120,
  },
  {
    rows: ["   ____", " _/[oo]\\____", "=____________>", "   \\____/"],
    exhaust: [2],
    speed: 55,
  },
  {
    rows: ["   _.-^-._", "  (_o_o_o_)", "     / \\"],
    exhaust: [],
    speed: 32,
  },
  {
    rows: ["   __", "=[_  \\____", "=[________)>"],
    exhaust: [1, 2],
    speed: 80,
  },
];

const MIRROR: Record<string, string> = {
  "/": "\\",
  "\\": "/",
  "<": ">",
  ">": "<",
  "[": "]",
  "]": "[",
  "(": ")",
  ")": "(",
  "{": "}",
  "}": "{",
};

/** Pads rows to equal width, optionally mirrored to face left. */
export function shape(sprite: Sprite, facingLeft: boolean): string[] {
  const w = Math.max(...sprite.rows.map((r) => r.length));
  return sprite.rows.map((r) => {
    const padded = r.padEnd(w, " ");
    if (!facingLeft) return padded;
    return [...padded]
      .reverse()
      .map((c) => MIRROR[c] ?? c)
      .join("");
  });
}
