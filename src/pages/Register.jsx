import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password) {
      setError("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "❌ Error en el registro"); // ← cambio aquí
        return;
      }

      // ✅ Guardar usuario en localStorage
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem("username", data.user.username);

      // Redirigir al lobby
      navigate("/lobby");
    } catch (err) {
      console.error("Error registro:", err);
      setError("❌ No se pudo conectar al servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">📝 Registro</h1>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm mt-4">
  ¿Ya tienes cuenta?{" "}
  <button
    onClick={() => navigate("/login")}
    className="text-blue-600 hover:underline"
  >
    Inicia sesión
  </button>
</p>

      </div>
    </div>
  );
}