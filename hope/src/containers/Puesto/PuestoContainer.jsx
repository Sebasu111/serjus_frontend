import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import PuestoForm from "./PuestoForm";
import PuestosTable from "./PuestosTable";
import ConfirmModal from "./ConfirmModal";

const PuestosContainer = () => {
    const [puestos, setPuestos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

    useEffect(() => {
        fetchPuestos();
    }, []);

    const fetchPuestos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/puestos/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setPuestos(data);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los puestos", "error");
        }
    };

    const handleSubmit = async (idpuesto, payload) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/puestos/${idpuesto}/`, payload);
            showToast("Salario asignado correctamente");
            fetchPuestos();
            setMostrarFormulario(false);
        } catch (error) {
            console.error(error);
            showToast("Error al asignar el salario", "error");
        }
    };

    // Cambiar estado (activar/desactivar)
    const handleToggleEstado = async () => {
        if (!registroSeleccionado) return;
        try {
            await axios.put(
                `http://127.0.0.1:8000/api/puestos/${registroSeleccionado.idpuesto}/`,
                { ...registroSeleccionado, estado: false } // solo desactivar desde el modal
            );
            showToast(`Puesto desactivado correctamente`);
            fetchPuestos();
            setConfirmModalVisible(false);
        } catch (error) {
            console.error(error);
            showToast("Error al cambiar el estado del puesto", "error");
        }
    };

    // Al presionar el botón de activar/desactivar
    const handleEstadoClick = async registro => {
        if (registro.estado) {
            // Si está activo → mostrar modal de confirmación para desactivar
            setRegistroSeleccionado(registro);
            setConfirmModalVisible(true);
        } else {
            // Si está inactivo → activar directamente sin modal
            try {
                await axios.put(`http://127.0.0.1:8000/api/puestos/${registro.idpuesto}/`, {
                    ...registro,
                    estado: true
                });
                showToast("Puesto activado correctamente");
                fetchPuestos();
            } catch (error) {
                console.error(error);
                showToast("Error al activar el puesto", "error");
            }
        }
    };

    const puestosFiltrados = puestos
        // Ordenar alfabéticamente por nombre (A-Z)
        .sort((a, b) => {
            const nombreA = (a.nombrepuesto || "").toLowerCase();
            const nombreB = (b.nombrepuesto || "").toLowerCase();
            return nombreA.localeCompare(nombreB);
        })
        .filter(p => {
            const texto = busqueda.toLowerCase().trim();
            const nombreCoincide = p.nombrepuesto?.toLowerCase().includes(texto) || false;
            const descripcionCoincide = p.descripcion?.toLowerCase().includes(texto) || false;
            const salarioCoincide = p.salariobase?.toString().includes(texto) || false;
            return nombreCoincide || descripcionCoincide || salarioCoincide;
        });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const puestosPaginados = puestosFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.max(Math.ceil(puestosFiltrados.length / elementosPorPagina), 1);

    return (
        <Layout>
            <SEO title="Puestos" />
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
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Puestos Registrados</h2>

                            {/* Buscador */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    marginBottom: "15px",
                                    alignItems: "center"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar puesto..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={buttonStyles.buscador}
                                />
                            </div>                            {/* Tabla de Puestos */}
                            <PuestosTable
                                puestos={puestosPaginados}
                                onAsignarSalario={puesto => {
                                    setPuestoSeleccionado(puesto);
                                    setMostrarFormulario(true);
                                }}
                                onToggleEstado={handleEstadoClick}
                                paginaActual={paginaActual} //   importante
                                setPaginaActual={setPaginaActual} //   importante
                                totalPaginas={totalPaginas}
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

                {/* Modal Asignar Salario */}
                {mostrarFormulario && (
                    <PuestoForm
                        puestoSeleccionado={puestoSeleccionado}
                        handleSubmit={handleSubmit}
                        onClose={() => setMostrarFormulario(false)}
                    />
                )}

                {/* Modal solo para desactivar */}
                {confirmModalVisible && registroSeleccionado && (
                    <ConfirmModal
                        registro={registroSeleccionado}
                        onConfirm={handleToggleEstado}
                        onCancel={() => setConfirmModalVisible(false)}
                    />
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default PuestosContainer;
