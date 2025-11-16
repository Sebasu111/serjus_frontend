// Configuración centralizada para la API
const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL,

    // Endpoints específicos
    ENDPOINTS: {
        // Contratos
        CONTRATOS: "/contratos/",

        // Puestos
        PUESTOS: "/puestos/",

        // Colaboradores
        EMPLEADOS: "/empleados/",

        // Usuarios
        USUARIOS: "/usuarios/",

        // Roles
        ROLES: "/roles/",

        // Login
        LOGIN: "/login/",

        // Convocatorias
        CONVOCATORIAS: "/convocatorias/",

        // Aspirantes
        ASPIRANTES: "/aspirantes/",

        // Postulaciones
        POSTULACIONES: "/postulaciones/",

        // Documentos
        DOCUMENTOS: "/documentos/",

        // Tipos de Documento
        TIPODOCUMENTO: "/tipodocumento/",

        // Terminación Laboral
        TERMINACIONLABORAL: "/terminacionlaboral/",

        // Idiomas
        IDIOMAS: "/idiomas/",

        // Pueblo Cultura
        PUEBLOCULTURA: "/pueblocultura/",

        // Historial de Puestos
        HISTORIALPUESTO: "/historialpuestos/"
    }
};

// Función helper para construir URLs
export const buildApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para construir URL con ID
export const buildApiUrlWithId = (endpoint, id) => {
    return `${API_CONFIG.BASE_URL}${endpoint}${id}/`;
};

// Función para obtener headers comunes
export const getApiHeaders = () => {
    const token = localStorage.getItem('authToken'); // Si usas autenticación
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export { API_CONFIG };
export default API_CONFIG;