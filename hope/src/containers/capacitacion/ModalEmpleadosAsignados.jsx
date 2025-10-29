import React from "react";

const ModalEmpleadosAsignados = ({ visible, onClose, empleados, evento, loading, offsetRight = 170 }) => {
  if (!visible || !evento) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
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
          letterSpacing: 0.2
        }}
      >
        {title}
      </h4>
      {children}
    </section>
  );

  const thStyle = {
    textAlign: "center",
    padding: "10px",
    borderBottom: "2px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151"
  };

  const tdStyle = {
    textAlign: "center",
    padding: "10px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151"
  };

  // Aquí usamos el valor correcto: primero revisamos observacionescapacitacion,
  // si no existe, usamos observacion (lo que manda el form)
  const observaciones = evento.observacionescapacitacion || evento.observacion || "-";

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
        paddingRight: `${offsetRight}px`
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
          position: "relative"
        }}
      >
        {/* Botón de cerrar sticky */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
            position: "sticky",
            top: 0,
            zIndex: 10
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
              boxShadow: "0 1px 6px rgba(0,0,0,.06)"
            }}
          >
            ✕
          </button>
        </div>

        <h3 style={{ marginBottom: 12, fontSize: 28, textAlign: "center" }}>{evento.nombreevento}</h3>

        {/* Sección info evento */}
        <Section title="Información del Evento">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 6 }}>Lugar</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{evento.lugar}</div>
            </div>
            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 6 }}>Fechas</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {`${formatDate(evento.fechainicio)} a ${formatDate(evento.fechafin)}`}
              </div>
            </div>
            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 6 }}>Institución</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{evento.institucionfacilitadora}</div>
            </div>
            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 6 }}>Monto</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{evento.montoejecutado || 0}</div>
            </div>

            {/* Observaciones de la capacitación */}
            <div style={{ gridColumn: "1 / -1", background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: 0.4, color: "#6b7280", marginBottom: 6 }}>Observaciones de la capacitación</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                {observaciones}
              </div>
            </div>

          </div>
        </Section>

        {/* Sección empleados con tabla */}
        <Section title="Empleados Asignados">
          {loading ? (
            <div style={{ textAlign: "center", color: "#666" }}>Cargando...</div>
          ) : empleados.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                borderRadius: 12,
                padding: 14,
                color: "#6b7280",
                textAlign: "center"
              }}
            >
              No hay empleados asignados.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  tableLayout: "fixed"
                }}
              >
                <colgroup>
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "25%" }} />
                  <col style={{ width: "25%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={thStyle}>Empleado</th>
                    <th style={thStyle}>Asistencia</th>
                    <th style={thStyle}>Fecha envío</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map((emp, idx) => (
                    <tr key={idx} style={{ cursor: "default" }}>
                      <td style={tdStyle}>{emp.nombre} {emp.apellido}</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: "600",
                          color: emp.asistencia?.toLowerCase() === "sí" || emp.asistencia?.toLowerCase() === "si" ? "#16a34a" : "#dc2626"
                        }}
                      >
                        {emp.asistencia || "No"}
                      </td>
                      <td style={tdStyle}>{formatDate(emp.fechaenvio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default ModalEmpleadosAsignados;
