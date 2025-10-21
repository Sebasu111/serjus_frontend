import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

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
  });

  useEffect(() => {
    fetchCapacitaciones();
  }, []);

  const fetchCapacitaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
          ? res.data.results
          : [];
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
        estado: Boolean(capacitacionActivaEditando),
        idusuario: idUsuario,
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

  const handleEdit = (cap) => {
    if (!cap.estado) return showToast("No se puede editar una capacitación inactiva", "warning");
    setFormData({
      nombreEvento: cap.nombreevento,
      lugar: cap.lugar,
      fechaInicio: cap.fechainicio,
      fechaFin: cap.fechafin,
      institucion: cap.institucionfacilitadora,
      monto: cap.montoejecutado,
    });
    setEditingId(cap.idcapacitacion || cap.id);
    setCapacitacionActivaEditando(cap.estado);
    setMostrarFormulario(true);
  };

  // Abre el modal de confirmación para activar o desactivar
  const handleToggleEstado = (cap, tipo) => {
    setModalAccion({ tipo, data: cap });
  };

  // Confirma la acción (activar o desactivar)
  const confirmarAccion = async () => {
    if (!modalAccion?.data) return;
    const { tipo, data } = modalAccion;

    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      await axios.put(
        `http://127.0.0.1:8000/api/capacitaciones/${data.idcapacitacion || data.id}/`,
        {
          ...data,
          estado: tipo === "activar",
          idusuario: idUsuario,
        }
      );
      showToast(
        `Capacitación ${tipo === "activar" ? "activada" : "desactivada"} correctamente`,
        "success"
      );
      fetchCapacitaciones();
    } catch (error) {
      console.error(error);
      showToast(
        `Error al ${tipo === "activar" ? "activar" : "desactivar"} la capacitación`,
        "error"
      );
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
      monto: "",
    });
    setEditingId(null);
    setCapacitacionActivaEditando(true);
  };

  // Filtrado y paginación
  const capacitacionesFiltradas = capacitaciones.filter((c) => {
    const textoBusqueda = busqueda.toLowerCase();
    if (textoBusqueda === "act" && !c.estado) return false;
    if (textoBusqueda === "inac" && c.estado) return false;

    return (
      c.nombreevento?.toLowerCase().includes(textoBusqueda) ||
      c.lugar?.toLowerCase().includes(textoBusqueda) ||
      c.institucionfacilitadora?.toLowerCase().includes(textoBusqueda) ||
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
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", paddingLeft: "250px" }}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Capacitaciones Registradas</h2>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "15px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar capacitación..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  style={buttonStyles.buscador}
                />
                <button
                  onClick={() => setMostrarFormulario(true)}
                  style={buttonStyles.nuevo}
                >
                  Nueva Capacitación
                </button>
                <button
                  onClick={() => setMostrarAsignacion(true)}
                  style={{ ...buttonStyles.nuevo, background: "#219ebc", color: "#fff" }}
                >
                  Asignar Capacitación
                </button>
              </div>

              <CapacitacionesTable
                capacitaciones={capacitacionesPaginadas}
                handleEdit={handleEdit}
                handleDelete={(cap) => handleToggleEstado(cap, "desactivar")}
                handleActivate={(id) => {
                  const cap = capacitaciones.find(
                    (c) => (c.idcapacitacion || c.id) === id
                  );
                  handleToggleEstado(cap, "activar");
                }}
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
                  style={{
                    width: "80px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>
          </main>
          <Footer />
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
          <AsignarCapacitacion onClose={() => setMostrarAsignacion(false)} />
        )}

        {/* ✅ Modal de confirmación genérico */}
        {modalAccion && (
          <ConfirmModal
            title={
              modalAccion.tipo === "activar"
                ? "Activar Capacitación"
                : "Desactivar Capacitación"
            }
            message={`¿Estás seguro de ${
              modalAccion.tipo === "activar" ? "activar" : "desactivar"
            } la capacitación "${modalAccion.data?.nombreevento}"?`}
            onConfirm={confirmarAccion}
            onCancel={() => setModalAccion(null)}
            actionType={modalAccion.tipo}
          />
        )}

        <ToastContainer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default CapacitacionContainer;
