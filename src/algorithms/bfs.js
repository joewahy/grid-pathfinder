import { neighbors, reconstructPath } from './helpers.js';

// Algorithms are generators: each yields { type, index } steps for the UI to
// animate, and returns the final path (tile indices, start to end) or null.
export function* bfs({ size, walls, start, end }) {
    const queue = [start];
    const visited = new Set([start]);
    const cameFrom = new Map();

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === end) {
            return reconstructPath(cameFrom, current); // success
        }

        yield { type: 'visited', index: current };

        for (const next of neighbors(current, size)) {
            if (walls[next] || visited.has(next)) continue;

            visited.add(next);
            cameFrom.set(next, current);
            queue.push(next);
        }
    }

    return null; // queue emptied, no path found
}
