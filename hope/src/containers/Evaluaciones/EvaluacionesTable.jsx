import React from "react";

const pastel = {
    orangeBg: "#FED7AA",
    orangeBr: "#FDBA74",
    orangeTx: "#7C2D12"
};

const EvaluacionesTable = ({
    evaluaciones,
    empleadosMap,
    onEdit,
    onVerDetalle,
    paginaActual,
    totalPaginas,
    setPaginaActual
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px 30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
    >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "left" }}>Empleado</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "left" }}>Tipo</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "left" }}>Fecha</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "right" }}>Puntaje</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>Estado</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {evaluaciones.length > 0 ? (
                    evaluaciones.map(ev => (
                        <tr key={ev.idEvaluacion}>
                            <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                                <button
                                    type="button"
                                    onClick={() => onVerDetalle && onVerDetalle(ev)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        padding: 0,
                                        margin: 0,
                                        color: "#1d4ed8",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        textDecoration: "underline"
                                    }}
                                    title="Ver detalle"
                                >
                                    {empleadosMap.get(Number(ev.idEmpleado)) || `#${ev.idEmpleado ?? ""}`}
                                </button>
                            </td>
                            <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                                {ev.tipoEvaluacion || "—"}
                            </td>
                            <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                                {ev.fechaEvaluacion ? new Date(ev.fechaEvaluacion).toLocaleString() : "—"}
                            </td>
                            <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
                                {Number(ev.puntajeTotal || 0).toFixed(2)}
                            </td>
                            <td
                                style={{
                                    padding: 10,
                                    textAlign: "center",
                                    color: ev.estado ? "green" : "red",
                                    fontWeight: 600,
                                    borderBottom: "1px solid #f0f0f0"
                                }}
                            >
                                {ev.estado ? "Activo" : "Inactivo"}
                            </td>
                            <td style={{ padding: 10, textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                <button
                                    onClick={() => onEdit(ev)}
                                    style={{
                                        minWidth: 90,
                                        padding: "6px 14px",
                                        background: pastel.orangeBg,
                                        color: pastel.orangeTx,
                                        border: `1px solid ${pastel.orangeBr}`,
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: 600
                                    }}
                                    title="Editar"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                            No hay evaluaciones registradas
                        </td>
                    </tr>
                )}
            </tbody>
        </table>

        {totalPaginas > 1 && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
                {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setPaginaActual(i + 1)}
                        style={{
                            margin: "0 5px",
                            padding: "6px 12px",
                            border: "1px solid #219ebc",
                            background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                            color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default EvaluacionesTable;
