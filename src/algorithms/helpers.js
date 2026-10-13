// Neighbor indices in the order every algorithm explores them: down, right, up, left.
export function neighbors(index, size) {
    const row = Math.floor(index / size);
    const column = index % size;
    const result = [];

    if (row + 1 < size) result.push(index + size);
    if (column + 1 < size) result.push(index + 1);
    if (row - 1 >= 0) result.push(index - size);
    if (column - 1 >= 0) result.push(index - 1);

    return result;
}

export function reconstructPath(cameFrom, end) {
    const path = [end];
    let current = end;

    while (cameFrom.has(current)) {
        current = cameFrom.get(current);
        path.push(current);
    }

    return path.reverse();
}
