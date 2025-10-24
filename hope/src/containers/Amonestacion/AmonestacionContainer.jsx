import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import AmonestacionForm from "./AmonestacionForm.jsx";
import AmonestacionTable from "./AmonestacionTable.jsx";

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
    const [showForm, setShowForm] = useState(false);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetchAmonestaciones();
    }, []);

    const fetchAmonestaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/amonestaciones/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setAmonestaciones(data);
        } catch (error) {
            console.error("Error al cargar amonestaciones:", error);
            setAmonestaciones([]);
            setMensaje("Error al cargar las amonestaciones");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                idempleado: idEmpleado || null,
                tipo,
                fechaamonestacion: fechaAmonestacion,
                motivo,
                iddocumento: idDocumento,
                estado: estadoActivo,
                idusuario: 1
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${editingId}/`, data);
                setMensaje("Amonestación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/amonestaciones/", data);
                setMensaje("Amonestación registrada correctamente");
            }

            setIdEmpleado("");
            setTipo("");
            setFechaAmonestacion("");
            setMotivo("");
            setIdDocumento("");
            setEstadoActivo(true);
            setEditingId(null);
            setShowForm(false);

            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al guardar amonestación:", error.response?.data || error);
            setMensaje("Error al registrar la amonestación");
        }
    };

    const handleEdit = amon => {
        setIdEmpleado(amon.idempleado || "");
        setTipo(amon.tipo);
        setFechaAmonestacion(amon.fechaamonestacion);
        setMotivo(amon.motivo);
        setIdDocumento(amon.iddocumento);
        setEstadoActivo(amon.estado);
        setEditingId(amon.idamonestacion);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar esta amonestación?")) return;
        try {
            const amon = amonestaciones.find(a => a.idamonestacion === id);
            if (!amon) return;

            await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
                ...amon,
                estado: false
            });

            setMensaje("Amonestación desactivada correctamente");
            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al desactivar amonestación:", error.response?.data || error);
            setMensaje("Error al desactivar la amonestación");
        }
    };

    const handleActivate = async id => {
        try {
            const amon = amonestaciones.find(a => a.idamonestacion === id);
            if (!amon) return;

            await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
                ...amon,
                estado: true
            });

            setMensaje("Amonestación activada correctamente");
            fetchAmonestaciones();
        } catch (error) {
            console.error("Error al activar amonestación:", error.response?.data || error);
            setMensaje("Error al activar la amonestación");
        }
    };

    const amonestacionesFiltradas = amonestaciones.filter(a => {
        const texto = busqueda.toLowerCase().trim();
        return (
            a.motivo?.toLowerCase().includes(texto) ||
            a.tipo?.toLowerCase().includes(texto) ||
            (a.estado ? "activo" : "inactivo").startsWith(texto)
        );
    });

    return (
        <Layout>
            <SEO title=" Amonestaciones" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Registro de Amonestaciones</h2>

                            {/* Buscador y botón de nuevo */}
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
                                    placeholder="Buscar amonestación..."
                                    value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginRight: "10px"
                                    }}
                                />
                                <button
                                    onClick={() => setShowForm(true)}
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
                                    Nueva Amonestación
                                </button>
                            </div>

                            {/* Mostrar formulario solo si está activo */}
                            {showForm && (
                                <AmonestacionForm
                                    idEmpleado={idEmpleado}
                                    tipo={tipo}
                                    fechaAmonestacion={fechaAmonestacion}
                                    motivo={motivo}
                                    idDocumento={idDocumento}
                                    estadoActivo={estadoActivo}
                                    mensaje={mensaje}
                                    editingId={editingId}
                                    setIdEmpleado={setIdEmpleado}
                                    setTipo={setTipo}
                                    setFechaAmonestacion={setFechaAmonestacion}
                                    setMotivo={setMotivo}
                                    setIdDocumento={setIdDocumento}
                                    setEstadoActivo={setEstadoActivo}
                                    handleSubmit={handleSubmit}
                                    onClose={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                    }}
                                />
                            )}

                            {/* Tabla */}
                            <AmonestacionTable
                                amonestaciones={amonestacionesFiltradas}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleActivate={handleActivate}
                            />
                        </div>
                    </main>
                    <Footer />
                </div>
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default AmonestacionContainer;
