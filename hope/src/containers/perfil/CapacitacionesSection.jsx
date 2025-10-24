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
            <h4 style={{ marginBottom: "20px", color: "#219ebc", fontWeight: "600" }}>Capacitaciones asignadas</h4>

            {capacitacionesInfo.length === 0 ? (
                <p style={{ fontSize: "16px", margin: 0 }}>No hay capacitaciones asignadas.</p>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                            {["Capacitación", "Lugar", "Fecha", "Observación", "Asistencia"].map(h => (
                                <th key={h} style={{ padding: "14px", fontWeight: "600", background: "#f8f9fa" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {capacitacionesInfo.map(c => {
                            const asistenciaRegistrada = c.asistencia === "Sí";
                            return (
                                <tr
                                    key={c.idempleadocapacitacion}
                                    style={{ borderBottom: "1px solid #eee", height: "60px" }}
                                >
                                    <td style={{ padding: "14px" }}>{c.nombre}</td>
                                    <td style={{ padding: "14px" }}>{c.lugar}</td>
                                    <td style={{ padding: "14px" }}>{formatFecha(c.fecha)}</td>
                                    <td style={{ padding: "14px" }}>{c.observacion || "-"}</td>
                                    <td style={{ padding: "14px" }}>
                                        <button
                                            onClick={() => {
                                                setCapacitacionSeleccionada(c);
                                                setShowAsistenciaModal(true);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                background: asistenciaRegistrada ? "#E5E7EB" : "#219ebc",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                cursor: asistenciaRegistrada ? "not-allowed" : "pointer",
                                                width: "100%",
                                                transition: "0.2s"
                                            }}
                                            disabled={asistenciaRegistrada}
                                        >
                                            Marcar asistencia / inasistencia
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
