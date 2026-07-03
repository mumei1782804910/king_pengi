/* Dev tool: BFS-solves every level and prints the optimal move count (par).
 * Run with: node tools/solve.js
 * Flags all unsolvable levels so bad level data never ships.
 */
const ENGINE = require('../engine.js');
const LEVELS = require('../levels.js');

function solve(level) {
  const fishIds = [...level.fish];
  const crackedIds = [...level.cracked];
  const fishIndex = new Map(fishIds.map((k, i) => [k, i]));
  const crackedIndex = new Map(crackedIds.map((k, i) => [k, i]));

  const encode = (s) => {
    let fishMask = 0;
    s.collected.forEach((k) => (fishMask |= 1 << fishIndex.get(k)));
    let brokenMask = 0;
    s.broken.forEach((k) => (brokenMask |= 1 << crackedIndex.get(k)));
    return `${s.x},${s.y},${fishMask},${brokenMask}`;
  };

  const start = ENGINE.initialState(level);
  const seen = new Set([encode(start)]);
  let frontier = [{ state: start, path: [] }];
  let depth = 0;

  while (frontier.length && depth < 60) {
    depth++;
    const next = [];
    for (const { state, path } of frontier) {
      for (const [dir, [dx, dy]] of Object.entries(ENGINE.DIRS)) {
        const res = ENGINE.slide(level, state, dx, dy);
        if (res.outcome === 'blocked' || res.outcome === 'fell') continue;
        if (res.outcome === 'win') return { par: depth, moves: [...path, dir] };
        const ns = ENGINE.apply(state, res);
        const code = encode(ns);
        if (seen.has(code)) continue;
        seen.add(code);
        next.push({ state: ns, path: [...path, dir] });
      }
    }
    frontier = next;
  }
  return null;
}

let failed = 0;
LEVELS.forEach((lvl, i) => {
  const level = ENGINE.parse(lvl.map);
  if (!level.start || !level.goal) {
    console.log(`${String(i + 1).padStart(2)}. ${lvl.name}: MISSING P or G`);
    failed++;
    return;
  }
  const result = solve(level);
  if (!result) {
    console.log(`${String(i + 1).padStart(2)}. ${lvl.name}: UNSOLVABLE`);
    failed++;
  } else {
    const parNote = lvl.par === result.par ? 'ok' : `data says ${lvl.par} -> UPDATE to ${result.par}`;
    console.log(
      `${String(i + 1).padStart(2)}. ${lvl.name}: par ${result.par} (${parNote})  [${result.moves.join(' ')}]`
    );
  }
});
process.exit(failed ? 1 : 0);
