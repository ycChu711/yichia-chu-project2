import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MineSweeperGamePage.css';
import Cell from './Cell';
import { MineSweeperContext } from '../context/MineSweeperContext';
import DifficultyNav from './DifficultyNav';
import NavBar from './NavBar';
import { useLayoutEffect } from 'react';


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

    const placeMines = useCallback((grid, mineCount, excludeRow = -1, excludeCol = -1) => {
        if (!grid || !grid.length) {
            console.log('Grid is invalid in placeMines');
            return;
        }

        let placedMines = 0;
        console.log(`Starting to place ${mineCount} mines, excluding [${excludeRow},${excludeCol}]`);

        // Get actual grid dimensions from the grid parameter
        const gridRows = grid.length;
        const gridCols = grid[0]?.length || 0;

        while (placedMines < mineCount) {
            // Use grid's actual dimensions instead of rows/cols from settings
            const randomRow = Math.floor(Math.random() * gridRows);
            const randomCol = Math.floor(Math.random() * gridCols);

            // Validate the coordinates are within bounds
            if (randomRow >= gridRows || randomCol >= gridCols) {
                continue;
            }

            if ((randomRow === excludeRow && randomCol === excludeCol) ||
                grid[randomRow][randomCol].isBomb) {
                continue;
            }

            grid[randomRow][randomCol].isBomb = true;
            placedMines++;
            console.log(`Placed mine ${placedMines} at [${randomRow},${randomCol}]`);
        }
    }, []);

    const calculateNeighboringMines = useCallback((grid) => {
        if (!grid || !grid.length) {
            console.log('Grid is invalid in calculateNeighboringMines');
            return;
        }

        console.log('Starting to calculate neighboring mines');
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

    const revealEmptyCells = useCallback((grid, row, col, currentRevealedCount) => {
        // If cell is invalid, already revealed, a bomb, or flagged, return without changes
        if (row < 0 || row >= rows || col < 0 || col >= cols ||
            !grid[row] || !grid[row][col] ||
            grid[row][col].isRevealed ||
            grid[row][col].isBomb ||
            grid[row][col].isFlagged) {
            return currentRevealedCount;
        }

        // Reveal current cell
        grid[row][col].isRevealed = true;
        let newRevealedCount = currentRevealedCount + 1;
        console.log(`Revealing cell [${row},${col}], neighbors: ${grid[row][col].neighboringMines}, total: ${newRevealedCount}`);

        // Only recurse if it's an empty cell
        if (grid[row][col].neighboringMines === 0) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];

            for (const [dx, dy] of directions) {
                const newRow = row + dx;
                const newCol = col + dy;

                // Check if neighbor is valid
                if (newRow >= 0 && newRow < rows &&
                    newCol >= 0 && newCol < cols) {
                    const neighbor = grid[newRow][newCol];

                    // If neighbor isn't revealed and isn't flagged
                    if (!neighbor.isRevealed && !neighbor.isFlagged) {
                        // If neighbor has number, just reveal it
                        if (neighbor.neighboringMines > 0) {
                            neighbor.isRevealed = true;
                            newRevealedCount++;
                            console.log(`Revealed numbered cell [${newRow},${newCol}]: ${neighbor.neighboringMines}`);
                        }
                        // If neighbor is empty, recursively reveal
                        else if (!neighbor.isBomb) {
                            newRevealedCount = revealEmptyCells(grid, newRow, newCol, newRevealedCount);
                        }
                    }
                }
            }
        }

        return newRevealedCount;
    }, [rows, cols]);


    const handleFlag = useCallback((row, col, event) => {
        event.preventDefault();

        // Only allow flagging if the cell isn't revealed and game isn't over
        if (!gameState.grid[row][col].isRevealed && !gameOver) {
            // Create the new state first
            const newGrid = gameState.grid.map(r => r.map(cell => ({ ...cell })));
            const cell = newGrid[row][col];
            cell.isFlagged = !cell.isFlagged;

            const newState = {
                ...gameState,
                grid: newGrid,
                flagCount: gameState.flagCount + (cell.isFlagged ? 1 : -1)
            };

            // Check if we should save (either saved game or game started)
            const isSavedGame = newGrid.some(row => row.some(cell => cell.isBomb));
            if (isSavedGame || !isFirstClick.current) {
                saveGameState(level, newState);
            }

            // Update state after saving
            setGameState(newState);
        }
    }, [gameOver, level, gameState]);

    const handleReveal = useCallback((row, col) => {
        console.log('handleReveal called:', row, col, 'isFirstClick:', isFirstClick.current);

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

        const isSavedGame = gameState.grid.some(row => row.some(cell => cell.isBomb));

        if (isFirstClick.current && !isSavedGame) {
            console.log('First click at:', row, col);
            isFirstClick.current = false;
            const newGrid = createInitialGrid();

            console.log('Placing mines...');
            placeMines(newGrid, mines, row, col);
            calculateNeighboringMines(newGrid);

            let newRevealedCount = 0;
            newRevealedCount = revealEmptyCells(newGrid, row, col, newRevealedCount);

            const newState = {
                grid: newGrid,
                revealedCount: newRevealedCount,
                wonGame: newRevealedCount === totalNonBombCells,
                flagCount: 0
            };

            setGameState(newState);
            saveGameState(level, newState); // Save after first move
            return;
        }

        // Handle subsequent clicks
        setGameState(prevState => {
            const newGrid = prevState.grid.map(r => r.map(cell => ({ ...cell })));
            const cell = newGrid[row][col];

            let newState;
            if (cell.isBomb) {
                cell.isRevealed = true;
                newGrid.forEach(r => r.forEach(c => {
                    if (c.isBomb) c.isRevealed = true;
                }));
                newState = {
                    ...prevState,
                    grid: newGrid,
                    hitBomb: true
                };
            } else {
                let newRevealedCount = prevState.revealedCount;
                newRevealedCount = revealEmptyCells(newGrid, row, col, newRevealedCount);

                newState = {
                    ...prevState,
                    grid: newGrid,
                    revealedCount: newRevealedCount,
                    wonGame: newRevealedCount === totalNonBombCells
                };
            }

            saveGameState(level, newState); // Save after each move
            return newState;
        });
    }, [gameOver, totalNonBombCells, placeMines, calculateNeighboringMines, revealEmptyCells, mines, createInitialGrid, gameState.grid, level]);

    const handleReset = useCallback(() => {
        console.log('Resetting game');

        // Clear saved state for current level
        localStorage.removeItem(`minesweeper_${level}`);

        // Reset game context
        initializeGame(rows, cols, mines);

        // Reset game state with fresh grid
        setGameState({
            grid: Array.from({ length: rows }, (_, row) =>
                Array.from({ length: cols }, (_, col) => ({
                    row,
                    col,
                    isBomb: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighboringMines: 0,
                }))
            ),
            revealedCount: 0,
            flagCount: 0,
            wonGame: false,
            hitBomb: false
        });

        // Reset first click state
        isFirstClick.current = true;
    }, [level, rows, cols, mines, initializeGame]);

    const saveGameState = (level, state) => {
        try {
            const gameStateString = JSON.stringify(state);
            localStorage.setItem(`minesweeper_${level}`, gameStateString);
            console.log(`Saved game state for level: ${level}`);
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    };

    const loadGameState = (level, rows, cols) => {
        try {
            const savedState = localStorage.getItem(`minesweeper_${level}`);
            if (savedState) {
                const parsedState = JSON.parse(savedState);

                // Verify the grid dimensions match the current level
                if (parsedState.grid.length === rows && parsedState.grid[0].length === cols) {
                    console.log(`Loaded saved game state for level: ${level}`);
                    return parsedState;
                } else {
                    console.log('Saved grid dimensions do not match current level');
                    localStorage.removeItem(`minesweeper_${level}`);
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading game state:', error);
            return null;
        }
    };

    useEffect(() => {
        console.log('Level changed to:', level, { rows, cols, mines });

        const savedState = loadGameState(level, rows, cols);

        if (savedState && savedState.grid.some(row => row.some(cell => cell.isBomb))) {
            console.log('Loading saved game state');
            isFirstClick.current = false; // Game is already started if there are bombs
            setGameState(savedState);
            initializeGame(rows, cols, mines);
        } else {
            console.log('Starting fresh game');
            isFirstClick.current = true;
            const freshGrid = createInitialGrid();
            initializeGame(rows, cols, mines);
            setGameState({
                grid: freshGrid,
                revealedCount: 0,
                flagCount: 0,
                wonGame: false,
                hitBomb: false
            });
        }

        // No more saving in cleanup
        return () => {
            console.log('Cleaning up level:', level);
        };
    }, [level, rows, cols, mines, initializeGame, createInitialGrid]);


    // Effect for game over conditions
    useEffect(() => {
        if (gameState.hitBomb) {
            checkIfGameIsOver(true);
        } else if (gameState.wonGame) {
            checkIfGameIsOver(false, true);
        }
    }, [gameState.hitBomb, gameState.wonGame, checkIfGameIsOver]);

    const memoizedGrid = useMemo(() => (
        <div
            key={`${level}-${rows}-${cols}`}  // Add this key
            className="grid"
            style={{
                "--cols": cols,
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${window.innerWidth <= 600 ? '20px' : '30px'})`,
                gap: window.innerWidth <= 600 ? '1px' : '2px'
            }}
        >
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
    ), [gameState.grid, cols, handleReveal, handleFlag, gameOver, level, rows]);

    useLayoutEffect(() => {
        const updateControlPanelHeight = () => {
            const controlPanel = document.querySelector('.control-panel');
            if (controlPanel) {
                const height = controlPanel.offsetHeight;
                document.documentElement.style.setProperty('--control-panel-height', `${height + 20}px`);
            }
        };

        // Initial calculation
        updateControlPanelHeight();

        // Recalculate on window resize
        window.addEventListener('resize', updateControlPanelHeight);

        // Cleanup
        return () => window.removeEventListener('resize', updateControlPanelHeight);
    }, [gameOver]);

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