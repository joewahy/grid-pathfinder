# Grid Pathfinder

An interactive visualizer for pathfinding on a grid. Draw walls, weight tiles, pick BFS, DFS, or Dijkstra, and watch the search explore tile by tile before it traces the final path.

![Demo of Grid Pathfinder: drawing walls, running BFS, and highlighting the found path](assets/demo.gif)

## Features

- **BFS, DFS, and Dijkstra** — pick Breadth-First Search, recursive Depth-First Search, or Dijkstra's algorithm from a dropdown
- **Resizable board** — set a size from 3 to 25 and click **New board** (default 8×8); the grid stays a fixed 480×480px, so tiles scale to fit
- **Draggable start/end** — drag either endpoint onto any open tile to move it, or onto the other endpoint to swap them; walls are not valid drop targets, and dragging is off while wall mode is on
- **Wall drawing** — toggle **Add walls**, then click tiles to mark obstacles the search can't cross
- **Weighted tiles** — toggle **Add weights**, then click tiles to cycle their cost (1 → 2 → 5 → 1); only Dijkstra takes the cost into account, so it can pick a longer-but-cheaper route over a shorter-but-costlier one. The button is only enabled when Dijkstra is selected
- **Animated search** — visited tiles and dead ends light up as the algorithm runs
- **Path highlighting** — the found path is traced across the grid once the goal is reached
- **No-path detection** — if the goal is walled off, the status line shows "No path exists — the end is blocked off."
- **Two-stage Clear** — first click clears the search and path; the button becomes **Clear all**, and a second click removes walls and weights too
- **Algorithm note** — a one-line explainer of the selected algorithm sits between the grid and the controls

## How it works

The grid is a size×size set of tiles. The top-left tile is the start (`.first`) and the bottom-right is the goal (`.last`); either can be dragged elsewhere. Clicking **Start** exits wall mode and runs the selected algorithm from the start tile's current position:

- **BFS** (`algorithms/bfs.js`) explores level by level with a queue, recording each tile's predecessor so it can reconstruct the shortest path when it dequeues the goal.
- **DFS** (`algorithms/dfs.js`) recurses in down/right/up/left order, marking tiles `visited` (and `deadend` on backtrack) so it never revisits one, and returns the first path it finds.
- **Dijkstra** (`algorithms/dijkstra.js`) pops the lowest-cost tile from a priority queue each step, relaxing neighbors by their tile weight (default 1) so it reconstructs the cheapest path rather than just the shortest one.

All three skip tiles with the `active` class (walls) and `await sleep(10)` (from `utils.js`) between steps so the search stays visible. If the goal can't be reached, `main.js` shows the no-path message.

## Project structure

```
.
├── index.html            # markup
├── style.css             # grid layout, tile states, theme variables
├── main.js               # grid setup, event wiring, wall mode, drag/drop, start/clear
├── utils.js              # shared sleep() helper for animation timing
├── algorithms/
│   ├── bfs.js            # breadth-first search + path reconstruction
│   ├── dfs.js            # recursive depth-first search with backtracking
│   └── dijkstra.js       # priority-queue search over weighted tiles + path reconstruction
└── assets/
    └── demo.gif          # README demo
```

## Running it

Static site, no build step or dependencies, but it must be served over HTTP. `main.js` uses ES modules, which browsers won't load from a `file://` path, so double clicking `index.html` won't work.

```bash
git clone https://github.com/joewahy/grid-pathfinder.git
cd grid-pathfinder
```

Then serve it:

```bash
npx serve .
# or
python3 -m http.server
```

Then open the printed local URL.

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
- More algorithms (A*, greedy best-first)
- Diagonal movement
