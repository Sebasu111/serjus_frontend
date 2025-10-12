import React from "react";

const CapacitacionTable = ({ capacitaciones, handleEdit, handleDelete, paginaActual, setPaginaActual, totalPaginas }) => {
    return (
        <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Lugar</th>
                        <th>Fechas</th>
                        <th>Institución</th>
                        <th>Monto</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {capacitaciones.length > 0 ? capacitaciones.map(c => {
                        const id = c.idcapacitacion || c.id;
                        return (
                            <tr key={id}>
                                <td>{c.nombreevento}</td>
                                <td>{c.lugar}</td>
                                <td>{c.fechainicio} - {c.fechafin}</td>
                                <td>{c.institucionfacilitadora}</td>
                                <td>{c.montoejecutado || 0}</td>
                                <td>
                                    <button
                                        onClick={() => handleEdit(c)}
                                        style={{
                                            marginRight: "6px",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: c.estado ? "pointer" : "not-allowed",
                                            background: c.estado ? "#007bff" : "#6c757d",
                                            color: "#fff",
                                            fontWeight: "500"
                                        }}
                                        disabled={!c.estado}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(id, c.estado)}
                                        style={{
                                            marginRight: "6px",
                                            padding: "6px 12px",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            background: c.estado ? "#dc3545" : "#28a745",
                                            color: "#fff",
                                            fontWeight: "500"
                                        }}
                                    >
                                        {c.estado ? "Eliminar" : "Activar"}
                                    </button>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No hay capacitaciones registradas</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {totalPaginas > 1 && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button key={i + 1} onClick={() => setPaginaActual(i + 1)}
                            style={{
                                margin: "0 5px",
                                padding: "6px 12px",
                                border: "1px solid #007bff",
                                background: paginaActual === i + 1 ? "#007bff" : "#fff",
                                color: paginaActual === i + 1 ? "#fff" : "#007bff",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >{i + 1}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CapacitacionTable;
