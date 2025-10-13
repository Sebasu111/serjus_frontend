import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

const AsignarCapacitacion = ({ capacitacionInicial = null, onClose }) => {
  const [empleados, setEmpleados] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(
    capacitacionInicial || ""
  );
  const [observacion, setObservacion] = useState("");

  // Fecha actual en formato dd-mm-yyyy
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    fetchEmpleados();
    fetchCapacitaciones();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
      setEmpleados(res.data.results || res.data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      showToast("Error al cargar empleados", "error");
    }
  };

  const fetchCapacitaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
      const activas = (res.data.results || res.data).filter(
        (c) => c.estado === true
      );
      setCapacitaciones(activas);
    } catch (error) {
      console.error("Error al cargar capacitaciones:", error);
      showToast("Error al cargar capacitaciones", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empleadoSeleccionado || !capacitacionSeleccionada) {
      showToast("Complete todos los campos obligatorios", "warning");
      return;
    }

    try {
      const idUsuario = sessionStorage.getItem("idUsuario") || 1;

      const payload = {
        idempleado: Number(empleadoSeleccionado),
        idcapacitacion: Number(capacitacionSeleccionada),
        observacion,
        fechaenvio: new Date().toISOString().split("T")[0],
        asistencia: "no",
        idusuario: Number(idUsuario),
        estado: true,
      };

      await axios.post(
        "http://127.0.0.1:8000/api/empleadocapacitacion/",
        payload
      );

      showToast("Capacitación asignada correctamente", "success");

      setEmpleadoSeleccionado("");
      setCapacitacionSeleccionada(capacitacionInicial || "");
      setObservacion("");
    } catch (error) {
      console.error(error);
      showToast("Error al asignar capacitación", "error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-15%, -50%)",
        width: "500px",
        maxWidth: "95%",
        background: "#fff",
        padding: "30px",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        borderRadius: "12px",
        zIndex: 1000,
      }}
    >
      {/* ✅ Toasts ahora en esquina superior derecha */}
      <ToastContainer position="top-right" autoClose={3000} />

      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Asignar Capacitación
      </h3>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <select
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Seleccione un empleado</option>
          {empleados.map((emp) => (
            <option
              key={emp.idempleado || emp.id}
              value={emp.idempleado || emp.id}
            >
              {emp.nombre}
            </option>
          ))}
        </select>

        <select
          value={capacitacionSeleccionada}
          onChange={(e) => setCapacitacionSeleccionada(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Seleccione una capacitación</option>
          {capacitaciones.map((cap) => (
            <option
              key={cap.idcapacitacion || cap.id}
              value={cap.idcapacitacion || cap.id}
            >
              {cap.nombreevento}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Observaciones"
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        <p>
          Fecha de envío: <strong>{fechaActual}</strong>
        </p>

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#fb8500",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Asignar
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: "10px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Cerrar
        </button>
      </form>
    </div>
  );
};

export default AsignarCapacitacion;
