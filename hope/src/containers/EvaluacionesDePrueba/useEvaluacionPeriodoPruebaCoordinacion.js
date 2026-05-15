import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

export const useEvaluacionPeriodoPruebaCoordinacion = (
    evaluacionExistente = null
) => {

    const [variables, setVariables] = useState([]);
    const [usuario, setUsuario] = useState(null);

    const idUsuarioLogueado =
        Number(sessionStorage.getItem("idUsuario"));

    /* =========================================================
       CARGAR USUARIO LOGUEADO
    ========================================================= */
    useEffect(() => {

        if (!idUsuarioLogueado) return;

        axios
            .get(
                `${API}/usuarios/${idUsuarioLogueado}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            .then(res => setUsuario(res.data))
            .catch(err => console.error(err));

    }, [idUsuarioLogueado]);

    /* =========================================================
       TIPO DE EVALUACIÓN
       🔥 Coordinadores = AUTO
       🔥 Admin = EVALUACION
    ========================================================= */
    const getTipoEvaluacion = () => {

        if (!usuario?.idrol) return "AUTO";

        const map = {

            // Coordinador
            1: "AUTO",

            // Admin
            5: "COORD",
        };

        return map[usuario.idrol] || "AUTO";
    };

    /* =========================================================
       CARGAR VARIABLES
    ========================================================= */
    useEffect(() => {

        const fetchEvaluacion = async () => {

            try {

                const res = await axios.get(
                    `${API}/evaluacion-periodo-prueba-coordinacion`,
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

                showToast(
                    "Error al cargar evaluación",
                    "error"
                );
            }
        };

        fetchEvaluacion();

    }, []);

    /* =========================================================
       CARGAR EMPLEADO EVALUADO
    ========================================================= */
    useEffect(() => {

        const cargarEmpleadoEvaluacion = async () => {

            if (!evaluacionExistente?.idempleado)
                return;

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

                // 🔹 admin evaluador
                let nombreAdmin = "";

                if (usuario?.idempleado) {

                    const resAdmin = await axios.get(
                        `${API}/empleados/${usuario.idempleado}/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    nombreAdmin =
                        `${resAdmin.data.nombre} ${resAdmin.data.apellido}`;
                }

                setEmpleado(prev => ({
                    ...prev,

                    nombre:
                        `${emp.nombre} ${emp.apellido}`,

                    puesto: nombrePuesto,

                    equipo: nombreEquipo,

                    coordinador: nombreAdmin,

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

    }, [evaluacionExistente, usuario]);

    /* =========================================================
       ESTADOS
    ========================================================= */
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

    /* =========================================================
       HANDLE CHANGE
    ========================================================= */
    const handleChange = (
        key,
        field,
        value
    ) => {

        setEvaluacion(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    /* =========================================================
       TOTAL
    ========================================================= */
    const calcularTotal = () => {

        const tipo = getTipoEvaluacion();

        return Object.values(evaluacion).reduce(
            (acc, item) => {

                const valor =
                    tipo === "AUTO"
                        ? item.auto
                        : item.coord;

                return acc + Number(valor || 0);

            }, 0
        );
    };

    /* =========================================================
       DECISIÓN FINAL
    ========================================================= */
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

    /* =========================================================
       GUARDAR EVALUACIÓN
    ========================================================= */
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

            // 🔥 EMPLEADO EVALUADO
            const idEmpleadoEvaluado =
                evaluacionExistente?.idempleado ||
                usuario.idempleado;

            /* =========================================
               CREAR EVALUACIÓN
            ========================================= */
            const payloadEval = {

                idempleado:
                    idEmpleadoEvaluado,

                modalidad:
                    tipo === "AUTO"
                        ? "Autoevaluación"
                        : "Evaluacion",

                fechaevaluacion:
                    new Date().toISOString(),

                puntajetotal:
                    calcularTotal(),

                observacion:
                    "Evaluación período de prueba coordinación",

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

            /* =========================================
               GUARDAR CRITERIOS
            ========================================= */
            for (const [idcriterio, item]
                of Object.entries(evaluacion)) {

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
                        puntajecriterio:
                            Number(puntaje),

                        observacion:
                            item.obs || "",

                        estado: true,

                        idusuario:
                            usuario.idusuario,
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );
            }

            /* =========================================
               GLOBAL
            ========================================= */
            await axios.post(
                `${API}/evaluacion-global/`,
                {
                    idevaluacion,

                    tipo,

                    fortalezas:
                        empleado.fortalezas,

                    mejoras:
                        empleado.mejoras,

                    recomendaciones:
                        empleado.recomendaciones,

                    justificacion:
                        empleado.justificacion,

                    decision:
                        decisionFinal(),

                    total:
                        calcularTotal(),

                    estado: true,

                    idusuario:
                        usuario.idusuario,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
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
        usuario,
        getTipoEvaluacion,
    };
};