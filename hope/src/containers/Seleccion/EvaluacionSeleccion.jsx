// EvaluacionSeleccion.jsx
import React, { forwardRef, useState } from "react";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";
import useEvaluacionSeleccion from "./useEvaluacionSeleccion";
import "./EvaluacionSeleccion.css";
import { showToast } from "../../utils/toast";
import CriterioModal from "./CriterioModal"; 

const EvaluacionSeleccion = forwardRef((props, ref) => {
  const {
  convocatorias,
  setConvocatoriaSeleccionada,
  convocatoriaSeleccionada,
  nombresEvaluados,
  setNombresEvaluados,
  criterios,
  setCriterios,
  evaluaciones,
  setEvaluaciones,
  setGanador,
  totalPorPersona,
  handleChange,
  agregarCriterio,
  eliminarCriterio,
  handleCriterioChange,
  handleGuardarEvaluacion,
  handleGuardarCriterios,
  evaluacionesGuardadas,
  evaluacionSeleccionada,
  setEvaluacionSeleccionada,
  cargarEvaluacionExistente,
} = useEvaluacionSeleccion();

  const tresSeleccionados = nombresEvaluados.filter((n) => n && n.nombre && n.nombre.trim() !== "").length >= 2;
  const esEvaluacionCargada = Boolean(evaluacionSeleccionada);
  React.useEffect(() => {
    if (
      props.evaluacionSeleccionada &&
      props.evaluacionSeleccionada !== evaluacionSeleccionada
    ) {
      const idNum = Number(props.evaluacionSeleccionada); // 👈 convertir a número
      setEvaluacionSeleccionada(idNum);
      showToast("Cargando evaluación seleccionada desde tabla...", "info");

      // Limpieza visual momentánea
      setCriterios([]);
      setEvaluaciones([]);
      setNombresEvaluados([null, null, null]);
      setGanador(null);

      // Carga la evaluación después de un pequeño delay
      setTimeout(() => {
        cargarEvaluacionExistente(idNum);
      }, 200);
    }
  }, [props.evaluacionSeleccionada]);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Verifica si toda la tabla está completa
  const tablaCompleta =
    criterios.length > 0 &&
    criterios.every((c, idx) => {
      const ev = evaluaciones[idx];

      if (!ev) return false;

      // Aspirantes existentes (2 o 3)
      const personasActivas = nombresEvaluados
        .map((n, i) => (n ? ["p1", "p2", "p3"][i] : null))
        .filter(Boolean);

      // Verifica nombre + descripcion + puntajes SOLO de personas reales
      return (
        c.nombre.trim() !== "" &&
        c.descripcion.trim() !== "" &&
        personasActivas.every((p) => ev.puntajes[p] && ev.puntajes[p] !== "")
      );
    });

  const puedeGuardar =
    convocatoriaSeleccionada &&
    nombresEvaluados.filter((n) => n && n.nombre && n.nombre.trim() !== "").length >= 2 &&
    tablaCompleta;

  // 🔹 Cuando el usuario agrega desde el modal
  const handleAgregarCriterioDesdeModal = (criterio) => {
    // criterio llega con { id, nombre, descripcion }
    setCriterios((prev) => [...prev, criterio]);
    setEvaluaciones((prev) => [
      ...prev,
      { criterio: criterio.nombre, puntajes: { p1: "", p2: "", p3: "" }, observaciones: "" },
    ]);
    setMostrarModal(false);
  };
  

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
            onChange={(e) => {
              const nuevaConvocatoria = e.target.value;

              // 1️⃣ Cambiamos la convocatoria
              setConvocatoriaSeleccionada(nuevaConvocatoria);

              // 2️⃣ Al cambiar convocatoria, ninguna evaluación guardada aplica
              setEvaluacionSeleccionada("");

              // 3️⃣ Limpiamos aspirantes y ganador
              setNombresEvaluados([null, null, null]);
              setGanador(null);

              // 4️⃣ Reiniciamos las evaluaciones usando los criterios institucionales ya cargados
              setEvaluaciones(
                criterios.map((c) => ({
                  criterio: c.nombre,
                  puntajes: { p1: "", p2: "", p3: "" },
                  observaciones: "",
                }))
              );

              if (nuevaConvocatoria) {
                showToast("Exito en cargar datos de convocatoria", "success");
              }
            }}
          >
            <option value="">Seleccione una convocatoria</option>
            {convocatorias
            .filter(
              (c) =>
                c.idestado?.idestado !== 6 &&
                c.idestado?.nombreestado?.toLowerCase() !== "finalizada"
            )
            .map((c) => (
              <option key={c.idconvocatoria} value={c.idconvocatoria}>
                {c.nombreconvocatoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h1>Evaluación de Candidatos - Selección de 2 a 3 Personas</h1>

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
          if (esEvaluacionCargada) return;
          if (!tresSeleccionados) {
            showToast("Selecciona 3 aspirantes antes de agregar criterios.", "warning");
            return;
          }
          setMostrarModal(true); // 🔥 ahora abre el modal
        }}
        disabled={!tresSeleccionados || esEvaluacionCargada}
        style={{
          backgroundColor: !tresSeleccionados || esEvaluacionCargada ? "#ccc" : "#219ebc",
          color: !tresSeleccionados || esEvaluacionCargada ? "#666" : "#fff",
          cursor: !tresSeleccionados || esEvaluacionCargada ? "not-allowed" : "pointer",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          fontWeight: 600,
          transition: "background 0.3s ease",
        }}
      >
        Agregar Criterio
      </button>

      {/* Botón para guardar criterios */}
      <button
        className="btn-guardar"
        onClick={() => {
          if (esEvaluacionCargada) return;
          if (!tablaCompleta) {
            showToast("Debes completar todos los puntajes antes de guardar.", "warning");
            return;
          }
          handleGuardarCriterios();
        }}
        disabled={!puedeGuardar || esEvaluacionCargada}
        title={
          esEvaluacionCargada
            ? "Deshabilitado: evaluación cargada"
            : !puedeGuardar
            ? "Completa todos los puntajes antes de guardar"
            : "Guardar los criterios y evaluaciones"
        }
        style={{
          backgroundColor:
            !puedeGuardar || esEvaluacionCargada ? "#ccc" : "#219ebc",
          color:
            !puedeGuardar || esEvaluacionCargada ? "#666" : "#fff",
          cursor:
            !puedeGuardar || esEvaluacionCargada
              ? "not-allowed"
              : "pointer",
          border: "none",
          borderRadius: 6,
          padding: "8px 16px",
          fontWeight: 600,
          marginLeft: "10px",
          transition: "background 0.3s ease",
        }}
      >
        Guardar Evaluación
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
                      backgroundColor: esInstitucional ? "#f3ff6950 " : "white",
                      color: esInstitucional ? "#000000ff" : "black",
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
                      backgroundColor: esInstitucional ? "#f3ff6950 " : "white",
                      color: esInstitucional ? "#000000ff " : "black",
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

                {["p1", "p2", "p3"].map((persona, i) => {
                  const esEvaluacionCargada = Boolean(evaluacionSeleccionada); 
                  return (
                    <td key={persona} className="center">
                      <select
                        disabled={!nombresEvaluados[i] || esEvaluacionCargada} 
                        value={evaluaciones[index]?.puntajes[persona] || ""}
                        onChange={(e) =>
                          handleChange(index, "puntajes", e.target.value, persona)
                        }
                        style={{
                          backgroundColor: esEvaluacionCargada
                            ? "rgba(243, 255, 105, 0.315)"
                            : "rgba(243, 255, 105, 0.315)",
                          cursor: esEvaluacionCargada ? "not-allowed" : "pointer",
                        }}
                        title={
                          esEvaluacionCargada
                            ? "Punteo bloqueado (evaluación guardada)"
                            : "Asignar puntaje"
                        }
                      >
                        <option value="">–</option>
                        {[1, 2, 3, 4, 5].map((p) => (
                          <option key={p} value={p.toString()}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}

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

      {mostrarModal && (
        <CriterioModal
          onClose={() => setMostrarModal(false)}
          onAdd={handleAgregarCriterioDesdeModal}
          criteriosUsados={criterios}
        />
      )}

      {/* Mostrar los botones solo cuando la tabla esté completa */}
      {tablaCompleta && (
        <div className="botones-final">
          {(() => {
            // Calcular totales
            const totales = [
              { key: "p1", total: totalPorPersona("p1"), nombre: nombresEvaluados[0]?.nombre || "Entrevistado 1" },
              { key: "p2", total: totalPorPersona("p2"), nombre: nombresEvaluados[1]?.nombre || "Entrevistado 2" },
              { key: "p3", total: totalPorPersona("p3"), nombre: nombresEvaluados[2]?.nombre || "Entrevistado 3" },
            ];

            // Ordenar de mayor a menor puntaje
            const ordenados = [...totales].sort((a, b) => b.total - a.total);

            // Paleta semáforo (colores suaves y bonitos)
            const colores = {
              [ordenados[0]?.key]: "#bdfaa5ff", 
              [ordenados[1]?.key]: "#f9d683ff",
              [ordenados[2]?.key]: "#f98ba5ff",
            };

            // Etiquetas según posición
            const textos = {
              [ordenados[0]?.key]: "1er Lugar - Ganador",
              [ordenados[1]?.key]: "2do Lugar",
              [ordenados[2]?.key]: "3er Lugar",
            };

            return ["p1", "p2", "p3"].map((p, i) => {
              const color = colores[p] || "#ccc";
              const aspirante = nombresEvaluados[i]?.nombre || `Entrevistado ${i + 1}`;
              const total = totalPorPersona(p);

              return (
                <button
                  key={p}
                  disabled={!nombresEvaluados[i]}
                  onClick={() => handleGuardarCriterios()}
                  style={{
                    backgroundColor: color,
                    color: "#000000ff",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 20px",
                    margin: "8px",
                    fontWeight: 600,
                    cursor: "default",
                    minWidth: "230px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                    transform: "scale(1)",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                  title={`Puntaje total: ${total}`}
                >
                  {textos[p] ? `${textos[p]} — ${aspirante}` : aspirante}
                </button>
              );
            });
          })()}
        </div>
      )}
          </div>
        );
      });

export default EvaluacionSeleccion;
