// src/pages/Lobby.jsx
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Game from "./Game";
import "./Lobby.css"; // Estilos extra

// 🔌 Conexión única al servidor
const socket = io("http://localhost:4000");

export default function Lobby() {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [user, setUser] = useState({ username: "Invitado", userId: null });
  const [countdown, setCountdown] = useState(null); // ⏳ contador del lobby

  // 📡 Obtener salas disponibles
  const fetchGames = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/games");
      let data = await res.json();
      // 🔥 Solo mostrar salas activas
      data = data.filter(
        (g) =>
          g.players &&
          g.players.length > 0 &&
          g.status &&
          g.status !== "finished"
      );
      setGames(data);
    } catch (err) {
      console.error("❌ Error fetch games:", err);
    }
  };

  useEffect(() => {
    const username = localStorage.getItem("username") || "Invitado";
    const userId = localStorage.getItem("userId") || null;
    setUser({ username, userId });

    fetchGames();

    // 🎧 Escuchar eventos del servidor
    socket.on("roomsUpdated", fetchGames);

    socket.on("roomCreated", ({ gameId }) => setCurrentGame(gameId));
    socket.on("roomJoined", ({ gameId }) => setCurrentGame(gameId));

    // ⏳ Contador del lobby antes de iniciar
    socket.on("lobbyCountdown", (time) => {
      setCountdown(time);
    });

    // 🚀 El servidor arranca el juego
    socket.on("gameStarted", ({ gameId }) => {
      setCurrentGame(gameId);
    });

    // 🔄 Resetear al lobby cuando termine la partida
    socket.on("lobbyReset", () => {
      setCurrentGame(null);
      setCountdown(null);
      fetchGames(); // Refrescar lista de salas
    });

    return () => {
      socket.off("roomsUpdated");
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("lobbyCountdown");
      socket.off("gameStarted");
      socket.off("lobbyReset");
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("createRoom", {
      username: user.username,
      userId: user.userId,
    });
  };

  const handleJoinRoom = (gameId) => {
    socket.emit("joinRoom", {
      gameId,
      username: user.username,
      userId: user.userId,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center py-8">
      {!currentGame ? (
        <div className="w-full max-w-xl">
          {/* 🖼️ Imagen banner */}
          <img
            src="/trivia-banner.png"
            alt="Trivia Banner"
            className="banner mx-auto"
          />

          {/* ➕ Crear sala */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                         text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              ➕ Crear Sala
            </button>
          </div>

          {/* 🎮 Lista de salas */}
          <div className="mt-8 px-4">
            <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
              🎮 Salas disponibles
            </h2>

            {games.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                🙁 No hay salas disponibles todavía
              </p>
            ) : (
              <ul className="space-y-4">
                {games.map((game, idx) => (
                  <li
                    key={game._id}
                    className="flex items-center justify-between bg-white border rounded-xl px-5 py-3 
                               shadow-md hover:shadow-lg transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        Sala {idx + 1}
                      </p>
                      <p className="text-sm text-gray-500">
                        👥 {game.players.length}/{game.maxPlayers} •{" "}
                        {game.status === "waiting"
                          ? "Esperando jugadores"
                          : "En juego"}
                      </p>
                    </div>

                    {game.status === "waiting" && (
                      <button
                        onClick={() => handleJoinRoom(game._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm shadow-md"
                      >
                        Unirse
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ⏳ Mostrar contador si existe */}
          {countdown !== null && (
            <div className="mt-6 text-center">
              <p className="text-lg font-semibold text-gray-800">
                ⏳ El juego empieza en: {countdown} segundos
              </p>
            </div>
          )}
        </div>
      ) : (
        <Game
          socket={socket}
          gameId={currentGame}
          username={user.username}
          userId={user.userId}
          setCurrentGame={setCurrentGame} // ✅ necesario para volver al lobby
        />
      )}
    </div>
  );
}
