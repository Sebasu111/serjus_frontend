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
  background: "#fff",
  borderRadius: "12px",
  padding: "30px 25px",
  width: "450px",
  maxWidth: "95%",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  position: "relative",
  animation: "fadeIn 0.3s ease",
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

  const handleGuardarAsistencia = async (e) => {
    e.preventDefault();

    if (!archivo) {
      // Mostrar tooltip de validación nativa
      const fileInput = document.getElementById("archivoInput");
      fileInput.reportValidity();
      return;
    }

    setSubiendo(true);
    try {
      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const formData = new FormData();
      formData.append("archivo", archivo);
      formData.append("nombrearchivo", archivo.name);
      formData.append("mimearchivo", archivo.name.split(".").pop().toLowerCase());
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

      showToast("Asistencia registrada con documento", "success");
      onClose();
    } catch (error) {
      console.error("Error al subir archivo o registrar asistencia:", error.response?.data || error);
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
          <p><strong>Fecha inicio:</strong> {new Date(capacitacion.fechainicio || capacitacion.fecha).toLocaleDateString()}</p>
          <p><strong>Fecha fin:</strong> {new Date(capacitacion.fechafin || capacitacion.fecha).toLocaleDateString()}</p>
          <p><strong>Observaciones:</strong> {capacitacion.observacion || "Sin observaciones"}</p>
        </div>

        {!mostrarInputArchivo ? (
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button
              onClick={() => setMostrarInputArchivo(true)}
              style={{ ...buttonStyle, background: "#34D399" }}
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
            style={{
              marginTop: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <input
              id="archivoInput"
              type="file"
              required
              onChange={(e) => setArchivo(e.target.files[0])}
              style={{ border: "1px solid #ccc", borderRadius: "6px", padding: "6px" }}
            />
            <button
              type="submit"
              disabled={subiendo}
              style={{
                ...buttonStyle,
                background: subiendo ? "#ccc" : "#34D399",
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
