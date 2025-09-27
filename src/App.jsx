// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Game from "./pages/Game";
import Lobby from "./pages/Lobby";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Results from "./pages/Results";

function Navigation() {
  const location = useLocation();

  // ❌ Ocultar menú en login, registro y lobby
  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/lobby"
  ) {
    return null;
  }

  return (
    <nav>
      <Link to="/results">🏆 Results</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        {/* 🔑 Ruta raíz redirige al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;





