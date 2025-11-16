import React, { useState, useEffect } from "react";
// import axios from "axios"; // Eliminado duplicado
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import InfoPersonal from "./InfoPersonal.jsx";
import CapacitacionesSection from "./CapacitacionesSection.jsx";
import InduccionesSection from "./InduccionesSection.jsx";
import ModalDocumentos from "./ModalDocumentos.jsx";
import AsistenciaModal from "../../components/confirmarasistencia/AsistenciaModal.jsx";
import AusenciaForm from "../Ausencia/AusenciaForm.jsx";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const API2 = process.env.REACT_APP_API_DOCS;

const PerfilContainer = () => {
  const [empleado, setEmpleado] = useState(null);
  const [capacitacionesInfo, setCapacitacionesInfo] = useState([]);
  const [induccionesAsignadas, setInduccionesAsignadas] = useState([]);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
  const [showAusenciaForm, setShowAusenciaForm] = useState(false);
  const [ausenciaData, setAusenciaData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [documentosModal, setDocumentosModal] = useState([]);
  const [induccionSeleccionada, setInduccionSeleccionada] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idUsuario = Number(sessionStorage.getItem("idUsuario"));
        if (!idUsuario) return;

        // Obtener usuario logueado
        const resUsuarios = await axios.get(`${API}/usuarios/`);
        const usuarioActual = resUsuarios.data.results
          ? resUsuarios.data.results.find((u) => u.idusuario === idUsuario)
          : resUsuarios.data.find((u) => u.idusuario === idUsuario);

        if (!usuarioActual) {
          showToast("Usuario no encontrado", "error");
          return;
        }

        // Obtener empleado asociado
        const resEmpleados = await axios.get(`${API}/empleados/`);
        const empleadoActual = resEmpleados.data.results
          ? resEmpleados.data.results.find(
            (e) => e.idempleado === usuarioActual.idempleado
          )
          : resEmpleados.data.find(
            (e) => e.idempleado === usuarioActual.idempleado
          );

        if (!empleadoActual) {
          showToast("No se encontró el colaborador asociado al usuario", "error");
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
      const resCap = await axios.get(`${API}/empleadocapacitacion/`);
      const capsEmpleado = resCap.data.results
        ? resCap.data.results.filter((c) => c.idempleado === idEmpleado)
        : resCap.data.filter((c) => c.idempleado === idEmpleado);

      const resCapsInfo = await axios.get(`${API}/capacitaciones/`);
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
      const resInducciones = await axios.get(`${API}/inducciones/`);
      const listaInducciones = resInducciones.data.results || resInducciones.data;

      const resDocs = await axios.get(`${API}/inducciondocumentos/`);
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

      const resDocs = await axios.get(`${API}/inducciondocumentos/`);
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
          const resDoc = await axios.get(`${API}/documentos/${d.iddocumento}/`);
          return resDoc.data;
        })
      );

      // Añadir un método directo de descarga
      const docsConDescarga = docsData.map((doc) => ({
        ...doc,
        descargar: async () => {
          try {
            const response = await fetch(`${API2}${doc.archivo}`);
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
      await axios.post(`${API}/ausencias/`, dataAusencia);
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
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: "30px",
                  color: "#023047",
                }}
              >
                Perfil de {empleado ? empleado.nombre : "Cargando..."}
              </h2>

              {empleado && (
                <>
                  <InfoPersonal empleado={empleado} formatFecha={formatFecha} />

                  {/* 📘 Capacitaciones */}
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
                  />
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
        {showAusenciaForm && (
          <AusenciaForm
            usuario={empleado}
            empleados={[empleado]}
            editingAusencia={ausenciaData}
            onSubmit={guardarAusencia}
            onClose={() => setShowAusenciaForm(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default PerfilContainer;
