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
                            const asistenciaRegistrada = c.iddocumento != null;
                            let botonTexto = "";
                            let botonColor = "#219ebc";
                            let botonModo = null;
                            if (c.asistencia === "Sí") {
                                botonTexto = "Subir informe de asistencia";
                                botonColor = "#219ebc";
                                botonModo = "asistio";
                            } else if (c.asistencia === "No") {
                                botonTexto = "Subir justificación";
                                botonColor = "#dc2626";
                                botonModo = "justifico";
                            } else {
                                botonTexto = "No disponible";
                                botonColor = "#6B7280";
                                botonModo = null;
                            }
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
                                        {asistenciaRegistrada ? (
                                            <span style={{
                                                color: "#059669",
                                                background: "#e6fbe8",
                                                borderRadius: "8px",
                                                padding: "8px 18px",
                                                fontWeight: 700,
                                                border: "2px solid #16a34a",
                                                display: "inline-block"
                                            }}>
                                                Registrado
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setCapacitacionSeleccionada({ ...c, modo: botonModo });
                                                    setShowAsistenciaModal(true);
                                                }}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: botonColor,
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    transition: "0.2s"
                                                }}
                                            >
                                                {botonTexto}
                                            </button>
                                        )}
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
