import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DifficultyNav.css';

export default function DifficultyNav({ selectedDifficulty, onSelectDifficulty }) {
    const navigate = useNavigate();

    const handleDifficultyChange = (difficulty) => {
        onSelectDifficulty ? onSelectDifficulty(difficulty) : navigate(`/game/${difficulty}`);
    };

    return (
        <nav className="difficulty-nav">
            <span
                onClick={() => handleDifficultyChange('easy')}
                className={selectedDifficulty === 'easy' ? 'active' : ''}
            >Easy</span>
            <span
                onClick={() => handleDifficultyChange('medium')}
                className={selectedDifficulty === 'medium' ? 'active' : ''}
            >Medium</span>
            <span
                onClick={() => handleDifficultyChange('hard')}
                className={selectedDifficulty === 'hard' ? 'active' : ''}
            >Hard</span>
        </nav>
    );
}