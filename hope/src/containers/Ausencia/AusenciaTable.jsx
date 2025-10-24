import React from "react";

const AusenciaTable = ({ ausencias, onEdit, onDelete, onActivate }) => {
    // Función para formatear fecha a DD-MM-YYYY
    const formatDate = dateString => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px 30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                maxHeight: "600px",
                overflowY: "auto"
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Ausencias Registradas</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Tipo</th>
                        <th>Motivo</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Documento</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ausencias.length > 0 ? (
                        ausencias.map(a => (
                            <tr key={a.idausencia}>
                                <td>{a.idempleado || "N/A"}</td>
                                <td>{a.tipo}</td>
                                <td>{a.motivo}</td>
                                <td>{formatDate(a.fechainicio)}</td>
                                <td>{formatDate(a.fechafin)}</td>
                                <td>{a.iddocumento}</td>
                                <td
                                    style={{
                                        textAlign: "center",
                                        color: a.estado ? "green" : "red",
                                        fontWeight: "600"
                                    }}
                                >
                                    {a.estado ? "Activo" : "Inactivo"}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <button
                                        onClick={() => onEdit(a)}
                                        style={{
                                            padding: "6px 14px",
                                            background: " #FED7AA",
                                            color: "#7C2D12",
                                            border: "none",
                                            borderRadius: "5px",
                                            marginRight: "6px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Editar
                                    </button>
                                    {a.estado ? (
                                        <button
                                            onClick={() => onDelete(a.idausencia)}
                                            style={{
                                                padding: "6px 14px",
                                                background: "#F87171",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Desactivar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onActivate(a.idausencia)}
                                            style={{
                                                padding: "6px 14px",
                                                background: "#28a745",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "5px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            Activar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                No hay ausencias registradas
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AusenciaTable;
