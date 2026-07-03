/* Dev tool: prints reachability details for one level to help fix unsolvable maps.
 * Run with: node tools/debug.js <levelNumber>
 */
const ENGINE = require('../engine.js');
const LEVELS = require('../levels.js');

const idx = parseInt(process.argv[2], 10) - 1;
const lvl = LEVELS[idx];
const level = ENGINE.parse(lvl.map);

const seen = new Set();
const stops = new Set();
let bestFish = 0;
let goalReached = false;

const encode = (s) => `${s.x},${s.y},${[...s.collected].sort()},${[...s.broken].sort()}`;
let frontier = [ENGINE.initialState(level)];
seen.add(encode(frontier[0]));
stops.add(ENGINE.key(frontier[0].x, frontier[0].y));

while (frontier.length) {
  const next = [];
  for (const state of frontier) {
    for (const [dx, dy] of Object.values(ENGINE.DIRS)) {
      const res = ENGINE.slide(level, state, dx, dy);
      if (res.outcome === 'blocked' || res.outcome === 'fell') continue;
      const ns = ENGINE.apply(state, res);
      if (res.outcome === 'goal' || res.outcome === 'win') goalReached = true;
      bestFish = Math.max(bestFish, ns.collected.size);
      const code = encode(ns);
      if (seen.has(code)) continue;
      seen.add(code);
      stops.add(ENGINE.key(ns.x, ns.y));
      next.push(ns);
    }
  }
  frontier = next;
}

console.log(`${lvl.name}: fish ${bestFish}/${level.fish.size} collectable, igloo reachable: ${goalReached}`);
console.log('Map with reachable stop cells marked *:');
lvl.map.forEach((row, y) => {
  let out = '';
  for (let x = 0; x < level.width; x++) {
    const c = row[x] || '.';
    out += stops.has(ENGINE.key(x, y)) && c === '.' ? '*' : c;
  }
  console.log('  ' + out);
});
