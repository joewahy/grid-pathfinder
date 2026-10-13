# Grid Pathfinder

An interactive visualizer for pathfinding on a grid. Draw walls, weight tiles, pick BFS, DFS, or Dijkstra, and watch the search explore tile by tile before it traces the final path. Built with React and Vite.

![Demo of Grid Pathfinder: drawing walls, running BFS, and highlighting the found path](assets/demo.gif)

## Features

- **BFS, DFS, and Dijkstra** — pick Breadth-First Search, recursive Depth-First Search, or Dijkstra's algorithm from a dropdown
- **Resizable board** — set a size from 3 to 25 and click **New board** (default 8×8); the grid stays a fixed 480×480px, so tiles scale to fit
- **Draggable start/end** — drag either endpoint onto any open tile to move it, or onto the other endpoint to swap them; walls are not valid drop targets, and dragging is off while wall mode is on
- **Wall drawing** — toggle **Add walls**, then click tiles to mark obstacles the search can't cross
- **Weighted tiles** — toggle **Add weights**, then click tiles to cycle their cost (1 → 2 → 5 → 1); only Dijkstra takes the cost into account, so it can pick a longer-but-cheaper route over a shorter-but-costlier one. The button is only enabled when Dijkstra is selected
- **Animated search** — visited tiles and dead ends light up as the algorithm runs; clearing, resizing, restarting, or moving an endpoint stops a search that is still running
- **Path highlighting** — the found path is traced across the grid once the goal is reached
- **No-path detection** — if the goal is walled off, the status line shows "No path exists — the end is blocked off."
- **Two-stage Clear** — first click clears the search and path; the button becomes **Clear all**, and a second click removes walls and weights too
- **Algorithm note** — a one-line explainer of the selected algorithm sits between the grid and the controls

## Technologies used

- **[React](https://react.dev/) 19** — UI components and board/search state
- **[Vite](https://vite.dev/) 8** — dev server and production build, with `@vitejs/plugin-react`
- **JavaScript (ES modules)** — the app and algorithms, using generators to stream search steps for animation
- **Plain CSS** — grid layout, tile states, and theme variables, with no UI framework

## How it works

A React app built with Vite. `App.jsx` owns the board (walls, weights, and the start/end positions as flat arrays indexed by `row * size + column`), the search marks, and the current mode. The top-left tile is the start and the bottom-right is the goal; either can be dragged elsewhere. Clicking **Start** exits wall/weight mode and runs the selected algorithm from the start tile's current position.

Each algorithm is a pure generator that takes the board, yields `{ type, index }` steps (`visited` or `deadend`) and returns the final path as tile indices, or `null`. `App.jsx` drives the generator, applying a step and pausing 10ms before pulling the next one, so the search stays visible. Starting a new search, clearing, resizing, or moving an endpoint cancels a search that is still animating.

- **BFS** (`src/algorithms/bfs.js`) explores level by level with a queue, recording each tile's predecessor so it can reconstruct the shortest path when it dequeues the goal.
- **DFS** (`src/algorithms/dfs.js`) recurses in down/right/up/left order, yielding `visited` (and `deadend` on backtrack) so it never revisits a tile, and returns the first path it finds.
- **Dijkstra** (`src/algorithms/dijkstra.js`) pops the lowest-cost tile from a priority queue each step, relaxing neighbors by their tile weight (default 1) so it reconstructs the cheapest path rather than just the shortest one.

All three skip walls. If the goal can't be reached, `App.jsx` shows the no-path message.

## Project structure

```
.
├── index.html                  # Vite entry, mounts #root
├── vite.config.js
├── src/
│   ├── main.jsx                # React entry
│   ├── App.jsx                 # board/search state, modes, drag/drop, start/clear
│   ├── board.js                # board model helpers (size limits, weight cycle)
│   ├── utils.js                # shared sleep() helper for animation timing
│   ├── style.css               # grid layout, tile states, theme variables
│   ├── components/
│   │   ├── Grid.jsx            # tiles and drag/click handling
│   │   └── Controls.jsx        # dropdown, size input, mode and action buttons
│   └── algorithms/
│       ├── index.js            # algorithm registry (label, note, generator)
│       ├── helpers.js          # neighbor order and path reconstruction
│       ├── bfs.js              # breadth-first search
│       ├── dfs.js              # recursive depth-first search with backtracking
│       └── dijkstra.js         # priority-queue search over weighted tiles
└── assets/
    └── demo.gif                # README demo
```

## Running it

Requires Node.js.

```bash
git clone https://github.com/joewahy/grid-pathfinder.git
cd grid-pathfinder
npm install
```

Then start the dev server:

```bash
npm run dev
```

Then open the printed local URL. To make a production build, run `npm run build` (output goes to `dist/`) and `npm run preview` to serve it.

## Usage

1. *(Optional)* Set a board size and click **New board**.
2. *(Optional)* Drag the start or goal tile to reposition it, drop it on an open tile to move, or on the other endpoint to swap.
3. Click **Add walls**, mark obstacle tiles, then click **Add walls** again to exit.
4. *(Optional)* Pick **Dijkstra**, then click **Add weights**, click tiles to cycle their cost, and click **Add weights** again to exit.
5. Pick **DFS**, **BFS**, or **Dijkstra**.
6. Click **Start** to run the animated search.
7. Click **Clear** once to reset the search, twice to also clear walls and weights.

## Ideas for future improvements

- Adjustable animation speed
- Pause and step through a search (the generator-based algorithms make this a small change)
- More algorithms (A*, greedy best-first)
- Diagonal movement
