import React, { useEffect, useState } from "react";
import axios from "axios";

import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

import AspirantesTable from "./AspirantesTable";

const API = "http://127.0.0.1:8000/api";

const AspirantesContainer = () => {
  const [data, setData] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  const [mensaje, setMensaje] = useState("");

  const [idiomas, setIdiomas] = useState([]);
  const [pueblos, setPueblos] = useState([]);

  useEffect(() => {
    fetchList();
    fetchDocumentos();
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

  const fetchDocumentos = async () => {
    try {
      const res = await axios.get(`${API}/documentos/`);
      const docs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setDocumentos(docs);
    } catch (e) {
      console.error("Error al cargar documentos:", e);
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

  // Relacionar aspirantes con sus CVs
  const aspirantesConCV = data.map((a) => {
    const cvs = documentos.filter(
      (d) => d.idaspirante === a.idaspirante && d.idtipodocumento === 1
    );
    return { ...a, cvs };
  });

  // 🔎 Filtro avanzado
  const filtered = aspirantesConCV.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase().trim();

    const nombreCompleto = `${r.nombreaspirante ?? ""} ${r.apellidoaspirante ?? ""}`.toLowerCase();
    const idioma = idiomas.find((i) => String(i.ididioma) === String(r.ididioma));
    const pueblo = pueblos.find((p) => String(p.idpueblocultura) === String(r.idpueblocultura));

    const idiomaNombre = idioma
      ? String(idioma.nombreidioma ?? idioma.nombre ?? idioma.descripcion ?? "").toLowerCase()
      : "";
    const puebloNombre = pueblo
      ? String(pueblo.nombrepueblo ?? pueblo.nombre ?? pueblo.pueblocultura ?? "").toLowerCase()
      : "";

    return (
      // Nombre o apellido separados o juntos
      nombreCompleto.includes(s) ||
      (r.nombreaspirante ?? "").toLowerCase().includes(s) ||
      (r.apellidoaspirante ?? "").toLowerCase().includes(s) ||
      // Género
      (r.genero ?? "").toLowerCase().includes(s) ||
      // Idioma y pueblo/cultura
      idiomaNombre.includes(s) ||
      puebloNombre.includes(s)
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
          <main
            className="main-content site-wrapper-reveal"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EEF2F7",
              padding: "48px 20px 8rem",
            }}
          >
            <div style={{ maxWidth: "1300px", width: "100%", margin: "0 auto" }}>
              <h2 style={{ marginBottom: 20, textAlign: "center" }}>
                Consulta de Aspirantes
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 15,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido, género, idioma o pueblo"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    marginRight: 10,
                  }}
                />
              </div>

              <AspirantesTable
                aspirantes={displayed}
                paginaActual={page}
                totalPaginas={totalPages}
                setPaginaActual={setPage}
                idiomas={idiomas}
                pueblos={pueblos}
                modoConsulta={true}
                ocultarEstado={true} // 🔹 nueva prop para no mostrar columna "Estado"
              />

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                <input
                  type="number"
                  min="1"
                  value={elementosPorPagina}
                  onChange={(e) => {
                    const numero = Number(e.target.value) || 1;
                    setElementosPorPagina(Math.max(1, numero));
                    setPage(1);
                  }}
                  style={{
                    width: 80,
                    padding: 10,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                />
              </div>

              {mensaje && (
                <p
                  style={{
                    textAlign: "center",
                    color: "red",
                    marginTop: 12,
                    fontWeight: 600,
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
