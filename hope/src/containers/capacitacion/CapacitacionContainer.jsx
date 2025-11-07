import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import {  } from "react-toastify";import { buttonStyles } from "../../stylesGenerales/buttons.js";

import CapacitacionForm from "./CapacitacionForm";
import CapacitacionesTable from "./CapacitacionTable.jsx";
import AsignarCapacitacion from "./AsignarCapacitacion.jsx";
import ConfirmModal from "./ConfirmModal";

const CapacitacionContainer = () => {
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [capacitacionActivaEditando, setCapacitacionActivaEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
    const [modalAccion, setModalAccion] = useState(null); // { tipo: "activar" | "desactivar", data: {...} }
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    const [formData, setFormData] = useState({
        nombreEvento: "",
        lugar: "",
        fechaInicio: "",
        fechaFin: "",
        institucion: "",
        monto: "",
        observacion: ""
    });

    useEffect(() => {
        fetchCapacitaciones();
    }, []);

    const fetchCapacitaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setCapacitaciones(data);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar capacitaciones", "error");
        }
    };

    const handleSubmit = async () => {
        if (!formData.nombreEvento.trim()) return showToast("El nombre del evento es obligatorio", "warning");
        if (!formData.lugar.trim()) return showToast("El lugar es obligatorio", "warning");
        if (!formData.fechaInicio) return showToast("La fecha de inicio es obligatoria", "warning");
        if (!formData.fechaFin) return showToast("La fecha de fin es obligatoria", "warning");
        if (new Date(formData.fechaInicio) > new Date(formData.fechaFin))
            return showToast("La fecha de fin no puede ser menor a la fecha de inicio", "warning");
        
        if (!formData.institucion.trim()) return showToast("La institución facilitadora es obligatoria", "warning");
        if (isNaN(formData.monto) || Number(formData.monto) <= 0)
            return showToast("El monto debe ser mayor a 0", "warning");

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const payload = {
                nombreevento: formData.nombreEvento,
                lugar: formData.lugar,
                fechainicio: formData.fechaInicio,
                fechafin: formData.fechaFin,
                institucionfacilitadora: formData.institucion,
                montoejecutado: formData.monto,
                observacion: formData.observacion,
                estado: Boolean(capacitacionActivaEditando),
                idusuario: idUsuario
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/capacitaciones/${editingId}/`, payload);
                showToast("Capacitación actualizada correctamente", "success");
            } else {
                await axios.post("http://127.0.0.1:8000/api/capacitaciones/", payload);
                showToast("Capacitación registrada correctamente", "success");
            }

            setFormData({
                nombreEvento: "",
                lugar: "",
                fechaInicio: "",
                fechaFin: "",
                institucion: "",
                monto: "",
                observacion: ""
            });
            setEditingId(null);
            setCapacitacionActivaEditando(true);
            setMostrarFormulario(false);
            fetchCapacitaciones();
        } catch (error) {
            const apiErr = error.response?.data;
            const detalle = (apiErr && (apiErr.detail || JSON.stringify(apiErr))) || "desconocido";
            console.error("POST/PUT /capacitaciones error:", apiErr || error);
            showToast(`Error al guardar capacitación: ${detalle}`, "error");
        }
    };

    const handleEdit = cap => {
        if (!cap.estado) return showToast("No se puede editar una capacitación inactiva", "warning");
        setFormData({
            nombreEvento: cap.nombreevento,
            lugar: cap.lugar,
            fechaInicio: cap.fechainicio,
            fechaFin: cap.fechafin,
            institucion: cap.institucionfacilitadora,
            monto: cap.montoejecutado,
            observacion: cap.observacion || ""
        });
        setEditingId(cap.idcapacitacion || cap.id);
        setCapacitacionActivaEditando(cap.estado);
        setMostrarFormulario(true);
    };

    // Abre el modal de confirmación para activar o desactivar
    const handleToggleEstado = (cap, tipo) => {
        setModalAccion({ tipo, data: cap });
    };

    // Función para manejar la asignación de colaboradores
    const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
    
    const handleAsignarCapacitacion = (capacitacion) => {
        setCapacitacionSeleccionada(capacitacion);
        setMostrarAsignacion(true);
    };

    // Confirma la acción (activar o desactivar)
    const confirmarAccion = async () => {
        if (!modalAccion?.data) return;
        const { tipo, data } = modalAccion;

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            await axios.put(`http://127.0.0.1:8000/api/capacitaciones/${data.idcapacitacion || data.id}/`, {
                ...data,
                estado: tipo === "activar",
                idusuario: idUsuario
            });
            showToast(`Capacitación ${tipo === "activar" ? "activada" : "desactivada"} correctamente`, "success");
            fetchCapacitaciones();
        } catch (error) {
            console.error(error);
            showToast(`Error al ${tipo === "activar" ? "activar" : "desactivar"} la capacitación`, "error");
        } finally {
            setModalAccion(null);
        }
    };

    const handleCloseFormulario = () => {
        setMostrarFormulario(false);
        setFormData({
            nombreEvento: "",
            lugar: "",
            fechaInicio: "",
            fechaFin: "",
            institucion: "",
            monto: ""
        });
        setEditingId(null);
        setCapacitacionActivaEditando(true);
    };

    const capacitacionesFiltradas = capacitaciones
  .sort((a, b) => {
    const idA = a.idcapacitacion || a.id || 0;
    const idB = b.idcapacitacion || b.id || 0;
    return idB - idA;
  })
  .filter(c => {
    const textoBusqueda = busqueda.toLowerCase().trim();
    if (!textoBusqueda) return true;

    // 🔹 Detectar rango de fechas con formato "dd-mm-yy a dd-mm-yy"
    const rangoRegex = /(\d{1,2}-\d{1,2}-\d{2})\s*(?:a|-)\s*(\d{1,2}-\d{1,2}-\d{2})/;
    const match = textoBusqueda.match(rangoRegex);

    if (match) {
      const [_, desdeStr, hastaStr] = match;

      const parseFecha = str => {
        const [dia, mes, anio2] = str.split("-");
        const anio = Number(anio2) + 2000; // Convertir 2 dígitos a 4
        return new Date(anio, Number(mes) - 1, Number(dia));
      };

      const desde = parseFecha(desdeStr);
      const hasta = parseFecha(hastaStr);

      const inicio = new Date(c.fechainicio);
      const fin = new Date(c.fechafin);

      // 🔹 Comparación rango: si inicio o fin está dentro del rango
      if ((inicio >= desde && inicio <= hasta) || (fin >= desde && fin <= hasta)) {
        return true;
      } else {
        return false;
      }
    }

    // 🔹 Búsqueda normal en otras columnas
    const formatFecha = dateStr => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    };

    const fechaInicio = formatFecha(c.fechainicio);
    const fechaFin = formatFecha(c.fechafin);

    const montoStr = String(c.montoejecutado || "").toLowerCase();

    return (
      c.nombreevento?.toLowerCase().includes(textoBusqueda) ||
      c.lugar?.toLowerCase().includes(textoBusqueda) ||
      c.institucionfacilitadora?.toLowerCase().includes(textoBusqueda) ||
      fechaInicio.includes(textoBusqueda) ||
      fechaFin.includes(textoBusqueda) ||
      montoStr.startsWith(textoBusqueda) ||
      (c.estado ? "activo" : "inactivo").includes(textoBusqueda)
    );
  });



    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const capacitacionesPaginadas = capacitacionesFiltradas.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(capacitacionesFiltradas.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Capacitaciones" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
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
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Capacitaciones Registradas</h2>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginBottom: "15px",
                                    alignItems: "center",
                                    flexWrap: "wrap"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar capacitación..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={buttonStyles.buscador}
                                />
                                <button onClick={() => setMostrarFormulario(true)} style={buttonStyles.nuevo}>
                                    Nueva Capacitación
                                </button>
                            </div>

                            <CapacitacionesTable
                                capacitaciones={capacitacionesPaginadas}
                                handleEdit={handleEdit}
                                handleDelete={cap => handleToggleEstado(cap, "desactivar")}
                                handleActivate={id => {
                                    const cap = capacitaciones.find(c => (c.idcapacitacion || c.id) === id);
                                    handleToggleEstado(cap, "activar");
                                }}
                                handleAsignarCapacitacion={handleAsignarCapacitacion}
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
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {mostrarFormulario && (
                    <CapacitacionForm
                        formData={formData}
                        setFormData={setFormData}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        capacitacionActivaEditando={capacitacionActivaEditando}
                        setMostrarFormulario={setMostrarFormulario}
                        handleSubmit={handleSubmit}
                        onClose={handleCloseFormulario}
                    />
                )}

                {mostrarAsignacion && (
                    <AsignarCapacitacion 
                        capacitacionInicial={capacitacionSeleccionada}
                        onClose={() => {
                            setMostrarAsignacion(false);
                            setCapacitacionSeleccionada(null);
                        }} 
                    />
                )}

                {/*   Modal de confirmación genérico */}
                {modalAccion && (
                    <ConfirmModal
                        title={modalAccion.tipo === "activar" ? "Activar Capacitación" : "Desactivar Capacitación"}
                        message={`¿Está seguro de ${modalAccion.tipo === "activar" ? "activar" : "desactivar"
                            } la capacitación "${modalAccion.data?.nombreevento}"?`}
                        onConfirm={confirmarAccion}
                        onCancel={() => setModalAccion(null)}
                        actionType={modalAccion.tipo}
                    />
                )}

            </div>
        </Layout>
    );
};

export default CapacitacionContainer;

