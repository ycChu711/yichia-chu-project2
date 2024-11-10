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

    //console.log('Cell rendering:', { row, column, isRevealed, isFlagged, isBomb, neighboringMines });

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
            data-revealed={isRevealed}
            data-row={row}
            data-col={column}
            data-mines={neighboringMines}
        >
            {getCellContent()}
        </div>
    );
}