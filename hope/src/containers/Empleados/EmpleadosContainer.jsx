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

const API = "http://127.0.0.1:8000/api";
const empId = (row) => row?.id ?? row?.idempleado ?? row?.idEmpleado;

// Helpers para catálogos
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idequipo", "idEquipo", "idpueblocultura", "idPuebloCultura", "pk", "codigo");
const getName = (o, type) => {
    if (!o) return "";
    if (type === "idioma") return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
    if (type === "pueblo") return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label");
    if (type === "equipo") return pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");
    return pick(o, "nombre", "descripcion", "label");
};

const EmpleadosContainer = () => {
    const [form, setForm] = useState({
        dpi: "", nit: "", nombre: "", apellido: "", genero: "",
        lugarnacimiento: "", fechanacimiento: "", telefonoresidencial: "",
        telefonocelular: "", telefonoemergencia: "", titulonivelmedio: "",
        estudiosuniversitarios: "", email: "", direccion: "", estadocivil: "",
        numerohijos: "", estado: true, ididioma: "", idpueblocultura: "",
        idequipo: "", numeroiggs: "", isCF: false, iniciolaboral: "",
    });
    const [errors, setErrors] = useState({});
    const [mensaje, setMensaje] = useState("");
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
    const [showDownload, setShowDownload] = useState(false);

    // catálogo
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);
    const [equipos, setEquipos] = useState([]);

    // detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetchList(); fetchIdiomas(); fetchPueblos(); fetchEquipos();
    }, []);

    // Autollenado de equipo por ?equipo=ID
    useEffect(() => {
        const equipoParam = new URLSearchParams(window.location.search).get("equipo");
        if (equipoParam) {
            setForm((f) => ({ ...f, idequipo: Number(equipoParam) || "" }));
        }
    }, []);

    const getIdUsuario = () => {
        const v = sessionStorage.getItem("idUsuario") || localStorage.getItem("idUsuario");
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? n : 1;
    };

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/empleados/`);
            const rows = Array.isArray(res.data) ? res.data : (res.data?.results || []);
            setData(rows);
        } catch (e) {
            console.error("Error al cargar empleados:", e);
            setData([]); setMensaje("Error al cargar los empleados");
        }
    };
    const fetchIdiomas = async () => {
        try { const r = await axios.get(`${API}/idiomas/`); setIdiomas(Array.isArray(r.data) ? r.data : (r.data?.results || [])); }
        catch (e) { setIdiomas([]); }
    };
    const fetchPueblos = async () => {
        try { const r = await axios.get(`${API}/pueblocultura/`); setPueblos(Array.isArray(r.data) ? r.data : (r.data?.results || [])); }
        catch (e) { setPueblos([]); }
    };
    const fetchEquipos = async () => {
        try { const r = await axios.get(`${API}/equipos/`); setEquipos(Array.isArray(r.data) ? r.data : (r.data?.results || [])); }
        catch (e) { setEquipos([]); }
    };

    // ======= Validaciones (todos obligatorios) =======
    const emailRegex = /^\S+@\S+\.\S+$/;
    const validateField = (name, value) => {
        let msg = "";
        if (name === "genero") {
            const allowed = ["Masculino", "Femenino", "Otros"];
            if (!allowed.includes(String(value))) msg = "Opción inválida.";
        }
        if (["dpi", "numeroiggs"].includes(name)) {
            if (!/^\d*$/.test(String(value))) msg = "Solo números.";
            else if (String(value).length !== 13) msg = "Debe tener 13 dígitos.";
        }
        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (!/^\d{8}$/.test(String(value))) msg = "Debe tener 8 dígitos.";
        }
        if (name === "nit") {
            const v = String(value).trim().toUpperCase().replace(/\s+/g, "");
            if (form.isCF) { if (!(v === "" || v === "CF" || v === "C/F")) msg = "Si marcas C/F deja vacío."; }
            else if (!/^\d{1,9}$/.test(v)) msg = "Use 1–9 dígitos (o C/F).";
        }
        if (name === "email" && !emailRegex.test(String(value || ""))) msg = "Correo inválido.";
        if (name === "numerohijos") {
            const n = Number(value); if (!Number.isFinite(n) || n < 0) msg = "Valor inválido.";
        }
        if (name === "estadocivil") {
            const allowed = ["Soltero", "Casado", "Divorciado", "Viudo", "Union de hecho"];
            if (!allowed.includes(String(value))) msg = "Opción inválida.";
        }
        return msg;
    };

    const onChange = (e) => {
        const { name, value: raw, type, checked } = e.target;
        const val = type === "checkbox" ? checked : raw;

        // bloqueos numéricos
        if (["dpi", "numeroiggs"].includes(name)) {
            if (!/^\d*$/.test(val)) return; if (String(val).length > 13) return;
        }
        if (["telefonoresidencial", "telefonocelular", "telefonoemergencia"].includes(name)) {
            if (!/^\d*$/.test(String(raw))) return; if (String(raw).length > 8) return;
        }
        if (name === "numerohijos") {
            if (!/^\d*$/.test(String(raw))) return;
        }
        if (name === "isCF") {
            const flag = !!checked;
            setForm((f) => ({ ...f, isCF: flag, nit: flag ? "" : f.nit }));
            setErrors((er) => ({ ...er, nit: "" }));
            return;
        }

        setForm((f) => ({ ...f, [name]: val }));
        setErrors((er) => ({ ...er, [name]: validateField(name, val) }));
    };

    const validateAll = () => {
        const req = [
            "dpi", "nit", "nombre", "apellido", "genero", "lugarnacimiento", "fechanacimiento",
            "telefonoresidencial", "telefonocelular", "telefonoemergencia", "titulonivelmedio",
            "estudiosuniversitarios", "email", "direccion", "estadocivil", "numerohijos",
            "ididioma", "idpueblocultura", "idequipo", "numeroiggs", "iniciolaboral"
        ];
        const newErrors = {};
        for (const k of req) if (form[k] === "" || form[k] == null) newErrors[k] = "Este campo es obligatorio.";
        // si CF, nit puede ir vacío (se enviará C/F)
        if (form.isCF) delete newErrors.nit;

        // validaciones específicas
        [
            "dpi", "numeroiggs", "telefonoresidencial", "telefonocelular", "telefonoemergencia",
            "email", "numerohijos", "estadocivil", "nit"
        ].forEach((k) => { const m = validateField(k, form[k]); if (m) newErrors[k] = newErrors[k] || m; });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toApi = (f) => {
        let nit = String(f.nit || "").trim().toUpperCase().replace(/\s+/g, "");
        if (f.isCF) nit = "C/F";
        if (nit === "CF") nit = "C/F";
        const startISO = f.iniciolaboral ? `${f.iniciolaboral}T00:00:00` : null;
        return {
            dpi: f.dpi, nit, nombre: f.nombre, apellido: f.apellido, genero: f.genero,
            lugarnacimiento: f.lugarnacimiento, fechanacimiento: f.fechanacimiento,
            telefonoresidencial: f.telefonoresidencial, telefonocelular: f.telefonocelular,
            telefonoemergencia: f.telefonoemergencia, titulonivelmedio: f.titulonivelmedio,
            estudiosuniversitarios: f.estudiosuniversitarios, email: f.email, direccion: f.direccion,
            estadocivil: f.estadocivil, numerohijos: Number(f.numerohijos || 0), estado: true,
            idusuario: getIdUsuario(),
            ididioma: Number(f.ididioma), idpueblocultura: Number(f.idpueblocultura),
            idequipo: Number(f.idequipo), numeroiggs: f.numeroiggs,
            inicioLaboral: startISO,
        };
    };

    const resetForm = () => {
        const equipoParam = new URLSearchParams(window.location.search).get("equipo");
        setForm({
            dpi: "", nit: "", nombre: "", apellido: "", genero: "",
            lugarnacimiento: "", fechanacimiento: "", telefonoresidencial: "",
            telefonocelular: "", telefonoemergencia: "", titulonivelmedio: "",
            estudiosuniversitarios: "", email: "", direccion: "", estadocivil: "",
            numerohijos: "", estado: true, ididioma: "", idpueblocultura: "",
            idequipo: equipoParam ? Number(equipoParam) : "", numeroiggs: "", isCF: false,
            iniciolaboral: "",
        });
        setErrors({}); setEditingId(null);
    };

    const handleGeneratePDF = async (seleccion) => {
        try {
            // catálogos para nombres correctos en el PDF
            const catalogos = { idiomas, pueblos, equipos };
            await generarFichasPDF(seleccion, catalogos, logo);
            setShowDownload(false);
        } catch (e) {
            console.error(e);
            setMensaje("No se pudo generar el PDF. Revisa la consola para más detalles.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setMensaje("");
        if (!validateAll()) { setMensaje("Corrige los errores antes de enviar."); return; }
        try {
            const payload = toApi(form);
            const isEditing = !!editingId;

            if (!isEditing) {
                const exists = data.some(r => String(r.email || "").toLowerCase().trim() === String(payload.email || "").toLowerCase().trim());
                if (exists) { setErrors((p) => ({ ...p, email: "Este correo ya está registrado." })); setMensaje("Corrige los errores antes de enviar."); return; }
            }

            if (isEditing) {
                await axios.put(`${API}/empleados/${editingId}/`, payload);
                setMensaje("Empleado actualizado correctamente");
            } else {
                await axios.post(`${API}/empleados/`, payload);
                setMensaje("Empleado registrado correctamente");
            }
            resetForm(); fetchList(); setPage(1); setShowForm(false); window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            console.error("Error al guardar:", err.response?.data || err);
            setMensaje("Error al registrar/actualizar el empleado");
        }
    };

    const handleEdit = (row) => {
        if (row?.estado === false) { setMensaje("No se puede editar un empleado inactivo"); return; }
        setForm({
            dpi: row.dpi ?? "", nit: row.nit ?? "", nombre: row.nombre ?? "", apellido: row.apellido ?? "", genero: row.genero ?? "",
            lugarnacimiento: row.lugarnacimiento ?? "", fechanacimiento: row.fechanacimiento ?? "",
            telefonoresidencial: row.telefonoresidencial ?? row.telefonoResidencial ?? "",
            telefonocelular: row.telefonocelular ?? row.telefonoCelular ?? "",
            telefonoemergencia: row.telefonoemergencia ?? row.telefonoEmergencia ?? "",
            titulonivelmedio: row.titulonivelmedio ?? row.tituloNivelMedio ?? "",
            estudiosuniversitarios: row.estudiosuniversitarios ?? row.estudiosUniversitarios ?? "",
            email: row.email ?? "", direccion: row.direccion ?? "", estadocivil: row.estadocivil ?? "",
            numerohijos: row.numerohijos ?? "", estado: true,
            ididioma: row.ididioma ?? "", idpueblocultura: row.idpueblocultura ?? "",
            idequipo: row.idequipo ?? "", numeroiggs: row.numeroiggs ?? "",
            isCF: (String(row.nit || "").toUpperCase().replace(/\s+/g, "") === "C/F"),
            iniciolaboral: (row.inicioLaboral || "").slice(0, 10),
        });
        setErrors({}); setEditingId(empId(row)); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleToggle = async (row) => {
        const id = empId(row); if (!id) return;
        if (row.estado) { setEmpleadoSeleccionado(row); setShowConfirm(true); }
        else {
            try {
                await axios.put(`${API}/empleados/${id}/`, { ...row, estado: true, idusuario: getIdUsuario() });
                setMensaje("Empleado activado correctamente"); fetchList();
            } catch { setMensaje("Error al cambiar el estado"); }
        }
    };
    const confirmarDesactivacion = async () => {
        if (!empleadoSeleccionado) return;
        const id = empId(empleadoSeleccionado);
        try {
            await axios.put(`${API}/empleados/${id}/`, { ...empleadoSeleccionado, estado: false, idusuario: getIdUsuario() });
            setMensaje("Empleado desactivado correctamente"); fetchList();
        } catch { setMensaje("Error al desactivar el empleado"); }
        finally { setShowConfirm(false); setEmpleadoSeleccionado(null); }
    };

    // ===== BÚSQUEDA TOTAL =====
    const labelFrom = (id, list, type) => {
        if (!id) return "";
        const found = list.find((x) => String(getId(x)) === String(id));
        return getName(found, type) || `#${id}`;
    };
    const indexable = useMemo(() =>
        data.map((r) => {
            const idioma = labelFrom(r.ididioma, idiomas, "idioma");
            const pueblo = labelFrom(r.idpueblocultura, pueblos, "pueblo");
            const equipo = labelFrom(r.idequipo, equipos, "equipo");
            const join = [
                r.nombre, r.apellido, r.genero, r.dpi, r.nit, r.numeroiggs,
                r.lugarnacimiento, r.fechanacimiento, r.estadocivil, r.numerohijos,
                r.telefonoresidencial, r.telefonocelular, r.telefonoemergencia,
                r.titulonivelmedio, r.estudiosuniversitarios, r.email, r.direccion,
                idioma, pueblo, equipo, (r.estado ? "activo" : "inactivo")
            ].filter(Boolean).join(" | ").toLowerCase();
            return { raw: r, haystack: join };
        }), [data, idiomas, pueblos, equipos]
    );

    const filtered = !search ? indexable : indexable.filter(({ haystack }) =>
        haystack.includes(search.trim().toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina).map(x => x.raw);

    // DPI -> Detalle
    const onVerDetalle = (row) => {
        const idioma = labelFrom(row.ididioma, idiomas, "idioma");
        const pueblo = labelFrom(row.idpueblocultura, pueblos, "pueblo");
        const equipo = labelFrom(row.idequipo, equipos, "equipo");
        setDetalle({ ...row, idioma, pueblo, equipo });
        setMostrarDetalle(true);
    };

    const equipoBloqueado = !!(new URLSearchParams(window.location.search).get("equipo")) || !!editingId;

    return (
        <Layout>
            <SEO title=" Empleados" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: "250px" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "900px", width: "100%", margin: "0 auto", paddingLeft: "0px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Colaboradores Registrados</h2>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Buscar en todos los campos…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "10px" }}
                                />
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
                                        style={{ padding: "10px 20px", background: "#219ebc", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                                    >
                                        Nuevo Empleado
                                    </button>
                                    <button
                                        onClick={() => setShowDownload(true)}
                                        style={{ padding: "10px 20px", background: "#023047", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}
                                    >
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
                                idiomas={idiomas}
                                pueblos={pueblos}
                                equipos={equipos}
                                onVerDetalle={onVerDetalle}   // << DPI abre modal
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number" min="1" value={elementosPorPagina}
                                    onChange={(e) => { const n = Number(e.target.value.replace(/\D/g, "")) || 1; setElementosPorPagina(n); setPage(1); }}
                                    onFocus={(e) => e.target.select()}
                                    style={{ width: 80, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
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
                        lockEquipo={equipoBloqueado}   // << bloquear equipo
                    />
                )}

                {/* CONFIRM */}
                {showConfirm && (
                    <ConfirmModal
                        empleado={empleadoSeleccionado}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setShowConfirm(false)}
                    />
                )}

                {/* FICHA */}
                {showDownload && (
                    <FichaDownloadModal
                        empleados={filtered.map(x => x.raw)}   // usa la lista filtrada del buscador
                        onClose={() => setShowDownload(false)}
                        onGenerate={handleGeneratePDF}
                    />
                )}

                {/* DETALLE */}
                {mostrarDetalle && detalle && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 4000 }}>
                        <div style={{ width: "min(900px,96vw)", maxHeight: "92vh", overflow: "auto", background: "#fff", boxShadow: "0 0 30px rgba(0,0,0,.25)", padding: 24, borderRadius: 14 }}>
                            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Detalle del Colaborador</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, lineHeight: 1.6 }}>
                                <div><strong>Nombre:</strong> {detalle.nombre} {detalle.apellido}</div>
                                <div><strong>Género:</strong> {detalle.genero}</div>
                                <div><strong>DPI:</strong> {detalle.dpi}</div>
                                <div><strong>NIT:</strong> {String(detalle.nit).toUpperCase()}</div>
                                <div><strong>IGGS:</strong> {detalle.numeroiggs}</div>
                                <div><strong>Lugar nacimiento:</strong> {detalle.lugarnacimiento}</div>
                                <div><strong>Fecha nacimiento:</strong> {String(detalle.fechanacimiento).slice(0, 10)}</div>
                                <div><strong>Estado civil:</strong> {detalle.estadocivil}</div>
                                <div><strong># Hijos:</strong> {detalle.numerohijos ?? 0}</div>
                                <div><strong>Tel. residencial:</strong> {detalle.telefonoresidencial}</div>
                                <div><strong>Tel. celular:</strong> {detalle.telefonocelular}</div>
                                <div><strong>Tel. emergencia:</strong> {detalle.telefonoemergencia}</div>
                                <div style={{ gridColumn: "1 / -1" }}><strong>Dirección:</strong> {detalle.direccion}</div>
                                <div><strong>Título medio:</strong> {detalle.titulonivelmedio}</div>
                                <div><strong>Estudios univ.:</strong> {detalle.estudiosuniversitarios}</div>
                                <div><strong>Email:</strong> {detalle.email}</div>
                                <div><strong>Idioma:</strong> {detalle.idioma || ""}</div>
                                <div><strong>Pueblo/Cultura:</strong> {detalle.pueblo || ""}</div>
                                <div><strong>Equipo:</strong> {detalle.equipo || ""}</div>
                                <div><strong>Estado:</strong> <span style={{ color: detalle.estado ? "green" : "red", fontWeight: 700 }}>{detalle.estado ? "Activo" : "Inactivo"}</span></div>
                                <div><strong>Fecha inicio:</strong> {String(detalle.inicioLaboral || "").slice(0, 10)}</div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                <button onClick={() => setMostrarDetalle(false)} style={{ background: "#219ebc", color: "#fff", padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
                                    Cerrar
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
