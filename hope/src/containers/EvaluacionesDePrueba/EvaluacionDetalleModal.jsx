import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const CRITERIOS_POR_PAGINA = 5;

const EvaluacionDetalleModal = ({
    abierto,
    onClose,
    evaluacion,
}) => {

    const [criteriosEval, setCriteriosEval] = useState([]);
    const [criterios, setCriterios] = useState([]);
    const [variables, setVariables] = useState([]);
    const [evaluacionesGlobales, setEvaluacionesGlobales] =
        useState([]);

    const [paginaActual, setPaginaActual] =
        useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!abierto || !evaluacion) return;

        setPaginaActual(0);

        cargarDatos();

    }, [abierto, evaluacion]);

    const cargarDatos = async () => {

        try {

            const [
                resEvalCrit,
                resCrit,
                resVars,
                resEvalGlobal
            ] = await Promise.all([

                axios.get(`${API}/evaluacioncriterio/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/criterio/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/variables/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/evaluacion-global/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            setCriteriosEval(
                resEvalCrit.data.results ||
                resEvalCrit.data ||
                []
            );

            setCriterios(
                resCrit.data.results ||
                resCrit.data ||
                []
            );

            setVariables(
                resVars.data.results ||
                resVars.data ||
                []
            );

            setEvaluacionesGlobales(
                resEvalGlobal.data.results ||
                resEvalGlobal.data ||
                []
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    if (!abierto || !evaluacion) return null;

    if (loading) {
        return (
            <div style={modalOverlay}>
                <div style={modalContent}>
                    Cargando detalle...
                </div>
            </div>
        );
    }

    const criteriosPorEval = (idEval) =>
        criteriosEval.filter(
            (c) =>
                Number(c.idevaluacion) === Number(idEval)
        );

    const criteriosAuto = criteriosPorEval(
        evaluacion.auto?.idevaluacion
    );

    const criteriosCoord = criteriosPorEval(
        evaluacion.coord?.idevaluacion
    );

    const getGlobal = (idEvaluacion) =>
        evaluacionesGlobales.find(
            (g) =>
                Number(g.idevaluacion) ===
                Number(idEvaluacion)
        );

    const globalAuto = getGlobal(
        evaluacion.auto?.idevaluacion
    );

    const globalCoord = getGlobal(
        evaluacion.coord?.idevaluacion
    );

    const getNombreCriterio = (idCrit) =>
        criterios.find(
            (c) =>
                Number(c.idcriterio) === Number(idCrit)
        )?.nombrecriterio || "Sin criterio";

    const getDescripcionCriterio = (idCrit) =>
        criterios.find(
            (c) =>
                Number(c.idcriterio) === Number(idCrit)
        )?.descripcioncriterio || "";

    const getIdVariable = (idCrit) =>
        criterios.find(
            (c) =>
                Number(c.idcriterio) === Number(idCrit)
        )?.idvariable;

    const nombreVariable = (idVar) =>
        variables.find(
            (v) =>
                Number(v.idvariable) === Number(idVar)
        )?.nombrevariable || "Variable";

    // 🔥 PAGINAS
    const paginas = [];

    // 🔥 eliminar criterios duplicados
    const criteriosUnicos = criteriosAuto.filter(
        (item, index, self) =>
            index ===
            self.findIndex(
                (c) =>
                    Number(c.idcriterio) ===
                    Number(item.idcriterio)
            )
    );

    // 🔥 variables únicas reales
    const variablesUnicas = [
        ...new Set(
            criteriosUnicos.map((c) =>
                getIdVariable(c.idcriterio)
            )
        ),
    ];

    variablesUnicas.forEach((varId) => {

        const criteriosVariable = criteriosUnicos.filter(
            (c) =>
                Number(
                    getIdVariable(c.idcriterio)
                ) === Number(varId)
        );

        for (
            let i = 0;
            i < criteriosVariable.length;
            i += CRITERIOS_POR_PAGINA
        ) {

            paginas.push({
                variableId: varId,
                criterios: criteriosVariable.slice(
                    i,
                    i + CRITERIOS_POR_PAGINA
                ),
            });
        }
    });

    // 🔥 agregar página final de resumen
    paginas.push({
        tipo: "resumen",
    });

    // 🔥 obtener página actual
    const pagina = paginas[paginaActual];

    // 🔥 validar si es resumen
    const esPaginaResumen =
        pagina?.tipo === "resumen";

    return (
        <div style={modalOverlay}>

            <div style={modalContent}>

                <div style={headerModal}>

                    <h2
                        style={{
                            color: "#023047",
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "700",
                        }}
                    >
                        Evaluación de {evaluacion.empleado}
                    </h2>

                    <button
                        onClick={onClose}
                        style={btnCerrar}
                    >
                        ✖
                    </button>

                </div>

                {!esPaginaResumen && (
                    <>
                        <h3 style={headVar}>
                            {nombreVariable(
                                pagina.variableId
                            )}
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: "#023047",
                                        color: "white",
                                    }}
                                >
                                    <th style={th}>
                                        Criterio
                                    </th>

                                    <th style={th}>
                                        Autoevaluación
                                    </th>

                                    <th style={th}>
                                        Coordinador
                                    </th>

                                    <th style={th}>
                                        Observaciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagina?.criterios?.map(
                                    (crit, idx) => {

                                        const coord =
                                            criteriosCoord.find(
                                                (c) =>
                                                    Number(c.idcriterio) ===
                                                    Number(
                                                        crit.idcriterio
                                                    )
                                            );

                                        return (
                                            <tr key={idx}>

                                                <td style={td}>
                                                    <strong>
                                                        {getNombreCriterio(
                                                            crit.idcriterio
                                                        )}
                                                    </strong>

                                                    <br />

                                                    <small>
                                                        {getDescripcionCriterio(
                                                            crit.idcriterio
                                                        )}
                                                    </small>
                                                </td>

                                                <td style={tdCenter}>
                                                    {crit.puntajecriterio}
                                                </td>

                                                <td style={tdCenter}>
                                                    {coord?.puntajecriterio ?? "-"}
                                                </td>

                                                <td style={td}>

                                                    {crit.observacion && (
                                                        <div
                                                            style={{
                                                                marginBottom: "10px",
                                                                padding: "8px",
                                                                background: "#f1f5f9",
                                                                borderRadius: "6px",
                                                            }}
                                                        >
                                                            <strong style={{ color: "#023047" }}>
                                                                Autoevaluación:
                                                            </strong>

                                                            <div style={{ marginTop: "4px" }}>
                                                                {crit.observacion}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {coord?.observacion && (
                                                        <div
                                                            style={{
                                                                padding: "8px",
                                                                background: "#fff7ed",
                                                                borderRadius: "6px",
                                                            }}
                                                        >
                                                            <strong style={{ color: "#9a3412" }}>
                                                                Evaluacion:
                                                            </strong>

                                                            <div style={{ marginTop: "4px" }}>
                                                                {coord.observacion}
                                                            </div>
                                                        </div>
                                                    )}

                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </>
                )}

                {esPaginaResumen && (
                    <div style={{ marginTop: "30px" }}>

                        {/* AUTOEVALUACION */}
                        {globalAuto && (
                            <div style={boxResumen}>

                                <h3 style={tituloResumen}>
                                    Autoevaluación
                                </h3>

                                <div style={gridResumen}>

                                    <div>
                                        <strong>Fortalezas</strong>
                                        <p>{globalAuto.fortalezas || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Áreas de mejora</strong>
                                        <p>{globalAuto.mejoras || "-"}</p>
                                    </div>
                                    <div>
                                        <strong>Total AutoEvaluacion</strong>
                                        <p>{globalAuto.total || "-"}</p>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* COORDINADOR */}
                        {globalCoord && (
                            <div style={boxResumen}>

                                <h3 style={tituloResumen}>
                                    Evaluación Coordinador
                                </h3>

                                <div style={gridResumen}>

                                    <div>
                                        <strong>Fortalezas</strong>
                                        <p>{globalCoord.fortalezas || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Áreas de mejora</strong>
                                        <p>{globalCoord.mejoras || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Recomendaciones</strong>
                                        <p>{globalCoord.recomendaciones || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Justificación</strong>
                                        <p>{globalCoord.justificacion || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Decisión</strong>
                                        <p>{globalCoord.decision || "-"}</p>
                                    </div>

                                    <div>
                                        <strong>Total Evaluacion</strong>
                                        <p>{globalCoord.total || "-"}</p>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* PAGINACION */}

                {paginas.length > 1 && (

                    <div style={pagerRow}>

                        <button
                            disabled={paginaActual === 0}
                            onClick={() =>
                                setPaginaActual(
                                    paginaActual - 1
                                )
                            }
                            style={btnPager}
                        >
                            ⬅ Anterior
                        </button>

                        <span>
                            Página {paginaActual + 1} de{" "}
                            {paginas.length}
                        </span>

                        <button
                            disabled={
                                paginaActual ===
                                paginas.length - 1
                            }
                            onClick={() =>
                                setPaginaActual(
                                    paginaActual + 1
                                )
                            }
                            style={btnPager}
                        >
                            Siguiente ➡
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ESTILOS */

const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: "240px",
};

const modalContent = {
    width: "70vw",
    maxWidth: "1200px",
    maxHeight: "90vh",
    overflowY: "auto",

    background: "white",
    borderRadius: "12px",
    padding: "25px",

    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

const headerModal = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
};

const btnCerrar = {
    border: "none",
    color: "black",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "0.2s",
};

const th = {
    padding: "12px",
};

const td = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
};

const tdCenter = {
    ...td,
    textAlign: "center",
};

const headVar = {
    background: "#e8f1f8",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
    textAlign: "center",
    color: "#023047",
};

const pagerRow = {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    marginTop: "20px",
};

const btnPager = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#023047",
    color: "white",
    cursor: "pointer",
};

const boxResumen = {
    marginTop: "25px",
    padding: "20px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #dbeafe",
};

const tituloResumen = {
    color: "#023047",
    marginBottom: "15px",
};

const gridResumen = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
};

export default EvaluacionDetalleModal;