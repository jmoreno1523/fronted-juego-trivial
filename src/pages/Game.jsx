// src/pages/Game.jsx
import { useEffect, useState } from "react";
import "./Game.css";

export default function Game({ socket, gameId, username, userId, setCurrentGame }) {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [alive, setAlive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);
  const [answered, setAnswered] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roundSummary, setRoundSummary] = useState(null);
  const [lobbyCountdown, setLobbyCountdown] = useState(null);

  const playerId = userId || socket.id;

  useEffect(() => {
    // 📌 Quitamos el joinRoom duplicado
    // socket.emit("joinRoom", { gameId, username, userId: playerId });

    // --- Eventos ---
    socket.on("roundResult", ({ correctPlayers, eliminatedPlayers }) => {
      setRoundSummary({ correctPlayers, eliminatedPlayers });
      setQuestion(null);
      setFeedback("");
      setAnswered(false);
      setTimeout(() => setRoundSummary(null), 3000);
    });

    socket.on("newQuestion", (q) => {
      setQuestion(q);
      setTimeLeft(q?.timeLimit || 10);
      setFeedback("");
      setAnswered(false);
    });

    socket.on("answerResult", ({ correct, message }) => {
      setFeedback(message || (correct ? "✅ Correcto" : "❌ Incorrecto"));
      setAnswered(true);
    });

    socket.on("updatePlayers", (playersList) => {
      setPlayers(playersList);
      const me = playersList.find(
        (p) => (p.userId && String(p.userId) === String(playerId)) || p.socketId === playerId
      );
      if (me) setAlive(me.status === "alive");
    });

    socket.on("gameOver", ({ winner, eliminated, players }) => {
      setGameResult({ winner, eliminated, players });
      setQuestion(null);
      setRoundSummary(null);
      setFeedback("");
    });

    socket.on("roomJoined", ({ game }) => {
      if (game?.status === "in_progress") {
        const q = game.questions?.[game.currentQuestion];
        if (q) {
          setQuestion({
            index: q.index ?? game.currentQuestion,
            text: q.text,
            options: q.options,
            timeLimit: q.timeLimit ?? 10,
          });
        }
      }
      if (game?.players) setPlayers(game.players);
    });

    socket.on("lobbyCountdown", (time) => {
      setLobbyCountdown(time);
    });

    socket.on("lobbyReset", () => {
      setCurrentGame(null);
      setGameResult(null);
      setQuestion(null);
    });

    return () => {
      socket.off("roundResult");
      socket.off("newQuestion");
      socket.off("answerResult");
      socket.off("updatePlayers");
      socket.off("gameOver");
      socket.off("roomJoined");
      socket.off("lobbyCountdown");
      socket.off("lobbyReset");
    };
  }, [gameId, socket, username, playerId, setCurrentGame]);

  // Cronómetro
  useEffect(() => {
    if (!question || !alive || answered) return;
    setTimeLeft(question.timeLimit || 10);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [question, alive, answered]);

  const handleAnswer = (optionIndex) => {
    if (!alive || answered || !question) return;
    setAnswered(true);
    socket.emit("answer", {
      gameId,
      questionIndex: question.index,
      answer: optionIndex,
      username,
      userId: playerId,
    });
  };

  const handleTimeout = () => {
    if (!alive || answered || !question) return;
    setAnswered(true);
    socket.emit("answer", {
      gameId,
      questionIndex: question.index,
      answer: -1,
      username,
      userId: playerId,
    });
    setFeedback("⏰ Tiempo agotado...");
  };

  // --- UI ---
  if (gameResult) {
    return (
      <div className="results-outer">
        <div className="results-card">
          <h2 className="results-title">🏆 Resultado Final</h2>
          {gameResult?.winner ? (
            <p className="winner">🥇 Ganador: {gameResult?.winner?.name || "Desconocido"}</p>
          ) : (
            <p className="eliminated">El juego terminó sin ganador</p>
          )}

          <div className="results-section">
            <h3>🚫 Eliminados</h3>
            <ul className="results-list">
              {(gameResult?.eliminated || []).map((p, i) => (
                <li key={p?._id || p?.userId || i}>❌ {p?.name || "Jugador"}</li>
              ))}
            </ul>
          </div>

          <div className="results-section">
            <h3>👥 Estado final</h3>
            <ul className="results-list">
              {(gameResult?.players || []).map((p, i) => (
                <li
                  key={p?._id || p?.userId || i}
                  className={p?.status === "alive" ? "winner" : "eliminated"}
                >
                  {p?.name || "Jugador"} — {p?.status}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setCurrentGame(null)}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition"
          >
            🔄 Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!question && lobbyCountdown !== null) {
    return (
      <div className="game-root">
        <h2 className="game-title">🎮 Preparando partida...</h2>
        <p className="question-text">
          🚀 La partida comienza en <strong>{lobbyCountdown}</strong> segundos
        </p>
        <ul className="player-list">
          {players.map((p, i) => (
            <li
              key={p._id || p.userId || i}
              className={p.status === "alive" ? "alive" : "eliminated"}
            >
              {p.name} — {p.status}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="game-root">
        <p className="question-text">⏳ Esperando la siguiente pregunta...</p>
        <ul className="player-list">
          {players.map((p, i) => (
            <li
              key={p._id || p.userId || i}
              className={p.status === "alive" ? "alive" : "eliminated"}
            >
              {p.name} — {p.status}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="game-root">
      <div className="game-card">
        <h2 className="game-title">❓ Pregunta {question.index + 1}</h2>
        <p className="question-text">{question.text}</p>

        <div className="options-list">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={`option-button ${answered ? "disabled" : ""}`}
              onClick={() => handleAnswer(i)}
              disabled={answered}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="timer-wrap">
          <div className="timer-track">
            <div
              className="timer-fill"
              style={{
                width: `${(timeLeft / (question.timeLimit || 15)) * 100}%`,
              }}
            />
          </div>
          <p className="time-text">⏰ Tiempo restante: {timeLeft}s</p>
        </div>

        {feedback && (
          <p
            className={`feedback ${
              feedback.includes("Correcto")
                ? "correct"
                : feedback.includes("Incorrecto")
                ? "wrong"
                : "info"
            }`}
          >
            {feedback}
          </p>
        )}

        {!alive && (
          <p className="feedback wrong mt-4">
            ⚠️ Has sido eliminado. Espera el resultado final.
          </p>
        )}

        <ul className="player-list">
          {players.map((p, i) => (
            <li
              key={p._id || p.userId || i}
              className={p.status === "alive" ? "alive" : "eliminated"}
            >
              {p.name} — {p.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
