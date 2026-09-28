import { dfsRecursion } from './algorithms/dfs.js';
import { bfs } from './algorithms/bfs.js'
import { dijkstra } from './algorithms/dijkstra.js';

const grid = document.getElementById('grid');
const wallsBtn = document.getElementById('addWalls');
const weightsBtn = document.getElementById('addWeights');
const startBtn = document.getElementById('start');
const selectAlgo = document.getElementById('algorithms');
const clearBtn = document.getElementById('clear');
const sizeInput = document.getElementById('sizeInput');
const resizeBtn = document.getElementById('resizeBtn');
const statusEl = document.getElementById('status');
const algoNote = document.getElementById('algoNote');

let addingWalls = false;
let addingWeights = false;
let clearStage = 0;
const WEIGHT_CYCLE = [1, 2, 5];

let size = 8;
let children = [];
let rows = [];
let draggedEndpoint = null; // 'first' | 'last' | null — which endpoint is mid-drag

// named handler so we can add/remove the SAME reference later
function toggleTileActive(e) {
    e.currentTarget.classList.toggle('active');
}

function setClearStage(stage) {
    clearStage = stage;
    clearBtn.textContent = stage === 0 ? 'Clear' : 'Clear all';
}

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle('error', isError);
}

function setWallsMode(tiles, on) {
    tiles.forEach((tile) => {
        if (on) {
            tile.addEventListener('click', toggleTileActive);

        } else {
            tile.removeEventListener('click', toggleTileActive);
        }
    });
}

// cycles a tile's cost through WEIGHT_CYCLE; 1 is "no weight" (no dataset/class)
function toggleTileWeight(e) {
    const tile = e.currentTarget;
    const current = Number(tile.dataset.weight) || 1;
    const next = WEIGHT_CYCLE[(WEIGHT_CYCLE.indexOf(current) + 1) % WEIGHT_CYCLE.length];

    tile.classList.remove('weight-2', 'weight-5');
    if (next === 1) {
        delete tile.dataset.weight;
    } else {
        tile.dataset.weight = next;
        tile.classList.add(`weight-${next}`);
    }
}

function setWeightsMode(tiles, on) {
    tiles.forEach((tile) => {
        if (on) {
            tile.addEventListener('click', toggleTileWeight);
        } else {
            tile.removeEventListener('click', toggleTileWeight);
        }
    });
}

function exitWeightsMode() {
    addingWeights = false;
    weightsBtn.classList.remove('active-mode');
    setWeightsMode([...document.getElementsByClassName('tile')], false);
}

function getRowCol(tile) {
    const value = Number(tile.dataset.index);
    return [Math.floor(value / size), value % size];
}

function handleDragStart(e) {
    if (addingWalls) {
        e.preventDefault(); // don't let a drag start while wall mode is on
        return;
    }
    if (e.target.classList.contains('first')) {
        draggedEndpoint = "first";
    } else {
        draggedEndpoint = "last";
    }
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (!draggedEndpoint) return;

    if (!e.target.classList.contains('active')) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedEndpoint) return;

    const target = e.target;
    target.classList.remove('drag-over');

    const otherEndpoint = draggedEndpoint === 'first' ? 'last' : 'first';
    const oldTile = grid.querySelector(`.${draggedEndpoint}`);
    const isValidTile = target.classList.contains('tile') || target.classList.contains(otherEndpoint);

    if (!isValidTile || target.classList.contains('active') || target === oldTile) {
        draggedEndpoint = null;
        return;
    }

    if (target.classList.contains(otherEndpoint)) {
        // dropped onto the other endpoint — swap them instead of just moving
        target.classList.remove(otherEndpoint);
        target.classList.add(draggedEndpoint);

        oldTile.classList.remove(draggedEndpoint);
        oldTile.classList.add(otherEndpoint);
    } else {
        // normal move onto an empty tile
        oldTile.classList.remove(draggedEndpoint);
        oldTile.classList.add('tile');
        oldTile.draggable = false;

        target.classList.remove('tile');
        target.classList.add(draggedEndpoint);
        target.draggable = true;
    }

    children.forEach(tile => {
        tile.classList.remove('visited', 'deadend', 'path');
    });
    setClearStage(0);
    setStatus('');

    draggedEndpoint = null;
}

function handleDragEnd() {
    draggedEndpoint = null;
    document.querySelectorAll('.drag-over').forEach(tile => tile.classList.remove('drag-over'));
}

function buildGrid(newSize) {
    size = newSize;
    document.documentElement.style.setProperty('--size', size);

    grid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++){
            const newTile = document.createElement("div");
            newTile.dataset.index = (i * size) + j;
            newTile.classList.add('tile');
            fragment.append(newTile);
        }
    }
    grid.append(fragment);

    const first = grid.firstElementChild;
    const last = grid.lastElementChild;

    first.classList.add('first');
    first.classList.remove('tile')
    first.draggable = true;
    last.classList.add('last');
    last.classList.remove('tile')
    last.draggable = true;

    children = [...grid.children];

    rows = [];
    for (let i = 0; i < children.length; i += size) {
        rows.push(children.slice(i, i + size));
    }

    children.forEach((child) => {
        child.addEventListener('click', () => {
            const value = Number(child.dataset.index);
            const row = Math.floor(value / size);
            const column = value % size;
            console.log("row: " + row);
            console.log("column: " + column);
        })
    })

    addingWalls = false;
    wallsBtn.classList.remove('active-mode');
    addingWeights = false;
    weightsBtn.classList.remove('active-mode');
    setClearStage(0);
    setStatus('');
}

