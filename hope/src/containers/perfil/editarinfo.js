// editarinfo.js
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const API2 = process.env.REACT_APP_API_DOCS; // por si se usa más adelante
const token = sessionStorage.getItem("token");

// 🔹 Idiomas y pueblos
export const fetchIdiomasYPueblos = async () => {
  try {
    const [resIdiomas, resPueblos] = await Promise.all([
      axios.get(`${API}/idiomas/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API}/pueblocultura/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    return {
      idiomas: resIdiomas.data.results || [],
      pueblos: resPueblos.data.results || [],
    };
  } catch (error) {
    console.error("Error cargando idiomas y pueblos:", error);
    return { idiomas: [], pueblos: [] };
  }
};

// 🔹 Traer CV actual del colaborador (último activo)
export const fetchCVEmpleado = async (idempleado) => {
  try {
    if (!idempleado) return null;

    const res = await axios.get(`${API}/documentos/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const documentos = res.data.results || res.data;

    const cvs = documentos
      .filter(
        (d) =>
          d.idempleado === idempleado &&
          d.estado === true &&
          d.idtipodocumento === 1 && // 1 = CV
          d.archivo_url
      )
      .sort((a, b) => new Date(b.createdat) - new Date(a.createdat));

    return cvs.length > 0 ? cvs[0].archivo_url : null;
  } catch (error) {
    console.error("Error cargando CV del colaborador:", error);
    return null;
  }
};

// 🔹 Actualizar datos del empleado
export const updateEmpleado = async (idempleado, data) => {
  const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

  const payload = {
    dpi: data.dpi,
    nit: data.nit,
    nombre: data.nombre,
    apellido: data.apellido,
    genero: data.genero,
    lugarnacimiento: data.lugarnacimiento,
    fechanacimiento: data.fechanacimiento,
    telefonocelular: data.telefonocelular,
    telefonoresidencial: data.telefonoresidencial,
    telefonoemergencia: data.telefonoemergencia,
    titulonivelmedio: data.titulonivelmedio,
    estudiosuniversitarios: data.estudiosuniversitarios,
    email: data.email,
    direccion: data.direccion,
    estadocivil: data.estadocivil,
    numerohijos: Number(data.numerohijos || 0),
    numeroiggs: data.numeroiggs,
    inicioLaboral: data.inicioLaboral || null, // string 'YYYY-MM-DD' o null
    estado: true,
    idusuario: idUsuario,
    idaspirante: data.idaspirante ?? null,
    ididioma: data.ididioma ? Number(data.ididioma) : null,
    idpueblocultura: data.idpueblocultura ? Number(data.idpueblocultura) : null,
    idequipo: data.idequipo ?? null,
    idpuesto: data.idpuesto ? Number(data.idpuesto) : null,
  };

  // Limpieza por si el backend no acepta null en algunos FK (puedes cambiarlo por 0 si tu API usa 0)
  if (payload.idequipo === null) delete payload.idequipo;
  if (payload.idaspirante === null) delete payload.idaspirante;

  return axios.put(`${API}/empleados/${idempleado}/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Guardar CV del colaborador (POST nuevo archivo)
export const saveCVEmpleado = async (idempleado, file) => {
  try {
    if (!file || !idempleado) return null;

    const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

    const formData = new FormData();
    formData.append("archivo", file); // File real
    formData.append("nombrearchivo", file.name);

    // tipo MIME → solo la parte de extensión si viene, si no, pdf por defecto
    const mime = (file.type || "").split("/")[1] || "pdf";
    formData.append("mimearchivo", mime);

    // Fecha de hoy YYYY-MM-DD
    const hoy = new Date().toISOString().split("T")[0];
    formData.append("fechasubida", hoy);

    formData.append("estado", "true");
    formData.append("idusuario", String(idUsuario));
    formData.append("idtipodocumento", "1"); // 1 = CV (según tu catálogo)
    formData.append("idempleado", String(idempleado));
    // No mandamos idaspirante para que quede null

    const res = await axios.post(`${API}/documentos/`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error guardando CV:",
      error.response?.data || error
    );
    throw error;
  }
};
