import React, { useCallback, useState } from 'react';
import './Cell.css';

export default function Cell(props) {
    const {
        row,
        column,
        isBomb,
        neighboringMines,
        isRevealed,
        isFlagged,
        onReveal,
        onFlag,
        gameOver
    } = props;

    const [touchTimeout, setTouchTimeout] = useState(null);
    const [touchStartTime, setTouchStartTime] = useState(0);

    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        setTouchStartTime(Date.now());

        const timeout = setTimeout(() => {
            if (!gameOver) {
                onFlag(e);
            }
        }, 500); // 500ms long press to flag

        setTouchTimeout(timeout);
    }, [gameOver, onFlag]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        clearTimeout(touchTimeout);

        // If the touch duration was less than 500ms, treat it as a regular click
        if (Date.now() - touchStartTime < 500) {
            if (!isFlagged && !gameOver) {
                onReveal();
            }
        }
    }, [touchTimeout, touchStartTime, isFlagged, gameOver, onReveal]);

    const handleTouchMove = useCallback((e) => {
        // Cancel the long press if user moves their finger
        clearTimeout(touchTimeout);
    }, [touchTimeout]);

    const handleClick = useCallback((e) => {
        e.preventDefault();
        console.log('Cell clicked:', row, column);
        if (e.shiftKey) {
            onFlag(e);
        } else if (!isFlagged && !gameOver) {
            onReveal();
        }
    }, [row, column, gameOver, isFlagged, onReveal, onFlag]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        if (!gameOver) {
            onFlag(e);
        }
    }, [gameOver, onFlag]);

    const getCellContent = () => {
        //console.log('Getting cell content:', { isRevealed, isFlagged, isBomb, neighboringMines });
        if (isFlagged) return "🚩";
        if (!isRevealed) return "";
        if (isBomb) return "💣";
        if (neighboringMines > 0) {
            return neighboringMines.toString();
        }
        return "";
    };

    const cellClassName = `square 
        ${isRevealed ? 'revealed' : 'unrevealed'} 
        ${isFlagged ? 'flagged' : ''} 
        ${isRevealed && isBomb ? 'bomb' : ''}
        ${isRevealed && neighboringMines > 0 ? `number-${neighboringMines}` : ''}`;

    return (
        <div
            className={cellClassName.trim()}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            data-revealed={isRevealed}
            data-row={row}
            data-col={column}
            data-mines={neighboringMines}
        >
            {getCellContent()}
        </div>
    );
}