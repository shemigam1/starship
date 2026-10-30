/**
 * "Give the logos a nudge": DOM badges with circle physics. Gravity pulls them
 * to the floor, the cursor shoves them, and they can be grabbed and thrown.
 */

interface Body {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  spin: number;
}

const GRAVITY = 2200;
const BOUNCE = 0.45;
const FRICTION = 0.985;

export function mountNudge(stage: HTMLElement) {
  const els = [...stage.querySelectorAll<HTMLElement>("[data-badge]")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = stage.clientWidth;
  let H = stage.clientHeight;
  const bodies: Body[] = els.map((el, i) => {
    const r = el.offsetWidth / 2;
    return {
      el,
      r,
      // Start in a loose row along the floor so the resting state looks deliberate.
      x: r + 8 + ((W - 2 * r - 16) * (i + 0.5)) / els.length,
      y: reduced ? H - r : -r * 2 - Math.random() * H,
      vx: 0,
      vy: 0,
      angle: (Math.random() - 0.5) * 30,
      spin: 0,
    };
  });

  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
  let grabbed: Body | null = null;
  let raf = 0;
  let last = performance.now();
  let running = false;

  const draw = () => {
    for (const b of bodies) {
      b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) rotate(${b.angle}deg)`;
    }
  };

  const step = (dt: number) => {
    for (const b of bodies) {
      if (b === grabbed) {
        b.vx = pointer.vx;
        b.vy = pointer.vy;
        b.x = pointer.x;
        b.y = pointer.y;
        continue;
      }
      b.vy += GRAVITY * dt;
      // Cursor shove: a soft repulsive disc that also passes on its velocity.
      const dx = b.x - pointer.x;
      const dy = b.y - pointer.y;
      const d = Math.hypot(dx, dy);
      const reach = b.r + 22;
      if (d < reach && d > 0.01) {
        const push = (reach - d) / reach;
        b.vx += (dx / d) * push * 900 + pointer.vx * push * 0.6;
        b.vy += (dy / d) * push * 900 + pointer.vy * push * 0.6;
      }
      b.vx *= FRICTION;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.spin = b.vx * 0.25;
      b.angle += b.spin * dt * 10;
    }

    // Pairwise circle collisions.
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + b.r;
        if (dist >= min || dist === 0) continue;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (min - dist) / 2;
        if (a !== grabbed) {
          a.x -= nx * overlap;
          a.y -= ny * overlap;
        }
        if (b !== grabbed) {
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
        const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rel < 0) {
          const imp = (-(1 + BOUNCE) * rel) / 2;
          a.vx -= imp * nx;
          a.vy -= imp * ny;
          b.vx += imp * nx;
          b.vy += imp * ny;
        }
      }
    }

    for (const b of bodies) {
      if (b.x < b.r) {
        b.x = b.r;
        b.vx = Math.abs(b.vx) * BOUNCE;
      } else if (b.x > W - b.r) {
        b.x = W - b.r;
        b.vx = -Math.abs(b.vx) * BOUNCE;
      }
      if (b.y > H - b.r) {
        b.y = H - b.r;
        b.vy = -Math.abs(b.vy) * BOUNCE;
        if (Math.abs(b.vy) < 40) b.vy = 0;
        b.vx *= 0.96;
      }
    }
  };

  const tick = (now: number) => {
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    pointer.vx *= 0.8;
    pointer.vy *= 0.8;
    step(dt);
    draw();
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const local = (e: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  stage.addEventListener("pointermove", (e) => {
    const p = local(e);
    const now = performance.now();
    const dt = Math.max(0.008, (now - pointer.t) / 1000);
    if (pointer.t) {
      pointer.vx = (p.x - pointer.x) / dt;
      pointer.vy = (p.y - pointer.y) / dt;
    }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.t = now;
  });
  stage.addEventListener("pointerleave", () => {
    pointer.x = pointer.y = -1e4;
    pointer.t = 0;
    grabbed = null;
  });
  stage.addEventListener("pointerdown", (e) => {
    const p = local(e);
    grabbed = bodies.find((b) => Math.hypot(b.x - p.x, b.y - p.y) < b.r) ?? null;
    if (grabbed) stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointerup", () => (grabbed = null));

  new ResizeObserver(() => {
    W = stage.clientWidth;
    H = stage.clientHeight;
  }).observe(stage);

  if (reduced) {
    draw();
    return;
  }
  // Only simulate while the footer is on screen; badges drop in on first view.
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(stage);
  draw();
}
