// containers/documentos/index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import { X } from "lucide-react";
import SEO from "../../components/seo/index.jsx";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";
import Select from "react-select";

const API = "http://127.0.0.1:8000/api";

const DocumentosContainer = () => {
    const [form, setForm] = useState({
        nombrearchivo: "",
        mimearchivo: "",
        fechasubida: "",
        idusuario: sessionStorage.getItem("idUsuario") || "",
        idtipodocumento: "",
        idempleado: "",
        archivoFile: null,
    });

    const [mensaje, setMensaje] = useState("");
    const [documentos, setDocumentos] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [documentoAEliminar, setDocumentoAEliminar] = useState(null);

    // Paginación y búsqueda
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetchDocumentos();
        fetchTiposDocumento();
        fetchEmpleados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch (error) {
            console.error("Error al cargar documentos:", "error");
            showToast("Error al cargar los documentos", "error");
            setDocumentos([]);
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
        } catch (error) {
            console.error("Error al cargar tipos de documento:", error);
            showToast("Error al cargar tipos de documento:", "error");
            setTiposDocumento([]);
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
        } catch (error) {
            console.error("Error al cargar empleados:", error);
            showToast("Error al cargar empleados:", "error");
            setEmpleados([]);
        }
    };

    const onChange = (e) => {
        const { name, files, value } = e.target;
        if (files && files.length > 0) {
            const file = files[0];
            const extension = file.name.split(".").pop().toLowerCase();
            setForm((f) => ({
                ...f,
                archivoFile: file,
                mimearchivo: extension,
                nombrearchivo: file.name,
            }));
        } else {
            setForm((f) => ({
                ...f,
                [name]: value,
            }));
        }
    };

    const openNewForm = () => {
        // preset fecha subida a hoy en formato YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);
        setForm((f) => ({
            ...f,
            nombrearchivo: "",
            mimearchivo: "",
            fechasubida: today,
            idusuario: sessionStorage.getItem("idUsuario") || "",
            idtipodocumento: "",
            idempleado: "",
            archivoFile: null,
        }));
        setEditingId(null);
        setMostrarFormulario(true);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones básicas
        if (
            !form.nombrearchivo ||
            !form.fechasubida ||
            !form.idtipodocumento ||
            !form.idempleado ||
            (!form.archivoFile && !editingId) // Solo obligatorio si es nuevo
        ) {
            setMensaje("Todos los campos son obligatorios");
            showToast("Todos los campos son obligatorios");
            return;
        }

        const idUsuario = sessionStorage.getItem("idUsuario");
        const formData = new FormData();

        let nombreFinal = form.nombrearchivo;
        let extension = form.mimearchivo;

        // Si hay un archivo nuevo, procesamos y agregamos al FormData
        if (form.archivoFile) {
            extension = form.archivoFile.name.split(".").pop().toLowerCase();
            if (!nombreFinal.endsWith(`.${extension}`)) {
                nombreFinal = `${nombreFinal}.${extension}`;
            }
            formData.append("archivo", form.archivoFile);
        } else if (editingId) {
            // Si estamos editando y no hay archivo nuevo, solo preservamos el nombre y extensión
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
                // PUT: actualizar documento
                await axios.put(`${API}/documentos/${editingId}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Documento actualizado correctamente");
            } else {
                // POST: nuevo documento
                await axios.post(`${API}/documentos/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Documento registrado correctamente");
            }

            // Reset form
            setForm({
                nombrearchivo: "",
                mimearchivo: "",
                fechasubida: "",
                idtipodocumento: "",
                idempleado: "",
                archivoFile: null,
            });
            setEditingId(null);
            setMostrarFormulario(false);
            fetchDocumentos();
        } catch (error) {
            console.error(
                "Error al guardar documento:",
                e.response?.data || error
            );
            setMensaje("Error al registrar o actualizar el documento");
            showToast("Error al registrar o actualizar el documento", "error");
        }
    };

    const handleEdit = (row) => {
        // Fill form with row data; archivoFile null (user may upload new file)
        const today = row.fechasubida ?? new Date().toISOString().slice(0, 10);
        setForm({
            nombrearchivo: row.nombrearchivo ?? "",
            mimearchivo: row.mimearchivo ?? "",
            fechasubida: today,
            idusuario:
                row.idusuario ?? (sessionStorage.getItem("idUsuario") || ""),
            idtipodocumento: row.idtipodocumento ?? "",
            idempleado: row.idempleado ?? "",
            archivoFile: null,
        });
        setEditingId(row.iddocumento);
        setMostrarFormulario(true);
    };

    const handleDeleteArchivo = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar el archivo del documento?")) return;

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
            headers: { "Content-Type": "multipart/form-data" },
            });

            showToast("Archivo eliminado correctamente");
            setForm((f) => ({
            ...f,
            archivoFile: null,
            mimearchivo: "-----",
            nombrearchivo: f.nombrearchivo + " (archivo eliminado)",
            }));

            fetchDocumentos();
        } catch (error) {
            console.error("Error al eliminar archivo:", error.response?.data || error);
            showToast("No se pudo eliminar el archivo", "error");
        }
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
            showToast("Descarga iniciada");
        } catch (error) {
            console.error("Error al descargar:", error);
            showToast("No se pudo descargar el archivo", "error");
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
    const totalPaginas = Math.max(
        1,
        Math.ceil(documentosFiltrados.length / elementosPorPagina)
    );

    return (
        <Layout>
            <SEO title="Documentos" />
            <div
                style={{
                    display: "flex",
                    minHeight: "100vh",
                }}
            >
                {/* Contenedor principal: header + main + footer */}
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
                        <div
                            style={{
                                maxWidth: "1000px",
                                margin: "0 auto",
                                paddingLeft: "225px",
                            }}
                        >
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

                            {/* BUSCADOR Y BOTON NUEVO */}
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
                                    placeholder="Buscar documento..."
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
                                    onClick={openNewForm}
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
                                    Nuevo Documento
                                </button>
                            </div>

                            {/* TABLA */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "12px",
                                    padding: "30px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        borderSpacing: "0 8px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Nombre</th>
                                            <th
                                                style={{
                                                    ...thStyle,
                                                    textAlign: "left",
                                                }}
                                            >
                                                MIME
                                            </th>
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
                                                    {d.archivo_url ? d.nombrearchivo : `${d.nombrearchivo} (sin archivo)`}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {d.mimearchivo}
                                                    </td>
                                                    <td style={tdStyle}>
                                                        {formatDate(
                                                            d.fechasubida
                                                        )}
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
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    justifyContent:
                                                                        "center",
                                                                    gap: "8px",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        downloadFile(
                                                                            d.archivo_url,
                                                                            d.nombrearchivo
                                                                        )
                                                                    }
                                                                    style={
                                                                        btnStyleDescargar
                                                                    }
                                                                >
                                                                    Descargar
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            d
                                                                        )
                                                                    }
                                                                    style={
                                                                        btnStyleEditar
                                                                    }
                                                                >
                                                                    Editar
                                                                </button>
                                                            </div>
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

                                {/* PAGINACIÓN */}
                                {totalPaginas > 1 && (
                                    <div
                                        style={{
                                            marginTop: "20px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {Array.from(
                                            { length: totalPaginas },
                                            (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() =>
                                                        setPaginaActual(i + 1)
                                                    }
                                                    style={{
                                                        margin: "0 5px",
                                                        padding: "6px 12px",
                                                        border: "1px solid #219ebc",
                                                        background:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#219ebc"
                                                                : "#fff",
                                                        color:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#fff"
                                                                : "#219ebc",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {i + 1}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* LÍMITE */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    textAlign: "center",
                                }}
                            >
                                <label
                                    style={{
                                        marginRight: "10px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Mostrar:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        const numero =
                                            val === "" ? "" : Number(val);
                                        setElementosPorPagina(
                                            numero > 0 ? numero : 1
                                        );
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

                {/* MODAL LATERAL */}
                {mostrarFormulario && (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-15%, -50%)",
                            width: "420px",
                            maxWidth: "90%",
                            background: "#fff",
                            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                            padding: "30px",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                        }}
                    >
                        <h3
                            style={{
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            {editingId
                                ? "Editar documento"
                                : "Registrar documento"}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                            {/* 1. Nombre del archivo */}
                            <div style={{ marginBottom: "12px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Nombre del archivo
                                </label>
                                <input
                                    name="nombrearchivo"
                                    value={form.nombrearchivo}
                                    onChange={onChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>

                            {/* 2. Tipo de documento (select) */}
                            <div style={{ marginBottom: "12px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Tipo de documento
                                </label>
                                <select
                                    name="idtipodocumento"
                                    value={form.idtipodocumento}
                                    onChange={onChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
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
                            </div>

                            {/* 3. Empleado (autocomplete con react-select) */}
                            <div style={{ marginBottom: "12px" }}>
                                <label style={{ display: "block", marginBottom: "6px" }}>
                                    Empleado
                                </label>
                                <Select
                                    options={empleados.map((e) => ({
                                        value: e.idempleado,
                                        label: `${e.nombre} ${e.apellido}`,
                                    }))}
                                    value={
                                        form.idempleado
                                            ? {
                                                value: form.idempleado,
                                                label: `${empleados.find(
                                                    (emp) => emp.idempleado === form.idempleado
                                                )?.nombre} ${
                                                    empleados.find(
                                                        (emp) => emp.idempleado === form.idempleado
                                                    )?.apellido
                                                }`,
                                            }
                                            : null
                                    }
                                    onChange={(selected) =>
                                        setForm((f) => ({ ...f, idempleado: selected?.value }))
                                    }
                                    placeholder="Busca y selecciona un empleado..."
                                    isClearable
                                />
                            </div>

                            {/* 4. Archivo (input file) */}
                            <div style={{ marginBottom: "12px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Archivo
                                </label>
                                <input
                                    type="file"
                                    name="archivo"
                                    onChange={onChange}
                                    accept="*/*"
                                    required={!editingId}
                                    style={{ marginBottom: "6px" }}
                                />
                                <small style={{ color: "#666" }}>
                                    {editingId
                                        ? "Sube un archivo solo si deseas reemplazar el existente."
                                        : ""}
                                </small>
                                {editingId && form.nombrearchivo && (
                                <button
                                    type="button"
                                    onClick={() => {
                                    setDocumentoAEliminar(editingId);
                                    setMostrarModalEliminar(true);
                                    }}
                                    style={{
                                    marginTop: "10px",
                                    background: "#fb8500",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "8px 12px",
                                    cursor: "pointer",
                                    width: "100%",
                                    }}
                                >
                                    Eliminar archivo actual
                                </button>
                                )}
                            </div>

                            {/* 5. Fecha de subida */}
                            <div style={{ marginBottom: "12px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Fecha de subida
                                </label>
                                <input
                                    type="date"
                                    name="fechasubida"
                                    value={form.fechasubida}
                                    onChange={onChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: "#219ebc",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </form>

                        <button
                            onClick={() => {
                                setMostrarFormulario(false);
                                setEditingId(null);
                            }}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "15px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                            title="Cerrar"
                        >
                            <X size={24} color="#555" />
                        </button>
                    </div>
                )}

                {mostrarModalEliminar && (
                    <div
                        style={{
                        paddingLeft: "225px",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        }}
                    >
                        <div
                        style={{
                            background: "#fff",
                            padding: "25px",
                            borderRadius: "12px",
                            width: "400px",
                            textAlign: "center",
                            boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                        }}
                        >
                        <h3 style={{ marginBottom: "15px" }}>
                            ¿Eliminar el archivo actual?
                        </h3>
                        <p style={{ color: "#555", marginBottom: "20px" }}>
                            Esta acción eliminará el archivo asociado al documento, 
                            pero conservará el registro.
                        </p>

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            <button
                            onClick={async () => {
                                await handleDeleteArchivo(documentoAEliminar);
                                setMostrarModalEliminar(false);
                                setDocumentoAEliminar(null);
                            }}
                            style={{
                                background: "#fb8500",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 20px",
                                cursor: "pointer",
                            }}
                            >
                            Sí, eliminar
                            </button>
                            <button
                            onClick={() => {
                                setMostrarModalEliminar(false);
                                setDocumentoAEliminar(null);
                            }}
                            style={{
                                background: "#ccc",
                                color: "#333",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 20px",
                                cursor: "pointer",
                            }}
                            >
                            Cancelar
                            </button>
                        </div>
                        </div>
                    </div>
                    )}
                <ToastContainer />
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
const btnStyleDescargar = {
    padding: "6px 14px",
    background: "#17a2b8",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
};

const btnStyleEditar = {
    padding: "6px 14px",
    background: "#fb8500",
    color: "#fff",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
};

export default DocumentosContainer;
