import { neighbors } from './helpers.js';

export function* dfs({ size, walls, start, end }) {
    const visited = new Set();
    const path = [];

    function* visit(index) {
        if (walls[index] || visited.has(index)) return false;

        visited.add(index);
        path.push(index);
        yield { type: 'visited', index };

        if (index === end) return true;

        for (const next of neighbors(index, size)) {
            if (yield* visit(next)) return true;
        }

        path.pop();
        yield { type: 'deadend', index };

        return false;
    }

    return (yield* visit(start)) ? path : null;
}
