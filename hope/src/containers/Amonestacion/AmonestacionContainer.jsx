import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import CartaLlamadaAtencion from "./CartaLlamadaAtencion.jsx";
import AmonestacionForm from "./AmonestacionForm.jsx";
import html2pdf from "html2pdf.js";
import { showPDFToasts } from "../../utils/toast.js";

const AmonestacionesContainer = () => {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [vistaActual, setVistaActual] = useState("crear");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );

  const [data, setData] = useState({
    dia: "",
    mes: "",
    anio: "",
    nombreTrabajador: "",
    puesto: "",
    descripcionHecho: "",
    tipoFalta: "",
    articuloReglamento: "",
    descripcionArticuloReglamento: "",
    articuloCodigoTrabajo: "",
    descripcionArticuloCodigoTrabajo: "",
    plazoDias: "",
    nombreResponsable: "",
    cargoResponsable: "",
  });

  const editorRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setData({
      dia: "",
      mes: "",
      anio: "",
      nombreTrabajador: "",
      puesto: "",
      descripcionHecho: "",
      tipoFalta: "",
      articuloReglamento: "",
      descripcionArticuloReglamento: "",
      articuloCodigoTrabajo: "",
      descripcionArticuloCodigoTrabajo: "",
      plazoDias: "",
      nombreResponsable: "",
      cargoResponsable: "",
    });
  };

  const handlePrint = async () => {
    try {
      setGenerandoPDF(true);
      showPDFToasts.generando();

      // ⚡ Eliminada la validación con toast

      const content = document.getElementById("printable");
      if (!content) throw new Error("No se encontró el contenido a imprimir");

      const inputs = content.querySelectorAll(".input-field");
      const originalStyles = [];
      inputs.forEach((el, i) => {
        originalStyles[i] = {
          background: el.style.background,
          border: el.style.border,
          boxShadow: el.style.boxShadow,
          padding: el.style.padding,
        };
        el.style.background = "transparent";
        el.style.border = "none";
        el.style.boxShadow = "none";
        el.style.padding = "0";
      });

      const opt = {
        margin: [20, 20, 20, 20],
        filename: `Carta_Llamada_Atencion_${data.nombreTrabajador || "empleado"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await new Promise((resolve, reject) => {
        html2pdf()
          .set(opt)
          .from(content)
          .save()
          .then(() => {
            inputs.forEach((el, i) => {
              el.style.background = originalStyles[i].background;
              el.style.border = originalStyles[i].border;
              el.style.boxShadow = originalStyles[i].boxShadow;
              el.style.padding = originalStyles[i].padding;
            });
            resolve();
          })
          .catch(reject);
      });

      setGenerandoPDF(false);
      showPDFToasts.descargado();

      // ⚡ Limpiar automáticamente después de imprimir
      limpiarFormulario();
    } catch (error) {
      setGenerandoPDF(false);
      // ⚡ Mostrar solo errores críticos
      showPDFToasts.error(error.message || "Error al generar la carta");
    }
  };

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
              backgroundColor: "#fff",
              padding: 0,
              minHeight: "calc(100vh - 80px)",
              marginLeft: isMobile ? "0" : sidebarCollapsed ? "90px" : "300px",
              transition: "margin-left 0.3s ease",
              width: `calc(100vw - ${isMobile ? "0px" : sidebarCollapsed ? "90px" : "300px"})`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                padding: vistaActual === "crear" ? "0 20px" : "0",
              }}
            >
              <div style={{ display: "flex", marginLeft: vistaActual === "listar" ? "20px" : "0" }}>
                <button
                  onClick={() => setVistaActual("crear")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "crear" ? "#023047" : "transparent",
                    color: vistaActual === "crear" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "crear" ? "2px solid #023047" : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Crear Amonestación
                </button>
                <button
                  onClick={() => setVistaActual("listar")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "listar" ? "#023047" : "transparent",
                    color: vistaActual === "listar" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "listar" ? "2px solid #023047" : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Ver Amonestaciones
                </button>
              </div>
            </div>

            {vistaActual === "crear" ? (
              <div
                style={{
                  display: "flex",
                  height: "calc(100vh - 130px)",
                  gap: "2px",
                  maxWidth: sidebarCollapsed ? "calc(100vw - 90px)" : "calc(100vw - 300px)",
                  width: "100%",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <div
                  style={{
                    flex: isMobile ? "1" : "0 0 70%",
                    backgroundColor: "#fff",
                    overflow: "auto",
                    padding: "8px",
                  }}
                >
                  <div
                    style={{
                      transform: isMobile
                        ? "scale(0.88)"
                        : sidebarCollapsed
                        ? "scale(1.05)"
                        : "scale(1)",
                      transformOrigin: "top left",
                      width: isMobile ? "114%" : sidebarCollapsed ? "95%" : "100%",
                    }}
                  >
                    <CartaLlamadaAtencion ref={editorRef} data={data} />
                  </div>
                </div>

                <AmonestacionForm
                  data={data}
                  onChange={onChange}
                  onPrint={handlePrint}
                  generandoPDF={generandoPDF}
                  limpiarFormulario={limpiarFormulario}
                />
              </div>
            ) : (
              <div
                style={{
                  height: "calc(100vh - 130px)",
                  overflow: "auto",
                  backgroundColor: "#fff",
                  padding: "20px",
                }}
              >
                <p style={{ color: "#555" }}>
                  📋 Aquí puedes listar las amonestaciones registradas (pendiente de implementación).
                </p>
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

export default AmonestacionesContainer;
