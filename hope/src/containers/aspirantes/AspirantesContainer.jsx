import React, { useEffect, useState } from "react";
import axios from "axios";

// Reuso de Layout/UI ya existente en tu proyecto
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import AspirantesTable from "./AspirantesTable";

const API = "http://127.0.0.1:8000/api";

const AspirantesContainer = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [mensaje, setMensaje] = useState("");

    const [idiomas, setIdiomas] = useState([]);
    const [pueblos, setPueblos] = useState([]);

    useEffect(() => {
        fetchList();
        fetchIdiomas();
        fetchPueblos();
    }, []);

    const fetchList = async () => {
        try {
            const res = await axios.get(`${API}/aspirantes/`);
            const rows = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.results)
                ? res.data.results
                : [];
            setData(rows);
        } catch (e) {
            console.error("Error al cargar aspirantes:", e);
            setMensaje("Error al cargar los aspirantes");
        }
    };

    const fetchIdiomas = async () => {
        try {
            const r = await axios.get(`${API}/idiomas/`);
            setIdiomas(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setIdiomas([]);
        }
    };

    const fetchPueblos = async () => {
        try {
            const r = await axios.get(`${API}/pueblocultura/`);
            setPueblos(Array.isArray(r.data) ? r.data : r.data?.results || []);
        } catch {
            setPueblos([]);
        }
    };

    const filtered = data.filter(r => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            String(r.nombreaspirante ?? "").toLowerCase().includes(s) ||
            String(r.apellidoaspirante ?? "").toLowerCase().includes(s) ||
            String(r.dpi ?? "").toLowerCase().includes(s)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / elementosPorPagina));
    const start = (page - 1) * elementosPorPagina;
    const displayed = filtered.slice(start, start + elementosPorPagina);

    return (
        <Layout>
            <SEO title="Aspirantes" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
                            <h2 style={{ marginBottom: 20, textAlign: "center" }}>
                                Consulta de Aspirantes
                            </h2>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-start",
                                    marginBottom: 15,
                                    alignItems: "center"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o DPI"
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        marginRight: 10
                                    }}
                                />
                            </div>

                            <AspirantesTable
                                aspirantes={displayed}
                                handleEdit={null} // 🔹 Ya no se usa
                                handleToggle={null} // 🔹 Ya no se usa
                                paginaActual={page}
                                totalPaginas={totalPages}
                                setPaginaActual={setPage}
                                idiomas={idiomas}
                                pueblos={pueblos}
                                modoConsulta={true} // ← puedes usar esto para ocultar botones en la tabla
                            />

                            <div style={{ marginTop: 20, textAlign: "center" }}>
                                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const numero = Number(e.target.value) || 1;
                                        setElementosPorPagina(Math.max(1, numero));
                                        setPage(1);
                                    }}
                                    style={{
                                        width: 80,
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>

                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: "red",
                                        marginTop: 12,
                                        fontWeight: 600
                                    }}
                                >
                                    {mensaje}
                                </p>
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

export default AspirantesContainer;
