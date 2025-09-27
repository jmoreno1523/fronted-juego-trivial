
const API_URL = "http://localhost:4000/api/questions";

export const getQuestions = async () => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener preguntas");
    return await res.json();
  } catch (error) {
    console.error("Error en getQuestions:", error);
    return [];
  }
};
