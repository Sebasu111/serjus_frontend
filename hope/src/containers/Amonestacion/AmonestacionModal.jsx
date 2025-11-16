import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

const AmonestacionModal = ({
  visible,
  onClose,
  amonestacion,
  empleado,
  loading = false,
}) => {
  const [documento, setDocumento] = useState(null);

  useEffect(() => {
    const fetchDatosActualizados = async () => {
      try {
        const resAmonestacion = await axios.get(
          `${API}/amonestaciones/${amonestacion.idamonestacion}/`
        );
        const amonestacionActualizada = resAmonestacion.data;

        const idDoc =
          amonestacionActualizada?.iddocumento ||
          amonestacionActualizada?.idDocumento;

        if (idDoc) {
          const resDoc = await axios.get(`${API}/documentos/${idDoc}/`);
          setDocumento(resDoc.data);
        } else {
          setDocumento(null);
        }
      } catch {
        setDocumento(null);
      }
    };

    if (visible && amonestacion?.idamonestacion) {
      fetchDatosActualizados();
    }
  }, [visible, amonestacion]);

  if (!visible || !amonestacion) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const partes = dateStr.split("-");
    if (partes.length !== 3) return dateStr;
    const [year, month, day] = partes;
    return `${day}-${month}-${year}`;
  };

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 24 }}>
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: 19,
          fontWeight: 800,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 6,
          color: "#0f172a",
          letterSpacing: 0.2,
        }}
      >
        {title}
      </h4>
      {children}
    </section>
  );

  const infoBoxStyle = {
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    borderRadius: 12,
    padding: 12,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center", // ✅ centrado horizontalmente
        alignItems: "center",
        zIndex: 4000,
        padding: "0 20px",
      }}
    >
      <div
        style={{
          width: "min(950px, 90vw)", // ✅ un poco más angosto que antes
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          padding: 28,
          borderRadius: 16,
          position: "relative",
        }}
      >
        {/* Botón cerrar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
              display: "grid",
              placeItems: "center",
              color: "#0f172a",
              boxShadow: "0 1px 6px rgba(0,0,0,.06)",
            }}
          >
            ✕
          </button>
        </div>

        <h3 style={{ marginBottom: 12, fontSize: 28, textAlign: "center" }}>
          Detalle de la Amonestación
        </h3>

        <Section title="Información de la Amonestación">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            <div style={infoBoxStyle}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Colaborador
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {empleado
                  ? `${empleado.nombre} ${empleado.apellido || ""}`
                  : "-"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Tipo de Amonestación
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {amonestacion.tipo || "-"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Fecha
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {formatDate(amonestacion.fechaamonestacion)}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1", ...infoBoxStyle }}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Motivo
              </div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {amonestacion.motivo || "-"}
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1", ...infoBoxStyle }}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Documento Relacionado
              </div>
              {documento && documento.archivo_url ? (
                <a
                  href={documento.archivo_url}
                  download={documento.nombrearchivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  {documento.nombrearchivo}
                </a>
              ) : (
                "-"
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default AmonestacionModal;
