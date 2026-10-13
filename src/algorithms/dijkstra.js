import { neighbors, reconstructPath } from './helpers.js';

export function* dijkstra({ size, walls, weights, start, end }) {
    const dist = new Map([[start, 0]]);
    const cameFrom = new Map();
    const settled = new Set();

    // array-backed min-priority queue: [cost, index]
    const queue = [[0, start]];

    while (queue.length > 0) {
        queue.sort((a, b) => a[0] - b[0]);
        const [cost, current] = queue.shift();

        if (settled.has(current)) continue; // a cheaper entry for this tile already won
        settled.add(current);

        if (current === end) {
            return reconstructPath(cameFrom, current);
        }

        yield { type: 'visited', index: current };

        for (const next of neighbors(current, size)) {
            if (walls[next] || settled.has(next)) continue;

            const newCost = cost + weights[next];
            if (!dist.has(next) || newCost < dist.get(next)) {
                dist.set(next, newCost);
                cameFrom.set(next, current);
                queue.push([newCost, next]);
            }
        }
    }

    return null; // queue emptied, no path found
}
