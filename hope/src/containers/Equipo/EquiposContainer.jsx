import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

import EquipoForm from "./EquipoForm";
import ConfirmModal from "./ConfirmModal";
import EquiposTable from "./EquiposTable";

const API_BASE = "http://127.0.0.1:8000/api";

const EquiposContainer = () => {
    const [nombreEquipo, setNombreEquipo] = useState("");
    const [idCoordinador, setIdCoordinador] = useState("");
    const [equipos, setEquipos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [equipoActivoEditando, setEquipoActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [idEquipo, setIdEquipo] = useState("");

    useEffect(() => {
        fetchEquipos();
        fetchEmpleados();
    }, []);

    const fetchEquipos = async () => {
        try {
            const res = await axios.get(`${API_BASE}/equipos/`);
            const raw = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            // Normalizamos claves a camelCase para la UI
            const data = raw.map((e) => ({
                idEquipo: e.idEquipo ?? e.idequipo ?? e.id,
                nombreEquipo: e.nombreEquipo ?? e.nombreequipo,
                idCoordinador: e.idCoordinador ?? e.idcoordinador,
                estado: e.estado,
            }));
            setEquipos(data);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los equipos", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(`${API_BASE}/empleados/`);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            const activos = data.filter((e) => e.estado !== false);
            setEmpleados(activos);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los empleados", "error");
        }
    };

    const empleadoDisplayName = (emp) =>
        emp?.nombreCompleto ||
        [emp?.nombres, emp?.apellidos].filter(Boolean).join(" ") ||
        emp?.nombre ||
        emp?.nombre_empleado ||
        `Empleado #${emp?.idEmpleado || emp?.idempleado || "?"}`;

    const empleadoId = (emp) =>
        emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

    // Map idEmpleado -> nombre para render rápido en la tabla
    const empleadosMap = useMemo(() => {
        const m = new Map();
        empleados.forEach((e) => m.set(empleadoId(e), empleadoDisplayName(e)));
        return m;
    }, [empleados]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idEquipo || !idCoordinador) return;

        const idUsuario = Number(sessionStorage.getItem("idUsuario"));

        // Buscar el equipo seleccionado por idEquipo
        const equipoSeleccionado = equipos.find((eq) => eq.idEquipo === idEquipo);
        if (!equipoSeleccionado) {
            showToast("No se encontró el equipo seleccionado", "error");
            return;
        }

        try {
            const payload = {
                nombreequipo: equipoSeleccionado.nombreEquipo, // <-- STRING
                idcoordinador: Number(idCoordinador),
                idusuario: idUsuario,
            };

            await axios.put(`${API_BASE}/equipos/${idEquipo}/`, payload);

            showToast("Coordinador asignado correctamente");

            setIdEquipo("");
            setNombreEquipo(equipoSeleccionado.nombreEquipo); // opcional
            setIdCoordinador("");
            setEditingId(null);
            setMostrarFormulario(false);
            fetchEquipos();
        } catch (error) {
            console.error("PUT /equipos error:", error.response?.data || error);
            showToast("Error al asignar coordinador", "error");
        }
    };

    const handleEdit = (equipo) => {
        if (!equipo.estado) {
            showToast("No se puede editar un equipo inactivo");
            return;
        }
        setIdEquipo(equipo.idEquipo);
        setNombreEquipo(equipo.nombreEquipo);
        setIdCoordinador(equipo.idCoordinador);
        setEditingId(equipo.idEquipo);
        setMostrarFormulario(true);
    };


    const handleDelete = (equipo) => {
        setEquipoSeleccionado(equipo);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacionEquipo = async () => {
        if (!equipoSeleccionado) return;
        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API_BASE}/equipos/${equipoSeleccionado.idEquipo}/`, {
                nombreequipo: equipoSeleccionado.nombreEquipo,
                idcoordinador: Number(equipoSeleccionado.idCoordinador),
                estado: false,
                idusuario: idUsuario,
            });
            showToast("Equipo desactivado correctamente");
            fetchEquipos();
        } catch (error) {
            console.error("PUT desactivar /equipos error:", error.response?.data || error);
            showToast(
                `Error al desactivar: ${JSON.stringify(error.response?.data || "desconocido")}`,
                "error"
            );
        } finally {
            setMostrarConfirmacion(false);
            setEquipoSeleccionado(null);
        }
    };

    const handleActivate = async (id) => {
        try {
            const equipo = equipos.find((e) => e.idEquipo === id);
            if (!equipo) return;
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API_BASE}/equipos/${id}/`, {
                nombreequipo: equipo.nombreEquipo,
                idcoordinador: Number(equipo.idCoordinador),
                estado: true,
                idusuario: idUsuario,
            });
            showToast("Equipo activado correctamente");
            fetchEquipos();
        } catch (error) {
            console.error("PUT activar /equipos error:", error.response?.data || error);
            showToast(
                `Error al activar: ${JSON.stringify(error.response?.data || "desconocido")}`,
                "error"
            );
        }
    };

    const equiposFiltrados = equipos.filter((e) => {
        const texto = busqueda.toLowerCase().trim();
        const nombreCoincide = e.nombreEquipo?.toLowerCase().includes(texto) || false;
        const estadoCoincide = (e.estado ? "activo" : "inactivo").startsWith(texto);
        const coordName = empleadosMap.get(e.idCoordinador)?.toLowerCase() || "";
        const coordinadorCoincide = coordName.includes(texto);
        return nombreCoincide || estadoCoincide || coordinadorCoincide;
    });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const equiposPaginados = equiposFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(equiposFiltrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Equipos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Equipos Registrados</h2>

                            {/* Buscador y botón nuevo */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Buscar equipo / coordinador / estado..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "10px" }}
                                />
                                <button
                                    onClick={() => setMostrarFormulario(true)}
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
                                    Asignar Coordinador
                                </button>
                            </div>

                            <EquiposTable
                                equipos={equiposPaginados}
                                empleadosMap={empleadosMap}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleActivate={handleActivate}
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    style={{ width: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <EquipoForm
                        equipos={equipos}                   
                        idEquipo={idEquipo}                 
                        setIdEquipo={setIdEquipo}
                        nombreEquipo={nombreEquipo}
                        setNombreEquipo={setNombreEquipo}
                        idCoordinador={idCoordinador}
                        setIdCoordinador={setIdCoordinador}
                        empleados={empleados}
                        equipoActivoEditando={equipoActivoEditando}
                        editingId={editingId}
                        handleSubmit={handleSubmit}
                        onClose={() => setMostrarFormulario(false)}
                    />
                )}

                {mostrarConfirmacion && (
                    <ConfirmModal
                        equipo={equipoSeleccionado}
                        onConfirm={confirmarDesactivacionEquipo}
                        onCancel={() => setMostrarConfirmacion(false)}
                    />
                )}

                <ToastContainer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default EquiposContainer;
