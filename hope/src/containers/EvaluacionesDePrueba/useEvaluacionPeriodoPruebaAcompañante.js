import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

export const useEvaluacionPeriodoPruebaAcompañante = (
    evaluacionExistente = null
) => {
    const [variables, setVariables] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

    useEffect(() => {
        if (!idUsuarioLogueado) return;

        axios.get(`${API}/usuarios/${idUsuarioLogueado}/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUsuario(res.data))
            .catch(err => console.error(err));
    }, [idUsuarioLogueado]);

    const getTipoEvaluacion = () => {
        if (!usuario) return "AUTO";

        const map = {
            1: "COORD",  // Coordinador
            5: "COORD",  // Admin
            2: "AUTO",   // Acompañante
        };

        return map[usuario.idrol] || "AUTO";
    };

    useEffect(() => {
        const fetchEvaluacion = async () => {
            try {
                const res = await axios.get(
                    `${API}/evaluacion-periodo-prueba-acompanantes`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.results)
                        ? res.data.results
                        : [];

                setVariables(data);

            } catch (error) {
                console.error(error);
                // opcional si ya usas toast global
                showToast("Error al cargar evaluación", "error");
            }
        };

        fetchEvaluacion();
    }, []);

    useEffect(() => {
        const cargarEmpleadoEvaluacion = async () => {

            // 🔥 SOLO CUANDO ES EVALUACIÓN DEL COORDINADOR
            if (!evaluacionExistente?.idempleado) return;

            try {

                // 🔹 empleado
                const resEmpleado = await axios.get(
                    `${API}/empleados/${evaluacionExistente.idempleado}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const emp = resEmpleado.data;

                // 🔹 puesto
                let nombrePuesto = "";

                if (emp.idpuesto) {
                    const resPuesto = await axios.get(
                        `${API}/puestos/${emp.idpuesto}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    nombrePuesto =
                        resPuesto.data.nombrepuesto;
                }

                // 🔹 equipo
                let nombreEquipo = "";

                if (emp.idequipo) {
                    const resEquipo = await axios.get(
                        `${API}/equipos/${emp.idequipo}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    nombreEquipo =
                        resEquipo.data.nombreequipo;
                }

                // 🔹 coordinador
                let nombreCoordinador = "";

                if (emp.idcoordinador) {
                    const resCoord = await axios.get(
                        `${API}/empleados/${emp.idcoordinador}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    nombreCoordinador =
                        `${resCoord.data.nombre} ${resCoord.data.apellido}`;
                }

                // 🔥 llenar formulario automáticamente
                setEmpleado((prev) => ({
                    ...prev,

                    nombre:
                        `${emp.nombre} ${emp.apellido}`,

                    puesto: nombrePuesto,

                    equipo: nombreEquipo,

                    coordinador:
                        nombreCoordinador,

                    fechaIngreso:
                        emp.fechaingreso || "",

                    fechaEvaluacion:
                        new Date()
                            .toISOString()
                            .split("T")[0],
                }));

            } catch (error) {

                console.error(
                    "Error cargando empleado:",
                    error
                );

                showToast(
                    "Error cargando datos del empleado",
                    "error"
                );
            }
        };

        cargarEmpleadoEvaluacion();

    }, [evaluacionExistente]);

    const [empleado, setEmpleado] = useState({
        nombre: "",
        puesto: "",
        equipo: "",
        coordinador: "",
        fechaIngreso: "",
        fechaEvaluacion: "",
        fortalezas: "",
        mejoras: "",
        recomendaciones: "",
        justificacion: "",
    });

    const [evaluacion, setEvaluacion] = useState({});

    const handleChange = (key, field, value) => {
        setEvaluacion((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const calcularTotal = () => {
        const tipo = getTipoEvaluacion();

        return Object.values(evaluacion).reduce((acc, item) => {
            const valor =
                tipo === "AUTO"
                    ? item.auto
                    : item.coord;

            return acc + Number(valor || 0);
        }, 0);
    };

    const decisionFinal = () => {
        const total = calcularTotal();

        if (total >= 60) {
            return "Se confirma en el puesto";
        }

        if (total >= 41) {
            return "Se confirma con plan de mejora";
        }

        return "No se confirma";
    };

    const guardarEvaluacion = async () => {
        try {

            if (!usuario) {
                showToast(
                    "Usuario no cargado",
                    "warning"
                );
                return;
            }

            const tipo = getTipoEvaluacion();

            // 🔥 EMPLEADO EVALUADO REAL
            const idEmpleadoEvaluado =
                evaluacionExistente?.idempleado ||
                usuario.idempleado;

            // 🔥 SIEMPRE CREAR NUEVA EVALUACIÓN
            const payloadEval = {
                idempleado: idEmpleadoEvaluado,

                modalidad:
                    tipo === "AUTO"
                        ? "Autoevaluación"
                        : "Evaluacion",

                fechaevaluacion:
                    new Date().toISOString(),

                puntajetotal:
                    calcularTotal(),

                observacion:
                    "Evaluación período de prueba",

                estado: true,

                idusuario:
                    usuario.idusuario,

                idpostulacion: null,
            };

            const resEval = await axios.post(
                `${API}/evaluacion/`,
                payloadEval,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const idevaluacion =
                resEval.data.idevaluacion;

            // 🔥 CRITERIOS
            for (const [idcriterio, item] of Object.entries(evaluacion)) {

                const puntaje =
                    tipo === "AUTO"
                        ? item.auto
                        : item.coord;

                if (!puntaje) continue;

                await axios.post(
                    `${API}/evaluacioncriterio/`,
                    {
                        idevaluacion,
                        idcriterio,
                        puntajecriterio: Number(puntaje),
                        observacion: item.obs || "",
                        estado: true,
                        idusuario: usuario.idusuario,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }

            // 🔥 GLOBAL
            await axios.post(
                `${API}/evaluacion-global/`,
                {
                    idevaluacion,
                    tipo,
                    fortalezas: empleado.fortalezas,
                    mejoras: empleado.mejoras,
                    recomendaciones: empleado.recomendaciones,
                    justificacion: empleado.justificacion,
                    decision: decisionFinal(),
                    total: calcularTotal(),
                    estado: true,
                    idusuario: usuario.idusuario,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            showToast(
                "Evaluación guardada correctamente",
                "success"
            );

        } catch (error) {

            console.error(
                error.response?.data || error
            );

            showToast(
                "Error al guardar evaluación",
                "error"
            );
        }
    };

    return {
        empleado,
        setEmpleado,
        evaluacion,
        handleChange,
        calcularTotal,
        decisionFinal,
        guardarEvaluacion,
        variables,
    };
};