import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import AmonestacionForm from "./AmonestacionForm.jsx";
import AmonestacionTable from "./AmonestacionTable.jsx";

const AmonestacionContainer = () => {
  const [idEmpleado, setIdEmpleado] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaAmonestacion, setFechaAmonestacion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [idDocumento, setIdDocumento] = useState("");
  const [estadoActivo, setEstadoActivo] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [amonestaciones, setAmonestaciones] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAmonestaciones();
  }, []);

  const fetchAmonestaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/amonestaciones/");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAmonestaciones(data);
    } catch (error) {
      console.error("Error al cargar amonestaciones:", error);
      setAmonestaciones([]);
      setMensaje("Error al cargar las amonestaciones");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        idempleado: idEmpleado || null,
        tipo,
        fechaamonestacion: fechaAmonestacion,
        motivo,
        iddocumento: idDocumento,
        estado: estadoActivo,
        idusuario: 1,
      };

      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/amonestaciones/${editingId}/`,
          data
        );
        setMensaje("Amonestación actualizada correctamente");
      } else {
        await axios.post("http://127.0.0.1:8000/api/amonestaciones/", data);
        setMensaje("Amonestación registrada correctamente");
      }

      setIdEmpleado("");
      setTipo("");
      setFechaAmonestacion("");
      setMotivo("");
      setIdDocumento("");
      setEstadoActivo(true);
      setEditingId(null);
      setShowForm(false);

      fetchAmonestaciones();
    } catch (error) {
      console.error("Error al guardar amonestación:", error.response?.data || error);
      setMensaje("Error al registrar la amonestación");
    }
  };

  const handleEdit = (amon) => {
    setIdEmpleado(amon.idempleado || "");
    setTipo(amon.tipo);
    setFechaAmonestacion(amon.fechaamonestacion);
    setMotivo(amon.motivo);
    setIdDocumento(amon.iddocumento);
    setEstadoActivo(amon.estado);
    setEditingId(amon.idamonestacion);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de desactivar esta amonestación?")) return;
    try {
      const amon = amonestaciones.find((a) => a.idamonestacion === id);
      if (!amon) return;

      await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
        ...amon,
        estado: false,
      });

      setMensaje("Amonestación desactivada correctamente");
      fetchAmonestaciones();
    } catch (error) {
      console.error("Error al desactivar amonestación:", error.response?.data || error);
      setMensaje("Error al desactivar la amonestación");
    }
  };

  const handleActivate = async (id) => {
    try {
      const amon = amonestaciones.find((a) => a.idamonestacion === id);
      if (!amon) return;

      await axios.put(`http://127.0.0.1:8000/api/amonestaciones/${id}/`, {
        ...amon,
        estado: true,
      });

      setMensaje("Amonestación activada correctamente");
      fetchAmonestaciones();
    } catch (error) {
      console.error("Error al activar amonestación:", error.response?.data || error);
      setMensaje("Error al activar la amonestación");
    }
  };

  return (
    <Layout>
      <SEO title="Amonestaciones" />
      <div
        className="wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: "60px 20px",
            background: "#f0f2f5",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  background: "#219ebc",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#1b82a0")}
                onMouseOut={(e) => (e.target.style.background = "#219ebc")}
              >
                Registrar Amonestación
              </button>
            </div>

            {showForm && (
              <AmonestacionForm
                idEmpleado={idEmpleado}
                tipo={tipo}
                fechaAmonestacion={fechaAmonestacion}
                motivo={motivo}
                idDocumento={idDocumento}
                estadoActivo={estadoActivo}
                mensaje={mensaje}
                editingId={editingId}
                setIdEmpleado={setIdEmpleado}
                setTipo={setTipo}
                setFechaAmonestacion={setFechaAmonestacion}
                setMotivo={setMotivo}
                setIdDocumento={setIdDocumento}
                setEstadoActivo={setEstadoActivo}
                handleSubmit={handleSubmit}
                onClose={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              />
            )}

            <AmonestacionTable
              amonestaciones={amonestaciones}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleActivate={handleActivate}
            />
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default AmonestacionContainer;
