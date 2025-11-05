import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
import { X } from "lucide-react";

const AsignarCapacitacion = ({ capacitacionInicial = null, onClose }) => {
  const [empleados, setEmpleados] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(
    capacitacionInicial ? (capacitacionInicial.idcapacitacion || capacitacionInicial.id) : ""
  );
  const [showError, setShowError] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchEmpleados();
    fetchCapacitaciones();
    if (capacitacionInicial) {
      fetchEmpleadosAsignados(capacitacionInicial.idcapacitacion || capacitacionInicial.id);
    }
  }, []);

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
      setEmpleados(res.data.results || res.data);
    } catch (error) {
      console.error("Error al cargar colaboradores:", error);
      showToast("Error al cargar colaboradores", "error");
    }
  };

  const fetchCapacitaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
      const activas = (res.data.results || res.data).filter(c => c.estado === true);
      setCapacitaciones(activas);
    } catch (error) {
      console.error("Error al cargar capacitaciones:", error);
      showToast("Error al cargar capacitaciones", "error");
    }
  };

  const fetchEmpleadosAsignados = async (idCapacitacion) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const asignaciones = res.data.results || res.data;
      const empleadosIdsAsignados = asignaciones
        .filter(a => Number(a.idcapacitacion) === Number(idCapacitacion))
        .map(a => Number(a.idempleado));
      setEmpleadosSeleccionados(empleadosIdsAsignados);
    } catch (error) {
      console.error("Error al cargar colaboradores asignados:", error);
    }
  };

  const toggleEmpleadoSeleccionado = id => {
    setEmpleadosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!capacitacionSeleccionada || !empleadosSeleccionados.length) {
      setShowError(true);
      showToast("Complete todos los campos obligatorios", "warning");
      return;
    }

    setShowError(false);

    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario") || 1);
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const asignacionesExistentes = res.data.results || res.data;

      let asignacionesRealizadas = 0;

      for (const idEmpleado of empleadosSeleccionados) {
        const yaAsignado = asignacionesExistentes.some(
          asig =>
            Number(asig.idempleado) === Number(idEmpleado) &&
            Number(asig.idcapacitacion) === Number(capacitacionSeleccionada)
        );

        if (yaAsignado) continue;

        const payload = {
          idempleado: Number(idEmpleado),
          idcapacitacion: Number(capacitacionSeleccionada),
          fechaenvio: null, // <-- enviamos null en lugar de la fecha actual
          asistencia: "no",
          idusuario: idUsuario,
          estado: true
        };

        await axios.post("http://127.0.0.1:8000/api/empleadocapacitacion/", payload);
        asignacionesRealizadas++;
      }

      if (asignacionesRealizadas > 0) {
        showToast("Colaboradores asignados correctamente", "success");
      } else {
        showToast("No se realizó ninguna asignación nueva", "info");
      }

      // Refrescar colaboradores asignados
      fetchEmpleadosAsignados(capacitacionSeleccionada);
    } catch (error) {
      console.error(error);
      showToast("Error al asignar colaboradores", "error");
    }
  };

  const empleadosFiltrados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellido}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

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
        display: "flex",
        flexDirection: "column"
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Asignar Colaboradores</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Capacitación */}
        {capacitacionInicial ? (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#e3f2fd",
              border: "1px solid #2196f3",
              borderRadius: "6px",
              marginBottom: "10px"
            }}
          >
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#1976d2" }}>
              Capacitación seleccionada:
            </label>
            <div style={{ fontSize: "16px", color: "#0d47a1" }}>
              {capacitacionInicial.nombreevento}
            </div>
          </div>
        ) : (
          <div>
            <label style={{ display: "block", marginBottom: "6px" }}>
              Seleccione una capacitación <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={capacitacionSeleccionada}
              onChange={e => setCapacitacionSeleccionada(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="">Seleccione una capacitación</option>
              {capacitaciones.map(cap => (
                <option key={cap.idcapacitacion || cap.id} value={cap.idcapacitacion || cap.id}>
                  {cap.nombreevento}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Colaboradores */}
        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Seleccione colaboradores <span style={{ color: "red" }}>*</span>
          </label>

          <div
            style={{
              border: `1px solid ${empleadosSeleccionados.length === 0 && showError ? "red" : "#ccc"}`,
              borderRadius: "6px",
              backgroundColor: "#f9fafb"
            }}
          >
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderBottom: "1px solid #e5e5e5",
                borderRadius: "6px 6px 0 0",
                outline: "none",
                backgroundColor: "#fff"
              }}
            />

            <div style={{ maxHeight: "150px", overflowY: "auto", padding: "8px" }}>
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map(emp => (
                  <label
                    key={emp.idempleado || emp.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 6px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "background-color 0.2s",
                      backgroundColor: empleadosSeleccionados.includes(emp.idempleado || emp.id)
                        ? "#e3f2fd" : "transparent"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={empleadosSeleccionados.includes(emp.idempleado || emp.id)}
                      onChange={() => toggleEmpleadoSeleccionado(emp.idempleado || emp.id)}
                      style={{ width: "16px", height: "16px", accentColor: "#2196f3" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: empleadosSeleccionados.includes(emp.idempleado || emp.id) ? "500" : "normal" }}>
                      {emp.nombre} {emp.apellido}
                    </span>
                  </label>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "14px" }}>
                  {busqueda ? "No se encontraron colaboradores con ese nombre" : "No hay colaboradores disponibles"}
                </div>
              )}
            </div>
          </div>

          {empleadosSeleccionados.length > 0 && (
            <div style={{
              marginTop: "8px",
              padding: "6px 8px",
              backgroundColor: "#e8f5e8",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#2e7d32"
            }}>
              {empleadosSeleccionados.length} colaborador{empleadosSeleccionados.length > 1 ? "es" : ""} seleccionado{empleadosSeleccionados.length > 1 ? "s" : ""}
            </div>
          )}

          {empleadosSeleccionados.length === 0 && showError && (
            <span style={{ color: "red", fontSize: "12px", marginTop: "4px", display: "block" }}>
              Debe seleccionar al menos un colaborador
            </span>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Asignar
        </button>

        <button
          onClick={onClose}
          style={{ position: "absolute", top: "10px", right: "15px", background: "transparent", border: "none", cursor: "pointer" }}
          title="Cerrar"
          type="button"
        >
          <X size={24} color="#555" />
        </button>
      </form>
    </div>
  );
};

export default AsignarCapacitacion;
