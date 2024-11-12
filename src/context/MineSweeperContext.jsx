import React, { createContext, useState, useCallback } from 'react';

export const MineSweeperContext = createContext();

export function MineSweeperProvider({ children }) {
    const [gameState, setGameState] = useState({
        gameOver: false,
        gameStatus: "playing",
        revealedCells: 0,
        totalNonBombCells: 0
    });

    const initializeGame = useCallback((rows, cols, mines) => {
        setGameState({
            gameOver: false,
            gameStatus: "playing",
            revealedCells: 0,
            totalNonBombCells: rows * cols - mines
        });
    }, []);

    const checkIfGameIsOver = useCallback((isBomb, isWin = false) => {
        if (gameState.gameOver) return;

        setGameState(prevState => {
            if (isBomb) {
                return {
                    ...prevState,
                    gameOver: true,
                    gameStatus: "lost"
                };
            }

            if (isWin) {
                return {
                    ...prevState,
                    gameOver: true,
                    gameStatus: "won"
                };
            }

            return prevState;
        });
    }, [gameState.gameOver]);

    return (
        <MineSweeperContext.Provider
            value={{
                ...gameState,
                checkIfGameIsOver,
                initializeGame
            }}
        >
            {children}
        </MineSweeperContext.Provider>
    );
}