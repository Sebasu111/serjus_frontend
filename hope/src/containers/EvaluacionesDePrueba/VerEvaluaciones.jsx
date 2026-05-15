import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";

const API_BASE = process.env.REACT_APP_API_URL;

const VerEvaluaciones = ({ onSeleccionarEvaluacion }) => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [equipos, setEquipos] = useState([]);
    const EVALUACIONES_POR_PAGINA = 5;

    const token = sessionStorage.getItem("token");

    const usuarioActual = JSON.parse(
        sessionStorage.getItem("usuario")
    );

    const obtenerNombreEmpleado = (idempleado) => {
        const emp = empleados.find(
            (e) => Number(e.idempleado) === Number(idempleado)
        );

        if (!emp) return "Empleado no encontrado";

        return `${emp.nombre} ${emp.apellido}`;
    };

    // 🔹 Cargar evaluaciones
    useEffect(() => {
        const cargarEvaluaciones = async () => {
            try {
                const [resEval, resEmp, resEquipos] = await Promise.all([
                    axios.get(`${API_BASE}/evaluacion/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    axios.get(`${API_BASE}/empleados/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),

                    axios.get(`${API_BASE}/equipos/`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
                const data = resEval.data.results || resEval.data || [];
                const empleadosData =
                    resEmp.data.results || resEmp.data || [];

                const equiposData =
                    resEquipos.data.results || resEquipos.data || [];

                setEquipos(equiposData);
                setEmpleados(empleadosData);

                // 🔥 evaluaciones finales (admin/coordinador)
                const evaluacionesCoord = data.filter(
                    (ev) =>
                        ev.modalidad === "Evaluacion"
                );

                // 🔥 TIPOS válidos
                const TIPOS_PERMITIDOS = [
                    "Evaluación período de prueba",
                    "Evaluación período de prueba coordinación",
                ];

                // 🔥 AUTOEVALUACIONES
                // 🔥 AUTOEVALUACIONES
                const filtradas = data
                    .filter(
                        (ev) =>
                            TIPOS_PERMITIDOS.includes(ev.observacion) &&
                            ev.modalidad === "Autoevaluación"
                    )
                    .map((autoEval) => {

                        // 🔥 buscar si ya existe evaluación final
                        const tieneEvaluacion = evaluacionesCoord.some(
                            (coordEval) =>
                                Number(coordEval.idempleado) ===
                                Number(autoEval.idempleado) &&

                                // 🔥 mismo tipo
                                coordEval.observacion === autoEval.observacion
                        );

                        return {
                            ...autoEval,

                            evaluacionFinalizada:
                                tieneEvaluacion,

                            tipoEvaluacion:
                                autoEval.observacion,
                        };
                    });

                // ordenar por fecha (más reciente primero)
                filtradas.sort(
                    (a, b) =>
                        new Date(b.fechaevaluacion) -
                        new Date(a.fechaevaluacion)
                );

                // 🔥 FILTRADO POR COORDINADOR
                let evaluacionesPermitidas = filtradas;

                // verificar si el usuario es coordinador
                if (
                    usuarioActual &&
                    Number(usuarioActual.idrol) === 1
                ) {

                    // buscar el equipo del coordinador
                    const miEquipo = equiposData.find(
                        (eq) =>
                            Number(eq.idcoordinador) ===
                            Number(usuarioActual.idempleado)
                    );

                    // si encontró equipo
                    if (miEquipo) {

                        // empleados del mismo equipo
                        const empleadosEquipo = empleadosData.filter(
                            (emp) =>
                                Number(emp.idequipo) ===
                                Number(miEquipo.idequipo)
                        );

                        // ids de empleados del equipo
                        const idsEquipo = empleadosEquipo.map(
                            (emp) => Number(emp.idempleado)
                        );

                        // filtrar evaluaciones
                        evaluacionesPermitidas = filtradas.filter(
                            (ev) => {

                                // pertenece al equipo
                                const esDeMiEquipo =
                                    idsEquipo.includes(
                                        Number(ev.idempleado)
                                    );

                                // NO mostrar evaluaciones coordinación
                                const noEsCoordinacion =
                                    !ev.observacion
                                        .toLowerCase()
                                        .includes("coordinación");

                                return (
                                    esDeMiEquipo &&
                                    noEsCoordinacion
                                );
                            }
                        );
                    }
                }

                setEvaluaciones(evaluacionesPermitidas);
            } catch (error) {

                console.error(
                    "Error cargando evaluaciones:",
                    error
                );

                showToast(
                    "Error al cargar las evaluaciones",
                    "error"
                );

            } finally {

                setCargando(false);
            }
        };

        cargarEvaluaciones();
    }, []);

    const evaluacionesFiltradas = evaluaciones.filter((ev) =>
        obtenerNombreEmpleado(ev.idempleado)
            .toLowerCase()
            .includes(busqueda.toLowerCase())
    );

    // 🔥 PAGINACIÓN
    const totalPaginas = Math.ceil(
        evaluacionesFiltradas.length / EVALUACIONES_POR_PAGINA
    );

    const indiceInicial =
        (paginaActual - 1) * EVALUACIONES_POR_PAGINA;

    const indiceFinal =
        indiceInicial + EVALUACIONES_POR_PAGINA;

    const evaluacionesPaginadas =
        evaluacionesFiltradas.slice(
            indiceInicial,
            indiceFinal
        );

    useEffect(() => {
        setPaginaActual(1);
    }, [busqueda]);

    useEffect(() => {
        if (
            busqueda &&
            evaluacionesFiltradas.length === 0
        ) {

            showToast(
                "No se encontraron evaluaciones",
                "warning"
            );
        }
    }, [busqueda, evaluacionesFiltradas.length]);

    if (cargando) {
        return (
            <p style={{ textAlign: "center", padding: "20px" }}>
                Cargando evaluaciones...
            </p>
        );
    }

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "#023047", fontWeight: 700, marginBottom: "20px" }}>
                Ver Evaluaciones
            </h2>

            {/* 🔍 BUSCADOR */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                        width: "300px",
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                    }}
                />
            </div>

            {/* ---- Tabla ---- */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    fontSize: "14px",
                }}
            >
                <thead>
                    <tr style={{ background: "#023047", color: "white" }}>
                        <th style={th}>Empleado</th>
                        <th style={th}>Fecha</th>
                        <th style={th}>Tipo Evaluación</th>
                        <th style={th}>Puntaje</th>
                        <th style={th}>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {evaluacionesFiltradas.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={tdEmpty}>
                                No hay evaluaciones registradas.
                            </td>
                        </tr>
                    ) : (
                        evaluacionesPaginadas.map((ev) => (
                            <tr key={ev.idevaluacion}>
                                <td style={td}>
                                    {obtenerNombreEmpleado(ev.idempleado)}
                                </td>
                                <td style={td}>
                                    {new Date(ev.fechaevaluacion).toLocaleDateString()}
                                </td>
                                <td style={td}>
                                    {ev.tipoEvaluacion === "Evaluación período de prueba coordinación"
                                        ? "Coordinador"
                                        : "Acompañante"}
                                </td>
                                <td style={td}>{ev.puntajetotal}</td>
                                <td style={td}>
                                    {ev.evaluacionFinalizada ? (
                                        <span
                                            style={{
                                                color: "#a0a0a0",
                                                fontWeight: "600",
                                            }}
                                        >
                                            Evaluación Finalizada
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => {

                                                showToast(
                                                    "Abriendo evaluación",
                                                    "info"
                                                );

                                                onSeleccionarEvaluacion({
                                                    ...ev,
                                                    tipoEvaluacion:
                                                        ev.observacion.includes("coordinación")
                                                            ? "COORD"
                                                            : "ACOMP",
                                                });
                                            }}
                                            style={btnPrimary}
                                        >
                                            Realizar Evaluacion
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
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
        </div>
    );
};

// estilos
const th = {
    padding: "12px",
    textAlign: "left",
    fontWeight: 600,
};

const td = {
    padding: "10px",
    borderBottom: "1px solid #ddd",
};

const tdEmpty = {
    padding: "20px",
    textAlign: "center",
    color: "#666",
};

const btnPrimary = {
    padding: "8px 12px",
    background: "#219ebc",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
};

export default VerEvaluaciones;