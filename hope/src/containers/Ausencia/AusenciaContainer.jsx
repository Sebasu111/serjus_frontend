import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import AusenciaForm from "./AusenciaForm.jsx";
import AusenciaTable from "./AusenciaTable.jsx";
import { useHistory } from "react-router-dom";
import ModalAusencia from "./AusenciaModal.jsx";

const API = "http://127.0.0.1:8000/api";

const displayName = (emp) => [emp?.nombre, emp?.apellido].filter(Boolean).join(" ");

const AusenciaContainer = () => {
  const history = useHistory();
  const [ausencias, setAusencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editingAusencia, setEditingAusencia] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  const [usuario, setUsuario] = useState(null);
  const [modalAusenciaVisible, setModalAusenciaVisible] = useState(false);
  const [modalAusenciaData, setModalAusenciaData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!storedUser) {
      showToast("Por favor inicia sesión", "warning");
      history.push("/login");
      return;
    }
    setUsuario(storedUser);
    fetchAusencias();
    fetchEmpleados();
  }, []);

  //  Obtener ausencias
  const fetchAusencias = async () => {
    try {
      const res = await axios.get(`${API}/ausencias/`);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAusencias(data);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar las ausencias", "error");
    }
  };

  //Obtener empleados
  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(data);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar empleados", "error");
    }
  };

  //Guardar o actualizar ausencia
  const handleSubmit = async (dataAusencia, idAusencia) => {
    try {
      if (
        (!dataAusencia.cantidad_dias || dataAusencia.cantidad_dias <= 0) &&
        dataAusencia.fechainicio &&
        dataAusencia.fechafin
      ) {
        const fi = new Date(dataAusencia.fechainicio);
        const ff = new Date(dataAusencia.fechafin);
        const diff = Math.ceil((ff - fi) / (1000 * 60 * 60 * 24)) + 1;
        dataAusencia.cantidad_dias = diff > 0 ? diff : 1;
      }

      if (idAusencia) {
        await axios.put(`${API}/ausencias/${idAusencia}/`, dataAusencia);
        showToast("Ausencia actualizada correctamente");
      } else {
        await axios.post(`${API}/ausencias/`, dataAusencia);
        showToast("Ausencia registrada correctamente");
      }

      setEditingAusencia(null);
      setMostrarFormulario(false);
      fetchAusencias();
    } catch (error) {
      console.error(error);
      showToast("Error al guardar la ausencia", "error");
    }
  };

  // Editar
  const handleEdit = (ausencia) => {
    if (!ausencia.estado) {
      showToast("No se puede editar una ausencia inactiva", "warning");
      return;
    }
    setEditingAusencia(ausencia);
    setMostrarFormulario(true);
  };

  //Activar / desactivar
  const handleActivate = async (id) => {
    try {
      const aus = ausencias.find((a) => a.idausencia === id);
      if (!aus) return;

      await axios.put(`${API}/ausencias/${id}/`, {
        ...aus,
        estado: !aus.estado,
      });

      showToast(aus.estado ? "Ausencia desactivada" : "Ausencia activada");
      fetchAusencias();
    } catch (error) {
      console.error(error);
      showToast("Error al cambiar el estado", "error");
    }
  };

  const handleOpenModal = async (ausencia) => {
    setModalLoading(true);
    setModalAusenciaVisible(true);

    try {
      const empleado = empleados.find((e) => e.idempleado === ausencia.idempleado) || {};
      let documento = null;
      if (ausencia.iddocumento) {
        const res = await axios.get(`${API}/documentos/${ausencia.iddocumento}/`);
        documento = res.data;
      }
      setModalAusenciaData({ ...ausencia, empleado, documento });
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrado de ausencias
  const ausenciasFiltradas = ausencias.filter((a) => {
    if (mostrarInactivos && a.estado) return false;
    if (!mostrarInactivos && !a.estado) return false;

    const t = busqueda.toLowerCase().trim();
    const empleado = empleados.find((e) => e.idempleado === a.idempleado) || {};
    const nombreEmpleado = displayName(empleado).toLowerCase();
    const tipoStr = a.tipo ? a.tipo.toLowerCase() : "";
    const diasStr = a.cantidad_dias ? a.cantidad_dias.toString() : "";
    const diagnosticoStr = a.diagnostico ? a.diagnostico.toLowerCase() : "";
    const estadoStr = a.estado ? "activo" : "inactivo";

    return (
      nombreEmpleado.includes(t) ||
      tipoStr.includes(t) ||
      diasStr.includes(t) ||
      diagnosticoStr.includes(t) ||
      estadoStr.includes(t)
    );
  });

  const ausenciasOrdenadas = [...ausenciasFiltradas].sort(
    (a, b) => new Date(b.createdat) - new Date(a.createdat)
  );

  // Paginación
  const indexLast = paginaActual * elementosPorPagina;
  const indexFirst = indexLast - elementosPorPagina;
  const paginados = ausenciasOrdenadas.slice(indexFirst, indexLast);
  const totalPaginas = Math.ceil(ausenciasOrdenadas.length / elementosPorPagina);

  return (
    <Layout>
      <SEO title="Ausencias" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />

          <main
            className="main-content"
            style={{
              flex: 1,
              background: "#f0f2f5",
              padding: "48px 20px 8rem",
              transition: "margin-left 0.3s ease",
            }}
          >
            <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Registro de Ausencias
              </h2>

              {/* Búsqueda  */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar ausencia..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  style={{
                    flex: 1,
                    minWidth: "200px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  onClick={() => setMostrarFormulario(true)}
                  style={{
                    padding: "10px 20px",
                    background: "#219ebc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  Nueva Ausencia
                </button>
              </div>

              {/* Tabla de ausencias */}
              <AusenciaTable
                ausencias={paginados}
                empleados={empleados}
                onEdit={handleEdit}
                onActivate={handleActivate}
                onClickColaborador={handleOpenModal}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                setPaginaActual={setPaginaActual}
              />

            
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label style={{ marginRight: "10px", fontWeight: "600" }}>
                    Mostrar:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={elementosPorPagina}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const n = val === "" ? "" : Number(val);
                      setElementosPorPagina(n > 0 ? n : 1);
                      setPaginaActual(1);
                    }}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: "80px",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  />
                </div>

                
                <label style={{ fontWeight: "600", display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={mostrarInactivos}
                    onChange={(e) => setMostrarInactivos(e.target.checked)}
                    style={{ marginRight: "8px", transform: "scale(1.2)" }}
                  />
                  Mostrar ausencias inactivas
                </label>
              </div>
            </div>
          </main>

          <Footer />
        </div>

        {/* Modal formulario */}
        {mostrarFormulario && (
          <AusenciaForm
            usuario={usuario}
            editingAusencia={editingAusencia}
            empleados={empleados}
            onSubmit={handleSubmit}
            onClose={() => {
              setMostrarFormulario(false);
              setEditingAusencia(null);
            }}
          />
        )}

        {/* Modal detalle de ausencia */}
        {modalAusenciaVisible && (
          <ModalAusencia
            visible={modalAusenciaVisible}
            onClose={() => setModalAusenciaVisible(false)}
            ausencia={modalAusenciaData}
            loading={modalLoading}
          />
        )}

        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default AusenciaContainer;
