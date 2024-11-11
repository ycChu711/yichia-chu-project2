import React from 'react';
import NavBar from './NavBar';
import './RulesPage.css';

export default function RulesPage() {
    return (
        <div className='rules-page'>
            <NavBar />
            <h1>Game Rules</h1>
            <div className='rules-content'>
                <p>The board is divided into cells, with mines randomly distributed.</p>
                <p>To win, you need to open all the cells.</p>
                <p>The number on a cell shows the number of mines adjacent to it.</p>
                <p>Using this information, you can determine cells that are safe, and cells that contain mines.</p>
                <p>Cells suspected of being mines can be marked with a flag using the right mouse button.</p>
            </div>

        </div>
    );
}