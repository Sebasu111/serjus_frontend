import React from "react";

const PuebloCulturaTable = ({
    items,
    handleEdit,
    handleDelete,
    handleActivate,
    paginaActual,
    totalPaginas,
    setPaginaActual,
}) => (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Nombre</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {items.length > 0 ? (
                    items.map((row) => (
                        <tr key={row.idPuebloCultura}>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{row.nombrePueblo}</td>
                            <td style={{ padding: "10px", textAlign: "center", color: row.estado ? "green" : "red", fontWeight: "600", borderBottom: "1px solid #f0f0f0" }}>
                                {row.estado ? "Activo" : "Inactivo"}
                            </td>
                            <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                <button
                                    onClick={() => handleEdit(row)}
                                    disabled={!row.estado}
                                    style={{ padding: "6px 14px", background: row.estado ? "#fb8500" : "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: row.estado ? "pointer" : "not-allowed", marginRight: "6px" }}
                                >
                                    Editar
                                </button>
                                {row.estado ? (
                                    <button
                                        onClick={() => handleDelete(row)}
                                        style={{ padding: "6px 14px", background: "#fb8500", color: "#fff", border: "none", borderRadius: "5px" }}
                                    >
                                        Eliminar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleActivate(row.idPuebloCultura)}
                                        style={{ padding: "6px 14px", background: "#ffb703", color: "#fff", border: "none", borderRadius: "5px" }}
                                    >
                                        Activar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>No hay registros</td>
                    </tr>
                )}
            </tbody>
        </table>

        {totalPaginas > 1 && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
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
                            cursor: "pointer",
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default PuebloCulturaTable;
