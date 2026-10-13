import { ALGORITHMS } from '../algorithms/index.js';
import { MAX_SIZE, MIN_SIZE } from '../board.js';

export default function Controls({
    algo,
    onAlgoChange,
    sizeInput,
    onSizeInputChange,
    onResize,
    mode,
    onToggleMode,
    clearStage,
    onClear,
    onStart,
}) {
    return (
        <div className="controls">
            <div className="controls-row">
                <select name="algorithms" id="algorithms" value={algo} onChange={e => onAlgoChange(e.target.value)}>
                    {Object.entries(ALGORITHMS).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <div className="size-control">
                    <label htmlFor="sizeInput">Size:</label>
                    <input
                        type="number"
                        id="sizeInput"
                        min={MIN_SIZE}
                        max={MAX_SIZE}
                        value={sizeInput}
                        onChange={e => onSizeInputChange(e.target.value)}
                    />
                </div>
                <button type="button" onClick={onResize}>New board</button>
            </div>
            <div className="controls-row">
                <button
                    type="button"
                    className={mode === 'walls' ? 'active-mode' : undefined}
                    onClick={() => onToggleMode('walls')}
                >
                    Add walls
                </button>
                {/* weights only affect Dijkstra, so only let them be edited while it's selected */}
                <button
                    type="button"
                    className={mode === 'weights' ? 'active-mode' : undefined}
                    disabled={algo !== 'dijkstra'}
                    onClick={() => onToggleMode('weights')}
                >
                    Add weights
                </button>
                <button type="button" onClick={onClear}>
                    {clearStage === 0 ? 'Clear' : 'Clear all'}
                </button>
                <button type="button" className="primary" onClick={onStart}>Start</button>
            </div>
        </div>
    );
}
