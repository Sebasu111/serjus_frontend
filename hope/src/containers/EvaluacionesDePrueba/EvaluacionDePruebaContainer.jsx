import React, { useState, useEffect } from "react";

import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import EvaluacionPeriodoPruebaAcompañante from "./EvaluacionPeriodoPruebaAcompañante.jsx";
import EvaluacionPeriodoPruebaCoordinacion from "./EvaluacionPeriodoPruebaCoordinacion.jsx";
import VerEvaluaciones from "./VerEvaluaciones.jsx";
import EvaluacionesFinalizadas from "./EvaluacionesFinalizadas";

const EvaluacionPeriodoPruebaContainer = () => {
    const rol = Number(sessionStorage.getItem("idRol"));
    const [vistaActual, setVistaActual] = useState(
        rol === 2
            ? "acompanantes"
            : "verEvaluaciones"
    );
    const [evaluacionSeleccionada, setEvaluacionSeleccionada] =
        useState(null);

    const abrirEvaluacion = (evaluacion) => {

        setEvaluacionSeleccionada(evaluacion);

        if (evaluacion.tipoEvaluacion === "COORD") {
            setVistaActual("coordinaciones");
        } else {
            setVistaActual("acompanantes");
        }
    };

    const [isMobile, setIsMobile] = useState(
        window.innerWidth < 768
    );

    const [sidebarCollapsed, setSidebarCollapsed] =
        useState(
            document.body.classList.contains(
                "sidebar-collapsed"
            )
        );

    // Responsive
    useEffect(() => {
        const handleResize = () =>
            setIsMobile(window.innerWidth < 768);

        const observer = new MutationObserver(() => {
            setSidebarCollapsed(
                document.body.classList.contains(
                    "sidebar-collapsed"
                )
            );
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );

            observer.disconnect();
        };
    }, []);

    return (
        <Layout>
            <SEO title="SERJUS - Evaluación Período de Prueba" />

            <div
                className="wrapper"
                style={{
                    display: "flex",
                    minHeight: "100vh",
                }}
            >
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
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
                                (isMobile
                                    ? "0px"
                                    : sidebarCollapsed
                                        ? "90px"
                                        : "300px") +
                                ")",

                            maxWidth: "none",
                            overflow: "hidden",
                        }}
                    >
                        {/* NAV */}
                        <div
                            style={{
                                borderBottom:
                                    "2px solid #e0e0e0",

                                backgroundColor: "#f8f9fa",

                                padding: "0 20px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 0,
                                    flexWrap: "wrap",
                                }}
                            >

                                {/* ACOMPAÑANTES */}
                                {(rol === 2 || rol === 1 || rol === 5) && (
                                    <button
                                        onClick={() =>
                                            setVistaActual("acompanantes")
                                        }
                                        style={navBtn(
                                            vistaActual === "acompanantes"
                                        )}
                                    >
                                        Acompañantes
                                    </button>
                                )}

                                {/* COORDINACIONES */}
                                {(rol === 1 || rol === 5) && (
                                    <button
                                        onClick={() =>
                                            setVistaActual("coordinaciones")
                                        }
                                        style={navBtn(
                                            vistaActual === "coordinaciones"
                                        )}
                                    >
                                        Coordinaciones
                                    </button>
                                )}

                                {/* VER EVALUACIONES */}
                                {(rol === 1 || rol === 5) && (
                                    <button
                                        onClick={() =>
                                            setVistaActual("verEvaluaciones")
                                        }
                                        style={navBtn(
                                            vistaActual === "verEvaluaciones"
                                        )}
                                    >
                                        Ver Evaluaciones
                                    </button>
                                )}

                                {(rol === 1 || rol === 2 || rol === 5) && (
                                    <button
                                        onClick={() =>
                                            setVistaActual("finalizadas")
                                        }
                                        style={navBtn(
                                            vistaActual === "finalizadas"
                                        )}
                                    >
                                        Evaluaciones Finalizadas
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* CONTENIDO */}
                        <div
                            style={{
                                backgroundColor: "#EEF2F7",
                                minHeight:
                                    "calc(100vh - 130px)",

                                padding: "20px",
                                overflow: "auto",
                            }}
                        >
                            {vistaActual === "acompanantes" &&
                                (rol === 2 || rol === 1 || rol === 5) && (
                                    <EvaluacionPeriodoPruebaAcompañante
                                        evaluacionExistente={
                                            evaluacionSeleccionada
                                        }
                                    />
                                )}

                            {vistaActual === "coordinaciones" &&
                                (rol === 1 || rol === 5) && (
                                    <EvaluacionPeriodoPruebaCoordinacion
                                        evaluacionExistente={
                                            evaluacionSeleccionada
                                        }
                                    />
                                )}

                            {vistaActual === "verEvaluaciones" &&
                                (rol === 1 || rol === 5) && (
                                    <VerEvaluaciones
                                        onSeleccionarEvaluacion={
                                            abrirEvaluacion
                                        }
                                    />
                                )}

                            {vistaActual === "finalizadas" &&
                                (rol === 5 || rol === 1 || rol == 2) && (
                                    <EvaluacionesFinalizadas />
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

const navBtn = (isActive) => ({
    padding: "14px 26px",

    border: "none",

    backgroundColor: isActive
        ? "#023047"
        : "transparent",

    color: isActive
        ? "white"
        : "#023047",

    cursor: "pointer",

    borderBottom: isActive
        ? "2px solid #023047"
        : "2px solid transparent",

    fontFamily: '"Inter", sans-serif',

    fontWeight: "600",

    fontSize: "15px",

    transition: "all 0.2s ease",
});

export default EvaluacionPeriodoPruebaContainer;