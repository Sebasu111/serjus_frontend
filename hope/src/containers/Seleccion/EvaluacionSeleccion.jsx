// EvaluacionSeleccion.jsx
import React, { forwardRef } from "react";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";
import useEvaluacionSeleccion from "./useEvaluacionSeleccion";
import "./EvaluacionSeleccion.css";
import { showToast } from "../../utils/toast";

const EvaluacionSeleccion = forwardRef((props, ref) => {
  const {
    convocatorias,
    setConvocatoriaSeleccionada,
    convocatoriaSeleccionada,
    nombresEvaluados,
    criterios,
    evaluaciones,
    ganador,
    totalPorPersona,
    handleChange,
    agregarCriterio,
    eliminarCriterio,
    handleCriterioChange,
    handleGuardarEvaluacion,
    handleGuardarCriterios,
  } = useEvaluacionSeleccion();

  const tresSeleccionados = nombresEvaluados.filter((n) => n && n.nombre && n.nombre.trim() !== "").length >= 3;


  // Verifica si toda la tabla está completa
  const tablaCompleta =
    criterios.length > 0 &&
    criterios.every((c, idx) => {
      const ev = evaluaciones[idx];
      return (
        c.nombre.trim() !== "" &&
        c.descripcion.trim() !== "" &&
        ev &&
        ["p1", "p2", "p3"].every((p) => ev.puntajes[p] && ev.puntajes[p] !== "")
      );
    });

  return (
    <div id="printable" ref={ref}>
      <div className="header-image">
        <img src={serjusHeader} alt="SERJUS Header" />
      </div>

      <div className="top-bar">
        <div>
          <strong>Convocatoria:</strong>{" "}
          <select
            value={convocatoriaSeleccionada}
            onChange={(e) => setConvocatoriaSeleccionada(e.target.value)}
          >
            <option value="">Seleccione una convocatoria</option>
            {convocatorias.map((c) => (
              <option key={c.idconvocatoria} value={c.idconvocatoria}>
                {c.nombreconvocatoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h1>Evaluación de Candidatos - Selección de 3 Personas</h1>

      <div className="aspirantes-seleccionados">
        <strong>Aspirantes seleccionados:</strong>
        <div>
          {nombresEvaluados.filter((n) => n && n.nombre && n.nombre.trim() !== "").length >= 2
            ? nombresEvaluados
                .filter((n) => n && n.nombre && n.nombre.trim() !== "")
                .map((n, i) => (
                  <span key={i}>-{n.nombre}</span>
                ))
            : "Debe seleccionar al menos 2 aspirantes."}
        </div>
      </div>

      <button
        className="btn-agregar"
        onClick={() => {
          if (!tresSeleccionados) {
            showToast("Selecciona 3 aspirantes antes de agregar criterios.", "warning");
            return;
          }
          agregarCriterio();
        }}
        disabled={!tresSeleccionados}
        title={!tresSeleccionados ? "Desactivado: faltan aspirantes seleccionados" : ""}
        style={{
          backgroundColor: tresSeleccionados ? "#219ebc" : "#ccc",
          color: tresSeleccionados ? "#fff" : "#666",
          cursor: tresSeleccionados ? "pointer" : "not-allowed",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          fontWeight: 600,
          transition: "background 0.3s ease",
        }}
      >
        Agregar Criterio
      </button>

      {/* 🔘 Botón para guardar criterios */}
      <button
        className="btn-guardar"
        onClick={() => {
          if (criterios.length === 0) {
            showToast("No hay criterios para guardar.", "warning");
            return;
          }
          handleGuardarCriterios(); // ✅ ahora sí se ejecuta la función del hook
        }}
        disabled={criterios.length === 0}
        title={criterios.length === 0 ? "No hay criterios para guardar" : "Guardar los criterios actuales"}
        style={{
          backgroundColor: criterios.length === 0 ? "#ccc" : "#219ebc",
          color: criterios.length === 0 ? "#666" : "#fff",
          cursor: criterios.length === 0 ? "not-allowed" : "pointer",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          fontWeight: 600,
          marginLeft: "10px",
          transition: "background 0.3s ease",
        }}
      >
        Guardar Criterios
      </button>


      <table>
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Indicadores de Evaluación</th>
            {nombresEvaluados.map((nombre, i) => (
              <th key={i}>
                {nombre && nombre.nombre && nombre.nombre.trim() !== ""
                  ? nombre.nombre
                  : `Entrevistado/a Nº ${i + 1}`}
              </th>
            ))}
            <th>Observaciones / Comentarios</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {criterios.map((c, index) => {
            const esInstitucional = index < 12; // 🔒 Los primeros 12 están bloqueados

            return (
              <tr key={c.id}>
                <td>
                  <input
                    type="text"
                    value={c.nombre}
                    placeholder="Nombre del criterio"
                    disabled={esInstitucional}
                    onChange={(e) =>
                      handleCriterioChange(index, "nombre", e.target.value)
                    }
                    style={{
                      backgroundColor: esInstitucional ? "rgba(243, 255, 105, 0.315); " : "white",
                      color: esInstitucional ? "#777" : "black",
                      cursor: esInstitucional ? "not-allowed" : "text",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: "4px 6px",
                      width: "100%",
                    }}
                    title={
                      esInstitucional
                        ? "Criterio institucional — no editable"
                        : "Editar nombre del criterio"
                    }
                  />
                </td>

                <td>
                  <textarea
                    value={c.descripcion}
                    placeholder="Descripción del criterio"
                    disabled={esInstitucional}
                    onChange={(e) => {
                      handleCriterioChange(index, "descripcion", e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    style={{
                      backgroundColor: esInstitucional ? "rgba(243, 255, 105, 0.315); " : "white",
                      color: esInstitucional ? "rgba(243, 255, 105, 0.315); " : "black",
                      cursor: esInstitucional ? "not-allowed" : "text",
                      overflow: "hidden",
                      width: "100%",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      padding: "4px 6px",
                    }}
                    title={
                      esInstitucional
                        ? "Criterio institucional — no editable"
                        : "Editar descripción del criterio"
                    }
                  />
                </td>

                {["p1", "p2", "p3"].map((persona, i) => (
                  <td key={persona} className="center">
                    <select
                      disabled={!nombresEvaluados[i]}
                      value={evaluaciones[index]?.puntajes[persona] || ""}
                      onChange={(e) =>
                        handleChange(index, "puntajes", e.target.value, persona)
                      }
                    >
                      <option value="">–</option>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                ))}

                <td>
                  <textarea
                    value={evaluaciones[index]?.observaciones || ""}
                    onChange={(e) =>
                      handleChange(index, "observaciones", e.target.value)
                    }
                  />
                </td>

                <td className="center">
                  {esInstitucional ? (
                    <button
                      className="btn-eliminar"
                      style={{
                        backgroundColor: "#ccc",
                        color: "#666",
                        cursor: "not-allowed",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                      }}
                      disabled
                      title="Criterio institucional — no se puede eliminar"
                    >
                      Bloqueado
                    </button>
                  ) : (
                    <button
                      className="btn-eliminar"
                      onClick={() => {
                        eliminarCriterio(index);
                        showToast("Criterio eliminado correctamente.", "success");
                      }}
                      style={{
                        backgroundColor: "#d62828",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        cursor: "pointer",
                        transition: "background 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "#a4161a")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "#d62828")}
                      title="Eliminar este criterio"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          <tr className="total-row">
            <td colSpan="2" className="right">
              PUNTEO TOTAL:
            </td>
            <td className="center">{totalPorPersona("p1")}</td>
            <td className="center">{totalPorPersona("p2")}</td>
            <td className="center">{totalPorPersona("p3")}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Escala de Evaluación:</strong>
      </p>
      <ul>
        <li>1 = No cumple el criterio.</li>
        <li>2 = Cumple parcialmente, requiere fortalecimiento.</li>
        <li>3 = Cumple adecuadamente lo básico.</li>
        <li>4 = Cumple satisfactoriamente y con evidencia.</li>
        <li>5 = Cumple plenamente y demuestra compromiso.</li>
      </ul>

      {/* ✅ Mostrar los botones solo cuando la tabla esté completa */}
      {tablaCompleta && (
        <div className="botones-final">
          {["p1", "p2", "p3"].map((p, i) => (
            <button
              key={p}
              disabled={ganador !== p || !nombresEvaluados[i]}
              className={ganador === p ? "habilitado" : ""}
              onClick={() => handleGuardarEvaluacion(i)}
            >
              {ganador === p
                ? `Contratar a ${nombresEvaluados[i]?.nombre}`
                : `Contratar a ${
                    nombresEvaluados[i]?.nombre || `Entrevistado ${i + 1}`
                  }`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default EvaluacionSeleccion;
