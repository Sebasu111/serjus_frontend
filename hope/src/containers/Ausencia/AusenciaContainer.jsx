import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

import AusenciaForm from "./AusenciaForm.jsx";
import AusenciaTable from "./AusenciaTable.jsx";

const AusenciaContainer = () => {
  const [ausencias, setAusencias] = useState([]);
  const [editingAusencia, setEditingAusencia] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchAusencias();
  }, []);

  const fetchAusencias = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/ausencias/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAusencias(data);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar las ausencias", "error");
      setAusencias([]);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingAusencia) {
        await axios.put(
          `http://127.0.0.1:8000/api/ausencias/${editingAusencia.idausencia}/`,
          data
        );
        showToast("Ausencia actualizada correctamente");
      } else {
        await axios.post("http://127.0.0.1:8000/api/ausencias/", data);
        showToast("Ausencia registrada correctamente");
      }
      setEditingAusencia(null);
      setMostrarFormulario(false);
      fetchAusencias();
    } catch (error) {
      console.error(error);
      showToast("Error al guardar la ausencia", "error");
    }
  };

  const handleEdit = (ausencia) => {
    if (!ausencia.estado) {
      showToast("No se puede editar una ausencia inactiva", "warning");
      return;
    }
    setEditingAusencia(ausencia);
    setMostrarFormulario(true);
  };

  const handleActivate = async (id) => {
    try {
      const aus = ausencias.find((a) => a.idausencia === id);
      if (!aus) return;
      await axios.put(`http://127.0.0.1:8000/api/ausencias/${id}/`, {
        ...aus,
        estado: true,
      });
      showToast("Ausencia activada correctamente");
      fetchAusencias();
    } catch (error) {
      console.error(error);
      showToast("Error al activar la ausencia", "error");
    }
  };

  const ausenciasFiltradas = ausencias.filter((a) => {
    const texto = busqueda.toLowerCase().trim();
    return (
      a.motivo?.toLowerCase().includes(texto) ||
      a.tipo?.toLowerCase().includes(texto) ||
      (a.estado ? "activo" : "inactivo").startsWith(texto)
    );
  });

  return (
    <Layout>
      <SEO title=" Ausencias" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingLeft: "225px" }}>
          <Header />
          <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "0" }}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                Registro de Ausencias
              </h2>

              {/* Buscador y botón nuevo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar ausencia..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    marginRight: "10px",
                  }}
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
                  Nueva Ausencia
                </button>
              </div>

              <AusenciaTable
                ausencias={ausenciasFiltradas}
                onEdit={handleEdit}
                onActivate={handleActivate}
              />
            </div>
          </main>
          <Footer />
        </div>

        {/* Formulario flotante centrado sin fondo oscuro */}
        {mostrarFormulario && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <AusenciaForm
              editingAusencia={editingAusencia}
              onSubmit={handleSubmit}
              onClose={() => {
                setMostrarFormulario(false);
                setEditingAusencia(null);
              }}
            />
          </div>
        )}

        <ToastContainer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default AusenciaContainer;
