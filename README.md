# Pengi's Ice Slide 🐧👑

A mobile-friendly ice-sliding logic puzzle. Swipe to slide Pengi across the ice —
he only stops when he hits something. Collect every fish, then get home to the igloo.

- **20 handcrafted levels**, each verified solvable by a BFS solver, with difficulty
  rising from 1 to 12 optimal moves.
- **Mechanics:** ice blocks, holes (icy bath!), cracked ice that breaks behind you,
  and the igloo itself as a stopper you can use tactically.
- **1–3 stars** per level based on the true optimal move count, undo/restart,
  progress saved in the browser.
- Pure HTML/CSS/JavaScript, zero dependencies, zero build step. All art is inline SVG.

## Play locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 5317
# then visit http://localhost:5317
```

Swipe on mobile; arrow keys on desktop.

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `pengi-game`).
2. Push this folder to it:
   ```sh
   git init
   git add .
   git commit -m "Pengi's Ice Slide"
   git remote add origin https://github.com/<you>/pengi-game.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. Your game is live at `https://<you>.github.io/pengi-game/` — open it on your phone
   and add it to your home screen.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html` | Screens and markup |
| `style.css` | All styling and animations |
| `game.js` | UI, input, animation, audio, save data |
| `engine.js` | Pure game rules (shared with the solver) |
| `levels.js` | Level maps and verified par values |
| `tools/solve.js` | Dev tool: BFS-solves every level, prints optimal moves |
| `tools/debug.js` | Dev tool: reachability report for designing levels |

After editing or adding levels, run `node tools/solve.js` — it fails loudly if any
level is unsolvable or a `par` value is out of date.

Pengi the character is a cartoon drawn from scratch in SVG, inspired by a very
round plush emperor penguin chick with a tiny gold crown.
