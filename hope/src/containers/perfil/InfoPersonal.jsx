import React from "react";

const InfoPersonal = ({ empleado, formatFecha }) => {
    return (
        <div
            style={{
                marginBottom: "35px",
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
        >
            <h4 style={{ marginBottom: "20px", color: "#219ebc", fontWeight: "600" }}>Información personal</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                <tbody>
                    {[
                        ["Nombre", `${empleado.nombre} ${empleado.apellido}`],
                        ["Email", empleado.email],
                        ["Teléfono", empleado.telefonocelular || "No registrado"],
                        ["Dirección", empleado.direccion],
                        ["Fecha de nacimiento", formatFecha(empleado.fechanacimiento)],
                        ["Género", empleado.genero]
                    ].map(([label, value]) => (
                        <tr key={label}>
                            <td style={{ padding: "12px", fontWeight: "600", width: "220px", color: "#555" }}>
                                {label}:
                            </td>
                            <td style={{ padding: "12px" }}>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InfoPersonal;
