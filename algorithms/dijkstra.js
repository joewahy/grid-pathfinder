import { sleep } from '../utils.js';

function getWeight(tile) {
    return Number(tile.dataset.weight) || 1;
}

export async function dijkstra(startRow, startCol, rows, size) {
    const dist = new Map();
    const cameFrom = new Map();
    const settled = new Set();
    const startKey = `${startRow},${startCol}`;
    dist.set(startKey, 0);

    // array-backed min-priority queue: [cost, row, column]
    const queue = [[0, startRow, startCol]];

    while (queue.length > 0) {
        queue.sort((a, b) => a[0] - b[0]);
        const [cost, row, column] = queue.shift();
        const key = `${row},${column}`;

        if (settled.has(key)) continue; // a cheaper entry for this tile already won
        settled.add(key);

        if (rows[row][column].classList.contains('last')) {
            return reconstructPath(cameFrom, row, column);
        }

        rows[row][column].classList.add('visited');
        await sleep(10);

        const neighbors = [
            [row + 1, column],
            [row, column + 1],
            [row - 1, column],
            [row, column - 1],
        ];

        for (const [r, c] of neighbors) {
            if (r < 0 || r >= size || c < 0 || c >= size) continue;

            const tile = rows[r][c];
            if (tile.classList.contains('active')) continue; // wall

            const neighborKey = `${r},${c}`;
            if (settled.has(neighborKey)) continue;

            const newCost = cost + getWeight(tile);
            if (!dist.has(neighborKey) || newCost < dist.get(neighborKey)) {
                dist.set(neighborKey, newCost);
                cameFrom.set(neighborKey, [row, column]);
                queue.push([newCost, r, c]);
            }
        }
    }

    return null; // queue emptied, no path found
}

function reconstructPath(cameFrom, endRow, endCol) {
    const path = [[endRow, endCol]];
    let currentKey = `${endRow},${endCol}`;

    while (cameFrom.has(currentKey)) {
        const [row, column] = cameFrom.get(currentKey);
        path.push([row, column]);
        currentKey = `${row},${column}`;
    }

    return path.reverse();
}
