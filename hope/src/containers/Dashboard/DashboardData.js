import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const fetchList = async (endpoint) => {
  try {
    const res = await axios.get(`${API}/${endpoint}/`);
    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results || [];
    return data;
  } catch (err) {
    return [];
  }
};
/* Capacitaciones */
export const fetchCapacitaciones = async () => {
  const capacitaciones = await fetchList("capacitaciones");
  const activas = capacitaciones.filter(
    (c) => c.estado === true || c.estado === "true"
  );
  return activas;
};

/*EmpleadoCapacitación */
export const fetchEmpleadoCapacitacion = async () => {
  const asignaciones = await fetchList("empleadocapacitacion");
  const activas = asignaciones.filter(
    (a) => a.estado === true || a.estado === "true"
  );
  return activas;
};

/* Empleados */
export const fetchEmpleados = async () => {
  const empleados = await fetchList("empleados");
  return empleados;
};

export const fetchAusencias = async () => {
  const ausencias = await fetchList("ausencias");
  const empleados = await fetchList("empleados");

  const empleadosMap = {};
  empleados.forEach(e => {
    empleadosMap[e.idempleado] = e;
  });

  const activas = ausencias
    .filter(a =>
      (a.estado === true || a.estado === "true") &&   // debe estar activa
      (a.idestado === null || a.idestado !== 6)        // no debe estar finalizada
    )
    .map(a => ({
      ...a,
      empleado: empleadosMap[a.idempleado] || null,
    }));

  return activas;
};


export const fetchCatalogos = async () => {
  const [puestos, idiomas, pueblos] = await Promise.all([
    fetchList("puestos"),
    fetchList("idiomas"),
    fetchList("pueblocultura"), 
  ]);

  const mapPuestos = {};
  const mapIdiomas = {};
  const mapPueblos = {};

  puestos.forEach((p) => (mapPuestos[p.idpuesto] = p.nombrepuesto));
  idiomas.forEach((i) => (mapIdiomas[i.ididioma] = i.nombreidioma));

  pueblos.forEach((p) => (mapPueblos[p.idpueblocultura] = p.nombrepueblo));
  return { mapPuestos, mapIdiomas, mapPueblos };
};


/**  Por género */
export const getEmpleadosPorGenero = (empleados) => {
  if (!empleados?.length) return [];
  const activos = empleados.filter((e) => e.estado === true);
  const conteo = activos.reduce((acc, e) => {
    const genero = (e.genero || "No especificado").toLowerCase();
    acc[genero] = (acc[genero] || 0) + 1;
    return acc;
  }, {});
  const result = Object.entries(conteo).map(([name, value]) => ({ name, value }));
  return result;
};

export const getDataCapacitaciones = (capacitaciones, asignaciones) => {
  if (!capacitaciones?.length) return [];

  const hoy = new Date();

  // Filtrar solo capacitaciones activas (no finalizadas)
  const activas = capacitaciones.filter(cap => {
    if (!cap.estado) return false; // inactiva manualmente
    const inicio = new Date(cap.fechainicio);
    const fin = new Date(cap.fechafin);
    // excluir finalizadas
    return fin >= hoy; 
  });

  // Agrupar para el gráfico
  const result = activas.map(cap => {
    const count = asignaciones.filter(
      a => a.idcapacitacion === cap.idcapacitacion
    ).length;

    return {
      name: cap.nombreevento,
      value: count,
    };
  });

  return result;
};



/**  Por rango de edad */
export const getEmpleadosPorRangoEdad = (empleados) => {
  if (!empleados?.length) return [];

  const activos = empleados.filter((e) => e.estado === true);
  const ahora = new Date();

  const calcularEdad = (f) => {
    if (!f) return null;
    const fecha = new Date(f);
    let edad = ahora.getFullYear() - fecha.getFullYear();
    const m = ahora.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && ahora.getDate() < fecha.getDate())) edad--;
    return edad;
  };

  //  RANGOS MÁS ESPECÍFICOS
  const rangos = {
    "18-20": 0,
    "21-25": 0,
    "26-30": 0,
    "31-35": 0,
    "36-40": 0,
    "41-50": 0,
    "51-60": 0,
    "60+": 0,
  };

  activos.forEach((e) => {
    const edad = calcularEdad(e.fechanacimiento);
    if (!edad) return;

    if (edad <= 20) rangos["18-20"]++;
    else if (edad <= 25) rangos["21-25"]++;
    else if (edad <= 30) rangos["26-30"]++;
    else if (edad <= 35) rangos["31-35"]++;
    else if (edad <= 40) rangos["36-40"]++;
    else if (edad <= 50) rangos["41-50"]++;
    else if (edad <= 60) rangos["51-60"]++;
    else rangos["60+"]++;
  });

  return Object.entries(rangos).map(([name, value]) => ({
    name,
    value,
  }));
};

/** Por puesto */
export const getEmpleadosPorPuesto = (empleados, mapPuestos) => {
  if (!empleados?.length) return [];
  const activos = empleados.filter((e) => e.estado === true && e.idpuesto);
  const conteo = activos.reduce((acc, e) => {
    const nombre = mapPuestos[e.idpuesto];
    if (!nombre) return acc;
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});
  const result = Object.entries(conteo).map(([name, value]) => ({ name, value }));
  return result;
};

/** Por idioma */
export const getEmpleadosPorIdioma = (empleados, mapIdiomas) => {
  if (!empleados?.length) return [];
  const activos = empleados.filter((e) => e.estado === true && e.ididioma);
  const conteo = activos.reduce((acc, e) => {
    const nombre = mapIdiomas[e.ididioma];
    if (!nombre) return acc;
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});
  const result = Object.entries(conteo).map(([name, value]) => ({ name, value }));
  return result;
};

/** Por pueblo/cultura */
export const getEmpleadosPorPuebloCultura = (empleados, mapPueblos) => {
  if (!empleados?.length) return [];
  const activos = empleados.filter((e) => e.estado === true && e.idpueblocultura);
  const conteo = activos.reduce((acc, e) => {
    const nombre = mapPueblos[e.idpueblocultura];
    if (!nombre) return acc; // si no tiene nombre asociado, ignorar
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {});
  const result = Object.entries(conteo).map(([name, value]) => ({ name, value }));
  return result;
};
/** Equipos activos */
export const fetchEquipos = async () => {
  const equipos = await fetchList("equipos");
  const activos = equipos.filter(
    (e) => e.estado === true || e.estado === "true"
  );
  return activos;
};
/** Convocatorias activas */
export const fetchConvocatorias = async () => {
  const convocatorias = await fetchList("convocatorias");
  const activas = convocatorias.filter(
    (c) => c.estado === true || c.estado === "true"
  );
  return activas;
};
