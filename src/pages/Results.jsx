// src/pages/Results.jsx
import { useEffect, useState } from "react";

export default function Results() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/games");
        const data = await res.json();
        // buscar la última partida terminada
        const finished = data.filter(g => g.status === "finished");
        const latest = finished.length ? finished[finished.length - 1] : null;
        setResults(latest);
      } catch (err) {
        console.error("Error fetch results:", err);
      }
    };
    fetchResults();
  }, []);

  if (!results) return <p>Cargando resultados...</p>;

  return (
    <div>
      <h1>{results.winnerId ? "Ganador: " + results.winnerId : "No hay ganador aún"}</h1>
      <ul>
        {results.players.map((p, i) => (
          <li key={i}>{p.username} - {p.status}</li>
        ))}
      </ul>
      <button onClick={() => window.location.href = "/lobby"}>Volver al Lobby</button>
    </div>
  );
}
