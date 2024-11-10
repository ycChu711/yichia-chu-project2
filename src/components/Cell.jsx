import React, { useCallback } from 'react';
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

    //console.log('Cell rendering:', { row, column, isRevealed, isFlagged, neighboringMines });

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
        if (isFlagged) return "🚩";
        if (!isRevealed) return "";
        if (isBomb) return "💣";
        return neighboringMines > 0 ? neighboringMines : "";
    };

    // Use more specific class names for debugging
    const cellClassName = `square 
        ${isRevealed ? 'revealed' : 'unrevealed'} 
        ${isFlagged ? 'flagged' : ''} 
        ${isRevealed && isBomb ? 'bomb' : ''}`;

    return (
        <div
            className={cellClassName}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            data-revealed={isRevealed}
            data-row={row}
            data-col={column}
        >
            {getCellContent()}
        </div>
    );
}