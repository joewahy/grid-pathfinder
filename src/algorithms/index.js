import { bfs } from './bfs.js';
import { dfs } from './dfs.js';
import { dijkstra } from './dijkstra.js';

// Key order is the order of the dropdown. `note` is the one-line explainer
// shown between the grid and the controls.
export const ALGORITHMS = {
    dfs: {
        label: 'DFS',
        run: dfs,
        note: 'DFS visits in a fixed order: down → right → up → left, backtracking at dead ends.',
    },
    bfs: {
        label: 'BFS',
        run: bfs,
        note: 'BFS explores outward in waves using a queue, so the first route it reaches is the shortest.',
    },
    dijkstra: {
        label: 'Dijkstra',
        run: dijkstra,
        note: 'Dijkstra always expands the cheapest known path first, so it finds the lowest-cost route even when tiles have different weights.',
    },
};
