// containers/aspirantes/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import SidebarMenu from "../../components/menu/main-menu/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

const AspirantesContainer = () => {
  const [aspirantes, setAspirantes] = useState([]);
  const [form, setForm] = useState({
    idaspirante: 0,
    nombreaspirante: "",
    apellidoaspirante: "",
    nit: "",
    dpi: "",
    genero: "",
    email: "",
    fechanacimiento: "",
    telefono: "",
    direccion: "",
    estado: true,
    ididioma: 0,
    idpueblocultura: 0,
  });
  const [mensaje, setMensaje] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [aspiranteActivoEditando, setAspiranteActivoEditando] = useState(true);

  // PAGINACIÓN Y BÚSQUEDA
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  const API = "http://127.0.0.1:8000/api/aspirantes/";

  useEffect(() => {
    fetchAspirantes();
  }, []);

  const fetchAspirantes = async () => {
    try {
      const res = await axios.get(API);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
          ? res.data.results
          : [];
      setAspirantes(data);
    } catch (error) {
      console.error("Error al cargar aspirantes:", error);
      setMensaje("Error al cargar los aspirantes");
      setAspirantes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idusuario = Number(sessionStorage.getItem("idUsuario")) || 1;
      const data = {
        ...form,
        idaspirante: editingId ? editingId : 0,
        idusuario,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
      };

      if (editingId) {
        await axios.put(`${API}${editingId}/`, data);
        setMensaje("Aspirante actualizado correctamente");
      } else {
        await axios.post(API, data);
        setMensaje("Aspirante registrado correctamente");
      }

      // reset
      setForm({
        idaspirante: 0,
        nombreaspirante: "",
        apellidoaspirante: "",
        nit: "",
        dpi: "",
        genero: "",
        email: "",
        fechanacimiento: "",
        telefono: "",
        direccion: "",
        estado: true,
        ididioma: 0,
        idpueblocultura: 0,
      });
      setEditingId(null);
      setAspiranteActivoEditando(true);
      setMostrarFormulario(false);
      fetchAspirantes();
    } catch (error) {
      console.error("Error al guardar aspirante:", error);
      setMensaje("Error al registrar el aspirante");
    }
  };

  const handleEdit = (aspirante) => {
    if (!aspirante.estado) {
      setMensaje("No se puede editar un aspirante inactivo");
      return;
    }
    setForm({
      idaspirante: aspirante.idaspirante,
      nombreaspirante: aspirante.nombreaspirante,
      apellidoaspirante: aspirante.apellidoaspirante,
      nit: aspirante.nit,
      dpi: aspirante.dpi || "",
      genero: aspirante.genero || "",
      email: aspirante.email,
      fechanacimiento: aspirante.fechanacimiento || "",
      telefono: aspirante.telefono,
      direccion: aspirante.direccion || "",
      estado: aspirante.estado,
      ididioma: aspirante.ididioma || 0,
      idpueblocultura: aspirante.idpueblocultura || 0,
    });
    setEditingId(aspirante.idaspirante);
    setAspiranteActivoEditando(aspirante.estado);
    setMostrarFormulario(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas desactivar este aspirante?")) return;
    try {
      const aspirante = aspirantes.find((a) => a.idaspirante === id);
      const idusuario = Number(sessionStorage.getItem("idUsuario")) || 1;

      await axios.put(`${API}${id}/`, {
        ...aspirante,
        estado: false,
        idusuario,
        updatedat: new Date().toISOString(),
      });
      setMensaje("Aspirante desactivado correctamente");
      fetchAspirantes();
    } catch (error) {
      console.error("Error al desactivar aspirante:", error);
      setMensaje("Error al desactivar el aspirante");
    }
  };

  const handleActivate = async (id) => {
    try {
      const aspirante = aspirantes.find((a) => a.idaspirante === id);
      const idusuario = Number(sessionStorage.getItem("idUsuario")) || 1;

      await axios.put(`${API}${id}/`, {
        ...aspirante,
        estado: true,
        idusuario,
        updatedat: new Date().toISOString(),
      });
      setMensaje("Aspirante activado correctamente");
      fetchAspirantes();
    } catch (error) {
      console.error("Error al activar aspirante:", error);
      setMensaje("Error al activar el aspirante");
    }
  };

  // FILTRO Y PAGINACIÓN
  const aspirantesFiltrados = aspirantes.filter((a) =>
    `${a.nombreaspirante} ${a.apellidoaspirante}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const indexOfLast = paginaActual * elementosPorPagina;
  const indexOfFirst = indexOfLast - elementosPorPagina;
  const aspirantesPaginados = aspirantesFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.ceil(aspirantesFiltrados.length / elementosPorPagina);

  return (
    <Layout>
      <SEO title="Hope – Aspirantes" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <SidebarMenu />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />

          <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                Aspirantes Registrados
              </h2>

              {mensaje && (
                <p
                  style={{
                    textAlign: "center",
                    color: mensaje.includes("Error") ? "red" : "green",
                    fontWeight: "bold",
                  }}
                >
                  {mensaje}
                </p>
              )}

              {/* BUSCADOR */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                <input
                  type="text"
                  placeholder="Buscar aspirante..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    marginRight: "10px",
                  }}
                />
                <input
                  type="number"
                  min="1"
                  value={elementosPorPagina}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setElementosPorPagina(val > 0 ? val : 1);
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

              {/* TABLA */}
              <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Nombre", "Apellido", "NIT", "DPI", "Email", "Estado", "Acciones"].map(
                        (h) => (
                          <th key={h} style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {aspirantesPaginados.length > 0 ? (
                      aspirantesPaginados.map((a) => (
                        <tr key={a.idaspirante}>
                          <td style={tdStyle}>{a.nombreaspirante}</td>
                          <td style={tdStyle}>{a.apellidoaspirante}</td>
                          <td style={tdStyle}>{a.nit}</td>
                          <td style={tdStyle}>{a.dpi}</td>
                          <td style={tdStyle}>{a.email}</td>
                          <td style={{ ...tdStyle, textAlign: "center", color: a.estado ? "green" : "red", fontWeight: 600 }}>
                            {a.estado ? "Activo" : "Inactivo"}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <button onClick={() => handleEdit(a)} disabled={!a.estado} style={btnEdit}>
                              Editar
                            </button>
                            {a.estado ? (
                              <button onClick={() => handleDelete(a.idaspirante)} style={btnDanger}>Eliminar</button>
                            ) : (
                              <button onClick={() => handleActivate(a.idaspirante)} style={btnSuccess}>Activar</button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                          No hay aspirantes registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* BOTÓN NUEVO */}
              <button
                onClick={() => setMostrarFormulario(true)}
                style={{
                  marginTop: "20px",
                  padding: "12px 20px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Nuevo Aspirante
              </button>
            </div>
          </main>

          <Footer />
        </div>

        {/* MODAL FORMULARIO */}
        {mostrarFormulario && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h3 style={{ textAlign: "center", marginBottom: 20 }}>
                {editingId ? "Editar Aspirante" : "Registrar Aspirante"}
              </h3>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {/* Columna izquierda */}
                  <div>
                    <label>Nombre</label>
                    <input name="nombreaspirante" value={form.nombreaspirante} onChange={handleChange} required />

                    <label>Apellido</label>
                    <input name="apellidoaspirante" value={form.apellidoaspirante} onChange={handleChange} required />

                    <label>NIT</label>
                    <input name="nit" value={form.nit} onChange={handleChange} required />

                    <label>DPI</label>
                    <input name="dpi" value={form.dpi} onChange={handleChange} />

                    <label>Género</label>
                    <select name="genero" value={form.genero} onChange={handleChange} required>
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Columna derecha */}
                  <div>
                    <label>Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required />

                    <label>Fecha de Nacimiento</label>
                    <input name="fechanacimiento" type="date" value={form.fechanacimiento} onChange={handleChange} />

                    <label>Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={handleChange} />

                    <label>Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={handleChange} />

                    <label>ID Idioma</label>
                    <input name="ididioma" type="number" value={form.ididioma} onChange={handleChange} />

                    <label>ID Pueblo/Cultura</label>
                    <input name="idpueblocultura" type="number" value={form.idpueblocultura} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "25px" }}>
                  <button type="submit" style={btnSubmit}>{editingId ? "Actualizar" : "Guardar"}</button>
                  <button type="button" onClick={() => setMostrarFormulario(false)} style={btnCancel}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ScrollToTop />
      </div>
    </Layout>
  );
};

// estilos base
const tdStyle = { padding: "10px", borderBottom: "1px solid #f0f0f0" };
const btnDanger = { padding: "6px 14px", background: "#dc3545", color: "#fff", border: "none", borderRadius: "5px" };
const btnSuccess = { padding: "6px 14px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px" };
const btnEdit = { padding: "6px 14px", background: "#0054fd", color: "#fff", border: "none", borderRadius: "5px", marginRight: "6px", cursor: "pointer" };
const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalContent = { backgroundColor: "#fff", borderRadius: "12px", padding: "30px", width: "90%", maxWidth: "800px", boxShadow: "0 5px 25px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" };
const btnSubmit = { backgroundColor: "#4CAF50", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const btnCancel = { backgroundColor: "#f44336", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };

export default AspirantesContainer;
