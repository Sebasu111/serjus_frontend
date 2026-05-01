import React, { useState, useEffect } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import InfoPersonal from "./InfoPersonal.jsx";
import Editarinfo from "./Editarinfo.jsx";
import CapacitacionesSection from "./CapacitacionesSection.jsx";
import FormularioResponderModal from "./FormularioResponderModal.jsx";
import InduccionesSection from "./InduccionesSection.jsx";
import ModalDocumentos from "./ModalDocumentos.jsx";
import AsistenciaModal from "../../components/confirmarasistencia/AsistenciaModal.jsx";
import AusenciaForm from "../Ausencia/AusenciaForm.jsx";
import axios from "axios";
import { fetchCVEmpleado } from "./editarinfo";
import VerComentariosModal from "./VerComentariosModal.jsx";
import EncuestaMusculoesqueletica from "./EncuestaMusculoesqueletica.jsx";
import RegistroEnfermedades from "./RegistroEnfermedades.jsx";

const API = process.env.REACT_APP_API_URL;
const API2 = process.env.REACT_APP_API_DOCS;
const token = sessionStorage.getItem("token");

const PerfilContainer = () => {
  const [empleado, setEmpleado] = useState(null);
  const [capacitacionesInfo, setCapacitacionesInfo] = useState([]);
  const [induccionesAsignadas, setInduccionesAsignadas] = useState([]);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
  const [showAusenciaForm, setShowAusenciaForm] = useState(false);
  const [ausenciaData, setAusenciaData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState(null);
  const [erroresPerfil, setErroresPerfil] = useState({});
  const [documentosModal, setDocumentosModal] = useState([]);
  const [induccionSeleccionada, setInduccionSeleccionada] = useState(null);
  const [archivoPlan, setArchivoPlan] = useState(null);
  const [modalFormularioVisible, setModalFormularioVisible] = useState(false);
  const [formularioActual, setFormularioActual] = useState(null);
  const [comentariosModal, setComentariosModal] = useState(null);
  const [modalComentariosVisible, setModalComentariosVisible] = useState(false);
  const [encuestaVisible, setEncuestaVisible] = useState(false);
  const [respuestasEncuesta, setRespuestasEncuesta] = useState(null);
  const [pasoEncuesta, setPasoEncuesta] = useState(1);

  const handleVerComentarios = async (induccion) => {
    try {
      const res = await axios.get(
        `${API}/mi-respuesta/${induccion.idinduccion}/${empleado.idempleado}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComentariosModal(res.data);
      setModalComentariosVisible(true);

    } catch (error) {
      showToast("Aún no tienes comentarios", "info");
    }
  };

  //Formulario
  const handleRealizarFormulario = async (induccion) => {
    try {
      // 🔹 1. Obtener asignación inducción-formulario
      const resAsignacion = await axios.get(`${API}/induccion-formulario/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const asignaciones = resAsignacion.data.results || resAsignacion.data;

      const asignado = asignaciones.find(
        a =>
          Number(a.idinduccion) === Number(induccion.idinduccion) &&
          a.estado === true
      );

      if (!asignado) {
        showToast("Esta inducción no tiene formulario asignado", "info");
        return;
      }

      // 🔹 2. Obtener formulario completo
      const resFormulario = await axios.get(
        `${API}/formularios/${asignado.idformulario}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const formulario = resFormulario.data;

      //console.log("FORMULARIO:", formulario);

      // 🔥 AQUÍ luego abriremos el modal
      showToast("Formulario cargado correctamente", "success");

      setFormularioActual(formulario);
      setModalFormularioVisible(true);

    } catch (error) {
      console.error(error);
      showToast("Error al cargar el formulario", "error");
    }
  };

  //PLAN INDUCCION
  const handleSubirPlan = async (file) => {
    if (!file) return;

    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));

      // 🔍 1. Buscar si ya existe plan
      const res = await axios.get(`${API}/documentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const documentos = res.data.results || res.data;

      const planExistente = documentos.find(
        (d) => Number(d.idtipodocumento) === 9 && d.estado === true
      );

      // 📦 FormData
      const formData = new FormData();
      formData.append("archivo", file);
      formData.append("nombrearchivo", file.name.replace(/\.pdf$/i, ""));
      formData.append("mimearchivo", "pdf");
      formData.append("fechasubida", new Date().toISOString().split("T")[0]);
      formData.append("estado", true);
      formData.append("idusuario", idUsuario);
      formData.append("idtipodocumento", 9);

      if (planExistente) {
        // 🔁 ACTUALIZAR
        await axios.put(
          `${API}/documentos/${planExistente.iddocumento}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        showToast("Plan de inducción actualizado correctamente", "success");
      } else {
        // 🆕 CREAR
        await axios.post(`${API}/documentos/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        showToast("Plan de inducción subido correctamente", "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Error al guardar el plan", "error");
    }
  };

  const handleDescargarPlan = async () => {
    try {
      const res = await axios.get(`${API}/documentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const documentos = res.data.results || res.data;

      // 🔥 buscar el plan de inducción
      const plan = documentos.find(
        (d) => Number(d.idtipodocumento) === 9 && d.estado === true
      );

      if (!plan) {
        showToast("No hay plan de inducción disponible", "info");
        return;
      }

      const response = await fetch(`${plan.archivo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Error al descargar");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = plan.nombrearchivo || "plan_induccion.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showToast("Error al descargar el plan", "error");
    }
  };

  const handlePlanInduccion = () => {
    const idRol = Number(sessionStorage.getItem("idRol"));

    if (idRol === 5) {
      document.getElementById("inputPlan").click();
    } else {
      handleDescargarPlan();
    }
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idUsuario = Number(sessionStorage.getItem("idUsuario"));
        if (!idUsuario) return;

        // Obtener usuario logueado
        const resUsuarios = await axios.get(`${API}/usuarios/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const usuarioActual = resUsuarios.data.results
          ? resUsuarios.data.results.find((u) => u.idusuario === idUsuario)
          : resUsuarios.data.find((u) => u.idusuario === idUsuario);

        if (!usuarioActual) {
          showToast("Usuario no encontrado", "error");
          return;
        }

        // Obtener empleado asociado
        const resEmpleados = await axios.get(`${API}/empleados/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empleadoActual = resEmpleados.data.results
          ? resEmpleados.data.results.find(
            (e) => e.idempleado === usuarioActual.idempleado
          )
          : resEmpleados.data.find(
            (e) => e.idempleado === usuarioActual.idempleado
          );

        if (!empleadoActual) {
          showToast("No se encontró el Trabajador asociado al usuario", "error");
          return;
        }

        setEmpleado(empleadoActual);

        // Cargar datos relacionados
        await cargarCapacitaciones(empleadoActual.idempleado);
        await cargarInduccionesEmpleado(empleadoActual.idempleado);
      } catch (error) {
        console.error(error);
        showToast("Error al cargar datos del perfil", "error");
      }
    };

    fetchPerfil();
  }, []);

  // 🔹 Cargar capacitaciones
  const cargarCapacitaciones = async (idEmpleado) => {
    try {
      const resCap = await axios.get(`${API}/empleadocapacitacion/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar solo asignaciones activas
      const capsEmpleado = resCap.data.results
        ? resCap.data.results.filter((c) => c.idempleado === idEmpleado && c.estado === true)
        : resCap.data.filter((c) => c.idempleado === idEmpleado && c.estado === true);

      const resCapsInfo = await axios.get(`${API}/capacitaciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listaCapacitaciones = resCapsInfo.data.results || resCapsInfo.data;

      const info = capsEmpleado.map((c) => {
        const idCap =
          typeof c.idcapacitacion === "object"
            ? c.idcapacitacion.idcapacitacion
            : c.idcapacitacion;

        const cap = listaCapacitaciones.find(
          (ci) => ci.idcapacitacion === idCap
        );

        return {
          ...c,
          idcapacitacion: idCap,
          nombre: cap?.nombreevento || "N/A",
          lugar: cap?.lugar || "N/A",
          fechaInicio: cap?.fechainicio || "-",
          fechaFin: cap?.fechafin || "-",
          observacion: cap?.observacion || "-",
        };
      });

      setCapacitacionesInfo(info);
    } catch (error) {
      console.error(error);
      showToast("Error al cargar capacitaciones", "error");
    }
  };

  // 🔹 Cargar inducciones asignadas al empleado
  const cargarInduccionesEmpleado = async (idEmpleado) => {
    try {
      const resInducciones = await axios.get(`${API}/inducciones/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listaInducciones = resInducciones.data.results || resInducciones.data;

      const resDocs = await axios.get(`${API}/inducciondocumentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const listaDocs = resDocs.data.results || resDocs.data;

      const induccionesEmpleado = listaDocs
        .filter(
          (doc) =>
            doc.idempleado === idEmpleado &&
            doc.estado === true &&
            doc.idinduccion
        )
        .map((doc) => {
          const induccion =
            typeof doc.idinduccion === "object"
              ? doc.idinduccion
              : listaInducciones.find(
                (i) => i.idinduccion === doc.idinduccion
              );
          return induccion;
        })
        .filter(
          (ind, index, self) =>
            ind && index === self.findIndex((i) => i.idinduccion === ind.idinduccion)
        );

      setInduccionesAsignadas(induccionesEmpleado);
    } catch (error) {
      console.error("Error al cargar inducciones:", error);
      showToast("Error al cargar inducciones asignadas", "error");
    }
  };

  // 🔹 Ver documentos asignados a una inducción (descarga funcional)
  const handleVerDocumentos = async (induccion) => {
    try {
      setInduccionSeleccionada(induccion);

      const resDocs = await axios.get(`${API}/inducciondocumentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docsEmpleado = resDocs.data.results || resDocs.data;

      const documentosRelacionados = docsEmpleado.filter(
        (d) =>
          d.idinduccion === induccion.idinduccion &&
          d.idempleado === empleado.idempleado &&
          d.estado === true
      );

      if (documentosRelacionados.length === 0) {
        showToast("No hay documentos asignados para esta inducción", "info");
        setDocumentosModal([]);
        setModalVisible(true);
        return;
      }

      // Obtener metadatos de los documentos
      const docsData = await Promise.all(
        documentosRelacionados.map(async (d) => {
          const resDoc = await axios.get(`${API}/documentos/${d.iddocumento}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return resDoc.data;
        })
      );

      // Añadir un método directo de descarga
      const docsConDescarga = docsData.map((doc) => ({
        ...doc,
        descargar: async () => {
          try {
            const response = await fetch(`${API2}${doc.archivo}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error al descargar el archivo");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.nombrearchivo || "documento.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Error al descargar:", err);
            showToast("No se pudo descargar el documento", "error");
          }
        },
      }));

      setDocumentosModal(docsConDescarga);
      setModalVisible(true);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
      showToast("Error al cargar documentos", "error");
    }
  };

  // 🔹 Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha;
    const [year, month, day] = partes;
    return `${day}-${month}-${year}`;
  };

  // 🔹 Guardar ausencia desde el formulario
  const guardarAusencia = async (dataAusencia) => {
    try {
      await axios.post(`${API}/ausencias/`, dataAusencia, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Ausencia registrada correctamente", "success");
      setShowAusenciaForm(false);
    } catch (error) {
      console.error(error);
      showToast("Error al registrar ausencia", "error");
    }
  };

  return (
    <Layout>
      <SEO title="Perfil" />
      <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <input
            id="inputPlan"
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (file.type !== "application/pdf") {
                showToast("Solo PDF", "warning");
                return;
              }

              handleSubirPlan(file);
            }}
          />

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
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
                <h2
                  style={{
                    margin: 0,
                    color: "#023047",
                    fontWeight: 700
                  }}
                >
                  {empleado ? empleado.nombre : "Cargando..."}
                </h2>
                {!editandoPerfil && empleado && (
                  <div style={{ display: "flex", gap: "10px" }}>

                    {/* Botón Editar */}
                    <button
                      style={{
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 22px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                      onClick={async () => {
                        const cvUrl = await fetchCVEmpleado(empleado.idempleado);
                        const rawInicioLaboral =
                          empleado.inicioLaboral || empleado.iniciolaboral || null;

                        const inicioLaboralForm = rawInicioLaboral
                          ? rawInicioLaboral.split("T")[0]
                          : "";

                        setFormPerfil({
                          ...empleado,
                          numerohijos:
                            empleado.numerohijos !== null &&
                              empleado.numerohijos !== undefined
                              ? String(empleado.numerohijos)
                              : "",
                          inicioLaboral: inicioLaboralForm,
                          cvUrl
                        });

                        setEditandoPerfil(true);
                      }}
                    >
                      Editar información
                    </button>

                    {/* Nuevo botón */}
                    <button
                      style={{
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "10px 22px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        setPasoEncuesta(1);
                        setEncuestaVisible(true);
                      }}
                    >
                      Encuesta Anual de Salud
                    </button>

                  </div>
                )}
              </div>

              {empleado && (
                <>
                  {!editandoPerfil && (
                    <InfoPersonal empleado={empleado} formatFecha={formatFecha} />
                  )}
                  {editandoPerfil && (
                    <Editarinfo
                      form={formPerfil}
                      onChange={e => {
                        const { name, value } = e.target;
                        setFormPerfil(f => ({ ...f, [name]: value }));
                      }}
                      onClose={() => setEditandoPerfil(false)}
                      idiomas={[]}     // por ahora sin datos, después lo llenamos
                      pueblos={[]}     // por ahora sin datos, después lo llenamos
                    />
                  )}
                  {/* 📘 Capacitaciones */}
                  {!editandoPerfil && (
                    <>
                      <CapacitacionesSection
                        capacitacionesInfo={capacitacionesInfo}
                        formatFecha={formatFecha}
                        setCapacitacionSeleccionada={(c) => {
                          if (c.modo === "justifico") {
                            setAusenciaData({
                              idempleado: empleado.idempleado,
                              tipo: "Personal", // o puedes dejar que el usuario seleccione
                              fechainicio: c.fechaInicio,
                              fechafin: c.fechaFin,
                              idcapacitacion: c.idcapacitacion,
                              observacion: c.observacion,
                              idusuario: empleado.idusuario,
                            });
                            setShowAusenciaForm(true);
                          } else {
                            setCapacitacionSeleccionada(c);
                            setShowAsistenciaModal(true);
                          }
                        }}
                        setShowAsistenciaModal={setShowAsistenciaModal}
                      />

                      {/* 📗 Inducciones */}
                      <InduccionesSection
                        induccionesAsignadas={induccionesAsignadas}
                        formatFecha={formatFecha}
                        onVerDocumentos={handleVerDocumentos}
                        onPlanInduccion={handlePlanInduccion}
                        onRealizarFormulario={handleRealizarFormulario}
                        onVerComentarios={handleVerComentarios}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </main>

          <Footer />
          <ScrollToTop />
        </div>

        {/* 📂 Modal de documentos de inducción */}
        <ModalDocumentos
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          documentos={documentosModal}
          induccionNombre={induccionSeleccionada?.nombre}
        />

        {/* 📘 Modal de asistencia a capacitaciones */}
        <AsistenciaModal
          show={showAsistenciaModal}
          onClose={() => setShowAsistenciaModal(false)}
          capacitacion={capacitacionSeleccionada}
          onGuardar={() => { }}
        />
        <FormularioResponderModal
          visible={modalFormularioVisible}
          onClose={() => setModalFormularioVisible(false)}
          formulario={formularioActual}
          empleado={empleado}
        />
        <VerComentariosModal
          visible={modalComentariosVisible}
          onClose={() => setModalComentariosVisible(false)}
          data={comentariosModal}
        />
        {showAusenciaForm && (
          <AusenciaForm
            usuario={empleado}
            empleados={[empleado]}
            editingAusencia={ausenciaData}
            onSubmit={guardarAusencia}
            onClose={() => setShowAusenciaForm(false)}
          />
        )}

        {encuestaVisible && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}>

            <div style={{
              width: "95vw",              // 🔥 usa casi toda la pantalla
              maxWidth: "1400px",        // 🔥 límite elegante
              height: "90vh",            // 🔥 altura controlada
              background: "#fff",
              borderRadius: "14px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}>

              {/* 🔹 HEADER */}
              <div style={{
                padding: "15px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc"
              }}>
                <h3 style={{ margin: 0, color: "#023047" }}>
                  Encuesta Anual de Salud
                </h3>

                <button
                  onClick={() => setEncuestaVisible(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* 🔹 CONTENIDO SCROLL */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                background: "#EEF2F7"
              }}>

                {/* PASO 1 */}
                {pasoEncuesta === 1 && (
                  <EncuestaMusculoesqueletica
                    empleado={empleado}
                    onNext={(data) => {
                      console.log("Respuestas paso 1:", data);

                      setRespuestasEncuesta(data);

                      // 🔥 ir al segundo formulario
                      setPasoEncuesta(2);
                    }}
                  />
                )}

                {/* PASO 2 */}
                {pasoEncuesta === 2 && (
                  <RegistroEnfermedades
                    empleado={empleado}
                    onBack={() => {
                      setPasoEncuesta(1);
                    }}
                    onNext={(data2) => {

                      // aquí puedes unir todo
                      const encuestaCompleta = {
                        musculoesqueletica: respuestasEncuesta,
                        enfermedades: data2
                      };

                      // 🔥 cerrar modal
                      setEncuestaVisible(false);

                      // opcional reiniciar
                      setPasoEncuesta(1);
                    }}
                  />
                )}

              </div>

              {/* 🔹 FOOTER */}
              <div style={{
                padding: "10px 20px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc"
              }}>
                <button
                  onClick={() => setEncuestaVisible(false)}
                  style={{
                    background: "#ccc",
                    border: "none",
                    padding: "8px 15px",
                    borderRadius: 6,
                    cursor: "pointer"
                  }}
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PerfilContainer;
