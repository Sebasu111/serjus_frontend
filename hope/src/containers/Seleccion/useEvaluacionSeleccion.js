// useEvaluacionSeleccion.js
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { showToast } from "../../utils/toast";

const API = "http://127.0.0.1:8000/api";

const useEvaluacionSeleccion = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState("");
  const [nombresEvaluados, setNombresEvaluados] = useState([null, null, null]);
  const [criterios, setCriterios] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [ganador, setGanador] = useState(null);

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
        const variableRes = await fetch(`${API}/variables/?idtipoevaluacion=4`);
        const variableData = (await variableRes.json()).results || [];
        if (!variableData.length) return;

        const idVariable = variableData[0].idvariable;

        const criteriosRes = await fetch(`${API}/criterio/?idvariable=${idVariable}`);
        const criteriosData = (await criteriosRes.json()).results || [];

        const listaCriterios = criteriosData.map((c) => ({
          id: c.idcriterio,
          nombre: c.nombrecriterio,
          descripcion: c.descripcioncriterio,
        }));

        setCriterios(listaCriterios);
      } catch (err) {
        showToast("Error cargando criterios:", "error");
      }
    };

    cargarCriterios();
  }, []);

  // === Cargar aspirantes de la convocatoria seleccionada ===
  useEffect(() => {
    if (!convocatoriaSeleccionada) return;

    const cargarAspirantes = async () => {
      try {
        const postRes = await fetch(`${API}/postulaciones/`);
        const aspRes = await fetch(`${API}/aspirantes/`);

        const postulaciones = (await postRes.json()).results || [];
        const aspirantes = (await aspRes.json()).results || [];

        const postulacionesFiltradas = postulaciones.filter(
          (p) =>
            p.idconvocatoria === Number(convocatoriaSeleccionada) &&
            p.idestado === 2
        );

        const seleccionados = postulacionesFiltradas
          .map((p) => {
            const aspirante = aspirantes.find((a) => a.idaspirante === p.idaspirante);
            if (!aspirante) return null;
            return {
              idaspirante: aspirante.idaspirante,
              idpostulacion: p.idpostulacion,
              nombre: `${aspirante.nombreaspirante} ${aspirante.apellidoaspirante}`,
            };
          })
          .filter(Boolean)
          .slice(0, 3);

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
    setEvaluaciones(
      criterios.map((c) => ({
        criterio: c.nombre,
        puntajes: { p1: "", p2: "", p3: "" },
        observaciones: "",
      }))
    );
  }, [criterios, nombresEvaluados]);

  // === Totales ===
  const totalPorPersona = (persona) =>
    evaluaciones.reduce((acc, e) => acc + (Number(e.puntajes[persona]) || 0), 0);

  useEffect(() => {
    const totales = {
      p1: totalPorPersona("p1"),
      p2: totalPorPersona("p2"),
      p3: totalPorPersona("p3"),
    };
    const max = Math.max(totales.p1, totales.p2, totales.p3);
    const keys = Object.keys(totales).filter((k) => totales[k] === max);
    setGanador(keys.length === 1 ? keys[0] : null);
  }, [evaluaciones]);

  // === Handlers de campos ===
  const handleChange = (index, field, value, persona) => {
    const newEval = [...evaluaciones];
    if (field === "observaciones") newEval[index].observaciones = value;
    else newEval[index].puntajes[persona] = Number(value);
    setEvaluaciones(newEval);
  };

  const agregarCriterio = () => {
    const selCount = nombresEvaluados.filter(
      (n) => n && n.nombre && n.nombre.trim() !== ""
    ).length;

    if (selCount < 3) {
      showToast("Debes tener 3 postulaciones seleccionadas antes de agregar criterios.", "warning");
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

      if (!nombresEvaluados.some((n) => n)) {
        showToast("No hay aspirantes seleccionados.", "warning");
        return;
      }

      console.log("=== Iniciando guardado general de evaluación ===");

      // ✅ Obtener variable
      const variableRes = await fetch(`${API}/variables/?idtipoevaluacion=4`);
      const variableData = (await variableRes.json()).results || [];
      if (!variableData.length)
        throw new Error("No existe variable para idtipoevaluacion=4");
      const idVariable = variableData[0].idvariable;

      // ✅ Crear evaluación principal
      const evalRes = await fetch(`${API}/evaluacion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      console.log("Evaluación creada:", idevaluacion);

      // ✅ Asegurar que los criterios estén creados en la BD
      const criteriosIds = [];
      for (const c of criterios) {
        let idCriterio = c.id;
        if (!c.id || String(c.id).startsWith("uuid")) {
          const res = await fetch(`${API}/criterio/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

      // ✅ Crear EvaluacionCriterio para cada persona y cada criterio
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
          };

          await fetch(`${API}/evaluacioncriterio/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      }

      showToast("Evaluación y criterios guardados correctamente.", "success");
      console.log("=== Evaluación general guardada ===");
    } catch (err) {
      console.error("Error guardando evaluación:", err);
      showToast("Error al guardar evaluación.", "error");
    }
  };

  return {
    convocatorias,
    setConvocatoriaSeleccionada,
    convocatoriaSeleccionada,
    nombresEvaluados,
    criterios,
    evaluaciones,
    ganador,
    totalPorPersona,
    handleChange,
    agregarCriterio,
    eliminarCriterio,
    handleCriterioChange,
    handleGuardarCriterios, // 👈 nuevo
  };
};

export default useEvaluacionSeleccion;
