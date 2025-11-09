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

  const desasignarEmpleado = async (idEmpleado) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const asignaciones = res.data.results || res.data;

      const asignacion = asignaciones.find(
        asig =>
          Number(asig.idempleado) === Number(idEmpleado) &&
          Number(asig.idcapacitacion) === Number(capacitacionSeleccionada)
      );

      if (asignacion) {
        await axios.delete(`http://127.0.0.1:8000/api/empleadocapacitacion/${asignacion.id}/`);
        showToast("Colaborador desasignado correctamente", "success");

        // Actualizar la lista de empleados seleccionados
        setEmpleadosSeleccionados(prev => prev.filter(id => id !== idEmpleado));

        // Refrescar lista de asignados
        fetchEmpleadosAsignados(capacitacionSeleccionada);
      }
    } catch (error) {
      console.error("Error al desasignar colaborador:", error);
      showToast("Error al desasignar colaborador", "error");
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
      // Obtener la capacitación seleccionada para validar fechas
      const capacitacionActual = capacitaciones.find(cap =>
        Number(cap.idcapacitacion || cap.id) === Number(capacitacionSeleccionada)
      );

      if (!capacitacionActual) {
        showToast("Error: No se pudo encontrar la capacitación seleccionada", "error");
        return;
      }

      const idUsuario = Number(sessionStorage.getItem("idUsuario") || 1);
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const asignacionesExistentes = res.data.results || res.data;

      // Obtener todas las capacitaciones para validar conflictos
      const resCapacitaciones = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
      const todasCapacitaciones = resCapacitaciones.data.results || resCapacitaciones.data;

      let asignacionesRealizadas = 0;
      let conflictos = [];

      for (const idEmpleado of empleadosSeleccionados) {
        const yaAsignado = asignacionesExistentes.some(
          asig =>
            Number(asig.idempleado) === Number(idEmpleado) &&
            Number(asig.idcapacitacion) === Number(capacitacionSeleccionada)
        );

        if (yaAsignado) continue;

        // Validar conflictos de fechas para este empleado
        const asignacionesEmpleado = asignacionesExistentes.filter(
          asig => Number(asig.idempleado) === Number(idEmpleado)
        );

        const conflictosEmpleado = [];

        for (const asignacion of asignacionesEmpleado) {
          const capacitacionExistente = todasCapacitaciones.find(
            cap => Number(cap.idcapacitacion || cap.id) === Number(asignacion.idcapacitacion)
          );

          if (capacitacionExistente && capacitacionExistente.estado === true) {
            const fechaInicioExistente = new Date(capacitacionExistente.fechainicio);
            const fechaFinExistente = new Date(capacitacionExistente.fechafin);
            const fechaInicioNueva = new Date(capacitacionActual.fechainicio);
            const fechaFinNueva = new Date(capacitacionActual.fechafin);

            // Verificar si hay solapamiento de fechas
            const hayConflicto = (
              (fechaInicioNueva >= fechaInicioExistente && fechaInicioNueva <= fechaFinExistente) ||
              (fechaFinNueva >= fechaInicioExistente && fechaFinNueva <= fechaFinExistente) ||
              (fechaInicioExistente >= fechaInicioNueva && fechaInicioExistente <= fechaFinNueva)
            );

            if (hayConflicto) {
              conflictosEmpleado.push({
                empleadoId: idEmpleado,
                capacitacionConflicto: capacitacionExistente.nombreevento,
                fechas: `${fechaInicioExistente.toLocaleDateString()} - ${fechaFinExistente.toLocaleDateString()}`
              });
            }
          }
        }

        if (conflictosEmpleado.length > 0) {
          const empleado = empleados.find(emp => Number(emp.idempleado || emp.id) === Number(idEmpleado));
          conflictos.push({
            empleado: empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado desconocido',
            conflictos: conflictosEmpleado
          });
          continue; // No asignar este empleado
        }

        // Si no hay conflictos, proceder con la asignación
        const payload = {
          idempleado: Number(idEmpleado),
          idcapacitacion: Number(capacitacionSeleccionada),
          fechaenvio: null,
          asistencia: "no",
          idusuario: idUsuario,
          estado: true
        };

        await axios.post("http://127.0.0.1:8000/api/empleadocapacitacion/", payload);
        asignacionesRealizadas++;
      }

      // Mostrar resultados
      if (conflictos.length > 0) {
        let mensajeConflictos = "ADVERTENCIA - Conflictos de horarios detectados:\n\n";
        conflictos.forEach(conf => {
          mensajeConflictos += `• ${conf.empleado}:\n`;
          conf.conflictos.forEach(c => {
            mensajeConflictos += `  - Ya asignado a "${c.capacitacionConflicto}" (${c.fechas})\n`;
          });
          mensajeConflictos += "\n";
        });

        showToast(mensajeConflictos + "Estos colaboradores NO fueron asignados.", "warning");
      }

      if (asignacionesRealizadas > 0) {
        showToast(`${asignacionesRealizadas} colaborador(es) asignado(s) correctamente`, "success");
      } else if (conflictos.length === 0) {
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

        {/* Colaboradores ya asignados */}
        {capacitacionInicial && empleadosSeleccionados.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#2e7d32" }}>
              Colaboradores ya asignados:
            </label>
            <div style={{
              border: "1px solid #4caf50",
              borderRadius: "6px",
              backgroundColor: "#f1f8e9",
              padding: "10px",
              maxHeight: "120px",
              overflowY: "auto"
            }}>
              {empleadosSeleccionados.map(idEmpleado => {
                const empleado = empleados.find(emp => (emp.idempleado || emp.id) === idEmpleado);
                return empleado ? (
                  <div key={idEmpleado} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 8px",
                    margin: "2px 0",
                    backgroundColor: "#ffffff",
                    borderRadius: "4px",
                    border: "1px solid #c8e6c9"
                  }}>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                      {empleado.nombre} {empleado.apellido}
                    </span>
                    <button
                      type="button"
                      onClick={() => desasignarEmpleado(idEmpleado)}
                      style={{
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      Desasignar
                    </button>
                  </div>
                ) : null;
              })}
            </div>
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
          {capacitacionInicial ? "Guardar Cambios" : "Asignar"}
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
