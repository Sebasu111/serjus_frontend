import React from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import EvaluacionGuia from "./EvaluacionGuia";

const EvaluacionContainer = () => {
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <EvaluacionGuia />
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>
            </div>
        </Layout>
    );
};

export default EvaluacionContainer;
