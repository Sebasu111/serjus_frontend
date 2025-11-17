import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

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
        "Content-Type": "application/json", Authorization: `Bearer ${token}`,
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
