/* Pengi's Ice Slide — UI, input, animation, audio, save data.
 * Game rules live in engine.js; level data in levels.js.
 */
(() => {
  'use strict';
  const $ = (sel) => document.querySelector(sel);

  /* ---------- SVG art ---------- */
  const pengiSvg = (uid) => `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="pengi-inner">
  <defs>
    <linearGradient id="pgHead-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5b6069"/><stop offset="1" stop-color="#3c414a"/>
    </linearGradient>
    <linearGradient id="pgBib-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f9ca4f"/><stop offset="1" stop-color="#eb9e1d"/>
    </linearGradient>
    <linearGradient id="pgBody-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d3d8dd"/><stop offset="1" stop-color="#c2c8cf"/>
    </linearGradient>
  </defs>
  <ellipse cx="19" cy="80" rx="8.5" ry="16" fill="#b0b7bf" stroke="#848b94" stroke-width="1.6" transform="rotate(16 19 80)"/>
  <ellipse cx="101" cy="80" rx="8.5" ry="16" fill="#b0b7bf" stroke="#848b94" stroke-width="1.6" transform="rotate(-16 101 80)"/>
  <path d="M39 107 Q36 116 43.5 116.5 L52 116.5 Q56.5 116 54.5 108.5 Q50 105.5 45.5 105.8 Q41 106 39 107 Z" fill="#3c4149"/>
  <path d="M44.5 116.3 L45.5 108.8 M49.5 116.3 L50 108.6" stroke="#23262c" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M81 107 Q84 116 76.5 116.5 L68 116.5 Q63.5 116 65.5 108.5 Q70 105.5 74.5 105.8 Q79 106 81 107 Z" fill="#3c4149"/>
  <path d="M75.5 116.3 L74.5 108.8 M70.5 116.3 L70 108.6" stroke="#23262c" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M60 26 C86 26 99 48 99 76 C99 101 82 113 60 113 C38 113 21 101 21 76 C21 48 34 26 60 26 Z" fill="url(#pgBody-${uid})" stroke="#7c848d" stroke-width="1.8"/>
  <ellipse cx="60" cy="85" rx="27" ry="24" fill="#fdfeff"/>
  <path d="M30 66 q3 10 10 15 M90 66 q-3 10 -10 15" stroke="#e4e8ec" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M41 61 Q60 73 79 61 Q83.5 70 76 76.5 L72 72.5 Q70 80.5 64.5 84.5 L62.5 79.5 Q61.5 87 60 90.5 Q58.5 87 57.5 79.5 L55.5 84.5 Q50 80.5 48 72.5 L44 76.5 Q36.5 70 41 61 Z" fill="url(#pgBib-${uid})" stroke="#d18e1d" stroke-width="1.4" stroke-linejoin="round"/>
  <path d="M60 10 C81 10 92 26 92 44 C92 54.5 86 60 79.5 62.5 Q69 66 60 69 Q51 66 40.5 62.5 C34 60 28 54.5 28 44 C28 26 39 10 60 10 Z" fill="url(#pgHead-${uid})" stroke="#2e323a" stroke-width="1.8"/>
  <ellipse cx="47" cy="44.5" rx="15.5" ry="14.5" fill="#fdfeff" transform="rotate(-6 47 44.5)"/>
  <ellipse cx="73" cy="44.5" rx="15.5" ry="14.5" fill="#fdfeff" transform="rotate(6 73 44.5)"/>
  <circle cx="47" cy="42.5" r="6.7" fill="#26334a"/>
  <circle cx="73" cy="42.5" r="6.7" fill="#26334a"/>
  <circle cx="47" cy="42.5" r="5.4" fill="#4278b8"/>
  <circle cx="73" cy="42.5" r="5.4" fill="#4278b8"/>
  <circle cx="47" cy="42.5" r="2.4" fill="#131c2a"/>
  <circle cx="73" cy="42.5" r="2.4" fill="#131c2a"/>
  <circle cx="45.1" cy="40.2" r="2" fill="#fff"/>
  <circle cx="71.1" cy="40.2" r="2" fill="#fff"/>
  <circle cx="49.2" cy="45.2" r="1" fill="#fff" opacity="0.9"/>
  <circle cx="75.2" cy="45.2" r="1" fill="#fff" opacity="0.9"/>
  <path d="M54.5 46 Q60 43.5 65.5 46 Q64.5 52 60 54.2 Q55.5 52 54.5 46 Z" fill="#d9993c" stroke="#a8752b" stroke-width="1.1" stroke-linejoin="round"/>
  <path d="M46.5 13 L45 5.5 L51.5 9.5 L53.5 3.5 L58.5 8.5 L60 2.5 L61.5 8.5 L66.5 3.5 L68.5 9.5 L75 5.5 L73.5 13 Q60 17 46.5 13 Z" fill="#eebc3f" stroke="#bd8e26" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="45" cy="5" r="1.8" fill="#eebc3f" stroke="#bd8e26"/>
  <circle cx="53.5" cy="3" r="1.8" fill="#eebc3f" stroke="#bd8e26"/>
  <circle cx="60" cy="2" r="1.8" fill="#eebc3f" stroke="#bd8e26"/>
  <circle cx="66.5" cy="3" r="1.8" fill="#eebc3f" stroke="#bd8e26"/>
  <circle cx="75" cy="5" r="1.8" fill="#eebc3f" stroke="#bd8e26"/>
  <path d="M48 14.5 Q60 17.8 72 14.5" stroke="#d9a832" stroke-width="1.2" fill="none"/>
  <path d="M33 9 L33.8 11.2 L36 12 L33.8 12.8 L33 15 L32.2 12.8 L30 12 L32.2 11.2 Z" fill="#f2c94c"/>
  <path d="M87 4 L88 6.7 L90.7 7.7 L88 8.7 L87 11.4 L86 8.7 L83.3 7.7 L86 6.7 Z" fill="#f2c94c"/>
  <path d="M84 17 L84.6 18.6 L86.2 19.2 L84.6 19.8 L84 21.4 L83.4 19.8 L81.8 19.2 L83.4 18.6 Z" fill="#f2c94c"/>
</svg>`;

  const FISH_SVG = `
<svg viewBox="0 0 48 30" xmlns="http://www.w3.org/2000/svg">
  <path d="M31 15 L44 5 L40 15 L44 25 Z" fill="#ff8c5a"/>
  <ellipse cx="19" cy="15" rx="14" ry="9.5" fill="#ff9e70"/>
  <path d="M8 15 a14 9.5 0 0 1 22 -6 q-8 -2 -14 2 t-8 4 Z" fill="#ffb98f"/>
  <circle cx="12" cy="13" r="2.2" fill="#33333f"/>
  <path d="M20 7 Q24 11 20 15" stroke="#e06b3a" fill="none" stroke-width="2" stroke-linecap="round"/>
</svg>`;

  const IGLOO_SVG = `
<svg viewBox="0 0 64 50" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 46 A28 27 0 0 1 60 46 Z" fill="#f4f9fc" stroke="#bcd6e6" stroke-width="2"/>
  <path d="M9 34 H55 M14 24 H50 M23 15 H41" stroke="#cfe2ee" stroke-width="2"/>
  <path d="M27 34 V46 M37 34 V46 M32 24 V34 M22 24 V34 M42 24 V34 M27 15 V24 M37 15 V24"
    stroke="#cfe2ee" stroke-width="2"/>
  <path d="M21 46 A11 12 0 0 1 43 46 Z" fill="#e2eef6" stroke="#bcd6e6" stroke-width="2"/>
  <path d="M25 46 A7 8 0 0 1 39 46 Z" fill="#31536e"/>
</svg>`;

  const CRACK_SVG = `
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 3 L17 12 L22 19 L15 26 L19 37 M22 19 L31 22 M17 12 L7 15 M15 26 L5 30 M31 22 L37 31"
    stroke="#5f8fae" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`;

  /* ---------- save data ---------- */
  const SAVE_KEY = 'pengi-save-v1';
  let save;
  try {
    save = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
  } catch {
    save = {};
  }
  save.stars = save.stars || {};
  save.muted = !!save.muted;
  const persist = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {}
  };

  /* ---------- audio (tiny synth, no assets) ---------- */
  let audioCtx = null;
  function tone(freq, dur, type = 'sine', vol = 0.15, delay = 0) {
    if (save.muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t = audioCtx.currentTime + delay;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }
  const sfx = {
    slide: () => tone(220, 0.12, 'triangle', 0.06),
    bump: () => tone(110, 0.15, 'square', 0.08),
    fish: () => {
      tone(660, 0.1, 'sine', 0.12);
      tone(880, 0.14, 'sine', 0.12, 0.08);
    },
    crack: () => tone(160, 0.2, 'sawtooth', 0.05),
    splash: () => {
      tone(300, 0.3, 'sine', 0.1);
      tone(150, 0.4, 'sine', 0.1, 0.1);
    },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.12)),
  };

  /* ---------- screens ---------- */
  function show(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  }
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'screen-levels') buildLevelSelect();
      show(target);
    });
  });

  $('#home-pengi').innerHTML = pengiSvg('home');
  $('#win-pengi').innerHTML = pengiSvg('win');
  $('#btn-play').addEventListener('click', () => {
    buildLevelSelect();
    show('screen-levels');
  });

  /* ---------- level select ---------- */
  function starsEarned(i) {
    return save.stars[i] || 0;
  }
  function isUnlocked(i) {
    return i === 0 || starsEarned(i - 1) > 0;
  }
  function buildLevelSelect() {
    const grid = $('#level-grid');
    grid.innerHTML = '';
    let total = 0;
    LEVELS.forEach((lvl, i) => {
      const earned = starsEarned(i);
      total += earned;
      const card = document.createElement('button');
      card.className = 'level-card' + (isUnlocked(i) ? '' : ' locked');
      card.innerHTML = isUnlocked(i)
        ? `<span class="num">${i + 1}</span><span class="stars">${'★'.repeat(earned)}${'☆'.repeat(3 - earned)}</span>`
        : `<span class="num">🔒</span>`;
      if (isUnlocked(i)) card.addEventListener('click', () => startLevel(i));
      grid.appendChild(card);
    });
    $('#total-stars').textContent = `★${total}`;
  }

  /* ---------- game ---------- */
  const boardEl = $('#board');
  let cur = null; // { index, level, state, undoStack, moves, cell, busy }

  function startLevel(index) {
    const data = LEVELS[index];
    const level = ENGINE.parse(data.map);
    cur = {
      index,
      data,
      level,
      state: ENGINE.initialState(level),
      undoStack: [],
      moves: 0,
      busy: false,
      cells: {},
    };
    $('#game-level-name').textContent = `${index + 1}. ${data.name}`;
    $('#hint-bar').textContent = data.hint || '';
    buildBoard();
    updateHud();
    show('screen-game');
    layout();
    positionPengi(true);
  }

  function buildBoard() {
    const { level } = cur;
    boardEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.id = 'grid';
    grid.style.gridTemplateColumns = `repeat(${level.width}, var(--cell))`;
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const k = ENGINE.key(x, y);
        const cell = document.createElement('div');
        cell.className = 'cell' + ((x + y) % 2 ? ' alt' : '');
        if (level.walls.has(k)) cell.classList.add('block');
        else if (level.holes.has(k)) cell.classList.add('hole');
        else if (level.cracked.has(k)) {
          cell.classList.add('cracked');
          cell.innerHTML = CRACK_SVG;
        } else if (level.goal.x === x && level.goal.y === y) {
          cell.innerHTML = IGLOO_SVG;
        } else if (level.fish.has(k)) {
          cell.innerHTML = `<div class="fish-sprite">${FISH_SVG}</div>`;
        }
        cur.cells[k] = cell;
        grid.appendChild(cell);
      }
    }
    boardEl.appendChild(grid);
    const pengi = document.createElement('div');
    pengi.id = 'pengi';
    pengi.innerHTML = pengiSvg('board');
    boardEl.appendChild(pengi);
  }

  function layout() {
    if (!cur) return;
    const wrap = $('#board-wrap');
    const { level } = cur;
    const availW = wrap.clientWidth - 40;
    const availH = wrap.clientHeight - 40;
    const gap = 2;
    const cell = Math.max(
      24,
      Math.min(
        Math.floor((availW - gap * (level.width - 1)) / level.width),
        Math.floor((availH - gap * (level.height - 1)) / level.height),
        64
      )
    );
    cur.cell = cell;
    boardEl.style.setProperty('--cell', cell + 'px');
  }

  function pengiXY(x, y) {
    const gap = 2;
    return [8 + x * (cur.cell + gap), 8 + y * (cur.cell + gap)];
  }

  function positionPengi(instant, x, y) {
    const pengi = $('#pengi');
    if (!pengi) return;
    const [px, py] = pengiXY(x ?? cur.state.x, y ?? cur.state.y);
    if (instant) pengi.style.transition = 'none';
    pengi.style.transform = `translate(${px}px, ${py}px)`;
    if (instant) void pengi.offsetWidth; // flush so the next move animates
  }

  function updateHud() {
    $('#game-moves').textContent = `Moves ${cur.moves} · Par ${cur.data.par}`;
    $('#btn-undo').disabled = cur.undoStack.length === 0;
    $('#btn-sound').textContent = save.muted ? '🔇' : '🔊';
  }

  function syncEntities() {
    const { level, state, cells } = cur;
    level.fish.forEach((k) => {
      const sprite = cells[k].querySelector('.fish-sprite');
      if (sprite) sprite.classList.toggle('gone', state.collected.has(k));
    });
    level.cracked.forEach((k) => {
      cells[k].classList.toggle('broken', state.broken.has(k));
    });
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  function snapshot() {
    return {
      state: {
        x: cur.state.x,
        y: cur.state.y,
        collected: new Set(cur.state.collected),
        broken: new Set(cur.state.broken),
      },
      moves: cur.moves,
    };
  }

  function move(dir) {
    if (!cur || cur.busy) return;
    const [dx, dy] = ENGINE.DIRS[dir];
    const res = ENGINE.slide(cur.level, cur.state, dx, dy);
    const pengi = $('#pengi');

    if (res.outcome === 'blocked') {
      pengi.style.setProperty('--nudge-x', dx * 5 + 'px');
      pengi.style.setProperty('--nudge-y', dy * 5 + 'px');
      pengi.classList.remove('nudge');
      void pengi.offsetWidth;
      pengi.classList.add('nudge');
      sfx.bump();
      return;
    }

    cur.busy = true;
    const before = snapshot();
    const perCell = 80;
    const dur = Math.max(140, res.path.length * perCell);
    pengi.style.transition = `transform ${dur}ms cubic-bezier(0.25, 0.6, 0.3, 1)`;
    positionPengi(false, res.stopped.x, res.stopped.y);
    sfx.slide();

    // Fish pop as Pengi passes over them.
    res.collected.forEach((k) => {
      const idx = res.path.findIndex((p) => ENGINE.key(p.x, p.y) === k);
      setTimeout(() => {
        const sprite = cur.cells[k].querySelector('.fish-sprite');
        if (sprite) sprite.classList.add('gone');
        sfx.fish();
      }, ((idx + 0.6) / res.path.length) * dur);
    });
    // Cracked ice gives way behind him.
    res.breaks.forEach((k) => {
      const idx = res.path.findIndex((p) => ENGINE.key(p.x, p.y) === k);
      const when = idx === -1 ? perCell : ((idx + 1.4) / res.path.length) * dur;
      setTimeout(() => {
        cur.cells[k].classList.add('broken');
        sfx.crack();
      }, when);
    });

    setTimeout(() => {
      if (res.outcome === 'fell') {
        sfx.splash();
        pengi.classList.add('splash');
        toast('Brrr! Icy bath! 🥶');
        setTimeout(() => {
          pengi.classList.remove('splash');
          // Falls don't count as moves — put everything back.
          cur.state = before.state;
          cur.moves = before.moves;
          syncEntities();
          positionPengi(true);
          updateHud();
          cur.busy = false;
        }, 800);
        return;
      }

      cur.undoStack.push(before);
      cur.state = ENGINE.apply(cur.state, res);
      cur.moves++;
      syncEntities();
      updateHud();

      pengi.classList.remove('bump');
      void pengi.offsetWidth;
      pengi.classList.add('bump');
      if (res.outcome !== 'win') sfx.bump();

      if (res.outcome === 'goal') toast('Pengi needs all the fish first! 🐟');
      cur.busy = false;
      if (res.outcome === 'win') winLevel();
    }, dur + 30);
  }

  function winLevel() {
    cur.busy = true;
    sfx.win();
    const { moves } = cur;
    const par = cur.data.par;
    const stars = moves <= par ? 3 : moves <= par + 2 ? 2 : 1;
    save.stars[cur.index] = Math.max(save.stars[cur.index] || 0, stars);
    persist();

    $('#win-stars').innerHTML = [1, 2, 3]
      .map((n) => `<span class="${n <= stars ? 'lit' : 'dim'}">★</span>`)
      .join('');
    $('#win-detail').textContent =
      moves <= par
        ? `Perfect! ${moves} moves — right on par!`
        : `${moves} moves · par is ${par}`;
    $('#btn-win-next').style.display = cur.index + 1 < LEVELS.length ? '' : 'none';
    setTimeout(() => $('#win-overlay').classList.remove('hidden'), 550);
  }

  $('#btn-win-replay').addEventListener('click', () => {
    $('#win-overlay').classList.add('hidden');
    startLevel(cur.index);
  });
  $('#btn-win-levels').addEventListener('click', () => {
    $('#win-overlay').classList.add('hidden');
    buildLevelSelect();
    show('screen-levels');
  });
  $('#btn-win-next').addEventListener('click', () => {
    $('#win-overlay').classList.add('hidden');
    startLevel(cur.index + 1);
  });

  $('#btn-undo').addEventListener('click', () => {
    if (!cur || cur.busy || !cur.undoStack.length) return;
    const prev = cur.undoStack.pop();
    cur.state = prev.state;
    cur.moves = prev.moves;
    syncEntities();
    positionPengi(true);
    updateHud();
  });
  $('#btn-restart').addEventListener('click', () => {
    if (!cur || cur.busy) return;
    startLevel(cur.index);
  });
  $('#btn-sound').addEventListener('click', () => {
    save.muted = !save.muted;
    persist();
    updateHud();
  });

  /* ---------- input ---------- */
  const wrap = $('#board-wrap');
  let touchStart = null;
  wrap.addEventListener('pointerdown', (e) => {
    touchStart = { x: e.clientX, y: e.clientY };
  });
  wrap.addEventListener('pointerup', (e) => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  });
  wrap.addEventListener('pointercancel', () => (touchStart = null));

  document.addEventListener('keydown', (e) => {
    if (!$('#screen-game').classList.contains('active')) return;
    if (!$('#win-overlay').classList.contains('hidden')) return;
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key]) {
      e.preventDefault();
      move(map[e.key]);
    }
  });

  window.addEventListener('resize', () => {
    if (!cur || !$('#screen-game').classList.contains('active')) return;
    layout();
    positionPengi(true);
  });
})();
