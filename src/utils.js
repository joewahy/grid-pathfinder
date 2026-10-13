export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function replaceAt(array, index, value) {
    const copy = array.slice();
    copy[index] = value;
    return copy;
}
