import React, { useEffect, useState } from "react";
import axios from "axios";

// Si ya usas estos en empleados, puedes reusar tu Layout/Header/Footer/SEO:
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import AspiranteForm from "./AspiranteForm";
import AspirantesTable from "./AspirantesTable";
import ConfirmModalAspirante from "./ConfirmModalAspirante";

// Usa la misma base que en EmpleadosContainer
const API = "http://127.0.0.1:8000/api";

// resolver id flexible
const aspId = (row) => row?.idaspirante ?? row?.idAspirante ?? row?.id;

const AspirantesContainer = () => {
    const [form, setForm] = useState({
        dpi: "",
        nit: "",
        nombre: "",
        apellido: "",
        genero: "",
        fechanacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        ididioma: "",
        idpueblocultura: "",
        estado: true,
        isCF: false,
    });

    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState("");
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // catálogos
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);

    // UI
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [aspiranteSel, setAspiranteSel] = useState(null);

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
            const res = await axios.get(`${API}/aspirantes/`);
            const rows = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.results) ? res.data.results : [];
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

    // ===== Validaciones (simplificadas) =====
    const emailRegex = /^\S+@\S+\.\S+$/;
    const validateField = (name, value) => {
        let msg = "";
        if (name === "dpi") {
            if (!/^\d*$/.test(value)) msg = "El DPI solo puede contener números.";
            else if (value && value.length !== 13) msg = "El DPI debe tener 13 dígitos.";
        }
        if (name === "nit") {
            const v = String(value).trim().toUpperCase().replace(/\s+/g, "");
            if (form.isCF && (v === "" || v === "CF" || v === "C/F")) msg = "";
            else if (!form.isCF && v === "") msg = "El NIT no puede estar vacío (o marca C/F).";
            else if (!form.isCF && !/^\d{1,9}$/.test(v)) msg = "NIT inválido. Use 1-9 dígitos o marque C/F.";
        }
        if (name === "telefono") {
            if (value && !/^\d*$/.test(String(value))) msg = "Solo números.";
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
        }
        if (name === "isCF") {
            const flag = !!checked;
            setForm((f) => ({ ...f, isCF: flag, nit: flag ? "" : f.nit }));
            setErrors((er) => ({ ...er, nit: "" }));
            return;
        }

        setForm((f) => ({ ...f, [name]: value }));
        setErrors((er) => ({ ...er, [name]: validateField(name, value) }));
    };

    const validateAll = () => {
        const req = ["dpi", "nombre", "apellido", "genero", "fechanacimiento", "email", "telefono", "direccion"];
        const newErrors = {};
        req.forEach((k) => {
            if (form[k] === "" || form[k] === null || form[k] === undefined) newErrors[k] = "Este campo es obligatorio.";
        });
        if (!form.isCF && (form.nit ?? "") === "") newErrors.nit = "Este campo es obligatorio (o marque C/F).";

        ["dpi", "nit", "telefono", "email"].forEach((k) => {
            const msg = validateField(k, form[k]);
            if (msg) newErrors[k] = newErrors[k] || msg;
        });

        if (form.estado !== true) newErrors.estado = "El aspirante debe crearse activo.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===== Mapeo UI -> API (aspirante) =====
    const toApi = (f) => {
        let nit = String(f.nit || "").trim().toUpperCase().replace(/\s+/g, "");
        if (f.isCF) nit = "C/F";
        if (nit === "CF") nit = "C/F";

        return {
            nombreaspirante: f.nombre || "",
            apellidoaspirante: f.apellido || "",
            genero: f.genero || "",
            dpi: f.dpi || "",
            nit,
            fechanacimiento: f.fechanacimiento || "",
            telefono: f.telefono || "",
            email: f.email || "",
            direccion: f.direccion || "",
            estado: true,
            idusuario: getIdUsuario(),
            ididioma: f.ididioma || null,
            idpueblocultura: f.idpueblocultura || null,
        };
    };

    const resetForm = () => {
        setForm({
            dpi: "",
            nit: "",
            nombre: "",
            apellido: "",
            genero: "",
            fechanacimiento: "",
            telefono: "",
            email: "",
            direccion: "",
            ididioma: "",
            idpueblocultura: "",
            estado: true,
            isCF: false,
        });
        setErrors({});
        setEditingId(null);
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
            setShowForm(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error al guardar aspirante:", err.response?.data || err);
            setMensaje("Error al registrar/actualizar el aspirante");
        }
    };

    const handleEdit = (row) => {
        if (row?.estado === false) { setMensaje("No se puede editar un aspirante inactivo"); return; }
        setForm({
            dpi: row.dpi ?? "",
            nit: row.nit ?? "",
            nombre: row.nombreaspirante ?? row.nombreAspirante ?? "",
            apellido: row.apellidoaspirante ?? row.apellidoAspirante ?? "",
            genero: row.genero ?? "",
            fechanacimiento: row.fechanacimiento ?? row.fechaNacimiento ?? "",
            telefono: row.telefono ?? "",
            email: row.email ?? "",
            direccion: row.direccion ?? "",
            ididioma: row.ididioma ?? row.idIdioma ?? "",
            idpueblocultura: row.idpueblocultura ?? row.idPuebloCultura ?? "",
            estado: true,
            isCF: (String(row.nit || "").toUpperCase().replace(/\s+/g, "") === "C/F"),
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
            setAspiranteSel(row);
            setShowConfirm(true);
        } else {
            try {
                await axios.put(`${API}/aspirantes/${id}/`, { ...toApi(form), ...row, estado: true, idusuario: getIdUsuario() });
                setMensaje("Aspirante activado correctamente");
                fetchList();
            } catch (e) {
                console.error("Error al activar:", e.response?.data || e);
                setMensaje("Error al cambiar el estado");
            }
        }
    };

    const confirmarDesactivacion = async () => {
        if (!aspiranteSel) return;
        const id = aspId(aspiranteSel);
        try {
            await axios.put(`${API}/aspirantes/${id}/`, { ...aspiranteSel, estado: false, idusuario: getIdUsuario() });
            setMensaje("Aspirante desactivado correctamente");
            fetchList();
        } catch (e) {
            console.error("Error al desactivar:", e.response?.data || e);
            setMensaje("Error al desactivar el aspirante");
        } finally {
            setShowConfirm(false);
            setAspiranteSel(null);
        }
    };

    // Filtro + paginación
    const filtered = data.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            String(r.nombreaspirante ?? r.nombreAspirante ?? "").toLowerCase().includes(s) ||
            String(r.apellidoaspirante ?? r.apellidoAspirante ?? "").toLowerCase().includes(s) ||
            String(r.dpi ?? "").toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina);

    return (
        <Layout>
            <SEO title=" Aspirantes" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
                            <h2 style={{ marginBottom: 20, textAlign: "center" }}>Aspirantes Registrados</h2>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o DPI"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc", marginRight: 10 }}
                                />
                                <button
                                    onClick={() => { setShowForm(true); setEditingId(null); }}
                                    style={{ padding: "10px 20px", background: "#219ebc", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
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

                            <div style={{ marginTop: 20, textAlign: "center" }}>
                                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPage(1);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    style={{ width: 80, padding: 10, borderRadius: 6, border: "1px solid #ccc", textAlign: "center" }}
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
                    <ConfirmModalAspirante
                        aspirante={aspiranteSel}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}
            </div>
        </Layout>
    );
};

export default AspirantesContainer;
