import React, { useEffect, useState } from "react";
import axios from "axios";
import EvaluacionDetalleModal from "./EvaluacionDetalleModal";
import { showToast } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const EvaluacionesFinalizadas = () => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
    const [equipos, setEquipos] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const EVALUACIONES_POR_PAGINA = 5;
    const rol = Number(sessionStorage.getItem("idRol"));
    const idUsuario = Number(sessionStorage.getItem("idUsuario"));

    const usuarioActual = JSON.parse(
        sessionStorage.getItem("usuario")
    );

    // filtros
    const [filtroEmpleado, setFiltroEmpleado] =
        useState("");

    const [filtroEvaluador, setFiltroEvaluador] =
        useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [
                resEval,
                resEmp,
                resUsuarios,
                resEvalGlobal,
                resEvalCriterio,
                resEquipos
            ] = await Promise.all([
                axios.get(`${API}/evaluacion/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/empleados/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/usuarios/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/evaluacion-global/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/evaluacioncriterio/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get(`${API}/equipos/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            const evals =
                resEval.data.results || resEval.data || [];

            const empleadosData =
                resEmp.data.results || resEmp.data || [];

            const usuariosData =
                resUsuarios.data.results ||
                resUsuarios.data ||
                [];

            const globales =
                resEvalGlobal.data.results ||
                resEvalGlobal.data ||
                [];

            const criteriosEval =
                resEvalCriterio.data.results ||
                resEvalCriterio.data ||
                [];

            const equiposData =
                resEquipos.data.results ||
                resEquipos.data ||
                [];

            setEquipos(equiposData);
            setEmpleados(empleadosData);
            setUsuarios(usuariosData);

            console.log({
                evals,
                empleadosData,
                usuariosData,
                globales,
                criteriosEval
            })

            console.log(
                evals.map(e => ({
                    id: e.idevaluacion,
                    empleado: e.idempleado,
                    modalidad: e.modalidad,
                    usuario: e.idusuario,
                    total: e.puntajetotal
                }))
            );

            // 🔥 SOLO evaluaciones de período de prueba
            const evaluacionesPeriodo =
                evals.filter(
                    (ev) =>
                        globales.some(
                            (g) =>
                                g.idevaluacion ===
                                ev.idevaluacion
                        )
                );

            // 🟢 Historial REAL de evaluaciones
            const historial = [];

            const empleadosUnicos = [
                ...new Set(
                    evaluacionesPeriodo.map((ev) => ev.idempleado)
                ),
            ];

            empleadosUnicos.forEach((idEmpleado) => {

                const evaluacionesEmpleado = evaluacionesPeriodo
                    .filter((ev) => ev.idempleado === idEmpleado)
                    .sort(
                        (a, b) =>
                            new Date(a.fechaevaluacion) -
                            new Date(b.fechaevaluacion)
                    );

                let actualAuto = null;

                evaluacionesEmpleado.forEach((ev) => {

                    if (ev.modalidad === "Autoevaluación") {

                        actualAuto = {
                            auto: ev,
                            coord: null,
                        };

                        historial.push(actualAuto);

                    } else if (ev.modalidad === "Evaluacion") {

                        const pendiente = historial
                            .filter(
                                (h) =>
                                    h.auto?.idempleado ===
                                    idEmpleado &&
                                    !h.coord
                            )
                            .slice(-1)[0];

                        if (pendiente) {
                            pendiente.coord = ev;
                        }
                    }
                });
            });

            const rows = historial.map((h) => {

                const autoTotal = Number(
                    h.auto?.puntajetotal || 0
                );

                const coordTotal = Number(
                    h.coord?.puntajetotal || 0
                );

                const promedio =
                    h.auto && h.coord
                        ? ((autoTotal + coordTotal) / 2).toFixed(2)
                        : autoTotal || coordTotal;

                const empleadoId =
                    h.auto?.idempleado ||
                    h.coord?.idempleado;

                const emp = empleadosData.find(
                    (e) =>
                        e.idempleado === Number(empleadoId)
                );

                const getNombreUsuarioEvaluacion = (
                    idevaluacion
                ) => {
                    const criterio =
                        criteriosEval.find(
                            (c) =>
                                Number(c.idevaluacion) ===
                                Number(idevaluacion)
                        );

                    if (!criterio)
                        return "Desconocido";

                    return (
                        usuariosData.find(
                            (u) =>
                                Number(u.idusuario) === Number(criterio.idusuario)
                        )?.nombreusuario ||
                        "Desconocido"
                    );
                };

                const global =
                    globales.find(
                        (g) =>
                            g.idevaluacion ===
                            h.coord?.idevaluacion ||
                            g.idevaluacion ===
                            h.auto?.idevaluacion
                    ) || {};

                return {
                    empleado: emp
                        ? `${emp.nombre} ${emp.apellido}`
                        : "Desconocido",

                    auto: h.auto,
                    coord: h.coord,

                    autoUsuario: h.auto
                        ? (() => {

                            const criterio = criteriosEval.find(
                                (c) =>
                                    Number(c.idevaluacion) ===
                                    Number(h.auto.idevaluacion)
                            );

                            return criterio?.idusuario || null;

                        })()
                        : null,

                    autoUsuarioNombre: h.auto
                        ? getNombreUsuarioEvaluacion(
                            h.auto.idevaluacion
                        )
                        : "",

                    coordUsuario: h.coord
                        ? (() => {

                            const usuarioCoord =
                                usuariosData.find(
                                    (u) =>
                                        Number(u.idusuario) ===
                                        Number(h.coord.idusuario)
                                );

                            const empleadoCoord =
                                empleadosData.find(
                                    (e) =>
                                        Number(e.idempleado) ===
                                        Number(usuarioCoord?.idempleado)
                                );

                            return empleadoCoord
                                ? `${empleadoCoord.nombre} ${empleadoCoord.apellido}`
                                : usuarioCoord?.nombreusuario || "Desconocido";
                        })()
                        : "",

                    decision: global.decision,
                    total: promedio,
                };
            });

            const rowsOrdenadas = rows.sort((a, b) => {

                const fechaA =
                    new Date(
                        a.coord?.fechaevaluacion ||
                        a.auto?.fechaevaluacion
                    );

                const fechaB =
                    new Date(
                        b.coord?.fechaevaluacion ||
                        b.auto?.fechaevaluacion
                    );

                // 🔥 más reciente primero
                return fechaB - fechaA;
            });

            // 🔥 ADMIN VE TODO
            if (rol === 5) {

                setEvaluaciones(rowsOrdenadas);

            } else if (rol === 1) {

                // 🔥 BUSCAR MI EQUIPO
                const miEquipo = equiposData.find(
                    (eq) =>
                        Number(eq.idcoordinador) ===
                        Number(usuarioActual.idempleado)
                );

                // 🔥 SI NO TIENE EQUIPO SOLO VE SUS EVALUACIONES
                if (!miEquipo) {

                    const propias = rowsOrdenadas.filter(
                        (row) =>
                            Number(row.coord?.idusuario) === idUsuario
                    );

                    setEvaluaciones(propias);

                } else {

                    // 🔥 EMPLEADOS DE MI EQUIPO
                    const empleadosEquipo = empleadosData.filter(
                        (emp) =>
                            Number(emp.idequipo) ===
                            Number(miEquipo.idequipo)
                    );

                    // 🔥 IDS DEL EQUIPO
                    const idsEquipo = empleadosEquipo.map(
                        (emp) => Number(emp.idempleado)
                    );

                    // 🔥 SOLO MI EQUIPO + MIS EVALUACIONES
                    const filtradas = rowsOrdenadas.filter(
                        (row) => {

                            const empleadoId =
                                Number(
                                    row.auto?.idempleado ||
                                    row.coord?.idempleado
                                );

                            const esDeMiEquipo =
                                idsEquipo.includes(empleadoId);

                            const esMia =
                                Number(row.coord?.idusuario) ===
                                idUsuario;

                            return esDeMiEquipo || esMia;
                        }
                    );

                    setEvaluaciones(filtradas);
                }

            } else {

                // 🔥 ACOMPAÑANTE SOLO VE SUS EVALUACIONES
                const filtradas = rowsOrdenadas.filter(
                    (row) => {

                        return (
                            Number(row.autoUsuario) === idUsuario ||
                            Number(row.coord?.idusuario) === idUsuario
                        );
                    }
                );

                setEvaluaciones(filtradas);
            }
        } catch (error) {
            console.error(error);
            showToast(
                "Error al cargar evaluaciones finalizadas",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // filtros
    const dataFiltrada = evaluaciones.filter(
        (row) => {
            const coincideEmpleado =
                filtroEmpleado === "" ||
                row.empleado
                    .toLowerCase()
                    .includes(
                        filtroEmpleado.toLowerCase()
                    );

            const coincideEvaluador =
                filtroEvaluador === "" ||
                row.autoUsuarioNombre
                    .toLowerCase()
                    .includes(
                        filtroEvaluador.toLowerCase()
                    ) ||
                row.coordUsuario
                    .toLowerCase()
                    .includes(
                        filtroEvaluador.toLowerCase()
                    );

            return (
                coincideEmpleado &&
                coincideEvaluador
            );
        }
    );

    // 🔥 PAGINACIÓN
    const totalPaginas = Math.ceil(
        dataFiltrada.length /
        EVALUACIONES_POR_PAGINA
    );

    const indiceInicial =
        (paginaActual - 1) *
        EVALUACIONES_POR_PAGINA;

    const indiceFinal =
        indiceInicial +
        EVALUACIONES_POR_PAGINA;

    const evaluacionesPaginadas =
        dataFiltrada.slice(
            indiceInicial,
            indiceFinal
        );

    useEffect(() => {
        setPaginaActual(1);
    }, [filtroEmpleado, filtroEvaluador]);

    if (loading) {
        return (
            <p style={{ padding: "20px" }}>
                Cargando evaluaciones...
            </p>
        );
    }

    return (
        <div style={{ padding: "30px" }}>
            <h2
                style={{
                    color: "#023047",
                    marginBottom: "20px",
                }}
            >
                Evaluaciones Finalizadas
            </h2>

            {/* FILTROS */}
            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "20px",
                }}
            >
                <input
                    type="text"
                    placeholder="Buscar colaborador..."
                    value={filtroEmpleado}
                    onChange={(e) =>
                        setFiltroEmpleado(
                            e.target.value
                        )
                    }
                    style={inputStyle}
                />

                <input
                    type="text"
                    placeholder="Buscar evaluador..."
                    value={filtroEvaluador}
                    onChange={(e) =>
                        setFiltroEvaluador(
                            e.target.value
                        )
                    }
                    style={inputStyle}
                />
            </div>

            {/* TABLA */}
            <table style={table}>
                <thead>
                    <tr style={thead}>
                        <th style={th}>
                            Colaborador
                        </th>

                        <th style={th}>
                            Autoevaluación
                        </th>

                        <th style={th}>
                            Coordinador
                        </th>

                        <th style={th}>
                            Evaluación
                        </th>

                        <th style={th}>
                            Concenso
                        </th>

                        <th style={th}>
                            Decisión Final
                        </th>

                        <th style={th}>
                            Detalle
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {evaluacionesPaginadas.map((row, idx) => {

                        const autoTotal =
                            Number(row.auto?.puntajetotal || 0);

                        const coordTotal =
                            Number(row.coord?.puntajetotal || 0);

                        // 🔥 promedio
                        const promedio =
                            row.coord
                                ? ((autoTotal + coordTotal) / 2).toFixed(2)
                                : autoTotal.toFixed(2);

                        return (
                            <tr key={idx}>
                                {/* COLABORADOR */}
                                <td style={td}>
                                    {row.empleado}
                                </td>

                                {/* AUTOEVALUACION */}
                                <td style={td}>
                                    {row.auto
                                        ? `${autoTotal.toFixed(2)}`
                                        : "-"}
                                </td>

                                {/* COORDINADOR */}
                                <td style={td}>
                                    {row.coordUsuario || "-"}
                                </td>

                                {/* EVALUACION */}
                                <td style={td}>
                                    {row.coord
                                        ? `${coordTotal.toFixed(2)}`
                                        : "-"}
                                </td>

                                {/* TOTAL */}
                                <td style={td}>
                                    {promedio}
                                </td>

                                {/* DECISION */}
                                <td style={td}>
                                    {(() => {

                                        const total = Number(promedio);

                                        if (total >= 60) {
                                            return "Se confirma en el puesto";
                                        }

                                        if (total >= 41 && total <= 59) {
                                            return "Se confirma con plan de mejora";
                                        }

                                        return "No se confirma";
                                    })()}
                                </td>

                                {/* BOTON DETALLE */}
                                <td style={td}>
                                    <button
                                        style={{
                                            padding: "8px 14px",
                                            border: "none",
                                            borderRadius: "6px",
                                            background: "#023047",
                                            color: "white",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            showToast(
                                                "Abriendo detalle de evaluación",
                                                "info"
                                            );

                                            setEvaluacionSeleccionada(row);
                                            setModalAbierto(true);
                                        }}
                                    >
                                        Ver detalle
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>
            {/* PAGINACIÓN */}
            {totalPaginas > 1 && (
                <div
                    style={{
                        marginTop: "20px",
                        textAlign: "center",
                    }}
                >
                    {Array.from(
                        { length: totalPaginas },
                        (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() =>
                                    setPaginaActual(i + 1)
                                }
                                style={{
                                    margin: "0 5px",
                                    padding: "8px 14px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    background:
                                        paginaActual === i + 1
                                            ? "#023047"
                                            : "#dbeafe",
                                    color:
                                        paginaActual === i + 1
                                            ? "white"
                                            : "#023047",
                                }}
                            >
                                {i + 1}
                            </button>
                        )
                    )}
                </div>
            )}
            <EvaluacionDetalleModal
                abierto={modalAbierto}
                onClose={() => setModalAbierto(false)}
                evaluacion={evaluacionSeleccionada}
            />
        </div>
    );
};

/* ESTILOS */
const table = {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
};

const thead = {
    background: "#023047",
    color: "white",
};

const th = {
    padding: "12px",
    textAlign: "left",
};

const td = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
};

const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "250px",
};

export default EvaluacionesFinalizadas;