import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import InduccionForm from "./InduccionForm";
import ConfirmModal from "./ConfirmModal";
import InduccionTable from "./InduccionTable";
import GestionarDocumentosModal from "./GestionarDocumentosModal";
import DocumentosAsignadosModal from "./DocumentosAsignadosModal";

const API = "http://127.0.0.1:8000/api/inducciones/";

const InduccionContainer = () => {
    const [nombre, setNombre] = useState("");
    const [fechainicio, setFechaInicio] = useState("");
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [activoEditando, setActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [seleccionado, setSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    const [mostrarGestionarDocumentos, setMostrarGestionarDocumentos] = useState(false);
    const [induccionSeleccionada, setInduccionSeleccionada] = useState(null);

    const [mostrarDocumentosAsignados, setMostrarDocumentosAsignados] = useState(false);
    const [induccionParaDocumentos, setInduccionParaDocumentos] = useState(null);

    useEffect(() => {
        fetchAll();
        const fechaActual = new Date().toISOString().split("T")[0];
        setFechaInicio(fechaActual);
    }, []);

    const fetchAll = async () => {
        try {
            const res = await axios.get(API);
            const raw = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            const data = raw.map(r => ({
                idinduccion: r.idinduccion ?? r.id,
                nombre: r.nombre,
                fechainicio: r.fechainicio ?? r.fechaInicio,
                estado: r.estado
            }));
            setItems(data);
        } catch (e) {
            console.error(e);
            showToast("Error al cargar Inducciones", "error");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const yaExiste = items.some(
                i =>
                    (i.nombre || "").trim().toLowerCase() === nombre.trim().toLowerCase() &&
                    i.idinduccion !== editingId
            );
            if (yaExiste) {
                showToast("Ya existe una inducción con ese nombre", "warning");
                return;
            }

            const fechaActual = new Date().toISOString().split("T")[0];
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));

            const payload = {
                nombre,
                fechainicio: editingId ? fechainicio : fechaActual,
                estado: Boolean(activoEditando),
                idusuario: idUsuario
            };

            if (editingId) {
                await axios.put(`${API}${editingId}/`, payload);
            } else {
                await axios.post(API, payload);
            }

            showToast(editingId ? "Actualizado correctamente" : "Registrado correctamente");
            setNombre("");
            setEditingId(null);
            setActivoEditando(true);
            setMostrarFormulario(false);
            fetchAll();
        } catch (error) {
            const apiErr = error.response?.data;
            const detalle =
                (apiErr && (apiErr.fechainicio?.[0] || apiErr.detail || JSON.stringify(apiErr))) || "desconocido";
            console.error("POST/PUT induccion error:", apiErr || error);
            showToast(`Error al guardar: ${detalle}`, "error");
        }
    };

    const handleEdit = row => {
        if (!row.estado) {
            showToast("No se puede editar un registro inactivo");
            return;
        }
        setNombre(row.nombre || "");
        setFechaInicio(row.fechainicio || "");
        setEditingId(row.idinduccion);
        setActivoEditando(row.estado);
        setMostrarFormulario(true);
    };

    const handleDelete = row => {
        setSeleccionado(row);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacion = async () => {
        if (!seleccionado) return;
        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API}${seleccionado.idinduccion}/`, {
                nombre: seleccionado.nombre,
                fechainicio: seleccionado.fechainicio,
                estado: false,
                idusuario: idUsuario
            });
            showToast("Desactivado correctamente");
            fetchAll();
        } catch (e) {
            console.error(e);
            showToast("Error al desactivar", "error");
        } finally {
            setMostrarConfirmacion(false);
            setSeleccionado(null);
        }
    };

    const handleActivate = async id => {
        try {
            const row = items.find(i => i.idinduccion === id);
            if (!row) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API}${id}/`, {
                nombre: row.nombre,
                fechainicio: row.fechainicio,
                estado: true,
                idusuario: idUsuario
            });
            showToast("Activado correctamente");
            fetchAll();
        } catch (e) {
            console.error(e);
            showToast("Error al activar", "error");
        }
    };

    const handleGestionarDocumentos = induccion => {
        setInduccionSeleccionada(induccion);
        setMostrarGestionarDocumentos(true);
    };

    const handleVerDetalle = induccion => {
        setInduccionParaDocumentos(induccion);
        setMostrarDocumentosAsignados(true);
    };

    const formatDateForDisplay = dateString => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES");
    };

    const filtrados = [...items]

  .sort((a, b) => {

    const fechaA =
      new Date(a.createdAt || a.created_at || a.fechainicio || "1900-01-01").getTime();
    const fechaB =
      new Date(b.createdAt || b.created_at || b.fechainicio || "1900-01-01").getTime();

    if (isNaN(fechaA) && isNaN(fechaB)) return 0;
    if (isNaN(fechaA)) return 1; 
    if (isNaN(fechaB)) return -1;

    return fechaB > fechaA ? -1 : fechaB < fechaA ? 1 : 0;
  })
  .filter((i) => {
    const t = busqueda.toLowerCase().trim();
    const n = i.nombre?.toLowerCase() || "";
    const fechaInicioStr = formatDateForDisplay(i.fechainicio).toLowerCase();
    const e = i.estado ? "activo" : "inactivo";
    return n.includes(t) || fechaInicioStr.includes(t) || e.startsWith(t);
  });

    const indexLast = paginaActual * elementosPorPagina;
    const indexFirst = indexLast - elementosPorPagina;
    const paginados = filtrados.slice(indexFirst, indexLast);
    const totalPaginas = Math.ceil(filtrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Inducciones" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
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
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Inducciones</h2>

                            {/* Buscador */}
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
                                    placeholder="Buscar nombre / fecha inicio / estado..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginRight: "10px"
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        setNombre("");
                                        const fechaActual = new Date().toISOString().split("T")[0];
                                        setFechaInicio(fechaActual);
                                        setEditingId(null);
                                        setActivoEditando(true);
                                        setMostrarFormulario(true);
                                    }}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Nueva Inducción
                                </button>
                            </div>

                            {/* Tabla principal */}
                            <InduccionTable
                                items={paginados}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleActivate={handleActivate}
                                handleGestionarDocumentos={handleGestionarDocumentos}
                                handleVerDetalle={handleVerDetalle} 
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                                formatDateForDisplay={formatDateForDisplay}
                            />

                            {/* Selector de elementos por página */}
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const n = Number(e.target.value) || 1;
                                        setElementosPorPagina(n);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        width: "80px",
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
                </div>

                {/* === Formularios y modales === */}
{mostrarFormulario && (
  <InduccionForm
    nombre={nombre}
    setNombre={setNombre}
    fechainicio={fechainicio}
    setFechaInicio={setFechaInicio}
    activoEditando={activoEditando}
    editingId={editingId}
    handleSubmit={handleSubmit}
    onClose={() => {
      setMostrarFormulario(false);
      setNombre("");
      setEditingId(null);
      setActivoEditando(true);
    }}
  />
)}

{mostrarConfirmacion && (
  <ConfirmModal
    registro={seleccionado}
    onConfirm={confirmarDesactivacion}
    onCancel={() => setMostrarConfirmacion(false)}
    tipo="inducción"
  />
)}

{mostrarGestionarDocumentos && (
  <GestionarDocumentosModal
    onClose={() => setMostrarGestionarDocumentos(false)}
    induccion={induccionSeleccionada}
  />
)}

{mostrarDocumentosAsignados && (
  <DocumentosAsignadosModal
    visible={mostrarDocumentosAsignados}
    onClose={() => setMostrarDocumentosAsignados(false)}
    induccion={induccionParaDocumentos}
  />
)}

<ScrollToTop />
            </div>
        </Layout>
    );
};

export default InduccionContainer;
