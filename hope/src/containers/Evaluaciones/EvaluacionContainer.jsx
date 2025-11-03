import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import EvaluacionForm from "./EvaluacionForm";
import ConfirmModal from "./ConfirmModal";
import EvaluacionTable from "./EvaluacionTable";

// 🔔 toasts y estilos compartidos
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

const API = "http://127.0.0.1:8000/api";

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};

const getId = o =>
    pick(
        o,
        "id",
        "idevaluacion",
        "idEvaluacion",
        "idempleado",
        "idEmpleado",
        "idpostulacion",
        "idPostulacion",
        "pk",
        "codigo"
    );

const getName = (o, type) => {
    if (!o) return "";
    if (type === "empleado") return `${pick(o, "nombre", "nombreCompleto") || ""} ${pick(o, "apellido", "apellidoCompleto") || ""}`.trim();
    if (type === "postulacion") return `${pick(o, "descripcion", "nombreConvocatoria", "nombre") || ""}`;
    return pick(o, "nombre", "descripcion", "label", "nombreCompleto");
};

const toDMY = value => {
    if (!value) return "—";
    const ymd = String(value).slice(0, 10);
    const [yyyy, mm, dd] = ymd.split("-");
    if (!yyyy || !mm || !dd) return value;
    return `${dd}-${mm}-${yyyy}`;
};

