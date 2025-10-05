// containers/documentos/index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import SidebarMenu from "../../components/menu/main-menu/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

const API = "http://127.0.0.1:8000/api";

const DocumentosContainer = () => {
    const [form, setForm] = useState({
        nombrearchivo: "",
        mimearchivo: "",
        fechasubida: "",
        idusuario: sessionStorage.getItem("idUsuario") || "",
        idtipodocumento: "",
        idempleado: "",
        archivo: "",
        archivoFile: null,
    });
    const [mensaje, setMensaje] = useState("");
    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
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
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                ? r.data.results
                : [];
            setDocumentos(data);
        } catch (e) {
            console.error("Error al cargar documentos:", e);
            setMensaje("Error al cargar los documentos");
        }
    };

    const fetchTiposDocumento = async () => {
        try {
            const r = await axios.get(`${API}/tipodocumento/`);
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                ? r.data.results
                : [];
            setTiposDocumento(data);
        } catch (e) {
            console.error("Error al cargar tipos de documento:", e);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const r = await axios.get(`${API}/empleados/`);
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                ? r.data.results
                : [];
            setEmpleados(data);
        } catch (e) {
            console.error("Error al cargar empleados:", e);
        }
    };

    const onChange = (e) => {
        const { name, files, value } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            setForm((f) => ({
                ...f,
                archivoFile: file,
                mimearchivo: file.type,
                nombrearchivo: file.name,
            }));
        } else {
            setForm((f) => ({
                ...f,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.nombrearchivo ||
            !form.mimearchivo ||
            !form.fechasubida ||
            !form.idtipodocumento ||
            !form.idempleado ||
            (!form.archivoFile && !editingId)
        ) {
            setMensaje("Todos los campos son obligatorios");
            return;
        }

        const idUsuario = sessionStorage.getItem("idUsuario"); // <- obtener dinámicamente
        const formData = new FormData();
        if (form.archivoFile) formData.append("archivo", form.archivoFile);
        formData.append("nombrearchivo", form.nombrearchivo);
        formData.append("mimearchivo", form.mimearchivo.slice(0, 10));
        formData.append("fechasubida", form.fechasubida);
        formData.append("estado", true);
        formData.append("idusuario", idUsuario); // <- aquí
        formData.append("idtipodocumento", form.idtipodocumento);
        formData.append("idempleado", form.idempleado);

        try {
            if (editingId) {
                await axios.put(`${API}/documentos/${editingId}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMensaje("Documento actualizado correctamente");
            } else {
                await axios.post(`${API}/documentos/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMensaje("Documento registrado correctamente");
            }

            setForm({
                nombrearchivo: "",
                mimearchivo: "",
                fechasubida: "",
                idusuario: sessionStorage.getItem("idUsuario") || "", // reset también
                idtipodocumento: "",
                idempleado: "",
                archivo: "",
                archivoFile: null,
            });
            setEditingId(null);
            setMostrarFormulario(false);
            fetchDocumentos();
        } catch (e) {
            console.error("Error al guardar documento:", e.response?.data || e);
            setMensaje("Error al registrar o actualizar el documento");
        }
    };

    const handleEdit = (row) => {
        setForm({
            nombrearchivo: row.nombrearchivo ?? "",
            mimearchivo: row.mimearchivo ?? "",
            fechasubida: row.fechasubida ?? "",
            idusuario: row.idusuario ?? 1,
            idtipodocumento: row.idtipodocumento ?? "",
            idempleado: row.idempleado ?? "",
            archivo: row.archivo ?? "",
            archivoFile: null,
        });
        setEditingId(row.iddocumento);
        setMostrarFormulario(true);
    };

    const downloadFile = async (archivo_url, nombre) => {
        try {
            const response = await axios.get(archivo_url, {
                responseType: "blob",
            });
            const urlBlob = window.URL.createObjectURL(
                new Blob([response.data])
            );
            const link = document.createElement("a");
            link.href = urlBlob;
            link.setAttribute("download", nombre);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error al descargar:", err);
            setMensaje("No se pudo descargar el archivo");
        }
    };

    // --- filtrado y paginación ---
    const documentosFiltrados = documentos.filter((d) =>
        d.nombrearchivo?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const documentosPaginados = documentosFiltrados.slice(
        indexOfFirst,
        indexOfLast
    );
    const totalPaginas = Math.ceil(
        documentosFiltrados.length / elementosPorPagina
    );

    return (
        <Layout>
            <SEO title="Hope – Documentos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <SidebarMenu />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Header />
                    <main
                        style={{
                            flex: 1,
                            padding: "40px 20px",
                            background: "#f0f2f5",
                        }}
                    >
                        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                            <h2
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Documentos Registrados
                            </h2>

                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error")
                                            ? "red"
                                            : "green",
                                        fontWeight: "bold",
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
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar documento..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={inputStyle}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setElementosPorPagina(
                                            value > 0 ? value : 1
                                        );
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        ...inputStyle,
                                        width: "80px",
                                        textAlign: "center",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "12px",
                                    padding: "20px 30px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Nombre</th>
                                            <th style={thStyle}>MIME</th>
                                            <th style={thStyle}>Fecha</th>
                                            <th style={thStyle}>Empleado</th>
                                            <th style={thStyle}>Tipo</th>
                                            <th
                                                style={{
                                                    ...thStyle,
                                                    textAlign: "center",
                                                }}
                                            >
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documentosPaginados.length > 0 ? (
                                            documentosPaginados.map((d) => (
                                                <tr key={d.iddocumento}>
                                                    <td style={tdStyle}>
                                                        {d.nombrearchivo}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {d.mimearchivo}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {d.fechasubida}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {empleados.find(
                                                            (e) =>
                                                                e.idempleado ===
                                                                d.idempleado
                                                        )
                                                            ? `${
                                                                  empleados.find(
                                                                      (e) =>
                                                                          e.idempleado ===
                                                                          d.idempleado
                                                                  ).nombre
                                                              } ${
                                                                  empleados.find(
                                                                      (e) =>
                                                                          e.idempleado ===
                                                                          d.idempleado
                                                                  ).apellido
                                                              }`
                                                            : "-"}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {tiposDocumento.find(
                                                            (t) =>
                                                                t.idtipodocumento ===
                                                                d.idtipodocumento
                                                        )
                                                            ? tiposDocumento.find(
                                                                  (t) =>
                                                                      t.idtipodocumento ===
                                                                      d.idtipodocumento
                                                              ).nombretipo
                                                            : "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            ...tdStyle,
                                                            textAlign: "center",
                                                        }}
                                                    >
                                                        {d.archivo_url && (
                                                            <button
                                                                onClick={() =>
                                                                    downloadFile(
                                                                        d.archivo_url,
                                                                        d.nombrearchivo
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 14px",
                                                                    background:
                                                                        "#17a2b8",
                                                                    color: "#fff",
                                                                    borderRadius:
                                                                        "5px",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                Descargar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "20px",
                                                    }}
                                                >
                                                    No hay documentos
                                                    registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* --- paginación --- */}
                                {documentosFiltrados.length >
                                    elementosPorPagina && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "15px",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                setPaginaActual((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={paginaActual === 1}
                                            style={{
                                                padding: "8px 12px",
                                                background:
                                                    paginaActual === 1
                                                        ? "#ccc"
                                                        : "#007bff",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor:
                                                    paginaActual === 1
                                                        ? "default"
                                                        : "pointer",
                                            }}
                                        >
                                            Anterior
                                        </button>

                                        <span>
                                            Página {paginaActual} de{" "}
                                            {totalPaginas}
                                        </span>

                                        <button
                                            onClick={() =>
                                                setPaginaActual((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPaginas
                                                    )
                                                )
                                            }
                                            disabled={
                                                paginaActual === totalPaginas
                                            }
                                            style={{
                                                padding: "8px 12px",
                                                background:
                                                    paginaActual ===
                                                    totalPaginas
                                                        ? "#ccc"
                                                        : "#007bff",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "6px",
                                                cursor:
                                                    paginaActual ===
                                                    totalPaginas
                                                        ? "default"
                                                        : "pointer",
                                            }}
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setMostrarFormulario(true)}
                                style={{
                                    marginTop: "20px",
                                    padding: "12px 20px",
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Nuevo Documento
                            </button>
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <div style={modalStyle}>
                        <h3
                            style={{
                                textAlign: "center",
                                marginBottom: "20px",
                            }}
                        >
                            {editingId
                                ? "Editar documento"
                                : "Registrar documento"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <label>Nombre</label>
                            <input
                                name="nombrearchivo"
                                value={form.nombrearchivo}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            />

                            <label>MIME</label>
                            <input
                                name="mimearchivo"
                                value={form.mimearchivo}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            />

                            <label>Fecha de subida</label>
                            <input
                                type="date"
                                name="fechasubida"
                                value={form.fechasubida}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            />

                            <label>Archivo</label>
                            <input
                                type="file"
                                name="archivo"
                                onChange={onChange}
                                accept="*/*"
                                required={!editingId}
                                style={{ marginBottom: "15px" }}
                            />

                            <label>Tipo de Documento</label>
                            <select
                                name="idtipodocumento"
                                value={form.idtipodocumento}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            >
                                <option value="">Seleccione...</option>
                                {tiposDocumento.map((t) => (
                                    <option
                                        key={t.idtipodocumento}
                                        value={t.idtipodocumento}
                                    >
                                        {t.nombretipo}
                                    </option>
                                ))}
                            </select>

                            <label>Empleado</label>
                            <select
                                name="idempleado"
                                value={form.idempleado}
                                onChange={onChange}
                                required
                                style={inputStyle}
                            >
                                <option value="">Seleccione...</option>
                                {empleados.map((e) => (
                                    <option
                                        key={e.idempleado}
                                        value={e.idempleado}
                                    >
                                        {e.nombre} {e.apellido}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" style={btnGuardar}>
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </form>
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            style={btnCerrar}
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

// --- estilos reutilizables ---
const thStyle = {
    borderBottom: "2px solid #eee",
    padding: "10px",
    textAlign: "left",
};
const tdStyle = { padding: "10px", borderBottom: "1px solid #f0f0f0" };
const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "10px",
};
const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "450px",
    background: "#fff",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
    padding: "30px",
    zIndex: 1000,
    borderRadius: "12px",
};
const btnGuardar = {
    width: "100%",
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
};
const btnCerrar = {
    marginTop: "10px",
    padding: "10px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
};

export default DocumentosContainer;
