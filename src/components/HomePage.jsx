import React from 'react';
import NavBar from './NavBar';
import './HomePage.css';

export default function HomePage() {
    return (
        <div className="home-page">
            <NavBar />
            <h1>Welcome to Minesweeper!</h1>
            <p>Click "Game" in the navigation to start playing!</p>
        </div>
    );
}