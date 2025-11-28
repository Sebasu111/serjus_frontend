import React, { useEffect, useState } from "react";
import axios from "axios";

import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

import PostulacionesTable from "./PostulacionesTable.jsx";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const PostulacionesContainer = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [aspirantes, setAspirantes] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const [resPost, resAsp, resConv, resDocs] = await Promise.all([
        axios.get(`${API}/postulaciones/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/aspirantes/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/convocatorias/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/documentos/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setPostulaciones(resPost.data.results || resPost.data || []);
      setAspirantes(
        (resAsp.data.results || []).map((a) => {
          const cvs = (resDocs.data.results || []).filter(
            (d) => d.idaspirante === a.idaspirante && d.idtipodocumento === 1
          );
          return { ...a, cvs };
        })
      );
      setConvocatorias(resConv.data.results || []);
      setDocumentos(resDocs.data.results || []);
    } catch (e) {
      console.error("Error al cargar datos:", e);
    }
  };

  // 🔎 Filtrado solo por nombre del aspirante
  const filteredPostulaciones = postulaciones.filter((p) => {
    const aspirante = aspirantes.find((a) => a.idaspirante === p.idaspirante);
    if (!aspirante) return false;

    const nombreAspirante = `${aspirante.nombreaspirante} ${aspirante.apellidoaspirante}`.toLowerCase();
    const s = search.toLowerCase().trim();

    return nombreAspirante.includes(s);
  });


  // No hacer slice aquí, se deja que PostulacionesTable haga la paginación
  return (
    <Layout>
      <SEO title="Postulaciones" />
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
              <h2 style={{ marginBottom: 20, textAlign: "center" }}>Postulaciones Registradas</h2>

              <input
                type="text"
                placeholder="Buscar por aspirante"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  marginBottom: 15,
                }}
              />

              <PostulacionesTable
                postulaciones={filteredPostulaciones} // <-- todas las filtradas
                aspirantes={aspirantes}
                convocatorias={convocatorias}
                documentos={documentos}
                setPostulaciones={setPostulaciones}
                paginaActual={page}
                setPaginaActual={setPage}
                elementosPorPagina={elementosPorPagina}
              />

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={elementosPorPagina}
                  onChange={(e) => {
                    const numero = Math.max(1, parseInt(e.target.value, 10) || 1);
                    setElementosPorPagina(numero);
                    setPage(1); // reseteamos a la primera página
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
            </div>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </Layout>
  );
};

export default PostulacionesContainer;
