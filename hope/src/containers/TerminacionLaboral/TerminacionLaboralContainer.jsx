// containers/terminacionlaboral/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const TerminacionLaboralContainer = () => {
    const [tipoTerminacion, setTipoTerminacion] = useState("");
    const [fechaTerminacion, setFechaTerminacion] = useState("");
    const [causa, setCausa] = useState("");
    const [observacion, setObservacion] = useState("");
    const [idDocumento, setIdDocumento] = useState("");
    const [idContrato, setIdContrato] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [terminaciones, setTerminaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTerminaciones();
    }, []);

    const fetchTerminaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/terminacionlaboral/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setTerminaciones(data);
        } catch (error) {
            console.error("Error al cargar terminaciones:", error);
            setTerminaciones([]);
            setMensaje("Error al cargar las terminaciones");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                tipoterminacion: tipoTerminacion,
                fechaterminacion: fechaTerminacion,
                causa: causa || null,
                observacion,
                iddocumento: idDocumento,
                idcontrato: idContrato || null,
                estado: estadoActivo,
                idusuario: 1 // reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/terminacionlaboral/${editingId}/`, data);
                setMensaje("Terminación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/terminacionlaboral/", data);
                setMensaje("Terminación registrada correctamente");
            }

            // Reset form
            setTipoTerminacion("");
            setFechaTerminacion("");
            setCausa("");
            setObservacion("");
            setIdDocumento("");
            setIdContrato("");
            setEstadoActivo(true);
            setEditingId(null);

            fetchTerminaciones();
        } catch (error) {
            console.error("Error al guardar terminación:", error);
            setMensaje("Error al registrar la terminación");
        }
    };

    const handleEdit = terminacion => {
        setTipoTerminacion(terminacion.tipoterminacion);
        setFechaTerminacion(terminacion.fechaterminacion);
        setCausa(terminacion.causa || "");
        setObservacion(terminacion.observacion);
        setIdDocumento(terminacion.iddocumento);
        setIdContrato(terminacion.idcontrato || "");
        setEstadoActivo(terminacion.estado);
        setEditingId(terminacion.idterminacionlaboral);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar esta terminación?")) return;
        try {
            const terminacion = terminaciones.find(t => t.idterminacionlaboral === id);
            if (!terminacion) return;

            await axios.put(`http://127.0.0.1:8000/api/terminacionlaboral/${id}/`, {
                ...terminacion,
                estado: false
            });

            setMensaje("Terminación desactivada correctamente");
            fetchTerminaciones();
        } catch (error) {
            console.error("Error al desactivar terminación:", error.response?.data || error);
            setMensaje("Error al desactivar la terminación");
        }
    };

    const handleActivate = async id => {
        try {
            const terminacion = terminaciones.find(t => t.idterminacionlaboral === id);
            if (!terminacion) return;

            await axios.put(`http://127.0.0.1:8000/api/terminacionlaboral/${id}/`, {
                ...terminacion,
                estado: true
            });

            setMensaje("Terminación activada correctamente");
            fetchTerminaciones();
        } catch (error) {
            console.error("Error al activar terminación:", error.response?.data || error);
            setMensaje("Error al activar la terminación");
        }
    };

    return (
        <Layout>
            <SEO title="Terminaciones Laborales" />
            <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
                                marginBottom: "40px"
                            }}
                        >
                            <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
                                {editingId ? "Editar Terminación" : "Registrar nueva Terminación"}
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error") ? "red" : "green",
                                        marginBottom: "20px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label>Tipo de Terminación</label>
                                    <input
                                        type="text"
                                        value={tipoTerminacion}
                                        onChange={e => setTipoTerminacion(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Fecha de Terminación</label>
                                    <input
                                        type="date"
                                        value={fechaTerminacion}
                                        onChange={e => setFechaTerminacion(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Causa</label>
                                    <input
                                        type="text"
                                        value={causa}
                                        onChange={e => setCausa(e.target.value)}
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Observación</label>
                                    <input
                                        type="text"
                                        value={observacion}
                                        onChange={e => setObservacion(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Documento</label>
                                    <input
                                        type="number"
                                        value={idDocumento}
                                        onChange={e => setIdDocumento(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Contrato</label>
                                    <input
                                        type="number"
                                        value={idContrato}
                                        onChange={e => setIdContrato(e.target.value)}
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <input
                                        type="checkbox"
                                        checked={estadoActivo}
                                        onChange={e => setEstadoActivo(e.target.checked)}
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
                                        cursor: "pointer"
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
                                overflowY: "auto"
                            }}
                        >
                            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                                Terminaciones Laborales Registradas
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Tipo</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Fecha</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Causa</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Observación</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Documento</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Contrato</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Estado</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terminaciones.length > 0 ? (
                                        terminaciones.map(t => (
                                            <tr key={t.idterminacionlaboral}>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.tipoterminacion}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.fechaterminacion}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.causa}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.observacion}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.iddocumento}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {t.idcontrato || "N/A"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: t.estado ? "green" : "red",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    {t.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td style={{ padding: "10px", textAlign: "center" }}>
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        style={{
                                                            padding: "6px 14px",
                                                            background: " #FED7AA",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            marginRight: "6px",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    {t.estado ? (
                                                        <button
                                                            onClick={() => handleDelete(t.idterminacionlaboral)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#F87171",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(t.idterminacionlaboral)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#28a745",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer"
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
                                            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                                No hay terminaciones registradas
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

export default TerminacionLaboralContainer;