const EvaluacionContainer = () => {
    const [form, setForm] = useState({
        idempleado: "",
        modalidad: "",
        fechaevaluacion: "",
        puntajetotal: "",
        observacion: "",
        idpostulacion: "",
        estado: true
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
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
    const [accionEstado, setAccionEstado] = useState(null); // "activar" | "desactivar"

    // catálogos
    const [empleados, setEmpleados] = useState([]);
    const [postulaciones, setPostulaciones] = useState([]);

    // detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetchList();
        fetchEmpleados();
        fetchPostulaciones();
    }, []);

    const getIdUsuario = () => {
        const v = sessionStorage.getItem("idUsuario") || localStorage.getItem("idUsuario");
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/evaluacion/`);
            const rows = Array.isArray(res.data) ? res.data : res.data?.results || [];
            setData(rows);
        } catch (e) {
            console.error("Error al cargar evaluaciones:", e);
            showToast("Error al cargar las evaluaciones", "error");
            setData([]);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const r = await axios.get(`${API}/empleados/`);
            const empleadosData = Array.isArray(r.data) ? r.data : r.data?.results || [];
            // Solo empleados activos
            setEmpleados(empleadosData.filter(emp => emp.estado === true));
        } catch {
            setEmpleados([]);
        }
    };

    const fetchPostulaciones = async () => {
        try {
            const r = await axios.get(`${API}/postulaciones/`);
            const postulacionesData = Array.isArray(r.data) ? r.data : r.data?.results || [];
            // Solo postulaciones activas
            setPostulaciones(postulacionesData.filter(post => post.estado === true));
        } catch {
            setPostulaciones([]);
        }
    };

    // Validaciones específicas
    const validateField = (name, value) => {
        let msg = "";
        if (name === "modalidad") {
            const allowed = ["Presencial", "Virtual", "Híbrida"];
            if (value && !allowed.includes(String(value))) msg = "";
        }
        if (name === "puntajetotal") {
            const n = Number(value);
            if (value !== "" && (!Number.isFinite(n) || n < 0 || n > 100)) msg = "Debe estar entre 0 y 100";
        }
        if (name === "fechaevaluacion") {
            if (value && new Date(value) > new Date()) msg = "No puede ser fecha futura";
        }
        return msg;
    };

    const onChange = e => {
        const { name, value: raw, type, checked } = e.target;
        const val = type === "checkbox" ? checked : raw;

        // Validación específica para puntaje
        if (name === "puntajetotal") {
            if (!/^\d*\.?\d*$/.test(String(raw))) return;
            const n = Number(raw);
            if (raw !== "" && (!Number.isFinite(n) || n < 0 || n > 100)) return;
        }

        setForm(f => ({ ...f, [name]: val }));
        const msg = validateField(name, val);
        setErrors(er => ({ ...er, [name]: msg || false }));
    };

    // Campos requeridos
    const REQUIRED_FIELDS = [
        "modalidad",
        "fechaevaluacion",
        "puntajetotal",
        "observacion"
    ];

    const validateAll = () => {
        const newErrors = {};

        // Campos vacíos -> true (el Form mostrará "Este campo es obligatorio")
        for (const k of REQUIRED_FIELDS) {
            if (form[k] === "" || form[k] == null) newErrors[k] = true;
        }

        // Validaciones específicas
        if (form.puntajetotal !== "") {
            const n = Number(form.puntajetotal);
            if (!Number.isFinite(n) || n < 0 || n > 100) {
                newErrors.puntajetotal = "Debe estar entre 0 y 100";
            }
        }

        if (form.fechaevaluacion && new Date(form.fechaevaluacion) > new Date()) {
            newErrors.fechaevaluacion = "No puede ser fecha futura";
        }

        // Validar que se seleccione empleado O postulación (no ambos)
        if (!form.idempleado && !form.idpostulacion) {
            newErrors.idempleado = "Debe seleccionar empleado o postulación";
            newErrors.idpostulacion = "Debe seleccionar empleado o postulación";
        }

        setErrors(newErrors);
        return { ok: Object.keys(newErrors).length === 0 };
    };

    const toApi = f => {
        return {
            idempleado: f.idempleado ? Number(f.idempleado) : null,
            modalidad: f.modalidad,
            fechaevaluacion: f.fechaevaluacion,
            puntajetotal: Number(f.puntajetotal),
            observacion: f.observacion,
            idpostulacion: f.idpostulacion ? Number(f.idpostulacion) : null,
            estado: true,
            idusuario: getIdUsuario()
        };
    };

    const resetForm = () => {
        setForm({
            idempleado: "",
            modalidad: "",
            fechaevaluacion: "",
            puntajetotal: "",
            observacion: "",
            idpostulacion: "",
            estado: true
        });
        setErrors({});
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const { ok } = validateAll();
        if (!ok) {
            showToast("Corrige los campos pendientes.", "warning");
            return;
        }

        try {
            const payload = toApi(form);
            const isEditing = !!editingId;

            if (isEditing) {
                await axios.put(`${API}/evaluacion/${editingId}/`, payload);
                showToast("Evaluación actualizada correctamente");
            } else {
                await axios.post(`${API}/evaluacion/`, payload);
                showToast("Evaluación registrada correctamente");
            }

            resetForm();
            fetchList();
            setPage(1);
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error al guardar:", err.response?.data || err);
            showToast("Error al registrar/actualizar la evaluación", "error");
        }
    };

    const handleEdit = row => {
        if (row?.estado === false) {
            showToast("No se puede editar una evaluación inactiva", "warning");
            return;
        }

        setForm({
            idempleado: row.idempleado ?? row.idEmpleado ?? "",
            modalidad: row.modalidad ?? "",
            fechaevaluacion: row.fechaevaluacion ?? "",
            puntajetotal: row.puntajetotal ?? "",
            observacion: row.observacion ?? "",
            idpostulacion: row.idpostulacion ?? row.idPostulacion ?? "",
            estado: true
        });
        setErrors({});
        setEditingId(getId(row));
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Confirmación activar/desactivar
    const handleToggle = row => {
        const id = getId(row);
        if (!id) return;
        setEvaluacionSeleccionada(row);
        setAccionEstado(row.estado ? "desactivar" : "activar");
        setShowConfirm(true);
    };

    const confirmarCambioEstado = async () => {
        if (!evaluacionSeleccionada || !accionEstado) return;
        const id = getId(evaluacionSeleccionada);
        const nuevoEstado = accionEstado === "activar";

        try {
            const payload = {
                ...evaluacionSeleccionada,
                estado: nuevoEstado,
                idusuario: getIdUsuario()
            };

            await axios.put(`${API}/evaluacion/${id}/`, payload);
            showToast(nuevoEstado ? "Evaluación activada correctamente" : "Evaluación desactivada correctamente");
            fetchList();
        } catch {
            showToast("Error al cambiar el estado", "error");
        } finally {
            setShowConfirm(false);
            setEvaluacionSeleccionada(null);
            setAccionEstado(null);
        }
    };

    // Función para obtener nombres de catálogos
    const labelFrom = (id, list, type) => {
        if (!id) return "";
        const found = list.find(x => String(getId(x)) === String(id));
        return getName(found, type) || `#${id}`;
    };

    // Búsqueda y filtrado
    const indexable = useMemo(
        () =>
            [...data].sort((a, b) => {
                const idA = getId(a) || 0;
                const idB = getId(b) || 0;
                return idB - idA; // Orden descendente
            }).map(r => {
                const empleado = labelFrom(r.idempleado, empleados, "empleado");
                const postulacion = labelFrom(r.idpostulacion, postulaciones, "postulacion");
                const join = [
                    empleado,
                    r.modalidad,
                    r.fechaevaluacion,
                    r.puntajetotal,
                    r.observacion,
                    postulacion,
                    r.estado ? " activo " : " inactivo "
                ]
                    .filter(Boolean)
                    .join(" | ")
                    .toLowerCase();
                return { raw: r, haystack: join };
            }),
        [data, empleados, postulaciones]
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
        const empleado = labelFrom(row.idempleado ?? row.idEmpleado, empleados, "empleado");
        const postulacion = labelFrom(row.idpostulacion ?? row.idPostulacion, postulaciones, "postulacion");
        setDetalle({ ...row, empleado, postulacion });
        setMostrarDetalle(true);
    };

    return (
        <Layout>
            <SEO title="SERJUS - Evaluaciones" />
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
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Evaluaciones Registradas</h2>

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
                                    placeholder="Buscar en evaluaciones…"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    style={buttonStyles.buscador}
                                />
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setEditingId(null);
                                        setShowForm(true);
                                    }}
                                    style={buttonStyles.nuevo}
                                >
                                    Nueva Evaluación
                                </button>
                            </div>

                            <EvaluacionTable
                                evaluaciones={displayed}
                                handleEdit={handleEdit}
                                handleToggle={handleToggle}
                                paginaActual={page}
                                totalPaginas={totalPages}
                                setPaginaActual={setPage}
                                empleados={empleados}
                                postulaciones={postulaciones}
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
                    <EvaluacionForm
                        form={form}
                        errors={errors}
                        onChange={onChange}
                        handleSubmit={handleSubmit}
                        onClose={() => setShowForm(false)}
                        editingId={editingId}
                        empleados={empleados}
                        postulaciones={postulaciones}
                    />
                )}

                {/* CONFIRM (activar / desactivar) */}
                {showConfirm && (
                    <ConfirmModal
                        evaluacion={evaluacionSeleccionada}
                        mode={accionEstado}
                        onConfirm={confirmarCambioEstado}
                        onCancel={() => {
                            setShowConfirm(false);
                            setEvaluacionSeleccionada(null);
                            setAccionEstado(null);
                        }}
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
                                width: "min(800px,96vw)",
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
                                <h3 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Detalle de Evaluación</h3>
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
                                    Evaluación #{getId(detalle)}
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
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                        gap: 16
                                    }}
                                >
                                    <div
                                        style={{
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
                                            Empleado
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {detalle.empleado || "—"}
                                        </div>
                                    </div>
                                    <div
                                        style={{
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
                                            Postulación
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {detalle.postulacion || "—"}
                                        </div>
                                    </div>
                                    <div
                                        style={{
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
                                            Modalidad
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {detalle.modalidad || "—"}
                                        </div>
                                    </div>
                                    <div
                                        style={{
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
                                            Fecha Evaluación
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {toDMY(detalle.fechaevaluacion)}
                                        </div>
                                    </div>
                                    <div
                                        style={{
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
                                            Puntaje Total
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {detalle.puntajetotal || "—"}
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            gridColumn: "1 / -1",
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
                                            Observación
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", lineHeight: 1.35 }}>
                                            {detalle.observacion || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EvaluacionContainer;