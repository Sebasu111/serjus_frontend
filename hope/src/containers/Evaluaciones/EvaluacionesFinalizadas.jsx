import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

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

  // 🔥 Filtros
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroEvaluador, setFiltroEvaluador] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resEval, resEmp, resUsers, resCritEval, resCrit, resVars] =
          await Promise.all([
            axios.get(`${API_BASE}/evaluacion/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_BASE}/empleados/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_BASE}/usuarios/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_BASE}/evaluacioncriterio/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_BASE}/criterio/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_BASE}/variables/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
          ]);

        const evalDataRaw = resEval.data.results || resEval.data || [];
        const evalData = evalDataRaw.filter(
          (ev) =>
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

        // 🟢 Historial de evaluaciones (varias auto + varias coord)
        const historial = [];
        const empleadosUnicos = [...new Set(evalData.map((ev) => ev.idempleado))];

        empleadosUnicos.forEach((idEmpleado) => {
          const evaluacionesEmpleado = evalData
            .filter((ev) => ev.idempleado === idEmpleado)
            .sort((a, b) => new Date(a.fechaevaluacion) - new Date(b.fechaevaluacion));

          let actualAuto = null;

          evaluacionesEmpleado.forEach((ev) => {
            if (ev.modalidad === "Autoevaluación") {
              actualAuto = { auto: ev, coord: null };
              historial.push(actualAuto);
            } else if (ev.modalidad === "Evaluacion") {
              const pendiente = historial
                .filter((h) => h.auto?.idempleado === idEmpleado && !h.coord)
                .slice(-1)[0];
              if (pendiente) pendiente.coord = ev;
            }
          });
        });

        const finalRows = historial.map((h) => {
          const emp = empData.find(
            (e) => e.idempleado === Number(h.auto?.idempleado)
          );
          const getNombreUsuario = (idUsuario) =>
            usersData.find((u) => u.idusuario === idUsuario)?.nombreusuario ||
            "Desconocido";

          return {
            empleado: emp ? `${emp.nombre} ${emp.apellido}` : "Desconocido",
            auto: h.auto,
            coord: h.coord,
            autoUsuario: h.auto ? getNombreUsuario(h.auto.idusuario) : "",
            coordUsuario: h.coord ? getNombreUsuario(h.coord.idusuario) : ""
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
    setPaginaDetalle((prev) => ({ ...prev, [realIdx]: 0 }));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setRowSeleccionada(null);
    setRealIdxSeleccionado(null);
  };

  const criteriosPorEval = (idEval) =>
    criteriosEval.filter((c) => c.idevaluacion === idEval);

  const nombreVariable = (idvariable) =>
    variables.find((v) => v.idvariable === idvariable)?.nombrevariable ||
    "Variable desconocida";

  const getNombreCriterio = (idCrit) =>
    criterios.find((c) => c.idcriterio === idCrit)?.nombrecriterio ||
    `Criterio ${idCrit}`;

  const getDescripcionCriterio = (idCrit) =>
    criterios.find((c) => c.idcriterio === idCrit)?.descripcioncriterio || "";

  const getIdVariableFromCriterio = (idCrit) =>
    criterios.find((c) => c.idcriterio === idCrit)?.idvariable || null;

  if (cargando)
    return <p style={{ textAlign: "center", padding: "20px" }}>Cargando...</p>;

  /* 🔥 FILTRO: Empleado + Evaluador */
  const dataFiltrada = data.filter((row) => {
    const coincideEmpleado =
      filtroEmpleado === "" ||
      row.empleado.toLowerCase().includes(filtroEmpleado.toLowerCase());

    const coincideEvaluador =
      filtroEvaluador === "" ||
      row.autoUsuario.toLowerCase().includes(filtroEvaluador.toLowerCase()) ||
      row.coordUsuario.toLowerCase().includes(filtroEvaluador.toLowerCase());

    return coincideEmpleado && coincideEvaluador;
  });

  const totalPaginasGeneral = Math.ceil(dataFiltrada.length / ELEMENTOS_POR_PAGINA_GENERAL);
  const inicio = (paginaGeneral - 1) * ELEMENTOS_POR_PAGINA_GENERAL;
  const dataPaginada = dataFiltrada.slice(inicio, inicio + ELEMENTOS_POR_PAGINA_GENERAL);

  return (
    <div style={{ padding: "30px" }}>

      <h2 style={{ color: "#023047", fontWeight: 700, marginBottom: "20px" }}>
        Evaluaciones Finalizadas
      </h2>

      {/* 🔍 FILTROS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ fontWeight: 600 }}>Colaborador</label>
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={filtroEmpleado}
            onChange={(e) => {
              setFiltroEmpleado(e.target.value);
              setPaginaGeneral(1);
            }}
            style={{
              width: "220px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>Evaluador</label>
          <input
            type="text"
            placeholder="Buscar evaluador..."
            value={filtroEvaluador}
            onChange={(e) => {
              setFiltroEvaluador(e.target.value);
              setPaginaGeneral(1);
            }}
            style={{
              width: "220px",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        {(filtroEmpleado !== "" || filtroEvaluador !== "") && (
          <button
            onClick={() => {
              setFiltroEmpleado("");
              setFiltroEvaluador("");
              setPaginaGeneral(1);
            }}
            style={{
              padding: "10px 14px",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              height: "40px",
              alignSelf: "flex-end",
              cursor: "pointer",
            }}
          >
            Limpiar filtros ✖
          </button>
        )}
      </div>

      <table style={table}>
        <thead>
          <tr style={trHead}>
            <th style={th}>Colaborador</th>
            <th style={th}>Puntaje Auto</th>
            <th style={th}>Evaluador Supervisor</th>
            <th style={th}>Puntaje Supervisor</th>
            <th style={th}>Promedio</th>
            <th style={th}>Acción</th>
          </tr>
        </thead>

        <tbody>
          {dataPaginada.map((row, idx) => {
            const realIdx = inicio + idx;
            const puntAuto = Number(row.auto?.puntajetotal || 0);
            const puntCoord = Number(row.coord?.puntajetotal || 0);
            const promedio =
              row.auto && row.coord
                ? ((puntAuto + puntCoord) / 2).toFixed(2)
                : "Pendiente";

            return (
              <tr key={realIdx}>
                <td style={td}>{row.empleado}</td>
                <td style={td}>{row.auto?.puntajetotal ?? "-"}</td>
                <td style={td}>{row.coordUsuario || "-"}</td>
                <td style={td}>{row.coord?.puntajetotal ?? "-"}</td>
                <td style={td}>{promedio}</td>
                <td style={td}>
                  <button
                    onClick={() => abrirModal(row, realIdx)}
                    style={btnDetail}
                  >
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
          <button
            disabled={paginaGeneral === 1}
            onClick={() => setPaginaGeneral(paginaGeneral - 1)}
            style={buttonPager}
          >
            ⬅ Anterior
          </button>
          <span>
            Página {paginaGeneral} de {totalPaginasGeneral}
          </span>
          <button
            disabled={paginaGeneral === totalPaginasGeneral}
            onClick={() => setPaginaGeneral(paginaGeneral + 1)}
            style={buttonPager}
          >
            Siguiente ➡
          </button>
        </div>
      )}

      {/* 🔥 MODAL */}
      {modalAbierto &&
        rowSeleccionada &&
        (() => {
          const criteriosAuto = criteriosPorEval(
            rowSeleccionada.auto?.idevaluacion
          );

          const paginas = [];
          const variablesUnicas = [
            ...new Set(
              criteriosAuto.map((c) => getIdVariableFromCriterio(c.idcriterio))
            )
          ];

          variablesUnicas.forEach((varId) => {
            const critDeVariable = criteriosAuto.filter(
              (c) => getIdVariableFromCriterio(c.idcriterio) === varId
            );
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

          const criteriosCoord = criteriosPorEval(
            rowSeleccionada.coord?.idevaluacion
          );

          return (
            <div style={modalOverlay}>
              <div style={modalContent}>
                <button onClick={cerrarModal} style={modalCerrar}>
                  ✖
                </button>

                <h2
                  style={{
                    textAlign: "center",
                    marginBottom: "10px",
                    color: "#023047"
                  }}
                >
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
                      const critCoord = criteriosCoord.find(
                        (c) => c.idcriterio === critA.idcriterio
                      );

                      return (
                        <tr key={i}>
                          <td style={tdDetalle}>
                            <strong>{getNombreCriterio(critA.idcriterio)}</strong>
                            <br />
                            <small>{getDescripcionCriterio(critA.idcriterio)}</small>
                          </td>
                          <td style={tdDetalleCenter}>{critA.puntajecriterio}</td>
                          <td style={tdDetalleCenter}>
                            {critCoord?.puntajecriterio ?? "-"}
                          </td>
                          <td style={tdDetalle}>
                            {critA.observacion || critCoord?.observacion ? (
                              <>
                                {critA.observacion && (
                                  <div>
                                    🗒 <i>{critA.observacion}</i>
                                  </div>
                                )}
                                {critCoord?.observacion && (
                                  <div>
                                    🗒 <i>{critCoord.observacion}</i>
                                  </div>
                                )}
                              </>
                            ) : (
                              "-"
                            )}
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
                        setPaginaDetalle((prev) => ({
                          ...prev,
                          [realIdxSeleccionado]: paginaActual - 1
                        }))
                      }
                      style={buttonPager}
                    >
                      ⬅ Anterior
                    </button>
                    <span>
                      Página {paginaActual + 1} de {totalPaginas}
                    </span>
                    <button
                      disabled={paginaActual === totalPaginas - 1}
                      onClick={() =>
                        setPaginaDetalle((prev) => ({
                          ...prev,
                          [realIdxSeleccionado]: paginaActual + 1
                        }))
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
const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  borderRadius: "8px",
  overflow: "hidden"
};
const trHead = { background: "#023047", color: "white" };
const th = { padding: "12px", textAlign: "left", fontWeight: 600 };
const td = { padding: "10px", borderBottom: "1px solid #ddd" };
const btnDetail = {
  padding: "6px 12px",
  background: "#1E88E5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const thDetalle = {
  padding: "10px",
  fontWeight: 600,
  borderBottom: "1px solid #ddd"
};
const tdDetalle = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "white"
};
const tdDetalleCenter = { ...tdDetalle, textAlign: "center" };
const headVar = {
  background: "#e8f1f8",
  padding: "10px",
  borderRadius: "6px",
  fontWeight: "700",
  color: "#023047",
  border: "1px solid #c9d6e4",
  marginBottom: "8px",
  textAlign: "center"
};
const pagerRow = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "18px",
  marginTop: "18px"
};
const buttonPager = {
  padding: "6px 10px",
  background: "#023047",
  color: "white",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer"
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.6)",
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
  position: "absolute",
  top: "50%",
  right: "150px",      // 👉 distancia desde la derecha
  transform: "translateY(-50%)" // 👉 lo centra verticalmente
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
