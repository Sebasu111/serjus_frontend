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
