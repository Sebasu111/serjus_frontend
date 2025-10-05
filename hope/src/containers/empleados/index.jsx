// containers/empleados/index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import SidebarMenu from "../../components/menu/main-menu/index.jsx";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";
const ESTADOS_CIVIL = ["casado", "divorciado", "viudo", "soltero", "unido"];
const GENEROS = ["masculino", "femenino", "otro"];

// 22 departamentos de Guatemala
const DEPARTAMENTOS_GT = [
    "Alta Verapaz",
    "Baja Verapaz",
    "Chimaltenango",
    "Chiquimula",
    "El Progreso",
    "Escuintla",
    "Guatemala",
    "Huehuetenango",
    "Izabal",
    "Jalapa",
    "Jutiapa",
    "Petén",
    "Quetzaltenango",
    "Quiché",
    "Retalhuleu",
    "Sacatepéquez",
    "San Marcos",
    "Santa Rosa",
    "Sololá",
    "Suchitepéquez",
    "Totonicapán",
    "Zacapa",
];

// ===== Helpers fecha
const maskDateDMY = (v) => {
    const d = v.replace(/[^\d]/g, "").slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};
const dmyToIso = (dmy) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dmy)) return "";
    const [dd, mm, yyyy] = dmy.split("/");
    return `${yyyy}-${mm}-${dd}`;
};
const isoToDmy = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d?.padStart(2, "0")}/${m?.padStart(2, "0")}/${y}`;
};

// ===== NIT helpers
const normalizeNit = (raw) => {
    const s = String(raw ?? "")
        .replace(/\s+/g, "")
        .toUpperCase();
    if (s === "CF" || s === "C/F") return "C/F";
    return s; // números u otra entrada quedan igual
};

const EmpleadosContainer = () => {
    // listado / ui
    const [empleados, setEmpleados] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // modal
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // form + errores
    const [form, setForm] = useState({
        dpi: "",
        nit: "",
        nombre: "",
        apellido: "",
        genero: "",
        // Lugar de nacimiento: seleccion y/o texto
        lugarnacimientoSelect: "",
        lugarnacimientoOtro: "",
        lugarnacimiento: "", // valor final que se envía
        fechanacimiento_dmy: "",
        telefono: "",
        email: "",
        direccion: "",
        estadocivil: "",
        numerohijos: 0,
        // estado no se muestra; al crear se manda true
        estado: true,
    });
    const [errors, setErrors] = useState({});

    // cargar
    useEffect(() => {
        fetchEmpleados();
    }, []);
    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(`${API}/empleados/`);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.results)
                ? res.data.results
                : [];
            setEmpleados(data);
        } catch (e) {
            console.error("Error al cargar empleados:", e);
            setMensaje("Error al cargar los empleados");
        }
    };

    // filtros
    const empleadosFiltrados = empleados.filter((e) => {
        const q = busqueda.toLowerCase();
        return (
            (e.nombre || "").toLowerCase().includes(q) ||
            (e.apellido || "").toLowerCase().includes(q) ||
            (e.dpi || "").toLowerCase().includes(q) ||
            (e.nit || "").toLowerCase().includes(q) ||
            (e.email || "").toLowerCase().includes(q)
        );
    });
    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const empleadosPaginados = empleadosFiltrados.slice(
        indexOfFirst,
        indexOfLast
    );
    const totalPaginas = Math.ceil(
        empleadosFiltrados.length / elementosPorPagina
    );

    // ===== Validaciones
    const validators = {
        nombre: (v) =>
            !v?.trim() ? "Requerido" : v.length < 2 ? "Muy corto" : "",
        apellido: (v) =>
            !v?.trim() ? "Requerido" : v.length < 2 ? "Muy corto" : "",
        dpi: (v) =>
            !v ? "Requerido" : !/^\d{13}$/.test(v) ? "DPI de 13 dígitos" : "",
        nit: (v) => {
            if (!v) return ""; // si queda vacío lo convertimos a C/F
            const s = normalizeNit(v);
            return /^\d+$/.test(s) || s === "C/F" ? "" : "Use números o C/F";
        },
        genero: (v) => (!v ? "Selecciona género" : ""),
        lugarnacimiento: (v) => (!v?.trim() ? "Requerido" : ""),
        fechanacimiento_dmy: (v) => {
            if (!v) return "Requerido";
            if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return "Formato dd/mm/aaaa";
            const [d, m, y] = v.split("/").map(Number);
            const dt = new Date(y, m - 1, d);
            if (
                dt.getFullYear() !== y ||
                dt.getMonth() !== m - 1 ||
                dt.getDate() !== d
            )
                return "Fecha inválida";
            return "";
        },
        telefono: (v) =>
            !/^\d{7,15}$/.test(String(v || "")) ? "7–15 dígitos" : "",
        email: (v) =>
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ""))
                ? "Email inválido"
                : "",
        direccion: (v) =>
            !v?.trim() ? "Requerido" : v.length < 5 ? "Muy corta" : "",
        estadocivil: (v) => (!v ? "Selecciona estado civil" : ""),
        numerohijos: (v) => (Number(v) < 0 ? "No puede ser negativo" : ""),
    };
    const validateField = (name, value) =>
        validators[name] ? validators[name](value) : "";
    const validateForm = (f) => {
        const errs = {};
        // asegurar lugarnacimiento final antes de validar
        const f2 = { ...f, lugarnacimiento: computeLugar(f) };
        Object.keys(validators).forEach((k) => {
            const msg = validateField(k, f2[k]);
            if (msg) errs[k] = msg;
        });
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ===== utils lugar nacimiento
    const computeLugar = (f) => {
        if (f.lugarnacimientoSelect === "otro")
            return f.lugarnacimientoOtro.trim();
        return f.lugarnacimientoSelect || f.lugarnacimiento;
    };

    // ===== abrir modal: crear
    const openCreate = () => {
        setEditingId(null);
        setForm({
            dpi: "",
            nit: "",
            nombre: "",
            apellido: "",
            genero: "",
            lugarnacimientoSelect: "",
            lugarnacimientoOtro: "",
            lugarnacimiento: "",
            fechanacimiento_dmy: "",
            telefono: "",
            email: "",
            direccion: "",
            estadocivil: "",
            numerohijos: 0,
            estado: true,
        });
        setErrors({});
        setMostrarFormulario(true);
    };

    // ===== abrir modal: editar
    const openEdit = (emp) => {
        const isDepto = DEPARTAMENTOS_GT.includes(emp.lugarnacimiento || "");
        setEditingId(emp.idempleado);
        setForm({
            dpi: emp.dpi || "",
            nit: emp.nit || "",
            nombre: emp.nombre || "",
            apellido: emp.apellido || "",
            genero: emp.genero || "",
            lugarnacimientoSelect: isDepto ? emp.lugarnacimiento : "otro",
            lugarnacimientoOtro: isDepto ? "" : emp.lugarnacimiento || "",
            lugarnacimiento: emp.lugarnacimiento || "",
            fechanacimiento_dmy: isoToDmy(emp.fechanacimiento || ""),
            telefono: emp.telefono || "",
            email: emp.email || "",
            direccion: emp.direccion || "",
            estadocivil: emp.estadocivil || "",
            numerohijos: emp.numerohijos ?? 0,
            estado: !!emp.estado,
        });
        setErrors({});
        setMostrarFormulario(true);
    };

    // ===== onChange
    const onChange = (e) => {
        const { name, value, type } = e.target;
        let v = type === "checkbox" ? e.target.checked : value;

        if (name === "dpi" || name === "telefono") v = v.replace(/[^\d]/g, "");
        if (name === "nit") {
            let cleaned = value.replace(/[^0-9cCfF/]/g, "");
            cleaned = normalizeNit(cleaned);
            v = cleaned;
        }
        if (name === "numerohijos") v = Math.max(0, Number(v || 0));
        if (name === "fechanacimiento_dmy") v = maskDateDMY(v);

        // manejo del selector de lugar
        if (name === "lugarnacimientoSelect") {
            const next = {
                ...form,
                lugarnacimientoSelect: v,
                lugarnacimiento: v === "otro" ? "" : v,
            };
            setForm(next);
            setErrors((prev) => ({
                ...prev,
                lugarnacimiento: validateField(
                    "lugarnacimiento",
                    next.lugarnacimiento
                ),
            }));
            return;
        }
        if (name === "lugarnacimientoOtro") {
            const next = {
                ...form,
                lugarnacimientoOtro: v,
                lugarnacimiento: v,
            };
            setForm(next);
            setErrors((prev) => ({
                ...prev,
                lugarnacimiento: validateField(
                    "lugarnacimiento",
                    next.lugarnacimiento
                ),
            }));
            return;
        }

        const next = { ...form, [name]: v };
        setForm(next);
        // validar campo
        const fieldName =
            name === "lugarnacimientoSelect" || name === "lugarnacimientoOtro"
                ? "lugarnacimiento"
                : name;
        setErrors((prev) => ({
            ...prev,
            [fieldName]: validateField(fieldName, next[fieldName]),
        }));
    };

    // NIT vacío => C/F
    const onBlurNit = () => {
        if (!form.nit || !String(form.nit).trim()) {
            setForm((f) => ({ ...f, nit: "C/F" }));
            setErrors((prev) => ({ ...prev, nit: "" }));
        }
    };

    // ===== submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalLugar = computeLugar(form);
        const withNitLugar = {
            ...form,
            nit: !form.nit || !String(form.nit).trim() ? "C/F" : form.nit,
            lugarnacimiento: finalLugar,
        };

        const ok = validateForm(withNitLugar);
        if (!ok) return;

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;
            const payload = {
                dpi: withNitLugar.dpi,
                nit: normalizeNit(withNitLugar.nit),
                nombre: withNitLugar.nombre,
                apellido: withNitLugar.apellido,
                genero: withNitLugar.genero,
                lugarnacimiento: withNitLugar.lugarnacimiento,
                fechanacimiento: dmyToIso(withNitLugar.fechanacimiento_dmy),
                telefono: withNitLugar.telefono,
                email: withNitLugar.email,
                direccion: withNitLugar.direccion,
                estadocivil: withNitLugar.estadocivil,
                numerohijos: Number(withNitLugar.numerohijos),
                // siempre activo al crear/guardar
                estado: true,
                idusuario: idUsuario,
            };

            if (editingId) {
                await axios.put(`${API}/empleados/${editingId}/`, payload);
                setMensaje("Empleado actualizado correctamente");
            } else {
                await axios.post(`${API}/empleados/`, payload);
                setMensaje("Empleado registrado correctamente");
            }

            setMostrarFormulario(false);
            fetchEmpleados();
        } catch (error) {
            console.error(
                "Error al guardar empleado:",
                error.response?.data || error
            );
            setMensaje("Error al registrar/actualizar el empleado");
        }
    };

    // ===== desactivar / activar
    const handleDelete = async (id) => {
        if (!window.confirm("¿Desactivar este empleado?")) return;
        try {
            const emp = empleados.find((e) => e.idempleado === id);
            if (!emp) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

            await axios.put(`${API}/empleados/${id}/`, {
                ...emp,
                estado: false,
                idusuario: idUsuario,
            });

            setMensaje("Empleado desactivado");
            fetchEmpleados();
        } catch (error) {
            console.error(
                "Error al desactivar:",
                error.response?.data || error
            );
            setMensaje("Error al desactivar el empleado");
        }
    };

    const handleActivate = async (id) => {
        try {
            const emp = empleados.find((e) => e.idempleado === id);
            if (!emp) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

            await axios.put(`${API}/empleados/${id}/`, {
                ...emp,
                estado: true,
                idusuario: idUsuario,
            });

            setMensaje("Empleado activado");
            fetchEmpleados();
        } catch (error) {
            console.error("Error al activar:", error.response?.data || error);
            setMensaje("Error al activar el empleado");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Empleados" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <SidebarMenu />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Header />

                    <main
                        style={{
                            flex: 1,
                            padding: "40px 20px",
                            background: "#f0f2f5",
                        }}
                    >
                        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                            <h2
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Empleados Registrados
                            </h2>

                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error")
                                            ? "red"
                                            : "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}

                            {/* BUSCADOR + LÍMITE */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "15px",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar empleado (nombre, apellido, DPI, NIT o email)…"
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginRight: "10px",
                                    }}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setElementosPorPagina(v > 0 ? v : 1);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        width: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    overflowX: "auto",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        minWidth: "1400px",
                                        borderCollapse: "collapse",
                                        tableLayout: "auto",
                                        fontSize: 13,
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                "Nombre",
                                                "Apellido",
                                                "DPI",
                                                "NIT",
                                                "Género",
                                                "Lugar nac.",
                                                "Fecha nac.",
                                                "Teléfono",
                                                "Email",
                                                "Dirección",
                                                "Estado civil",
                                                "# Hijos",
                                                "Estado",
                                                "Acciones",
                                            ].map((h) => (
                                                <th key={h} style={thCompact}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {empleadosPaginados.length ? (
                                            empleadosPaginados.map((emp) => (
                                                <tr key={emp.idempleado}>
                                                    <td style={tdCompact}>
                                                        {emp.nombre}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.apellido}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.dpi}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.nit}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.genero}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.lugarnacimiento}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {isoToDmy(
                                                            emp.fechanacimiento ||
                                                                ""
                                                        )}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.telefono}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.email}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.direccion}
                                                    </td>
                                                    <td style={tdCompact}>
                                                        {emp.estadocivil}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdCompact,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {emp.numerohijos}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdCompact,
                                                            textAlign: "center",
                                                            color: emp.estado
                                                                ? "green"
                                                                : "red",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {emp.estado
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdCompact,
                                                            textAlign: "center",
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                openEdit(emp)
                                                            }
                                                            disabled={
                                                                !emp.estado
                                                            }
                                                            style={{
                                                                padding:
                                                                    "6px 10px",
                                                                background:
                                                                    emp.estado
                                                                        ? "#0054fd"
                                                                        : "#6c757d",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius:
                                                                    "5px",
                                                                cursor: emp.estado
                                                                    ? "pointer"
                                                                    : "not-allowed",
                                                                marginRight:
                                                                    "6px",
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                        {emp.estado ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        emp.idempleado
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 10px",
                                                                    background:
                                                                        "#dc3545",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "5px",
                                                                }}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        emp.idempleado
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 10px",
                                                                    background:
                                                                        "#28a745",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "5px",
                                                                }}
                                                            >
                                                                Activar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="14"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: 16,
                                                    }}
                                                >
                                                    No hay empleados registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* PAGINACIÓN */}
                                {totalPaginas > 1 && (
                                    <div
                                        style={{
                                            marginTop: "16px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {Array.from(
                                            { length: totalPaginas },
                                            (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() =>
                                                        setPaginaActual(i + 1)
                                                    }
                                                    style={{
                                                        margin: "0 5px",
                                                        padding: "6px 12px",
                                                        border: "1px solid #007bff",
                                                        background:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#007bff"
                                                                : "#fff",
                                                        color:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#fff"
                                                                : "#007bff",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {i + 1}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* BOTÓN NUEVO */}
                            <button
                                onClick={openCreate}
                                style={{
                                    marginTop: "20px",
                                    padding: "12px 20px",
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Nuevo Empleado
                            </button>
                        </div>
                    </main>

                    <Footer />
                </div>

                {/* MODAL MÁS PEQUEÑO (con scroll interno) */}
                {mostrarFormulario && (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "500px",
                            maxWidth: "95%",
                            maxHeight: "80vh",
                            overflow: "hidden",
                            background: "#fff",
                            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                            borderRadius: "12px",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h3
                            style={{
                                margin: "18px 20px 0 20px",
                                textAlign: "center",
                            }}
                        >
                            {editingId
                                ? "Editar empleado"
                                : "Registrar empleado"}
                        </h3>

                        <div style={{ padding: "20px", overflowY: "auto" }}>
                            <form onSubmit={handleSubmit}>
                                <F label="Nombre" err={errors.nombre}>
                                    <input
                                        name="nombre"
                                        placeholder="Juan"
                                        value={form.nombre}
                                        onChange={onChange}
                                        style={input(errors.nombre)}
                                    />
                                </F>
                                <F label="Apellido" err={errors.apellido}>
                                    <input
                                        name="apellido"
                                        placeholder="Pérez"
                                        value={form.apellido}
                                        onChange={onChange}
                                        style={input(errors.apellido)}
                                    />
                                </F>
                                <F label="DPI" err={errors.dpi}>
                                    <input
                                        name="dpi"
                                        placeholder="1234567890123"
                                        maxLength={13}
                                        value={form.dpi}
                                        onChange={onChange}
                                        style={input(errors.dpi)}
                                    />
                                </F>
                                <F label="NIT (número o C/F)" err={errors.nit}>
                                    <input
                                        name="nit"
                                        placeholder="1234567 o C/F"
                                        value={form.nit}
                                        onChange={onChange}
                                        onBlur={onBlurNit}
                                        style={input(errors.nit)}
                                    />
                                </F>
                                <F label="Género" err={errors.genero}>
                                    <select
                                        name="genero"
                                        value={form.genero}
                                        onChange={onChange}
                                        style={input(errors.genero)}
                                    >
                                        <option value="">Seleccione</option>
                                        {GENEROS.map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </select>
                                </F>
                                <F
                                    label="Estado civil"
                                    err={errors.estadocivil}
                                >
                                    <select
                                        name="estadocivil"
                                        value={form.estadocivil}
                                        onChange={onChange}
                                        style={input(errors.estadocivil)}
                                    >
                                        <option value="">Seleccione</option>
                                        {ESTADOS_CIVIL.map((ec) => (
                                            <option key={ec} value={ec}>
                                                {ec}
                                            </option>
                                        ))}
                                    </select>
                                </F>

                                {/* Lugar de nacimiento con opción Otro */}
                                <F
                                    label="Lugar de nacimiento"
                                    err={errors.lugarnacimiento}
                                >
                                    <select
                                        name="lugarnacimientoSelect"
                                        value={form.lugarnacimientoSelect}
                                        onChange={onChange}
                                        style={input(errors.lugarnacimiento)}
                                    >
                                        <option value="">Seleccione</option>
                                        {DEPARTAMENTOS_GT.map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                        <option value="otro">
                                            Otro (especifique)
                                        </option>
                                    </select>
                                </F>
                                {form.lugarnacimientoSelect === "otro" && (
                                    <F
                                        label="Especifique lugar"
                                        err={errors.lugarnacimiento}
                                    >
                                        <input
                                            name="lugarnacimientoOtro"
                                            placeholder="Ciudad / País"
                                            value={form.lugarnacimientoOtro}
                                            onChange={onChange}
                                            style={input(
                                                errors.lugarnacimiento
                                            )}
                                        />
                                    </F>
                                )}

                                <F
                                    label="Fecha de nacimiento (dd/mm/aaaa)"
                                    err={errors.fechanacimiento_dmy}
                                >
                                    <input
                                        name="fechanacimiento_dmy"
                                        placeholder="dd/mm/aaaa"
                                        inputMode="numeric"
                                        maxLength={10}
                                        value={form.fechanacimiento_dmy}
                                        onChange={onChange}
                                        style={input(
                                            errors.fechanacimiento_dmy
                                        )}
                                    />
                                </F>
                                <F label="Teléfono" err={errors.telefono}>
                                    <input
                                        name="telefono"
                                        placeholder="50255551234"
                                        value={form.telefono}
                                        onChange={onChange}
                                        style={input(errors.telefono)}
                                    />
                                </F>
                                <F label="Email" err={errors.email}>
                                    <input
                                        name="email"
                                        placeholder="juan.perez@ejemplo.com"
                                        value={form.email}
                                        onChange={onChange}
                                        style={input(errors.email)}
                                    />
                                </F>
                                <F label="Dirección" err={errors.direccion}>
                                    <input
                                        name="direccion"
                                        placeholder="Calle 1-23 Zona 1, Ciudad"
                                        value={form.direccion}
                                        onChange={onChange}
                                        style={input(errors.direccion)}
                                    />
                                </F>
                                <F
                                    label="Número de hijos"
                                    err={errors.numerohijos}
                                >
                                    <input
                                        type="number"
                                        name="numerohijos"
                                        min={0}
                                        placeholder="0"
                                        value={form.numerohijos}
                                        onChange={onChange}
                                        style={input(errors.numerohijos)}
                                    />
                                </F>

                                <button type="submit" style={btnSubmit}>
                                    {editingId ? "Actualizar" : "Guardar"}
                                </button>
                            </form>
                        </div>

                        <button
                            onClick={() => setMostrarFormulario(false)}
                            style={btnClose}
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

// ===== UI helpers
const thCompact = {
    borderBottom: "2px solid #eee",
    padding: "8px",
    textAlign: "left",
    lineHeight: 1.15,
    whiteSpace: "normal",
    wordBreak: "break-word",
};
const tdCompact = {
    padding: "8px 8px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top",
    lineHeight: 1.25,
    whiteSpace: "normal",
    wordBreak: "break-word",
};
const input = (err) => ({
    width: "100%",
    padding: "10px",
    border: `1px solid ${err ? "#dc3545" : "#ccc"}`,
    borderRadius: "6px",
});
const F = ({ label, err, children }) => (
    <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>{label}</label>
        {children}
        {err && (
            <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                {err}
            </div>
        )}
    </div>
);
const btnSubmit = {
    width: "100%",
    marginTop: 16,
    padding: "12px 0",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
};
const btnClose = {
    margin: "0 20px 20px 20px",
    padding: "10px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
};

export default EmpleadosContainer;