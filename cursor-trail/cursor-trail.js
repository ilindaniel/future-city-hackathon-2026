/**
 * Pixel cursor trail.
 *
 * The pointer position is snapped to a square grid. Every grid cell the pointer
 * crosses gets a square that shrinks and fades out. A left click throws a short
 * burst of squares of mixed sizes around the click point.
 *
 * While the trail runs, the system cursor is hidden. The newest trail square
 * stays lit under a resting pointer, so the pointer is never lost.
 *
 * Everything is drawn on one fixed, full-viewport canvas that ignores pointer
 * events, so the page underneath keeps working. The animation loop runs only
 * while squares are alive.
 *
 * Usage:
 *   import { initCursorTrail } from "./cursor-trail.js";
 *   const stop = initCursorTrail();   // returns a cleanup function
 *
 * Colour and blend mode come from CSS (see cursor-trail.css).
 */

const DEFAULTS = {
  cell: 8, // grid size of the trail, in CSS pixels
  life: 450, // how long one square lives, in ms
  maxTrail: 40, // trail squares kept at once; older ones are dropped
  maxTotal: 400, // hard cap on all squares, trail and bursts together
  minSize: 2, // a square never shrinks below this before it disappears
  burstCount: 14, // squares per click
  burstRadius: 40, // how far burst squares land from the click, in CSS pixels
  burstSizes: [4, 8, 8, 12, 16, 24], // burst square sizes, picked at random
  fallbackColor: "#ffffff", // used when --cursor-trail-color is not set
  hideCursor: true, // hide the system cursor while the trail runs
  keepHead: true, // the newest trail square stays lit while the pointer rests
  grain: 0.4, // 0 to 1: how much of each square the grain eats away (frosted look)
  grainCell: 2, // size of one grain speck, in CSS pixels
  ignoreClicksOn: null, // CSS selector; clicks inside it make no burst
};

/**
 * Builds a small tile of random specks. Stamped over the squares in "erase"
 * mode, it punches tiny holes of varying depth into them, which reads as
 * frosted, grainy glass. The tile is made once, so the grain stays still
 * while the squares move across it.
 */
function createGrainPattern(ctx, speck) {
  const cells = 48;
  const tile = document.createElement("canvas");
  tile.width = tile.height = cells * speck;
  const tileCtx = tile.getContext("2d");
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      tileCtx.fillStyle = `rgba(0, 0, 0, ${Math.random().toFixed(2)})`;
      tileCtx.fillRect(x * speck, y * speck, speck, speck);
    }
  }
  return ctx.createPattern(tile, "repeat");
}

/**
 * Starts the trail. Does nothing and returns a no-op on touch-only devices and
 * when the user asked for reduced motion.
 *
 * @param {Partial<typeof DEFAULTS>} [options]
 * @returns {() => void} cleanup function that removes the canvas and listeners
 */
