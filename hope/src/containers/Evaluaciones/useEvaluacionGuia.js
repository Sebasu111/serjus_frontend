import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

export const useEvaluacionGuia = (evaluacionSeleccionada) => {
  const [tipos, setTipos] = useState([]);
  const [variables, setVariables] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [usuario, setUsuario] = useState(null);
  const [evaluacionAuto, setEvaluacionAuto] = useState(null);
  const [evaluacionCoord, setEvaluacionCoord] = useState(null);

  const [totalAuto, setTotalAuto] = useState(0);
  const [totalCoord, setTotalCoord] = useState(0);
  const [promedioFinal, setPromedioFinal] = useState(0);

  const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

  // ---------------------- COMPLETAR AUTOEVALUACIÓN ----------------------
  const autoevaluacionCompleta = () => {
    const todasLasVariables = variables.filter(
      (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
    );

    const todosLosCriterios = criterios.filter(
      (c) =>
        todasLasVariables.some((v) => v.idvariable === c.idvariable) &&
        c.estado !== false
    );

    return todosLosCriterios.every((c) => {
      const ev = evaluaciones[c.idcriterio];
      return ev && ev.auto && ev.auto !== "";
    });
  };

  // 🔹 Carga inicial
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resTipos, resVars, resCriterios, resUsuario] = await Promise.all([
          axios.get(`${API}/tipoevaluacion/`),
          axios.get(`${API}/variables/`),
          axios.get(`${API}/criterio/`),
          idUsuarioLogueado
            ? axios.get(`${API}/usuarios/${idUsuarioLogueado}/`)
            : Promise.resolve({ data: null }),
        ]);

        setTipos(resTipos.data.results || resTipos.data || []);
        setVariables(resVars.data.results || resVars.data || []);
        setCriterios(resCriterios.data.results || resCriterios.data || []);
        setUsuario(resUsuario.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        showToast("Error al cargar los datos iniciales", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [idUsuarioLogueado]);

  // 🔹 Cargar criterios guardados al corregir evaluación
  useEffect(() => {
    if (!evaluacionSeleccionada) return;

    axios
      .get(`${API}/evaluacioncriterio/`)
      .then(async (res) => {
        const data = res.data.results || res.data || [];
        const criteriosEval = data.filter(
          (c) => c.idevaluacion === evaluacionSeleccionada.idevaluacion
        );

        const evaluacionesMap = {};
        criteriosEval.forEach((c) => {
          evaluacionesMap[c.idcriterio] = {
            auto: c.puntajecriterio || "",
            coord: c.puntajecoord || "",
            consenso: c.consenso || "",
            obs: c.observacion || "",
            idregistro: c.idevaluacioncriterio,
          };
        });

        setEvaluaciones(evaluacionesMap);

        if (criteriosEval.length === 0) return;

        const criterioBase = await axios.get(
          `${API}/criterio/${criteriosEval[0].idcriterio}/`
        );
        const idVariable = criterioBase.data.idvariable;
        const variable = variables.find((v) => v.idvariable === idVariable);

        if (variable) {
          setTipoSeleccionado(String(variable.idtipoevaluacion));
          setPaginaActual(0);
        }
      })
      .catch((err) => console.error("Error:", err));
  }, [evaluacionSeleccionada, variables]);

  // 🔹 Autoasignar el TIPO DE EVALUACIÓN según rol cuando NO están corrigiendo
  useEffect(() => {
    if (evaluacionSeleccionada || !usuario || tipos.length === 0) return;

    const mapRolToTipo = {
      1: "Coordinador",     // Coordinador
      2: "Acompañante",     // Acompañante
      3: "Acompañante",     // Contador usa misma rúbrica
      4: "Administrativo",  // Secretaria
      5: "Coordinador",     // Administrador se evalúa como jefe
    };

    const nombreTipo = mapRolToTipo[usuario.idrol];
    const tipoMatch = tipos.find((t) => t.nombretipo === nombreTipo);
    if (tipoMatch) setTipoSeleccionado(String(tipoMatch.idtipoevaluacion));
  }, [tipos, usuario]);

  const variablesFiltradas = variables.filter(
    (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
  );

  useEffect(() => setPaginaActual(0), [tipoSeleccionado]);

  const variableActual = variablesFiltradas[paginaActual] || null;

  const criteriosPorVariable = (idVariable) =>
    criterios.filter((c) => c.idvariable === idVariable && c.estado !== false);

  const criteriosActuales = variableActual
    ? criteriosPorVariable(variableActual.idvariable)
    : [];

  const handleInputChange = (idCriterio, campo, valor) => {
    setEvaluaciones((prev) => {
      const ant = prev[idCriterio] || {
        auto: "",
        coord: "",
        consenso: "",
        obs: "",
      };
      const nuevo = { ...ant, [campo]: valor };
      const autoNum = parseFloat(nuevo.auto) || 0;
      const coordNum = parseFloat(nuevo.coord) || 0;
      nuevo.consenso =
        autoNum > 0 && coordNum > 0
          ? ((autoNum + coordNum) / 2).toFixed(1)
          : "";
      return { ...prev, [idCriterio]: nuevo };
    });
  };

  const siguienteVariable = () =>
    paginaActual < variablesFiltradas.length - 1 &&
    setPaginaActual((p) => p + 1);

  const anteriorVariable = () =>
    paginaActual > 0 && setPaginaActual((p) => p - 1);

  // ---------------------- 💾 GUARDAR AUTOEVALUACIÓN ----------------------
  const guardarAutoevaluacion = async () => {
    try {
      const payloadEval = {
        idempleado: usuario.idempleado,
        modalidad: "Autoevaluación",
        fechaevaluacion: new Date().toISOString(),
        puntajetotal: criterios.reduce((acc, c) => {
          const ev = evaluaciones[c.idcriterio];
          return ev?.auto ? acc + Number(ev.auto) : acc;
        }, 0),
        observacion: "Autoevaluación del usuario",
        estado: true,
        idusuario: usuario.idusuario,
        idpostulacion: null,
      };

      const evalRes = await axios.post(`${API}/evaluacion/`, payloadEval);
      const idevaluacion = evalRes.data.idevaluacion;

      for (const c of criterios.filter((c) => c.estado !== false)) {
        const ev = evaluaciones[c.idcriterio];
        if (!ev || !ev.auto) continue;

        await axios.post(`${API}/evaluacioncriterio/`, {
          idevaluacion,
          idcriterio: c.idcriterio,
          puntajecriterio: Number(ev.auto),
          observacion: ev.obs || "",
          estado: true,
          idusuario: usuario.idusuario,
        });
      }

      showToast("Autoevaluación guardada correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar autoevaluación", "error");
    }
  };

  // ---------------------- 💾 GUARDAR EVALUACIÓN DE SUPERVISOR ----------------------
  const guardarEvaluacionCoordinador = async () => {
    try {
      if (!evaluacionSeleccionada) {
        return showToast("Error: no se recibió información del empleado a evaluar", "error");
      }

      // 1️⃣ Crear nueva evaluación del coordinador
      const payloadEval = {
        idempleado: evaluacionSeleccionada.idempleado,
        modalidad: "Evaluacion",
        fechaevaluacion: new Date().toISOString(),
        puntajetotal: criterios.reduce((acc, c) => {
          const ev = evaluaciones[c.idcriterio];
          return ev?.coord ? acc + Number(ev.coord) : acc;
        }, 0),
        observacion: "Evaluación del coordinador",
        estado: true,
        idusuario: usuario.idusuario,
        idpostulacion: null,
      };
      console.log("📌 evaluacionSeleccionada en guardarEvaluacionCoordinador:", evaluacionSeleccionada);

      const evalRes = await axios.post(`${API}/evaluacion/`, payloadEval);
      const idevaluacion = evalRes.data.idevaluacion;

      // 2️⃣ Guardar criterios asociados a esta nueva evaluación
      for (const c of criterios.filter((c) => c.estado !== false)) {
        const ev = evaluaciones[c.idcriterio];
        if (!ev || !ev.coord) continue;

        await axios.post(`${API}/evaluacioncriterio/`, {
          idevaluacion,
          idcriterio: c.idcriterio,
          puntajecriterio: Number(ev.coord),
          observacion: ev.obs || "",
          idusuario: usuario.idusuario,
          estado: true,
        });
      }

      showToast("Evaluación del coordinador creada correctamente", "success");
    } catch (err) {
      console.error("❌ ERROR BACKEND guardarEvaluacionCoordinador:", err.response?.data);
      showToast("Error al guardar evaluación del coordinador", "error");
    }
  };


  // ---------------------- VALIDAR QUE SUPERVISOR COMPLETÓ ----------------------
  const evaluacionCoordinadorCompleta = () => {
    const todasLasVariables = variables.filter(
      (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
    );

    for (const variable of todasLasVariables) {
      const criteriosDeVariable = criterios.filter(
        (c) => c.idvariable === variable.idvariable && c.estado !== false
      );
      const paginaLlena = criteriosDeVariable.every((c) => {
        const ev = evaluaciones[c.idcriterio];
        return ev && ev.coord && ev.coord !== "";
      });
      if (!paginaLlena) return false;
    }
    return true;
  };


  return {
    tipos,
    tipoSeleccionado,
    setTipoSeleccionado,
    variablesFiltradas,
    variableActual,
    criteriosActuales,
    loading,
    paginaActual,
    setPaginaActual,
    guardarAutoevaluacion,
    guardarEvaluacionCoordinador,
    evaluaciones,
    handleInputChange,
    siguienteVariable,
    anteriorVariable,
    usuario,
    showToast,
    autoevaluacionCompleta,
    evaluacionCoordinadorCompleta,
  };
};
