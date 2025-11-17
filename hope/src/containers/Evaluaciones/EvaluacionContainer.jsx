import React, { useState, useEffect } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import EvaluacionGuia from "./EvaluacionGuia";
import EvaluacionesTable from "./EvaluacionesTable";
import EvaluacionesFinalizadas from "./EvaluacionesFinalizadas";
import Seguimiento from "./Seguimiento";

const EvaluacionContainer = () => {
  const [vistaActual, setVistaActual] = useState("evaluar");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );
  const [usuario, setUsuario] = useState(null);
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);
  const [evaluacionesAbiertas, setEvaluacionesAbiertas] = useState(false);

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

  // ⏳ Validación de acceso semestral
  useEffect(() => {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1; // 1 = Enero, 6 = Junio
    const dia = hoy.getDate();

    const habilitado =
      (mes === 1 && dia >= 1 && dia <= 14) ||
      (mes === 6 && dia >= 1 && dia <= 14);

    setEvaluacionesAbiertas(habilitado);
  }, []);

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
                {/* ⛔ Botón bloqueado si está fuera de fecha */}
                <button
                  onClick={() => evaluacionesAbiertas && setVistaActual("evaluar")}
                  disabled={!evaluacionesAbiertas}
                  style={navBtn(vistaActual === "evaluar", !evaluacionesAbiertas)}
                >
                  Evaluar
                </button>

                {!esRolLimitado && (
                  <button
                    onClick={() => setVistaActual("listar")}
                    style={navBtn(vistaActual === "listar")}
                  >
                    Ver Evaluaciones
                  </button>
                )}

                {esAdmin && (
                  <button
                    onClick={() => setVistaActual("finalizadas")}
                    style={navBtn(vistaActual === "finalizadas")}
                  >
                    Evaluaciones Finalizadas
                  </button>
                )}

                <button
                  onClick={() => setVistaActual("seguimiento")}
                  style={navBtn(vistaActual === "seguimiento")}
                >
                  Seguimiento
                </button>
              </div>
            </div>

            {/* CONTENIDO DINÁMICO */}
            {vistaActual === "evaluar" && !evaluacionesAbiertas && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#b91c1c",
                  backgroundColor: "#fff",
                }}
              >
                La AutoEvaluacion está cerrada actualmente.
                <br />
                Próximas fechas habilitadas:
                <br />
                1 al 14 de Enero
                <br />
                1 al 14 de Junio
              </div>
            )}

            {vistaActual === "evaluar" && evaluacionesAbiertas && (
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

const navBtn = (isActive, disabled) => ({
  padding: "12px 24px",
  border: "none",
  backgroundColor: isActive ? "#023047" : "transparent",
  color: disabled ? "#8c8c8c" : isActive ? "white" : "#023047",
  cursor: disabled ? "not-allowed" : "pointer",
  borderBottom: isActive ? "2px solid #023047" : "2px solid transparent",
  fontFamily: '"Inter", sans-serif',
  fontWeight: "600",
  transition: "all 0.2s",
  opacity: disabled ? 0.45 : 1,
});

export default EvaluacionContainer;
