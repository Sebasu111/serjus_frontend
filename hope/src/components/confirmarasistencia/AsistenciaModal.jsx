// components/AsistenciaModal.jsx
import React, { useState } from "react";
import DocumentosForm from "../../containers/documentos/DocumentosForm"; // ajusta la ruta si es necesario

const AsistenciaModal = ({
  show,
  onClose,
  capacitacion,
  onGuardar,
  tiposDocumento = [],
  empleados = []
}) => {
  const [observacion, setObservacion] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState({
    nombrearchivo: "",
    idtipodocumento: "",
    idempleado: capacitacion?.idempleado || "",
    archivo: null,
    fechasubida: new Date().toISOString().split("T")[0]
  });

  if (!show) return null;

  const handleAsistio = () => {
    onGuardar(capacitacion.idempleadocapacitacion, true, "");
    onClose();
  };

  const handleJustificar = (e) => {
    e.preventDefault();
    if (!form.nombrearchivo || !form.idtipodocumento || !form.idempleado || !form.fechasubida) {
      alert("Debe completar todos los campos y subir el comprobante para justificar la inasistencia");
      return;
    }

    // Aquí se puede enviar primero el documento al backend y luego registrar la inasistencia
    // Por simplicidad llamamos a onGuardar con la observación
    onGuardar(capacitacion.idempleadocapacitacion, false, observacion || "Justificada");
    onClose();
  };

  return (
    <div style={{
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
      flexDirection: "column"
    }}>
      <h3 style={{ textAlign: "center", marginBottom: "15px", color: "#219ebc" }}>
        Asistencia: {capacitacion.nombre}
      </h3>
      <p><strong>Lugar:</strong> {capacitacion.lugar}</p>
      <p><strong>Fecha:</strong> {new Date(capacitacion.fecha).toLocaleDateString()}</p>

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
                cursor: "pointer"
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
                cursor: "pointer"
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
            marginTop: "15px",
            padding: "10px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Cerrar
        </button>
      )}
    </div>
  );
};

export default AsistenciaModal;
