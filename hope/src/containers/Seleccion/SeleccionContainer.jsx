import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import EvaluacionSeleccion from "./EvaluacionSeleccion.jsx";
import EvaluacionesTable from "./EvaluacionesTable.jsx"; // 👈 Vista para las guardadas

const SeleccionContainer = () => {
  const printRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );
  const [vistaActual, setVistaActual] = useState("nueva"); // 'nueva' o 'guardadas'
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    const observerCallback = (mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setSidebarCollapsed(
            document.body.classList.contains("sidebar-collapsed")
          );
        }
      });
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <Layout>
      <SEO title="Evaluación de Selección" />
      <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <main
            className="main-content site-wrapper-reveal"
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: "0",
              minHeight: "calc(100vh - 80px)",
              marginLeft: isMobile ? "0" : sidebarCollapsed ? "90px" : "300px",
              transition: "margin-left 0.3s ease",
              width: "calc(100vw - " + (isMobile ? "0px" : sidebarCollapsed ? "90px" : "300px") + ")",
              maxWidth: "none",
              overflow: "hidden",
            }}
          >
            {/* Pestañas de navegación */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                padding: vistaActual === "nueva" ? "0 20px" : "0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0",
                  marginLeft: vistaActual === "guardadas" ? "20px" : "0",
                }}
              >
                <button
                  onClick={() => setVistaActual("nueva")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor:
                      vistaActual === "nueva" ? "#023047" : "transparent",
                    color: vistaActual === "nueva" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "nueva"
                        ? "2px solid #023047"
                        : "2px solid transparent",
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                >
                  Realizar Evaluación
                </button>
                <button
                  onClick={() => setVistaActual("guardadas")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor:
                      vistaActual === "guardadas" ? "#023047" : "transparent",
                    color: vistaActual === "guardadas" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "guardadas"
                        ? "2px solid #023047"
                        : "2px solid transparent",
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: "600",
                    transition: "all 0.2s",
                  }}
                >
                  Evaluaciones Guardadas
                </button>
              </div>
            </div>

            {/* Contenido según la vista seleccionada */}
            {vistaActual === "nueva" ? (
              <div
                style={{
                  display: "flex",
                  height: "calc(100vh - 130px)",
                  gap: "2px",
                  maxWidth: sidebarCollapsed
                    ? "calc(100vw - 90px)"
                    : "calc(100vw - 300px)",
                  width: "100%",
                  margin: "0",
                  flexDirection: "column",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    overflow: "auto",
                    padding: "16px",
                  }}
                >
                  <EvaluacionSeleccion 
                  ref={printRef} 
                  evaluacionSeleccionada={evaluacionSeleccionada}
                  setEvaluacionSeleccionada={setEvaluacionSeleccionada} 
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  margin: "0",
                  padding: "0",
                  width: "100%",
                  maxWidth: "none",
                }}
              >
                <EvaluacionesTable setEvaluacionSeleccionada={setEvaluacionSeleccionada} />
              </div>
            )}
          </main>

          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </Layout>
  );
};

export default SeleccionContainer;
