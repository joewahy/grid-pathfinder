import { useRef, useState } from 'react';
import Controls from './components/Controls.jsx';
import Grid from './components/Grid.jsx';
import { ALGORITHMS } from './algorithms/index.js';
import { MAX_SIZE, MIN_SIZE, createBoard, emptyMarks, nextWeight, replaceAt } from './board.js';
import { sleep } from './utils.js';

const DEFAULT_SIZE = 8;
const STEP_DELAY_MS = 10; // pause between search steps so the search stays visible
const NO_STATUS = { message: '', isError: false };

export default function App() {
    const [board, setBoard] = useState(() => createBoard(DEFAULT_SIZE));
    const [marks, setMarks] = useState(() => emptyMarks(DEFAULT_SIZE));
    const [algo, setAlgo] = useState('dfs');
    const [mode, setMode] = useState(null); // 'walls' | 'weights' | null
    const [clearStage, setClearStage] = useState(0);
    const [status, setStatus] = useState(NO_STATUS);
    const [sizeInput, setSizeInput] = useState(String(DEFAULT_SIZE));
    const runId = useRef(0); // bumped to cancel an in-flight search animation

    // Clears the search and cancels any animation still running.
    function resetSearch(size = board.size) {
        runId.current++;
        setMarks(emptyMarks(size));
        setClearStage(0);
        setStatus(NO_STATUS);
    }

    function handleAlgoChange(next) {
        setAlgo(next);
        if (next !== 'dijkstra' && mode === 'weights') setMode(null);
    }

    function handleResize() {
        const parsed = parseInt(sizeInput, 10);
        if (Number.isNaN(parsed)) return;

        const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parsed));
        setSizeInput(String(size));
        setBoard(createBoard(size));
        setMode(null);
        resetSearch(size);
    }

    function handleToggleMode(next) {
        resetSearch();
        setMode(mode === next ? null : next);
    }

    function handleClear() {
        resetSearch();
        if (clearStage === 0) {
            setClearStage(1);
        } else {
            setBoard({ ...createBoard(board.size), start: board.start, end: board.end });
        }
    }

    function handleTileClick(index) {
        if (index === board.start || index === board.end) return;

        if (mode === 'walls') {
            setBoard(current => ({ ...current, walls: replaceAt(current.walls, index, !current.walls[index]) }));
        } else if (mode === 'weights') {
            setBoard(current => ({
                ...current,
                weights: replaceAt(current.weights, index, nextWeight(current.weights[index])),
            }));
        }
    }

    // `endpoint` is the one being dragged; dropping it on the other swaps them.
    function handleEndpointDrop(endpoint, index) {
        const other = endpoint === 'start' ? 'end' : 'start';
        if (board.walls[index] || index === board[endpoint]) return;

        if (index === board[other]) {
            setBoard({ ...board, start: board.end, end: board.start });
        } else {
            setBoard({ ...board, [endpoint]: index });
        }
        resetSearch();
    }

    async function handleStart() {
        setMode(null);
        resetSearch();
        const id = runId.current;

        const steps = ALGORITHMS[algo].run(board);
        let step = steps.next();
        while (!step.done) {
            const { type, index } = step.value;
            setMarks(current => replaceAt(current, index, type));
            await sleep(STEP_DELAY_MS);
            if (id !== runId.current) return; // reset or restarted mid-search

            step = steps.next();
        }

        const path = step.value;
        if (path) {
            setMarks(current => {
                const next = current.slice();
                path.forEach(index => { next[index] = 'path'; });
                return next;
            });
        } else {
            setStatus({ message: 'No path exists — the end is blocked off.', isError: true });
        }
    }

    return (
        <main className="panel">
            <h1>Pathfinder</h1>

            <Grid
                board={board}
                marks={marks}
                dragEnabled={mode !== 'walls'}
                onTileClick={handleTileClick}
                onEndpointDrop={handleEndpointDrop}
            />

            <p className="algo-note">{ALGORITHMS[algo].note}</p>

            <Controls
                algo={algo}
                onAlgoChange={handleAlgoChange}
                sizeInput={sizeInput}
                onSizeInputChange={setSizeInput}
                onResize={handleResize}
                mode={mode}
                onToggleMode={handleToggleMode}
                clearStage={clearStage}
                onClear={handleClear}
                onStart={handleStart}
            />

            <div className={status.isError ? 'status error' : 'status'}>{status.message}</div>
        </main>
    );
}
