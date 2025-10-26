// containers/evaluacioncriterio/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

const EvaluacionCriterioContainer = () => {
    const [idEvaluacion, setIdEvaluacion] = useState("");
    const [idCriterioEvaluacion, setIdCriterioEvaluacion] = useState("");
    const [puntajeCriterio, setPuntajeCriterio] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEvaluaciones();
    }, []);

    const fetchEvaluaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/evaluacioncriterio/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setEvaluaciones(data);
        } catch (error) {
            console.error("Error al cargar evaluaciones:", error);
            setEvaluaciones([]);
            setMensaje("Error al cargar evaluaciones");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                idevaluacion: idEvaluacion || null,
                idcriterioevaluacion: idCriterioEvaluacion || null,
                puntajecriterio: puntajeCriterio,
                estado: estadoActivo,
                idusuario: 1 // reemplazar por usuario logueado
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/evaluacioncriterio/${editingId}/`, data);
                setMensaje("Evaluación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/evaluacioncriterio/", data);
                setMensaje("Evaluación registrada correctamente");
            }

            // Reset form
            setIdEvaluacion("");
            setIdCriterioEvaluacion("");
            setPuntajeCriterio("");
            setEstadoActivo(true);
            setEditingId(null);

            fetchEvaluaciones();
        } catch (error) {
            console.error("Error al guardar evaluación:", error.response?.data || error);
            setMensaje("Error al registrar la evaluación");
        }
    };

    const handleEdit = evaluacion => {
        setIdEvaluacion(evaluacion.idevaluacion || "");
        setIdCriterioEvaluacion(evaluacion.idcriterioevaluacion || "");
        setPuntajeCriterio(evaluacion.puntajecriterio);
        setEstadoActivo(evaluacion.estado);
        setEditingId(evaluacion.idevaluacioncriterio);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar esta evaluación?")) return;
        try {
            const evaluacion = evaluaciones.find(e => e.idevaluacioncriterio === id);
            if (!evaluacion) return;

            await axios.put(`http://127.0.0.1:8000/api/evaluacioncriterio/${id}/`, {
                ...evaluacion,
                estado: false
            });

            setMensaje("Evaluación desactivada correctamente");
            fetchEvaluaciones();
        } catch (error) {
            console.error("Error al desactivar evaluación:", error.response?.data || error);
            setMensaje("Error al desactivar la evaluación");
        }
    };

    const handleActivate = async id => {
        try {
            const evaluacion = evaluaciones.find(e => e.idevaluacioncriterio === id);
            if (!evaluacion) return;

            await axios.put(`http://127.0.0.1:8000/api/evaluacioncriterio/${id}/`, {
                ...evaluacion,
                estado: true
            });

            setMensaje("Evaluación activada correctamente");
            fetchEvaluaciones();
        } catch (error) {
            console.error("Error al activar evaluación:", error.response?.data || error);
            setMensaje("Error al activar la evaluación");
        }
    };

    return (
        <Layout>
            <SEO title="Evaluaciones por Criterio" />
            <div
                className="wrapper"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh"
                }}
            >
                <Header />
                <main
                    style={{
                        flex: 1,
                        padding: "60px 20px",
                        background: "#f0f2f5"
                    }}
                >
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
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: "30px"
                                }}
                            >
                                {editingId ? "Editar Evaluación" : "Registrar nueva Evaluación"}
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
                                    <label>ID Evaluación</label>
                                    <input
                                        type="number"
                                        value={idEvaluacion}
                                        onChange={e => setIdEvaluacion(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Criterio Evaluación</label>
                                    <input
                                        type="number"
                                        value={idCriterioEvaluacion}
                                        onChange={e => setIdCriterioEvaluacion(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "10px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Puntaje Criterio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={puntajeCriterio}
                                        onChange={e => setPuntajeCriterio(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px"
                                        }}
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
                            <h3
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center"
                                }}
                            >
                                Evaluaciones por Criterio Registradas
                            </h3>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px"
                                            }}
                                        >
                                            Evaluación
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px"
                                            }}
                                        >
                                            Criterio
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px"
                                            }}
                                        >
                                            Puntaje
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px"
                                            }}
                                        >
                                            Estado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px"
                                            }}
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {evaluaciones.length > 0 ? (
                                        evaluaciones.map(e => (
                                            <tr key={e.idevaluacioncriterio}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {e.idevaluacion || "N/A"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {e.idcriterioevaluacion || "N/A"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {e.puntajecriterio}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: e.estado ? "green" : "red",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    {e.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center"
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => handleEdit(e)}
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
                                                    {e.estado ? (
                                                        <button
                                                            onClick={() => handleDelete(e.idevaluacioncriterio)}
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
                                                            onClick={() => handleActivate(e.idevaluacioncriterio)}
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
                                            <td
                                                colSpan="5"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px"
                                                }}
                                            >
                                                No hay evaluaciones registradas
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

export default EvaluacionCriterioContainer;
