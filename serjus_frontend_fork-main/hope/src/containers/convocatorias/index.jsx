import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";

const ConvocatoriasContainer = () => {
    const [form, setForm] = useState({
        nombreconvocatoria: "",
        fechainicio: "",
        fechafin: "",
        idpuesto: "",
        estado: true,
        idusuario: 1,
    });
    const [mensaje, setMensaje] = useState("");

    const [rows, setRows] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    useEffect(() => {
        fetchList();
    }, []);
    const fetchList = async () => {
        try {
            const r = await axios.get(`${API}/convocatorias/`);
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                ? r.data.results
                : [];
            setRows(data);
        } catch (e) {
            console.error("Error convocatorias:", e);
            setRows([]);
            setMensaje("Error al cargar las convocatorias");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (editingId) {
                await axios.put(`${API}/convocatorias/${editingId}/`, payload);
                setMensaje("Convocatoria actualizada");
            } else {
                await axios.post(`${API}/convocatorias/`, payload);
                setMensaje("Convocatoria registrada");
            }
            setForm({
                nombreconvocatoria: "",
                fechainicio: "",
                fechafin: "",
                idpuesto: "",
                estado: true,
                idusuario: 1,
            });
            setEditingId(null);
            fetchList();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
            console.error("Error guardar:", e.response?.data || e);
            setMensaje("Error al registrar/actualizar");
        }
    };

    const handleEdit = (row) => {
        setForm({
            nombreconvocatoria: row.nombreconvocatoria ?? "",
            fechainicio: row.fechainicio ?? "",
            fechafin: row.fechafin ?? "",
            idpuesto: row.idpuesto ?? "",
            estado: !!row.estado,
            idusuario: row.idusuario ?? 1,
        });
        setEditingId(row.idconvocatoria);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleEstado = async (row, nuevo) => {
        try {
            await axios.put(`${API}/convocatorias/${row.idconvocatoria}/`, {
                ...row,
                estado: nuevo,
                idusuario: row.idusuario ?? 1,
            });
            setMensaje(nuevo ? "Activada" : "Desactivada");
            fetchList();
        } catch (e) {
            console.error("Error:", e.response?.data || e);
            setMensaje("No se pudo cambiar el estado");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Convocatorias" />
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
                                    ? "Editar convocatoria"
                                    : "Registrar convocatoria"}
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
                                        <label>Nombre</label>
                                        <input
                                            name="nombreconvocatoria"
                                            value={form.nombreconvocatoria}
                                            onChange={onChange}
                                            required
                                            style={inputStyle}
                                        />
                                        <label>Fecha inicio</label>
                                        <input
                                            type="date"
                                            name="fechainicio"
                                            value={form.fechainicio}
                                            onChange={onChange}
                                            required
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label>Fecha fin</label>
                                        <input
                                            type="date"
                                            name="fechafin"
                                            value={form.fechafin}
                                            onChange={onChange}
                                            style={inputStyle}
                                        />
                                        <label>ID Puesto</label>
                                        <input
                                            name="idpuesto"
                                            value={form.idpuesto}
                                            onChange={onChange}
                                            required
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
                                            <label>Activa</label>
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
                                Convocatorias
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
                                            "Inicio",
                                            "Fin",
                                            "Puesto",
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
                                            <tr key={r.idconvocatoria}>
                                                <td style={tdStyle}>
                                                    {r.nombreconvocatoria}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.fechainicio}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.fechafin || "-"}
                                                </td>
                                                <td style={tdStyle}>
                                                    {r.idpuesto}
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
                                                        ? "Activa"
                                                        : "Inactiva"}
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
                                                colSpan="6"
                                                style={{
                                                    textAlign: "center",
                                                    padding: 20,
                                                }}
                                            >
                                                Sin registros
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

export default ConvocatoriasContainer;
