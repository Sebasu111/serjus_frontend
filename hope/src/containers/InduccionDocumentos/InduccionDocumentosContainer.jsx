import React, { useState, useEffect } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import InduccionDocumentosForm from "./InduccionDocumentosForm";
import ConfirmModal from "./ConfirmModal";
import InduccionDocumentosTable from "./InduccionDocumentosTable";

const API = "http://127.0.0.1:8000/api/inducciondocumentos/";

const InduccionDocumentosContainer = () => {
    const [idinduccion, setIdInduccion] = useState("");
    const [documentoPDF, setDocumentoPDF] = useState(null);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [fechaasignado, setFechaAsignado] = useState("");
    const [idinforme, setIdInforme] = useState("");
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [activoEditando, setActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [seleccionado, setSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // Opciones para dropdowns (se cargarán del backend)
    const [inducciones, setInducciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [equipos, setEquipos] = useState([]);

    useEffect(() => {
        fetchAll();
        fetchInducciones();
        fetchEmpleados();
        fetchEquipos();
        // Inicializar fecha de asignado con fecha actual
        const fechaActual = new Date().toISOString().split('T')[0];
        setFechaAsignado(fechaActual);
    }, []);

    const fetchAll = async () => {
        try {
            const res = await axios.get(API);
            const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setItems(raw);
        } catch (e) {
            console.error(e);
            showToast("Error al cargar Inducción Documentos", "error");
        }
    };

    const fetchInducciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/inducciones/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setInducciones(data.filter(item => item.estado));
        } catch (e) {
            console.error("Error al cargar inducciones:", e);
        }
    };

    const fetchEquipos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/equipos/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setEquipos(data.filter(item => item.estado));
        } catch (e) {
            console.error("Error al cargar equipos:", e);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setEmpleados(data.filter(item => item.estado));
        } catch (e) {
            console.error("Error al cargar empleados:", e);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            // Validaciones
            if (!idInduccion || !documentoPDF || empleadosSeleccionados.length === 0) {
                showToast("Debe seleccionar una inducción, subir un documento PDF y seleccionar al menos un empleado", "warning");
                return;
            }

            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const formData = new FormData();
            formData.append('idinduccion', Number(idInduccion));
            formData.append('documento_pdf', documentoPDF);
            formData.append('empleados', JSON.stringify(empleadosSeleccionados));
            formData.append('fechaasignado', fechaAsignado);
            formData.append('estado', Boolean(activoEditando));
            formData.append('idusuario', idUsuario);

            if (editingId) {
                await axios.put(`${API}${editingId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await axios.post(API, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            showToast(editingId ? "Actualizado correctamente" : "Registrado correctamente");
            resetForm();
            setMostrarFormulario(false);
            fetchAll();
        } catch (error) {
            const apiErr = error.response?.data;
            const detalle =
                (apiErr && (apiErr.detail || JSON.stringify(apiErr))) || "desconocido";
            console.error("POST/PUT inducciondocumentos error:", apiErr || error);
            showToast(`Error al guardar: ${detalle}`, "error");
        }
    };

    const resetForm = () => {
        setIdInduccion("");
        setDocumentoPDF(null);
        setEmpleadosSeleccionados([]);
        // Mantener fecha asignado como automática
        const fechaActual = new Date().toISOString().split('T')[0];
        setFechaAsignado(fechaActual);
        setEditingId(null);
        setActivoEditando(true);
    };

    const handleEdit = row => {
        if (!row.estado) {
            showToast("No se puede editar un registro inactivo");
            return;
        }
        setIdInduccion(row.idinduccion?.toString() || "");
        // Para editar, necesitaremos cargar el PDF y empleados asignados del backend
        setEmpleadosSeleccionados(row.empleados || []);
        setFechaAsignado(row.fechaasignado || "");
        setEditingId(row.idinducciondocumento);
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
            await axios.put(`${API}${seleccionado.idinducciondocumento}/`, {
                ...seleccionado,
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
            const row = items.find(i => i.idinducciondocumento === id);
            if (!row) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API}${id}/`, {
                ...row,
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

    // Funciones para manejo de empleados
    const handleEmpleadoChange = (empleadoId) => {
        if (empleadosSeleccionados.includes(empleadoId)) {
            setEmpleadosSeleccionados(prev => prev.filter(id => id !== empleadoId));
        } else {
            setEmpleadosSeleccionados(prev => [...prev, empleadoId]);
        }
    };

    const handleEquipoChange = (equipoId) => {
        const equipo = equipos.find(e => e.idequipo === equipoId);
        if (equipo && equipo.empleados) {
            const empleadosDelEquipo = equipo.empleados.map(emp => emp.idempleado);
            empleadosDelEquipo.forEach(empId => {
                if (!empleadosSeleccionados.includes(empId)) {
                    setEmpleadosSeleccionados(prev => [...prev, empId]);
                }
            });
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setDocumentoPDF(file);
        } else {
            showToast("Por favor seleccione un archivo PDF válido", "warning");
            event.target.value = '';
        }
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES");
    };

    const getNombreInduccion = (id) => {
        const induccion = inducciones.find(i => i.idinduccion === id);
        return induccion ? induccion.nombre : `ID: ${id}`;
    };

    const getNombreEmpleado = (id) => {
        const empleado = empleados.find(e => e.idempleado === id);
        return empleado ? `${empleado.primernombre} ${empleado.primerapellido}` : `ID: ${id}`;
    };

    const filtrados = items
        .sort((a, b) => new Date(b.fechaasignado || 0) - new Date(a.fechaasignado || 0))
        .filter(i => {
            const t = busqueda.toLowerCase().trim();
            const fechaAsignadoStr = formatDateForDisplay(i.fechaasignado).toLowerCase();
            const nombreInduccion = getNombreInduccion(i.idinduccion).toLowerCase();
            const empleadosStr = (i.empleados || []).map(emp => `${emp.primernombre} ${emp.primerapellido}`).join(' ').toLowerCase();
            const e = i.estado ? "activo" : "inactivo";
            return fechaAsignadoStr.includes(t) || nombreInduccion.includes(t) ||
                empleadosStr.includes(t) || e.startsWith(t);
        });

    const indexLast = paginaActual * elementosPorPagina;
    const indexFirst = indexLast - elementosPorPagina;
    const paginados = filtrados.slice(indexFirst, indexLast);
    const totalPaginas = Math.ceil(filtrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Inducción Documentos" />
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
                        <div style={{ width: "min(1400px, 96vw)" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Inducción Documentos</h2>

                            {/* Buscador + Nuevo */}
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
                                    placeholder="Buscar empleado / documento / fecha / estado..."
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
                                    onClick={() => setMostrarFormulario(true)}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Nuevo Registro
                                </button>
                            </div>

                            <InduccionDocumentosTable
                                items={paginados}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleActivate={handleActivate}
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                                formatDateForDisplay={formatDateForDisplay}
                                getNombreInduccion={getNombreInduccion}
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const n = val === "" ? "" : Number(val);
                                        setElementosPorPagina(n > 0 ? n : 1);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={e => e.target.select()}
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

                {mostrarFormulario && (
                    <InduccionDocumentosForm
                        idInduccion={idInduccion}
                        setIdInduccion={setIdInduccion}
                        documentoPDF={documentoPDF}
                        handleFileChange={handleFileChange}
                        empleadosSeleccionados={empleadosSeleccionados}
                        handleEmpleadoChange={handleEmpleadoChange}
                        handleEquipoChange={handleEquipoChange}
                        fechaAsignado={fechaAsignado}
                        activoEditando={activoEditando}
                        editingId={editingId}
                        handleSubmit={handleSubmit}
                        onClose={() => {
                            setMostrarFormulario(false);
                            resetForm();
                        }}
                        inducciones={inducciones}
                        empleados={empleados}
                        equipos={equipos}
                    />
                )}

                {mostrarConfirmacion && (
                    <ConfirmModal
                        registro={seleccionado}
                        onConfirm={confirmarDesactivacion}
                        onCancel={() => setMostrarConfirmacion(false)}
                        tipo="asignación de documento"
                        getNombreInduccion={getNombreInduccion}
                    />
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default InduccionDocumentosContainer;