
// src/services/socket.js
import { io } from "socket.io-client";

// ⚠️ Ajusta la URL si tu backend está en otro puerto/host
const socket = io("http://localhost:4000", {
  transports: ["websocket"], // fuerza websocket (opcional, evita polling)
  reconnection: true,
});

export default socket;
