import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

import HistorialPuestoForm from "./HistorialPuestoForm";
import ConfirmModal from "./ConfirmModal";
import HistorialPuestoTable from "./HistorialPuestoTable";

const API = process.env.REACT_APP_API_URL;
const API_EMPLEADOS = `${API}/empleados/`;
const API_PUESTOS = `${API}/puestos/`;

const HistorialPuestoContainer = () => {
    const [form, setForm] = useState({
        idempleado: "",
        idpuesto: "",
        fechainicio: "",
        fechafin: "",
        salario: "",
        observacion: "",
        estado: true
    });

    const [historiales, setHistoriales] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    useEffect(() => {
        fetchHistoriales();
        fetchEmpleados();
        fetchPuestos();
    }, []);

    const fetchHistoriales = async () => {
        try {
            const res = await axios.get(API);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setHistoriales(data);
        } catch (error) {
            console.error("Error al cargar historiales:", error);
            showToast("Error al cargar los historiales", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(API_EMPLEADOS);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setEmpleados(data);
        } catch (error) {
            console.error("Error al cargar colaboradores:", error);
            showToast("Error al cargar colaboradores", "error");
        }
    };

    const fetchPuestos = async () => {
        try {
            const res = await axios.get(API_PUESTOS);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setPuestos(data);
        } catch (error) {
            console.error("Error al cargar puestos:", error);
            showToast("Error al cargar puestos", "error");
        }
    };

    const resetForm = () => {
        setForm({
            idempleado: "",
            idpuesto: "",
            fechainicio: "",
            fechafin: "",
            salario: "",
            observacion: "",
            estado: true
        });
        setEditingId(null);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            // Validaciones
            if (!form.idempleado || !form.idpuesto || !form.fechainicio || !form.salario) {
                showToast("Colaborador, Puesto, Fecha de Inicio y Salario son campos obligatorios", "warning");
                return;
            }

            if (form.fechafin && new Date(form.fechafin) <= new Date(form.fechainicio)) {
                showToast("La fecha de fin debe ser posterior a la fecha de inicio", "warning");
                return;
            }

            if (parseFloat(form.salario) <= 0) {
                showToast("El salario debe ser mayor a 0", "warning");
                return;
            }

            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const payload = {
                ...form,
                idusuario: idUsuario,
                salario: parseFloat(form.salario)
            };

            if (editingId) {
                await axios.put(`${API}${editingId}/`, payload);
                showToast("Historial actualizado correctamente", "success");
            } else {
                await axios.post(API, payload);
                showToast("Historial registrado correctamente", "success");
            }

            resetForm();
            setMostrarFormulario(false);
            fetchHistoriales();
        } catch (error) {
            console.error("Error al guardar historial:", error.response?.data || error);
            const errorMsg = error.response?.data?.detail || "Error al guardar el historial";
            showToast(errorMsg, "error");
        }
    };

    const handleEdit = historial => {
        if (!historial.estado) {
            showToast("No se puede editar un historial inactivo", "warning");
            return;
        }

        setForm({
            idempleado: historial.idempleado || "",
            idpuesto: historial.idpuesto || "",
            fechainicio: historial.fechainicio || "",
            fechafin: historial.fechafin || "",
            salario: historial.salario || "",
            observacion: historial.observacion || "",
            estado: historial.estado
        });
        setEditingId(historial.idhistorialpuesto);
        setMostrarFormulario(true);
    };

    const handleDelete = historial => {
        setHistorialSeleccionado(historial);
        setMostrarConfirmacion(true);
    };

    const handlePrepareActivate = historial => {
        setHistorialSeleccionado(historial);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacion = async () => {
        if (!historialSeleccionado) return;

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API}${historialSeleccionado.idhistorialpuesto}/`, {
                ...historialSeleccionado,
                estado: false,
                idusuario: idUsuario
            });
            showToast("Historial desactivado correctamente", "success");
            fetchHistoriales();
        } catch (error) {
            console.error("Error al desactivar historial:", error);
            showToast("Error al desactivar el historial", "error");
        } finally {
            setMostrarConfirmacion(false);
            setHistorialSeleccionado(null);
        }
    };

    const handleActivate = async id => {
        try {
            const historial = historiales.find(h => h.idhistorialpuesto === id);
            if (!historial) return;

            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`${API}${id}/`, {
                ...historial,
                estado: true,
                idusuario: idUsuario
            });
            showToast("Historial activado correctamente", "success");
            fetchHistoriales();
        } catch (error) {
            console.error("Error al activar historial:", error);
            showToast("Error al activar el historial", "error");
        }
    };

    // Función para obtener nombre del empleado
    const obtenerNombreEmpleado = (idEmpleado) => {
        const empleado = empleados?.find(emp =>
            (emp.id || emp.idempleado || emp.idEmpleado) === idEmpleado
        );
        return empleado ? `${empleado.nombre} ${empleado.apellido}` : "Colaborador no encontrado";
    };

    // Función para obtener nombre del puesto
    const obtenerNombrePuesto = (idPuesto) => {
        const puesto = puestos?.find(p => p.idpuesto === idPuesto);
        return puesto ? puesto.nombrepuesto : "Puesto no encontrado";
    };

    // Filtrar y paginar
    const historialesFiltrados = historiales
        .sort((a, b) => (b.idhistorialpuesto || 0) - (a.idhistorialpuesto || 0))
        .filter(h => {
            const textoBusqueda = busqueda.toLowerCase().trim();
            if (!textoBusqueda) return true;

            const nombreEmpleado = obtenerNombreEmpleado(h.idempleado).toLowerCase();
            const nombrePuesto = obtenerNombrePuesto(h.idpuesto).toLowerCase();
            const observacion = (h.observacion || "").toLowerCase();
            const salario = h.salario?.toString() || "";
            const estadoTexto = h.estado ? "activo" : "inactivo";

            return nombreEmpleado.includes(textoBusqueda) ||
                nombrePuesto.includes(textoBusqueda) ||
                observacion.includes(textoBusqueda) ||
                salario.includes(textoBusqueda) ||
                estadoTexto.includes(textoBusqueda);
        });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const historialesPaginados = historialesFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(historialesFiltrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Historial de Puestos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <div style={{ width: "min(1100px, 96vw)" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                                Historial de Puestos
                            </h2>

                            {/* Buscador y botón nuevo */}
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
                                    placeholder="Buscar historial..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={buttonStyles.buscador}
                                />
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setMostrarFormulario(true);
                                    }}
                                    style={buttonStyles.nuevo}
                                >
                                    Nuevo Historial
                                </button>
                            </div>

                            <HistorialPuestoTable
                                historiales={historialesPaginados}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handlePrepareActivate={handlePrepareActivate}
                                obtenerNombreEmpleado={obtenerNombreEmpleado}
                                obtenerNombrePuesto={obtenerNombrePuesto}
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
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={e => e.target.select()}
                                    style={{
                                        width: "80px",
                                        padding: "6px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <HistorialPuestoForm
                        form={form}
                        setForm={setForm}
                        empleados={empleados}
                        puestos={puestos}
                        editingId={editingId}
                        handleSubmit={handleSubmit}
                        onClose={() => {
                            setMostrarFormulario(false);
                            resetForm();
                        }}
                    />
                )}

                {mostrarConfirmacion && (
                    <ConfirmModal
                        historial={historialSeleccionado}
                        modo={historialSeleccionado?.estado ? "desactivar" : "activar"}
                        onConfirm={() => {
                            if (historialSeleccionado?.estado) {
                                confirmarDesactivacion();
                            } else {
                                handleActivate(historialSeleccionado.idhistorialpuesto);
                                setMostrarConfirmacion(false);
                                setHistorialSeleccionado(null);
                            }
                        }}
                        onCancel={() => {
                            setMostrarConfirmacion(false);
                            setHistorialSeleccionado(null);
                        }}
                    />
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default HistorialPuestoContainer;