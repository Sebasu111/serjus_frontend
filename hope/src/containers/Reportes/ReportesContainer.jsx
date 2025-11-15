import React, { useState, useEffect } from "react";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import ReportesAusencias from "./ReportesAusencias";
import ReportesConvocatorias from "./ReportesConvocatorias";
import ReportesCapacitaciones from "./ReportesCapacitaciones";



const ReportesContainer = () => {
  const [vistaActual, setVistaActual] = useState("ausencias");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );

  // 🧠 Detectar resize y cambios de sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <Layout>
      <SEO title="Reportes" />
      <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />

          <main
            className="main-content site-wrapper-reveal"
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 0,
              minHeight: "calc(100vh - 80px)",
              marginLeft: isMobile ? "0" : sidebarCollapsed ? "90px" : "300px",
              transition: "margin-left 0.3s ease",
              width: `calc(100vw - ${
                isMobile ? "0px" : sidebarCollapsed ? "90px" : "300px"
              })`,
              overflow: "hidden",
            }}
          >
            {/* 🔹 Barra de pestañas */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div style={{ display: "flex", marginLeft: "20px" }}>
                <button
                  onClick={() => setVistaActual("ausencias")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "ausencias" ? "#023047" : "transparent",
                    color: vistaActual === "ausencias" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "ausencias" ? "2px solid #023047" : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Reporte de Ausencias
                </button>

                <button
                  onClick={() => setVistaActual("convocatorias")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "convocatorias" ? "#023047" : "transparent",
                    color: vistaActual === "convocatorias" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "convocatorias"
                        ? "2px solid #023047"
                        : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Reporte de Convocatorias
                </button>

                <button
                  onClick={() => setVistaActual("capacitaciones")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "capacitaciones" ? "#023047" : "transparent",
                    color: vistaActual === "capacitaciones" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "capacitaciones"
                        ? "2px solid #023047"
                        : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Reporte de Capacitaciones
                </button>
              </div>
            </div>

            {/* 🔹 CONTENIDO SEGÚN PESTAÑA */}
            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                height: "calc(100vh - 125px)",
              }}
            >
              {vistaActual === "ausencias" && (
                <ReportesAusencias />
              )}

              {vistaActual === "convocatorias" && (
  <ReportesConvocatorias />
)}


              {vistaActual === "capacitaciones" && (
  <ReportesCapacitaciones />
)}

            </div>
          </main>

          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </Layout>
  );
};

export default ReportesContainer;
