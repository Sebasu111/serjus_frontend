// useEvaluacionSeleccion.js
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { showToast, showPDFToasts } from "../../utils/toast";

const useEvaluacionSeleccion = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState("");
  const [nombresEvaluados, setNombresEvaluados] = useState([null, null, null]);
  const [criterios, setCriterios] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [ganador, setGanador] = useState(null);

  // === Cargar convocatorias ===
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/convocatorias/")
      .then((res) => res.json())
      .then((data) => setConvocatorias(data.results || data))
      .catch((err) => console.error("Error cargando convocatorias:", err));
  }, []);

  // === Cargar criterios desde la API ===
  useEffect(() => {
    const cargarCriterios = async () => {
      try {
        const variableRes = await fetch(
          "http://127.0.0.1:8000/api/variables/?idtipoevaluacion=4"
        );
        const variableData = (await variableRes.json()).results || [];
        if (!variableData.length) return;

        const idVariable = variableData[0].idvariable;

        const criteriosRes = await fetch(
          `http://127.0.0.1:8000/api/criterio/?idvariable=${idVariable}`
        );
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

  // === Cuando se selecciona convocatoria ===
  useEffect(() => {
    if (!convocatoriaSeleccionada) return;

    const cargarAspirantes = async () => {
      try {
        const postRes = await fetch("http://127.0.0.1:8000/api/postulaciones/");
        const aspRes = await fetch("http://127.0.0.1:8000/api/aspirantes/");

        const postulaciones = (await postRes.json()).results || [];
        const aspirantes = (await aspRes.json()).results || [];

        const postulacionesFiltradas = postulaciones.filter(
          (p) =>
            p.idconvocatoria === Number(convocatoriaSeleccionada) &&
            p.idestado === 2
        );

        const seleccionados = postulacionesFiltradas
          .map((p) => {
            const aspirante = aspirantes.find(
              (a) => a.idaspirante === p.idaspirante
            );
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

  const handleChange = (index, field, value, persona) => {
    const newEval = [...evaluaciones];
    if (field === "observaciones") newEval[index].observaciones = value;
    else newEval[index].puntajes[persona] = Number(value);
    setEvaluaciones(newEval);
  };

  // === Agregar / eliminar / editar criterios dinámicos ===
  const agregarCriterio = () => {
    const nuevo = { id: `uuid-${uuidv4()}`, nombre: "", descripcion: "" };
    setCriterios([...criterios, nuevo]);
    setEvaluaciones([
      ...evaluaciones,
      { criterio: "", puntajes: { p1: "", p2: "", p3: "" }, observaciones: "" },
    ]);
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

  // === Guardar evaluación ===
  const handleGuardarEvaluacion = async (indiceGanador) => {
    try {
      console.log("=== Iniciando guardado de evaluación ===");

      const ganadorObj = nombresEvaluados[indiceGanador];
      if (!ganadorObj || !ganadorObj.idpostulacion) {
        showToast("No se encontró la postulación del ganador.", "error");
        console.error("Postulación no encontrada:", ganadorObj);
        return;
      }

      const nombreGanador = ganadorObj.nombre;
      console.log("Ganador seleccionado:", nombreGanador);

      // ✅ Calcular total
      const total = totalPorPersona(`p${indiceGanador + 1}`);
      if (isNaN(total)) {
        showToast("Error: alguno de los puntajes es inválido.", "error");
        return;
      }
      console.log("Puntaje total:", total);

      // ✅ Crear evaluación principal
      const evaluacionRes = await fetch("http://127.0.0.1:8000/api/evaluacion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempleado: null,
          modalidad: "Entrevista",
          fechaevaluacion: new Date().toISOString(),
          puntajetotal: total,
          observacion: "Evaluación automática",
          estado: true,
          idusuario: 1,
          idpostulacion: ganadorObj.idpostulacion,
        }),
      });

      if (!evaluacionRes.ok) {
        const errorText = await evaluacionRes.text();
        throw new Error("Error al crear evaluación: " + errorText);
      }

      const evaluacionData = await evaluacionRes.json();
      const idevaluacion = evaluacionData.idevaluacion;
      console.log("Evaluación creada con ID:", idevaluacion);

      // ✅ Obtener variable válida
      const variableRes = await fetch(
        "http://127.0.0.1:8000/api/variables/?idtipoevaluacion=4"
      );
      const variableData = (await variableRes.json()).results || [];
      if (!variableData.length)
        throw new Error("No existe variable para idtipoevaluacion=4");
      const idVariable = variableData[0].idvariable;
      console.log("Variable encontrada:", idVariable);

      // ✅ Crear criterios nuevos si los hay
      const criteriosIds = [];
      for (const c of criterios) {
        let idCriterio = c.id;

        if (!c.id || String(c.id).startsWith("uuid")) {
          const payload = {
            idvariable: idVariable,
            nombrecriterio: c.nombre?.trim() || "Sin nombre",
            descripcioncriterio: c.descripcion?.trim() || "Sin descripción",
            estado: true,
            idusuario: 1,
          };

          console.log("Creando nuevo criterio:", payload);

          const res = await fetch("http://127.0.0.1:8000/api/criterio/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("❌ Error creando criterio:", errorText);
            alert("Error al crear un criterio. Revise la consola para más detalles.");
            continue;
          }

          const data = await res.json();
          idCriterio = data.idcriterio;
          console.log("Criterio creado con ID:", idCriterio);
        }

        criteriosIds.push({ idCriterio, descripcion: c.descripcion });
      }

      // ✅ Crear evaluacióncriterio
      for (let idx = 0; idx < criterios.length; idx++) {
        const puntaje = parseFloat(
          evaluaciones[idx].puntajes[`p${indiceGanador + 1}`] || 0
        );
        const observacion = evaluaciones[idx].observaciones || "";

        const payloadEvalCriterio = {
          idevaluacion,
          idcriterio: parseInt(criteriosIds[idx].idCriterio),
          puntajecriterio: puntaje,
          observacion,
          estado: true,
          idusuario: 1,
        };

        console.log("Creando EvaluacionCriterio:", payloadEvalCriterio);

        const res = await fetch("http://127.0.0.1:8000/api/evaluacioncriterio/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadEvalCriterio),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error creando EvaluacionCriterio:", errorText);
        }
      }

      // ✅ Marcar postulaciones como inactivas (usando PUT con objeto completo)
      console.log("=== Marcando postulaciones como inactivas ===");
      const postRes = await fetch("http://127.0.0.1:8000/api/postulaciones/");
      const postulaciones = (await postRes.json()).results || [];
      const postulacionesAMarcar = postulaciones.filter(
        (p) => p.idconvocatoria === Number(convocatoriaSeleccionada)
      );

      for (const post of postulacionesAMarcar) {
        // Obtener el registro completo
        const getRes = await fetch(`http://127.0.0.1:8000/api/postulaciones/${post.idpostulacion}/`);
        if (!getRes.ok) {
          console.error("❌ Error obteniendo postulación:", post.idpostulacion);
          continue;
        }
        const postData = await getRes.json();

        // Modificar solo el estado y enviar objeto completo
        const updatedPost = { ...postData, estado: false };

        const updateRes = await fetch(`http://127.0.0.1:8000/api/postulaciones/${post.idpostulacion}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPost),
        });

        if (!updateRes.ok) {
          const errorText = await updateRes.text();
          console.error("❌ Error marcando postulación como inactiva:", post.idpostulacion, errorText);
          alert(`Error al marcar postulación ${post.idpostulacion} como inactiva. Detalles: ${errorText}`);
        } else {
          console.log("Postulación marcada como inactiva:", post.idpostulacion);
        }
      }

      // ✅ Marcar convocatoria como inactiva (usando PUT con objeto completo)
      console.log("=== Marcando convocatoria como inactiva ===");
      // Obtener el registro completo
      const getConvRes = await fetch(`http://127.0.0.1:8000/api/convocatorias/${convocatoriaSeleccionada}/`);
      if (!getConvRes.ok) {
        console.error("❌ Error obteniendo convocatoria:", convocatoriaSeleccionada);
        alert(`Error al obtener convocatoria ${convocatoriaSeleccionada}.`);
      } else {
        const convData = await getConvRes.json();

        // Modificar solo el estado y enviar objeto completo
        const updatedConv = { ...convData, estado: false };

        const updateConvRes = await fetch(`http://127.0.0.1:8000/api/convocatorias/${convocatoriaSeleccionada}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedConv),
        });

        if (!updateConvRes.ok) {
          const errorText = await updateConvRes.text();
          console.error("❌ Error marcando convocatoria como inactiva:", convocatoriaSeleccionada, errorText);
          alert(`Error al marcar convocatoria ${convocatoriaSeleccionada} como inactiva. Detalles: ${errorText}`);
        } else {
          console.log("Convocatoria marcada como inactiva:", convocatoriaSeleccionada);
        }
      }

      // ✅ Recargar convocatorias y resetear estado
      const newConvRes = await fetch("http://127.0.0.1:8000/api/convocatorias/");
      const newConvData = (await newConvRes.json()).results || [];
      setConvocatorias(newConvData);
      setConvocatoriaSeleccionada("");
      setNombresEvaluados([null, null, null]);
      setEvaluaciones([]);
      setGanador(null);

      showToast(`Evaluación y contratación de ${nombreGanador} guardadas correctamente. Proceso finalizado.`);
      console.log("=== Evaluación completada exitosamente ===");
      if (ganadorObj?.idaspirante && convocatoriaSeleccionada) {
        showToast("Redirigiendo al registro de colaborador...", "success");
        window.location.href = `/empleados?aspirante=${ganadorObj.idaspirante}&convocatoria=${convocatoriaSeleccionada}`;
      }
    } catch (err) {
      console.error("Error guardando evaluación:", err);
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
    handleGuardarEvaluacion,
  };
};

export default useEvaluacionSeleccion;
