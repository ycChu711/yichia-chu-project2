import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MineSweeperGamePage.css';
import Cell from './Cell';
import { MineSweeperContext } from '../context/MineSweeperContext';
import DifficultyNav from './DifficultyNav';
import NavBar from './NavBar';

export default function MineSweeperGamePage() {
    const DIFFICULTY_SETTINGS = {
        easy: { rows: 8, cols: 8, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 },
    };

    const { level = 'easy' } = useParams();
    const settings = useMemo(() => DIFFICULTY_SETTINGS[level], [level]);
    const { rows, cols, mines } = settings;
    const { initializeGame, gameOver, gameStatus, checkIfGameIsOver } = useContext(MineSweeperContext);

    const navigate = useNavigate();
    const totalNonBombCells = rows * cols - mines;
    const isFirstClick = useRef(true);
    const createInitialGrid = useCallback(() => {
        console.log('Creating initial grid with dimensions:', rows, cols);
        const newGrid = Array.from({ length: rows }, (_, row) =>
            Array.from({ length: cols }, (_, col) => ({
                row,
                col,
                isBomb: false,
                isRevealed: false,
                isFlagged: false,
                neighboringMines: 0,
            }))
        );
        console.log('Created grid:', newGrid);
        return newGrid;
    }, [rows, cols]);

    const [gameState, setGameState] = useState(() => ({
        grid: createInitialGrid(),
        revealedCount: 0,
        flagCount: 0,
    }));

    // Define all helper functions before using them
    const placeMines = useCallback((grid, mineCount, excludeRow = -1, excludeCol = -1) => {
        if (!grid || !grid.length) return;

        let placedMines = 0;
        while (placedMines < mineCount) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);

            if ((randomRow === excludeRow && randomCol === excludeCol) ||
                grid[randomRow][randomCol].isBomb) {
                continue;
            }

            grid[randomRow][randomCol].isBomb = true;
            placedMines++;
        }
    }, [rows]);

    const calculateNeighboringMines = useCallback((grid) => {
        if (!grid || !grid.length) return;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!grid[row] || !grid[row][col]) continue;

                if (grid[row][col].isBomb) {
                    grid[row][col].neighboringMines = -1;
                    continue;
                }

                let mineCount = 0;
                for (const [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (
                        newRow >= 0 && newRow < rows &&
                        newCol >= 0 && newCol < cols &&
                        grid[newRow] &&
                        grid[newRow][newCol] &&
                        grid[newRow][newCol].isBomb
                    ) {
                        mineCount++;
                    }
                }

                grid[row][col].neighboringMines = mineCount;
            }
        }
    }, [rows, cols]);


    const initializeNewGame = useCallback(() => {
        console.log('Initializing new game');
        isFirstClick.current = true;
        initializeGame(rows, cols, mines);
        const newGrid = createInitialGrid();
        console.log('New grid created:', newGrid);
        setGameState({
            grid: newGrid,
            revealedCount: 0,
            flagCount: 0,
        });
    }, [rows, cols, mines, initializeGame, createInitialGrid]);

    const revealEmptyCells = useCallback((grid, row, col, newRevealedCount = 0) => {
        if (!grid[row] || !grid[row][col] ||
            grid[row][col].isRevealed ||
            grid[row][col].isBomb ||
            grid[row][col].isFlagged) {
            return newRevealedCount;
        }

        grid[row][col].isRevealed = true;
        newRevealedCount++;

        if (grid[row][col].neighboringMines === 0) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;
                if (newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols) {
                    newRevealedCount = revealEmptyCells(grid, newRow, newCol, newRevealedCount);
                }
            }
        }

        return newRevealedCount;
    }, [rows, cols]);

    const handleFlag = useCallback((row, col, event) => {
        event.preventDefault();

        if (!gameState.grid[row][col].isRevealed && !gameOver) {
            setGameState(prevState => {
                const newGrid = prevState.grid.map(r => r.map(cell => ({ ...cell })));
                const cell = newGrid[row][col];
                cell.isFlagged = !cell.isFlagged;

                return {
                    ...prevState,
                    grid: newGrid,
                    flagCount: prevState.flagCount + (cell.isFlagged ? 1 : -1)
                };
            });
        }
    }, [gameOver]);

    const handleReveal = useCallback((row, col) => {
        console.log('handleReveal called:', row, col);
        console.log('Current grid state before update:', gameState.grid);

        if (!gameState.grid[row] || !gameState.grid[row][col]) {
            console.log('Invalid cell coordinates');
            return;
        }

        if (gameState.grid[row][col].isRevealed || gameState.grid[row][col].isFlagged || gameOver) {
            console.log('Cell blocked:', {
                isRevealed: gameState.grid[row][col].isRevealed,
                isFlagged: gameState.grid[row][col].isFlagged,
                gameOver
            });
            return;
        }

        if (isFirstClick.current) {
            isFirstClick.current = false;
            const newGrid = createInitialGrid();
            console.log('First click - Created new grid');

            placeMines(newGrid, mines, row, col);
            calculateNeighboringMines(newGrid);

            newGrid[row][col].isRevealed = true;
            let newRevealedCount = 1;

            if (newGrid[row][col].neighboringMines === 0) {
                newRevealedCount = revealEmptyCells(newGrid, row, col, newRevealedCount);
            }

            console.log('Setting state with new grid:', newGrid);
            setGameState(prev => {
                const updatedState = {
                    ...prev,
                    grid: newGrid,
                    revealedCount: newRevealedCount,
                    wonGame: newRevealedCount === totalNonBombCells
                };
                console.log('New state:', updatedState);
                return updatedState;
            });
            return;
        }

        setGameState(prevState => {
            const newGrid = prevState.grid.map(r => r.map(cell => ({ ...cell })));
            console.log('Created new grid copy');

            const cell = newGrid[row][col];
            if (cell.isBomb) {
                cell.isRevealed = true;
                newGrid.forEach(r => r.forEach(c => {
                    if (c.isBomb) c.isRevealed = true;
                }));
                console.log('Hit bomb - revealing all bombs');
                return {
                    ...prevState,
                    grid: newGrid,
                    hitBomb: true
                };
            }

            let newRevealedCount = prevState.revealedCount;
            if (cell.neighboringMines === 0) {
                newRevealedCount = revealEmptyCells(newGrid, row, col, newRevealedCount);
            } else {
                cell.isRevealed = true;
                newRevealedCount++;
            }

            const updatedState = {
                ...prevState,
                grid: newGrid,
                revealedCount: newRevealedCount,
                wonGame: newRevealedCount === totalNonBombCells
            };
            console.log('Updated state:', updatedState);
            return updatedState;
        });
    }, [gameOver, totalNonBombCells, placeMines, calculateNeighboringMines, revealEmptyCells, mines, createInitialGrid]);

    const handleReset = useCallback(() => {
        localStorage.removeItem(`minesweeper_${level}`);
        initializeNewGame();
    }, [level, initializeNewGame]);

    useEffect(() => {
        console.log('Loading game state for level:', level);
        const savedState = localStorage.getItem(`minesweeper_${level}`);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                console.log('Loaded saved state:', parsed);
                if (parsed.grid && parsed.grid.length > 0) {
                    // Create a new grid with proper structure
                    const newGrid = parsed.grid.map(row =>
                        row.map(cell => ({
                            ...cell,
                            row: cell.row,
                            col: cell.col,
                            isBomb: cell.isBomb || false,
                            isRevealed: cell.isRevealed || false,
                            isFlagged: cell.isFlagged || false,
                            neighboringMines: cell.neighboringMines || 0,
                        }))
                    );
                    setGameState({
                        grid: newGrid,
                        revealedCount: parsed.revealedCount || 0,
                        flagCount: parsed.flagCount || 0,
                    });
                    isFirstClick.current = false;
                } else {
                    console.log('Invalid saved state, initializing new game');
                    initializeNewGame();
                }
            } catch (e) {
                console.error('Error loading saved state:', e);
                initializeNewGame();
            }
        } else {
            console.log('No saved state found, initializing new game');
            initializeNewGame();
        }
    }, [level, initializeNewGame]);

    // Save game state when it changes
    useEffect(() => {
        if (gameState.grid.length > 0) {
            localStorage.setItem(`minesweeper_${level}`, JSON.stringify(gameState));
        }
    }, [gameState, level]);

    // Effect for game over conditions
    useEffect(() => {
        if (gameState.hitBomb) {
            checkIfGameIsOver(true);
        } else if (gameState.wonGame) {
            checkIfGameIsOver(false, true);
        }
    }, [gameState.hitBomb, gameState.wonGame, checkIfGameIsOver]);

    const memoizedGrid = useMemo(() => (
        <div className="grid" style={{
            "--cols": cols,
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 30px)`,
            gap: '1px'
        }}>
            {gameState.grid.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                    <Cell
                        key={`${rowIndex}-${colIndex}`}
                        row={rowIndex}
                        column={colIndex}
                        isBomb={cell.isBomb}
                        isFlagged={cell.isFlagged}
                        neighboringMines={cell.neighboringMines}
                        isRevealed={cell.isRevealed}
                        onReveal={() => handleReveal(rowIndex, colIndex)}
                        onFlag={(e) => handleFlag(rowIndex, colIndex, e)}
                        gameOver={gameOver}
                    />
                ))
            ))}
        </div>
    ), [gameState.grid, cols, handleReveal, handleFlag, gameOver]);

    return (
        <div className="minesweeper-page">
            <div className="control-panel">
                <NavBar />
                <DifficultyNav selectedDifficulty={level} />
                <div className="game-info">
                    <span>Mines Remaining: {mines - gameState.flagCount}</span>
                </div>
                {gameOver && (
                    <div className="game-status">
                        Game over! {gameStatus === "lost" ? "You Lost!" : "You Won!"}
                    </div>
                )}
            </div>
            <div className="game-area">
                <button onClick={handleReset}>Reset</button>
                {memoizedGrid}
            </div>
        </div>
    );
}