import React from "react";

const CapacitacionesSection = ({
    capacitacionesInfo,
    formatFecha,
    setCapacitacionSeleccionada,
    setShowAsistenciaModal
}) => {
    return (
        <div
            style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
        >
            <h4 style={{ marginBottom: "20px", color: "#219ebc", fontWeight: "600" }}>
                Capacitaciones asignadas
            </h4>

            {capacitacionesInfo.length === 0 ? (
                <p style={{ fontSize: "16px", margin: 0 }}>No hay capacitaciones asignadas.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                            <th style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa", width: "25%" }}>
                                Capacitación
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa", width: "15%" }}>
                                Lugar
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa", width: "20%" }}>
                                Fecha
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa", width: "25%" }}>
                                Observación
                            </th>
                            <th style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa", width: "15%" }}>
                                Asistencia
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {capacitacionesInfo.map(c => {
                            const asistenciaRegistrada =
  c.asistencia === "Sí" || c.asistencia === "No" || c.iddocumento != null;
                            return (
                                <tr
                                    key={c.idempleadocapacitacion}
                                    style={{ borderBottom: "1px solid #eee", height: "60px" }}
                                >
                                    <td style={{ padding: "14px" }}>{c.nombre}</td>
                                    <td style={{ padding: "14px" }}>{c.lugar}</td>
                                    <td style={{ padding: "14px" }}>
    <div style={{ display: "flex", flexDirection: "column" }}>
        <span>{formatFecha(c.fechaInicio)}</span>
        <span>{formatFecha(c.fechaFin)}</span>
    </div>
</td>

                                    <td style={{ padding: "14px" }}>{c.observacion || "-"}</td>
                                    <td style={{ padding: "14px", textAlign: "center" }}>
                                        <button
                                            onClick={() => {
                                                setCapacitacionSeleccionada(c);
                                                setShowAsistenciaModal(true);
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                background: asistenciaRegistrada ? "#E5E7EB" : "#219ebc",
                                                color: asistenciaRegistrada ? "#6B7280" : "#fff",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                cursor: asistenciaRegistrada ? "not-allowed" : "pointer",
                                                fontSize: "14px",
                                                transition: "0.2s"
                                            }}
                                            disabled={asistenciaRegistrada}
                                        >
                                            Asistencia / Justificación
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CapacitacionesSection;