// One-line explainer shown between the grid and the controls, per algorithm.
const ALGO_NOTES = {
    dfs: 'DFS visits in a fixed order: down → right → up → left, backtracking at dead ends.',
    bfs: 'BFS explores outward in waves using a queue, so the first route it reaches is the shortest.',
    dijkstra: 'Dijkstra always expands the cheapest known path first, so it finds the lowest-cost route even when tiles have different weights.',
};

function syncAlgoNote() {
    const note = ALGO_NOTES[selectAlgo.value];
    algoNote.textContent = note ?? '';
    algoNote.hidden = !note;
}

// weights only affect Dijkstra, so only let them be edited while it's selected
function syncWeightsAvailability() {
    const isDijkstra = selectAlgo.value === 'dijkstra';
    weightsBtn.disabled = !isDijkstra;
    if (!isDijkstra && addingWeights) {
        exitWeightsMode();
    }
}

selectAlgo.addEventListener('change', syncAlgoNote);
selectAlgo.addEventListener('change', syncWeightsAvailability);
syncAlgoNote();
syncWeightsAvailability();

buildGrid(size);

grid.addEventListener('dragstart', handleDragStart);
grid.addEventListener('dragover', handleDragOver);
grid.addEventListener('dragleave', handleDragLeave);
grid.addEventListener('drop', handleDrop);
grid.addEventListener('dragend', handleDragEnd);

resizeBtn.addEventListener('click', () => {
    let newSize = parseInt(sizeInput.value, 10);
    if (Number.isNaN(newSize)) return;
    newSize = Math.min(25, Math.max(3, newSize));
    sizeInput.value = newSize;
    buildGrid(newSize);
});

clearBtn.addEventListener('click', () => {
    if (clearStage == 0) {
        children.forEach(tile => {
            tile.classList.remove('visited', 'deadend', 'path');
        });
        setClearStage(1);
    } else {
        children.forEach(tile => {
            tile.classList.remove('visited', 'deadend', 'path', 'active', 'weight-2', 'weight-5');
            delete tile.dataset.weight;
        });
        setClearStage(0);
    }
    setStatus('');
})

wallsBtn.addEventListener('click', () => {
    children.forEach(tile => {
        tile.classList.remove('visited', 'deadend', 'path');
    });
    setClearStage(0);
    setStatus('');

    if (addingWeights) {
        exitWeightsMode();
    }

    addingWalls = !addingWalls;
    wallsBtn.classList.toggle('active-mode', addingWalls); // glow the button while wall mode is on
    const tiles = [...document.getElementsByClassName('tile')];
    setWallsMode(tiles, addingWalls);
});

weightsBtn.addEventListener('click', () => {
    children.forEach(tile => {
        tile.classList.remove('visited', 'deadend', 'path');
    });
    setClearStage(0);
    setStatus('');

    if (addingWalls) {
        addingWalls = false;
        wallsBtn.classList.remove('active-mode');
        setWallsMode([...document.getElementsByClassName('tile')], false);
    }

    addingWeights = !addingWeights;
    weightsBtn.classList.toggle('active-mode', addingWeights); // glow the button while weight mode is on
    const tiles = [...document.getElementsByClassName('tile')];
    setWeightsMode(tiles, addingWeights);
});

startBtn.addEventListener('click', async () => {
    const selectedAlgo = selectAlgo.value;

    if (addingWalls) {
        addingWalls = false;
        wallsBtn.classList.remove('active-mode');
        const tiles = [...document.getElementsByClassName('tile')];
        setWallsMode(tiles, addingWalls);
    }
    if (addingWeights) {
        exitWeightsMode();
    }

    children.forEach(tile => {
        tile.classList.remove('visited', 'deadend', 'path');
    });
    setClearStage(0);
    setStatus('');

    let path;
    const [startRow, startCol] = getRowCol(grid.querySelector('.first'));

    if (selectedAlgo === 'dfs') {
        path = [];
        const success = await dfsRecursion(startRow, startCol, rows, size, path);
        if (!success) path = null;
    } else if (selectedAlgo === 'bfs') {
        path = await bfs(startRow, startCol, rows, size);
    } else if (selectedAlgo === 'dijkstra') {
        path = await dijkstra(startRow, startCol, rows, size);
    }

    if (path) {
        path.forEach(([r, c]) => {
            rows[r][c].classList.add('path');
        });
        console.log('Path found:', path);
    } else {
        console.log('No path found');
        setStatus('No path exists — the end is blocked off.', true);
    }
});
