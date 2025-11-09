import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import { showToast } from "../../utils/toast.js";
import { } from "react-toastify"; import DocumentosTable from "./DocumentosTable.jsx";
import DocumentosForm from "./DocumentosForm.jsx";
import ModalEliminarArchivo from "./ModalEliminarArchivo.jsx";

const API = "http://127.0.0.1:8000/api";

const DocumentosContainer = () => {
    const [form, setForm] = useState({
        nombrearchivo: "",
        mimearchivo: "",
        fechasubida: "",
        idusuario: sessionStorage.getItem("idUsuario") || "",
        idtipodocumento: "",
        idempleado: "",
        archivoFile: null
    });

    const [mensaje, setMensaje] = useState("");
    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [documentoAEliminar, setDocumentoAEliminar] = useState(null);

    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [mostrarSinArchivo, setMostrarSinArchivo] = useState(false);

    useEffect(() => {
        fetchDocumentos();
        fetchTiposDocumento();
        fetchEmpleados();
    }, []);

    const fetchDocumentos = async () => {
        try {
            const r = await axios.get(`${API}/documentos/`);
            const data = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.results) ? r.data.results : [];

            // Filtrar solo documentos activos (estado != false)
            const documentosActivos = data.filter(doc => doc.estado !== false);
            
            setDocumentos(documentosActivos);
        } catch (error) {
            console.error("Error al cargar documentos:", "error");
            showToast("Error al cargar los documentos", "error");
            setDocumentos([]);
        }
    };

    const fetchTiposDocumento = async () => {
        try {
            const r = await axios.get(`${API}/tipodocumento/`);
            const data = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.results) ? r.data.results : [];
            setTiposDocumento(data);
        } catch (error) {
            console.error("Error al cargar tipos de documento:", error);
            showToast("Error al cargar tipos de documento:", "error");
            setTiposDocumento([]);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const r = await axios.get(`${API}/empleados/`);
            const data = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.results) ? r.data.results : [];
            setEmpleados(data);
        } catch (error) {
            console.error("Error al cargar colaboradores:", error);
            showToast("Error al cargar colaboradores:", "error");
            setEmpleados([]);
        }
    };

    const onChange = e => {
        const { name, files, value } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const extension = file.name.split(".").pop().toLowerCase();
            // Quitar la extensión del nombre del archivo
            const nombreSinExtension = file.name.replace(/\.[^/.]+$/, "");
            setForm(f => ({
                ...f,
                archivoFile: file,
                mimearchivo: extension,
                nombrearchivo: nombreSinExtension
            }));
        } else {
            setForm(f => ({
                ...f,
                [name]: value
            }));
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (
            !form.nombrearchivo ||
            !form.idtipodocumento ||
            !form.idempleado ||
            (!form.archivoFile && !editingId)
        ) {
            setMensaje("Todos los campos son obligatorios");
            showToast("Todos los campos son obligatorios");
            return;
        }

        const idUsuario = sessionStorage.getItem("idUsuario");
        const formData = new FormData();

        // Siempre usar la fecha actual
        const fechaActual = new Date().toISOString().slice(0, 10);

        let nombreFinal = form.nombrearchivo;
        let extension = form.mimearchivo;

        if (form.archivoFile) {
            extension = form.archivoFile.name.split(".").pop().toLowerCase();
            // Solo agregar extensión para el archivo físico, no para el nombre mostrado
            formData.append("archivo", form.archivoFile);
        }

        formData.append("nombrearchivo", nombreFinal);
        formData.append("mimearchivo", extension);
        formData.append("fechasubida", fechaActual);
        formData.append("estado", true);
        formData.append("idusuario", idUsuario);
        formData.append("idtipodocumento", form.idtipodocumento);
        formData.append("idempleado", form.idempleado);

        try {
            if (editingId) {
                await axios.put(`${API}/documentos/${editingId}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                showToast("Documento actualizado correctamente");
            } else {
                await axios.post(`${API}/documentos/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                showToast("Documento registrado correctamente");
            }

            setForm({
                nombrearchivo: "",
                mimearchivo: "",
                fechasubida: "",
                idtipodocumento: "",
                idempleado: "",
                archivoFile: null
            });
            setEditingId(null);
            setMostrarFormulario(false);
            fetchDocumentos();
        } catch (error) {
            console.error("Error al guardar documento:", e.response?.data || error);
            setMensaje("Error al registrar o actualizar el documento");
            showToast("Error al registrar o actualizar el documento", "error");
        }
    };

    const handleEdit = row => {
        setForm({
            nombrearchivo: row.nombrearchivo ?? "",
            mimearchivo: row.mimearchivo ?? "",
            fechasubida: "",
            idusuario: row.idusuario ?? (sessionStorage.getItem("idUsuario") || ""),
            idtipodocumento: row.idtipodocumento ?? "",
            idempleado: row.idempleado ?? "",
            archivoFile: null
        });
        setEditingId(row.iddocumento);
        setMostrarFormulario(true);
    };

    const handleDeleteArchivo = async id => {
        try {
            const formData = new FormData();
            formData.append("borrar_archivo", "true");
            formData.append("nombrearchivo", form.nombrearchivo + " (archivo eliminado)");
            formData.append("fechasubida", form.fechasubida);
            formData.append("idusuario", form.idusuario);
            formData.append("idtipodocumento", form.idtipodocumento);
            formData.append("idempleado", form.idempleado);
            formData.append("mimearchivo", "-----");

            await axios.put(`${API}/documentos/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            showToast("Archivo eliminado correctamente");
            setForm(f => ({
                ...f,
                archivoFile: null,
                mimearchivo: "-----",
                nombrearchivo: f.nombrearchivo + " (archivo eliminado)"
            }));

            setEditingId(null);
            setMostrarFormulario(false);
            setDocumentoAEliminar(null);

            fetchDocumentos();
        } catch (error) {
            console.error("Error al eliminar archivo:", error.response?.data || error);
            showToast("No se pudo eliminar el archivo", "error");
        }
    };

    // Nueva función para eliminar documento completamente (marcar como inactivo)
    const handleDelete = async id => {
        try {
            // Obtener primero el documento para mantener sus datos
            const response = await axios.get(`${API}/documentos/${id}/`);
            const documento = response.data;

            const formData = new FormData();
            formData.append("nombrearchivo", documento.nombrearchivo || "");
            formData.append("mimearchivo", documento.mimearchivo || "");
            formData.append("fechasubida", documento.fechasubida || "");
            formData.append("estado", false); // Marcar como inactivo
            formData.append("idusuario", documento.idusuario || "");
            formData.append("idtipodocumento", documento.idtipodocumento || "");
            formData.append("idempleado", documento.idempleado || "");

            await axios.put(`${API}/documentos/${id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            showToast("Documento eliminado correctamente");
            fetchDocumentos();
        } catch (error) {
            console.error("Error al eliminar documento:", error.response?.data || error);
            showToast("No se pudo eliminar el documento", "error");
        }
    };

    const downloadFile = async (archivo_url, nombre) => {
        try {
            const response = await axios.get(archivo_url, { responseType: "blob" });
            const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = urlBlob;
            link.setAttribute("download", nombre);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast("Descarga iniciada");
        } catch (error) {
            console.error("Error al descargar:", error);
            showToast("No se pudo descargar el archivo", "error");
            setMensaje("No se pudo descargar el archivo");
        }
    };

    const documentosFiltrados = documentos
        // Ordenar por ID descendente (último agregado primero)
        .sort((a, b) => (b.iddocumento || 0) - (a.iddocumento || 0))
        .filter(d => {
            const nombreDocumento = d.nombrearchivo?.toLowerCase() || "";

            // Buscar el empleado correspondiente
            const empleado = empleados.find(emp => emp.idempleado === d.idempleado);
            const nombreEmpleado = empleado ? empleado.nombre.toLowerCase() : "";
            const apellidoEmpleado = empleado ? empleado.apellido.toLowerCase() : "";
            const nombreCompletoEmpleado = `${nombreEmpleado} ${apellidoEmpleado}`;

            const terminoBusqueda = busqueda.toLowerCase();

            // Filtro por texto de búsqueda
            const coincideTexto = (
                nombreDocumento.includes(terminoBusqueda) ||
                nombreEmpleado.includes(terminoBusqueda) ||
                apellidoEmpleado.includes(terminoBusqueda) ||
                nombreCompletoEmpleado.includes(terminoBusqueda)
            );

            // Filtro por estado de archivo
            if (mostrarSinArchivo) {
                // Solo mostrar los que NO tienen archivo
                return coincideTexto && !d.archivo_url;
            } else {
                // Solo mostrar los que SÍ tienen archivo
                return coincideTexto && d.archivo_url;
            }
        });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const documentosPaginados = documentosFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.max(1, Math.ceil(documentosFiltrados.length / elementosPorPagina));

    return (
        <Layout>
            <SEO title="Documentos" />
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
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Documentos Registrados</h2>

                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error") ? "red" : "green",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}

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
                                    placeholder="Buscar documento..."
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
                            </div>

                            <DocumentosTable
                                documentosPaginados={documentosPaginados}
                                empleados={empleados}
                                tiposDocumento={tiposDocumento}
                                downloadFile={downloadFile}
                                setDocumentoAEliminar={setDocumentoAEliminar}
                                setMostrarModalEliminar={setMostrarModalEliminar}
                                paginaActual={paginaActual}
                                setPaginaActual={setPaginaActual}
                                totalPaginas={totalPaginas}
                            />

                            {/* CONTROLES DE VISUALIZACIÓN */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    textAlign: "center",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "30px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <label
                                        style={{
                                            fontWeight: "600"
                                        }}
                                    >
                                        Mostrar:
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={elementosPorPagina}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            const numero = val === "" ? "" : Number(val);
                                            setElementosPorPagina(numero > 0 ? numero : 1);
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

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <input
                                        type="checkbox"
                                        id="mostrarSinArchivo"
                                        checked={mostrarSinArchivo}
                                        onChange={e => {
                                            setMostrarSinArchivo(e.target.checked);
                                            setPaginaActual(1);
                                        }}
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                            cursor: "pointer"
                                        }}
                                    />
                                    <label
                                        htmlFor="mostrarSinArchivo"
                                        style={{
                                            fontWeight: "600",
                                            cursor: "pointer",
                                            color: mostrarSinArchivo ? "#1a73e8" : "#333"
                                        }}
                                    >
                                        Mostrar solo sin archivo
                                    </label>
                                </div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {mostrarFormulario && (
                    <DocumentosForm
                        form={form}
                        setForm={setForm}
                        tiposDocumento={tiposDocumento}
                        empleados={empleados}
                        onChange={onChange}
                        handleSubmit={handleSubmit}
                        editingId={editingId}
                        setMostrarFormulario={setMostrarFormulario}
                        setMostrarModalEliminar={setMostrarModalEliminar}
                        setDocumentoAEliminar={setDocumentoAEliminar}
                    />
                )}

                <ModalEliminarArchivo
                    mostrarModalEliminar={mostrarModalEliminar}
                    setMostrarModalEliminar={setMostrarModalEliminar}
                    documentoAEliminar={documentoAEliminar}
                    handleDelete={handleDelete}
                />

            </div>
        </Layout>
    );
};

export default DocumentosContainer;

