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

  const fetchAusencias = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/ausencias/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAusencias(data);
    } catch {
      showToast("Error al cargar las ausencias", "error");
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(data);
    } catch {
      showToast("Error al cargar empleados", "error");
    }
  };

  const handleSubmit = async (dataAusencia, idAusencia) => {
    try {
      if (idAusencia) {
        await axios.put(
          `http://127.0.0.1:8000/api/ausencias/${idAusencia}/`,
          dataAusencia
        );
        showToast("Ausencia actualizada correctamente");
      } else {
        await axios.post("http://127.0.0.1:8000/api/ausencias/", dataAusencia);
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

  const handleEdit = (ausencia) => {
    if (!ausencia.estado) {
      showToast("No se puede editar una ausencia inactiva", "warning");
      return;
    }
    setEditingAusencia(ausencia);
    setMostrarFormulario(true);
  };

  const handleActivate = async (id) => {
    try {
      const aus = ausencias.find((a) => a.idausencia === id);
      if (!aus) return;
      await axios.put(`http://127.0.0.1:8000/api/ausencias/${id}/`, {
        ...aus,
        estado: !aus.estado,
      });
      showToast(aus.estado ? "Ausencia desactivada" : "Ausencia activada");
      fetchAusencias();
    } catch {
      showToast("Error al cambiar el estado", "error");
    }
  };

  // 🔍 Filtrado
  const ausenciasFiltradas = ausencias.filter((a) => {
    const t = busqueda.toLowerCase().trim();
    const empleado = empleados.find((e) => e.idempleado === a.idempleado) || {};
    const numeroIGSS = empleado.numeroiggs ? String(empleado.numeroiggs).toLowerCase() : "";

    const fechaInicioStr = a.fechainicio
      ? (() => {
          const d = new Date(a.fechainicio);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = d.getFullYear();
          return `${day}-${month}-${year}`;
        })()
      : "";

    const estadoStr = a.estado ? "activo" : "inactivo";

    return (
      numeroIGSS.includes(t) ||
      a.tipo?.toLowerCase().includes(t) ||
      a.motivo?.toLowerCase().includes(t) ||
      fechaInicioStr.includes(t) ||
      estadoStr.startsWith(t)
    );
  });

  // 🔽 Ordenar del más reciente al más antiguo (por createdat)
  const ausenciasOrdenadas = [...ausenciasFiltradas].sort(
    (a, b) => new Date(b.createdat) - new Date(a.createdat)
  );

  // 📄 Paginación
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
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Registro de Ausencias</h2>

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

              <AusenciaTable
                ausencias={paginados}
                empleados={empleados}
                onEdit={handleEdit}
                onActivate={handleActivate}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                setPaginaActual={setPaginaActual}
              />

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
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
            </div>
          </main>

          <Footer />
        </div>

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
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default AusenciaContainer;
