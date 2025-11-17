// useEvaluacionSeleccion.js
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "../../utils/toast";
import { useMemo } from "react";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const useEvaluacionSeleccion = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState("");
  const [nombresEvaluados, setNombresEvaluados] = useState([null, null, null]);
  const [criterios, setCriterios] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [ganador, setGanador] = useState(null);
  const [evaluacionesGuardadas, setEvaluacionesGuardadas] = useState([]);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState("");

  const convocatoriasConEvaluacionActiva = useMemo(() => {
    return evaluacionesGuardadas
      .filter((ev) => ev.estado === true && ev.idconvocatoria) // solo activas
      .map((ev) => ev.idconvocatoria);
  }, [evaluacionesGuardadas]);

  // Cargar evaluaciones existentes
  useEffect(() => {
  const cargarEvaluaciones = async () => {
    try {
      const evalRes = await fetch(`${API}/evaluacion/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      const evalData = (await evalRes.json()).results || [];

      // 🔹 Obtenemos postulaciones y aspirantes para enriquecer los datos
      const [postRes, aspRes, convRes] = await Promise.all([
        fetch(`${API}/postulaciones/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
        fetch(`${API}/aspirantes/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
        fetch(`${API}/convocatorias/`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
      ]);

      const postulaciones = (await postRes.json()).results || [];
      const aspirantes = (await aspRes.json()).results || [];
      const convocatorias = (await convRes.json()).results || [];

      // 🔹 Fusionamos datos para mostrar info útil en el combo
      const enriquecidas = evalData.map((ev) => {
        const post = postulaciones.find((p) => p.idpostulacion === ev.idpostulacion);
        const asp = post ? aspirantes.find((a) => a.idaspirante === post.idaspirante) : null;
        const conv = post ? convocatorias.find((c) => c.idconvocatoria === post.idconvocatoria) : null;

        return {
           ...ev,
          idconvocatoria: post ? post.idconvocatoria : null,   // 🔥 IMPORTANTE
          idpostulacion: post ? post.idpostulacion : null,
          estado: ev.estado,                                   // estado de la evaluación
          nombreaspirante: asp
            ? `${asp.nombreaspirante} ${asp.apellidoaspirante}`
            : null,
          nombreconvocatoria: conv ? conv.nombreconvocatoria : null,
        };
      });

      setEvaluacionesGuardadas(enriquecidas);
    } catch (err) {
      console.error("Error cargando evaluaciones guardadas:", err);
      showToast("Error cargando evaluaciones guardadas.", "error");
    }
  };

  cargarEvaluaciones();
}, []);


  // === Cargar convocatorias ===
  useEffect(() => {
    fetch(`${API}/convocatorias/`)
      .then((res) => res.json())
      .then((data) => setConvocatorias(data.results || data))
      .catch((err) => console.error("Error cargando convocatorias:", err));
  }, []);

  // === Cargar criterios base ===
useEffect(() => {
  const cargarCriterios = async () => {
    try {
      // 🔹 Trae todas las variables
      const variableRes = await fetch(`${API}/variables/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const variableJson = await variableRes.json();
      const allVariables = variableJson.results || variableJson;

      // 🔹 Filtra solo la variable de Evaluación de Entrevista
      const variableData = allVariables.filter(
        (v) =>
          v.idtipoevaluacion === 4 &&
          v.nombrevariable === "Evaluación de Entrevista"
      );

      if (!variableData.length) {
        showToast("No se encontró la variable 'Evaluación de Entrevista'.", "warning");
        return;
      }

      const idVariable = variableData[0].idvariable;

      // 🔹 Trae todos los criterios y filtra solo los de esa variable
      const criteriosRes = await fetch(`${API}/criterio/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      const criteriosJson = await criteriosRes.json();
      const criteriosData = (criteriosJson.results || criteriosJson)
        .filter((c) => c.idvariable === idVariable && c.idcriterio <= 12);


      // 🔹 Mapea solo los que pertenecen a Evaluación de Entrevista
      const listaCriterios = criteriosData.map((c) => ({
        id: c.idcriterio,
        nombre: c.nombrecriterio,
        descripcion: c.descripcioncriterio,
      }));

      setCriterios(listaCriterios);
      console.log("  Criterios filtrados:", listaCriterios);
    } catch (err) {
      console.error("Error cargando criterios:", err);
      showToast("Error cargando criterios.", "error");
    }
  };

  cargarCriterios();
}, []);

  // === Cargar aspirantes de la convocatoria seleccionada ===
  useEffect(() => {
    if (!convocatoriaSeleccionada) return;

    const cargarAspirantes = async () => {
      try {
        const postRes = await fetch(`${API}/postulaciones/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        const aspRes = await fetch(`${API}/aspirantes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

        const postulaciones = (await postRes.json()).results || [];
        const aspirantes = (await aspRes.json()).results || [];

        const postulacionesFiltradas = postulaciones.filter(
          (p) =>
            p.idconvocatoria === Number(convocatoriaSeleccionada) &&
            p.idestado === 2
        );

        let seleccionados = postulacionesFiltradas
          .map((p) => {
            const aspirante = aspirantes.find((a) => a.idaspirante === p.idaspirante);
            if (!aspirante) return null;
            return {
              idaspirante: aspirante.idaspirante,
              idpostulacion: p.idpostulacion,
              nombre: `${aspirante.nombreaspirante} ${aspirante.apellidoaspirante}`,
            };
          })
          .filter(Boolean);

        // 👉 máximo 3
        seleccionados = seleccionados.slice(0, 3);

        // ❗ mínimo 2 requeridos
        if (seleccionados.length < 2) {
          showToast(
            "Debe haber al menos 2 postulaciones seleccionadas en esta convocatoria.",
            "warning"
          );
        }

        const final = [
          ...seleccionados,
          ...Array(3 - seleccionados.length).fill(null),
        ];
        setNombresEvaluados(final);
      } catch (err) {
        showToast("Error cargando aspirantes:", "error");
      }
    };

    cargarAspirantes();
  }, [convocatoriaSeleccionada]);

  // === Inicializar evaluaciones ===
useEffect(() => {
  if (!evaluacionSeleccionada) {
    setEvaluaciones(
      criterios.map((c) => ({
        criterio: c.nombre,
        puntajes: { p1: "", p2: "", p3: "" },
        observaciones: "",
      }))
    );
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [criterios, nombresEvaluados]);

    // === Totales ===
    const totalPorPersona = (persona) =>
      evaluaciones.reduce((acc, e) => acc + (Number(e.puntajes[persona]) || 0), 0);

    useEffect(() => {
      const activos = nombresEvaluados.filter((n) => n !== null);

      const totales = {
        p1: activos[0] ? totalPorPersona("p1") : -1,
        p2: activos[1] ? totalPorPersona("p2") : -1,
        p3: activos[2] ? totalPorPersona("p3") : -1,
      };

      const max = Math.max(...Object.values(totales));
      const keys = Object.keys(totales).filter((k) => totales[k] === max);

      setGanador(keys.length === 1 ? keys[0] : null);
    }, [evaluaciones, nombresEvaluados]);


    // === Handlers de campos ===
    const handleChange = (index, field, value, persona) => {
      const newEval = [...evaluaciones];
      if (field === "observaciones") {
        newEval[index].observaciones = value;
      } else {
        newEval[index].puntajes[persona] = value.toString();
      }
      setEvaluaciones(newEval);
    };

    const agregarCriterio = () => {
      const selCount = nombresEvaluados.filter(
        (n) => n && n.nombre && n.nombre.trim() !== ""
      ).length;

      if (selCount < 2) {
        showToast("Debes tener 2 postulaciones seleccionadas antes de agregar criterios.", "warning");
        return;
      }

      const nuevo = { id: `uuid-${uuidv4()}`, nombre: "", descripcion: "" };
      setCriterios([...criterios, nuevo]);
      setEvaluaciones([
        ...evaluaciones,
        { criterio: "", puntajes: { p1: "", p2: "", p3: "" }, observaciones: "" },
      ]);
      showToast("Criterio agregado correctamente.", "success");
    };
  
    const cargarEvaluacionExistente = async (idEval) => {
  try {
    const evalRes = await fetch(`${API}/evaluacion/${idEval}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    if (!evalRes.ok) throw new Error("Error obteniendo evaluación");
    const evalData = await evalRes.json();

    // --- Obtener detalle de evaluación
    const detalleRes = await fetch(`${API}/evaluacioncriterio/?idevaluacion=${idEval}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    if (!detalleRes.ok) throw new Error("Error obteniendo detalles");
    const detalleData = (await detalleRes.json()).results || [];
    
    if (!detalleData.length) {
      showToast("No hay puntajes registrados en esta evaluación.", "warning");
      return;
    }

    // --- Obtener criterios
    const criterioIds = [...new Set(detalleData.map((d) => d.idcriterio))];
    const criteriosDetalle = [];
    for (const id of criterioIds) {
      const res = await fetch(`${API}/criterio/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      if (res.ok) {
        const data = await res.json();
        if (data.idvariable !== 1) continue;
        criteriosDetalle.push({
          id: data.idcriterio,
          nombre: data.nombrecriterio,
          descripcion: data.descripcioncriterio,
        });
      }
    }

    // --- Obtener postulaciones y aspirantes
    const postRes = await fetch(`${API}/postulaciones/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    const aspRes = await fetch(`${API}/aspirantes/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    const postulaciones = (await postRes.json()).results || [];
    const aspirantes = (await aspRes.json()).results || [];

    // --- Buscar postulacion principal (la de la evaluación)
    const postulacionBase = postulaciones.find(
      (p) => p.idpostulacion === evalData.idpostulacion
    );
    const convocatoriaId = postulacionBase?.idconvocatoria;

    // --- Buscar los 3 seleccionados de esa convocatoria
    const postulacionesConv = postulaciones.filter(
      (p) =>
        p.idconvocatoria === convocatoriaId &&
        (p.idestado === 2 || p.idestado === 3)
    );

    const seleccionados = postulacionesConv
      .map((p) => {
        const asp = aspirantes.find((a) => a.idaspirante === p.idaspirante);
        return asp
          ? {
              idaspirante: asp.idaspirante,
              idpostulacion: p.idpostulacion,
              nombre: `${asp.nombreaspirante} ${asp.apellidoaspirante}`,
            }
          : null;
      })
      .filter(Boolean)
      .slice(0, 3);

    const final = [...seleccionados, ...Array(3 - seleccionados.length).fill(null)];
    setNombresEvaluados(final);

    // --- Fusionar criterios y evaluaciones con correspondencia real
    const nuevosCriterios = [];
    const nuevosEvaluaciones = [];

    criteriosDetalle.forEach((c) => {
  // corregido: DRF devuelve idcriterio como objeto
  const registros = detalleData.filter((d) => {
    const idCrit = d.idcriterio?.idcriterio ?? d.idcriterio;
    return idCrit === c.id;
  });

  // 🧩 Crear mapa de puntajes por postulacion
  const mapaPuntajes = {};
  registros.forEach((r) => {
    const idPost = r.idpostulacion?.idpostulacion ?? r.idpostulacion ?? null;
    if (idPost !== null) {
      mapaPuntajes[idPost] = parseInt(r.puntajecriterio)?.toString() || "";
    }
  });

  // 🧩 Asignar puntajes según postulaciones seleccionadas
  const puntajes = {
    p1: final[0] ? (mapaPuntajes[final[0].idpostulacion] ?? "") : "",
    p2: final[1] ? (mapaPuntajes[final[1].idpostulacion] ?? "") : "",
    p3: final[2] ? (mapaPuntajes[final[2].idpostulacion] ?? "") : "",
  };

  nuevosCriterios.push({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
  });

  nuevosEvaluaciones.push({
    criterio: c.nombre,
    puntajes,
    observaciones: registros[0]?.observacion || "",
  });
});

// --- Fusionar criterios base y criterios de evaluación para mantener el orden
let criteriosCompletos = criterios;
if (!criterios.length) {
  // si los criterios base están vacíos, usa directamente los criterios cargados de la evaluación
  criteriosCompletos = [...nuevosCriterios];
} else {
  criteriosCompletos = criterios.map((base) => {
    const encontrado = nuevosCriterios.find((nc) => nc.id === base.id);
    return encontrado || base;
  });
}

// --- Alinear evaluaciones según el orden de criteriosCompletos
const evaluacionesAlineadas = criteriosCompletos.map((c) => {
  const encontrada = nuevosEvaluaciones.find((e) => e.criterio === c.nombre);
  return (
    encontrada || {
      criterio: c.nombre,
      puntajes: { p1: "", p2: "", p3: "" },
      observaciones: "",
    }
  );
});

// 🧹 Filtrar criterios que NO tienen ningún puntaje (nunca usados)
const criteriosFiltrados = [];
const evaluacionesFiltradas = [];

evaluacionesAlineadas.forEach((ev, index) => {
  const sinPuntaje =
    (!ev.puntajes.p1 || ev.puntajes.p1 === "") &&
    (!ev.puntajes.p2 || ev.puntajes.p2 === "") &&
    (!ev.puntajes.p3 || ev.puntajes.p3 === "");

  // Si todos los puntajes están vacíos, NO se agrega ese criterio
  if (!sinPuntaje) {
    criteriosFiltrados.push(criteriosCompletos[index]);
    evaluacionesFiltradas.push(ev);
  }
});

setCriterios(criteriosFiltrados);
setEvaluaciones(evaluacionesFiltradas);
showToast("Evaluación cargada correctamente con puntajes.", "success");

    // 💡 Debug: confirmar que cada criterio tiene sus puntajes
    console.table(
      evaluacionesAlineadas.map((e) => ({
        criterio: e.criterio,
        p1: e.puntajes.p1,
        p2: e.puntajes.p2,
        p3: e.puntajes.p3,
      }))
    );
  } catch (err) {
    console.error("Error cargando evaluación:", err);
    showToast("Error al cargar la evaluación seleccionada.", "error");
  }
};


  const eliminarCriterio = (index) => {
    const nuevosCriterios = [...criterios];
    const nuevasEvaluaciones = [...evaluaciones];
    nuevosCriterios.splice(index, 1);
    nuevasEvaluaciones.splice(index, 1);
    setCriterios(nuevosCriterios);
    setEvaluaciones(nuevasEvaluaciones);
  };

  const handleCriterioChange = (index, field, value) => {
    const nuevosCriterios = [...criterios];
    nuevosCriterios[index][field] = value;
    setCriterios(nuevosCriterios);

    if (field === "nombre") {
      const nuevasEvaluaciones = [...evaluaciones];
      nuevasEvaluaciones[index].criterio = value;
      setEvaluaciones(nuevasEvaluaciones);
    }
  };

  // === Guardar evaluación general (botón GUARDAR CRITERIOS) ===
  const handleGuardarCriterios = async () => {
    try {
      if (!convocatoriaSeleccionada) {
        showToast("Debes seleccionar una convocatoria.", "warning");
        return;
      }

      const seleccionadosReales = nombresEvaluados.filter((n) => n !== null);
      if (seleccionadosReales.length < 2) {
        showToast("Debe haber al menos 2 aspirantes para evaluar.", "warning");
        return;
      }


      //  Obtener variable
      const variableRes = await fetch(`${API}/variables/?idtipoevaluacion=4`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      const variableData = (await variableRes.json()).results || [];
      if (!variableData.length)
        throw new Error("No existe variable para idtipoevaluacion=4");
      const idVariable = variableData[0].idvariable;

      //  Crear evaluación principal
      const evalRes = await fetch(`${API}/evaluacion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempleado: null,
          modalidad: "Entrevista",
          fechaevaluacion: new Date().toISOString(),
          puntajetotal: 0,
          observacion: "Evaluación general de convocatoria",
          estado: true,
          idusuario: 1,
          idpostulacion: nombresEvaluados[0]?.idpostulacion || null,
        }),
      });

      if (!evalRes.ok) throw new Error("Error al crear evaluación principal");
      const evalData = await evalRes.json();
      const idevaluacion = evalData.idevaluacion;

      //  Asegurar que los criterios estén creados en la BD
      const criteriosIds = [];
      for (const c of criterios) {
        let idCriterio = c.id;
        if (!c.id || String(c.id).startsWith("uuid")) {
          const res = await fetch(`${API}/criterio/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              idvariable: idVariable,
              nombrecriterio: c.nombre.trim() || "Sin nombre",
              descripcioncriterio: c.descripcion.trim() || "Sin descripción",
              estado: true,
              idusuario: 1,
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          idCriterio = data.idcriterio;
        }
        criteriosIds.push(idCriterio);
      }

      //  Crear EvaluacionCriterio para cada persona y cada criterio
      for (let idx = 0; idx < criterios.length; idx++) {
        for (let persona of ["p1", "p2", "p3"]) {
          const aspirante = nombresEvaluados[persona === "p1" ? 0 : persona === "p2" ? 1 : 2];
          if (!aspirante) continue;

          const puntaje = parseFloat(evaluaciones[idx].puntajes[persona] || 0);
          const observacion = evaluaciones[idx].observaciones || "";

          const payload = {
            idevaluacion,
            idcriterio: criteriosIds[idx],
            puntajecriterio: puntaje,
            observacion,
            estado: true,
            idusuario: 1,
            idpostulacion: aspirante.idpostulacion,
          };

          await fetch(`${API}/evaluacioncriterio/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });
        }
      }

      showToast("Evaluación y criterios guardados correctamente.", "success");
    } catch (err) {
      console.error("Error guardando evaluación:", err);
      showToast("Error al guardar evaluación.", "error");
    }
  };

  return {
  convocatorias,
  setConvocatoriaSeleccionada,
  convocatoriasConEvaluacionActiva,
  convocatoriaSeleccionada,
  nombresEvaluados,
  setNombresEvaluados,   //   agregar
  criterios,
  setCriterios,          //   agregar
  evaluaciones,
  setEvaluaciones,       //   agregar
  setGanador,            //   agregar
  totalPorPersona,
  handleChange,
  agregarCriterio,
  eliminarCriterio,
  handleCriterioChange,
  handleGuardarCriterios,
  evaluacionesGuardadas,
  evaluacionSeleccionada,
  setEvaluacionSeleccionada,
  cargarEvaluacionExistente,
};

};

export default useEvaluacionSeleccion;
