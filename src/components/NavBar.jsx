// src/components/NavBar.jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
    return (
        <div className="main-nav">
            <Link to="/" className="title">Minesweeper</Link>
            <div className="nav">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/game">Game</NavLink>
                <NavLink to="/rules">Rules</NavLink>
            </div>
        </div>
    );
}