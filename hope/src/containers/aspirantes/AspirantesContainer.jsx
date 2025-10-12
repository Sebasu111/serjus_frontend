import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../utils/toast.js";

import AspiranteForm from "./AspiranteForm.jsx";
import AspirantesTable from "./AspirantesTable.jsx";
import ConfirmModalAspirante from "./ConfirmModalAspirante.jsx";

const API_ASPIRANTES = "http://127.0.0.1:8000/api/aspirantes/";
const API_IDIOMAS = "http://127.0.0.1:8000/api/idiomas/";
const API_PUEBLOS = "http://127.0.0.1:8000/api/puebloscultura/";

const AspirantesContainer = () => {
    // Estado principal
    const [aspirantes, setAspirantes] = useState([]);
    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);

    // Filtros / paginación
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // Form / edición
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [aspiranteEditable, setAspiranteEditable] = useState(true); // controla habilitar inputs (depende de estado)

    // Confirmación eliminar/desactivar
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [aspiranteSeleccionado, setAspiranteSeleccionado] = useState(null);

    // Campos del formulario
    const [form, setForm] = useState({
        nombreAspirante: "",
        apellidoAspirante: "",
        nit: "",
        dpi: "",
        genero: "",
        email: "",
        fechaNacimiento: "",
        telefono: "",
        direccion: "",
        estado: true,
        idIdioma: "",
        idPuebloCultura: "",
    });

    useEffect(() => {
        fetchAspirantes();
        fetchIdiomas();
        fetchPueblos();
    }, []);

    const fetchAspirantes = async () => {
        try {
            const res = await axios.get(API_ASPIRANTES);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            setAspirantes(data);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar aspirantes", "error");
        }
    };

    const fetchIdiomas = async () => {
        try {
            const res = await axios.get(API_IDIOMAS);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            setIdiomas(data);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar idiomas", "error");
        }
    };

    const fetchPueblos = async () => {
        try {
            const res = await axios.get(API_PUEBLOS);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            setPueblos(data);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar pueblo/cultura", "error");
        }
    };

    const limpiarForm = () => {
        setForm({
            nombreAspirante: "",
            apellidoAspirante: "",
            nit: "",
            dpi: "",
            genero: "",
            email: "",
            fechaNacimiento: "",
            telefono: "",
            direccion: "",
            estado: true,
            idIdioma: "",
            idPuebloCultura: "",
        });
        setEditingId(null);
        setAspiranteEditable(true);
    };

    const abrirNuevo = () => {
        limpiarForm();
        setMostrarFormulario(true);
    };

    const handleEdit = (asp) => {
        if (!asp.estado) {
            showToast("No se puede editar un aspirante inactivo");
            return;
        }
        setForm({
            nombreAspirante: asp.nombreAspirante || "",
            apellidoAspirante: asp.apellidoAspirante || "",
            nit: asp.nit || "",
            dpi: asp.dpi || "",
            genero: asp.genero || "",
            email: asp.email || "",
            fechaNacimiento: asp.fechaNacimiento || "",
            telefono: asp.telefono || "",
            direccion: asp.direccion || "",
            estado: Boolean(asp.estado),
            idIdioma: asp.idIdioma ?? "",
            idPuebloCultura: asp.idPuebloCultura ?? "",
        });
        setEditingId(asp.idAspirante);
        setAspiranteEditable(Boolean(asp.estado));
        setMostrarFormulario(true);
    };

    const handleDelete = (asp) => {
        setAspiranteSeleccionado(asp);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacion = async () => {
        if (!aspiranteSeleccionado) return;
        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API_ASPIRANTES}${aspiranteSeleccionado.idAspirante}/`, {
                ...aspiranteSeleccionado,
                estado: false,
                idUsuario,
            });
            showToast("Aspirante desactivado correctamente");
            fetchAspirantes();
        } catch (err) {
            console.error(err);
            showToast("Error al desactivar aspirante", "error");
        } finally {
            setMostrarConfirmacion(false);
            setAspiranteSeleccionado(null);
        }
    };

    const handleActivate = async (id) => {
        try {
            const asp = aspirantes.find((a) => a.idAspirante === id);
            if (!asp) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API_ASPIRANTES}${id}/`, { ...asp, estado: true, idUsuario });
            showToast("Aspirante activado correctamente");
            fetchAspirantes();
        } catch (err) {
            console.error(err);
            showToast("Error al activar aspirante", "error");
        }
    };

    // Validación duplicados: por DPI o NIT
    const existeDuplicado = (list, actual, editingId) => {
        const dpi = (actual.dpi || "").trim();
        const nit = (actual.nit || "").trim();
        return list.some(
            (a) =>
                a.idAspirante !== editingId &&
                (a.dpi?.trim() === dpi || (nit && a.nit?.trim() === nit))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación duplicado (dpi / nit)
        if (existeDuplicado(aspirantes, form, editingId)) {
            showToast("Ya existe un aspirante con ese DPI o NIT", "warning");
            return;
        }

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const payload = {
                ...form,
                idUsuario,
                // Asegurar tipos correctos
                estado: Boolean(form.estado),
                idIdioma: form.idIdioma ? Number(form.idIdioma) : null,
                idPuebloCultura: form.idPuebloCultura ? Number(form.idPuebloCultura) : null,
            };

            if (editingId) {
                await axios.put(`${API_ASPIRANTES}${editingId}/`, payload);
                showToast("Aspirante actualizado correctamente");
            } else {
                await axios.post(API_ASPIRANTES, payload);
                showToast("Aspirante registrado correctamente");
            }

            limpiarForm();
            setMostrarFormulario(false);
            fetchAspirantes();
        } catch (err) {
            const apiErr = err.response?.data;
            const detalle =
                (apiErr &&
                    (apiErr.detail ||
                        apiErr.dpi?.[0] ||
                        apiErr.nit?.[0] ||
                        apiErr.email?.[0] ||
                        JSON.stringify(apiErr))) ||
                "desconocido";
            console.error("POST/PUT /aspirantes error:", apiErr || err);
            showToast(`Error al guardar aspirante: ${detalle}`, "error");
        }
    };

    // Filtro y paginación
    const aspirantesFiltrados = aspirantes.filter((a) => {
        const t = busqueda.toLowerCase().trim();
        const estadoTxt = a.estado ? "activo" : "inactivo";
        return (
            a.nombreAspirante?.toLowerCase().includes(t) ||
            a.apellidoAspirante?.toLowerCase().includes(t) ||
            a.nit?.toLowerCase().includes(t) ||
            a.dpi?.toLowerCase().includes(t) ||
            a.email?.toLowerCase().includes(t) ||
            estadoTxt.startsWith(t)
        );
    });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const pageData = aspirantesFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(aspirantesFiltrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Aspirantes" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1100px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Aspirantes</h2>

                            {/* Buscador + Nuevo */}
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
                                    placeholder="Buscar por nombre, apellido, DPI, NIT, correo..."
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
                                <button
                                    onClick={abrirNuevo}
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
                                    Nuevo Aspirante
                                </button>
                            </div>

                            <AspirantesTable
                                aspirantes={pageData}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleActivate={handleActivate}
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                            {/* Selector tamaño de página */}
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPaginaActual(1);
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
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <AspiranteForm
                        form={form}
                        setForm={setForm}
                        aspiranteEditable={aspiranteEditable}
                        idiomas={idiomas}
                        pueblos={pueblos}
                        editingId={editingId}
                        handleSubmit={handleSubmit}
                        onClose={() => setMostrarFormulario(false)}
                    />
                )}

                {mostrarConfirmacion && (
                    <ConfirmModalAspirante
                        aspirante={aspiranteSeleccionado}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setMostrarConfirmacion(false)}
                    />
                )}

                <ToastContainer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default AspirantesContainer;
