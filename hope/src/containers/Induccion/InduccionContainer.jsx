import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import InduccionForm from "./InduccionForm";
import ConfirmModal from "./ConfirmModal";
import InduccionTable from "./InduccionTable";
import GestionarDocumentosModal from "./GestionarDocumentosModal";
import DocumentosAsignadosModal from "./DocumentosAsignadosModal";
import VerRespuestasModal from "./VerRespuestasModal";
import FormularioModal from "./FormularioModal";
const API2 = process.env.REACT_APP_API_URL;
const API = `${API2}/inducciones/`;
const token = sessionStorage.getItem("token");

const InduccionContainer = () => {
  const [nombre, setNombre] = useState("");
  const [fechainicio, setFechaInicio] = useState("");
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activoEditando, setActivoEditando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  const [mostrarGestionarDocumentos, setMostrarGestionarDocumentos] = useState(false);
  const [induccionSeleccionada, setInduccionSeleccionada] = useState(null);

  const [mostrarDocumentosAsignados, setMostrarDocumentosAsignados] = useState(false);
  const [induccionParaDocumentos, setInduccionParaDocumentos] = useState(null);

  //INDUCCION FORMULARIO ##################################################################
  const [mostrarFormularioModal, setMostrarFormularioModal] = useState(false);
  const [formularios, setFormularios] = useState([]);
  const [induccionSeleccionadaFormulario, setInduccionSeleccionadaFormulario] = useState(null);
  const [formularioPrecargado, setFormularioPrecargado] = useState(null);

  const [modalRespuestasOpen, setModalRespuestasOpen] = useState(false);

  const handleVerRespuestas = (ind) => {
    setInduccionSeleccionada(ind);
    setModalRespuestasOpen(true);
  };

  useEffect(() => {
    fetchAll();
    setFechaInicio(getFechaLocalISO());

  }, []);

  const fetchAll = async () => {
    try {
      // 🔹 1. Traer inducciones
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
          ? res.data.results
          : [];

      // 🔹 2. Traer asignaciones
      const resAsignados = await axios.get(`${API2}/induccion-formulario/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const asignados = Array.isArray(resAsignados.data)
        ? resAsignados.data
        : resAsignados.data.results || [];

      // 🔥 3. CRUZAR DATA
      const data = raw.map(r => {
        const id = r.idinduccion ?? r.id;

        const tieneFormulario = asignados.some(
          a =>
            Number(a.idinduccion) === Number(id) &&
            a.estado === true
        );

        return {
          idinduccion: id,
          nombre: r.nombre,
          fechainicio: r.fechainicio ?? r.fechaInicio,
          estado: r.estado,
          idusuario: r.idusuario, // 🔥 IMPORTANTE
          formularioAsignado: tieneFormulario
        };
      });

      // 🔥 FILTRAR INDUCCIONES POR USUARIO
      let induccionesPermitidas = data;

      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const idRol = Number(sessionStorage.getItem("idRol"));

      // 🔥 SI ES COORDINADOR → SOLO VE LAS SUYAS
      if (idRol === 1) {

        induccionesPermitidas = data.filter(
          (ind) => Number(ind.idusuario) === idUsuario
        );
      }

      setItems(induccionesPermitidas);

    } catch (e) {
      console.error(e);
      showToast("Error al cargar Inducciones", "error");
    }
  };
  // ✅ Versión final de getFechaLocalISO
  const getFechaLocalISO = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`; // ⬅️ sin hora, sin toISOString (no genera UTC)
  };


  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const yaExiste = items.some(
        i =>
          (i.nombre || "").trim().toLowerCase() === nombre.trim().toLowerCase() &&
          i.idinduccion !== editingId
      );
      if (yaExiste) {
        showToast("Ya existe una inducción con ese nombre", "warning");
        return;
      }

      const fechaActual = getFechaLocalISO();
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));

      const payload = {
        nombre,
        fechainicio: editingId ? fechainicio : fechaActual,
        estado: Boolean(activoEditando),
        idusuario: idUsuario
      };

      if (editingId) {
        await axios.put(`${API}${editingId}/`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(API, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      showToast(editingId ? "Actualizado correctamente" : "Registrado correctamente");
      setNombre("");
      setEditingId(null);
      setActivoEditando(true);
      setMostrarFormulario(false);
      fetchAll();
    } catch (error) {
      const apiErr = error.response?.data;
      const detalle =
        (apiErr && (apiErr.fechainicio?.[0] || apiErr.detail || JSON.stringify(apiErr))) || "desconocido";
      console.error("POST/PUT induccion error:", apiErr || error);
      showToast(`Error al guardar: ${detalle}`, "error");
    }
  };

  const handleEdit = row => {
    if (!row.estado) {
      showToast("No se puede editar un registro inactivo");
      return;
    }
    setNombre(row.nombre || "");
    setFechaInicio(row.fechainicio || "");
    setEditingId(row.idinduccion);
    setActivoEditando(row.estado);
    setMostrarFormulario(true);
  };

  const handleDelete = async (row) => {
    try {
      // 🔍 Verificar si existen empleados o documentos activos vinculados
      const res = await axios.get(`${API2}/inducciondocumentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];

      const relacionadosActivos = data.filter(
        (d) =>
          Number(d.idinduccion) === Number(row.idinduccion) &&
          d.estado === true
      );

      if (relacionadosActivos.length > 0) {
        // ❌ Tiene registros activos: advertir y salir
        showToast(
          "No puede desactivar esta inducción mientras tenga empleados o documentos asignados. Desasígnelos primero.",
          "warning"
        );
        return;
      }

      // ✅ No hay registros activos → mostrar modal de confirmación
      setSeleccionado(row);
      setMostrarConfirmacion(true);
    } catch (e) {
      console.error("Error verificando registros antes de desactivar:", e);
      showToast("Error al verificar relaciones de inducción", "error");
    }
  };


  const confirmarDesactivacion = async () => {
    if (!seleccionado) return;

    try {
      // 🔍 1️⃣ Verificar si existen documentos o empleados activos en esta inducción
      const res = await axios.get(`${API2}/inducciondocumentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];

      const relacionadosActivos = data.filter(
        (d) =>
          Number(d.idinduccion) === Number(seleccionado.idinduccion) &&
          d.estado === true
      );

      if (relacionadosActivos.length > 0) {
        // Hay empleados o documentos activos vinculados
        showToast(
          "No puede desactivar esta inducción mientras tenga empleados o documentos asignados. Desasígnelos primero.",
          "warning"
        );
        setMostrarConfirmacion(false);
        setSeleccionado(null);
        return;
      }

      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      await axios.put(`${API}${seleccionado.idinduccion}/`, {
        nombre: seleccionado.nombre,
        fechainicio: seleccionado.fechainicio,
        estado: false,
        idusuario: idUsuario,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast("Inducción desactivada correctamente", "success");
      fetchAll();
    } catch (e) {
      console.error("Error al desactivar inducción:", e);
      showToast("Error al desactivar la inducción", "error");
    } finally {
      setMostrarConfirmacion(false);
      setSeleccionado(null);
    }
  };

  const handleActivate = async id => {
    try {
      const row = items.find(i => i.idinduccion === id);
      if (!row) return;
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      await axios.put(`${API}${id}/`, {
        nombre: row.nombre,
        fechainicio: row.fechainicio,
        estado: true,
        idusuario: idUsuario
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Activado correctamente");
      fetchAll();
    } catch (e) {
      console.error(e);
      showToast("Error al activar", "error");
    }
  };

  const handleGestionarDocumentos = induccion => {
    setInduccionSeleccionada(induccion);
    setMostrarGestionarDocumentos(true);
  };

  const handleVerDetalle = induccion => {
    setInduccionParaDocumentos(induccion);
    setMostrarDocumentosAsignados(true);
  };

  const formatDateForDisplay = dateString => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const filtrados = [...items]
    // 🔹 Solo mostrar inducciones activas
    .filter((i) => i.estado === true)
    // 🔹 Ordenar por fecha de creación o inicio
    .sort((a, b) => {
      const fechaA =
        new Date(a.createdAt || a.created_at || a.fechainicio || "1900-01-01").getTime();
      const fechaB =
        new Date(b.createdAt || b.created_at || b.fechainicio || "1900-01-01").getTime();

      if (isNaN(fechaA) && isNaN(fechaB)) return 0;
      if (isNaN(fechaA)) return 1;
      if (isNaN(fechaB)) return -1;

      return fechaB - fechaA;
    })

    // 🔹 Buscador por nombre o fecha
    .filter((i) => {
      const t = busqueda.toLowerCase().trim();
      const n = i.nombre?.toLowerCase() || "";
      const fechaInicioStr = formatDateForDisplay(i.fechainicio).toLowerCase();
      return n.includes(t) || fechaInicioStr.includes(t);
    });


  const indexLast = paginaActual * elementosPorPagina;
  const indexFirst = indexLast - elementosPorPagina;
  const paginados = filtrados.slice(indexFirst, indexLast);
  const totalPaginas = Math.ceil(filtrados.length / elementosPorPagina);

  //Formulario Induccion #######################################################
  const handleAsignarFormulario = async (induccion) => {
    try {
      setInduccionSeleccionadaFormulario(induccion);

      // 🔥 1. Consultar si ya tiene formulario asignado
      const resAsignados = await axios.get(`${API2}/induccion-formulario/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const asignados = Array.isArray(resAsignados.data)
        ? resAsignados.data
        : resAsignados.data.results || [];

      const asignado = asignados.find(
        a => Number(a.idinduccion) === Number(induccion.idinduccion) && a.estado === true
      );

      // 🔥 2. Traer formularios
      const resFormularios = await axios.get(`${API2}/formularios/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dataFormularios = Array.isArray(resFormularios.data)
        ? resFormularios.data
        : resFormularios.data.results || [];

      setFormularios(dataFormularios);

      // 🔥 3. SI YA TIENE → cargar ese formulario
      if (asignado) {
        const formularioEncontrado = dataFormularios.find(
          f => Number(f.idformulario) === Number(asignado.idformulario)
        );

        setFormularioPrecargado(formularioEncontrado || null);
      } else {
        setFormularioPrecargado(null);
      }

      setMostrarFormularioModal(true);

    } catch (error) {
      console.error(error);
      showToast("Error al cargar formularios", "error");
    }
  };

  useEffect(() => {
    //console.log("MODAL STATE:", mostrarFormularioModal);
  }, [mostrarFormularioModal]);

  return (
    <Layout>
      <SEO title="Inducciones" />
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
              padding: "48px 20px 8rem"
            }}
          >
            <div style={{ width: "min(1100px, 96vw)" }}>
              <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Inducciones Registradas</h2>

              {/* Buscador */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                  alignItems: "center"
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar nombre / fecha inicio / estado..."
                  value={busqueda}
                  onChange={e => {
                    setBusqueda(e.target.value);
                    setPaginaActual(1);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    marginRight: "10px"
                  }}
                />
                <button
                  onClick={() => {
                    setNombre("");
                    setFechaInicio(getFechaLocalISO());
                    setEditingId(null);
                    setActivoEditando(true);
                    setMostrarFormulario(true);
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#219ebc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Nueva Inducción
                </button>
              </div>

              {/* Tabla principal */}
              <InduccionTable
                items={paginados}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleActivate={handleActivate}
                handleGestionarDocumentos={handleGestionarDocumentos}
                handleVerDetalle={handleVerDetalle}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                setPaginaActual={setPaginaActual}
                formatDateForDisplay={formatDateForDisplay}
                handleAsignarFormulario={handleAsignarFormulario}
                mostrarFormularioModal={mostrarFormularioModal}
                setMostrarFormularioModal={setMostrarFormularioModal}
                formularios={formularios}
                handleVerRespuestas={handleVerRespuestas}
              />

              {/* Selector de elementos por página */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                <input
                  type="number"
                  min="1"
                  value={elementosPorPagina}
                  onChange={e => {
                    const n = Number(e.target.value) || 1;
                    setElementosPorPagina(n);
                    setPaginaActual(1);
                  }}
                  style={{
                    width: "80px",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    textAlign: "center"
                  }}
                />
              </div>
            </div>
          </main>
          <Footer />
        </div>

        {/* === Formularios y modales === */}
        {mostrarFormulario && (
          <InduccionForm
            nombre={nombre}
            setNombre={setNombre}
            fechainicio={fechainicio}
            setFechaInicio={setFechaInicio}
            activoEditando={activoEditando}
            editingId={editingId}
            handleSubmit={handleSubmit}
            onClose={() => {
              setMostrarFormulario(false);
              setNombre("");
              setEditingId(null);
              setActivoEditando(true);
            }}
          />
        )}

        {mostrarConfirmacion && (
          <ConfirmModal
            registro={seleccionado}
            onConfirm={confirmarDesactivacion}
            onCancel={() => setMostrarConfirmacion(false)}
            tipo="inducción"
          />
        )}

        {mostrarGestionarDocumentos && (
          <GestionarDocumentosModal
            onClose={() => setMostrarGestionarDocumentos(false)}
            induccion={induccionSeleccionada}
          />
        )}

        {mostrarDocumentosAsignados && (
          <DocumentosAsignadosModal
            visible={mostrarDocumentosAsignados}
            onClose={() => setMostrarDocumentosAsignados(false)}
            induccion={induccionParaDocumentos}
          />
        )}

        {mostrarFormularioModal && (
          <FormularioModal
            visible={mostrarFormularioModal}
            onClose={() => setMostrarFormularioModal(false)}
            formularios={formularios}
            induccion={induccionSeleccionadaFormulario}
            formularioPrecargado={formularioPrecargado}
          />
        )}

        {modalRespuestasOpen && (
          <VerRespuestasModal
            visible={modalRespuestasOpen}
            onClose={() => setModalRespuestasOpen(false)}
            induccion={induccionSeleccionada}
          />
        )}
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default InduccionContainer;
