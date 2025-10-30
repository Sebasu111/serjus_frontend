import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import AsistenciaModal from "../../components/confirmarasistencia/AsistenciaModal.jsx";
import CapacitacionesSection from "./CapacitacionesSection.jsx";
import InfoPersonal from "./InfoPersonal.jsx";

const API = "http://127.0.0.1:8000/api";

const PerfilContainer = () => {
  const [empleado, setEmpleado] = useState(null);
  const [capacitacionesInfo, setCapacitacionesInfo] = useState([]);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idUsuario = Number(sessionStorage.getItem("idUsuario"));
        if (!idUsuario) return;

        const resUsuarios = await axios.get(`${API}/usuarios/`);
        const usuarioActual = resUsuarios.data.results.find(u => u.idusuario === idUsuario);
        if (!usuarioActual) {
          showToast("Usuario no encontrado", "error");
          return;
        }

        const resEmpleados = await axios.get(`${API}/empleados/`);
        const empleadoActual = resEmpleados.data.results.find(e => e.idempleado === usuarioActual.idempleado);
        setEmpleado(empleadoActual);
        if (!empleadoActual) {
          showToast("No se encontró el empleado asociado al usuario", "error");
          return;
        }

        await cargarCapacitaciones(empleadoActual.idempleado);
      } catch (error) {
        console.error(error);
        showToast("Error al cargar datos del perfil", "error");
      }
    };

    fetchPerfil();
  }, []);

  // ✅ Corrige fechas y toma correctamente la fechaenvio
  const cargarCapacitaciones = async (idEmpleado) => {
  try {
    const resCap = await axios.get(`${API}/empleadocapacitacion/`);
    const capsEmpleado = resCap.data.results
      ? resCap.data.results.filter(c => c.idempleado === idEmpleado)
      : resCap.data.filter(c => c.idempleado === idEmpleado);

    const resCapsInfo = await axios.get(`${API}/capacitaciones/`);
    const listaCapacitaciones = resCapsInfo.data.results || resCapsInfo.data;

    const info = capsEmpleado.map(c => {
      const idCap = typeof c.idcapacitacion === "object"
        ? c.idcapacitacion.idcapacitacion
        : c.idcapacitacion;

      const cap = listaCapacitaciones.find(ci => ci.idcapacitacion === idCap);

      return {
        ...c,
        idcapacitacion: idCap,
        nombre: cap?.nombreevento || "N/A",
        lugar: cap?.lugar || "N/A",
        fechaInicio: cap?.fechainicio || "-",   // 🔹 fecha de inicio
        fechaFin: cap?.fechafin || "-",         // 🔹 fecha de fin
        observacion: cap?.observacion || "-",
      };
    });

    setCapacitacionesInfo(info);
  } catch (error) {
    console.error(error);
    showToast("Error al cargar capacitaciones", "error");
  }
};


  // ✅ Nueva versión: sin errores por zona horaria
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const partes = fecha.split("-");
    if (partes.length !== 3) return fecha;
    const [year, month, day] = partes;
    return `${day}-${month}-${year}`;
  };

  // 🔹 Actualización de asistencia + idDocumento opcional
  const actualizarCapacitacion = async (id, asistenciaBool, observacion = "", idDocumento = null) => {
    try {
      const cap = capacitacionesInfo.find(c => c.idempleadocapacitacion === id);
      if (!cap) return;

      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const payload = {
        idempleado: cap.idempleado,
        idcapacitacion: cap.idcapacitacion,
        asistencia: asistenciaBool ? "Sí" : "No",
        observacion: observacion || (asistenciaBool ? "Asistió" : "Inasistencia Justificada"),
        // ✅ Guarda la fecha actual correctamente (sin desfase)
        fechaenvio: new Date().toISOString().split("T")[0],
        estado: true,
        idusuario: idUsuario,
        iddocumento: idDocumento
      };

      await axios.put(`${API}/empleadocapacitacion/${id}/`, payload);
      showToast(asistenciaBool ? "Asistencia registrada" : "Inasistencia justificada", "success");

      if (empleado) await cargarCapacitaciones(empleado.idempleado);
    } catch (error) {
      console.error(error.response?.data || error);
      showToast("Error al actualizar asistencia", "error");
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
              padding: "48px 20px 8rem"
            }}
          >
            <div style={{ width: "min(1100px, 96vw)" }}>
              <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#023047" }}>
                Perfil de {empleado ? empleado.nombre : "Cargando..."}
              </h2>

              {empleado && (
                <>
                  <InfoPersonal empleado={empleado} formatFecha={formatFecha} />
                  <CapacitacionesSection
                    capacitacionesInfo={capacitacionesInfo}
                    formatFecha={formatFecha}
                    setCapacitacionSeleccionada={setCapacitacionSeleccionada}
                    setShowAsistenciaModal={setShowAsistenciaModal}
                  />
                </>
              )}
            </div>
          </main>
          <Footer />
          <ScrollToTop />
        </div>

        <AsistenciaModal
          show={showAsistenciaModal}
          onClose={() => setShowAsistenciaModal(false)}
          capacitacion={capacitacionSeleccionada}
          onGuardar={actualizarCapacitacion}
        />
      </div>
    </Layout>
  );
};

export default PerfilContainer;