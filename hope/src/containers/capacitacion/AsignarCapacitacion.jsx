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
        .filter(a => Number(a.idcapacitacion) === Number(idCapacitacion) && a.estado === true) // Solo activos
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

    if (!capacitacionSeleccionada) {
      setShowError(true);
      showToast("Debe seleccionar una capacitación", "warning");
      return;
    }

    setShowError(false);

    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario") || 1);

      // Obtener asignaciones existentes
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const asignacionesExistentes = res.data.results || res.data;

      // Filtrar asignaciones activas de esta capacitación
      const asignacionesActuales = asignacionesExistentes.filter(
        asig => Number(asig.idcapacitacion) === Number(capacitacionSeleccionada) && asig.estado === true
      );

      console.log("Asignaciones activas actuales:", asignacionesActuales);
      console.log("Empleados seleccionados:", empleadosSeleccionados);

      let operacionesRealizadas = 0;

      // 1. Desactivar asignaciones que ya no están seleccionadas
      for (const asignacion of asignacionesActuales) {
        const empleadoSigueSeleccionado = empleadosSeleccionados.includes(Number(asignacion.idempleado));

        if (!empleadoSigueSeleccionado) {
          try {
            const idAsignacion = asignacion.idempleadocapacitacion || asignacion.id;

            console.log("Desactivando asignación:", {
              idAsignacion,
              idempleado: asignacion.idempleado,
              idcapacitacion: asignacion.idcapacitacion
            });

            if (idAsignacion) {
              // Usar PUT para desactivar en lugar de DELETE
              const payload = {
                ...asignacion,
                estado: false,
                idusuario: idUsuario
              };

              await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${idAsignacion}/`, payload);
              operacionesRealizadas++;
              console.log(`Asignación ${idAsignacion} desactivada exitosamente`);
            }
          } catch (error) {
            console.error(`Error al desactivar asignación:`, error);
            console.error("Datos de la asignación que falló:", asignacion);
          }
        } else {
          console.log(`Empleado ${asignacion.idempleado} sigue seleccionado, no se desactiva`);
        }
      }

      // 2. Agregar nuevas asignaciones o reactivar existentes
      for (const idEmpleado of empleadosSeleccionados) {
        const asignacionExistente = asignacionesExistentes.find(
          asig => Number(asig.idempleado) === Number(idEmpleado) &&
            Number(asig.idcapacitacion) === Number(capacitacionSeleccionada)
        );

        if (asignacionExistente) {
          // Si existe pero está desactivada, reactivarla
          if (!asignacionExistente.estado) {
            try {
              const payload = {
                ...asignacionExistente,
                estado: true,
                idusuario: idUsuario
              };

              const idAsignacion = asignacionExistente.idempleadocapacitacion || asignacionExistente.id;
              await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${idAsignacion}/`, payload);
              operacionesRealizadas++;
              console.log(`Asignación ${idAsignacion} reactivada exitosamente`);
            } catch (error) {
              console.error("Error al reactivar asignación:", error);
            }
          }
          // Si existe y está activa, no hacer nada
        } else {
          // No existe, crear nueva asignación
          try {
            const payload = {
              idempleado: Number(idEmpleado),
              idcapacitacion: Number(capacitacionSeleccionada),
              fechaenvio: null,
              asistencia: "no",
              idusuario: idUsuario,
              estado: true
            };

            await axios.post("http://127.0.0.1:8000/api/empleadocapacitacion/", payload);
            operacionesRealizadas++;
            console.log(`Nueva asignación creada para empleado ${idEmpleado}`);
          } catch (error) {
            console.error("Error al crear asignación:", error);
          }
        }
      }

      // Mostrar mensaje según el resultado
      if (operacionesRealizadas > 0) {
        showToast("Asignaciones actualizadas correctamente", "success");
        // Cerrar el modal inmediatamente después del guardado exitoso
        onClose();
      } else if (empleadosSeleccionados.length === 0 && asignacionesActuales.length === 0) {
        showToast("No hay colaboradores asignados a esta capacitación", "info");
        // También cerrar inmediatamente en este caso
        onClose();
      } else {
        showToast("No se realizaron cambios", "info");
        // En este caso no cerrar porque no hubo cambios reales
      }

      // Refrescar colaboradores asignados
      fetchEmpleadosAsignados(capacitacionSeleccionada);
    } catch (error) {
      console.error(error);
      showToast("Error al actualizar asignaciones", "error");
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

        {/* Colaboradores seleccionados */}
        {empleadosSeleccionados.length > 0 && (
          <div style={{
            marginBottom: "20px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px"
            }}>
              <div style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: "400"
              }}>
                Colaboradores seleccionados ({empleadosSeleccionados.length}):
              </div>
              <button
                type="button"
                onClick={() => setEmpleadosSeleccionados([])}
                style={{
                  backgroundColor: "transparent",
                  color: "#6b7280",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "400",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.color = "#374151";
                  e.target.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#6b7280";
                  e.target.style.borderColor = "#d1d5db";
                }}
                title="Quitar todos los colaboradores"
              >
                Limpiar selección
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {empleadosSeleccionados.map(idEmpleado => {
                const empleado = empleados.find(emp => (emp.idempleado || emp.id) === idEmpleado);
                return empleado ? (
                  <span
                    key={idEmpleado}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#e1f5fe",
                      color: "#01579b",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "400",
                      border: "1px solid #b3e5fc"
                    }}
                  >
                    {empleado.nombre} {empleado.apellido}
                    <button
                      type="button"
                      onClick={() => toggleEmpleadoSeleccionado(idEmpleado)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#01579b",
                        cursor: "pointer",
                        padding: "0",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "normal",
                        lineHeight: "1"
                      }}
                      title="Quitar colaborador"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Colaboradores */}
        <div>
          <label style={{ display: "block", marginBottom: "6px" }}>
            Seleccione colaboradores
          </label>

          <div
            style={{
              border: `1px solid #ccc`,
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
          Guardar
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
