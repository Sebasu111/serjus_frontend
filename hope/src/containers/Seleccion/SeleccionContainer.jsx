import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import EvaluacionSeleccion from "./EvaluacionSeleccion.jsx";

const SeleccionContainer = () => {
  const printRef = useRef();
  const [evaluaciones, setEvaluaciones] = useState([]);

  // Cargar datos almacenados localmente (si existen)
  useEffect(() => {
    const dataGuardada = localStorage.getItem("evaluacionesSeleccion");
    if (dataGuardada) {
      try {
        setEvaluaciones(JSON.parse(dataGuardada));
      } catch (error) {
        console.error("Error al cargar evaluaciones:", error);
      }
    }
  }, []);

  // Guardar automáticamente cada vez que cambien los datos
  useEffect(() => {
    if (evaluaciones.length > 0) {
      localStorage.setItem("evaluacionesSeleccion", JSON.stringify(evaluaciones));
    }
  }, [evaluaciones]);

  const handleGuardar = () => {
    try {
      localStorage.setItem("evaluacionesSeleccion", JSON.stringify(evaluaciones));
      showToast("   Evaluación guardada correctamente (localmente).");
    } catch (error) {
      console.error("Error al guardar evaluación:", error);
      showToast("  Ocurrió un error al guardar la evaluación.");
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  // Si deseas enviar los datos al servidor más adelante
  const handleEnviar = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      await axios.post(`${API}/evaluaciones`, { evaluaciones });
      showToast("   Evaluación enviada correctamente al servidor.");
    } catch (error) {
      console.error("Error al enviar evaluación:", error);
      showToast("  No se pudo enviar la evaluación al servidor.");
    }
  };

  return (
    <Layout>
      <SEO title="Evaluación de Selección" />
      <ScrollToTop />
      <Header />

      {/* APLICAMOS LAS CLASES AQUÍ */}
      <main className="main-content site-wrapper-reveal">
        {/* ENCABEZADO DE PÁGINA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
              letterSpacing: 0.3,
              color: "#333",
            }}
          >
            Evaluación de Selección de 3 Personas
          </h2>

          <div
            className="no-print"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "10px",
            }}
          >
            <button
              onClick={handleGuardar}
              style={{
                background: "#FFD700",
                border: "none",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Guardar
            </button>
          </div>
        </div>

        {/* COMPONENTE PRINCIPAL */}
        <div
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 0 8px rgba(0,0,0,0.1)",
            overflow: "auto", // permite scroll si se necesita
          }}
        >
          <EvaluacionSeleccion ref={printRef} />
        </div>
      </main>

      <Footer />
    </Layout>
  );
};

export default SeleccionContainer;
