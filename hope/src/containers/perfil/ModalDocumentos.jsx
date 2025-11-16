import React from "react";
import axios from "axios";
import { X } from "lucide-react";
const API = process.env.REACT_APP_API_DOCS;

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
  zIndex: 1001,
  display: "flex",
  flexDirection: "column",
};

const buttonCerrar = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const botonDescargar = {
  color: "#fff",
  background: "#219ebc",
  padding: "6px 10px",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  transition: "0.2s",
};

const ModalDocumentos = ({ visible, onClose, documentos, induccionNombre }) => {
  if (!visible) return null;

  // 🔹 Descargar usando axios (seguro para PDF reales)
  const handleDownload = async (archivoUrl, nombreArchivo) => {
  try {
    if (!archivoUrl) {
      alert("Este documento no tiene un archivo asociado para descargar.");
      return;
    }

    const esAbsoluta = archivoUrl.startsWith("http");
    const urlCompleta = esAbsoluta
      ? archivoUrl
      : `${API}${archivoUrl}`;

    // Descargar archivo binario
    const response = await axios.get(urlCompleta, { responseType: "blob" });

    // Detectar tipo MIME real (si el backend lo envía)
    const mimeType =
      response.headers["content-type"] || "application/pdf";

    // Crear blob con tipo correcto
    const blob = new Blob([response.data], { type: mimeType });

    // Asegurar extensión correcta
    let extension = "";
    if (mimeType.includes("pdf")) extension = ".pdf";
    else if (mimeType.includes("image")) extension = ".jpg";
    else if (mimeType.includes("word")) extension = ".docx";
    else if (mimeType.includes("excel")) extension = ".xlsx";

    const nombreFinal = nombreArchivo
      ? nombreArchivo.endsWith(extension)
        ? nombreArchivo
        : nombreArchivo + extension
      : "documento" + extension;

    // Crear y disparar descarga
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = nombreFinal;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error al descargar:", error);
    alert("No se pudo descargar el documento. Verifica que exista en el servidor.");
  }
};


  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        {/* Encabezado con botón de cierre */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#219ebc",
              fontWeight: "600",
              fontSize: "20px",
            }}
          >
            {induccionNombre
              ? `Documentos de ${induccionNombre}`
              : "Documentos asignados"}
          </h3>
          <button onClick={onClose} style={buttonCerrar} title="Cerrar">
            <X size={24} color="#555" />
          </button>
        </div>

        {/* Contenido del modal */}
        {documentos.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center" }}>
            No hay documentos asignados.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {documentos.map((doc) => (
              <li
                key={doc.iddocumento}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "8px",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontWeight: "500",
                    color: "#023047",
                    fontSize: "15px",
                    flex: 1,
                  }}
                >
                  {doc.nombrearchivo || "Documento sin nombre"}
                </span>

                <button
                  onClick={() =>
                    handleDownload(doc.archivo_url || doc.archivo, doc.nombrearchivo)
                  }
                  style={botonDescargar}
                >
                  Descargar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ModalDocumentos;
