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

const EvaluacionGuia = ({ evaluacionSeleccionada, evaluacionesAbiertas }) => {
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

  const esSoloAuto = esAcompanante || esContador || esSecretaria;
  const esEvaluador = esCoordinador || esAdmin;
  const esCorrigiendo = evaluacionSeleccionada && esEvaluador;
  const mostrarAuto = !esCorrigiendo;
  const mostrarCoord = esCorrigiendo;

  const paginaActualCompleta = criteriosActuales.every((c) => {
    const ev = evaluaciones[c.idcriterio];
    if (mostrarAuto) return ev?.auto > 0;
    if (mostrarCoord) return ev?.coord > 0;
    return true;
  });

  // ⛔ Bloquear edición fuera de fechas
  const bloqueado = !evaluacionesAbiertas;

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

          {/* Selector tipo */}
          {esAdmin ? (
            <select
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              style={typeSelectStyle}
              disabled={bloqueado}
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

          {/* BOTONES GUARDAR */}

          {esSoloAuto && (
            <button
              style={{
                ...miniButton,
                opacity: bloqueado || !autoevaluacionCompleta() ? 0.5 : 1,
                cursor:
                  bloqueado || !autoevaluacionCompleta()
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={guardarAutoevaluacion}
              disabled={bloqueado || !autoevaluacionCompleta()}
            >
              Guardar Autoevaluación
            </button>
          )}

          {esCoordinador && !esCorrigiendo && (
            <button
              style={{
                ...miniButton,
                opacity: bloqueado || !autoevaluacionCompleta() ? 0.5 : 1,
                cursor:
                  bloqueado || !autoevaluacionCompleta()
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={guardarAutoevaluacion}
              disabled={bloqueado || !autoevaluacionCompleta()}
            >
              Guardar Autoevaluación
            </button>
          )}

          {esCorrigiendo && (
            <button
              style={{
                ...miniButton,
                backgroundColor: "#3B82F6",
                opacity:
                  bloqueado || !evaluacionCoordinadorCompleta() ? 0.5 : 1,
                cursor:
                  bloqueado || !evaluacionCoordinadorCompleta()
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={guardarEvaluacionCoordinador}
              disabled={bloqueado || !evaluacionCoordinadorCompleta()}
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

            {/* TABLA */}
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
                              disabled={bloqueado}
                              onChange={(e) =>
                                handleInputChange(
                                  c.idcriterio,
                                  "auto",
                                  e.target.value
                                )
                              }
                              style={{
                                ...selectStyle,
                                backgroundColor: bloqueado
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

                        {/* EVALUADOR (COORD/ADMIN) */}
                        {mostrarCoord && (
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <select
                              value={ev.coord || ""}
                              disabled={bloqueado}
                              onChange={(e) =>
                                handleInputChange(
                                  c.idcriterio,
                                  "coord",
                                  e.target.value
                                )
                              }
                              style={{
                                ...selectStyle,
                                backgroundColor: bloqueado
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

                        {/* OBSERVACIONES */}
                        <td style={tdStyle}>
                          <input
                            type="text"
                            disabled={bloqueado}
                            value={ev.obs || ""}
                            onChange={(e) =>
                              handleInputChange(
                                c.idcriterio,
                                "obs",
                                e.target.value
                              )
                            }
                            style={{
                              ...inputTextStyle,
                              backgroundColor: bloqueado
                                ? "#e5e7eb"
                                : "white",
                            }}
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
                disabled={bloqueado || paginaActual === 0}
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
                    toast.warning(
                      "Debe asignar puntaje a todos los criterios antes de continuar."
                    );
                    return;
                  }
                  siguienteVariable();
                }}
                disabled={
                  bloqueado ||
                  paginaActual === variablesFiltradas.length - 1 ||
                  !paginaActualCompleta
                }
                style={{
                  ...buttonStyle,
                  backgroundColor:
                    bloqueado ||
                    paginaActual === variablesFiltradas.length - 1 ||
                    !paginaActualCompleta
                      ? "#9ca3af"
                      : "#2563EB",
                  cursor:
                    bloqueado ||
                    paginaActual === variablesFiltradas.length - 1 ||
                    !paginaActualCompleta
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
