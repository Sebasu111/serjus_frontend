import React, { useState, useEffect } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import EvaluacionGuia from "./EvaluacionGuia";
import EvaluacionesTable from "./EvaluacionesTable";  // ← AQUÍ SE IMPORTA TU TABLA

const EvaluacionContainer = () => {
    const [vistaActual, setVistaActual] = useState("evaluar");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        document.body.classList.contains("sidebar-collapsed")
    );
    const [usuario, setUsuario] = useState(null);

    // 🔹 Obtener usuario logueado
    useEffect(() => {
        try {
            const userStr = localStorage.getItem("usuarioLogueado");
            if (userStr) {
                setUsuario(JSON.parse(userStr));
            }
        } catch (e) {
            console.error("Error cargando usuario:", e);
        }
    }, []);

    // 🔹 Validación de roles
    const esAcompanante = usuario?.idrol === 2;
    const esContador = usuario?.idrol === 3;
    const esRolLimitado = esAcompanante || esContador;

    // 🔹 Manejo de UI igual que contratos
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
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });

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
                        {/* 🔹 Si es CONTADOR o ACOMPAÑANTE → SIN NAVEGACIÓN */}
                        {esRolLimitado ? (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "100%",
                                    paddingTop: "20px",
                                    backgroundColor: "#EEF2F7",
                                }}
                            >
                                <EvaluacionGuia />
                            </div>
                        ) : (
                            <>
                                {/* 🔹 NAV */}
                                <div
                                    style={{
                                        borderBottom: "2px solid #e0e0e0",
                                        backgroundColor: "#f8f9fa",
                                        padding: vistaActual === "evaluar" ? "0 20px" : "0",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 0,
                                            marginLeft: vistaActual === "listar" ? "20px" : "0",
                                        }}
                                    >
                                        <button
                                            onClick={() => setVistaActual("evaluar")}
                                            style={{
                                                padding: "12px 24px",
                                                border: "none",
                                                backgroundColor:
                                                    vistaActual === "evaluar"
                                                        ? "#023047"
                                                        : "transparent",
                                                color:
                                                    vistaActual === "evaluar"
                                                        ? "white"
                                                        : "#023047",
                                                cursor: "pointer",
                                                borderBottom:
                                                    vistaActual === "evaluar"
                                                        ? "2px solid #023047"
                                                        : "2px solid transparent",
                                                fontFamily: '"Inter", sans-serif',
                                                fontWeight: "600",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            Evaluar
                                        </button>

                                        <button
                                            onClick={() => setVistaActual("listar")}
                                            style={{
                                                padding: "12px 24px",
                                                border: "none",
                                                backgroundColor:
                                                    vistaActual === "listar"
                                                        ? "#023047"
                                                        : "transparent",
                                                color:
                                                    vistaActual === "listar"
                                                        ? "white"
                                                        : "#023047",
                                                cursor: "pointer",
                                                borderBottom:
                                                    vistaActual === "listar"
                                                        ? "2px solid #023047"
                                                        : "2px solid transparent",
                                                fontFamily: '"Inter", sans-serif',
                                                fontWeight: "600",
                                                transition: "all 0.2s",
                                            }}
                                        >
                                            Ver Evaluaciones
                                        </button>
                                    </div>
                                </div>

                                {/* 🔹 Contenido dinámico */}
                                {vistaActual === "evaluar" ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            width: "100%",
                                            paddingTop: "20px",
                                            backgroundColor: "#EEF2F7",
                                        }}
                                    >
                                        <EvaluacionGuia />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            height: "calc(100vh - 130px)",
                                            overflow: "auto",
                                            backgroundColor: "#fff",
                                            padding: "0 20px 40px",
                                        }}
                                    >
                                        <EvaluacionesTable /> {/* ← AQUÍ ESTÁ TU TABLA */}
                                    </div>
                                )}
                            </>
                        )}
                    </main>

                    <Footer />
                    <ScrollToTop />
                </div>
            </div>
        </Layout>
    );
};

export default EvaluacionContainer;
