import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import CriterioTable from "./CriterioTable.jsx";
import CriterioForm from "./CriterioForm.jsx";

const API = "http://127.0.0.1:8000/api";

const CriterioEvaluacionContainer = () => {
  const [criterios, setCriterios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  const [loading, setLoading] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroVariable, setFiltroVariable] = useState("");
  const [variables, setVariables] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // 🔹 Cargar todos los datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCriterios, resVars, resTipos] = await Promise.all([
          axios.get(`${API}/criterio/`),
          axios.get(`${API}/variables/`),
          axios.get(`${API}/tipoevaluacion/`),
        ]);

        const criteriosData = resCriterios.data.results || resCriterios.data || [];
        const varsData = resVars.data.results || resVars.data || [];
        const tiposData = resTipos.data.results || resTipos.data || [];

        setCriterios(criteriosData);
        setVariables(varsData);
        setTipos(tiposData);
      } catch (error) {
        console.error("Error al cargar criterios:", error);
        showToast("Error al cargar los criterios de evaluación", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Filtrado principal basado en IDs
  const criteriosFiltrados = criterios.filter((c) => {
    const variable = variables.find((v) => v.idvariable === c.idvariable);
    const tipoId = variable?.idtipoevaluacion;

    if (filtroTipo && tipoId !== Number(filtroTipo)) return false;
    if (filtroVariable && c.idvariable !== Number(filtroVariable)) return false;

    const texto = busqueda.toLowerCase().trim();
    return (
      c.nombrecriterio?.toLowerCase().includes(texto) ||
      c.descripcioncriterio?.toLowerCase().includes(texto)
    );
  });

  // 🔹 Paginación
  const indexOfLast = paginaActual * elementosPorPagina;
  const indexOfFirst = indexOfLast - elementosPorPagina;
  const criteriosPaginados = criteriosFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.ceil(criteriosFiltrados.length / elementosPorPagina);

  // 🔹 Activar / Desactivar
  const handleActivate = async (criterio) => {
    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      await axios.put(`${API}/criterio/${criterio.idcriterio}/`, {
        nombrecriterio: criterio.nombrecriterio,
        descripcioncriterio: criterio.descripcioncriterio,
        estado: true,
        idusuario: idUsuario,
        idvariable: criterio.idvariable,
      });
      showToast("Criterio activado correctamente");
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast("Error al activar el criterio", "error");
    }
  };

  const handleDelete = async (criterio) => {
    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      await axios.put(`${API}/criterio/${criterio.idcriterio}/`, {
        nombrecriterio: criterio.nombrecriterio,
        descripcioncriterio: criterio.descripcioncriterio,
        estado: false,
        idusuario: idUsuario,
        idvariable: criterio.idvariable,
      });
      showToast("Criterio desactivado correctamente");
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast("Error al desactivar el criterio", "error");
    }
  };

  const handleEdit = (criterio) => {
    showToast("Función de edición disponible próximamente", "info");
    console.log("Editar criterio:", criterio);
  };

  const handleNuevoCriterio = () => {
    showToast("Formulario para crear un nuevo criterio próximamente 🛠️", "info");
  };

  return (
    <Layout>
      <SEO title="Criterios de Evaluación" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
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
            <div style={{ width: "min(1100px, 96vw)" }}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                Criterios de Evaluación Institucional
              </h2>

              {/* Buscador y botón nuevo — igual que Idiomas */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar criterio..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  style={buttonStyles.buscador}
                />

                <button
                  onClick={() => setMostrarFormulario(true)}
                  style={buttonStyles.nuevo}
                >
                  Nuevo Criterio
                </button>
              </div>

              {loading ? (
                <p style={{ textAlign: "center", color: "#777" }}>
                  Cargando criterios...
                </p>
              ) : (
                <CriterioTable
                  criterios={criteriosPaginados}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleActivate={handleActivate}
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  setPaginaActual={setPaginaActual}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroTipo={filtroTipo}
                  setFiltroTipo={setFiltroTipo}
                  filtroVariable={filtroVariable}
                  setFiltroVariable={setFiltroVariable}
                  variables={variables}
                  tipos={tipos}
                />
              )}

              {/* Config de paginación */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <label style={{ marginRight: "10px", fontWeight: "600" }}>
                  Mostrar:
                </label>
                <input
                  type="number"
                  min="1"
                  value={elementosPorPagina}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const numero = val === "" ? "" : Number(val);
                    setElementosPorPagina(numero > 0 ? numero : 1);
                    setPaginaActual(1);
                  }}
                  onFocus={(e) => e.target.select()}
                  style={{
                    width: "80px",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>
          </main>
          <Footer />
        </div>

        {mostrarFormulario && (
          <CriterioForm
            onClose={() => setMostrarFormulario(false)}
            variables={variables}
            tipos={tipos}
            onSuccess={() => window.location.reload()}
          />
        )}
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default CriterioEvaluacionContainer;
