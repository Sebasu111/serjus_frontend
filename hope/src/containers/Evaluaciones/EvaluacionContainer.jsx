import React, { useState, useEffect } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import EvaluacionGuia from "./EvaluacionGuia";
import EvaluacionesTable from "./EvaluacionesTable";
import EvaluacionesFinalizadas from "./EvaluacionesFinalizadas";
import Seguimiento from "./Seguimiento"; // ⬅

const EvaluacionContainer = () => {
  const [vistaActual, setVistaActual] = useState("evaluar");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );
  const [usuario, setUsuario] = useState(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);

  // Obtener usuario logueado
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("usuarioLogueado");
      if (userStr) setUsuario(JSON.parse(userStr));
    } catch (e) {
      console.error("Error cargando usuario:", e);
    }
  }, []);

  // Roles
  const esAcompanante = usuario?.idrol === 2;
  const esContador = usuario?.idrol === 3;
  const esAdmin = usuario?.idrol === 5;
  const esRolLimitado = esAcompanante || esContador;

  // UI responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const observer = new MutationObserver(() => {
      setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
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
      <SEO title="SERJUS - Evaluaciones" />
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
              marginLeft: isMobile
                ? "0"
                : sidebarCollapsed
                ? "90px"
                : "300px",
              transition: "margin-left 0.3s ease",
              width:
                "calc(100vw - " +
                (isMobile ? "0px" : sidebarCollapsed ? "90px" : "300px") +
                ")",
              maxWidth: "none",
              overflow: "hidden",
            }}
          >
            {/* NAV VISIBLE PARA TODOS */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                padding: "0 20px",
              }}
            >
              <div style={{ display: "flex", gap: 0 }}>
                <button
                  onClick={() => setVistaActual("evaluar")}
                  style={navBtn(vistaActual === "evaluar")}
                >
                  Evaluar
                </button>

                {/* Ver Evaluaciones → NO para roles limitados */}
                {!esRolLimitado && (
                  <button
                    onClick={() => setVistaActual("listar")}
                    style={navBtn(vistaActual === "listar")}
                  >
                    Ver Evaluaciones
                  </button>
                )}

                {/* Finalizadas → solo ADMIN */}
                {esAdmin && (
                  <button
                    onClick={() => setVistaActual("finalizadas")}
                    style={navBtn(vistaActual === "finalizadas")}
                  >
                    Evaluaciones Finalizadas
                  </button>
                )}

                {/* Seguimiento → PARA TODOS */}
                <button
                  onClick={() => setVistaActual("seguimiento")}
                  style={navBtn(vistaActual === "seguimiento")}
                >
                  Seguimiento
                </button>
              </div>
            </div>

            {/* CONTENIDO DINÁMICO */}
            {vistaActual === "evaluar" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  paddingTop: "20px",
                  backgroundColor: "#EEF2F7",
                }}
              >
                <EvaluacionGuia evaluacionSeleccionada={evaluacionSeleccionada} />
              </div>
            )}

            {vistaActual === "listar" && !esRolLimitado && (
              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  padding: "0 20px 40px",
                }}
              >
                <EvaluacionesTable
                  onSeleccionarEvaluacion={(ev) => {
                    setEvaluacionSeleccionada(ev);
                    setVistaActual("evaluar");
                  }}
                />
              </div>
            )}

            {vistaActual === "finalizadas" && esAdmin && (
              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  padding: "0 20px 40px",
                }}
              >
                <EvaluacionesFinalizadas />
              </div>
            )}

            {/* Seguimiento → SIEMPRE DISPONIBLE */}
            {vistaActual === "seguimiento" && (
              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  padding: "0 20px 40px",
                }}
              >
                <Seguimiento />
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

const navBtn = (isActive) => ({
  padding: "12px 24px",
  border: "none",
  backgroundColor: isActive ? "#023047" : "transparent",
  color: isActive ? "white" : "#023047",
  cursor: "pointer",
  borderBottom: isActive ? "2px solid #023047" : "2px solid transparent",
  fontFamily: '"Inter", sans-serif',
  fontWeight: "600",
  transition: "all 0.2s",
});

export default EvaluacionContainer;
