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

const EvaluacionGuia = () => {
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
    evaluaciones,
    handleInputChange,
    totalAuto,
    totalCoord,
    promedioConsenso,
    siguienteVariable,
    anteriorVariable,
    usuario,
    showToast,
    autoevaluacionCompleta,
  } = useEvaluacionGuia();

  // 🔹 Roles
  const esAcompanante = usuario?.idrol === 2;
  const esContador = usuario?.idrol === 3;
  const esAdmin = usuario?.idrol === 5;

  // 🔹 Los acompañantes y contadores comparten el mismo comportamiento limitado
  const esRolSoloAuto = esAcompanante || esContador;

  return (
    <div style={pageContainer}>
      <div style={cardContainer}>
        <h2 style={title}>Evaluación</h2>

        {/* 🔹 Selector y botones */}
        <div style={selectRow}>
          <label style={{ fontWeight: 600, fontSize: "16px" }}>
            Tipo de Evaluación:
          </label>

          {/* 🔹 Solo admin puede seleccionar tipo */}
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

          {/* 🔹 Botones según rol */}
          {esRolSoloAuto ? (
            <button
              style={{
                ...miniButton,
                opacity: autoevaluacionCompleta() ? 1 : 0.5,
                cursor: autoevaluacionCompleta() ? "pointer" : "not-allowed"
              }}
              onClick={guardarAutoevaluacion}
              disabled={!autoevaluacionCompleta()}
            >
              Guardar Autoevaluación
            </button>
          ) : (
            <>
              <button
                style={{
                  ...miniButton,
                  opacity: autoevaluacionCompleta() ? 1 : 0.5,
                  cursor: autoevaluacionCompleta() ? "pointer" : "not-allowed"
                }}
                onClick={guardarAutoevaluacion}
                disabled={!autoevaluacionCompleta()}
              >
                Guardar Autoevaluación
              </button>

              <button
                style={{ ...miniButton, backgroundColor: "#3B82F6" }}
                onClick={() => showToast("Evaluación del coordinador guardada", "success")}
                disabled={!tipoSeleccionado}
              >
                Guardar Evaluación
              </button>
            </>
          )}
        </div>

        {/* 🔹 Contenido dinámico */}
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

            {/* 🔹 Tabla principal */}
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
                  <th style={thStyle}>AUTOEVALUACIÓN</th>

                  {/* 🔹 Solo si NO es acompañante o contador */}
                  {!esRolSoloAuto && (
                    <>
                      <th style={thStyle}>EVALUACIÓN COORDINADOR</th>
                      <th style={thStyle}>CONSENSO</th>
                    </>
                  )}

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

                        {/* Autoevaluación */}
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <select
                            value={ev.auto || ""}
                            onChange={(e) =>
                              handleInputChange(
                                c.idcriterio,
                                "auto",
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

                        {/* 🔹 Ocultar coord/consenso si es acompañante o contador */}
                        {!esRolSoloAuto && (
                          <>
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

                            <td
                              style={{
                                ...tdStyle,
                                background: "#f1f5f9",
                                textAlign: "center",
                                fontWeight: "600",
                              }}
                            >
                              {ev.consenso || ""}
                            </td>
                          </>
                        )}

                        {/* Observaciones */}
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

                {/* 🔹 Totales visibles solo para roles con permisos completos */}
                {!esRolSoloAuto &&
                  paginaActual === variablesFiltradas.length - 1 && (
                    <tr
                      style={{ backgroundColor: "#FACC15", fontWeight: "bold" }}
                    >
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        TOTAL GLOBAL
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {totalAuto}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {totalCoord}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {promedioConsenso}
                      </td>
                      <td style={tdStyle}></td>
                    </tr>
                  )}
              </tbody>
            </table>

            {/* 🔹 Paginación */}
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
                onClick={siguienteVariable}
                disabled={paginaActual === variablesFiltradas.length - 1}
                style={buttonStyle}
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
