// containers/criterioevaluacion/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

const CriterioEvaluacionContainer = () => {
    const [nombreCriterio, setNombreCriterio] = useState("");
    const [descripcionCriterio, setDescripcionCriterio] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [criterios, setCriterios] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCriterios();
    }, []);

    const fetchCriterios = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/criterioevaluacion/ ");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setCriterios(data);
        } catch (error) {
            console.error("Error al cargar criterios:", error);
            setCriterios([]);
            setMensaje("Error al cargar los criterios");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                nombrecriterio: nombreCriterio,
                descripcioncriterio: descripcionCriterio,
                estado: estadoActivo,
                idusuario: 1 // reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/criterioevaluacion/ ${editingId}/`, data);
                setMensaje("Criterio actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/criterioevaluacion/ ", data);
                setMensaje("Criterio registrado correctamente");
            }

            setNombreCriterio("");
            setDescripcionCriterio("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchCriterios();
        } catch (error) {
            console.error("Error al guardar criterio:", error.response?.data || error);
            setMensaje("Error al registrar el criterio");
        }
    };

    const handleEdit = criterio => {
        setNombreCriterio(criterio.nombrecriterio);
        setDescripcionCriterio(criterio.descripcioncriterio);
        setEstadoActivo(criterio.estado);
        setEditingId(criterio.idcriterioevaluacion);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar este criterio?")) return;
        try {
            const crit = criterios.find(c => c.idcriterioevaluacion === id);
            if (!crit) return;

            await axios.put(`http://127.0.0.1:8000/api/criterioevaluacion/ ${id}/`, {
                ...crit,
                estado: false
            });

            setMensaje("Criterio desactivado correctamente");
            fetchCriterios();
        } catch (error) {
            console.error("Error al desactivar criterio:", error.response?.data || error);
            setMensaje("Error al desactivar el criterio");
        }
    };

    const handleActivate = async id => {
        try {
            const crit = criterios.find(c => c.idcriterioevaluacion === id);
            if (!crit) return;

            await axios.put(`http://127.0.0.1:8000/api/criterioevaluacion/ ${id}/`, {
                ...crit,
                estado: true
            });

            setMensaje("Criterio activado correctamente");
            fetchCriterios();
        } catch (error) {
            console.error("Error al activar criterio:", error.response?.data || error);
            setMensaje("Error al activar el criterio");
        }
    };

    return (
        <Layout>
            <SEO title="Criterios de Evaluación" />
            <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Header />

                <main style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5" }}>
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
                                {editingId ? "Editar Criterio" : "Registrar nuevo Criterio"}
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
                                    <label>Nombre del Criterio</label>
                                    <input
                                        type="text"
                                        value={nombreCriterio}
                                        onChange={e => setNombreCriterio(e.target.value)}
                                        required
                                        style={{ width: "100%", padding: "10px" }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Descripción</label>
                                    <input
                                        type="text"
                                        value={descripcionCriterio}
                                        onChange={e => setDescripcionCriterio(e.target.value)}
                                        required
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
                                Criterios de Evaluación Registrados
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Nombre</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Descripción</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Estado</th>
                                        <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {criterios.length > 0 ? (
                                        criterios.map(c => (
                                            <tr key={c.idcriterioevaluacion}>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {c.nombrecriterio}
                                                </td>
                                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                                    {c.descripcioncriterio}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: c.estado ? "green" : "red",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    {c.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td style={{ padding: "10px", textAlign: "center" }}>
                                                    <button
                                                        onClick={() => handleEdit(c)}
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
                                                    {c.estado ? (
                                                        <button
                                                            onClick={() => handleDelete(c.idcriterioevaluacion)}
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
                                                            onClick={() => handleActivate(c.idcriterioevaluacion)}
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
                                            <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                                                No hay criterios registrados
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

export default CriterioEvaluacionContainer;
