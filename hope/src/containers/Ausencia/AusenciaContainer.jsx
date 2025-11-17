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

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const displayName = (emp) =>
  [emp?.nombre, emp?.apellido].filter(Boolean).join(" ");

const AusenciaContainer = () => {
  const history = useHistory();
  const [ausencias, setAusencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [estados, setEstados] = useState([]);
  const [editingAusencia, setEditingAusencia] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);
  const [usuario, setUsuario] = useState(null);
  const [modalAusenciaVisible, setModalAusenciaVisible] = useState(false);
  const [modalAusenciaData, setModalAusenciaData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false); 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!storedUser) {
      showToast("Por favor inicia sesión", "warning");
      history.push("/");
      return;
    }
    setUsuario(storedUser);

    fetchEstados();
    fetchEmpleados();
  }, []);

  //Cargar estados
  const fetchEstados = async () => {
    try {
      const res = await axios.get(`${API}/estados/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEstados(data);
      fetchAusencias(data); 
    } catch (error) {
      console.error(error);
      showToast("Error al cargar los estados", "error");
    }
  };

  // Obtener ausencias y actualizar si ya finalizó
  const fetchAusencias = async (estadosCargados = estados) => {
    try {
      const res = await axios.get(`${API}/ausencias/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];

      const hoy = new Date();
      const estadoFinalizada =
        estadosCargados.find(
          (e) =>
            e.nombreestado?.toLowerCase() === "finalizada" ||
            e.nombre?.toLowerCase() === "finalizada"
        ) || null;

      if (!estadoFinalizada) {
        console.warn("No se encontró el estado 'Finalizada'.");
        setAusencias(data);
        return;
      }

      const actualizadas = [];

      for (const ausencia of data) {
        const fechaFin = ausencia.fechafin ? new Date(ausencia.fechafin) : null;
        const yaFinalizo =
          fechaFin && fechaFin.setHours(0, 0, 0, 0) < hoy.setHours(0, 0, 0, 0);

        const idEstadoActual =
          typeof ausencia.idestado === "object"
            ? ausencia.idestado?.idestado
            : ausencia.idestado ?? null;

        if (yaFinalizo && idEstadoActual !== estadoFinalizada.idestado) {
          try {
            const updated = {
              ...ausencia,
              idestado: estadoFinalizada.idestado,
            };
            await axios.put(`${API}/ausencias/${ausencia.idausencia}/`, updated, {
              headers: { Authorization: `Bearer ${token}` }
            });
            actualizadas.push({
              ...ausencia,
              idestado: { ...estadoFinalizada },
            });
          } catch (err) {
            console.error(
              `Error al actualizar ausencia ${ausencia.idausencia}:`,
              err.message
            );
          }
        }
      }

      if (actualizadas.length > 0) {
        showToast(
          `${actualizadas.length} ausencias pasaron a "Finalizada"`,
          "info"
        );
      }

      const nuevas = data.map((a) => {
        const mod = actualizadas.find((x) => x.idausencia === a.idausencia);
        return mod || a;
      });

      setAusencias(nuevas);
    } catch (error) {
      console.error("Error al cargar o actualizar ausencias:", error);
      showToast("Error al cargar las ausencias", "error");
    }
  };

  // Obtener empleados
  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(data);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar colaboradores", "error");
    }
  };

