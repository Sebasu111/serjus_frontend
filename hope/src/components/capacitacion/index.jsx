import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import SidebarMenu from "../../components/menu/main-menu/index.jsx";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import AsignarCapacitacion from "./AsignarCapacitacion";

const CapacitacionContainer = () => {
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // Modal
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Campos de formulario
    const [nombreEvento, setNombreEvento] = useState("");
    const [lugar, setLugar] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [institucion, setInstitucion] = useState("");
    const [monto, setMonto] = useState("");

    useEffect(() => {
        fetchCapacitaciones();
    }, []);

    const fetchCapacitaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
            setCapacitaciones(Array.isArray(res.data.results) ? res.data.results : []);
        } catch (error) {
            console.error(error);
            setCapacitaciones([]);
            setMensaje("Error al cargar capacitaciones");
        }
    };

    const validarFormulario = () => {
        if (!nombreEvento.trim()) return "El nombre del evento es obligatorio";
        if (!lugar.trim()) return "El lugar es obligatorio";
        if (!fechaInicio) return "La fecha de inicio es obligatoria";
        if (!fechaFin) return "La fecha de fin es obligatoria";
        if (new Date(fechaInicio) > new Date(fechaFin)) return "La fecha de fin no puede ser menor a la fecha de inicio";
        if (!institucion.trim()) return "La institución facilitadora es obligatoria";
        if (isNaN(monto) || Number(monto) <= 0) return "El monto debe ser un número mayor a 0";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorValidacion = validarFormulario();
        if (errorValidacion) {
            setMensaje(errorValidacion);
            return;
        }

        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            const data = {
                nombreevento: nombreEvento,
                lugar,
                fechainicio: fechaInicio,
                fechafin: fechaFin,
                institucionfacilitadora: institucion,
                montoejecutado: monto,
                estado: true,
                idusuario: idUsuario,
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/capacitaciones/${editingId}/`, data);
                setMensaje("Capacitación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/capacitaciones/", data);
                setMensaje("Capacitación registrada correctamente");
            }

            resetForm();
            setMostrarFormulario(false);
            fetchCapacitaciones();
        } catch (error) {
            console.error(error);
            setMensaje("Error al registrar la capacitación");
        }
    };

    const handleEdit = (c) => {
        setNombreEvento(c.nombreevento || "");
        setLugar(c.lugar || "");
        setFechaInicio(c.fechainicio || "");
        setFechaFin(c.fechafin || "");
        setInstitucion(c.institucionfacilitadora || "");
        setMonto(c.montoejecutado || "");
        setEditingId(c.idcapacitacion || c.id);
        setMostrarFormulario(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de desactivar esta capacitación?")) return;
        try {
            const cap = capacitaciones.find((c) => (c.idcapacitacion || c.id) === id);
            const idUsuario = sessionStorage.getItem("idUsuario");

            await axios.put(`http://127.0.0.1:8000/api/capacitaciones/${id}/`, {
                ...cap,
                estado: false,
                idusuario: idUsuario,
            });

            setMensaje("Capacitación desactivada correctamente");
            fetchCapacitaciones();
        } catch (error) {
            console.error(error);
            setMensaje("Error al desactivar capacitación");
        }
    };

    const resetForm = () => {
        setNombreEvento("");
        setLugar("");
        setFechaInicio("");
        setFechaFin("");
        setInstitucion("");
        setMonto("");
        setEditingId(null);
    };

    // Filtrado + paginación
    const capacitacionesFiltradas = capacitaciones.filter((c) =>
        c.nombreevento?.toLowerCase().includes(busqueda.toLowerCase())
    );
    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const capacitacionesPaginadas = capacitacionesFiltradas.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(capacitacionesFiltradas.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Hope – Capacitación" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <SidebarMenu />
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Capacitaciones Registradas</h2>

                            {mensaje && (
                                <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", fontWeight: "bold" }}>
                                    {mensaje}
                                </p>
                            )}

                            {/* BUSCADOR */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                                <input
                                    type="text"
                                    placeholder="Buscar capacitación..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "10px" }}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => setElementosPorPagina(Number(e.target.value))}
                                    style={{ width: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
                                />
                            </div>

                            {/* TABLA */}
                            <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr>
                                            <th>Evento</th>
                                            <th>Lugar</th>
                                            <th>Fechas</th>
                                            <th>Institución</th>
                                            <th>Monto</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {capacitacionesPaginadas.length > 0 ? capacitacionesPaginadas.map(c => {
                                            const id = c.idcapacitacion || c.id;
                                            return (
                                                <tr key={id}>
                                                    <td>{c.nombreevento}</td>
                                                    <td>{c.lugar}</td>
                                                    <td>{c.fechainicio} - {c.fechafin}</td>
                                                    <td>{c.institucionfacilitadora}</td>
                                                    <td>Q {c.montoejecutado || 0}</td>
                                                    <td>
                                                        <button onClick={() => handleEdit(c)} style={{ marginRight: "6px" }}>Editar</button>
                                                        <button onClick={() => handleDelete(id)} style={{ marginRight: "6px" }}>Eliminar</button>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No hay capacitaciones registradas</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* PAGINACIÓN */}
                                {totalPaginas > 1 && (
                                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                                        {Array.from({ length: totalPaginas }, (_, i) => (
                                            <button key={i + 1} onClick={() => setPaginaActual(i + 1)}
                                                style={{
                                                    margin: "0 5px",
                                                    padding: "6px 12px",
                                                    border: "1px solid #007bff",
                                                    background: paginaActual === i + 1 ? "#007bff" : "#fff",
                                                    color: paginaActual === i + 1 ? "#fff" : "#007bff",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >{i + 1}</button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* BOTONES NUEVO / ASIGNAR */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                                <button onClick={() => setMostrarFormulario(true)} style={{ padding: "12px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                                    Nueva Capacitación
                                </button>

                                <button onClick={() => setMostrarAsignacion(true)} style={{ padding: "12px 20px", background: "#28a745", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                                    Asignar Capacitación
                                </button>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                {/* MODAL CREAR / EDITAR */}
                {mostrarFormulario && (
                    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", maxWidth: "95%", background: "#fff", padding: "30px", boxShadow: "0 0 20px rgba(0,0,0,0.2)", borderRadius: "12px", zIndex: 1000 }}>
                        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>{editingId ? "Editar Capacitación" : "Registrar Capacitación"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input placeholder="Nombre del evento" value={nombreEvento} onChange={(e) => setNombreEvento(e.target.value)} />
                            <input placeholder="Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} />
                            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                            <input placeholder="Institución facilitadora" value={institucion} onChange={(e) => setInstitucion(e.target.value)} />
                            <input type="number" placeholder="Monto ejecutado" value={monto} onChange={(e) => setMonto(e.target.value)} />
                            <button type="submit" style={{ marginTop: "15px", width: "100%" }}>{editingId ? "Actualizar" : "Guardar"}</button>
                        </form>
                        <button onClick={() => setMostrarFormulario(false)} style={{ marginTop: "10px", width: "100%" }}>Cerrar</button>
                    </div>
                )}

                {/* MODAL ASIGNAR CAPACITACIÓN */}
                {mostrarAsignacion && (
                    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", maxWidth: "95%", background: "#fff", padding: "30px", boxShadow: "0 0 20px rgba(0,0,0,0.2)", borderRadius: "12px", zIndex: 1000 }}>
                        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Asignar Capacitación</h3>
                        <AsignarCapacitacion />
                        <button onClick={() => setMostrarAsignacion(false)} style={{ marginTop: "10px", width: "100%" }}>Cerrar</button>
                    </div>
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default CapacitacionContainer;
