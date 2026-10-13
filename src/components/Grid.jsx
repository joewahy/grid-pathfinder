import { memo, useRef, useState } from 'react';

const Tile = memo(function Tile({ index, className, draggable }) {
    return <div data-index={index} className={className} draggable={draggable} />;
});

function tileClassName({ isStart, isEnd, isWall, weight, mark, isDragOver }) {
    return [
        isStart ? 'first' : isEnd ? 'last' : 'tile',
        isWall && 'active',
        weight > 1 && `weight-${weight}`,
        mark,
        isDragOver && 'drag-over',
    ].filter(Boolean).join(' ');
}

// Click and drag events are delegated to the grid, so tiles stay plain and memoizable.
export default function Grid({ board, marks, dragEnabled, onTileClick, onEndpointDrop }) {
    const { size, walls, weights, start, end } = board;
    const draggedEndpoint = useRef(null); // 'start' | 'end' | null, which endpoint is mid-drag
    const [dragOver, setDragOver] = useState(null);

    function indexOf(e) {
        const value = e.target.dataset.index;
        return value === undefined ? null : Number(value);
    }

    function handleClick(e) {
        const index = indexOf(e);
        if (index !== null) onTileClick(index);
    }

    function handleDragStart(e) {
        const index = indexOf(e);
        if (!dragEnabled || (index !== start && index !== end)) {
            e.preventDefault(); // don't let a drag start while wall mode is on
            return;
        }
        draggedEndpoint.current = index === start ? 'start' : 'end';
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
        const index = indexOf(e);
        if (!draggedEndpoint.current || index === null || walls[index]) return;

        e.preventDefault();
        setDragOver(index);
    }

    function handleDragLeave(e) {
        const index = indexOf(e);
        setDragOver(current => (current === index ? null : current));
    }

    function handleDrop(e) {
        e.preventDefault();
        const index = indexOf(e);
        if (draggedEndpoint.current && index !== null) {
            onEndpointDrop(draggedEndpoint.current, index);
        }
        draggedEndpoint.current = null;
        setDragOver(null);
    }

    function handleDragEnd() {
        draggedEndpoint.current = null;
        setDragOver(null);
    }

    return (
        <div
            id="grid"
            style={{ '--size': size }}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            {walls.map((isWall, index) => {
                const isStart = index === start;
                const isEnd = index === end;
                return (
                    <Tile
                        key={index}
                        index={index}
                        draggable={isStart || isEnd}
                        className={tileClassName({
                            isStart,
                            isEnd,
                            isWall,
                            weight: weights[index],
                            mark: marks[index],
                            isDragOver: dragOver === index,
                        })}
                    />
                );
            })}
        </div>
    );
}
