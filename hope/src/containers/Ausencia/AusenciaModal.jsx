import React from "react";

const AusenciaModal = ({ visible, onClose, ausencia, loading, offsetRight = 170 }) => {
  if (!visible || !ausencia) return null;

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
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 4000,
        paddingRight: `${offsetRight}px`,
      }}
    >
      <div
        style={{
          width: "min(1100px,95vw)",
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
          Detalle de la Ausencia
        </h3>

        {/* Información de la ausencia */}
        <Section title="Información de la Ausencia">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            <div style={infoBoxStyle}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Colaborador
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {ausencia.empleado ? `${ausencia.empleado.nombre} ${ausencia.empleado.apellido}` : "-"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Tipo de Ausencia
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ausencia.tipo || "-"}</div>
            </div>

            {(ausencia.tipo === "Enfermedad" || ausencia.tipo === "Examen") && (
              <div style={infoBoxStyle}>
                <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                  IGSS / Otro
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {ausencia.es_iggs ? "IGSS" : ausencia.otro || "-"}
                </div>
              </div>
            )}

            <div style={infoBoxStyle}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Diagnóstico
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ausencia.diagnostico || "-"}</div>
            </div>

            <div style={infoBoxStyle}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Fechas
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {`${formatDate(ausencia.fechainicio)} a ${formatDate(ausencia.fechafin)}`}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Cantidad de días
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{ausencia.cantidad_dias || "-"}</div>
            </div>

            <div style={{ gridColumn: "1 / -1", ...infoBoxStyle }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Comprobante de Ausencia
              </div>
              {ausencia.documento ? (
                <a
                  href={ausencia.documento.archivo_url}
                  download={ausencia.documento.nombrearchivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 500 }}
                >
                  {ausencia.documento.nombrearchivo}
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

export default AusenciaModal;
