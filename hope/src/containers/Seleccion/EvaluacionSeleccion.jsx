// EvaluacionSeleccion.jsx
import React, { forwardRef } from "react";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";
import useEvaluacionSeleccion from "./useEvaluacionSeleccion";
import "./EvaluacionSeleccion.css";

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
  } = useEvaluacionSeleccion();

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

      <button className="btn-agregar" onClick={agregarCriterio}>
        Agregar Criterio
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
          {criterios.map((c, index) => (
            <tr key={c.id}>
              <td>
                <input
                  type="text"
                  value={c.nombre}
                  placeholder="Nombre del criterio"
                  onChange={(e) =>
                    handleCriterioChange(index, "nombre", e.target.value)
                  }
                />
              </td>
              <td>
                <textarea
                  value={c.descripcion}
                  placeholder="Descripción del criterio"
                  onChange={(e) => {
                    handleCriterioChange(index, "descripcion", e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                  style={{ overflow: "hidden" }}
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
                <button
                  className="btn-eliminar"
                  onClick={() => eliminarCriterio(index)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

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
