// containers/perfil/PerfilContainer.jsx
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

        // Cargar capacitaciones
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
          observacion: asistenciaBool ? "Asistió" : observacion || "Justificada",
          fechaenvio: cap.fechaenvio || new Date().toISOString().split("T")[0],
          estado: true,
          idusuario: idUsuario
        };

        await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${id}/`, payload);

        showToast(asistenciaBool ? "Asistencia registrada" : "Inasistencia justificada", "success");

        if (empleado) {
          await cargarCapacitaciones(empleado.idempleado);
        }
    } catch (error) {
        console.error(error.response?.data || error);
        showToast("Error al actualizar asistencia", "error");
    }
  };

  const marcarAsistencia = (id) => actualizarCapacitacion(id, true, "");
  const justificarInasistencia = (id) => {
    const razon = prompt("Ingrese la razón de la inasistencia:");
    if (razon !== null && razon.trim() !== "") {
      actualizarCapacitacion(id, false, razon);
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
              {/* Información personal */}
              <div style={{ marginBottom: "35px", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h4 style={{ marginBottom: "20px", color: "#219ebc", fontWeight: "600" }}>Información personal</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                  <tbody>
                    {[["Nombre", `${empleado.nombre} ${empleado.apellido}`],
                      ["Email", empleado.email],
                      ["Teléfono", empleado.telefonocelular || "No registrado"],
                      ["Dirección", empleado.direccion],
                      ["Fecha de nacimiento", formatFecha(empleado.fechanacimiento)],
                      ["Género", empleado.genero]
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ padding: "12px", fontWeight: "600", width: "220px", color: "#555" }}>{label}:</td>
                        <td style={{ padding: "12px" }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Capacitaciones */}
              <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <h4 style={{ marginBottom: "20px", color: "#219ebc", fontWeight: "600" }}>Capacitaciones asignadas</h4>
                {capacitacionesInfo.length === 0 ? (
                  <p style={{ fontSize: "16px", margin: 0 }}>No hay capacitaciones asignadas.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        {["Capacitación", "Lugar", "Fecha", "Observación", "Asistencia"].map(h => (
                          <th key={h} style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {capacitacionesInfo.map(c => {
                        const asistenciaRegistrada = c.asistencia === "Sí";

                        return (
                          <tr key={c.idempleadocapacitacion} style={{ borderBottom: "1px solid #eee", height: "60px" }}>
                            <td style={{ padding: "14px" }}>{c.nombre}</td>
                            <td style={{ padding: "14px" }}>{c.lugar}</td>
                            <td style={{ padding: "14px" }}>{formatFecha(c.fecha)}</td>
                            <td style={{ padding: "14px" }}>{c.observacion || "-"}</td>
                            <td style={{ padding: "14px" }}>
                              <button
                                onClick={() => { setCapacitacionSeleccionada(c); setShowAsistenciaModal(true); }}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: asistenciaRegistrada ? "#ff9500ff" : "#219ebc",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontWeight: "600",
                                  cursor: asistenciaRegistrada ? "not-allowed" : "pointer",
                                  width: "100%",
                                  transition: "0.2s"
                                }}
                                disabled={asistenciaRegistrada}
                              >
                                Marcar asistencia / inasistencia
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
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
