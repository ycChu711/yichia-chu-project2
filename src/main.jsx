import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import HomePage from './components/HomePage.jsx';
import MineSweeperGamePage from './components/MineSweeperGamePage.jsx';
import RulesPage from './components/RulesPage.jsx';
import { MineSweeperProvider } from './context/MineSweeperContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/game',
    element: <Navigate to="/game/easy" replace />
  },
  {
    path: '/game/:level',
    element: (
      <MineSweeperProvider>
        <MineSweeperGamePage />
      </MineSweeperProvider>
    ),
  },
  {
    path: '/rules',
    element: <RulesPage />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);