/* Pengi's Ice Slide — UI, input, animation, audio, save data.
 * Game rules live in engine.js; level data in levels.js.
 */
(() => {
  'use strict';
  const $ = (sel) => document.querySelector(sel);

  /* ---------- SVG art ---------- */
  const PENGI_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="pengi-inner">
  <path d="M60 12 C90 12 102 40 102 72 C102 100 84 112 60 112 C36 112 18 100 18 72 C18 40 30 12 60 12 Z" fill="#ccd6de"/>
  <ellipse cx="47" cy="112" rx="9" ry="4.5" fill="#f2b56b"/>
  <ellipse cx="73" cy="112" rx="9" ry="4.5" fill="#f2b56b"/>
  <ellipse cx="16" cy="76" rx="7" ry="12" fill="#b3bfc9" transform="rotate(20 16 76)"/>
  <ellipse cx="104" cy="76" rx="7" ry="12" fill="#b3bfc9" transform="rotate(-20 104 76)"/>
  <ellipse cx="60" cy="88" rx="26" ry="19" fill="#ffffff"/>
  <path d="M60 12 C90 12 102 40 101 64 Q80 56 60 56 Q40 56 19 64 C18 40 30 12 60 12 Z" fill="#23262e"/>
  <ellipse cx="60" cy="42" rx="23" ry="15.5" fill="#ffffff"/>
  <circle cx="50" cy="41" r="6.2" fill="#1d3557"/>
  <circle cx="70" cy="41" r="6.2" fill="#1d3557"/>
  <circle cx="52.3" cy="38.7" r="2.3" fill="#fff"/>
  <circle cx="72.3" cy="38.7" r="2.3" fill="#fff"/>
  <circle cx="48" cy="43.6" r="1.1" fill="#fff" opacity="0.9"/>
  <circle cx="68" cy="43.6" r="1.1" fill="#fff" opacity="0.9"/>
  <ellipse cx="43" cy="48" rx="4.4" ry="2.7" fill="#ffb3c1" opacity="0.85"/>
  <ellipse cx="77" cy="48" rx="4.4" ry="2.7" fill="#ffb3c1" opacity="0.85"/>
  <path d="M56.5 47.5 L63.5 47.5 L60 53 Z" fill="#f5a25c"/>
  <path d="M32 58 Q60 72 88 58 L88 68 Q60 82 32 68 Z" fill="#f6a01f"/>
  <path d="M84 64 q8 2 6 10 q-7 0 -9 -7 Z" fill="#e8920e"/>
  <g transform="rotate(-12 42 10)">
    <path d="M32 18 L34 7 L39.5 13.5 L44 5 L48.5 13.5 L54 7 L56 18 Z"
      fill="#f4c542" stroke="#c9992a" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="34" cy="6" r="2" fill="#f4c542" stroke="#c9992a"/>
    <circle cx="44" cy="4" r="2" fill="#f4c542" stroke="#c9992a"/>
    <circle cx="54" cy="6" r="2" fill="#f4c542" stroke="#c9992a"/>
  </g>
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

  $('#home-pengi').innerHTML = PENGI_SVG;
  $('#win-pengi').innerHTML = PENGI_SVG;
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
    pengi.innerHTML = PENGI_SVG;
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
