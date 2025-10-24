import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

import DocumentosTable from "./DocumentosTable.jsx";
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

    useEffect(() => {
        fetchDocumentos();
        fetchTiposDocumento();
        fetchEmpleados();
    }, []);

    const fetchDocumentos = async () => {
        try {
            const r = await axios.get(`${API}/documentos/`);
            const data = Array.isArray(r.data) ? r.data : Array.isArray(r.data?.results) ? r.data.results : [];
            setDocumentos(data);
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
            console.error("Error al cargar empleados:", error);
            showToast("Error al cargar empleados:", "error");
            setEmpleados([]);
        }
    };

    const onChange = e => {
        const { name, files, value } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const extension = file.name.split(".").pop().toLowerCase();
            setForm(f => ({
                ...f,
                archivoFile: file,
                mimearchivo: extension,
                nombrearchivo: file.name
            }));
        } else {
            setForm(f => ({
                ...f,
                [name]: value
            }));
        }
    };

    const openNewForm = () => {
        const today = new Date().toISOString().slice(0, 10);
        setForm(f => ({
            ...f,
            nombrearchivo: "",
            mimearchivo: "",
            fechasubida: today,
            idusuario: sessionStorage.getItem("idUsuario") || "",
            idtipodocumento: "",
            idempleado: "",
            archivoFile: null
        }));
        setEditingId(null);
        setMostrarFormulario(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (
            !form.nombrearchivo ||
            !form.fechasubida ||
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

        let nombreFinal = form.nombrearchivo;
        let extension = form.mimearchivo;

        if (form.archivoFile) {
            extension = form.archivoFile.name.split(".").pop().toLowerCase();
            if (!nombreFinal.endsWith(`.${extension}`)) {
                nombreFinal = `${nombreFinal}.${extension}`;
            }
            formData.append("archivo", form.archivoFile);
        } else if (editingId) {
            if (!nombreFinal.endsWith(`.${extension}`)) {
                nombreFinal = `${nombreFinal}.${extension}`;
            }
        }

        formData.append("nombrearchivo", nombreFinal);
        formData.append("mimearchivo", extension);
        formData.append("fechasubida", form.fechasubida);
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
        const today = row.fechasubida ?? new Date().toISOString().slice(0, 10);
        setForm({
            nombrearchivo: row.nombrearchivo ?? "",
            mimearchivo: row.mimearchivo ?? "",
            fechasubida: today,
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

    const documentosFiltrados = documentos.filter(d => {
        const nombreDocumento = d.nombrearchivo?.toLowerCase() || "";

        // Buscar el empleado correspondiente
        const empleado = empleados.find(emp => emp.idempleado === d.idempleado);
        const nombreEmpleado = empleado ? empleado.nombre.toLowerCase() : "";
        const apellidoEmpleado = empleado ? empleado.apellido.toLowerCase() : "";
        const nombreCompletoEmpleado = `${nombreEmpleado} ${apellidoEmpleado}`; // nombre + apellido

        const terminoBusqueda = busqueda.toLowerCase();

        // Filtrar por nombre de documento, nombre, apellido o nombre completo del empleado
        return (
            nombreDocumento.includes(terminoBusqueda) ||
            nombreEmpleado.includes(terminoBusqueda) ||
            apellidoEmpleado.includes(terminoBusqueda) ||
            nombreCompletoEmpleado.includes(terminoBusqueda)
        );
    });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const documentosPaginados = documentosFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.max(1, Math.ceil(documentosFiltrados.length / elementosPorPagina));

    return (
        <Layout>
            <SEO title="Documentos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "225px" }}>
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
                                <button
                                    onClick={openNewForm}
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
                                    Nuevo Documento
                                </button>
                            </div>

                            <DocumentosTable
                                documentosPaginados={documentosPaginados}
                                empleados={empleados}
                                tiposDocumento={tiposDocumento}
                                downloadFile={downloadFile}
                                handleEdit={handleEdit}
                                paginaActual={paginaActual}
                                setPaginaActual={setPaginaActual}
                                totalPaginas={totalPaginas}
                            />

                            {/* LÍMITE */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    textAlign: "center"
                                }}
                            >
                                <label
                                    style={{
                                        marginRight: "10px",
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
                        </div>
                    </main>
                    <Footer />
                </div>
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
                handleDeleteArchivo={handleDeleteArchivo}
            />

            <ToastContainer />
            <ScrollToTop />
        </Layout>
    );
};

export default DocumentosContainer;
