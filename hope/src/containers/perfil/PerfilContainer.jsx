import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../utils/toast.js";
import AsistenciaModal from "../../components/confirmarasistencia/AsistenciaModal.jsx";
import CapacitacionesSection from "./CapacitacionesSection.jsx";
import InfoPersonal from "./InfoPersonal.jsx";

const PerfilContainer = () => {
  const [usuario, setUsuario] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const [capacitacionesInfo, setCapacitacionesInfo] = useState([]);
  const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);
  const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const idUsuario = Number(sessionStorage.getItem("idUsuario"));
        if (!idUsuario) return;

        const resUsuarios = await axios.get("http://127.0.0.1:8000/api/usuarios/");
        const usuarioActual = resUsuarios.data.results.find(u => u.idusuario === idUsuario);
        setUsuario(usuarioActual);
        if (!usuarioActual) {
          showToast("Usuario no encontrado", "error");
          return;
        }

        const resEmpleados = await axios.get("http://127.0.0.1:8000/api/empleados/");
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

  const cargarCapacitaciones = async (idEmpleado) => {
    const resCap = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
    const capsEmpleado = resCap.data.results.filter(c => c.idempleado === idEmpleado);

    const resCapsInfo = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
    const info = capsEmpleado.map(c => {
      const cap = resCapsInfo.data.results.find(ci => ci.idcapacitacion === c.idcapacitacion);
      return {
        ...c,
        nombre: cap?.nombreevento || "N/A",
        lugar: cap?.lugar || "N/A",
        fecha: cap?.fecha || c.fechaenvio
      };
    });

    setCapacitacionesInfo(info);
  };

  const formatFecha = (fecha) => {
    const d = new Date(fecha);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const actualizarCapacitacion = async (id, asistenciaBool, observacion = "") => {
    try {
      const cap = capacitacionesInfo.find(c => c.idempleadocapacitacion === id);
      if (!cap) return;

      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const payload = {
        idempleado: cap.idempleado,
        idcapacitacion: cap.idcapacitacion,
        asistencia: asistenciaBool ? "Sí" : "No",
        observacion: asistenciaBool ? "Asistió" : observacion || "Inasistencia Justificada",
        fechaenvio: cap.fechaenvio || new Date().toISOString().split("T")[0],
        estado: true,
        idusuario: idUsuario
      };

      await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${id}/`, payload);
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
      <Header />

      <div style={{ background: "#f0f2f5", padding: "30px 0", minHeight: "80vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", paddingLeft: "250px" }}>
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
      </div>

      <AsistenciaModal
        show={showAsistenciaModal}
        onClose={() => setShowAsistenciaModal(false)}
        capacitacion={capacitacionSeleccionada}
        onGuardar={actualizarCapacitacion}
      />

      <Footer />
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={5000} />
    </Layout>
  );
};

export default PerfilContainer;
