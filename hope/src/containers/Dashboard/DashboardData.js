import axios from "axios";

const API = "http://127.0.0.1:8000/api";

/* =====================================================
   🔹 UTILIDAD BASE PARA OBTENER LISTAS
   ===================================================== */
const fetchList = async (endpoint) => {
  try {
    const res = await axios.get(`${API}/${endpoint}/`);
    const data = Array.isArray(res.data)
      ? res.data
      : res.data.results || [];
    console.log(`✅ [${endpoint}] Registros obtenidos: ${data.length}`);
    return data;
  } catch (err) {
    console.error(`❌ [${endpoint}] Error al obtener datos:`, err);
    return [];
  }
};

/* =====================================================
   🔹 FETCHERS PRINCIPALES
   ===================================================== */

/** 🔸 Empleados */
export const fetchEmpleados = async () => {
  const empleados = await fetchList("empleados");
  console.log("📦 [fetchEmpleados] Ejemplo empleado:", empleados[0]);
  return empleados;
};

/** 🔸 Ausencias activas */
export const fetchAusencias = async () => {
  const ausencias = await fetchList("ausencias");
  const activas = ausencias.filter(
    (a) => a.estado === true || a.estado === "true"
  );
  console.log("📋 [fetchAusencias] Activas:", activas.length);
  return activas;
};

/** 🔸 Catálogos (rutas corregidas y con campo correcto para pueblo) */
export const fetchCatalogos = async () => {
  const [puestos, idiomas, pueblos] = await Promise.all([
    fetchList("puestos"),
    fetchList("idiomas"),
    fetchList("pueblocultura"), // ✅ tu endpoint real
  ]);

  const mapPuestos = {};
  const mapIdiomas = {};
  const mapPueblos = {};

  puestos.forEach((p) => (mapPuestos[p.idpuesto] = p.nombrepuesto));
  idiomas.forEach((i) => (mapIdiomas[i.ididioma] = i.nombreidioma));

  // 👇 aquí el cambio clave: usa el campo correcto "nombrepueblo"
  pueblos.forEach((p) => (mapPueblos[p.idpueblocultura] = p.nombrepueblo));

  console.log("🗂️ Catálogos cargados:", {
    puestos: puestos.length,
    idiomas: idiomas.length,
    pueblos: pueblos.length,
  });

  return { mapPuestos, mapIdiomas, mapPueblos };
};

/* =====================================================
   🔹 AGRUPADORES (solo empleados activos y con valor asignado)
   ===================================================== */

/** 🔸 Por género */
export const getEmpleadosPorGenero = (empleados) => {
  if (!empleados?.length) return [];
  const activos = empleados.filter((e) => e.estado === true);
  const conteo = activos.reduce((acc, e) => {
    const genero = (e.genero || "No especificado").toLowerCase();
    acc[genero] = (acc[genero] || 0) + 1;
    return acc;
  }, {});
  const result = Object.entries(conteo).map(([name, value]) => ({ name, value }));
  console.log("📊 [getEmpleadosPorGenero] Resultado:", result);
  return result;
};

/** 🔸 Por rango de edad */
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
  const rangos = { "18-25": 0, "26-35": 0, "36-45": 0, "46-60": 0, "60+": 0 };
  activos.forEach((e) => {
    const edad = calcularEdad(e.fechanacimiento);
    if (!edad) return;
    if (edad <= 25) rangos["18-25"]++;
    else if (edad <= 35) rangos["26-35"]++;
    else if (edad <= 45) rangos["36-45"]++;
    else if (edad <= 60) rangos["46-60"]++;
    else rangos["60+"]++;
  });
  const result = Object.entries(rangos).map(([name, value]) => ({ name, value }));
  console.log("📊 [getEmpleadosPorRangoEdad] Resultado:", result);
  return result;
};

/** 🔸 Por puesto */
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
  console.log("📊 [getEmpleadosPorPuesto] Resultado:", result);
  return result;
};

/** 🔸 Por idioma */
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
  console.log("📊 [getEmpleadosPorIdioma] Resultado:", result);
  return result;
};

/** 🔸 Por pueblo/cultura */
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
  console.log("📊 [getEmpleadosPorPuebloCultura] Resultado:", result);
  return result;
};
