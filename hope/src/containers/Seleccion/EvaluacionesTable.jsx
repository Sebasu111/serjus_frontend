import React, { useEffect, useState, useRef } from "react";
import { showToast } from "../../utils/toast";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal"; // ✅ Importa el modal

const API = process.env.REACT_APP_API_URL;

const EvaluacionesTable = ({ setEvaluacionSeleccionada }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina] = useState(10);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [evaluacionAEliminar, setEvaluacionAEliminar] = useState(null);
  const containerRef = useRef(null);

  // 🔹 Cargar evaluaciones
  useEffect(() => {
  const cargarEvaluaciones = async () => {
    setCargando(true);
    try {
      const evalRes = await fetch(`${API}/evaluacion/`);
      const evalData = (await evalRes.json()).results || [];

      const [postRes, convRes] = await Promise.all([
        fetch(`${API}/postulaciones/`),
        fetch(`${API}/convocatorias/`)
      ]);

      const postulaciones = (await postRes.json()).results || [];
      const convocatorias = (await convRes.json()).results || [];

      const enriquecidas = evalData.map((ev) => {
        const post = postulaciones.find(
          (p) => p.idpostulacion === ev.idpostulacion
        );
        const conv = post
          ? convocatorias.find((c) => c.idconvocatoria === post.idconvocatoria)
          : null;

        return {
          ...ev,
          nombreconvocatoria: conv ? conv.nombreconvocatoria : "—",

          // 🔹 Guardamos fecha cruda PARA ORDENAR
          fechaRaw: ev.fechaevaluacion ? new Date(ev.fechaevaluacion) : null,

          // 🔹 Formateada SOLO PARA MOSTRAR
          fechaevaluacion: ev.fechaevaluacion
            ? new Date(ev.fechaevaluacion).toLocaleDateString("es-GT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })
            : "—"
        };
      });

      // 🔹 Filtro
      const filtradas = enriquecidas.filter(
        (e) =>
          e.modalidad === "Entrevista" &&
          e.idpostulacion !== null &&
          e.idpostulacion !== undefined
      );

      const activas = filtradas.filter((e) => e.estado !== false);

      // 🔹 ORDENAR CORRECTO (descendente)
      const ordenadas = [...activas].sort((a, b) => {
        return (b.fechaRaw || 0) - (a.fechaRaw || 0);
      });

      setEvaluaciones(ordenadas);
    } catch (err) {
      console.error("Error cargando evaluaciones:", err);
      showToast("Error cargando evaluaciones guardadas.", "error");
    } finally {
      setCargando(false);
    }
  };

  cargarEvaluaciones();
}, []);

  // 🔹 PUT → marcar como inactivo y eliminar de la lista
  const eliminarEvaluacion = async (id) => {
  try {
    const evaluacion = evaluaciones.find((e) => e.idevaluacion === id);
    if (!evaluacion) throw new Error("Evaluación no encontrada");

    // ✅ Usar la fecha cruda (Date) que guardaste en fechaRaw
    let fechaIso;
    if (evaluacion.fechaRaw instanceof Date && !isNaN(evaluacion.fechaRaw)) {
      fechaIso = evaluacion.fechaRaw.toISOString();
    } else if (
      evaluacion.fechaevaluacion &&
      !isNaN(new Date(evaluacion.fechaevaluacion))
    ) {
      // fallback por si acaso
      fechaIso = new Date(evaluacion.fechaevaluacion).toISOString();
    } else {
      // último recurso: ahora mismo
      fechaIso = new Date().toISOString();
    }

    const payload = {
      modalidad: evaluacion.modalidad || "Presencial",
      fechaevaluacion: fechaIso,
      puntajetotal: Number(evaluacion.puntajetotal) || 0,
      observacion: evaluacion.observacion || "Sin observaciones",
      estado: false,
      idusuario: evaluacion.idusuario || 1,
      idempleado: null,
      idpostulacion: evaluacion.idpostulacion || 0,
    };

    const res = await fetch(`${API}/evaluacion/${id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Respuesta del servidor:", text);
      throw new Error("Error al actualizar evaluación");
    }

    showToast("Evaluación eliminada.", "success");
    setEvaluaciones((prev) => prev.filter((e) => e.idevaluacion !== id));
  } catch (err) {
    console.error(err);
    showToast("Error eliminando evaluación.", "error");
  }
};


  // 🔹 Mostrar menú flotante
  const handleAbrirMenu = (event, id) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.left,
    });
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  // 🔹 Cerrar menú clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) setMenuAbierto(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div style={{ padding: "20px" }} ref={containerRef}>
      <h2 style={{ color: "#023047", marginBottom: "16px" }}>
        Evaluaciones Guardadas
      </h2>

      {/* Buscador */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Buscar por convocatoria..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Tabla */}
      <div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          <thead style={{ backgroundColor: "#023047", color: "#fff" }}>
            <tr>
              <th style={{ padding: "10px", textAlign: "left" }}>Convocatoria</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Fecha</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Estado</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  Cargando evaluaciones...
                </td>
              </tr>
            ) : evaluaciones.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  No se encontraron evaluaciones guardadas.
                </td>
              </tr>
            ) : (
              evaluaciones.map((ev) => (
                <tr
                  key={ev.idevaluacion}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: ev.estado ? "#fff" : "#f8d7da60",
                  }}
                >
                  <td style={{ padding: "10px" }}>{ev.nombreconvocatoria}</td>
                  <td style={{ padding: "10px" }}>{ev.fechaevaluacion}</td>
                  <td
                    style={{
                      padding: "10px",
                      color: ev.estado ? "#2a9d8f" : "#d62828",
                      fontWeight: 600,
                    }}
                  >
                    {ev.estado ? "Activa" : "Inactiva"}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    <div style={comboBoxStyles.container}>
                      <button
                        style={comboBoxStyles.button.base}
                        onClick={(e) => handleAbrirMenu(e, ev.idevaluacion)}
                      >
                        Opciones ▾
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Menú flotante */}
      {menuAbierto && (
        <div
          style={{
            ...comboBoxStyles.menu.container,
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            width: comboBoxStyles.container.width,
          }}
        >
          {/* Cargar evaluación */}
          <div
            style={comboBoxStyles.menu.item.editar.base}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                comboBoxStyles.menu.item.editar.hover.background)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                comboBoxStyles.menu.item.editar.base.background)
            }
            onClick={() => {
              const ev = evaluaciones.find(
                (x) => x.idevaluacion === menuAbierto
              );
              if (!ev.estado) {
                showToast("No se puede cargar una evaluación inactiva.", "warning");
                return;
              }
              setEvaluacionSeleccionada(ev.idevaluacion);
              showToast(
                "Evaluación cargada. Cambie a la pestaña 'Realizar Evaluación'.",
                "info"
              );
              setMenuAbierto(null);
            }}
          >
            Cargar evaluación
          </div>

          {/* Eliminar (PUT -> inactivo) */}
          <div
            style={comboBoxStyles.menu.item.desactivar.base}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                comboBoxStyles.menu.item.desactivar.hover.background)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                comboBoxStyles.menu.item.desactivar.base.background)
            }
            onClick={() => {
              setEvaluacionAEliminar(menuAbierto);
              setModalVisible(true);
              setMenuAbierto(null);
            }}
          >
            Eliminar
          </div>
        </div>
      )}

      {/* ✅ Modal de confirmación */}
      <ConfirmModal
        visible={modalVisible}
        mensaje="¿Desea eliminar esta evaluación?"
        onCancel={() => setModalVisible(false)}
        onConfirm={() => {
          eliminarEvaluacion(evaluacionAEliminar);
          setModalVisible(false);
        }}
      />
    </div>
  );
};

export default EvaluacionesTable;