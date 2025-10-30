import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast";

const API = "http://127.0.0.1:8000/api";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "500px",
  maxWidth: "95%",
  background: "#fff",
  padding: "30px",
  boxShadow: "0 0 20px rgba(0,0,0,0.2)",
  borderRadius: "12px",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
};

const buttonStyle = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  cursor: "pointer",
  color: "#fff",
  transition: "0.2s",
};

const AsistenciaModal = ({ show, onClose, capacitacion, onGuardar }) => {
  const [archivo, setArchivo] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarInputArchivo, setMostrarInputArchivo] = useState(false);

  if (!show || !capacitacion) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleGuardarAsistencia = async (e) => {
    e.preventDefault();
    if (!archivo) {
      document.getElementById("archivoInput").reportValidity();
      return;
    }
    if (archivo.type !== "application/pdf") {
      showToast("Solo se permiten archivos PDF", "warning");
      return;
    }
    setSubiendo(true);
    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("nombrearchivo", archivo.name);
      formData.append("mimearchivo", "pdf");
      formData.append("fechasubida", new Date().toISOString().slice(0, 10));
      formData.append("idusuario", idUsuario);
      formData.append("idtipodocumento", 2);
      formData.append("idempleado", capacitacion.idempleado);

      const resDoc = await axios.post(`${API}/documentos/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const idDocumento = resDoc.data.iddocumento;

      await onGuardar(
        capacitacion.idempleadocapacitacion,
        true,
        "Asistió y subió archivo",
        idDocumento
      );

      showToast("Asistencia registrada y documento PDF guardado", "success");
      onClose();
    } catch (error) {
      console.error(error.response?.data || error);
      showToast("Error al subir archivo o registrar asistencia", "error");
    } finally {
      setSubiendo(false);
    }
  };

  const handleJustificar = async () => {
    await onGuardar(
      capacitacion.idempleadocapacitacion,
      false,
      observacion || "Inasistencia justificada",
      null
    );
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
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

        <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#219ebc" }}>
          Confirmar asistencia
        </h3>

        <div style={{ marginBottom: "15px" }}>
          <p><strong>Capacitación:</strong> {capacitacion.nombre}</p>
          <p><strong>Lugar:</strong> {capacitacion.lugar}</p>
          <p><strong>Observaciones:</strong> {capacitacion.observacion || "Sin observaciones"}</p>

          <div style={{ display: "flex", gap: "15px" }}>
            <span><strong>Inicio:</strong> {formatearFecha(capacitacion.fechaInicio)}</span>
            <span><strong>Fin:</strong> {formatearFecha(capacitacion.fechaFin)}</span>
          </div>
        </div>

        {!mostrarInputArchivo ? (
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              onClick={() => setMostrarInputArchivo(true)}
              style={{ ...buttonStyle, background: "#219ebc" }}
            >
              Asistió
            </button>

            <button
              onClick={handleJustificar}
              style={{ ...buttonStyle, background: "#FCA5A5" }}
            >
              Justificar
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleGuardarAsistencia}
            style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <label htmlFor="archivoInput" style={{ fontWeight: "500" }}>
              Adjuntar informe en PDF:
            </label>
            <input
              id="archivoInput"
              type="file"
              required
              accept="application/pdf"
              onChange={(e) => setArchivo(e.target.files[0])}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              disabled={subiendo}
              style={{
                ...buttonStyle,
                background: subiendo ? "#ccc" : "#219ebc",
                cursor: subiendo ? "not-allowed" : "pointer",
              }}
            >
              {subiendo ? "Subiendo..." : "Confirmar asistencia"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AsistenciaModal;