// Guardar o actualizar ausencia
// Guardar o actualizar ausencia
const handleSubmit = async (dataAusencia, idAusencia) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Asegurar estado = true
      dataAusencia.estado = true;

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

      const empleadoId = Number(dataAusencia.idempleado);
      const nuevaInicio = new Date(dataAusencia.fechainicio);
      const nuevaFin = new Date(dataAusencia.fechafin);

      const conflictos = ausencias.filter((a) => {
        const activa = a.estado === true || a.estado === 1 || a.estado === "true";
        if (!activa) return false;
        if (a.idausencia === idAusencia) return false;

        const idExistente =
          typeof a.idempleado === "object"
            ? Number(a.idempleado.idempleado)
            : Number(a.idempleado);

        if (idExistente !== empleadoId) return false;

        const inicioExistente = new Date(a.fechainicio);
        const finExistente = new Date(a.fechafin);
        return nuevaInicio <= finExistente && nuevaFin >= inicioExistente;
      });

      if (conflictos.length > 0) {
        showToast(
          "El colaborador ya tiene una ausencia activa que se solapa con las fechas ingresadas.",
          "warning"
        );
        return reject(new Error("Fechas en conflicto"));
      }

      if (idAusencia) {
        await axios.put(`${API}/ausencias/${idAusencia}/`, dataAusencia, {
        headers: { Authorization: `Bearer ${token}` }
      });
      } else {
        await axios.post(`${API}/ausencias/`, dataAusencia, {
        headers: { Authorization: `Bearer ${token}` }
      });
      }

      // 🔄 Actualizamos UI
      setEditingAusencia(null);
      setMostrarFormulario(false);
      fetchAusencias();

      resolve(); // ✅ Solo resolvemos si todo fue exitoso
    } catch (error) {
      console.error(error);
      showToast("Error al guardar la ausencia", "error");
      reject(error); // ❌ Indicamos al form que falló
    }
  });
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

  // Activar / desactivar
  const handleActivate = async (id) => {
    try {
      const aus = ausencias.find((a) => a.idausencia === id);
      if (!aus) return;

      await axios.put(`${API}/ausencias/${id}/`, {
        ...aus,
        estado: !aus.estado,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
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
      const empleado =
        empleados.find((e) => e.idempleado === ausencia.idempleado) || {};
      let documento = null;
      if (ausencia.iddocumento) {
        const res = await axios.get(`${API}/documentos/${ausencia.iddocumento}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        documento = res.data;
      }
      setModalAusenciaData({ ...ausencia, empleado, documento });
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  //Filtrado
const ausenciasFiltradas = ausencias
  .filter((a) => a.estado === true)
  .filter((a) => {
    const estadoFinalizada =
      estados.find(
        (e) =>
          e.nombreestado?.toLowerCase() === "finalizada" ||
          e.nombre?.toLowerCase() === "finalizada"
      ) || null;

    const idEstadoFinalizada = estadoFinalizada?.idestado ?? null;
    const idEstadoActual =
      typeof a.idestado === "object"
        ? a.idestado?.idestado
        : a.idestado ?? null;

    if (mostrarFinalizadas) {
      if (idEstadoActual !== idEstadoFinalizada) return false;
    } else {
      if (idEstadoActual === idEstadoFinalizada) return false;
    }

    const t = busqueda.toLowerCase().trim();
    const empleado =
      empleados.find((e) => e.idempleado === a.idempleado) || {};
    const nombreEmpleado = displayName(empleado).toLowerCase();
    const tipoStr = a.tipo ? a.tipo.toLowerCase() : "";
    const diasStr = a.cantidad_dias ? a.cantidad_dias.toString() : "";
    const diagnosticoStr = a.diagnostico ? a.diagnostico.toLowerCase() : "";

    return (
      nombreEmpleado.includes(t) ||
      tipoStr.includes(t) ||
      diasStr.includes(t) ||
      diagnosticoStr.includes(t)
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
            }}
          >
            <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                Registro de Ausencias
              </h2>

              {/* Búsqueda */}
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

              {/* Tabla */}
              <AusenciaTable
                ausencias={paginados}
                empleados={empleados}
                estados={estados}
                onEdit={handleEdit}
                onActivate={handleActivate}
                onClickColaborador={handleOpenModal}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                setPaginaActual={setPaginaActual}
              />

              {/* Configuración */}
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
                    style={{
                      width: "80px",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                    }}
                  />
                </div>

                <label
                  style={{
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={mostrarFinalizadas}
                    onChange={(e) => setMostrarFinalizadas(e.target.checked)}
                    style={{ marginRight: "8px", transform: "scale(1.2)" }}
                  />
                  Mostrar ausencias finalizadas
                </label>
              </div>
            </div>
          </main>

          <Footer />
        </div>

        {/* Modales */}
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
