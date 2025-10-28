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
  const [amonestaciones, setAmonestaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]); 
  const [editingAmonestacion, setEditingAmonestacion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetchAmonestaciones();
    fetchEmpleados(); 
  }, []);

  //   Fetch de amonestaciones
  const fetchAmonestaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/amonestaciones/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAmonestaciones(data);
    } catch (error) {
      console.error("Error al cargar amonestaciones:", error);
      setMensaje("Error al cargar las amonestaciones");
    }
  };

  //   Fetch de empleados
  const fetchEmpleados = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      setMensaje("Error al cargar los empleados");
    }
  };

  //   Editar
  const handleEdit = (amon) => {
    setEditingAmonestacion(amon);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //   Activar/Desactivar
  const handleActivate = async (id, activar = true) => {
    try {
      const amon = amonestaciones.find((a) => a.idamonestacion === id);
      if (!amon) return;
      await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
        ...amon,
        estado: activar,
      });
      setMensaje(
        activar
          ? "Amonestación activada correctamente"
          : "Amonestación desactivada correctamente"
      );
      fetchAmonestaciones();
    } catch (error) {
      console.error("Error al cambiar el estado de amonestación:", error);
      setMensaje("Error al actualizar la amonestación");
    }
  };

  //   Guardar o actualizar
  const handleSubmit = async (dataAmonestacion, editingId) => {
    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/amonestaciones/${editingId}/`,
          dataAmonestacion
        );
        setMensaje("Amonestación actualizada correctamente");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/amonestaciones/",
          dataAmonestacion
        );
        setMensaje("Amonestación registrada correctamente");
      }
      setEditingAmonestacion(null);
      setShowForm(false);
      fetchAmonestaciones();
    } catch (error) {
      console.error("Error al guardar amonestación:", error);
      setMensaje("Error al registrar la amonestación");
    }
  };

  //   Filtrado de amonestaciones por búsqueda
  const amonestacionesFiltradas = amonestaciones.filter((a) => {
    const texto = busqueda.toLowerCase().trim();
    return (
      a.motivo?.toLowerCase().includes(texto) ||
      a.tipo?.toLowerCase().includes(texto) ||
      (a.estado ? "activo" : "inactivo").startsWith(texto)
    );
  });

  return (
    <Layout>
      <SEO title="Amonestaciones" />
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
              padding: "48px 20px 8rem",
            }}
          >
            <div style={{ width: "min(1100px, 96vw)" }}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                Registro de Amonestaciones
              </h2>

              {/* Buscador y botón nuevo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar amonestación..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
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
                    whiteSpace: "nowrap",
                  }}
                >
                  Nueva Amonestación
                </button>
              </div>

              {/* Formulario */}
              {showForm && (
                <AmonestacionForm
                  empleados={empleados} 
                  editingAmonestacion={editingAmonestacion}
                  onSubmit={handleSubmit}
                  onClose={() => {
                    setShowForm(false);
                    setEditingAmonestacion(null);
                  }}
                />
              )}

              {/* Tabla */}
              <AmonestacionTable
                amonestaciones={amonestacionesFiltradas}
                empleados={empleados} 
                handleEdit={handleEdit}
                handleActivate={handleActivate}
              />
            </div>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </Layout>
  );
};

export default AmonestacionContainer;
