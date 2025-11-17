import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const Seguimiento = () => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 🔹 Usuario logueado
  const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado") || "{}");

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      const [resSeg, resSegVar, resUsers, resEmp, resEval] = await Promise.all([
        axios.get(`${API}/seguimientos/`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/seguimientovariable/`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/usuarios/`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/empleados/`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/evaluacion/`, {
            headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setSeguimientos(resSeg.data.results || resSeg.data || []);
      setAcciones(resSegVar.data.results || resSegVar.data || []);
      setUsuarios(resUsers.data.results || resUsers.data || []);
      setEmpleados(resEmp.data.results || resEmp.data || []);
      setEvaluaciones(resEval.data.results || resEval.data || []);
    } catch (err) {
      console.error("Error seguimiento:", err);
      showToast("Error al cargar seguimiento", "error");
    } finally {
      setCargando(false);
    }
  };

  const getNombreUsuario = (idUsuario) =>
    usuarios.find((u) => u.idusuario === idUsuario)?.nombreusuario || "N/D";

  const getIdEmpleadoByEvaluacion = (idEvaluacion) =>
    evaluaciones.find((e) => e.idevaluacion === idEvaluacion)?.idempleado || null;

  const getNombreEmpleado = (idEvaluacion) => {
    const empId = getIdEmpleadoByEvaluacion(idEvaluacion);
    const emp = empleados.find((p) => p.idempleado === empId);
    return emp ? `${emp.nombre} ${emp.apellido}` : "N/D";
  };

  const accionesDeSeguimiento = (id) =>
    acciones.filter((a) => a.idseguimiento === id && a.estado !== false);

  /* ================== PERMISOS ================== */
  const puedeEditar = (seg) => seg.idresponsable === usuarioLogueado.idusuario;
  const puedeVer = (seg) => {
    const idEmpleado = getIdEmpleadoByEvaluacion(seg.idevaluacion);
    return (
      seg.idresponsable === usuarioLogueado.idusuario || // Responsable
      usuarioLogueado.idempleado === idEmpleado // Dueño del seguimiento
    );
  };

  /* ============= ACTUALIZAR FECHA ============= */
  const actualizarFecha = async (seg, nuevaFecha) => {
    if (!puedeEditar(seg)) return;

    const payload = { ...seg, fechaproximarev: nuevaFecha };
    try {
      await axios.put(`${API}/seguimientos/${seg.idseguimiento}/`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
      await cargarTodo();
      showToast("Fecha actualizada", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar fecha", "error");
    }
  };

  /* ============= COMPLETAR ACCION ============= */
  const completarAccion = async (accion) => {
    const seg = seguimientos.find((s) => s.idseguimiento === accion.idseguimiento);
    if (!puedeEditar(seg)) return;

    const payload = { ...accion, estado: false };
    try {
      await axios.put(`${API}/seguimientovariable/${accion.idseguimientovariable}/`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
      setAcciones((prev) =>
        prev.filter((a) => a.idseguimientovariable !== accion.idseguimientovariable)
      );
      showToast("✔ Acción completada", "success");

      if (accionesDeSeguimiento(accion.idseguimiento).length - 1 === 0) {
        await finalizarSeguimiento(accion.idseguimiento);
      }
    } catch (err) {
      console.error(err);
      showToast("Error al completar acción", "error");
    }
  };

  /* ============= FINALIZAR ============= */
  const finalizarSeguimiento = async (idSeguimiento) => {
    const seg = seguimientos.find((s) => s.idseguimiento === idSeguimiento);
    if (!seg || !puedeEditar(seg)) return;

    const payload = { ...seg, estado: false };
    try {
      await axios.put(`${API}/seguimientos/${idSeguimiento}/`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
      await cargarTodo();
      showToast("Seguimiento finalizado", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al finalizar", "error");
    }
  };

  if (cargando)
    return <p style={{ padding: 20, fontSize: 18, textAlign: "center" }}>Cargando seguimiento...</p>;

  /* 🔥 Filtrar solo los que puede ver el usuario */
  const seguimientosVisibles = seguimientos.filter(
    (s) => s.estado !== false && puedeVer(s)
  );

  return (
    <div style={{ padding: "30px 40px" }}>
      <h2 style={tituloPrincipal}>Seguimiento de Planes de Mejora</h2>

      {seguimientosVisibles.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 18, color: "#666" }}>
          No tienes seguimientos activos.
        </p>
      ) : (
        <div style={gridCards}>
          {seguimientosVisibles.map((seg) => (
            <div key={seg.idseguimiento} style={card}>
              <h3 style={empleadoTitulo}>{getNombreEmpleado(seg.idevaluacion)}</h3>

              <div style={infoRow}>
                <span style={label}>Responsable:</span>
                <span style={valor}>{getNombreUsuario(seg.idresponsable)}</span>
              </div>

              {/* Fecha de revisión */}
              <div style={infoRow}>
                <span style={label}>Próxima revisión:</span>
                {puedeEditar(seg) ? (
                  <input
                    type="date"
                    defaultValue={seg.fechaproximarev.split("T")[0]}
                    onChange={(e) => actualizarFecha(seg, e.target.value)}
                    style={inputDate}
                  />
                ) : (
                  <span style={valor}>{seg.fechaproximarev.split("T")[0]}</span>
                )}
              </div>

              {/* Lista de Acciones */}
              <div style={{ marginTop: 18 }}>
                <span style={label}>Acciones de mejora:</span>
                <div style={{ marginTop: 10 }}>
                  {accionesDeSeguimiento(seg.idseguimiento).length === 0 ? (
                    <i style={{ color: "#777" }}>(Sin acciones pendientes)</i>
                  ) : (
                    accionesDeSeguimiento(seg.idseguimiento).map((a) => (
                      <div key={a.idseguimientovariable} style={accionChip}>
                        <span>{a.accionmejora}</span>

                        {puedeEditar(seg) && (
                          <button
                            onClick={() => completarAccion(a)}
                            style={checkBtn}
                            title="Marcar como completada"
                          >
                            ✔
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* 🎨 Estilos */
const tituloPrincipal = {
  fontSize: 30,
  color: "#023047",
  marginBottom: 25,
  fontWeight: 700,
  textAlign: "center",
};

const gridCards = {
  display: "grid",
  gap: 25,
  gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))",
};

const card = {
  background: "white",
  borderRadius: 12,
  padding: "22px 25px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
  borderLeft: "6px solid #1E88E5",
};

const empleadoTitulo = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 18,
  color: "#0D1B2A",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 12,
};

const label = {
  fontWeight: 600,
  color: "#374151",
};

const valor = {
  color: "#111827",
};

const inputDate = {
  padding: "6px 10px",
  fontSize: 14,
  borderRadius: 6,
  border: "1px solid #9ca3af",
  cursor: "pointer",
};

const accionChip = {
  backgroundColor: "#e3f2fd",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 14,
  marginBottom: 8,
  color: "#0d47a1",
  fontWeight: 500,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #bbdefb",
};

const checkBtn = {
  background: "#C8E6C9",
  border: "2px solid #4CAF50",
  color: "#1B5E20",
  fontSize: 16,
  width: 32,
  height: 32,
  borderRadius: 6,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "700",
  transition: "0.25s",
};

export default Seguimiento;
