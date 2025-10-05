import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";

const DocumentosContainer = () => {
    const [form, setForm] = useState({
        nombrearchivo: "",
        mimearchivo: "",
        fechasubida: "",
        estado: true,
        idusuario: 1,
        idtipodocumento: "",
        idempleado: "",
        archivo: null,
    });
    const [mensaje, setMensaje] = useState("");
    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const onChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setForm((f) => ({
            ...f,
            [name]: files ? files[0] : type === "checkbox" ? checked : value,
        }));
    };

    useEffect(() => {
        fetchList();
    }, []);
    const fetchList = async () => {
        try {
            const r = await axios.get(`${API}/documentos/`);
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                ? r.data.results
                : [];
            setRows(data);
        } catch (e) {
            console.error("Error documentos:", e);
            setRows([]);
            setMensaje("Error al cargar los documentos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== "") fd.append(k, v);
            });

            if (editingId) {
                await axios.put(`${API}/documentos/${editingId}/`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMensaje("Documento actualizado");
            } else {
                await axios.post(`${API}/documentos/`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setMensaje("Documento registrado");
            }

            setForm({
                nombrearchivo: "",
                mimearchivo: "",
                fechasubida: "",
                estado: true,
                idusuario: 1,
                idtipodocumento: "",
                idempleado: "",
                archivo: null,
            });
            setEditingId(null);
            fetchList();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            console.error("Error guardar documento:", e.response?.data || e);
            setMensaje("Error al registrar/actualizar");
        }
    };

    const handleEdit = (row) => {
        setForm({
            nombrearchivo: row.nombrearchivo ?? "",
            mimearchivo: row.mimearchivo ?? "",
            fechasubida: row.fechasubida ?? "",
            estado: !!row.estado,
            idusuario: row.idusuario ?? 1,
            idtipodocumento: row.idtipodocumento ?? "",
            idempleado: row.idempleado ?? "",
            archivo: null, // se debe seleccionar de nuevo
        });
        setEditingId(row.iddocumento);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleEstado = async (row, nuevo) => {
        try {
            // Para togglear sin subir archivo, mandamos los campos de texto
            const fd = new FormData();
            fd.append("nombrearchivo", row.nombrearchivo ?? "");
            fd.append("mimearchivo", row.mimearchivo ?? "");
            fd.append("fechasubida", row.fechasubida ?? "");
            if (row.idtipodocumento)
                fd.append("idtipodocumento", row.idtipodocumento);
            if (row.idempleado) fd.append("idempleado", row.idempleado);
            fd.append("estado", nuevo ? "true" : "false");
            fd.append("idusuario", row.idusuario ?? 1);

            await axios.put(`${API}/documentos/${row.iddocumento}/`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMensaje(nuevo ? "Documento activado" : "Documento desactivado");
            fetchList();
        } catch (e) {
            console.error("Error:", e.response?.data || e);
            setMensaje("No se pudo cambiar el estado");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Documentos" />
            <div
                className="wrapper"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                <Header />
                <main
                    style={{
                        flex: 1,
                        padding: "60px 20px",
                        background: "#f0f2f5",
                    }}
                >
                    <div style={{ maxWidth: 900, margin: "0 auto" }}>
                        {/* FORM */}
                        <div
                            style={{
                                background: "#fff",
                                padding: 40,
                                borderRadius: 12,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                marginBottom: 40,
                            }}
                        >
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: 30,
                                }}
                            >
                                {editingId
                                    ? "Editar documento"
                                    : "Registrar documento"}
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error")
                                            ? "red"
                                            : "green",
                                        marginBottom: 20,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 16,
                                    }}
                                >
                                    <div>
                                        <label>Nombre visible</label>
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
                                            placeholder="pdf, png, docx, ..."
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
                                    </div>
                                    <div>
                                        <label>ID Tipo de documento</label>
                                        <input
                                            name="idtipodocumento"
                                            value={form.idtipodocumento}
                                            onChange={onChange}
                                            style={inputStyle}
                                        />
                                        <label>ID Empleado</label>
                                        <input
                                            name="idempleado"
                                            value={form.idempleado}
                                            onChange={onChange}
                                            style={inputStyle}
                                        />
                                        <div
                                            style={{
                                                marginTop: 12,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="estado"
                                                checked={form.estado}
                                                onChange={onChange}
                                            />
                                            <label>Activo</label>
                                        </div>
                                        <div style={{ marginTop: 12 }}>
                                            <label>Archivo</label>
                                            <input
                                                type="file"
                                                name="archivo"
                                                onChange={onChange}
                                                accept="*/*"
                                                required={!editingId}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" style={btnPrimary}>
                                    {editingId ? "Actualizar" : "Guardar"}
                                </button>
                            </form>
                        </div>

                        {/* TABLA */}
                        <div style={tableWrapper}>
                            <h3
                                style={{
                                    marginBottom: 20,
                                    textAlign: "center",
                                }}
                            >
                                Documentos
                            </h3>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            "Nombre",
                                            "MIME",
                                            "Fecha",
                                            "Empleado",
                                            "Tipo",
                                            "Estado",
                                            "Acciones",
                                        ].map((h) => (
                                            <th key={h} style={thStyle}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(rows) && rows.length ? (
                                        rows.map((r) => (
                                            <tr key={r.iddocumento}>
                                                <td style={tdStyle}>
                                                    {r.nombrearchivo}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.mimearchivo}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.fechasubida}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.idempleado || "-"}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.idtipodocumento || "-"}
                                                </td>
                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign: "center",
                                                        color: r.estado
                                                            ? "green"
                                                            : "red",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {r.estado
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(r)
                                                        }
                                                        style={btnWarn}
                                                    >
                                                        Editar
                                                    </button>
                                                    {r.estado ? (
                                                        <button
                                                            onClick={() =>
                                                                toggleEstado(
                                                                    r,
                                                                    false
                                                                )
                                                            }
                                                            style={btnDanger}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                toggleEstado(
                                                                    r,
                                                                    true
                                                                )
                                                            }
                                                            style={btnSuccess}
                                                        >
                                                            Activar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                style={{
                                                    textAlign: "center",
                                                    padding: 20,
                                                }}
                                            >
                                                Sin documentos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <Footer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    marginBottom: 12,
};
const btnPrimary = {
    width: "100%",
    marginTop: 16,
    padding: "12px 0",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
};
const tableWrapper = {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxHeight: 600,
    overflowY: "auto",
};
const thStyle = {
    borderBottom: "2px solid #eee",
    padding: 10,
    textAlign: "left",
};
const tdStyle = { padding: 10, borderBottom: "1px solid #f0f0f0" };
const btnWarn = {
    padding: "6px 14px",
    background: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
    marginRight: 6,
};
const btnDanger = {
    padding: "6px 14px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
};
const btnSuccess = {
    padding: "6px 14px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
};

export default DocumentosContainer;
