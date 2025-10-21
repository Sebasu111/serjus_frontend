import React from "react";
import { X } from "lucide-react";

const ModalEmpleadosAsignados = ({ visible, onClose, empleados, evento, loading }) => {
  if (!visible) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px 30px",
          borderRadius: "10px",
          width: "600px",
          maxHeight: "75vh",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          position: "relative", // ✅ necesario para posicionar la X dentro del modal
        }}
      >
        {/* Botón de cerrar (X) */}
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

        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Empleados asignados</h3>
        <p style={{ textAlign: "center", fontWeight: "500", color: "#333", marginBottom: "15px" }}>
          {evento?.nombreevento}
        </p>

        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Cargando...</p>
        ) : empleados.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={thStyle}>Empleado</th>
                <th style={thStyle}>Asistencia</th>
                <th style={thStyle}>Observación</th>
                <th style={thStyle}>Fecha envío</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>
                    {emp.nombre} {emp.apellido}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      fontWeight: "600",
                      color:
                        emp.asistencia?.toLowerCase() === "sí" ||
                        emp.asistencia?.toLowerCase() === "si"
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {emp.asistencia || "No"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "left" }}>{emp.observacion || "-"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {formatDate(emp.fechaenvio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#777", marginTop: "15px" }}>
            No hay empleados asignados.
          </p>
        )}
      </div>
    </div>
  );
};

// Estilos comunes de celdas
const thStyle = {
  textAlign: "center",
  padding: "8px",
  borderBottom: "2px solid #e5e7eb",
  fontWeight: "600",
  fontSize: "14px",
  color: "#374151",
};

const tdStyle = {
  textAlign: "center",
  padding: "8px",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "14px",
  color: "#374151",
};

export default ModalEmpleadosAsignados;
