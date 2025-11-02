import React, { useState, useEffect, useMemo } from "react";
import ModalDetalle from "./ModalDetalle";
import ModalEliminarAspirante from "./ModalEliminar";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import { showToast } from "../../utils/toast";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import ConfirmModal from "./ConfirmModal";
import axios from "axios";

const thStyle = { borderBottom: "2px solid #eee", padding: 12, textAlign: "left", fontSize: 15 };
const tdStyle = { padding: 12, borderBottom: "1px solid #f0f0f0", fontSize: 15 };
const API = "http://127.0.0.1:8000/api";

const PostulacionesTable = ({
  postulaciones,
  aspirantes,
  convocatorias,
  setPostulaciones,
  paginaActual,
  setPaginaActual,
  elementosPorPagina = 5,
  ocultarEstado = false,
}) => {
  const [modalAspirante, setModalAspirante] = useState(null);
  const [openCombo, setOpenCombo] = useState(null);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState("");
  const [showConfirmSeleccion, setShowConfirmSeleccion] = useState(false);
  const [postulacionParaSeleccionar, setPostulacionParaSeleccionar] = useState(null);

  // 🔹 Seleccionar automáticamente la primera convocatoria activa
  useEffect(() => {
    if (convocatorias.length > 0 && !convocatoriaSeleccionada) {
      const primeraActiva = convocatorias.find((c) => c.estado);
      if (primeraActiva) setConvocatoriaSeleccionada(primeraActiva.idconvocatoria);
    }
  }, [convocatorias, convocatoriaSeleccionada]);

  // 🔹 Filtrar postulaciones según convocatoria seleccionada
  const postulacionesFiltradas = useMemo(() => {
    if (!convocatoriaSeleccionada) return postulaciones;
    return postulaciones.filter(
      (p) => String(p.idconvocatoria) === String(convocatoriaSeleccionada)
    );
  }, [postulaciones, convocatoriaSeleccionada]);

  const handleSeleccionarClick = (postulacion) => {
    const seleccionadasMismaConv = postulaciones.filter(
      (p) => p.idconvocatoria === postulacion.idconvocatoria && p.idestado === 2
    );

    if (seleccionadasMismaConv.length >= 3) {
      showToast(
        "Ya hay 3 postulaciones seleccionadas para esta convocatoria. No se puede aceptar más.",
        "warning"
      );
      return;
    }

    setPostulacionParaSeleccionar(postulacion);
    setShowConfirmSeleccion(true);
  };

  const confirmarSeleccion = async () => {
    setShowConfirmSeleccion(false);

    try {
      const idSel = postulacionParaSeleccionar.idpostulacion;
      const idAspirante = postulacionParaSeleccionar.idaspirante;

      // Preparar PUT para la postulación seleccionada
      await axios.put(`${API}/postulaciones/${idSel}/`, {
        ...postulacionParaSeleccionar,
        idestado: 2, // Seleccionada
      });

      // Preparar PUT para las demás postulaciones del mismo aspirante
      const otras = postulaciones.filter(
        (p) => p.idaspirante === idAspirante && p.idpostulacion !== idSel
      );

      await Promise.all(
        otras.map((p) =>
          axios.put(`${API}/postulaciones/${p.idpostulacion}/`, {
            ...p,
            idestado: 3, // Rechazadas
          })
        )
      );

      // Actualizar estado local
      const updated = postulaciones.map((p) => {
        if (p.idpostulacion === idSel) return { ...p, idestado: 2 };
        if (p.idaspirante === idAspirante && p.idpostulacion !== idSel)
          return { ...p, idestado: 3 };
        return p;
      });

      setPostulaciones(updated);
      showToast("Postulación seleccionada correctamente", "success");
      setPostulacionParaSeleccionar(null);
    } catch (err) {
      console.error(err);
      showToast("Error al seleccionar la postulación", "error");
    }
  };

  // 🔹 Paginación
  const totalPaginas = Math.max(1, Math.ceil(postulacionesFiltradas.length / elementosPorPagina));
  const start = (paginaActual - 1) * elementosPorPagina;
  const displayed = postulacionesFiltradas.slice(start, start + elementosPorPagina);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const toggleMenu = (idPostulacion) =>
    setOpenCombo((prev) => (prev === idPostulacion ? null : idPostulacion));

  const eliminarPostulacion = (id) => {
    setPostulaciones((prev) => prev.filter((p) => p.idpostulacion !== id));
    setMostrarModalEliminar(false);
    showToast("Postulación eliminada", "success");
  };

  const obtenerCV = (idaspirante) => {
    const aspirante = aspirantes.find((a) => a.idaspirante === idaspirante);
    if (aspirante?.cvs?.length) {
      window.open(aspirante.cvs[0].archivo, "_blank");
    } else {
      showToast("Este aspirante no tiene CV cargado.", "warning");
    }
  };

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* 🔹 Filtro por convocatoria */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Filtrar por convocatoria:</label>
          <select
            value={convocatoriaSeleccionada}
            onChange={(e) => {
              setConvocatoriaSeleccionada(e.target.value);
              setPaginaActual(1); // Resetear a la primera página al cambiar convocatoria
            }}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              minWidth: 250,
            }}
          >
            {convocatorias.map((c) => (
              <option key={c.idconvocatoria} value={c.idconvocatoria}>
                {c.nombreconvocatoria}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Fecha", "Aspirante", "Convocatoria", "Puesto", "Estado", "Observación", "Acciones"].map(
                  (h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {displayed.length ? (
                displayed.map((p) => {
                  const aspirante = aspirantes.find((a) => a.idaspirante === p.idaspirante);
                  const convocatoria = convocatorias.find((c) => c.idconvocatoria === p.idconvocatoria);
                  const estadoColor =
                    p.idestado === 2 ? "green" : p.idestado === 3 ? "red" : "#2563eb";

                  return (
                    <tr key={p.idpostulacion}>
                      <td style={tdStyle}>{formatDate(p.fechapostulacion)}</td>
                      <td
                        style={{
                          ...tdStyle,
                          color: "#0077cc",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() => aspirante && setModalAspirante(aspirante)}
                      >
                        {aspirante ? `${aspirante.nombreaspirante} ${aspirante.apellidoaspirante}` : "-"}
                      </td>
                      <td style={tdStyle}>{convocatoria?.nombreconvocatoria || "-"}</td>
                      <td style={tdStyle}>{convocatoria?.nombrepuesto || "-"}</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 600,
                          color: estadoColor,
                          textAlign: "center",
                        }}
                      >
                        {p.idestado === 2
                          ? "Seleccionado"
                          : p.idestado === 3
                          ? "Rechazado"
                          : "Pendiente"}
                      </td>
                      <td style={tdStyle}>{p.observacion || "-"}</td>
                      <td style={{ ...tdStyle, position: "relative" }}>
                        <div style={comboBoxStyles.container}>
                          <button
                            style={comboBoxStyles.button.base}
                            onClick={() => toggleMenu(p.idpostulacion)}
                          >
                            Acciones ▾
                          </button>
                          {openCombo === p.idpostulacion && (
                            <div style={comboBoxStyles.menu.container}>
                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  obtenerCV(p.idaspirante);
                                  setOpenCombo(null);
                                }}
                              >
                                Ver CV
                              </div>
                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  handleSeleccionarClick(p);
                                  setOpenCombo(null);
                                }}
                              >
                                Seleccionar
                              </div>
                              <div
                                style={comboBoxStyles.menu.item.desactivar.base}
                                onClick={() => {
                                  setPostulacionSeleccionada(p);
                                  setMostrarModalEliminar(true);
                                  setOpenCombo(null);
                                }}
                              >
                                Eliminar
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    No hay postulaciones para esta convocatoria
                  </td>
                </tr>
              )}
            </tbody>

            {/* 🔹 Paginación */}
            {totalPaginas > 1 && (
              <tfoot>
                <tr>
                  <td colSpan={ocultarEstado ? 6 : 7} style={{ textAlign: "center", padding: 20 }}>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPaginaActual(i + 1)}
                        style={{
                          ...buttonStyles.paginacion.base,
                          ...(paginaActual === i + 1
                            ? buttonStyles.paginacion.activo
                            : buttonStyles.paginacion.inactivo),
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {modalAspirante && (
        <ModalDetalle
          aspirante={modalAspirante}
          onClose={() => setModalAspirante(null)}
          idiomas={[]}
          pueblos={[]}
          convocatorias={convocatorias}
        />
      )}

      {showConfirmSeleccion && (
        <ConfirmModal
          message="¿Desea seleccionar esta postulación para entrevista?"
          onConfirm={confirmarSeleccion}
          onCancel={() => setShowConfirmSeleccion(false)}
        />
      )}

      {mostrarModalEliminar && postulacionSeleccionada && (
        <ModalEliminarAspirante
          aspiranteSeleccionado={postulacionSeleccionada}
          mostrarModal={mostrarModalEliminar}
          setMostrarModal={(mostrar) => {
            setMostrarModalEliminar(mostrar);
            if (!mostrar) eliminarPostulacion(postulacionSeleccionada.idpostulacion);
          }}
          setAspirantes={setPostulaciones}
          recargarAspirantes={() => {}}
        />
      )}
    </>
  );
};

export default PostulacionesTable;
