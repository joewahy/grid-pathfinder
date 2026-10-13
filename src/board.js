export const MIN_SIZE = 3;
export const MAX_SIZE = 25;
export const WEIGHT_CYCLE = [1, 2, 5];

// Tiles are stored as flat arrays indexed by row * size + column.
export function createBoard(size) {
    return {
        size,
        walls: Array(size * size).fill(false),
        weights: Array(size * size).fill(1), // 1 is "no weight"
        start: 0,
        end: size * size - 1,
    };
}

// per-tile search marks: null | 'visited' | 'deadend' | 'path'
export function emptyMarks(size) {
    return Array(size * size).fill(null);
}

export function nextWeight(weight) {
    return WEIGHT_CYCLE[(WEIGHT_CYCLE.indexOf(weight) + 1) % WEIGHT_CYCLE.length];
}

export function replaceAt(array, index, value) {
    const copy = array.slice();
    copy[index] = value;
    return copy;
}
