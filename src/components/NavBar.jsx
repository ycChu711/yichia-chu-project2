// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
    return (
        <div className="main-nav">
            <Link to="/" className="title">Minesweeper</Link>
            <div className="nav">
                <Link to="/">Home</Link>
                <Link to="/game">Game</Link>
                <Link to="/rules">Rules</Link>
            </div>
        </div>
    );
}