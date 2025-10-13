import React, { useEffect, useState } from "react";
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

// Cambia esta URL por la IP de tu backend en LAN para Android
const API = "http://127.0.0.1:8000/api";

// Utilidad: resolver el id sin importar el nombre de campo que devuelva el backend
const empId = (row) => row?.id ?? row?.idempleado ?? row?.idEmpleado;

const EmpleadosContainer = () => {
    //   Form alineado al backend original (snake/lower en API, camel en UI)
    const [form, setForm] = useState({
        dpi: "",
        nit: "",                 // soporta dígitos o 'C/F'
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
        numerohijos: "",         // "" para que al tipear no tengas que borrar el 0
        estado: true,            // siempre activo
        ididioma: "",            // dropdown con idiomas
        idpueblocultura: "",     // dropdown con pueblos/culturas
        idequipo: "",            // dropdown con equipos
        numeroiggs: "",          // 13 dígitos como DPI (si tu API lo acepta)
        isCF: false,             // check Consumidor Final para NIT
    });

    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState("");
    const [data, setData] = useState([]);
    const [editingId, setEditingId] = useState(null);

    // Paginación y búsqueda
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // Modales
    const [showForm, setShowForm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [showDownload, setShowDownload] = useState(false);

    // Catálogos
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);
    const [equipos, setEquipos] = useState([]);

    useEffect(() => {
        fetchList();
        fetchIdiomas();
        fetchPueblos();
        fetchEquipos();
    }, []);

    // Obtiene el idUsuario desde session/localStorage; fallback 1
    const getIdUsuario = () => {
        const v = sessionStorage.getItem("idUsuario") || localStorage.getItem("idUsuario");
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/empleados/`);
            const rows = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.results)
                    ? res.data.results
                    : [];
            setData(rows);
        } catch (e) {
            console.error("Error al cargar empleados:", e);
            setData([]);
            setMensaje("Error al cargar los empleados");
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
    const fetchEquipos = async () => {
        try {
            const r = await axios.get(`${API}/equipos/`);
            setEquipos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch (e) {
            console.warn("No se pudieron cargar equipos:", e?.response?.data || e);
            setEquipos([]);
        }
    };

    // ================= Validaciones =================
    const emailRegex = /^\S+@\S+\.\S+$/;

    const validateField = (name, value) => {
        let msg = "";

        if (name === "dpi") {
            if (!/^\d*$/.test(value)) msg = "El DPI solo puede contener números.";
            else if (value && value.length !== 13) msg = "El DPI debe tener 13 dígitos.";
        }

        if (name === "numeroiggs") {
            if (!/^\d*$/.test(value)) msg = "El IGGS solo puede contener números.";
            else if (value && value.length !== 13) msg = "El número IGGS debe tener 13 dígitos.";
        }

        if (name === "nit") {
            const v = String(value).trim().toUpperCase().replace(/\s+/g, "");
            if (v === "" && !form.isCF) msg = "El NIT no puede estar vacío (o marca C/F).";
            else if (form.isCF && (v === "" || v === "CF" || v === "C/F")) msg = "";
            else if (!/^\d{1,9}$/.test(v)) msg = "NIT inválido. Use 1-9 dígitos o marque C/F.";
        }

        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (value && !/^\d*$/.test(String(value))) {
                msg = "Solo números.";
            } else if (value && String(value).length !== 8) {
                msg = "Debe tener 8 dígitos.";
            }
        }

        if (name === "email") {
            if (value && !emailRegex.test(value)) msg = "Correo electrónico inválido.";
        }

        if (name === "numerohijos") {
            if (value === "") return "";
            const n = Number(value);
            if (!Number.isFinite(n)) msg = "Número de hijos inválido.";
            else if (n < 0) msg = "No puede ser negativo.";
        }

        if (name === "estadocivil") {
            const allowed = ["Soltero", "Casado", "Divorciado", "Viudo", "Union de hecho", ""];
            if (!allowed.includes(value)) msg = "Estado civil inválido.";
        }

        return msg;
    };

    const onChange = (e) => {
        const { name, value: rawValue, type, checked } = e.target;
        const value = type === "checkbox" ? checked : rawValue;

        if (name === "dpi" || name === "numeroiggs") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 13) return;
        }

        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (rawValue !== "" && !/^\d*$/.test(rawValue)) return;
            if (String(rawValue).length > 8) return;
        }

        if (name === "numerohijos") {
            if (rawValue === "") {
                setForm((f) => ({ ...f, [name]: "" }));
                setErrors((errs) => ({ ...errs, [name]: "" }));
                return;
            }
            if (!/^-?\d*$/.test(rawValue)) return;
            const numeric = Number(rawValue);
            if (numeric < 0) return;
            setForm((f) => ({ ...f, [name]: numeric }));
            setErrors((errs) => ({ ...errs, [name]: validateField(name, numeric) }));
            return;
        }

        if (name === "isCF") {
            const flag = !!checked;
            setForm((f) => ({
                ...f,
                isCF: flag,
                nit: flag ? "" : f.nit,
            }));
            setErrors((errs) => ({ ...errs, nit: "" }));
            return;
        }

        setForm((f) => ({ ...f, [name]: value }));
        setErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
    };

    const validateAll = () => {
        const newErrors = {};
        const requiredFields = [
            "dpi", "nombre", "apellido", "genero",
            "lugarnacimiento", "fechanacimiento", "email",
            "direccion", "estadocivil"
        ];

        if (!form.isCF) requiredFields.push("nit");

        requiredFields.forEach((k) => {
            if (form[k] === "" || form[k] === null || form[k] === undefined) {
                newErrors[k] = "Este campo es obligatorio.";
            }
        });

        ["dpi", "numeroiggs", "telefono", "email", "numerohijos", "estadocivil", "nit"].forEach((k) => {
            const msg = validateField(k, form[k]);
            if (msg) newErrors[k] = newErrors[k] || msg;
        });

        if (form.estado !== true) newErrors.estado = "El empleado debe crearse activo.";

        Object.keys(newErrors).forEach((k) => { if (!newErrors[k]) delete newErrors[k]; });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ========= mapeo UI -> API (snake/lower del backend) =========
    const toApi = (f) => {
        // NIT: si CF, enviar "C/F"
        let nit = String(f.nit || "").trim().toUpperCase().replace(/\s+/g, "");
        if (f.isCF) nit = "C/F";
        if (nit === "CF") nit = "C/F";

        return {
            dpi: f.dpi || "",
            nit,
            nombre: f.nombre || "",
            apellido: f.apellido || "",
            genero: f.genero || "",
            lugarnacimiento: f.lugarnacimiento || "",
            fechanacimiento: f.fechanacimiento || "",
            telefonoresidencial: f.telefonoresidencial || "",
            telefonocelular: f.telefonocelular || "",
            telefonoemergencia: f.telefonoemergencia || "",
            titulonivelmedio: f.titulonivelmedio || "",
            estudiosuniversitarios: f.estudiosuniversitarios || "",
            email: f.email || "",
            direccion: f.direccion || "",
            estadocivil: f.estadocivil || "",
            numerohijos: f.numerohijos === "" ? 0 : Number(f.numerohijos || 0),
            estado: true,                 // siempre activo
            idusuario: getIdUsuario(),    // ✅ requerido por tu backend
            ididioma: f.ididioma || "",
            idpueblocultura: f.idpueblocultura || "",
            idequipo: f.idequipo || "",
            ...(f.numeroiggs ? { numeroiggs: f.numeroiggs } : {}),
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        if (!validateAll()) { setMensaje("Corrige los errores antes de enviar."); return; }

        try {
            const payload = toApi(form);

            if (editingId) {
                await axios.put(`${API}/empleados/${editingId}/`, payload);
                setMensaje("Empleado actualizado correctamente");
            } else {
                await axios.post(`${API}/empleados/`, payload);
                setMensaje("Empleado registrado correctamente");
            }

            resetForm();
            fetchList();
            setPage(1);
            window.scrollTo({ top: 0, behavior: "smooth" });
            setShowForm(false);
        } catch (err) {
            console.error("Error al guardar empleado:", err.response?.data || err);
            setMensaje("Error al registrar/actualizar el empleado");
        }
    };

    const resetForm = () => {
        setForm({
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
            estadocivil: "",
            numerohijos: "",
            estado: true,
            ididioma: "",
            idpueblocultura: "",
            idequipo: "",
            numeroiggs: "",
            isCF: false,
        });
        setErrors({});
        setEditingId(null);
    };

    const handleEdit = (row) => {
        if (row?.estado === false) { setMensaje("No se puede editar un empleado inactivo"); return; }
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
            estado: true, // mantener activo en la UI
            ididioma: row.ididioma ?? "",
            idpueblocultura: row.idpueblocultura ?? "",
            idequipo: row.idequipo ?? "",
            numeroiggs: row.numeroiggs ?? "",
            isCF: (String(row.nit || "").toUpperCase().replace(/\s+/g, "") === "C/F"),
        });
        setErrors({});
        setEditingId(empId(row));
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleToggle = async (row) => {
        // Si decides mantener toggles por registros existentes
        const id = empId(row);
        if (!id) { console.error("ID de empleado no encontrado"); return; }

        if (row.estado) {
            setEmpleadoSeleccionado(row);
            setShowConfirm(true);
        } else {
            try {
                await axios.put(`${API}/empleados/${id}/`, { ...row, estado: true, idusuario: getIdUsuario() });
                setMensaje("Empleado activado correctamente");
                fetchList();
            } catch (e) {
                console.error("Error al activar:", e.response?.data || e);
                setMensaje("Error al cambiar el estado");
            }
        }
    };

    const confirmarDesactivacion = async () => {
        if (!empleadoSeleccionado) return;
        const id = empId(empleadoSeleccionado);
        if (!id) return;

        try {
            await axios.put(`${API}/empleados/${id}/`, {
                ...empleadoSeleccionado,
                estado: false,
                idusuario: getIdUsuario(),
            });
            setMensaje("Empleado desactivado correctamente");
            fetchList();
        } catch (e) {
            console.error("Error al desactivar:", e.response?.data || e);
            setMensaje("Error al desactivar el empleado");
        } finally {
            setShowConfirm(false);
            setEmpleadoSeleccionado(null);
        }
    };

    // --- Filtrado y paginación ---
    const filtered = data.filter((r) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            String(r.nombre ?? "").toLowerCase().includes(s) ||
            String(r.apellido ?? "").toLowerCase().includes(s) ||
            String(r.dpi ?? "").toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina);

    return (
        <Layout>
            <SEO title="Hope – Empleados" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto", paddingLeft: "0px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                                Colaboradores Registrados
                            </h2>
                            {/* Controles superiores */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "15px",
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o DPI"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginRight: "10px",
                                    }}
                                />
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => { setShowForm(true); setEditingId(null); }}
                                        style={{
                                            padding: "10px 20px",
                                            background: "#219ebc",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Nuevo Empleado
                                    </button>
                                    <button
                                        onClick={() => setShowDownload(true)}
                                        style={{
                                            padding: "10px 20px",
                                            background: "#023047",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "600",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Descargar ficha(s)
                                    </button>
                                </div>
                            </div>

                            {/* Tabla */}
                            <EmpleadosTable
                                empleados={displayed}
                                handleEdit={handleEdit}
                                handleToggle={handleToggle}
                                paginaActual={page}
                                totalPaginas={totalPages}
                                setPaginaActual={setPage}
                                idiomas={idiomas}
                                pueblos={pueblos}
                                equipos={equipos}

                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>
                                    Mostrar:
                                </label>
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
                                    style={{
                                        width: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                    }}
                                />
                            </div>

                            {/* Mensajes */}
                            {mensaje && (
                                <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", marginTop: 12, fontWeight: 600 }}>{mensaje}</p>
                            )}
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {/* Form modal */}
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
                    />
                )}

                {/* Confirm modal (si decides mantener desactivación desde UI) */}
                {showConfirm && (
                    <ConfirmModal
                        empleado={empleadoSeleccionado}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}
                {/* Modal para seleccionar y generar PDF */}
                {showDownload && (
                    <FichaDownloadModal
                        empleados={data}
                        onClose={() => setShowDownload(false)}
                        onGenerate={async (seleccionados) => {
                            if (!seleccionados.length) { setMensaje("Selecciona al menos un empleado"); return; }
                            setShowDownload(false);
                            try {
                                await generarFichasPDF(seleccionados, { idiomas, pueblos, equipos }, logo);
                            } catch (e) {
                                console.error(e);
                                setMensaje("Error al generar el PDF");
                            }
                        }}
                    />
                )}
            </div>
        </Layout>
    );
};

export default EmpleadosContainer;
