import { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

export const useEvaluacionGuia = () => {
  const [tipos, setTipos] = useState([]);
  const [variables, setVariables] = useState([]);
  const [criterios, setCriterios] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState({});
  const [paginaActual, setPaginaActual] = useState(0);
  const [usuario, setUsuario] = useState(null);

  // 🔹 Obtener ID del usuario logueado desde sessionStorage
  const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

  const autoevaluacionCompleta = () => {
    // Obtener todas las variables del tipo seleccionado
    const todasLasVariables = variables.filter(
      (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
    );

    // Obtener todos los criterios de todas las variables
    const todosLosCriterios = criterios.filter(
      (c) =>
        todasLasVariables.some((v) => v.idvariable === c.idvariable) &&
        c.estado !== false
    );

    // Revisar cada criterio si tiene autoevaluación
    return todosLosCriterios.every((c) => {
      const ev = evaluaciones[c.idcriterio];
      return ev && ev.auto && ev.auto !== "";
    });
  };

  // 🔹 Cargar datos base y usuario
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Peticiones simultáneas
        const [resTipos, resVars, resCriterios, resUsuario] = await Promise.all([
          axios.get(`${API}/tipoevaluacion/`),
          axios.get(`${API}/variables/`),
          axios.get(`${API}/criterio/`),
          idUsuarioLogueado ? axios.get(`${API}/usuarios/${idUsuarioLogueado}/`) : Promise.resolve({ data: null }),
        ]);

        setTipos(resTipos.data.results || resTipos.data || []);
        setVariables(resVars.data.results || resVars.data || []);
        setCriterios(resCriterios.data.results || resCriterios.data || []);
        setUsuario(resUsuario.data);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        showToast("Error al cargar datos de evaluación", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [idUsuarioLogueado]);

  // 🔹 Asignar tipo según el rol del usuario
  useEffect(() => {
    if (!usuario || tipos.length === 0) return;

    let tipoAuto = "";

    switch (usuario.idrol) {
      case 1: // Coordinador
        tipoAuto = tipos.find((t) => t.nombretipo === "Coordinador")?.idtipoevaluacion;
        break;
      case 2: // Acompañante
        tipoAuto = tipos.find((t) => t.nombretipo === "Acompañante")?.idtipoevaluacion;
        break;
      case 3: // Contador
        tipoAuto = tipos.find((t) => t.nombretipo === "Acompañante")?.idtipoevaluacion;
        break;
      case 4: // Secretaria
        tipoAuto = tipos.find((t) => t.nombretipo === "Administrativo")?.idtipoevaluacion;
        break;
      case 5: // Administrador
      default:
        tipoAuto = ""; // libre
        break;
    }

    if (tipoAuto) {
      setTipoSeleccionado(String(tipoAuto));
    }
  }, [tipos, usuario]);

  // 🔹 Filtrar variables
  const variablesFiltradas = variables.filter(
    (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
  );

  useEffect(() => {
    setPaginaActual(0);
  }, [tipoSeleccionado]);

  const variableActual = variablesFiltradas[paginaActual] || null;

  const criteriosPorVariable = (idVariable) =>
    criterios.filter((c) => c.idvariable === idVariable && c.estado !== false);

  const handleInputChange = (idCriterio, campo, valor) => {
    setEvaluaciones((prev) => {
      const anterior = prev[idCriterio] || {
        auto: "",
        coord: "",
        consenso: "",
        obs: "",
      };
      const nuevo = { ...anterior, [campo]: valor };

      if (campo === "auto" || campo === "coord") {
        const autoNum = parseFloat(nuevo.auto) || 0;
        const coordNum = parseFloat(nuevo.coord) || 0;
        nuevo.consenso =
          autoNum > 0 && coordNum > 0
            ? ((autoNum + coordNum) / 2).toFixed(1)
            : "";
      }
      return { ...prev, [idCriterio]: nuevo };
    });
  };

  const calcularTotalesGlobales = () => {
    let totalAuto = 0,
      totalCoord = 0,
      totalConsenso = 0,
      count = 0;

    criterios
      .filter((c) => c.estado !== false)
      .forEach((c) => {
        const ev = evaluaciones[c.idcriterio] || {};
        if (ev.auto) totalAuto += Number(ev.auto);
        if (ev.coord) totalCoord += Number(ev.coord);
        if (ev.consenso) {
          totalConsenso += Number(ev.consenso);
          count++;
        }
      });

    const promedioConsenso = count > 0 ? (totalConsenso / count).toFixed(1) : 0;
    return { totalAuto, totalCoord, promedioConsenso };
  };

  const variableCompleta = (criteriosVar) =>
    criteriosVar.every((c) => {
      const ev = evaluaciones[c.idcriterio];
      return ev && ev.auto && ev.coord;
    });

const siguienteVariable = () => {
  if (!variableActual) return;
  const criteriosActuales = criteriosPorVariable(variableActual.idvariable);

  // 🧩 Determinar si el rol actual debe validar ambos campos
  const esRolSoloAuto = [2, 3].includes(usuario?.idrol);

  if (!esRolSoloAuto) {
    // Solo para roles completos (no acompañantes ni contadores)
    const incompletos = criteriosActuales.filter((c) => {
      const ev = evaluaciones[c.idcriterio];
      return !ev || !ev.auto || !ev.coord;
    });

    if (incompletos.length > 0) {
      showToast(
        "Debe completar Autoevaluación y Coordinador en todos los criterios antes de continuar.",
        "warning"
      );
      return;
    }
  }

  // Si pasa la validación (o es acompañante/contador), cambia de página
  if (paginaActual < variablesFiltradas.length - 1) {
    setPaginaActual((p) => p + 1);
  }
};


  const anteriorVariable = () => {
    if (paginaActual > 0) setPaginaActual((p) => p - 1);
  };

  const criteriosActuales = variableActual
    ? criteriosPorVariable(variableActual.idvariable)
    : [];

  const { totalAuto, totalCoord, promedioConsenso } = calcularTotalesGlobales();

 const guardarAutoevaluacion = async () => {
  try {
    if (!usuario || !tipoSeleccionado) {
      showToast("No se puede guardar: usuario o tipo no definido.", "error");
      return;
    }

    // 🔹 Filtrar todas las variables del tipo seleccionado
    const todasLasVariables = variables.filter(
      (v) => v.idtipoevaluacion === Number(tipoSeleccionado)
    );

    if (!todasLasVariables.length) {
      showToast("No hay variables para guardar.", "warning");
      return;
    }

    // 🔹 Crear evaluación principal (una sola vez)
    const evalPayload = {
      idempleado: usuario.idempleado || null,
      modalidad: "Autoevaluación",
      fechaevaluacion: new Date().toISOString(),
      puntajetotal: totalAuto,
      observacion: "Autoevaluación del usuario",
      estado: true,
      idusuario: usuario.idusuario,
      idpostulacion: null,
    };

    const evalRes = await fetch(`${API}/evaluacion/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evalPayload),
    });

    if (!evalRes.ok) throw new Error("Error al crear evaluación principal");
    const evalData = await evalRes.json();
    const idevaluacion = evalData.idevaluacion;

    // 🔹 Recorrer todas las variables y sus criterios
    for (const variable of todasLasVariables) {
      const criteriosDeVariable = criterios.filter(
        (c) => c.idvariable === variable.idvariable && c.estado !== false
      );

      for (const c of criteriosDeVariable) {
        const ev = evaluaciones[c.idcriterio];
        if (!ev || !ev.auto) continue;

        const payload = {
          idevaluacion,
          idcriterio: c.idcriterio,
          puntajecriterio: parseFloat(ev.auto) || 0,
          observacion: ev.obs || "",
          estado: true,
          idusuario: usuario.idusuario,
        };

        await fetch(`${API}/evaluacioncriterio/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    }

    showToast("Autoevaluación completa guardada correctamente.", "success");
  } catch (err) {
    console.error("Error guardando autoevaluación:", err);
    showToast("Error al guardar autoevaluación.", "error");
  };
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
    evaluaciones,
    handleInputChange,
    totalAuto,
    totalCoord,
    promedioConsenso,
    siguienteVariable,
    anteriorVariable,
    guardarAutoevaluacion,
    usuario,
    showToast,
    autoevaluacionCompleta,
  };
};
