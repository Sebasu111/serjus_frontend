import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const ELEMENTOS_POR_PAGINA_GENERAL = 8;
const CRITERIOS_POR_PAGINA = 5;

const EvaluacionesFinalizadas = () => {
  const [data, setData] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [criteriosEval, setCriteriosEval] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [variables, setVariables] = useState([]);
  const [paginaGeneral, setPaginaGeneral] = useState(1);
  const [paginaDetalle, setPaginaDetalle] = useState({});
  const [cargando, setCargando] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [realIdxSeleccionado, setRealIdxSeleccionado] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resEval, resEmp, resUsers, resCritEval, resCrit, resVars] = await Promise.all([
          axios.get(`${API_BASE}/evaluacion/`),
          axios.get(`${API_BASE}/empleados/`),
          axios.get(`${API_BASE}/usuarios/`),
          axios.get(`${API_BASE}/evaluacioncriterio/`),
          axios.get(`${API_BASE}/criterio/`),
          axios.get(`${API_BASE}/variables/`)
        ]);

        const evalDataRaw = resEval.data.results || resEval.data || [];
        const evalData = evalDataRaw.filter(ev =>
          ev.idempleado !== null && 
          (ev.modalidad === "Autoevaluación" || ev.modalidad === "Evaluacion")
        );
        const empData = resEmp.data.results || resEmp.data || [];
        const usersData = resUsers.data.results || resUsers.data || [];
        const critEvalData = resCritEval.data.results || resCritEval.data || [];
        const criteriosData = resCrit.data.results || resCrit.data || [];
        const varsData = resVars.data.results || resVars.data || [];

        setUsuarios(usersData);
        setCriteriosEval(critEvalData);
        setCriterios(criteriosData);
        setVariables(varsData);

        const grouped = {};
        evalData.forEach(ev => {
          if (!grouped[ev.idempleado]) grouped[ev.idempleado] = { auto: null, coord: null };
          if (ev.modalidad === "Autoevaluación") grouped[ev.idempleado].auto = ev;
          if (ev.modalidad === "Evaluacion") grouped[ev.idempleado].coord = ev;
        });

        const finalRows = Object.keys(grouped).map(id => {
          const auto = grouped[id].auto;
          const coord = grouped[id].coord;
          const emp = empData.find(e => e.idempleado === Number(id));

          const getNombreUsuario = (idUsuario) =>
            usersData.find(u => u.idusuario === idUsuario)?.nombreusuario || "Desconocido";

          return {
            empleado: emp ? `${emp.nombre} ${emp.apellido}` : "Desconocido",
            auto,
            coord,
            autoUsuario: auto ? getNombreUsuario(auto.idusuario) : "",
            coordUsuario: coord ? getNombreUsuario(coord.idusuario) : "",
          };
        });

        setData(finalRows);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargando(false);
      }
    };

    loadData();
  }, []);

  const abrirModal = (row, realIdx) => {
    setRowSeleccionada(row);
    setRealIdxSeleccionado(realIdx);
    setPaginaDetalle(prev => ({ ...prev, [realIdx]: 0 }));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRowSeleccionada(null);
    setRealIdxSeleccionado(null);
  };

  const criteriosPorEval = (idEval) =>
    criteriosEval.filter(c => c.idevaluacion === idEval);

  const nombreVariable = (idvariable) =>
    variables.find(v => v.idvariable === idvariable)?.nombrevariable || "Variable desconocida";

  const getNombreCriterio = (idCrit) =>
    criterios.find(c => c.idcriterio === idCrit)?.nombrecriterio || `Criterio ${idCrit}`;

  const getDescripcionCriterio = (idCrit) =>
    criterios.find(c => c.idcriterio === idCrit)?.descripcioncriterio || "";

  const getIdVariableFromCriterio = (idCrit) =>
    criterios.find(c => c.idcriterio === idCrit)?.idvariable || null;

  if (cargando) return <p style={{ textAlign: "center", padding: "20px" }}>Cargando...</p>;

  const totalPaginasGeneral = Math.ceil(data.length / ELEMENTOS_POR_PAGINA_GENERAL);
  const inicio = (paginaGeneral - 1) * ELEMENTOS_POR_PAGINA_GENERAL;
  const dataPaginada = data.slice(inicio, inicio + ELEMENTOS_POR_PAGINA_GENERAL);

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ color: "#023047", fontWeight: 700, marginBottom: "20px" }}>
        Evaluaciones Finalizadas
      </h2>

      <table style={table}>
        <thead>
          <tr style={trHead}>
            <th style={th}>Empleado</th>
            <th style={th}>Puntaje Auto</th>
            <th style={th}>Evaluador Auto</th>
            <th style={th}>Puntaje Supervisor</th>
            <th style={th}>Evaluador Supervisor</th>
            <th style={th}>Promedio</th>
            <th style={th}>Acción</th>
          </tr>
        </thead>

        <tbody>
          {dataPaginada.map((row, idx) => {
            const realIdx = inicio + idx;
            const puntAuto = Number(row.auto?.puntajetotal || 0);
            const puntCoord = Number(row.coord?.puntajetotal || 0);
            const promedio = row.auto && row.coord ? ((puntAuto + puntCoord) / 2).toFixed(2) : "Pendiente";

            return (
              <tr key={realIdx}>
                <td style={td}>{row.empleado}</td>
                <td style={td}>{row.auto?.puntajetotal ?? "-"}</td>
                <td style={td}>{row.autoUsuario || "-"}</td>
                <td style={td}>{row.coord?.puntajetotal ?? "-"}</td>
                <td style={td}>{row.coordUsuario || "-"}</td>
                <td style={td}>{promedio}</td>
                <td style={td}>
                  <button onClick={() => abrirModal(row, realIdx)} style={btnDetail}>
                    Ver Detalles
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPaginasGeneral > 1 && (
        <div style={pagerRow}>
          <button disabled={paginaGeneral === 1} onClick={() => setPaginaGeneral(paginaGeneral - 1)} style={buttonPager}>
            ⬅ Anterior
          </button>
          <span>Página {paginaGeneral} de {totalPaginasGeneral}</span>
          <button disabled={paginaGeneral === totalPaginasGeneral} onClick={() => setPaginaGeneral(paginaGeneral + 1)} style={buttonPager}>
            Siguiente ➡
          </button>
        </div>
      )}

      {/* 🔥 MODAL */}
      {modalAbierto && rowSeleccionada && (() => {
        const criteriosAuto = criteriosPorEval(rowSeleccionada.auto?.idevaluacion);

        // agrupación real por variable en páginas independientes
        const paginas = [];
        const variablesUnicas = [...new Set(criteriosAuto.map(c => getIdVariableFromCriterio(c.idcriterio)))];

        variablesUnicas.forEach(varId => {
          const critDeVariable = criteriosAuto.filter(c =>
            getIdVariableFromCriterio(c.idcriterio) === varId
          );

          // dividir los criterios de la variable en páginas
          for (let i = 0; i < critDeVariable.length; i += CRITERIOS_POR_PAGINA) {
            paginas.push({
              variableId: varId,
              criterios: critDeVariable.slice(i, i + CRITERIOS_POR_PAGINA)
            });
          }
        });

        const paginaActual = paginaDetalle[realIdxSeleccionado] || 0;
        const pagina = paginas[paginaActual];
        const totalPaginas = paginas.length;

        return (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <button onClick={cerrarModal} style={modalCerrar}>✖</button>

              <h2 style={{ textAlign: "center", marginBottom: "10px", color: "#023047" }}>
                Evaluación de {rowSeleccionada.empleado}
              </h2>

              <h3 style={headVar}>{nombreVariable(pagina.variableId)}</h3>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#023047", color: "white" }}>
                    <th style={thDetalle}>CRITERIO</th>
                    <th style={thDetalle}>AUTOEVAL</th>
                    <th style={thDetalle}>COORD.</th>
                    <th style={thDetalle}>OBSERVACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.criterios.map((critA, i) => {
                    const critCoord = criteriosPorEval(rowSeleccionada.coord?.idevaluacion)
                      .find(c => c.idcriterio === critA.idcriterio);

                    return (
                      <tr key={i}>
                        <td style={tdDetalle}>
                          <strong>{getNombreCriterio(critA.idcriterio)}</strong><br />
                          <small>{getDescripcionCriterio(critA.idcriterio)}</small>
                        </td>
                        <td style={tdDetalleCenter}>{critA.puntajecriterio}</td>
                        <td style={tdDetalleCenter}>{critCoord?.puntajecriterio ?? "-"}</td>
                        <td style={tdDetalle}>
                          {(critA.observacion || critCoord?.observacion)
                            ? <>
                                {critA.observacion && <div>🗒 <i>{critA.observacion}</i></div>}
                                {critCoord?.observacion && <div>🗒 <i>{critCoord.observacion}</i></div>}
                              </>
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPaginas > 1 && (
                <div style={pagerRow}>
                  <button
                    disabled={paginaActual === 0}
                    onClick={() =>
                      setPaginaDetalle(prev => ({ ...prev, [realIdxSeleccionado]: paginaActual - 1 }))
                    }
                    style={buttonPager}
                  >
                    ⬅ Anterior
                  </button>
                  <span>Página {paginaActual + 1} de {totalPaginas}</span>
                  <button
                    disabled={paginaActual === totalPaginas - 1}
                    onClick={() =>
                      setPaginaDetalle(prev => ({ ...prev, [realIdxSeleccionado]: paginaActual + 1 }))
                    }
                    style={buttonPager}
                  >
                    Siguiente ➡
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* =============== ESTILOS GENERALES =============== */
const table = { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden" };
const trHead = { background: "#023047", color: "white" };
const th = { padding: "12px", textAlign: "left", fontWeight: 600 };
const td = { padding: "10px", borderBottom: "1px solid #ddd" };
const btnDetail = { padding: "6px 12px", background: "#1E88E5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };

const thDetalle = { padding: "10px", fontWeight: 600, borderBottom: "1px solid #ddd" };
const tdDetalle = { padding: "10px", borderBottom: "1px solid #e5e7eb", backgroundColor: "white" };
const tdDetalleCenter = { ...tdDetalle, textAlign: "center" };
const headVar = {
  background: "#e8f1f8", padding: "10px",
  borderRadius: "6px", fontWeight: "700",
  color: "#023047", border: "1px solid #c9d6e4",
  marginBottom: "8px", textAlign: "center"
};
const pagerRow = { display: "flex", justifyContent: "center", alignItems: "center", gap: "18px", marginTop: "18px" };
const buttonPager = { padding: "6px 10px", background: "#023047", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" };

const modalOverlay = {
  position: "fixed",
  top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000
};
const modalContent = {
  background: "white",
  borderRadius: "10px",
  padding: "25px",
  width: "70vw",
  maxHeight: "85vh",
  overflowY: "auto",
  boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  position: "relative"
};
const modalCerrar = {
  position: "absolute",
  top: "12px",
  right: "12px",
  fontSize: "20px",
  border: "none",
  background: "transparent",
  cursor: "pointer"
};

export default EvaluacionesFinalizadas;