export function initCursorTrail(options = {}) {
  const config = { ...DEFAULTS, ...options };

  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hasMouse || reducedMotion) return () => {};

  const canvas = document.createElement("canvas");
  canvas.className = "cursor-trail";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const grainPattern = config.grain > 0 ? createGrainPattern(ctx, config.grainCell) : null;

  /** @type {Array<object>} squares currently alive, oldest first */
  let squares = [];
  let lastCell = null; // grid cell of the previous pointer event
  let frame = null; // requestAnimationFrame id, null while asleep
  let pixelRatio = 1;
  let color = config.fallbackColor;
  let head = null; // newest trail square: the one under the pointer
  let inside = false; // whether the pointer is over the page

  // The class switches the system cursor off (see cursor-trail.css).
  if (config.hideCursor) document.documentElement.classList.add("has-cursor-trail");

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    const fromCss = getComputedStyle(canvas).getPropertyValue("--cursor-trail-color").trim();
    color = fromCss || config.fallbackColor;
    wake(); // the canvas was cleared by the size change; redraw what is alive
  }

  function wake() {
    if (frame === null) frame = requestAnimationFrame(draw);
  }

  function isMouse(event) {
    return !event.pointerType || event.pointerType === "mouse";
  }

  function onMove(event) {
    if (!isMouse(event)) return;

    inside = true;
    const now = performance.now();
    const cellX = Math.floor(event.clientX / config.cell);
    const cellY = Math.floor(event.clientY / config.cell);
    const from = lastCell || { x: cellX, y: cellY };

    // A fast pointer skips cells between two events. Walk the straight line
    // between the previous and the current cell so the trail has no gaps.
    const steps = Math.max(Math.abs(cellX - from.x), Math.abs(cellY - from.y), 1);
    for (let step = 1; step <= steps; step++) {
      const x = Math.round(from.x + ((cellX - from.x) * step) / steps);
      const y = Math.round(from.y + ((cellY - from.y) * step) / steps);
      const newest = squares[squares.length - 1];
      if (newest && !newest.burst && newest.x === x && newest.y === y) {
        newest.born = now; // still on the same cell: keep it fresh
      } else {
        squares.push({ x, y, born: now, size: config.cell, burst: false });
      }
    }
    head = squares[squares.length - 1];

    const trail = squares.filter((square) => !square.burst);
    if (trail.length > config.maxTrail) {
      const tooOld = new Set(trail.slice(0, trail.length - config.maxTrail));
      squares = squares.filter((square) => !tooOld.has(square));
    }
    if (squares.length > config.maxTotal) {
      squares.splice(0, squares.length - config.maxTotal);
    }

    lastCell = { x: cellX, y: cellY };
    wake();
  }

  function onDown(event) {
    if (event.button !== 0 || !isMouse(event)) return;
    if (config.ignoreClicksOn && event.target.closest?.(config.ignoreClicksOn)) return;
    burst(event.clientX, event.clientY);
  }

  function burst(originX, originY) {
    const now = performance.now();
    for (let i = 0; i < config.burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = (0.1 + Math.random() * 0.9) * config.burstRadius;
      const size = config.burstSizes[Math.floor(Math.random() * config.burstSizes.length)];
      squares.push({
        // Each burst square snaps to a grid of its own size.
        x: Math.floor((originX + Math.cos(angle) * distance) / size),
        y: Math.floor((originY + Math.sin(angle) * distance) / size),
        // Start part-way through its life so the squares do not vanish together.
        born: now - Math.random() * config.life * 0.6,
        size,
        burst: true,
      });
    }
    wake();
  }

  function draw(now) {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = color;

    // The head does not age while the pointer rests on it.
    const resting = config.keepHead && inside ? head : null;
    if (resting) resting.born = now;

    squares = squares.filter((square) => now - square.born < config.life);

    for (const square of squares) {
      const remaining = 1 - (now - square.born) / config.life; // 1 = new, 0 = gone
      const side = Math.max(config.minSize, Math.round(square.size * remaining));
      const inset = Math.floor((square.size - side) / 2); // keep it centred in its cell
      ctx.globalAlpha = Math.min(1, remaining);
      ctx.fillRect(square.x * square.size + inset, square.y * square.size + inset, side, side);
    }

    if (grainPattern && squares.length) {
      // Erase through the grain tile: only the squares just drawn are affected.
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = config.grain;
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "source-over";
    }

    // Keep animating while anything is still fading. A lone resting head does
    // not change, so the loop can sleep and leave it on the canvas.
    const fading = squares.some((square) => square !== resting);
    if (fading) {
      frame = requestAnimationFrame(draw);
    } else {
      frame = null;
      if (!squares.length) lastCell = null;
    }
  }

  function onLeave() {
    inside = false;
    wake(); // let the head fade out like the rest of the trail
  }

  resize();
  window.addEventListener("resize", resize);
  document.documentElement.addEventListener("mouseleave", onLeave);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });

  return function stop() {
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerdown", onDown);
    document.documentElement.removeEventListener("mouseleave", onLeave);
    document.documentElement.classList.remove("has-cursor-trail");
    if (frame !== null) cancelAnimationFrame(frame);
    canvas.remove();
  };
}
