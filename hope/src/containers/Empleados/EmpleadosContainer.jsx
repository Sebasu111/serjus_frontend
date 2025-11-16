import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import EmpleadoForm from "./EmpleadoForm";
import ConfirmModal from "./ConfirmModal";
import EmpleadosTable from "./EmpleadosTable";
import TerminacionLaboralModal from "./TerminacionLaboralModal";

import FichaDownloadModal from "./FichaDownloadModal";
import { generarFichasPDF } from "./fichasPdf";
import logo from "./logo-asjerjus.png";
import UsuarioCreadoModal from "../../components/UsuarioCreado/UsuarioCreadoModal.jsx";
import HistorialPuestosModal from "./HistorialPuestosModal.jsx";

// 🔔 toasts y estilos compartidos
import { showToast, showPDFToasts } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

const API = "http://127.0.0.1:8000/api";
const API_HISTORIAL = "http://127.0.0.1:8000/api/historialpuestos/";
const empId = row => row?.id ?? row?.idempleado ?? row?.idEmpleado;

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = o =>
    pick(
        o,
        "id",
        "ididioma",
        "idIdioma",
        "idequipo",
        "idEquipo",
        "idpueblocultura",
        "idPuebloCultura",
        "idpuesto",
        "idPuesto",
        "pk",
        "codigo"
    );
const getName = (o, type) => {
    if (!o) return "";
    if (type === "idioma") return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
    if (type === "pueblo") return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label");
    if (type === "equipo") return pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");
    if (type === "puesto") return pick(o, "nombrepuesto", "nombrePuesto", "nombre", "descripcion", "label");
    return pick(o, "nombre", "descripcion", "label");
};

const mapaPuestoRol = {
    1: 2, // Acompañante → Acompañantes
    2: 1, // Coordinación operativa → Coordinadores
    3: 1, // Coordinación de sub-programa → Coordinadores
    4: 1, // Coordinación de programa → Coordinadores
    5: 4, // Secretaría → Secretarias
    6: 2, // Conserjería → Acompañantes
    7: 3, // Contador auxiliar → Contadores
    8: 3  // Contadora general → Contadores
};

const Section = ({ title, children }) => (
    <section style={{ marginBottom: 32 }}>
        <h4
            style={{
                margin: "0 0 16px 0",
                fontSize: 24,
                fontWeight: 800,
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: 8,
                color: "#0f172a",
                letterSpacing: 0.2
            }}
        >
            {title}
        </h4>
        {children}
    </section>
);

const Grid = ({ children }) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16
        }}
    >
        {children}
    </div>
);

const Item = ({ label, value, full }) => (
    <div
        style={{
            gridColumn: full ? "1 / -1" : "auto",
            background: "#f9fafb",
            border: "1px solid #eef2f7",
            borderRadius: 12,
            padding: 12
        }}
    >
        <div
            style={{
                fontSize: 12.5,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: "#6b7280",
                marginBottom: 6
            }}
        >
            {label}
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>{value || "—"}</div>
    </div>
);

const toDMY = value => {
    if (!value) return "—";
    const ymd = String(value).slice(0, 10);
    const [yyyy, mm, dd] = ymd.split("-");
    if (!yyyy || !mm || !dd) return value;
    return `${dd}-${mm}-${yyyy}`;
};

const EmpleadosContainer = () => {
    const [form, setForm] = useState({
        dpi: "",
        nit: "",
        nombre: "",
        apellido: "",
        genero: "",
        lugarnacimiento: "",
        fechanacimiento: "",
        telefonoresidencial: "",
        telefonocelular: "",
        telefonoemergencia: "",
        titulonivelmedio: "",
        estudiosuniversitarios: "",
        email: "",
        direccion: "",
        estadocivil: "",
        numerohijos: "",
        estado: true,
        ididioma: "",
        idpueblocultura: "",
        idpuesto: "",
        idequipo: "",
        numeroiggs: "",
        isCF: false,
        iniciolaboral: "",
        cvFile: null
    });
    const [cvExistente, setCvExistente] = useState(null);

    // Estados para el modal de contrato
    const [mostrarModalContrato, setMostrarModalContrato] = useState(false);
    const [empleadoParaContrato, setEmpleadoParaContrato] = useState(null);
    const [contratoFile, setContratoFile] = useState(null);
    const [contratoExistente, setContratoExistente] = useState(null);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // búsqueda/paginación
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);

    // modales
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [accionEstado, setAccionEstado] = useState(null); // "activar" | "desactivar"
    const [showDownload, setShowDownload] = useState(false);
    const [hoverDesc, setHoverDesc] = useState(false);
    const [generandoPDF, setGenerandoPDF] = useState(false);

    // catálogo
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [puestos, setPuestos] = useState([]);

    // detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);

    // modal usuario creado
    const [mostrarUsuarioCreado, setMostrarUsuarioCreado] = useState(false);
    const [datosUsuarioCreado, setDatosUsuarioCreado] = useState(null);

    // modal historial de puestos
    const [mostrarHistorialPuestos, setMostrarHistorialPuestos] = useState(false);

    // modal terminación laboral
    const [mostrarTerminacionLaboral, setMostrarTerminacionLaboral] = useState(false);
    const [empleadoParaTerminacion, setEmpleadoParaTerminacion] = useState(null);

    useEffect(() => {
        fetchList();
        fetchIdiomas();
        fetchPueblos();
        fetchEquipos();
        fetchPuestos();
    }, []);

    useEffect(() => {
        const equipoParam = new URLSearchParams(window.location.search).get("equipo");
        if (equipoParam) setForm(f => ({ ...f, idequipo: Number(equipoParam) || "" }));
    }, []);

    const getIdUsuario = () => {
        const v = sessionStorage.getItem("idUsuario") || localStorage.getItem("idUsuario");
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

    // Función para generar contraseña aleatoria
    const generarContrasenaAleatoria = () => {
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let contrasena = "";
        for (let i = 0; i < 8; i++) {
            contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return contrasena;
    };

    // Función para crear entrada en historial de puestos
    const crearHistorialPuesto = async (empleadoId, idPuesto, fechaInicio, salario = null) => {
        try {
            // Si no se proporcionó salario, intentar obtenerlo desde el catálogo de puestos
            let salarioFinal = salario;
            if (!salarioFinal || Number(salarioFinal) === 0) {
                const puestoObj = puestos.find(p => Number(p.idpuesto || p.id) === Number(idPuesto));
                salarioFinal = puestoObj?.salariobase ?? puestoObj?.salario ?? puestoObj?.salariominimo ?? 0;
            }

            const payload = {
                idempleado: empleadoId,
                idpuesto: idPuesto,
                fechainicio: fechaInicio,
                fechafin: null, // Se llena cuando cambie de puesto
                salario: Number(salarioFinal) || 0,
                observacion: "Registro automático por asignación/cambio de puesto",
                estado: true,
                idusuario: getIdUsuario()
            };

            await axios.post(API_HISTORIAL, payload);

        } catch (error) {
            console.error("Error al crear historial de puesto:", error);
            // No mostramos toast de error aquí para no interrumpir el flujo principal
        }
    };

    // Función para finalizar el historial anterior (poner fecha fin)
    const finalizarHistorialAnterior = async (empleadoId) => {
        try {
            const res = await axios.get(API_HISTORIAL);
            const todosHistoriales = Array.isArray(res.data) ? res.data : res.data?.results || [];

            // Buscar el historial activo (sin fecha fin) de este empleado, ordenado por fecha más reciente
            const historialesActivos = todosHistoriales
                .filter(h =>
                    h.idempleado === empleadoId &&
                    h.estado === true &&
                    (!h.fechafin || h.fechafin === null || h.fechafin === "")
                )
                .sort((a, b) => new Date(b.fechainicio) - new Date(a.fechainicio));

            if (historialesActivos.length > 0) {
                const historialActivo = historialesActivos[0]; // El más reciente
                const fechaFin = new Date().toISOString().slice(0, 10); // Fecha actual

                await axios.put(`${API_HISTORIAL}${historialActivo.idhistorialpuesto}/`, {
                    ...historialActivo,
                    fechafin: fechaFin,
                    idusuario: getIdUsuario()
                });
            }
        } catch (error) {
            console.error("Error al finalizar historial anterior:", error);
        }
    };

    // Función para crear usuario automáticamente según el puesto
    const crearUsuarioAutomatico = async (empleadoId, nombre, apellido, idPuesto) => {
        try {
            // Generar nombre de usuario basado en nombre y apellido
            const nombreUsuario = `${nombre.toLowerCase().split(' ')[0]}${apellido.toLowerCase().split(' ')[0]}`;

            // Generar contraseña aleatoria
            const contrasenaGenerada = generarContrasenaAleatoria();

            // 🔹 Mapeo fijo entre puestos y roles
            const mapaPuestoRol = {
                1: 2, // Acompañante → Acompañantes
                2: 1, // Coordinación operativa → Coordinadores
                3: 1, // Coordinación de sub-programa → Coordinadores
                4: 1, // Coordinación de programa → Coordinadores
                5: 4, // Secretaría → Secretarias
                6: 2, // Conserjería → Acompañantes
                7: 3, // Contador auxiliar → Contadores
                8: 3  // Contadora general → Contadores
            };

            // Asignar el rol correspondiente, si no existe usar Acompañantes como default
            const idRolAsignado = mapaPuestoRol[idPuesto] || 2;

            const ahora = new Date().toISOString();

            const payloadUsuario = {
                nombreusuario: nombreUsuario,
                contrasena: contrasenaGenerada,
                estado: true,
                createdat: ahora,
                updatedat: ahora,
                idrol: idRolAsignado,
                idempleado: empleadoId
            };

            await axios.post(`${API}/usuarios/`, payloadUsuario);

            return {
                usuario: nombreUsuario,
                contrasena: contrasenaGenerada,
                idRolAsignado
            };
        } catch (error) {
            console.error("Error al crear usuario automático:", error);
            throw error;
        }
    };

    useEffect(() => {
        const aspiranteParam = new URLSearchParams(window.location.search).get("aspirante");
        const convocatoriaParam = new URLSearchParams(window.location.search).get("convocatoria");
        if (!aspiranteParam) return;

        const cargarDesdeAspirante = async () => {
            try {
                // 🔹 Cargar datos del aspirante
                const aspRes = await axios.get(`http://127.0.0.1:8000/api/aspirantes/${aspiranteParam}/`);
                const aspirante = aspRes.data;

                // 🔹 Cargar convocatoria asociada
                const convRes = await axios.get(`${API}/convocatorias/${convocatoriaParam}/`);
                const convocatoria = convRes.data;

                // 🔹 Asegurar catálogos cargados
                if (!idiomas.length) await fetchIdiomas();
                if (!pueblos.length) await fetchPueblos();
                if (!equipos.length) await fetchEquipos();
                if (!puestos.length) await fetchPuestos();

                // 🔹 Precargar formulario
                setForm({
                    dpi: aspirante.dpi || "",
                    nit: aspirante.nit || "",
                    nombre: aspirante.nombreaspirante || "",
                    apellido: aspirante.apellidoaspirante || "",
                    genero: aspirante.genero || "",
                    lugarnacimiento: aspirante.lugarnacimiento || "",
                    fechanacimiento: aspirante.fechanacimiento || "",
                    telefonocelular: aspirante.telefono || "",
                    email: aspirante.email || "",
                    direccion: aspirante.direccion || "",
                    estadocivil: aspirante.estadocivil || "",
                    ididioma: aspirante.ididioma || "",
                    idpueblocultura: aspirante.idpueblocultura || "",
                    idpuesto: convocatoria?.idpuesto || "",
                    idequipo: convocatoria?.idequipo || "",
                    iniciolaboral: new Date().toISOString().slice(0, 10),
                    estado: true,
                    numerohijos: "",
                    isCF: aspirante.nit?.toUpperCase() === "C/F",
                    cvFile: null,
                });

                setShowForm(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                showToast(`Datos del aspirante ${aspirante.nombreaspirante} listos para registro.`, "success");
            } catch (error) {
                console.error("Error al cargar datos del aspirante:", error);
            }
        };

        cargarDesdeAspirante();
    }, []);

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/empleados/`);
            const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];

            // Obtener todos los documentos (contratos)
            const docRes = await axios.get(`${API}/documentos/`);
            const documentos = Array.isArray(docRes.data) ? docRes.data : docRes.data?.results || [];

            // Asociar contrato a cada empleado
            const empleadosConContrato = rows.map(emp => {
                const contrato = documentos.find(doc => doc.idempleado == (emp.id || emp.idempleado || emp.idEmpleado) && doc.idtipodocumento == 2 && doc.estado !== false);
                return { ...emp, contrato: contrato ? contrato : null };
            });
            setData(empleadosConContrato);
        } catch (e) {
            console.error("Error al cargar colaboradores:", e);
            showToast("Error al cargar los colaboradores", "error");
            setData([]);
        }
    };
    const fetchIdiomas = async () => {
        try {
            const r = await axios.get(`${API}/idiomas/`);
            setIdiomas(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setIdiomas([]);
        }
    };
    const fetchPueblos = async () => {
        try {
            const r = await axios.get(`${API}/pueblocultura/`);
            setPueblos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setPueblos([]);
        }
    };
    const fetchEquipos = async () => {
        try {
            const r = await axios.get(`${API}/equipos/`);
            setEquipos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setEquipos([]);
        }
    };
    const fetchPuestos = async () => {
        try {
            const r = await axios.get(`${API}/puestos/`);
            setPuestos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setPuestos([]);
        }
    };

    // Validaciones específicas (solo devuelven mensajes concretos; no genéricos)
    const emailRegex = /^\S+@\S+\.\S+$/;
    const validateField = (name, value) => {
        let msg = "";
        if (name === "genero") {
            const allowed = ["Masculino", "Femenino", "Otros"];
            if (!allowed.includes(String(value))) msg = ""; // el Form mostrará "Este campo es obligatorio"
        }
        if (name === "nombre" || name === "apellido") {
            // permitir letras (incluye acentos), espacios, guiones y apóstrofes
            if (value && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(String(value))) msg = "Solo letras y espacios";
        }
        if (["dpi", "numeroiggs"].includes(name)) {
            if (!/^\d*$/.test(String(value))) msg = ""; // bloqueo numérico ya lo hace onChange
            else if (String(value).length !== 13) msg = "Debe tener 13 dígitos";
        }
        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (!/^\d{8}$/.test(String(value))) msg = "Debe tener 8 dígitos";
        }
        if (name === "nit" && !form.isCF) {
            const v = String(value).trim().toUpperCase().replace(/\s+/g, "");
            // Validar formato: 7-8 dígitos, opcionalmente terminado en K
            if (!/^(\d{7,8}|\d{7}K)$/.test(v)) msg = "Formato inválido";
        }
        if (name === "email" && value && !emailRegex.test(String(value))) msg = "Correo inválido";
        if (name === "numerohijos") {
            const n = Number(value);
            if (value !== "" && (!Number.isFinite(n) || n < 0)) msg = "Valor inválido";
        }
        if (name === "estadocivil") {
            const allowed = ["Soltero", "Casado", "Divorciado", "Viudo", "Union de hecho"];
            if (value && !allowed.includes(String(value))) msg = "";
        }
        return msg;
    };

    const onChange = e => {
        const { name, value: raw, type, checked } = e.target;
        const val = type === "checkbox" ? checked : raw;

        // Bloquear números en nombre/apellido
        if ((name === "nombre" || name === "apellido") && raw && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]*$/.test(raw)) return;

        if (["dpi", "numeroiggs"].includes(name)) {
            if (!/^\d*$/.test(val)) return;
            if (String(val).length > 13) return;
        }
        if (name === "nit") {
            // Permitir dígitos y la letra K (solo una K al final como dígito verificador)
            const cleanValue = String(raw).toUpperCase();
            if (!/^[\dK]*$/.test(cleanValue)) return;
            if (cleanValue.length > 8) return;
            // Si hay una K, debe ser solo una y al final
            const kCount = (cleanValue.match(/K/g) || []).length;
            if (kCount > 1) return;
            if (kCount === 1 && !cleanValue.endsWith('K')) return;

            // Actualizar el valor con la K en mayúscula si aplica
            setForm(f => ({ ...f, [name]: cleanValue }));
            const msg = validateField(name, cleanValue);
            setErrors(er => ({ ...er, [name]: msg || false }));
            return;
        }
        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (!/^\d*$/.test(String(raw))) return;
            if (String(raw).length > 8) return;
        }
        if (name === "numerohijos") {
            if (!/^\d*$/.test(String(raw))) return;
        }
        if (name === "isCF") {
            const flag = !!checked;
            setForm(f => ({ ...f, isCF: flag, nit: flag ? "" : f.nit }));
            setErrors(er => ({ ...er, nit: false }));
            return;
        }

        // Chequeo de DPI duplicado en tiempo real cuando alcanza 13 dígitos
        if (name === "dpi") {
            const s = String(raw || "");
            if (s.length === 13) {
                const found = data.find(r => String(r.dpi || "") === s);
                if (found) {
                    const idOf = empId(found);
                    if (!editingId || String(editingId) !== String(idOf)) {
                        // Verificar si el empleado encontrado está activo o inactivo
                        if (found.estado === false) {
                            setErrors(er => ({ ...er, dpi: "Ya existe un colaborador inactivo con este DPI" }));
                            showToast("Ya existe un colaborador inactivo con este DPI. Puede reactivarlo desde la lista de colaboradores inactivos.", "warning");
                        } else {
                            setErrors(er => ({ ...er, dpi: "DPI ya registrado" }));
                            showToast("El DPI ya existe en un colaborador activo.", "warning");
                        }
                    } else {
                        setErrors(er => ({ ...er, dpi: false }));
                    }
                } else {
                    setErrors(er => ({ ...er, dpi: false }));
                }
            } else {
                // limpiar mensaje si aún no completa
                setErrors(er => ({ ...er, dpi: false }));
            }
        }

        // Chequeo de NIT duplicado en tiempo real cuando alcanza longitud válida
        if (name === "nit" && !form.isCF) {
            const s = String(raw || "").toUpperCase();
            // Validar cuando tenga 7-8 caracteres (incluyendo K al final)
            if (s.length >= 7 && (s.length === 8 || (s.length === 8 && s.endsWith('K')))) {
                const found = data.find(r => {
                    const nitR = String(r.nit || "").trim().toUpperCase().replace(/\s+/g, "");
                    return nitR === s && nitR !== "C/F";
                });
                if (found) {
                    const idOf = empId(found);
                    if (!editingId || String(editingId) !== String(idOf)) {
                        setErrors(er => ({ ...er, nit: "NIT ya registrado" }));
                        showToast("El NIT ya existe.", "warning");
                    } else {
                        setErrors(er => ({ ...er, nit: false }));
                    }
                } else {
                    setErrors(er => ({ ...er, nit: false }));
                }
            } else {
                setErrors(er => ({ ...er, nit: false }));
            }
        }

        // Chequeo de IGSS duplicado en tiempo real cuando alcanza 13 dígitos
        if (name === "numeroiggs") {
            const s = String(raw || "");
            if (s.length === 13) {
                const found = data.find(r => String(r.numeroiggs || "") === s);
                if (found) {
                    const idOf = empId(found);
                    if (!editingId || String(editingId) !== String(idOf)) {
                        setErrors(er => ({ ...er, numeroiggs: "IGSS ya registrado" }));
                        showToast("El número de IGSS ya existe.", "warning");
                    } else {
                        setErrors(er => ({ ...er, numeroiggs: false }));
                    }
                } else {
                    setErrors(er => ({ ...er, numeroiggs: false }));
                }
            } else {
                setErrors(er => ({ ...er, numeroiggs: false }));
            }
        }

        setForm(f => ({ ...f, [name]: val }));
        const msg = validateField(name, val);
        setErrors(er => ({ ...er, [name]: msg || false }));
    };

    // Función para manejar la carga del CV
    // Función para cargar CV existente del empleado
    const cargarCvExistente = async (empleadoId) => {
        try {
            const response = await axios.get(`${API}/documentos/`);
            const documentos = Array.isArray(response.data) ? response.data : response.data?.results || [];

            const cvDocumento = documentos.find(doc => {
                return doc.idempleado && doc.idempleado == empleadoId && doc.idtipodocumento == 1;
            });

            if (cvDocumento) {
                setCvExistente(cvDocumento);
            } else {
                setCvExistente(null);
            }
        } catch (error) {
            console.error("Error al cargar CV existente:", error);
            setCvExistente(null);
        }
    };

    // Función para eliminar CV existente
    const eliminarCvExistente = async () => {
        if (!cvExistente) return;

        try {
            // Usar PUT para desactivar en lugar de DELETE
            await axios.put(`${API}/documentos/${cvExistente.iddocumento}/`, {
                nombrearchivo: cvExistente.nombrearchivo,
                mimearchivo: cvExistente.mimearchivo,
                fechasubida: cvExistente.fechasubida,
                idusuario: cvExistente.idusuario,
                idtipodocumento: cvExistente.idtipodocumento,
                idempleado: cvExistente.idempleado,
                estado: false
            });
            setCvExistente(null);
            showToast("CV eliminado correctamente", "success");
        } catch (error) {
            console.error("Error al eliminar CV:", error);
            showToast("Error al eliminar el CV", "error");
        }
    };

    // Función para cargar contrato existente del empleado
    const cargarContratoExistente = async (empleadoId) => {
        try {
            const response = await axios.get(`${API}/documentos/`);
            const documentos = Array.isArray(response.data) ? response.data : response.data?.results || [];

            const contratoDocumento = documentos.find(doc => {
                return doc.idempleado && doc.idempleado == empleadoId && doc.idtipodocumento == 2; // Asumimos tipo 2 para contratos
            });

            if (contratoDocumento) {
                setContratoExistente(contratoDocumento);
            } else {
                setContratoExistente(null);
            }
        } catch (error) {
            console.error("Error al cargar contrato existente:", error);
            setContratoExistente(null);
        }
    };

    // Función para eliminar contrato existente
    const eliminarContratoExistente = async () => {
        if (!contratoExistente) return;

        try {
            // Usar PUT para desactivar en lugar de DELETE
            await axios.put(`${API}/documentos/${contratoExistente.iddocumento}/`, {
                nombrearchivo: contratoExistente.nombrearchivo,
                mimearchivo: contratoExistente.mimearchivo,
                fechasubida: contratoExistente.fechasubida,
                idusuario: contratoExistente.idusuario,
                idtipodocumento: contratoExistente.idtipodocumento,
                idempleado: contratoExistente.idempleado,
                estado: false
            });
            setContratoExistente(null);
            showToast("Contrato eliminado correctamente", "success");
        } catch (error) {
            console.error("Error al eliminar contrato:", error);
            showToast("Error al eliminar el contrato", "error");
        }
    };

    // Función para abrir el modal de subir contrato
    const abrirModalContrato = (empleado) => {
        setEmpleadoParaContrato(empleado);
        setContratoFile(null);
        cargarContratoExistente(empId(empleado));
        setMostrarModalContrato(true);
    };

    // Función para cerrar el modal de contrato
    const cerrarModalContrato = () => {
        setMostrarModalContrato(false);
        setEmpleadoParaContrato(null);
        setContratoFile(null);
        setContratoExistente(null);
    };

    // Función para subir el contrato desde el modal
    const subirContrato = async () => {
        if (!contratoFile || !empleadoParaContrato) {
            showToast("Por favor selecciona un archivo PDF", "warning");
            return;
        }

        try {
            const empleadoId = empId(empleadoParaContrato);
            console.log("Subiendo contrato para empleado:", empleadoId);

            const formDataContrato = new FormData();
            formDataContrato.append('archivo', contratoFile);
            formDataContrato.append('nombrearchivo', `CONTRATO_${empleadoParaContrato.dpi}_${empleadoId}`);
            formDataContrato.append('mimearchivo', contratoFile.name.split('.').pop());
            formDataContrato.append('fechasubida', new Date().toISOString().split('T')[0]);
            formDataContrato.append('estado', 'true');
            formDataContrato.append('idusuario', getIdUsuario().toString());
            formDataContrato.append('idtipodocumento', '2'); // Tipo 2 para contratos
            formDataContrato.append('idempleado', empleadoId.toString());

            if (contratoExistente) {
                // Actualizar contrato existente
                await axios.put(`${API}/documentos/${contratoExistente.iddocumento}/`, formDataContrato, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showToast("Contrato actualizado correctamente", "success");
            } else {
                // Crear nuevo contrato
                await axios.post(`${API}/documentos/`, formDataContrato, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                showToast("Contrato subido correctamente", "success");
            }

            cerrarModalContrato();

        } catch (error) {
            console.error("Error al subir contrato:", error);
            showToast("Error al subir el contrato", "error");
        }
    };

    const handleCvUpload = (e) => {
        const file = e.target.files[0];
        console.log("Archivo seleccionado para CV:", file);

        if (file) {
            console.log("Validando archivo CV:", {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                console.log("Error: Archivo no es PDF");
                showToast("Solo se permiten archivos PDF para el CV", "error");
                e.target.value = '';
                return;
            }
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                console.log("Error: Archivo muy grande:", file.size);
                showToast("El CV no puede ser mayor a 5MB", "error");
                e.target.value = '';
                return;
            }

            console.log("Archivo CV válido, guardando en el form");
            setForm(f => ({ ...f, cvFile: file }));
            setErrors(er => ({ ...er, cvFile: false }));
        } else {
            console.log("No se seleccionó ningún archivo");
        }
    };

    // Función para manejar la carga del contrato
    const handleContratoUpload = (e) => {
        const file = e.target.files[0];
        console.log("Archivo seleccionado para Contrato:", file);

        if (file) {
            console.log("Validando archivo Contrato:", {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                console.log("Error: Archivo no es PDF");
                showToast("Solo se permiten archivos PDF para el contrato", "error");
                e.target.value = '';
                return;
            }
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                console.log("Error: Archivo muy grande:", file.size);
                showToast("El contrato no puede ser mayor a 5MB", "error");
                e.target.value = '';
                return;
            }

            console.log("Archivo contrato válido, guardando");
            setContratoFile(file);
        } else {
            console.log("No se seleccionó ningún archivo");
        }
    };

    // ===== Helpers validación global (solo marca vacíos con true) =====
    const STEP1_FIELDS = [
        "nombre",
        "apellido",
        "genero",
        "lugarnacimiento",
        "fechanacimiento",
        "estadocivil",
        "dpi",
        "nit"
        // numeroiggs removido - no es obligatorio
    ];
    const STEP2_FIELDS = [
        // telefonoresidencial removido - no es obligatorio
        "telefonocelular",
        "telefonoemergencia",
        "email",
        "direccion",
        "ididioma",
        "idpueblocultura",
        "idpuesto"
    ];
    const STEP3_FIELDS = ["numerohijos", "titulonivelmedio", "estudiosuniversitarios", "iniciolaboral", "cvFile"];

    const validateAll = () => {
        const required = [...STEP1_FIELDS, ...STEP2_FIELDS, ...STEP3_FIELDS];

        const newErrors = {};
        // Vacíos -> true (el Form mostrará "Este campo es obligatorio")
        for (const k of required) {
            if (form[k] === "" || form[k] == null) newErrors[k] = true;
        }
        if (form.isCF) delete newErrors.nit;

        // Mensajes específicos cuando aplica
        const put = (k, m) => {
            if (m) newErrors[k] = m;
        };

        if (form.dpi && String(form.dpi).length !== 13) put("dpi", "Debe tener 13 dígitos");
        if (form.numeroiggs && String(form.numeroiggs).length !== 13) put("numeroiggs", "Debe tener 13 dígitos");
        if (!form.isCF && form.nit && !/^(\d{7,8}|\d{7}K)$/.test(String(form.nit).trim().toUpperCase())) put("nit", "Formato inválido (7-8 dígitos o 7 dígitos + K)");

        // DPI único (si se ingresa)
        if (form.dpi) {
            const same = data.find(r => String(r.dpi || "") === String(form.dpi || ""));
            if (same) {
                const idOf = empId(same);
                if (!editingId || String(editingId) !== String(idOf)) put("dpi", "DPI ya registrado");
            }
        }

        // NIT único (si se ingresa y no es C/F)
        if (form.nit && !form.isCF) {
            const nitForm = String(form.nit).trim().toUpperCase().replace(/\s+/g, "");
            const same = data.find(r => {
                const nitR = String(r.nit || "").trim().toUpperCase().replace(/\s+/g, "");
                return nitR === nitForm && nitR !== "C/F";
            });
            if (same) {
                const idOf = empId(same);
                if (!editingId || String(editingId) !== String(idOf)) put("nit", "NIT ya registrado");
            }
        }

        // IGSS único (si se ingresa)
        if (form.numeroiggs) {
            const same = data.find(r => String(r.numeroiggs || "") === String(form.numeroiggs || ""));
            if (same) {
                const idOf = empId(same);
                if (!editingId || String(editingId) !== String(idOf)) put("numeroiggs", "IGSS ya registrado");
            }
        }

        if (form.telefonoresidencial && !/^\d{8}$/.test(String(form.telefonoresidencial)))
            put("telefonoresidencial", "Debe tener 8 dígitos");
        if (form.telefonocelular && !/^\d{8}$/.test(String(form.telefonocelular)))
            put("telefonocelular", "Debe tener 8 dígitos");
        if (form.telefonoemergencia && !/^\d{8}$/.test(String(form.telefonoemergencia)))
            put("telefonoemergencia", "Debe tener 8 dígitos");

        if (form.email && !emailRegex.test(String(form.email))) put("email", "Correo inválido");
        const estados = ["Soltero", "Casado", "Divorciado", "Viudo", "Union de hecho"];
        if (form.estadocivil && !estados.includes(String(form.estadocivil))) newErrors.estadocivil = true;
        const generos = ["Masculino", "Femenino", "Otros"];
        if (form.genero && !generos.includes(String(form.genero))) newErrors.genero = true;

        // Validación del CV (obligatorio para empleados nuevos)
        console.log("Validando CV:", {
            editingId: editingId,
            cvFile: form.cvFile,
            isRequired: !editingId
        });

        if (!editingId && !form.cvFile) {
            console.log("Error: CV es obligatorio para empleados nuevos");
            newErrors.cvFile = true;
        } else {
            console.log("CV válido o no requerido");
        }

        setErrors(newErrors);

        // detecta paso a retornar
        let badStep = null;
        const keys = Object.keys(newErrors);
        if (keys.length) {
            if (keys.some(k => STEP1_FIELDS.includes(k))) badStep = 1;
            else if (keys.some(k => STEP2_FIELDS.includes(k))) badStep = 2;
            else badStep = 3;
        }
        return { ok: keys.length === 0, badStep };
    };

    const toApi = f => {
        let nit = String(f.nit || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");
        if (f.isCF) nit = "C/F";
        if (nit === "CF") nit = "C/F";
        const startISO = f.iniciolaboral ? `${f.iniciolaboral}T00:00:00` : null;
        return {
            dpi: f.dpi,
            nit,
            nombre: f.nombre,
            apellido: f.apellido,
            genero: f.genero,
            lugarnacimiento: f.lugarnacimiento,
            fechanacimiento: f.fechanacimiento,
            telefonoresidencial: f.telefonoresidencial,
            telefonocelular: f.telefonocelular,
            telefonoemergencia: f.telefonoemergencia,
            titulonivelmedio: f.titulonivelmedio,
            estudiosuniversitarios: f.estudiosuniversitarios,
            email: f.email,
            direccion: f.direccion,
            estadocivil: f.estadocivil,
            numerohijos: Number(f.numerohijos || 0),
            estado: true,
            idusuario: getIdUsuario(),
            ididioma: Number(f.ididioma),
            idpueblocultura: Number(f.idpueblocultura),
            idpuesto: Number(f.idpuesto) || null,
            idequipo: Number(f.idequipo) || null,
            numeroiggs: f.numeroiggs,
            inicioLaboral: startISO
        };
    };

    const resetForm = () => {
        const equipoParam = new URLSearchParams(window.location.search).get("equipo");
        setForm({
            dpi: "",
            nit: "",
            nombre: "",
            apellido: "",
            genero: "",
            lugarnacimiento: "",
            fechanacimiento: "",
            telefonoresidencial: "",
            telefonocelular: "",
            telefonoemergencia: "",
            titulonivelmedio: "",
            estudiosuniversitarios: "",
            email: "",
            direccion: "",
            estadocivil: "",
            numerohijos: "",
            estado: true,
            ididioma: "",
            idpueblocultura: "",
            idpuesto: "",
            idequipo: equipoParam ? Number(equipoParam) : "",
            numeroiggs: "",
            isCF: false,
            iniciolaboral: "",
            cvFile: null
        });
        setErrors({});
        setEditingId(null);
        setCvExistente(null);
    };

    const handleGeneratePDF = async seleccion => {
        try {
            setGenerandoPDF(true);
            showPDFToasts.generando();

            const catalogos = { idiomas, pueblos, equipos, puestos };
            await generarFichasPDF(seleccion, catalogos, logo);

            // Primero cerramos el modal y limpiamos el estado
            setShowDownload(false);
            setGenerandoPDF(false);

            // Mostrar toast de éxito con transición suave
            showPDFToasts.descargado();

        } catch (e) {
            console.error(e);
            setGenerandoPDF(false);
            showPDFToasts.error();
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const { ok, badStep } = validateAll();
        if (!ok) {
            if (badStep) window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: badStep }));
            showToast("Corrige los campos pendientes.", "warning");
            return;
        }
        try {
            const payload = toApi(form);
            const isEditing = !!editingId;

            // Validar unicidad de DPI (cliente)
            if (form.dpi) {
                const found = data.find(r => String(r.dpi || "") === String(form.dpi || ""));
                if (found) {
                    const idOf = empId(found);
                    if (!isEditing || String(editingId) !== String(idOf)) {
                        // Verificar si el empleado encontrado está activo o inactivo
                        if (found.estado === false) {
                            setErrors(p => ({ ...p, dpi: "Ya existe un colaborador inactivo con este DPI" }));
                            window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 1 }));
                            showToast("Ya existe un colaborador inactivo con este DPI. Puede reactivarlo desde la lista de colaboradores inactivos.", "warning");
                        } else {
                            setErrors(p => ({ ...p, dpi: "DPI ya registrado" }));
                            window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 1 }));
                            showToast("El DPI ya existe en un colaborador activo.", "warning");
                        }
                        return;
                    }
                }
            }

            // Validar unicidad de NIT (cliente)
            if (form.nit && !form.isCF) {
                const nitForm = String(form.nit).trim().toUpperCase().replace(/\s+/g, "");
                const found = data.find(r => {
                    const nitR = String(r.nit || "").trim().toUpperCase().replace(/\s+/g, "");
                    return nitR === nitForm && nitR !== "C/F";
                });
                if (found) {
                    const idOf = empId(found);
                    if (!isEditing || String(editingId) !== String(idOf)) {
                        setErrors(p => ({ ...p, nit: "NIT ya registrado" }));
                        window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 1 }));
                        showToast("El NIT ya existe.", "warning");
                        return;
                    }
                }
            }

            // Validar unicidad de IGSS (cliente)
            if (form.numeroiggs) {
                const found = data.find(r => String(r.numeroiggs || "") === String(form.numeroiggs || ""));
                if (found) {
                    const idOf = empId(found);
                    if (!isEditing || String(editingId) !== String(idOf)) {
                        setErrors(p => ({ ...p, numeroiggs: "IGSS ya registrado" }));
                        window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 1 }));
                        showToast("El número de IGSS ya existe.", "warning");
                        return;
                    }
                }
            }
            // Validar unicidad de email en creación
            if (!isEditing) {
                const exists = data.some(
                    r =>
                        String(r.email || "")
                            .toLowerCase()
                            .trim() ===
                        String(payload.email || "")
                            .toLowerCase()
                            .trim()
                );
                if (exists) {
                    setErrors(p => ({ ...p, email: true })); // el Form mostrará "Este campo es obligatorio"
                    window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 2 }));
                    showToast("El correo ya existe.", "warning");
                    return;
                }
            }

            if (isEditing) {
                // Obtener datos actuales del empleado para comparar puesto
                const empleadoActual = data.find(emp => empId(emp) === editingId);
                const puestoAnterior = Number(empleadoActual?.idpuesto || empleadoActual?.idPuesto || 0);
                const puestoNuevo = Number(form.idpuesto || 0);

                // Actualizar empleado
                await axios.put(`${API}/empleados/${editingId}/`, payload);

                // Si cambió el puesto y hay un puesto nuevo válido, manejar historial
                if (puestoNuevo > 0 && puestoAnterior !== puestoNuevo) {
                    console.log(`Cambio de puesto detectado: ${puestoAnterior} -> ${puestoNuevo}`);

                    // Solo finalizar historial anterior si había un puesto anterior
                    if (puestoAnterior > 0) {
                        await finalizarHistorialAnterior(editingId);
                    }

                    // Crear nuevo registro en historial con la fecha actual
                    const fechaInicio = new Date().toISOString().slice(0, 10);
                    await crearHistorialPuesto(editingId, puestoNuevo, fechaInicio);

                    // 🔹 Actualizar rol del usuario asociado según el mapaPuestoRol
                    try {
                        const usuariosResponse = await axios.get(`${API}/usuarios/`);
                        const usuario = usuariosResponse.data.results.find(u => u.idempleado === editingId);

                        if (usuario) {
                            const nuevoRol = mapaPuestoRol[puestoNuevo];
                            if (usuario.idrol !== nuevoRol) {
                                await axios.put(`${API}/usuarios/${usuario.idusuario}/`, {
                                    nombreusuario: usuario.nombreusuario,
                                    contrasena: usuario.contrasena,
                                    estado: usuario.estado,
                                    createdat: usuario.createdat,
                                    updatedat: new Date().toISOString(),
                                    idrol: nuevoRol,
                                    idempleado: usuario.idempleado
                                });
                                showToast("Rol del usuario actualizado correctamente", "success");
                            }
                        }
                    } catch (error) {
                        console.error("Error al actualizar el rol del usuario:", error);
                        showToast("Error al actualizar el rol del usuario", "error");
                    }
                }

                // Subir CV si se proporcionó (para actualizaciones)
                if (form.cvFile) {
                    try {
                        console.log("Actualizando CV para empleado:", editingId);

                        // Verificar si ya existe un CV para este empleado
                        if (cvExistente) {
                            console.log("Actualizando CV existente:", cvExistente.iddocumento);

                            const formDataCV = new FormData();
                            formDataCV.append('archivo', form.cvFile);
                            formDataCV.append('nombrearchivo', `CV_${form.dpi}_${editingId}`);
                            formDataCV.append('mimearchivo', form.cvFile.name.split('.').pop());
                            formDataCV.append('fechasubida', new Date().toISOString().split('T')[0]);
                            formDataCV.append('estado', 'true');
                            formDataCV.append('idusuario', getIdUsuario().toString());
                            formDataCV.append('idtipodocumento', '1');
                            formDataCV.append('idempleado', editingId.toString());

                            // Actualizar el documento existente (PUT)
                            const cvResponse = await axios.put(`${API}/documentos/${cvExistente.iddocumento}/`, formDataCV, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
                            console.log("CV actualizado exitosamente:", cvResponse.data);
                            showToast("CV actualizado correctamente", "success");
                        } else {
                            console.log("Creando nuevo CV para empleado");

                            const formDataCV = new FormData();
                            formDataCV.append('archivo', form.cvFile);
                            formDataCV.append('nombrearchivo', `CV_${form.dpi}_${editingId}`);
                            formDataCV.append('mimearchivo', form.cvFile.name.split('.').pop());
                            formDataCV.append('fechasubida', new Date().toISOString().split('T')[0]);
                            formDataCV.append('estado', 'true');
                            formDataCV.append('idusuario', getIdUsuario().toString());
                            formDataCV.append('idtipodocumento', '1');
                            formDataCV.append('idempleado', editingId.toString());

                            // Crear nuevo documento (POST)
                            const cvResponse = await axios.post(`${API}/documentos/`, formDataCV, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
                            console.log("CV creado exitosamente:", cvResponse.data);
                            showToast("CV subido correctamente", "success");
                        }
                    } catch (cvError) {
                        console.error("Error al actualizar CV:", cvError);
                        console.error("Respuesta del servidor:", cvError.response?.data);
                        console.error("Status del error:", cvError.response?.status);
                        console.error("Headers de respuesta:", cvError.response?.headers);
                        showToast("Colaborador actualizado, pero hubo un error al subir el nuevo CV", "warning");
                    }
                }

                showToast("Colaborador actualizado correctamente");
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            else {
                const response = await axios.post(`${API}/empleados/`, payload);
                const empleadoCreado = response.data;

                // Obtener el ID del empleado recién creado
                const empleadoId = empleadoCreado.id || empleadoCreado.idempleado || empleadoCreado.idEmpleado;

                // Crear historial inicial si se asignó un puesto
                if (form.idpuesto && Number(form.idpuesto) > 0) {
                    const fechaInicio = form.iniciolaboral || new Date().toISOString().slice(0, 10);
                    await crearHistorialPuesto(empleadoId, Number(form.idpuesto), fechaInicio);
                }

                // Subir CV si se proporcionó
                if (form.cvFile) {
                    try {
                        console.log("Iniciando subida de CV para empleado:", empleadoId);
                        const formDataCV = new FormData();
                        formDataCV.append('archivo', form.cvFile);
                        formDataCV.append('nombrearchivo', `CV_${form.dpi}_${empleadoId}`);
                        formDataCV.append('mimearchivo', form.cvFile.name.split('.').pop());
                        formDataCV.append('fechasubida', new Date().toISOString().split('T')[0]);
                        formDataCV.append('estado', 'true');
                        formDataCV.append('idusuario', getIdUsuario().toString());
                        formDataCV.append('idtipodocumento', '1'); // Asumimos tipo 1 para CV
                        formDataCV.append('idempleado', empleadoId.toString());

                        // Log para ver qué estamos enviando
                        console.log("Datos que se envían al servidor:");
                        for (let [key, value] of formDataCV.entries()) {
                            console.log(`${key}:`, value);
                        }

                        const cvResponse = await axios.post(`${API}/documentos/`, formDataCV, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });
                        console.log("CV subido exitosamente:", cvResponse.data);
                        showToast("CV subido correctamente", "success");
                    } catch (cvError) {
                        console.error("Error al subir CV:", cvError);
                        console.error("Respuesta del servidor:", cvError.response?.data);
                        console.error("Status del error:", cvError.response?.status);
                        console.error("Headers de respuesta:", cvError.response?.headers);
                        showToast("Colaborador creado, pero hubo un error al subir el CV", "warning");
                    }
                }

                showToast("Colaborador registrado correctamente");

                // Crear usuario automáticamente solo si es un nuevo empleado
                try {
                    const datosUsuario = await crearUsuarioAutomatico(empleadoId, form.nombre, form.apellido, form.idpuesto);
                    setDatosUsuarioCreado(datosUsuario);
                    setMostrarUsuarioCreado(true);
                } catch (userError) {
                    console.error("Error al crear usuario automático:", userError);
                    showToast("Colaborador creado, pero hubo un error al generar el usuario automáticamente", "warning");
                }

                // ========================================================
                // 🔹 ACTUALIZAR ESTADOS DE CONVOCATORIA, POSTULACIONES Y EVALUACIONES
                // ========================================================
                try {
                    const aspiranteParam = new URLSearchParams(window.location.search).get("aspirante");
                    const convocatoriaParam = new URLSearchParams(window.location.search).get("convocatoria");

                    if (aspiranteParam && convocatoriaParam) {
                        // 1️⃣ Obtener la convocatoria actual
                        const convRes = await axios.get(`${API}/convocatorias/${convocatoriaParam}/`);
                        const convocatoriaActual = convRes.data;

                        // 2️⃣ Actualizar convocatoria a FINALIZADA (idestado_id = 6)
                        const payloadConv = {
                            fechainicio: convocatoriaActual.fechainicio,
                            fechafin: new Date().toISOString().slice(0, 10),
                            idestado_id: 6, // Finalizada
                            nombreconvocatoria: convocatoriaActual.nombreconvocatoria,
                            descripcion: convocatoriaActual.descripcion,
                            estado: false,
                            idusuario: getIdUsuario(),
                            idpuesto: convocatoriaActual.idpuesto,
                        };

                        await axios.put(`${API}/convocatorias/${convocatoriaParam}/`, payloadConv);
                        console.log("✅ Convocatoria finalizada correctamente");

                        // 3️⃣ Obtener todas las postulaciones de esa convocatoria
                        const postRes = await axios.get(`${API}/postulaciones/`);
                        const todasPostulaciones = Array.isArray(postRes.data)
                            ? postRes.data
                            : postRes.data?.results || [];

                        const postulacionesDeConv = todasPostulaciones.filter(
                            (p) => String(p.idconvocatoria) === String(convocatoriaParam)
                        );

                        // 4️⃣ Actualizar estados de postulaciones
                        for (const post of postulacionesDeConv) {
                            const payloadPost = {
                                fechapostulacion: post.fechapostulacion || new Date().toISOString().slice(0, 10),
                                observacion: post.observacion || "",
                                idusuario: getIdUsuario(),
                                idaspirante: post.idaspirante,
                                idconvocatoria: post.idconvocatoria,
                                estado: true,
                                idestado:
                                    String(post.idaspirante) === String(aspiranteParam)
                                        ? 7 // ✅ Contratado
                                        : 3, // ❌ Rechazado
                            };

                            await axios.put(`${API}/postulaciones/${post.idpostulacion}/`, payloadPost);
                            console.log(
                                `Postulación ${post.idpostulacion} actualizada a ${payloadPost.idestado === 7 ? "✅ Contratado" : "❌ Rechazado"
                                }`
                            );
                        }

                        // ========================================================
                        // 🔹 DESACTIVAR TODAS LAS EVALUACIONES ASOCIADAS A LA CONVOCATORIA
                        // ========================================================
                        try {
                            const evalRes = await axios.get(`${API}/evaluacion/`);
                            const todasEvaluaciones = Array.isArray(evalRes.data)
                                ? evalRes.data
                                : evalRes.data?.results || [];

                            // Filtrar las evaluaciones vinculadas a las postulaciones de esta convocatoria
                            const evaluacionesDeConv = todasEvaluaciones.filter((e) =>
                                postulacionesDeConv.some((p) => String(p.idpostulacion) === String(e.idpostulacion))
                            );

                            for (const ev of evaluacionesDeConv) {
                                const payloadEval = {
                                    modalidad: ev.modalidad || "Presencial",
                                    fechaevaluacion: ev.fechaevaluacion
                                        ? new Date(ev.fechaevaluacion).toISOString()
                                        : new Date().toISOString(),
                                    puntajetotal: Number(ev.puntajetotal) || 0,
                                    observacion: ev.observacion || "Evaluación desactivada al finalizar convocatoria.",
                                    estado: false, // 🔴 Desactivamos
                                    idusuario: ev.idusuario || getIdUsuario(),
                                    idempleado: ev.idempleado || null,
                                    idpostulacion: ev.idpostulacion || 0,
                                };

                                await axios.put(`${API}/evaluacion/${ev.idevaluacion}/`, payloadEval);
                                console.log(`🟡 Evaluación ${ev.idevaluacion} marcada como inactiva`);
                            }

                            if (evaluacionesDeConv.length > 0)
                                console.log(`🟢 ${evaluacionesDeConv.length} evaluaciones desactivadas correctamente.`);
                        } catch (errEval) {
                            console.error("Error al desactivar evaluaciones:", errEval);
                            showToast("Advertencia: la convocatoria se cerró, pero no se pudieron desactivar las evaluaciones.", "warning");
                        }

                        showToast("Convocatoria, postulaciones y evaluaciones actualizadas correctamente.", "success");
                    }
                } catch (error) {
                    console.error("Error al actualizar estados de convocatoria/postulaciones:", error);
                    showToast("Empleado creado, pero hubo un error al actualizar los estados.", "warning");
                }
            }

            resetForm();
            fetchList();
            setPage(1);
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error al guardar:", err.response?.data || err);
            showToast("Error al registrar/actualizar el colaborador", "error");
        }
    };

    const handleEdit = row => {
        if (row?.estado === false) {
            showToast("No se puede editar un colaborador inactivo", "warning");
            return;
        }
        const empleadoId = empId(row);

        setForm({
            dpi: row.dpi ?? "",
            nit: row.nit ?? "",
            nombre: row.nombre ?? "",
            apellido: row.apellido ?? "",
            genero: row.genero ?? "",
            lugarnacimiento: row.lugarnacimiento ?? "",
            fechanacimiento: row.fechanacimiento ?? "",
            telefonoresidencial: row.telefonoresidencial ?? row.telefonoResidencial ?? "",
            telefonocelular: row.telefonocelular ?? row.telefonoCelular ?? "",
            telefonoemergencia: row.telefonoemergencia ?? row.telefonoEmergencia ?? "",
            titulonivelmedio: row.titulonivelmedio ?? row.tituloNivelMedio ?? "",
            estudiosuniversitarios: row.estudiosuniversitarios ?? row.estudiosUniversitarios ?? "",
            email: row.email ?? "",
            direccion: row.direccion ?? "",
            estadocivil: row.estadocivil ?? "",
            numerohijos: row.numerohijos ?? "",
            estado: true,
            ididioma: row.ididioma ?? row.idIdioma ?? "",
            idpueblocultura: row.idpueblocultura ?? row.idPueblocultura ?? "",
            idpuesto: row.idpuesto ?? row.idPuesto ?? "",
            idequipo: row.idequipo ?? row.idEquipo ?? "",
            numeroiggs: row.numeroiggs ?? "",
            isCF:
                String(row.nit || "")
                    .toUpperCase()
                    .replace(/\s+/g, "") === "C/F",
            iniciolaboral: (row.inicioLaboral || "").slice(0, 10),
            cvFile: null
        });
        setErrors({});
        setEditingId(empleadoId);

        // Cargar CV existente si está editando
        cargarCvExistente(empleadoId);

        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Confirmación activar/desactivar
    const handleToggle = row => {
        const id = empId(row);
        if (!id) return;
        setEmpleadoSeleccionado(row);
        setAccionEstado(row.estado ? "desactivar" : "activar");
        setShowConfirm(true);
    };

    const confirmarCambioEstado = async () => {
        if (!empleadoSeleccionado || !accionEstado) return;
        const id = empId(empleadoSeleccionado);
        const nuevoEstado = accionEstado === "activar";
        try {
            // 1. Actualizar el estado del empleado
            await axios.put(`${API}/empleados/${id}/`, {
                ...empleadoSeleccionado,
                estado: nuevoEstado,
                idusuario: getIdUsuario()
            });

            // 2. Buscar y actualizar el usuario correspondiente
            try {
                const usuariosResponse = await axios.get(`${API}/usuarios/`);
                const usuarios = Array.isArray(usuariosResponse.data) ?
                    usuariosResponse.data :
                    usuariosResponse.data?.results || [];

                const usuarioEncontrado = usuarios.find(u => u.idempleado === id);

                if (usuarioEncontrado) {
                    // Actualizar el estado del usuario para que coincida con el empleado
                    await axios.put(`${API}/usuarios/${usuarioEncontrado.idusuario}/`, {
                        nombreusuario: usuarioEncontrado.nombreusuario,
                        contrasena: usuarioEncontrado.contrasena,
                        estado: nuevoEstado, // Mismo estado que el empleado
                        createdat: usuarioEncontrado.createdat,
                        updatedat: new Date().toISOString(),
                        idrol: usuarioEncontrado.idrol,
                        idempleado: usuarioEncontrado.idempleado
                    });
                    console.log(`Usuario ${usuarioEncontrado.nombreusuario} ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
                }
            } catch (userError) {
                console.error("Error al actualizar usuario:", userError);
                showToast(`Colaborador ${nuevoEstado ? 'activado' : 'desactivado'}, pero hubo un error al actualizar el usuario`, "warning");
            }

            showToast(nuevoEstado ? "Colaborador y usuario activados correctamente" : "Colaborador y usuario desactivados correctamente");
            fetchList();
        } catch {
            showToast("Error al cambiar el estado", "error");
        } finally {
            setShowConfirm(false);
            setEmpleadoSeleccionado(null);
            setAccionEstado(null);
        }
    };

    // Manejar terminación laboral
    const handleTerminacionLaboral = (empleado) => {
        setEmpleadoParaTerminacion(empleado);
        setMostrarTerminacionLaboral(true);
    };

    const handleTerminacionSuccess = () => {
        setMostrarTerminacionLaboral(false);
        setEmpleadoParaTerminacion(null);
        fetchList(); // Refrescar la lista de empleados
        window.location.reload(); // Refrescar la vista de documentos
    };

    // BÚSQUEDA TOTAL (incluye casos "activo"/"inactivo")
    const labelFrom = (id, list, type) => {
        if (!id) return "";
        const found = list.find(x => String(getId(x)) === String(id));
        return getName(found, type) || `#${id}`;
    };
    const indexable = useMemo(
        () =>
            // Ordenar por ID descendente (último agregado primero)
            [...data].sort((a, b) => {
                const idA = empId(a) || 0;
                const idB = empId(b) || 0;
                return idB - idA; // Orden descendente
            }).map(r => {
                const idioma = labelFrom(r.ididioma, idiomas, "idioma");
                const pueblo = labelFrom(r.idpueblocultura, pueblos, "pueblo");
                const equipo = labelFrom(r.idequipo, equipos, "equipo");
                const join = [
                    r.nombre,
                    r.apellido,
                    `${r.nombre} ${r.apellido}`.trim(), // nombre completo
                    r.genero,
                    r.dpi,
                    r.nit,
                    r.numeroiggs,
                    r.lugarnacimiento,
                    r.fechanacimiento,
                    r.estadocivil,
                    r.numerohijos,
                    r.telefonoresidencial,
                    r.telefonocelular,
                    r.telefonoemergencia,
                    r.titulonivelmedio,
                    r.estudiosuniversitarios,
                    r.email,
                    r.direccion,
                    idioma,
                    pueblo,
                    equipo,
                    r.estado ? " activo " : " inactivo "
                ]
                    .filter(Boolean)
                    .join(" | ")
                    .toLowerCase();
                return { raw: r, haystack: join };
            }),
        [data, idiomas, pueblos, equipos]
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        // Filtrar primero por estado (activos/inactivos)
        let estadoFiltered;
        if (mostrarInactivos) {
            // Solo mostrar colaboradores inactivos
            estadoFiltered = indexable.filter(({ raw }) => !raw.estado);
        } else {
            // Solo mostrar colaboradores activos (comportamiento por defecto)
            estadoFiltered = indexable.filter(({ raw }) => !!raw.estado);
        }

        // Luego filtrar por texto de búsqueda
        if (!q) return estadoFiltered;
        if (q === "activo") return indexable.filter(({ raw }) => !!raw.estado);
        if (q === "inactivo") return indexable.filter(({ raw }) => !raw.estado);
        return estadoFiltered.filter(({ haystack }) => haystack.includes(q));
    }, [indexable, search, mostrarInactivos]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina).map(x => x.raw);

    const onVerDetalle = row => {
        const idioma = labelFrom(row.ididioma ?? row.idIdioma, idiomas, "idioma");
        const pueblo = labelFrom(row.idpueblocultura ?? row.idPueblocultura, pueblos, "pueblo");
        const equipo = labelFrom(row.idequipo ?? row.idEquipo, equipos, "equipo");
        const puesto = labelFrom(row.idpuesto ?? row.idPuesto, puestos, "puesto");
        setDetalle({ ...row, idioma, pueblo, equipo, puesto });
        setMostrarDetalle(true);
    };

    const equipoBloqueado = !!new URLSearchParams(window.location.search).get("equipo") || !!editingId;

    // Función para ver el contrato del empleado (abrir en nueva pestaña)
    const verContrato = async (empleado) => {
        try {
            // Buscar el documento contrato del empleado
            const response = await axios.get(`${API}/documentos/`);
            const documentos = Array.isArray(response.data) ? response.data : response.data?.results || [];

            // Buscar el contrato del empleado específico
            console.log("Buscando contrato para empleado:", empleado);
            console.log("Documentos disponibles:", documentos);

            const empleadoId = empleado.id || empleado.idempleado || empleado.idEmpleado;

            const contratoDocumento = documentos.find(doc => {
                // Priorizar búsqueda por idempleado y tipo de documento 2 (contrato)
                if (doc.idempleado && doc.idempleado == empleadoId && doc.idtipodocumento == 2) {
                    return true;
                }

                // Fallback: buscar por nombre de archivo que contenga CONTRATO y el DPI
                if ((doc.nombrearchivo && doc.nombrearchivo.includes(`CONTRATO_${empleado.dpi}`)) ||
                    (doc.nombredocumento && doc.nombredocumento.includes(`CONTRATO_${empleado.dpi}`))) {
                    return true;
                }

                return false;
            });

            if (!contratoDocumento) {
                showToast("No se encontró el contrato para este colaborador", "warning");
                return;
            }

            console.log("Contrato encontrado:", contratoDocumento);

            // Abrir el contrato en nueva pestaña
            if (contratoDocumento.archivo_url || contratoDocumento.archivo) {
                const fileUrl = contratoDocumento.archivo_url || contratoDocumento.archivo;
                console.log("Abriendo contrato desde URL:", fileUrl);

                window.open(fileUrl, '_blank');
                showToast("Contrato abierto en nueva pestaña", "success");
            } else {
                showToast("No se pudo obtener la URL del contrato", "error");
            }

        } catch (error) {
            console.error("Error al ver contrato:", error);
            if (error.response?.status === 404) {
                showToast("No se encontró el contrato para este colaborador", "warning");
            } else {
                showToast("Error al abrir el contrato", "error");
            }
        }
    };

    // Función para descargar el CV del empleado
    const descargarCV = async (empleado) => {
        try {
            // Buscar el documento CV del empleado
            const response = await axios.get(`${API}/documentos/`);
            const documentos = Array.isArray(response.data) ? response.data : response.data?.results || [];

            // Buscar el CV del empleado específico
            console.log("Buscando CV para empleado:", empleado);
            console.log("Documentos disponibles:", documentos);

            const empleadoId = empleado.id || empleado.idempleado || empleado.idEmpleado;

            const cvDocumento = documentos.find(doc => {
                // Priorizar búsqueda por idempleado y tipo de documento
                if (doc.idempleado && doc.idempleado == empleadoId && doc.idtipodocumento == 1) {
                    return true;
                }

                // Fallback: buscar por nombre de archivo que contenga el DPI
                if ((doc.nombrearchivo && doc.nombrearchivo.includes(`CV_${empleado.dpi}`)) ||
                    (doc.nombredocumento && doc.nombredocumento.includes(`CV_${empleado.dpi}`))) {
                    return true;
                }

                return false;
            });

            if (!cvDocumento) {
                showToast("No se encontró el CV para este colaborador", "warning");
                return;
            }

            console.log("CV encontrado:", cvDocumento);

            // Forzar descarga usando fetch para obtener el blob
            if (cvDocumento.archivo_url || cvDocumento.archivo) {
                const fileUrl = cvDocumento.archivo_url || cvDocumento.archivo;
                console.log("Descargando desde URL directa:", fileUrl);

                try {
                    // Obtener el archivo como blob para forzar descarga
                    const response = await fetch(fileUrl);
                    if (!response.ok) throw new Error('Error al obtener el archivo');

                    const blob = await response.blob();

                    // Crear URL del blob y descargar
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `CV_${empleado.nombre}_${empleado.apellido}.pdf`;
                    link.style.display = 'none';

                    // Agregar al DOM, hacer click y remover
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Limpiar la URL del blob
                    setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                    }, 100);
                } catch (fetchError) {
                    console.error("Error al descargar con fetch:", fetchError);
                    // Fallback: abrir en nueva pestaña
                    window.open(fileUrl, '_blank');
                    showToast("Se abrió el CV en una nueva pestaña", "info");
                }
            } else {
                // Fallback: intentar con el endpoint de archivo
                const fileResponse = await axios.get(`${API}/documentos/${cvDocumento.iddocumento}/archivo/`, {
                    responseType: 'blob'
                });

                // Crear URL del blob y descargar
                const blob = new Blob([fileResponse.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `CV_${empleado.nombre}_${empleado.apellido}.pdf`;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 100);
            }

            showToast("CV descargado correctamente", "success");

        } catch (error) {
            console.error("Error al descargar CV:", error);
            if (error.response?.status === 404) {
                showToast("No se encontró el CV para este colaborador", "warning");
            } else {
                showToast("Error al descargar el CV", "error");
            }
        }
    };

    return (
        <Layout>
            <SEO title="SERJUS - Colaboradores" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <div style={{ width: "min(1100px, 96vw)" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Colaboradores Registrados</h2>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "15px",
                                    alignItems: "center"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar en todos los campos…"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    style={buttonStyles.buscador}
                                />
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setEditingId(null);
                                            setShowForm(true);
                                        }}
                                        style={buttonStyles.nuevo}
                                    >
                                        Nuevo Colaborador
                                    </button>
                                    <button
                                        onClick={() => !generandoPDF && setShowDownload(true)}
                                        onMouseEnter={() => setHoverDesc(true)}
                                        onMouseLeave={() => setHoverDesc(false)}
                                        disabled={generandoPDF}
                                        style={{
                                            ...buttonStyles.descargar,
                                            background: generandoPDF ? "#cccccc" : (hoverDesc ? "#021826" : buttonStyles.descargar.background),
                                            opacity: generandoPDF ? 0.6 : 1,
                                            cursor: generandoPDF ? "not-allowed" : "pointer",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 10
                                        }}
                                    >
                                        {/* small download SVG */}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                        >
                                            <path
                                                d="M12 3v9"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M8 11l4 4 4-4"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M21 21H3"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span>{generandoPDF ? "Generando PDF..." : "Descargar ficha(s)"}</span>
                                    </button>
                                </div>
                            </div>

                            <EmpleadosTable
                                empleados={displayed}
                                handleEdit={handleEdit}
                                handleToggle={handleToggle}
                                paginaActual={page}
                                totalPaginas={totalPages}
                                setPaginaActual={setPage}
                                equipos={equipos}
                                onVerDetalle={onVerDetalle}
                                onTerminacionLaboral={handleTerminacionLaboral}
                                onSubirContrato={abrirModalContrato}
                            />

                            <div style={{ marginTop: "20px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "30px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <label style={{ fontWeight: 600 }}>Mostrar:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={elementosPorPagina}
                                        onChange={e => {
                                            const n = Number(e.target.value.replace(/\D/g, "")) || 1;
                                            setElementosPorPagina(n);
                                            setPage(1);
                                        }}
                                        onFocus={e => e.target.select()}
                                        style={{
                                            width: 80,
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            textAlign: "center"
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <input
                                        type="checkbox"
                                        id="mostrarInactivos"
                                        checked={mostrarInactivos}
                                        onChange={e => {
                                            setMostrarInactivos(e.target.checked);
                                            setPage(1);
                                        }}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            cursor: "pointer"
                                        }}
                                    />
                                    <label
                                        htmlFor="mostrarInactivos"
                                        style={{
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            color: mostrarInactivos ? "#1a73e8" : "#333"
                                        }}
                                    >
                                        Mostrar colaboradores inactivos
                                    </label>
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {/* FORM */}
                {showForm && (
                    <EmpleadoForm
                        form={form}
                        errors={errors}
                        onChange={onChange}
                        handleSubmit={handleSubmit}
                        onClose={() => setShowForm(false)}
                        editingId={editingId}
                        idiomas={idiomas}
                        pueblos={pueblos}
                        equipos={equipos}
                        puestos={puestos}
                        lockEquipo={true}
                        onCvUpload={handleCvUpload}
                        cvExistente={cvExistente}
                        onEliminarCv={eliminarCvExistente}
                    />
                )}

                {/* CONFIRM (activar / desactivar) */}
                {showConfirm && (
                    <ConfirmModal
                        empleado={empleadoSeleccionado}
                        mode={accionEstado}
                        onConfirm={confirmarCambioEstado}
                        onCancel={() => {
                            setShowConfirm(false);
                            setEmpleadoSeleccionado(null);
                            setAccionEstado(null);
                        }}
                    />
                )}

                {/* FICHA */}
                {showDownload && (
                    <FichaDownloadModal
                        empleados={data}
                        onClose={() => setShowDownload(false)}
                        onGenerate={handleGeneratePDF}
                        generandoPDF={generandoPDF}
                    />
                )}

                {/* DETALLE */}
                {mostrarDetalle && detalle && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 4000
                        }}
                    >
                        <div
                            style={{
                                width: "min(980px,96vw)",
                                maxHeight: "92vh",
                                overflow: "auto",
                                background: "#fff",
                                boxShadow: "0 10px 40px rgba(0,0,0,.25)",
                                padding: 28,
                                paddingRight: 43,
                                borderRadius: 16,
                                position: "relative"
                            }}
                        >
                            <div
                                style={{
                                    position: "sticky",
                                    top: 8,
                                    zIndex: 5,
                                    width: "100%",
                                    height: 0,
                                    pointerEvents: "none",
                                    overflow: "visible"
                                }}
                            >
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    aria-label="Cerrar"
                                    title="Cerrar"
                                    style={{
                                        position: "absolute",
                                        right: -40,
                                        pointerEvents: "auto",
                                        width: 36,
                                        height: 36,
                                        borderRadius: "999px",
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        cursor: "pointer",
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#0f172a",
                                        transition: "background .15s, transform .05s",
                                        outline: "none",
                                        boxShadow: "0 1px 6px rgba(0,0,0,.06)"
                                    }}
                                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <h3 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Detalle del Colaborador</h3>
                                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                    <button
                                        onClick={() => descargarCV(detalle)}
                                        style={{
                                            background: "#2563eb",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "10px 16px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}
                                        onMouseEnter={e => e.target.style.background = "#1d4ed8"}
                                        onMouseLeave={e => e.target.style.background = "#2563eb"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Descargar CV
                                    </button>
                                    <button
                                        onClick={() => verContrato(detalle)}
                                        style={{
                                            background: "#dc2626",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "10px 16px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}
                                        onMouseEnter={e => e.target.style.background = "#b91c1c"}
                                        onMouseLeave={e => e.target.style.background = "#dc2626"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Ver Contrato
                                    </button>
                                    <button
                                        onClick={() => setMostrarHistorialPuestos(true)}
                                        style={{
                                            background: "#059669",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: 8,
                                            padding: "10px 16px",
                                            fontSize: 14,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8
                                        }}
                                        onMouseEnter={e => e.target.style.background = "#047857"}
                                        onMouseLeave={e => e.target.style.background = "#059669"}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 10H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 6H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 14H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 18H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Historial de Puestos
                                    </button>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    margin: "6px 0 10px 0"
                                }}
                            >
                                <div style={{ fontSize: 22, fontWeight: 700 }}>
                                    {detalle.nombre} {detalle.apellido}
                                </div>
                                <span
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        background: detalle.estado ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
                                        color: detalle.estado ? "#065f46" : "#7f1d1d",
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}
                                >
                                    {detalle.estado ? "Activo" : "Inactivo"}
                                </span>
                            </div>



                            <div style={{ display: "grid", gap: 22, marginTop: 32 }}>
                                <Section title="Identificación">
                                    <Grid>
                                        <Item label="DPI" value={detalle.dpi} />
                                        <Item label="NIT" value={String(detalle.nit).toUpperCase()} />
                                        <Item label="IGSS" value={detalle.numeroiggs} />
                                        <Item label="Género" value={detalle.genero} />
                                        <Item label="Estado civil" value={detalle.estadocivil} />
                                        <Item label="Fecha nacimiento" value={toDMY(detalle.fechanacimiento)} />
                                        <Item label="Lugar nacimiento" value={detalle.lugarnacimiento} />
                                        <Item label="# Hijos" value={detalle.numerohijos ?? 0} />
                                    </Grid>
                                </Section>

                                <Section title="Contacto">
                                    <Grid>
                                        <Item label="Tel. residencial" value={detalle.telefonoresidencial} />
                                        <Item label="Tel. celular" value={detalle.telefonocelular} />
                                        <Item label="Tel. emergencia" value={detalle.telefonoemergencia} />
                                        <Item label="Email" value={detalle.email} />
                                        <Item full label="Dirección" value={detalle.direccion} />
                                    </Grid>
                                </Section>

                                <Section title="Formación">
                                    <Grid>
                                        <Item label="Título medio" value={detalle.titulonivelmedio} />
                                        <Item label="Estudios universitarios" value={detalle.estudiosuniversitarios} />
                                        <Item label="Idioma" value={detalle.idioma || ""} />
                                        <Item label="Pueblo / Cultura" value={detalle.pueblo || ""} />
                                    </Grid>
                                </Section>

                                <Section title="Organización">
                                    <Grid>
                                        <Item label="Equipo" value={detalle.equipo || ""} />
                                        <Item label="Puesto" value={detalle.puesto || ""} />
                                        <Item label="Fecha de inicio" value={toDMY(detalle.inicioLaboral)} />
                                    </Grid>
                                </Section>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL USUARIO CREADO */}
                <UsuarioCreadoModal
                    mostrar={mostrarUsuarioCreado}
                    onCerrar={() => setMostrarUsuarioCreado(false)}
                    datosUsuario={datosUsuarioCreado}
                />

                {/* MODAL HISTORIAL PUESTOS */}
                <HistorialPuestosModal
                    mostrar={mostrarHistorialPuestos}
                    empleado={detalle}
                    onClose={() => setMostrarHistorialPuestos(false)}
                />

                {/* MODAL TERMINACIÓN LABORAL */}
                <TerminacionLaboralModal
                    empleado={empleadoParaTerminacion}
                    isOpen={mostrarTerminacionLaboral}
                    onClose={() => setMostrarTerminacionLaboral(false)}
                    onSuccess={handleTerminacionSuccess}
                />

                {/* MODAL SUBIR CONTRATO */}
                {mostrarModalContrato && empleadoParaContrato && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 4000
                        }}
                    >
                        <div
                            style={{
                                width: "min(500px, 90vw)",
                                background: "#fff",
                                boxShadow: "0 10px 40px rgba(0,0,0,.25)",
                                padding: 28,
                                borderRadius: 16,
                                position: "relative"
                            }}
                        >
                            <button
                                onClick={cerrarModalContrato}
                                style={{
                                    position: "absolute",
                                    top: 15,
                                    right: 20,
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 20,
                                    color: "#666"
                                }}
                            >
                                ✕
                            </button>

                            <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
                                Subir Contrato - {empleadoParaContrato.nombre} {empleadoParaContrato.apellido}
                            </h3>

                            {/* Mostrar contrato existente si lo hay */}
                            {contratoExistente ? (
                                <>
                                    <div style={{
                                        marginBottom: 20,
                                        padding: 16,
                                        backgroundColor: "#f8f9fa",
                                        border: "1px solid #dee2e6",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{
                                                width: 24,
                                                height: 24,
                                                backgroundColor: "#198754",
                                                borderRadius: 4,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontSize: 12,
                                                fontWeight: "bold"
                                            }}>
                                                PDF
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 15 }}>
                                                    {contratoExistente.nombrearchivo || 'Contrato Actual'}
                                                </div>
                                                <div style={{ fontSize: 13, color: "#6b7280" }}>
                                                    Subido el {new Date(contratoExistente.fechasubida).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={eliminarContratoExistente}
                                            style={{
                                                background: "#dc3545",
                                                color: "white",
                                                border: "none",
                                                borderRadius: 4,
                                                padding: "8px 12px",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    {/* Solo mostrar input para subir nuevo contrato si el actual fue eliminado */}
                                    {!contratoExistente && (
                                        <div style={{ marginBottom: 20 }}>
                                            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                                                Nuevo Contrato (reemplazará el actual)
                                            </label>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleContratoUpload}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px",
                                                    border: "1px solid #d1d5db",
                                                    borderRadius: 8,
                                                    fontSize: 14
                                                }}
                                            />
                                            <small style={{ color: "#666", fontSize: 13, marginTop: 4, display: "block" }}>
                                                Solo archivos PDF, máximo 5MB
                                            </small>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
                                        Contrato del Colaborador
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleContratoUpload}
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            border: "1px solid #d1d5db",
                                            borderRadius: 8,
                                            fontSize: 14
                                        }}
                                    />
                                    <small style={{ color: "#666", fontSize: 13, marginTop: 4, display: "block" }}>
                                        Solo archivos PDF, máximo 5MB
                                    </small>
                                </div>
                            )}

                            {contratoFile && (
                                <div style={{
                                    marginBottom: 20,
                                    padding: 12,
                                    backgroundColor: "#d4edda",
                                    border: "1px solid #c3e6cb",
                                    borderRadius: 6,
                                    color: "#155724",
                                    fontSize: 14,
                                    fontWeight: 600
                                }}>
                                    ✓ Archivo seleccionado: {contratoFile.name}
                                </div>
                            )}

                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                <button
                                    onClick={cerrarModalContrato}
                                    style={{
                                        padding: "12px 20px",
                                        border: "1px solid #d1d5db",
                                        background: "#fff",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontSize: 14,
                                        fontWeight: 600
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={subirContrato}
                                    disabled={!contratoFile}
                                    style={{
                                        padding: "12px 20px",
                                        border: "none",
                                        background: contratoFile ? "#dc2626" : "#ccc",
                                        color: "#fff",
                                        borderRadius: 8,
                                        cursor: contratoFile ? "pointer" : "not-allowed",
                                        fontSize: 14,
                                        fontWeight: 600
                                    }}
                                >
                                    {contratoExistente ? "Actualizar Contrato" : "Subir Contrato"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EmpleadosContainer;
