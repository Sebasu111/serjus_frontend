// components/AsistenciaModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import DocumentosForm from "../../containers/documentos/DocumentosForm";
import { showToast } from "../../utils/toast"; // si ya tienes tu función de notificaciones
import { X } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const AsistenciaModal = ({
  show,
  onClose,
  capacitacion,
  onGuardar,
}) => {
  const [observacion, setObservacion] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    nombrearchivo: "",
    idtipodocumento: "",
    idempleado: capacitacion?.idempleado || "",
    archivo: null,
    fechasubida: new Date().toISOString().split("T")[0],
  });

  //   Fetch tipos de documento
  const fetchTiposDocumento = async () => {
    try {
      const r = await axios.get(`${API}/tipodocumento/`);
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.data?.results)
        ? r.data.results
        : [];
      setTiposDocumento(data);
    } catch (error) {
      console.error("Error al cargar tipos de documento:", error);
      showToast("Error al cargar tipos de documento", "error");
      setTiposDocumento([]);
    }
  };

  //   Fetch empleados
  const fetchEmpleados = async () => {
    try {
      const r = await axios.get(`${API}/empleados/`);
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.data?.results)
        ? r.data.results
        : [];
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      showToast("Error al cargar empleados", "error");
      setEmpleados([]);
    }
  };

  //   Ejecutamos los fetch solo cuando se abre el modal
  useEffect(() => {
    if (show) {
      fetchTiposDocumento();
      fetchEmpleados();
    }
  }, [show]);

  //   Asistencia confirmada
  const handleAsistio = () => {
    onGuardar(capacitacion.idempleadocapacitacion, true, "");
    onClose();
  };

  //   Justificar inasistencia
  const handleJustificar = (e) => {
    e.preventDefault();
    if (
      !form.nombrearchivo ||
      !form.idtipodocumento ||
      !form.idempleado ||
      !form.fechasubida
    ) {
      alert(
        "Debe completar todos los campos y subir el comprobante para justificar la inasistencia"
      );
      return;
    }

    onGuardar(
      capacitacion.idempleadocapacitacion,
      false,
      observacion || "Justificada"
    );
    onClose();
  };

  // Si el modal está cerrado, no renderizamos nada
  if (!show) return null;

  //   Renderizado principal
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "450px",
        maxWidth: "95%",
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          marginBottom: "15px",
          color: "#219ebc",
        }}
      >
        Asistencia: {capacitacion.nombre}
      </h3>
      <p>
        <strong>Lugar:</strong> {capacitacion.lugar}
      </p>
      <p>
        <strong>Fecha:</strong>{" "}
        {new Date(capacitacion.fecha).toLocaleDateString()}
      </p>

      {!mostrarFormulario ? (
        <>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              onClick={handleAsistio}
              style={{
                flex: 1,
                padding: "10px",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✓ Asistió
            </button>
            <button
              onClick={() => setMostrarFormulario(true)}
              style={{
                flex: 1,
                padding: "10px",
                background: "#ff6b6b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✗ Justificar
            </button>
          </div>
        </>
      ) : (
        <DocumentosForm
          form={form}
          setForm={setForm}
          tiposDocumento={tiposDocumento}
          empleados={empleados}
          onChange={(e) => {
            const { name, value, files } = e.target;
            setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
          }}
          handleSubmit={handleJustificar}
          editingId={null}
          setMostrarFormulario={setMostrarFormulario}
        />
      )}

      {!mostrarFormulario && (
        <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "15px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
      )}
    </div>
  );
};

export default AsistenciaModal;
