// containers/amonestacion/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const AmonestacionContainer = () => {
    const [idEmpleado, setIdEmpleado] = useState("");
    const [tipo, setTipo] = useState("");
    const [fechaAmonestacion, setFechaAmonestacion] = useState("");
    const [motivo, setMotivo] = useState("");
    const [idDocumento, setIdDocumento] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [amonestaciones, setAmonestaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAmonestaciones();
    }, []);

    const fetchAmonestaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/amonestaciones/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setAmonestaciones(data);
        } catch (error) {
            console.error("Error al cargar amonestaciones:", error);
            setAmonestaciones([]);
            setMensaje("Error al cargar las amonestaciones");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                idempleado: idEmpleado || null,
                tipo,
                fechaamonestacion: fechaAmonestacion,
                motivo,
                iddocumento: idDocumento,
                estado: estadoActivo,
                idusuario: 1, // Reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/amonestaciones/${editingId}/`,
                    data
                );
                setMensaje("Amonestación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/amonestaciones/", data);
                setMensaje("Amonestación registrada correctamente");
            }

            // Reset form
            setIdEmpleado("");
            setTipo("");
            setFechaAmonestacion("");
            setMotivo("");
            setIdDocumento("");
            setEstadoActivo(true);
            setEditingId(null);

            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al guardar amonestación:", error.response?.data || error);
            setMensaje("Error al registrar la amonestación");
        }
    };

    const handleEdit = (amon) => {
        setIdEmpleado(amon.idempleado || "");
        setTipo(amon.tipo);
        setFechaAmonestacion(amon.fechaamonestacion);
        setMotivo(amon.motivo);
        setIdDocumento(amon.iddocumento);
        setEstadoActivo(amon.estado);
        setEditingId(amon.idamonestacion);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar esta amonestación?")) return;
        try {
            const amon = amonestaciones.find((a) => a.idamonestacion === id);
            if (!amon) return;

            await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
                ...amon,
                estado: false,
            });

            setMensaje("Amonestación desactivada correctamente");
            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al desactivar amonestación:", error.response?.data || error);
            setMensaje("Error al desactivar la amonestación");
        }
    };

    const handleActivate = async (id) => {
        try {
            const amon = amonestaciones.find((a) => a.idamonestacion === id);
            if (!amon) return;

            await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
                ...amon,
                estado: true,
            });

            setMensaje("Amonestación activada correctamente");
            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al activar amonestación:", error.response?.data || error);
            setMensaje("Error al activar la amonestación");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Amonestaciones" />
            <div
                className="wrapper"
                style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
            >
                <Header />

                <main style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                        {/* --- FORMULARIO --- */}
                        <div
                            style={{
                                background: "#fff",
                                padding: "40px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                marginBottom: "40px",
                            }}
                        >
                            <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
                                {editingId ? "Editar Amonestación" : "Registrar nueva Amonestación"}
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error") ? "red" : "green",
                                        marginBottom: "20px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Empleado</label>
                                    <input
                                        type="number"
                                        value={idEmpleado}
                                        onChange={(e) => setIdEmpleado(e.target.value)}
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Tipo</label>
                                    <input
                                        type="text"
                                        value={tipo}
                                        onChange={(e) => setTipo(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Fecha de Amonestación</label>
                                    <input
                                        type="date"
                                        value={fechaAmonestacion}
                                        onChange={(e) => setFechaAmonestacion(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Motivo</label>
                                    <input
                                        type="text"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Documento</label>
                                    <input
                                        type="text"
                                        value={idDocumento}
                                        onChange={(e) => setIdDocumento(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <input
                                        type="checkbox"
                                        checked={estadoActivo}
                                        onChange={(e) => setEstadoActivo(e.target.checked)}
                                    />{" "}
                                    Activo
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    {editingId ? "Actualizar" : "Guardar"}
                                </button>
                            </form>
                        </div>

                        {/* --- TABLA --- */}
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                padding: "20px 30px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                maxHeight: "600px",
                                overflowY: "auto",
                            }}
                        >
                            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                                Amonestaciones Registradas
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Empleado</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Tipo</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Fecha</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Motivo</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Documento</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Estado</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {amonestaciones.length > 0 ? (
                                        amonestaciones.map((a) => (
                                            <tr key={a.idamonestacion}>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {a.idempleado || "N/A"}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{a.tipo}</td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{a.fechaamonestacion}</td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{a.motivo}</td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{a.iddocumento}</td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: a.estado ? "green" : "red",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {a.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td style={{ padding: "10px", textAlign: "center" }}>
                                                    <button
                                                        onClick={() => handleEdit(a)}
                                                        style={{
                                                            padding: "6px 14px",
                                                            background: "#ffc107",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            marginRight: "6px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    {a.estado ? (
                                                        <button
                                                            onClick={() => handleDelete(a.idamonestacion)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#dc3545",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(a.idamonestacion)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#28a745",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            Activar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                                                No hay amonestaciones registradas
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

export default AmonestacionContainer;
