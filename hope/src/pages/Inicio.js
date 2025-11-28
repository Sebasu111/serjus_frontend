import React from "react";
import Layout from "../layouts/index.jsx";
import Header from "../layouts/header/index.jsx";
import Footer from "../layouts/footer/index.jsx";
import ScrollToTop from "../components/scroll-to-top/index.jsx";
import SEO from "../components/seo/index.jsx";

const HomePage = () => {
    return (
        <React.Fragment>
            <Layout>
                <SEO title="SERJUS – Sistema de Gestión de Recursos Humanos" />

                {/* Estructura a pantalla completa para mantener el footer abajo */}
                <div style={{ display: "flex", minHeight: "100vh" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <Header />

                        {/* Sección principal con fondo y separación del footer */}
                        <main
                            className="main-content site-wrapper-reveal"
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#EEF2F7", // fondo gris claro
                                padding: "48px 20px 8rem" // aire superior/lateral e inferior (8rem)
                            }}
                        >
                            <div style={{ width: "min(1100px, 96vw)" }}>
                                {/* HERO */}
                                <div className="py-5 text-center">
                                    <h1 className="display-5 fw-bold lh-sm">
                                        <span className="text-primary" style={{ fontSize: "inherit", fontWeight: "inherit" }}>Bienvenidos/as</span> al Sistema de Gestión de Recursos Humanos <span style={{ fontSize: "inherit", fontWeight: "inherit", color: '#111' }}>SERJUS</span>
                                    </h1>
                                    <div className="mx-auto mt-4" style={{ maxWidth: "86%" }}>
                                        <hr />
                                    </div>
                                </div>
                                {/* /HERO */}
                            </div>
                        </main>

                        <Footer />
                        <ScrollToTop />
                    </div>
                </div>
            </Layout>
        </React.Fragment>
    );
};

export default HomePage;
