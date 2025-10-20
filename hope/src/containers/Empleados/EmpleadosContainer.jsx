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

// 🔔 toasts y estilos compartidos
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

const API = "http://127.0.0.1:8000/api";
const empId = row => row?.id ?? row?.idempleado ?? row?.idEmpleado;

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = o =>
    pick(o, "id", "ididioma", "idIdioma", "idequipo", "idEquipo", "idpueblocultura", "idPuebloCultura", "pk", "codigo");
const getName = (o, type) => {
    if (!o) return "";
    if (type === "idioma") return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
    if (type === "pueblo") return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label");
    if (type === "equipo") return pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");
    return pick(o, "nombre", "descripcion", "label");
};

const Section = ({ title, children }) => (
    <section style={{ marginBottom: 32 }}>
        <h4
            style={{
                margin: "0 0 16px 0",
                fontSize: 19,
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

    // catálogo
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);
    const [equipos, setEquipos] = useState([]);

    // detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetchList();
        fetchIdiomas();
        fetchPueblos();
        fetchEquipos();
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

    // Validaciones específicas (solo devuelven mensajes concretos; no genéricos)
    const emailRegex = /^\S+@\S+\.\S+$/;
    const validateField = (name, value) => {
        let msg = "";
        if (name === "genero") {
            const allowed = ["Masculino", "Femenino", "Otros"];
            if (!allowed.includes(String(value))) msg = ""; // el Form mostrará "Este campo es obligatorio"
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
            if (!/^\d{1,9}$/.test(v)) msg = "Use 1–9 dígitos (o C/F)";
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

        if (["dpi", "numeroiggs"].includes(name)) {
            if (!/^\d*$/.test(val)) return;
            if (String(val).length > 13) return;
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
        "nit",
        "numeroiggs"
    ];
    const STEP2_FIELDS = [
        "telefonoresidencial",
        "telefonocelular",
        "telefonoemergencia",
        "email",
        "direccion",
        "ididioma",
        "idpueblocultura",
        "idequipo"
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
            idequipo: Number(f.idequipo),
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
            const catalogos = { idiomas, pueblos, equipos };
            await generarFichasPDF(seleccion, catalogos, logo);
            setShowDownload(false);
            showToast("PDF generado correctamente");
        } catch (e) {
            console.error(e);
            showToast("No se pudo generar el PDF", "error");
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
                await axios.put(`${API}/empleados/${editingId}/`, payload);
                showToast("Empleado actualizado correctamente");
            } else {
                await axios.post(`${API}/empleados/`, payload);
                showToast("Empleado registrado correctamente");
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
            ididioma: row.ididioma ?? "",
            idpueblocultura: row.idpueblocultura ?? "",
            idequipo: row.idequipo ?? "",
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
            data.map(r => {
                const idioma = labelFrom(r.ididioma, idiomas, "idioma");
                const pueblo = labelFrom(r.idpueblocultura, pueblos, "pueblo");
                const equipo = labelFrom(r.idequipo, equipos, "equipo");
                const join = [
                    r.nombre,
                    r.apellido,
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
        const idioma = labelFrom(row.ididioma, idiomas, "idioma");
        const pueblo = labelFrom(row.idpueblocultura, pueblos, "pueblo");
        const equipo = labelFrom(row.idequipo, equipos, "equipo");
        setDetalle({ ...row, idioma, pueblo, equipo });
        setMostrarDetalle(true);
    };

    const equipoBloqueado = !!new URLSearchParams(window.location.search).get("equipo") || !!editingId;

    return (
        <Layout>
            <SEO title="Hope – Empleados" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: "250px" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "900px", width: "100%", margin: "0 auto", paddingLeft: "0px" }}>
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
                                    <button onClick={() => setShowDownload(true)} style={buttonStyles.secundario}>
                                        Descargar ficha(s)
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
                        lockEquipo={equipoBloqueado}
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
                        empleados={filtered.map(x => x.raw)}
                        onClose={() => setShowDownload(false)}
                        onGenerate={handleGeneratePDF}
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

                            <div style={{ marginBottom: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Detalle del Colaborador</h3>
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

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                                <span
                                    style={{
                                        fontSize: 14,
                                        background: "#f3f4f6",
                                        padding: "6px 10px",
                                        borderRadius: 8
                                    }}
                                >
                                    DPI: {detalle.dpi}
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        background: "#f3f4f6",
                                        padding: "6px 10px",
                                        borderRadius: 8
                                    }}
                                >
                                    NIT: {String(detalle.nit).toUpperCase()}
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        background: "#f3f4f6",
                                        padding: "6px 10px",
                                        borderRadius: 8
                                    }}
                                >
                                    IGGS: {detalle.numeroiggs}
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        background: "#f3f4f6",
                                        padding: "6px 10px",
                                        borderRadius: 8
                                    }}
                                >
                                    Equipo: {detalle.equipo || ""}
                                </span>
                            </div>

                            <div style={{ display: "grid", gap: 22 }}>
                                <Section title="Identificación">
                                    <Grid>
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
                                        <Item label="Fecha de inicio" value={toDMY(detalle.inicioLaboral)} />
                                    </Grid>
                                </Section>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ToastContainer />
        </Layout>
    );
};

export default EmpleadosContainer;
