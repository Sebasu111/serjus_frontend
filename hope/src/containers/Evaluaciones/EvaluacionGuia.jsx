import React from "react";
import {
  pageContainer,
  cardContainer,
  title,
  selectRow,
  typeSelectStyle,
  thStyle,
  tdStyle,
  tdEmpty,
  selectStyle,
  inputTextStyle,
  buttonStyle,
  miniButton,
  pagerRow,
  pagerInfo,
} from "./EvaluacionGuiaStyles.js";
import { useEvaluacionGuia } from "./useEvaluacionGuia.js";
import { toast } from "react-toastify";

const EvaluacionGuia = ({ evaluacionSeleccionada }) => {
  const {
    tipos,
    tipoSeleccionado,
    setTipoSeleccionado,
    variablesFiltradas,
    variableActual,
    criteriosActuales,
    loading,
    paginaActual,
    setPaginaActual,
    guardarAutoevaluacion,
    guardarEvaluacionCoordinador,
    evaluaciones,
    handleInputChange,
    siguienteVariable,
    anteriorVariable,
    usuario,
    autoevaluacionCompleta,
    evaluacionCoordinadorCompleta,
  } = useEvaluacionGuia(evaluacionSeleccionada);

  // ---- ROLES ----
  const esAcompanante = usuario?.idrol === 2;
  const esContador = usuario?.idrol === 3;
  const esSecretaria = usuario?.idrol === 4;
  const esCoordinador = usuario?.idrol === 1;
  const esAdmin = usuario?.idrol === 5;

  // 🔥 ADMIN puede evaluar igual que COORDINADOR, pero NO autoevaluarse
  const esEvaluador = esCoordinador || esAdmin;

  const esSoloAuto = esAcompanante || esContador || esSecretaria;

  // 🟢 Corrigiendo (cuando evalúa a un empleado desde la tabla)
  const esCorrigiendo = evaluacionSeleccionada && esEvaluador;
  const esVistaFinal = esAdmin && evaluacionSeleccionada?.modo === "final";

  // ---- REGLAS DE VISUALIZACIÓN ----
  const mostrarAuto = !esCorrigiendo; // si está corrigiendo ya no muestra auto
  const mostrarCoord = esCorrigiendo; // cuando corrige muestra evaluación del coordinador

  // 🟢 Verificar si todos los criterios de la página actual tienen puntaje
  const paginaActualCompleta = criteriosActuales.every((c) => {
    const ev = evaluaciones[c.idcriterio];
    if (mostrarAuto) return ev?.auto > 0;     // En autoevaluación
    if (mostrarCoord) return ev?.coord > 0;   // En evaluación del coordinador
    return true;
  });


  return (
    <div style={pageContainer}>
      <div style={cardContainer}>
        <h2 style={title}>Evaluación</h2>

        {evaluacionSeleccionada && (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "600",
              marginTop: "-10px",
              marginBottom: "20px",
              color: "#374151",
            }}
          >
            Evaluando a:{" "}
            <span style={{ color: "#023047", fontWeight: "700" }}>
              {evaluacionSeleccionada.nombreEmpleado}
            </span>
          </p>
        )}

        {/* ---------------- SELECTOR & BOTONES ---------------- */}
        <div style={selectRow}>
          <label style={{ fontWeight: 600, fontSize: "16px" }}>
            Tipo de Evaluación:
          </label>

          {/* 🔥 ADMIN puede elegir tipo pero no autoevaluarse */}
          {esAdmin ? (
            <select
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              style={typeSelectStyle}
            >
              <option value="">Seleccione un tipo</option>
              {tipos
                .filter((t) => t.nombretipo?.toLowerCase() !== "entrevista")
                .map((t) => (
                  <option key={t.idtipoevaluacion} value={t.idtipoevaluacion}>
                    {t.nombretipo}
                  </option>
                ))}
            </select>
          ) : (
            <span
              style={{
                fontWeight: 600,
                color: "#1E3A8A",
                backgroundColor: "#f1f5f9",
                borderRadius: "6px",
                padding: "8px 12px",
              }}
            >
              {tipos.find(
                (t) => String(t.idtipoevaluacion) === tipoSeleccionado
              )?.nombretipo || "Cargando..."}
            </span>
          )}

          {/* ---- BOTONES ---- */}

          {/* SOLO acompañante y contador pueden guardar autoevaluación */}
          {esSoloAuto && (
            <button
              style={{
                ...miniButton,
                opacity: autoevaluacionCompleta() ? 1 : 0.5,
                cursor: autoevaluacionCompleta() ? "pointer" : "not-allowed",
              }}
              onClick={guardarAutoevaluacion}
              disabled={!autoevaluacionCompleta()}
            >
              Guardar Autoevaluación
            </button>
          )}

          {/* coordinador puede autoevaluarse solo cuando NO está corrigiendo */}
          {esCoordinador && !esCorrigiendo && (
            <button
              style={{
                ...miniButton,
                opacity: autoevaluacionCompleta() ? 1 : 0.5,
                cursor: autoevaluacionCompleta() ? "pointer" : "not-allowed",
              }}
              onClick={guardarAutoevaluacion}
              disabled={!autoevaluacionCompleta()}
            >
              Guardar Autoevaluación
            </button>
          )}

          {/* 🔥 ADMIN / COORDINADOR guardan evaluación del supervisor */}
          {esCorrigiendo && (
            <button
              style={{
                ...miniButton,
                backgroundColor: "#3B82F6",
                opacity: evaluacionCoordinadorCompleta() ? 1 : 0.5,
                cursor: evaluacionCoordinadorCompleta()
                  ? "pointer"
                  : "not-allowed",
              }}
              onClick={guardarEvaluacionCoordinador}
              disabled={!evaluacionCoordinadorCompleta()}
            >
              Guardar Evaluación
            </button>
          )}
        </div>

        {/* ---------------- CONTENIDO ---------------- */}
        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            Cargando información...
          </p>
        ) : !tipoSeleccionado ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            Seleccione un tipo de evaluación para mostrar las variables.
          </p>
        ) : variablesFiltradas.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            No hay variables asociadas a este tipo de evaluación.
          </p>
        ) : (
          <>
            <h3
              style={{
                textAlign: "center",
                color: "#1E40AF",
                fontWeight: "700",
                marginBottom: "15px",
              }}
            >
              {paginaActual + 1} de {variablesFiltradas.length}:{" "}
              {variableActual?.nombrevariable}
            </h3>

            {/* ---------------- TABLA PRINCIPAL ---------------- */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#023047", color: "white" }}>
                  <th style={thStyle}>CRITERIO</th>
                  {mostrarAuto && <th style={thStyle}>AUTOEVALUACIÓN</th>}
                  {mostrarCoord && <th style={thStyle}>EVALUACIÓN COORD.</th>}
                  <th style={thStyle}>OBSERVACIONES</th>
                </tr>
              </thead>

              <tbody>
                {criteriosActuales.length > 0 ? (
                  criteriosActuales.map((c) => {
                    const ev = evaluaciones[c.idcriterio] || {};

                    return (
                      <tr key={c.idcriterio}>
                        <td style={tdStyle}>{c.nombrecriterio}</td>

                        {/* AUTOEVALUACIÓN */}
                        {mostrarAuto && (
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <select
                              value={ev.auto || ""}
                              disabled={!!evaluacionSeleccionada}
                              onChange={(e) =>
                                handleInputChange(
                                  c.idcriterio,
                                  "auto",
                                  e.target.value
                                )
                              }
                              style={{
                                ...selectStyle,
                                backgroundColor: evaluacionSeleccionada
                                  ? "#e5e7eb"
                                  : "white",
                              }}
                            >
                              <option value="">-</option>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}

                        {/* COORDINADOR / ADMIN */}
                        {mostrarCoord && (
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <select
                              value={ev.coord || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  c.idcriterio,
                                  "coord",
                                  e.target.value
                                )
                              }
                              style={selectStyle}
                            >
                              <option value="">-</option>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <option key={n} value={n}>
                                  {n}
                                </option>
                              ))}
                            </select>
                          </td>
                        )}

                        <td style={tdStyle}>
                          <input
                            type="text"
                            value={ev.obs || ""}
                            onChange={(e) =>
                              handleInputChange(
                                c.idcriterio,
                                "obs",
                                e.target.value
                              )
                            }
                            style={inputTextStyle}
                            placeholder="Escriba aquí..."
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={tdEmpty}>
                      (Sin criterios asociados)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ---------------- PAGINACIÓN ---------------- */}
            <div style={pagerRow}>
              <button
                onClick={anteriorVariable}
                disabled={paginaActual === 0}
                style={buttonStyle}
              >
                ⬅ Anterior
              </button>
              <span style={pagerInfo}>
                Página {paginaActual + 1} de {variablesFiltradas.length}
              </span>
              <button
                onClick={() => {
                  if (!paginaActualCompleta) {
                    toast.warning("Debe asignar puntaje a todos los criterios antes de continuar.");
                    return;
                  }
                  siguienteVariable();
                }}
                disabled={
                  paginaActual === variablesFiltradas.length - 1 || !paginaActualCompleta
                }
                style={{
                  ...buttonStyle,
                  backgroundColor:
                    paginaActual === variablesFiltradas.length - 1 || !paginaActualCompleta
                      ? "#9ca3af"
                      : "#2563EB",
                  cursor:
                    paginaActual === variablesFiltradas.length - 1 || !paginaActualCompleta
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Siguiente ➡
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EvaluacionGuia;
