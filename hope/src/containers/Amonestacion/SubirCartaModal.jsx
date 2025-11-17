import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const SubirCartaModal = ({ amonestacion, onClose, onActualizado }) => {
  const [archivo, setArchivo] = useState(null);
  const [documentoExistente, setDocumentoExistente] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  // 🔹 Cargar documento existente si la amonestación tiene idDocumento > 0
  useEffect(() => {
  const idDoc = amonestacion?.idDocumento || amonestacion?.iddocumento;
  if (idDoc && idDoc > 0) {
    fetchDocumento(idDoc);
  } else {
    setDocumentoExistente(null);
  }
}, [amonestacion?.idDocumento, amonestacion?.iddocumento]);


  const fetchDocumento = async (idDocumento) => {
    try {
      const res = await axios.get(`${API}/documentos/${idDocumento}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentoExistente(res.data);
    } catch (error) {
      setDocumentoExistente(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Solo se permiten archivos PDF", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("El archivo no puede superar los 5MB", "error");
      return;
    }

    setArchivo(file);
  };

  const subirCarta = async () => {
  if (!archivo) return;
  setSubiendo(true);

  try {
    const idUsuario = localStorage.getItem("idUsuario") || 1;
    const idEmpleado = amonestacion?.idempleado;
    const idTipoDocumento = 4;

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombrearchivo", archivo.name);
    formData.append("mimearchivo", archivo.name.split(".").pop());
    formData.append("fechasubida", new Date().toISOString().split("T")[0]);
    formData.append("estado", true);
    formData.append("idusuario", idUsuario);
    formData.append("idtipodocumento", idTipoDocumento);
    formData.append("idempleado", idEmpleado);

    // Crear documento
    const resDoc = await axios.post(`${API}/documentos/`, formData, {
      headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
    });
    const idDocumento = resDoc.data.idDocumento || resDoc.data.iddocumento;

    // Actualizar amonestación con ese documento
    await axios.put(`${API}/amonestaciones/${amonestacion.idamonestacion}/`, {
      tipo: amonestacion.tipo,
      motivo: amonestacion.motivo,
      fechaamonestacion: amonestacion.fechaamonestacion,
      idusuario: idUsuario,
      iddocumento: idDocumento,
    },{
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔹 Refrescar documento actual automáticamente
    const resDocFinal = await axios.get(`${API}/documentos/${idDocumento}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    setDocumentoExistente(resDocFinal.data);

    showToast("Carta subida y actualizada correctamente", "success");
    onActualizado?.();
    onClose();

  } catch (error) {
    showToast("Error al subir o refrescar la carta", "error");
  } finally {
    setSubiendo(false);
  }
};


  // 🔹 Descargar carta (basado en la función descargarCV)
  const descargarCarta = async () => {
    try {
      const response = await axios.get(`${API}/documentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const documentos = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      const idDoc =
        amonestacion?.idDocumento || amonestacion?.iddocumento || null;
      const idEmpleado = amonestacion?.idEmpleado || amonestacion?.idempleado;

      const cartaDoc = documentos.find(
        (doc) =>
          (doc.iddocumento && doc.iddocumento === idDoc) ||
          (doc.idempleado && doc.idempleado === idEmpleado && doc.idtipodocumento === 4)
      );

      if (!cartaDoc) {
        showToast("No se encontró la carta de amonestación", "warning");
        return;
      }

      const fileUrl = cartaDoc.archivo_url || cartaDoc.archivo;

      if (fileUrl) {
        try {
          const res = await fetch(fileUrl);
          if (!res.ok) throw new Error("Error al obtener el archivo");

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = cartaDoc.nombrearchivo || "Carta_Amonestacion.pdf";
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => window.URL.revokeObjectURL(url), 200);
        } catch (err) {
          window.open(fileUrl, "_blank");
          showToast("Se abrió la carta en una nueva pestaña", "info");
        }
      } else {
        // Fallback: descarga por endpoint del backend
        const fileResponse = await axios.get(
          `${API}/documentos/${cartaDoc.iddocumento}/archivo/`,
          { responseType: "blob", headers: {
            Authorization: `Bearer ${token}`,
          }, }
        );
        const blob = new Blob([fileResponse.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = cartaDoc.nombrearchivo || "Carta_Amonestacion.pdf";
        link.click();
        window.URL.revokeObjectURL(url);
      }

      showToast("Carta descargada correctamente", "success");
    } catch (error) {
      if (error.response?.status === 404) {
        showToast("No se encontró la carta de amonestación", "warning");
      } else {
        showToast("Error al descargar la carta", "error");
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 4000,
      }}
    >
      <div
        style={{
          width: "min(500px, 90vw)",
          background: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          padding: 28,
          borderRadius: 16,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 15,
            right: 20,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "#666",
          }}
        >
          ✕
        </button>

        <h3 style={{ marginBottom: 20, fontSize: 22, fontWeight: 700 }}>
          Subir Carta - {amonestacion.nombreEmpleado}
        </h3>

        {documentoExistente && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: "#198754",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                PDF
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {documentoExistente.nombrearchivo || "Carta Actual"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Subido el{" "}
                  {new Date(documentoExistente.fechasubida).toLocaleDateString()}
                </div>
              </div>
            </div>

            <button
              onClick={descargarCarta}
              style={{
                background: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: 4,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Descargar
            </button>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            {documentoExistente
              ? "Nueva Carta (reemplazará la actual)"
              : "Carta de amonestación"}
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <small
            style={{
              color: "#666",
              fontSize: 13,
              marginTop: 4,
              display: "block",
            }}
          >
            Solo archivos PDF, máximo 5MB
          </small>
        </div>

        {archivo && (
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: 6,
              color: "#155724",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ✓ Archivo seleccionado: {archivo.name}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              border: "1px solid #d1d5db",
              background: "#fff",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={subirCarta}
            disabled={!archivo || subiendo}
            style={{
              padding: "12px 20px",
              border: "none",
              background: archivo ? "#dc2626" : "#ccc",
              color: "#fff",
              borderRadius: 8,
              cursor: archivo ? "pointer" : "not-allowed",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {subiendo
              ? "Subiendo..."
              : documentoExistente
              ? "Actualizar Carta"
              : "Subir Carta"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubirCartaModal;
