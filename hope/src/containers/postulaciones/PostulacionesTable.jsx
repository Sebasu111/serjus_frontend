import React, { useState, useEffect, useMemo } from "react";
import ModalDetalle from "./ModalDetalle";
import ModalEliminarPostulacion from "./ModalEliminar";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import { showToast } from "../../utils/toast";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import ConfirmModal from "./ConfirmModal";
import axios from "axios";
import { useHistory } from "react-router-dom";

const thStyle = { borderBottom: "2px solid #eee", padding: 12, textAlign: "left", fontSize: 15 };
const tdStyle = { padding: 12, borderBottom: "1px solid #f0f0f0", fontSize: 15 };
const API = process.env.REACT_APP_API_URL;

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
  const history = useHistory();
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);

    // 🔹 Lista filtrada de convocatorias según el checkbox
  const convocatoriasFiltradas = useMemo(() => {
    return convocatorias.filter((c) => {
      const esFinalizada =
        c.idestado?.idestado === 6 ||
        c.idestado?.nombreestado?.toLowerCase() === "finalizada";

      // Si el checkbox está activo → mostrar solo finalizadas
      // Si no → mostrar todas las no finalizadas
      return mostrarFinalizadas ? esFinalizada : !esFinalizada;
    });
  }, [convocatorias, mostrarFinalizadas]);

  // 🔹 Seleccionar automáticamente la primera convocatoria activa
  useEffect(() => {
    if (convocatoriasFiltradas.length > 0 && !convocatoriaSeleccionada) {
      setConvocatoriaSeleccionada(convocatoriasFiltradas[0].idconvocatoria);
    }
  }, [convocatoriasFiltradas, convocatoriaSeleccionada]);

  // 🔹 useEffect: Validar automáticamente si hay 3 seleccionados por convocatoria
  useEffect(() => {
    const validarConvocatorias = async () => {
      try {
        // Agrupar postulaciones por convocatoria
        const agrupadas = postulaciones.reduce((acc, p) => {
          if (!acc[p.idconvocatoria]) acc[p.idconvocatoria] = [];
          acc[p.idconvocatoria].push(p);
          return acc;
        }, {});

        // Recorrer cada convocatoria
        for (const idConv in agrupadas) {
          const postulacionesConv = agrupadas[idConv];
          const seleccionadas = postulacionesConv.filter((p) => p.idestado === 2);

          // Si ya hay 3 seleccionadas, rechazar todas las demás
          if (seleccionadas.length >= 3) {
            const restantes = postulacionesConv.filter((p) => p.idestado !== 2);

            if (restantes.some((p) => p.idestado !== 3)) {
              await Promise.all(
                restantes.map((p) =>
                  axios.put(`${API}/postulaciones/${p.idpostulacion}/`, {
                    ...p,
                    idestado: 3,
                  })
                )
              );

              showToast(
                `Se alcanzaron 3 postulaciones seleccionadas. Las demás fueron rechazadas.`,
                "warning"
              );

              // Actualizar estado local
              setPostulaciones((prev) =>
                prev.map((p) => {
                  if (p.idconvocatoria === Number(idConv) && p.idestado !== 2)
                    return { ...p, idestado: 3 };
                  return p;
                })
              );
            }
          }
        }
      } catch (error) {
        console.error("Error validando postulaciones:", error);
      }
    };

    if (postulaciones.length > 0) {
      validarConvocatorias();
    }
  }, [postulaciones]);


  // 🔹 Filtrar postulaciones según convocatoria seleccionada y estado (finalizada o no)
  const postulacionesFiltradas = useMemo(() => {
    let filtradas = postulaciones;

    // 🔹 Filtrar por convocatoria seleccionada
    if (convocatoriaSeleccionada) {
      filtradas = filtradas.filter(
        (p) => String(p.idconvocatoria) === String(convocatoriaSeleccionada)
      );
    }

    // 🔹 Excluir postulaciones inactivas o rechazadas
    filtradas = filtradas.filter((p) => p.estado !== false && p.idestado !== 3);

    // 🔹 Filtrar convocatorias según si están finalizadas o no
    filtradas = filtradas.filter((p) => {
      const conv = convocatorias.find(
        (c) => c.idconvocatoria === p.idconvocatoria
      );

      if (!conv) return false;

      const esFinalizada =
        conv.idestado?.idestado === 6 ||
        conv.idestado?.nombreestado?.toLowerCase() === "finalizada";

      // Si mostrarFinalizadas está marcado → mostrar todo (incluye finalizadas)
      // Si NO está marcado → solo mostrar no finalizadas
      return mostrarFinalizadas ? true : !esFinalizada;
    });

    // 🔹 Ordenar por fecha de creación (más reciente primero)
    return [...filtradas].sort((a, b) => {
      const fechaA = new Date(a.createdat);
      const fechaB = new Date(b.createdat);
      return fechaB - fechaA;
    });
  }, [postulaciones, convocatoriaSeleccionada, mostrarFinalizadas, convocatorias]);



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
    const idConv = postulacionParaSeleccionar.idconvocatoria;
    const idAsp = postulacionParaSeleccionar.idaspirante;

    // 🔹 1. Seleccionar esta postulación
    await axios.put(`${API}/postulaciones/${idSel}/`, {
      ...postulacionParaSeleccionar,
      idestado: 2, // Seleccionada
    });

    // 🔹 2. Rechazar todas las demás postulaciones del mismo aspirante
    const otrasDelMismoAspirante = postulaciones.filter(
      (p) => p.idaspirante === idAsp && p.idpostulacion !== idSel
    );

    if (otrasDelMismoAspirante.length > 0) {
      await Promise.all(
        otrasDelMismoAspirante.map((p) =>
          axios.put(`${API}/postulaciones/${p.idpostulacion}/`, {
            ...p,
            idestado: 3, // Rechazada
          })
        )
      );
    }

    // 🔹 3. Obtener todas las postulaciones de la misma convocatoria
    const mismasConvocatorias = postulaciones.filter(
      (p) => p.idconvocatoria === idConv
    );

    // Calcular cuáles quedan seleccionadas (incluyendo la actual)
    const seleccionadasActuales = new Set([
      idSel,
      ...mismasConvocatorias
        .filter((p) => p.idestado === 2)
        .map((p) => p.idpostulacion),
    ]);

    // 🔹 4. Si ya hay 3 seleccionadas → rechazar todas las demás y cerrar convocatoria
    if (seleccionadasActuales.size >= 3) {
      const restantes = mismasConvocatorias.filter(
        (p) => !seleccionadasActuales.has(p.idpostulacion)
      );

      // Rechazar las no seleccionadas
      await Promise.all(
        restantes.map((p) =>
          axios.put(`${API}/postulaciones/${p.idpostulacion}/`, {
            ...p,
            idestado: 3,
          })
        )
      );

      const convocatoria = convocatorias.find((c) => c.idconvocatoria === idConv);

      // 🔥 Cerrar convocatoria
      await axios.put(`${API}/convocatorias/${idConv}/`, {
        fechainicio: convocatoria.fechainicio,
        fechafin: convocatoria.fechafin,
        idestado_id: 5, // cambia a 5 para "Cerrada"
        nombreconvocatoria: convocatoria.nombreconvocatoria,
        descripcion: convocatoria.descripcion,
        estado: false,
        idusuario: convocatoria.idusuario,
        idpuesto: convocatoria.idpuesto,
      });

      showToast(
        `Se alcanzaron las 3 postulaciones seleccionadas. La convocatoria sera cerrada automáticamente.`,
        "warning"
      );
    } else {
      showToast("Postulación seleccionada correctamente.", "success");
    }

    // 🔹 5. Actualizar estado local correctamente
    const updated = postulaciones.map((p) => {
      if (p.idpostulacion === idSel) return { ...p, idestado: 2 };

      // Rechazar las del mismo aspirante
      if (p.idaspirante === idAsp && p.idpostulacion !== idSel)
        return { ...p, idestado: 3 };

      // Rechazar las demás si hay 3 seleccionadas en la misma convocatoria
      if (
        p.idconvocatoria === idConv &&
        seleccionadasActuales.size >= 3 &&
        !seleccionadasActuales.has(p.idpostulacion)
      )
        return { ...p, idestado: 3 };

      return p;
    });

    setPostulaciones(updated);
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
        {/* 🔹 Filtro por convocatoria con label del puesto */}
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontWeight: 600 }}>Filtrar por convocatoria:</label>
            <select
              value={convocatoriaSeleccionada}
              onChange={(e) => {
                setConvocatoriaSeleccionada(e.target.value);
                setPaginaActual(1);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                minWidth: 250,
              }}
            >
              {/* 🔹 Opción por defecto */}
              <option value="">Seleccione una convocatoria</option>

              {/* 🔹 Convocatorias filtradas */}
              {convocatoriasFiltradas.map((c) => (
                <option key={c.idconvocatoria} value={c.idconvocatoria}>
                  {c.nombreconvocatoria}
                </option>
              ))}
            </select>

            {/* 🔹 Label gris con nombre del puesto */}
            {(() => {
              const convocatoria = convocatorias.find(
                (c) => String(c.idconvocatoria) === String(convocatoriaSeleccionada)
              );
              return (
                convocatoria?.nombrepuesto && (
                  <span
                    style={{
                      background: "#e5e5e5",
                      color: "#000",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Puesto: {convocatoria.nombrepuesto}
                  </span>
                )
              );
            })()}
            {/* 🔹 Checkbox para mostrar finalizadas */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 15, marginTop: 20, }}>
              <input
                type="checkbox"
                checked={mostrarFinalizadas}
                onChange={(e) => {
                  setMostrarFinalizadas(e.target.checked);
                  setConvocatoriaSeleccionada(""); // 🔹 Limpia selección si cambia el filtro
                }}
                style={{ transform: "scale(1.1)", cursor: "pointer" }}
              />
              <label style={{ fontWeight: 500, cursor: "pointer" }}>
                Mostrar convocatorias finalizadas
              </label>
            </div>
          </div>


        <div style={{ width: "100%" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Fecha", "Aspirante", "Estado", "Observación", "Acciones"].map(
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
                    p.idestado === 2 ? "green" : p.idestado === 3 ? "red": p.idestado === 7 ? "#FCC649" : "#bbbb00ff";

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
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 600,
                          color: estadoColor,
                          textAlign: "left",
                        }}
                      >
                        {p.idestado === 2
                          ? "Seleccionado"
                          : p.idestado === 3
                          ? "Rechazado"
                          : p.idestado === 7
                          ? "Contratado"
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
                              {/* 🔹 Siempre disponible: Ver CV */}
                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  obtenerCV(p.idaspirante);
                                  setOpenCombo(null);
                                }}
                              >
                                Ver CV
                              </div>

                              {/* 🔹 Solo mostrar otras acciones si NO está contratada */}
                              {p.idestado !== 7 && (
                                <>
                                  {/* 🔹 Mostrar "Contratar" solo si la postulación está seleccionada */}
                                  {p.idestado === 2 && (
                                    <div
                                      style={comboBoxStyles.menu.item.activar.base}
                                      onClick={() => {
                                        setOpenCombo(null);
                                        const aspirante = aspirantes.find(
                                          (a) => a.idaspirante === p.idaspirante
                                        );
                                        const convocatoria = convocatorias.find(
                                          (c) => c.idconvocatoria === p.idconvocatoria
                                        );

                                        if (!aspirante || !convocatoria) {
                                          showToast(
                                            "No se pudieron obtener los datos del aspirante o convocatoria",
                                            "error"
                                          );
                                          return;
                                        }

                                        // ✅ Navegación con React Router v5
                                        history.push(
                                          `/empleados?aspirante=${aspirante.idaspirante}&convocatoria=${convocatoria.idconvocatoria}`
                                        );

                                        showToast(
                                          `Iniciando contratación de ${aspirante.nombreaspirante} ${aspirante.apellidoaspirante}`,
                                          "info"
                                        );
                                      }}
                                    >
                                      Contratar
                                    </div>
                                  )}

                                  {/* 🔹 Mostrar "Seleccionar" si no está seleccionada */}
                                  {p.idestado !== 2 && (
                                    <div
                                      style={comboBoxStyles.menu.item.activar.base}
                                      onClick={() => {
                                        handleSeleccionarClick(p);
                                        setOpenCombo(null);
                                      }}
                                    >
                                      Seleccionar
                                    </div>
                                  )}

                                  {/* 🔹 Opción Eliminar */}
                                  <div
                                    style={comboBoxStyles.menu.item.desactivar.base}
                                    onClick={async () => {
                                      setOpenCombo(null);

                                      try {
                                        const idPost = p.idpostulacion;

                                        // 1️⃣ Consultar evaluaciones criterio ligadas a esta postulación
                                        const evalCritRes = await axios.get(
                                          `${API}/evaluacioncriterio/?idpostulacion=${idPost}`
                                        );
                                        const evalCriterios = evalCritRes.data.results || [];

                                        let evaluacionesIds = [];

                                        if (evalCriterios.length > 0) {
                                          evaluacionesIds = [...new Set(evalCriterios.map(e => e.idevaluacion))];
                                        }

                                        // 2️⃣ Verificar evaluaciones principales
                                        let hayActiva = false;

                                        for (let idEval of evaluacionesIds) {
                                          const evalRes = await axios.get(`${API}/evaluacion/${idEval}/`);
                                          if (evalRes.data.estado === true) {
                                            hayActiva = true;
                                            break;
                                          }
                                        }

                                        // 3️⃣ Si hay activa → bloquear
                                        if (hayActiva) {
                                          showToast(
                                            "No se puede eliminar esta postulación porque tiene una evaluación activa.",
                                            "error"
                                          );
                                          return;
                                        }

                                        // 4️⃣ SI todo ok → abrir modal
                                        setPostulacionSeleccionada(p);
                                        setMostrarModalEliminar(true);

                                      } catch (e) {
                                        console.error(e);
                                        showToast("Error validando evaluaciones.", "error");
                                      }
                                    }}
                                  >
                                    Eliminar
                                  </div>
                                </>
                              )}
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
        <ModalEliminarPostulacion
          postulacionSeleccionada={postulacionSeleccionada}
          mostrarModal={mostrarModalEliminar}
          setMostrarModal={setMostrarModalEliminar}
          setPostulaciones={setPostulaciones}
        />
      )}
    </>
  );
};

export default PostulacionesTable;
