// src/services/amonestacionService.js

import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const crearAmonestacion = async ({
  idEmpleado,
  tipo,
  motivo,
  fechaAmonestacion,
  idDocumento,
  idUsuario,
}) => {
  try {
    const payload = {
      idempleado: Number(idEmpleado),
      tipo,
      motivo,
      fechaamonestacion: fechaAmonestacion,
      iddocumento: idDocumento,
      idusuario: Number(idUsuario),
      estado: true,
    };

    const response = await axios.post(`${API}/amonestaciones/`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error al crear la amonestación:", error.response || error);
    throw new Error(
      error.response?.data?.detail || "No se pudo crear la amonestación"
    );
  }
};
