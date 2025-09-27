// containers/pueblocultura/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const PuebloCulturaContainer = () => {
    const [nombrePueblo, setNombrePueblo] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [pueblos, setPueblos] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchPueblos();
    }, []);

    const fetchPueblos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/pueblocultura/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setPueblos(data);
        } catch (error) {
            console.error("Error al cargar pueblos:", error);
            setPueblos([]);
            setMensaje("Error al cargar los pueblos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                nombrepueblo: nombrePueblo,
                estado: estadoActivo,
                idusuario: 1, // reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/pueblocultura/${editingId}/`,
                    data
                );
                setMensaje("Pueblo actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/pueblocultura/", data);
                setMensaje("Pueblo registrado correctamente");
            }

            setNombrePueblo("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchPueblos();
        } catch (error) {
            console.error("Error al guardar pueblo:", error);
            setMensaje("Error al registrar el pueblo");
        }
    };

    const handleEdit = (pueblo) => {
        setNombrePueblo(pueblo.nombrepueblo);
        setEstadoActivo(pueblo.estado);
        setEditingId(pueblo.idpueblocultura);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar este pueblo?")) return;
        try {
            const pueblo = pueblos.find((p) => p.idpueblocultura === id);
            if (!pueblo) return;

            await axios.put(`http://127.0.0.1:8000/api/pueblocultura/${id}/`, {
                nombrepueblo: pueblo.nombrepueblo,
                estado: false,
                idusuario: pueblo.idusuario,
            });

            setMensaje("Pueblo desactivado correctamente");
            fetchPueblos();
        } catch (error) {
            console.error("Error al desactivar pueblo:", error.response?.data || error);
            setMensaje("Error al desactivar el pueblo");
        }
    };

    const handleActivate = async (id) => {
        try {
            const pueblo = pueblos.find((p) => p.idpueblocultura === id);
            if (!pueblo) return;

            await axios.put(`http://127.0.0.1:8000/api/pueblocultura/${id}/`, {
                nombrepueblo: pueblo.nombrepueblo,
                estado: true,
                idusuario: pueblo.idusuario,
            });

            setMensaje("Pueblo activado correctamente");
            fetchPueblos();
        } catch (error) {
            console.error("Error al activar pueblo:", error.response?.data || error);
            setMensaje("Error al activar el pueblo");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Pueblos Cultura" />
            <div
                className="wrapper"
                style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
            >
                <Header />

                <main
                    style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5" }}
                >
                    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
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
                                {editingId ? "Editar pueblo" : "Registrar un nuevo pueblo"}
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
                                    <label
                                        htmlFor="nombrePueblo"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Nombre del Pueblo
                                    </label>
                                    <input
                                        type="text"
                                        id="nombrePueblo"
                                        value={nombrePueblo}
                                        onChange={(e) => setNombrePueblo(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px 15px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px",
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        marginBottom: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="estadoActivo"
                                        checked={estadoActivo}
                                        onChange={(e) => setEstadoActivo(e.target.checked)}
                                        style={{ width: "18px", height: "18px" }}
                                    />
                                    <label
                                        htmlFor="estadoActivo"
                                        style={{ fontWeight: "600", cursor: "pointer" }}
                                    >
                                        Activo
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "12px 0",
                                        background: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    {editingId ? "Actualizar Pueblo" : "Guardar Pueblo"}
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
                                Pueblos Registrados
                            </h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "left",
                                            }}
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            Estado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(pueblos) && pueblos.length > 0 ? (
                                        pueblos.map((pueblo) => (
                                            <tr key={pueblo.idpueblocultura}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {pueblo.nombrepueblo}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: pueblo.estado ? "green" : "red",
                                                        fontWeight: "600",
                                                        borderBottom: "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {pueblo.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        borderBottom: "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(pueblo)}
                                                        style={{
                                                            padding: "6px 14px",
                                                            background: "#ffc107",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            marginRight: "6px",
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {pueblo.estado ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(pueblo.idpueblocultura)
                                                            }
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#dc3545",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleActivate(
                                                                    pueblo.idpueblocultura
                                                                )
                                                            }
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#28a745",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                                fontSize: "14px",
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
                                            <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                                                No hay pueblos registrados
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

export default PuebloCulturaContainer;
