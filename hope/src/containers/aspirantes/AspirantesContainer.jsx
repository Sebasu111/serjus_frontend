import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import AspiranteForm from "./AspiranteForm";
import ConfirmModal from "../Empleados/ConfirmModal"; // reutilizamos
import AspirantesTable from "./AspirantesTable";

// Ajusta a tu backend (igual que Empleados)
const API = "http://127.0.0.1:8000/api";

// Resolver id independientemente del nombre del campo
const aspId = (row) => row?.id ?? row?.idAspirante ?? row?.idaspirante;

const AspirantesContainer = () => {
    const [form, setForm] = useState({
        dpi: "",
        nit: "",
        nombre: "",
        apellido: "",
        genero: "",
        lugarnacimiento: "",
        fechanacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        estado: true,
        ididioma: "",
        idpueblocultura: "",
        isCF: false,
    });

    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState("");
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // búsqueda + paginación
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // modales
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [aspiranteSeleccionado, setAspiranteSeleccionado] = useState(null);

    // catálogos
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);

    useEffect(() => {
        fetchList();
        fetchIdiomas();
        fetchPueblos();
    }, []);

    const getIdUsuario = () => {
        const v = sessionStorage.getItem("idUsuario") || localStorage.getItem("idUsuario");
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

    const fetchList = async () => {
        try {
            const r = await axios.get(`${API}/aspirantes/`);
            const rows = Array.isArray(r.data) ? r.data : (Array.isArray(r.data?.results) ? r.data.results : []);
            setData(rows);
        } catch (e) {
            console.error("Error al cargar aspirantes:", e);
            setData([]);
            setMensaje("Error al cargar los aspirantes");
        }
    };

    const fetchIdiomas = async () => {
        try {
            const r = await axios.get(`${API}/idiomas/`);
            setIdiomas(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch (e) {
            console.warn("No se pudieron cargar idiomas:", e?.response?.data || e);
            setIdiomas([]);
        }
    };

    const fetchPueblos = async () => {
        try {
            const r = await axios.get(`${API}/pueblocultura/`);
            setPueblos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch (e) {
            console.warn("No se pudieron cargar pueblos/culturas:", e?.response?.data || e);
            setPueblos([]);
        }
    };

    // ===== Validaciones (calcadas y simplificadas) =====
    const emailRegex = /^\S+@\S+\.\S+$/;

    const validateField = (name, value) => {
        let msg = "";
        if (name === "dpi") {
            if (!/^\d*$/.test(value)) msg = "El DPI solo puede contener números.";
            else if (value && value.length !== 13) msg = "El DPI debe tener 13 dígitos.";
        }
        if (name === "nit") {
            const v = String(value).trim().toUpperCase().replace(/\s+/g, "");
            if (v === "" && !form.isCF) msg = "El NIT no puede estar vacío (o marca C/F).";
            else if (form.isCF && (v === "" || v === "CF" || v === "C/F")) msg = "";
            else if (!/^\d{1,9}$/.test(v)) msg = "NIT inválido. Use 1-9 dígitos o marque C/F.";
        }
        if (name === "telefono") {
            if (value && !/^\d*$/.test(String(value))) msg = "El teléfono solo puede contener números.";
            else if (value && String(value).length > 10) msg = "Teléfono: máximo 10 dígitos.";
        }
        if (name === "email") {
            if (value && !emailRegex.test(value)) msg = "Correo electrónico inválido.";
        }
        return msg;
    };

    const onChange = (e) => {
        const { name, value: rawValue, type, checked } = e.target;
        const value = type === "checkbox" ? checked : rawValue;

        if (name === "dpi") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 13) return;
        }
        if (name === "telefono") {
            if (rawValue !== "" && !/^\d*$/.test(rawValue)) return;
            if (String(rawValue).length > 10) return;
        }
        if (name === "isCF") {
            const flag = !!checked;
            setForm((f) => ({ ...f, isCF: flag, nit: flag ? "" : f.nit }));
            setErrors((errs) => ({ ...errs, nit: "" }));
            return;
        }

        setForm((f) => ({ ...f, [name]: value }));
        setErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
    };

    const validateAll = () => {
        const newErrors = {};
        const required = ["dpi", "nombre", "apellido", "genero", "lugarnacimiento", "fechanacimiento", "email", "direccion"];
        if (!form.isCF) required.push("nit");

        required.forEach((k) => {
            if (form[k] === "" || form[k] === null || form[k] === undefined) newErrors[k] = "Este campo es obligatorio.";
        });

        ["dpi", "nit", "telefono", "email"].forEach((k) => {
            const msg = validateField(k, form[k]);
            if (msg) newErrors[k] = newErrors[k] || msg;
        });

        if (form.estado !== true) newErrors.estado = "El aspirante debe crearse activo.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========= mapeo UI -> API; incluye TODAS las variantes que tu backend podría aceptar =========
    const toApi = (f) => {
        // Normalizo NIT y C/F
        let nit = String(f.nit || "").trim().toUpperCase().replace(/\s+/g, "");
        if (f.isCF) nit = "C/F";
        if (nit === "CF") nit = "C/F";

        const base = {
            dpi: f.dpi || "",
            nit,
            nombre: f.nombre || "",
            apellido: f.apellido || "",
            genero: f.genero || "",
            lugarnacimiento: f.lugarnacimiento || "",
            fechanacimiento: f.fechanacimiento || "",
            telefono: f.telefono || "",
            email: f.email || "",
            direccion: f.direccion || "",
            estado: true,
            idusuario: getIdUsuario(),
            ididioma: f.ididioma || "",
            idpueblocultura: f.idpueblocultura || "",
        };

        // Agregamos las claves exactas que tu DRF está pidiendo
        return {
            ...base,

            // ✅ Lo que pide tu backend según el error:
            nombreaspirante: base.nombre,
            apellidoaspirante: base.apellido,

            // ✅ Variantes camel por compatibilidad:
            nombreAspirante: base.nombre,
            apellidoAspirante: base.apellido,
            lugarNacimiento: base.lugarnacimiento,
            fechaNacimiento: base.fechanacimiento,
            idUsuario: base.idusuario,
            idIdioma: base.ididioma,
            idPuebloCultura: base.idpueblocultura,
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        if (!validateAll()) { setMensaje("Corrige los errores antes de enviar."); return; }
        try {
            const payload = toApi(form);
            if (editingId) {
                await axios.put(`${API}/aspirantes/${editingId}/`, payload);
                setMensaje("Aspirante actualizado correctamente");
            } else {
                await axios.post(`${API}/aspirantes/`, payload);
                setMensaje("Aspirante registrado correctamente");
            }
            resetForm();
            fetchList();
            setPage(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShowForm(false);
        } catch (err) {
            console.error("Error al guardar aspirante:", err.response?.data || err);
            setMensaje("Error al registrar/actualizar el aspirante");
        }
    };

    const resetForm = () => {
        setForm({
            dpi: "", nit: "", nombre: "", apellido: "", genero: "",
            lugarnacimiento: "", fechanacimiento: "", telefono: "", email: "",
            direccion: "", estado: true, ididioma: "", idpueblocultura: "", isCF: false,
        });
        setErrors({});
        setEditingId(null);
    };

    const handleEdit = (row) => {
        if (row?.estado === false) { setMensaje("No se puede editar un aspirante inactivo"); return; }
        setForm({
            dpi: row.dpi ?? "",
            nit: row.nit ?? "",
            nombre: row.nombre ?? row.nombreAspirante ?? row.nombreaspirante ?? "",
            apellido: row.apellido ?? row.apellidoAspirante ?? row.apellidoaspirante ?? "",
            genero: row.genero ?? "",
            lugarnacimiento: row.lugarnacimiento ?? row.lugarNacimiento ?? "",
            fechanacimiento: row.fechanacimiento ?? row.fechaNacimiento ?? "",
            telefono: row.telefono ?? "",
            email: row.email ?? "",
            direccion: row.direccion ?? "",
            estado: true,
            ididioma: row.ididioma ?? row.idIdioma ?? "",
            idpueblocultura: row.idpueblocultura ?? row.idPuebloCultura ?? "",
            isCF: (String((row.nit || "")).toUpperCase().replace(/\s+/g, "") === "C/F"),
        });
        setErrors({});
        setEditingId(aspId(row));
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleToggle = async (row) => {
        const id = aspId(row);
        if (!id) return;
        if (row.estado) {
            setAspiranteSeleccionado(row);
            setShowConfirm(true);
        } else {
            try {
                await axios.put(`${API}/aspirantes/${id}/`, { ...row, estado: true, idusuario: getIdUsuario() });
                setMensaje("Aspirante activado correctamente");
                fetchList();
            } catch (e) {
                console.error("Error al activar:", e.response?.data || e);
                setMensaje("Error al cambiar el estado");
            }
        }
    };

    const confirmarDesactivacion = async () => {
        if (!aspiranteSeleccionado) return;
        const id = aspId(aspiranteSeleccionado);
        try {
            await axios.put(`${API}/aspirantes/${id}/`, {
                ...aspiranteSeleccionado,
                estado: false,
                idusuario: getIdUsuario(),
            });
            setMensaje("Aspirante desactivado correctamente");
            fetchList();
        } catch (e) {
            console.error("Error al desactivar:", e.response?.data || e);
            setMensaje("Error al desactivar el aspirante");
        } finally {
            setShowConfirm(false);
            setAspiranteSeleccionado(null);
        }
    };

    const filtered = data.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            String(r.nombre ?? r.nombreAspirante ?? "").toLowerCase().includes(s) ||
            String(r.apellido ?? r.apellidoAspirante ?? "").toLowerCase().includes(s) ||
            String(r.dpi ?? "").toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina);

    return (
        <Layout>
            <SEO title="Hope – Aspirantes" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Aspirantes</h2>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o DPI"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "10px" }}
                                />
                                <button
                                    onClick={() => { setShowForm(true); setEditingId(null); }}
                                    style={{ padding: "10px 20px", background: "#219ebc", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
                                >
                                    Nuevo Aspirante
                                </button>
                            </div>

                            <AspirantesTable
                                aspirantes={displayed}
                                handleEdit={handleEdit}
                                handleToggle={handleToggle}
                                paginaActual={page}
                                totalPaginas={totalPages}
                                setPaginaActual={setPage}
                                idiomas={idiomas}
                                pueblos={pueblos}
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number" min="1" value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPage(1);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    style={{ width: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
                                />
                            </div>

                            {mensaje && (
                                <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", marginTop: 12, fontWeight: 600 }}>
                                    {mensaje}
                                </p>
                            )}
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {showForm && (
                    <AspiranteForm
                        form={form}
                        errors={errors}
                        onChange={onChange}
                        handleSubmit={handleSubmit}
                        onClose={() => setShowForm(false)}
                        editingId={editingId}
                        idiomas={idiomas}
                        pueblos={pueblos}
                    />
                )}

                {showConfirm && (
                    <ConfirmModal
                        empleado={aspiranteSeleccionado}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default AspirantesContainer;