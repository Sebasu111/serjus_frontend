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
        iniciolaboral: ""
    });
    const [errors, setErrors] = useState({});
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // búsqueda/paginación
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

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
            console.log("Historial de puesto creado exitosamente");
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
                console.log(`Historial anterior finalizado: ID ${historialActivo.idhistorialpuesto}`);
            }
        } catch (error) {
            console.error("Error al finalizar historial anterior:", error);
        }
    };

    // Función para crear usuario automáticamente
    const crearUsuarioAutomatico = async (empleadoId, nombre, apellido) => {
        try {
            // Generar nombre de usuario basado en nombre y apellido
            const nombreUsuario = `${nombre.toLowerCase().split(' ')[0]}${apellido.toLowerCase().split(' ')[0]}`;

            // Generar contraseña aleatoria
            const contrasenaGenerada = generarContrasenaAleatoria();

            // Obtener rol por defecto (asumir que existe un rol básico, ID = 1)
            let idRolPorDefecto = 1;

            // Intentar obtener roles para usar uno por defecto
            try {
                const rolesRes = await axios.get(`${API}/roles/`);
                const roles = Array.isArray(rolesRes.data) ? rolesRes.data : rolesRes.data?.results || [];
                if (roles.length > 0) {
                    // Buscar un rol que se llame "Usuario" o "Empleado" o usar el primero
                    const rolBasico = roles.find(r =>
                        r.nombrerol?.toLowerCase().includes('usuario') ||
                        r.nombrerol?.toLowerCase().includes('empleado') ||
                        r.nombrerol?.toLowerCase().includes('básico')
                    );
                    idRolPorDefecto = rolBasico ? rolBasico.idrol : roles[0].idrol;
                }
            } catch (error) {
                console.warn("No se pudieron cargar los roles, usando rol por defecto:", error);
            }

            const ahora = new Date().toISOString();

            const payloadUsuario = {
                nombreusuario: nombreUsuario,
                contrasena: contrasenaGenerada,
                estado: true,
                createdat: ahora,
                updatedat: ahora,
                idrol: idRolPorDefecto,
                idempleado: empleadoId
            };

            await axios.post(`${API}/usuarios/`, payloadUsuario);

            return {
                usuario: nombreUsuario,
                contrasena: contrasenaGenerada
            };
        } catch (error) {
            console.error("Error al crear usuario automático:", error);
            throw error;
        }
    };

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/empleados/`);
            const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
            setData(rows);
        } catch (e) {
            console.error("Error al cargar empleados:", e);
            showToast("Error al cargar los empleados", "error");
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
                        setErrors(er => ({ ...er, dpi: "DPI ya registrado" }));
                        showToast("El DPI ya existe.", "warning");
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
    const STEP3_FIELDS = ["numerohijos", "titulonivelmedio", "estudiosuniversitarios", "iniciolaboral"];

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
            iniciolaboral: ""
        });
        setErrors({});
        setEditingId(null);
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
                        setErrors(p => ({ ...p, dpi: "DPI ya registrado" }));
                        window.dispatchEvent(new CustomEvent("empleadoForm:goToStep", { detail: 1 }));
                        showToast("El DPI ya existe.", "warning");
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
                }

                showToast("Empleado actualizado correctamente");
            } else {
                const response = await axios.post(`${API}/empleados/`, payload);
                const empleadoCreado = response.data;

                // Obtener el ID del empleado recién creado
                const empleadoId = empleadoCreado.id || empleadoCreado.idempleado || empleadoCreado.idEmpleado;

                // Crear historial inicial si se asignó un puesto
                if (form.idpuesto && Number(form.idpuesto) > 0) {
                    const fechaInicio = form.iniciolaboral || new Date().toISOString().slice(0, 10);
                    await crearHistorialPuesto(empleadoId, Number(form.idpuesto), fechaInicio);
                }

                showToast("Empleado registrado correctamente");

                // Crear usuario automáticamente solo si es un nuevo empleado
                try {
                    const datosUsuario = await crearUsuarioAutomatico(empleadoId, form.nombre, form.apellido);
                    setDatosUsuarioCreado(datosUsuario);
                    setMostrarUsuarioCreado(true);
                } catch (userError) {
                    console.error("Error al crear usuario automático:", userError);
                    showToast("Empleado creado, pero hubo un error al generar el usuario automáticamente", "warning");
                }
            }

            resetForm();
            fetchList();
            setPage(1);
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error al guardar:", err.response?.data || err);
            showToast("Error al registrar/actualizar el empleado", "error");
        }
    };

    const handleEdit = row => {
        if (row?.estado === false) {
            showToast("No se puede editar un empleado inactivo", "warning");
            return;
        }
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
            iniciolaboral: (row.inicioLaboral || "").slice(0, 10)
        });
        setErrors({});
        setEditingId(empId(row));
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
            await axios.put(`${API}/empleados/${id}/`, {
                ...empleadoSeleccionado,
                estado: nuevoEstado,
                idusuario: getIdUsuario()
            });
            showToast(nuevoEstado ? "Empleado activado correctamente" : "Empleado desactivado correctamente");
            fetchList();
        } catch {
            showToast("Error al cambiar el estado", "error");
        } finally {
            setShowConfirm(false);
            setEmpleadoSeleccionado(null);
            setAccionEstado(null);
        }
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
        if (!q) return indexable;
        if (q === "activo") return indexable.filter(({ raw }) => !!raw.estado);
        if (q === "inactivo") return indexable.filter(({ raw }) => !raw.estado);
        return indexable.filter(({ haystack }) => haystack.includes(q));
    }, [indexable, search]);

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
                                        Nuevo Empleado
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
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: 600 }}>Mostrar:</label>
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
            </div>
        </Layout>
    );
};

export default EmpleadosContainer;
