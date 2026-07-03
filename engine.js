/* Pengi's Ice Slide — pure game logic (no DOM).
 * Shared by the browser game and the Node level solver (tools/solve.js).
 *
 * Map legend:
 *   .  ice          #  ice block (stops Pengi)
 *   P  start        G  igloo (stops Pengi; win if all fish collected)
 *   F  fish         C  cracked ice (becomes a hole once Pengi leaves it)
 *   O  hole (sliding in = splash, move is undone)
 * Grid edges act as blocks.
 */
const ENGINE = (() => {
  const key = (x, y) => x + ',' + y;

  function parse(rows) {
    const height = rows.length;
    const width = Math.max(...rows.map((r) => r.length));
    const level = {
      width,
      height,
      walls: new Set(),
      fish: new Set(),
      cracked: new Set(),
      holes: new Set(),
      start: null,
      goal: null,
    };
    rows.forEach((row, y) => {
      for (let x = 0; x < width; x++) {
        const c = row[x] || '.';
        if (c === '#') level.walls.add(key(x, y));
        else if (c === 'F') level.fish.add(key(x, y));
        else if (c === 'C') level.cracked.add(key(x, y));
        else if (c === 'O') level.holes.add(key(x, y));
        else if (c === 'P') level.start = { x, y };
        else if (c === 'G') level.goal = { x, y };
      }
    });
    return level;
  }

  function initialState(level) {
    return {
      x: level.start.x,
      y: level.start.y,
      collected: new Set(),
      broken: new Set(),
    };
  }

  /* Slide from the current state in direction (dx, dy).
   * Returns { path, collected, breaks, outcome, stopped } without mutating state.
   * outcome: 'blocked' | 'move' | 'fell' | 'goal' (igloo, fish missing) | 'win'
   */
  function slide(level, state, dx, dy) {
    let { x, y } = state;
    const path = [];
    const collected = [];
    const breaks = [];
    const isWall = (nx, ny) =>
      nx < 0 || ny < 0 || nx >= level.width || ny >= level.height || level.walls.has(key(nx, ny));
    const isHole = (nx, ny) => level.holes.has(key(nx, ny)) || state.broken.has(key(nx, ny));
    let outcome = 'blocked';

    for (;;) {
      const nx = x + dx;
      const ny = y + dy;
      if (isWall(nx, ny)) {
        if (path.length) outcome = 'move';
        break;
      }
      // Leaving (x, y): cracked ice gives way behind Pengi.
      const here = key(x, y);
      if (level.cracked.has(here) && !state.broken.has(here) && !breaks.includes(here)) {
        breaks.push(here);
      }
      x = nx;
      y = ny;
      path.push({ x, y });
      if (isHole(nx, ny)) {
        outcome = 'fell';
        break;
      }
      const k = key(nx, ny);
      if (level.fish.has(k) && !state.collected.has(k) && !collected.includes(k)) {
        collected.push(k);
      }
      if (level.goal && level.goal.x === nx && level.goal.y === ny) {
        const have = state.collected.size + collected.length;
        outcome = have === level.fish.size ? 'win' : 'goal';
        break;
      }
    }
    return { path, collected, breaks, outcome, stopped: { x, y } };
  }

  function apply(state, result) {
    const collected = new Set(state.collected);
    result.collected.forEach((k) => collected.add(k));
    const broken = new Set(state.broken);
    result.breaks.forEach((k) => broken.add(k));
    return { x: result.stopped.x, y: result.stopped.y, collected, broken };
  }

  const DIRS = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0],
  };

  return { parse, initialState, slide, apply, DIRS, key };
})();

if (typeof module !== 'undefined') module.exports = ENGINE;
