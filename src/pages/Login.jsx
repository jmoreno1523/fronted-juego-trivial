import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // 🎨 Importamos los estilos

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "❌ Error en login");
        return;
      }

      // ✅ Guardar usuario en localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userId", data.user._id);

      // Redirigir al lobby
      navigate("/lobby");
    } catch (err) {
      console.error("Error login:", err);
      setError("❌ No se pudo conectar al servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🔑 Login</h1>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Entrar al juego</button>
        </form>

        <p className="login-register">
          ¿No tienes cuenta?{" "}
          <button onClick={() => navigate("/register")}>Regístrate aquí</button>
        </p>
      </div>
    </div>
  );
}
