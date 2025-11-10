import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, ArrowLeft } from "lucide-react";
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

const AsistenciaModal = ({ show, onClose, capacitacion, onGuardar, modoInicial = null }) => {
  const [archivo, setArchivo] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [modo, setModo] = useState(modoInicial); // "asistio" | "justifico" | null

  useEffect(() => {
    setModo(modoInicial || null);
  }, [modoInicial, show]);

  if (!show || !capacitacion) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  const subirDocumento = async () => {
    if (!archivo) {
      showToast("Debe adjuntar un archivo PDF", "warning");
      return null;
    }
    if (archivo.type !== "application/pdf") {
      showToast("Solo se permiten archivos PDF", "warning");
      return null;
    }

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

    return resDoc.data.iddocumento;
  };

  const handleGuardar = async (asistio) => {
    setSubiendo(true);
    try {
      const idDocumento = await subirDocumento();
      if (!idDocumento) {
        setSubiendo(false);
        return;
      }

      const mensaje = asistio
        ? "Asistió y subió archivo"
        : observacion || "Inasistencia justificada";

      await onGuardar(
        capacitacion.idempleadocapacitacion,
        asistio,
        mensaje,
        idDocumento
      );

      showToast(
        asistio
          ? "Asistencia registrada correctamente"
          : "Inasistencia justificada correctamente",
        "success"
      );
      onClose();
    } catch (error) {
      console.error(error.response?.data || error);
      showToast("Error al registrar asistencia o subir archivo", "error");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Botones de cerrar / regresar */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {modo && (
            <button
              onClick={() => setModo(null)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              title="Regresar"
            >
              <ArrowLeft size={22} color="#555" />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            title="Cerrar"
          >
            <X size={24} color="#555" />
          </button>
        </div>

        <h3
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: modo === "justifico" ? "#FCA5A5" : "#219ebc",
          }}
        >
          {modo === "justifico"
            ? "Justificar inasistencia"
            : modo === "asistio"
              ? "Confirmar asistencia"
              : "Registro de asistencia"}
        </h3>

        {/* Cuadro de información de la capacitación */}
        <div style={{
          backgroundColor: modo === "justifico" ? "#fee2e2" : "#dbeafe",
          border: `2px solid ${modo === "justifico" ? "#fca5a5" : "#60a5fa"}`,
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "12px 20px",
            fontSize: "14px"
          }}>
            <div style={{ fontWeight: "600", color: "#374151" }}>Capacitación:</div>
            <div style={{ color: "#1f2937" }}>{capacitacion.nombre}</div>

            <div style={{ fontWeight: "600", color: "#374151" }}>Lugar:</div>
            <div style={{ color: "#1f2937" }}>{capacitacion.lugar}</div>

            <div style={{ fontWeight: "600", color: "#374151" }}>Inicio:</div>
            <div style={{ color: "#1f2937" }}>{formatearFecha(capacitacion.fechaInicio)}</div>

            <div style={{ fontWeight: "600", color: "#374151" }}>Fin:</div>
            <div style={{ color: "#1f2937" }}>{formatearFecha(capacitacion.fechaFin)}</div>

            <div style={{ fontWeight: "600", color: "#374151" }}>Observaciones:</div>
            <div style={{ color: "#1f2937" }}>{capacitacion.observacion || "Sin observaciones"}</div>
          </div>
        </div>

        {/* Selección de modo */}
        {!modo && (
          <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
            <button
              onClick={() => setModo("asistio")}
              style={{
                ...buttonStyle,
                background: "#2563eb",
                boxShadow: "0 4px 6px rgba(37, 99, 235, 0.3)",
                border: "2px solid #2563eb"
              }}
            >
              Asistió
            </button>

            <button
              onClick={() => setModo("justifico")}
              style={{
                ...buttonStyle,
                background: "#dc2626",
                boxShadow: "0 4px 6px rgba(220, 38, 38, 0.3)",
                border: "2px solid #dc2626"
              }}
            >
              Justificar
            </button>
          </div>
        )}

        {/* Modo Asistió */}
        {modo === "asistio" && (
          <div style={{
            backgroundColor: "#dbeafe",
            border: "2px solid #60a5fa",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "15px"
          }}>
            <h4 style={{
              margin: "0 0 15px 0",
              color: "#1e40af",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Confirmar Asistencia
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar(true);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label htmlFor="archivoAsistencia" style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  Adjuntar informe en PDF:
                </label>
                <input
                  id="archivoAsistencia"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #93c5fd",
                    backgroundColor: "#ffffff",
                    fontSize: "14px"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={subiendo}
                style={{
                  ...buttonStyle,
                  background: subiendo ? "#9ca3af" : "#2563eb",
                  cursor: subiendo ? "not-allowed" : "pointer",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: subiendo ? "none" : "0 4px 6px rgba(37, 99, 235, 0.3)"
                }}
              >
                {subiendo ? "Subiendo..." : "Confirmar asistencia"}
              </button>
            </form>
          </div>
        )}

        {/* Modo Justificar */}
        {modo === "justifico" && (
          <div style={{
            backgroundColor: "#fee2e2",
            border: "2px solid #fca5a5",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "15px"
          }}>
            <h4 style={{
              margin: "0 0 15px 0",
              color: "#dc2626",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              Justificar Inasistencia
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGuardar(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label htmlFor="archivoJustificacion" style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  Adjuntar documento justificativo (PDF):
                </label>
                <input
                  id="archivoJustificacion"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #fca5a5",
                    backgroundColor: "#ffffff",
                    fontSize: "14px"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={subiendo}
                style={{
                  ...buttonStyle,
                  background: subiendo ? "#9ca3af" : "#dc2626",
                  cursor: subiendo ? "not-allowed" : "pointer",
                  padding: "12px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: subiendo ? "none" : "0 4px 6px rgba(220, 38, 38, 0.3)"
                }}
              >
                {subiendo ? "Subiendo..." : "Confirmar justificación"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsistenciaModal;
