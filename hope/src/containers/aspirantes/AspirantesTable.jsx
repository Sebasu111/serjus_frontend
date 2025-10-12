import React from "react";

const cell = { padding: "10px", borderBottom: "1px solid #f0f0f0" };

const AspirantesTable = ({
    aspirantes,
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
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Apellido</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>DPI</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>NIT</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Correo</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {aspirantes.length > 0 ? (
                    aspirantes.map((a) => (
                        <tr key={a.idAspirante}>
                            <td style={cell}>{a.nombreAspirante}</td>
                            <td style={cell}>{a.apellidoAspirante}</td>
                            <td style={cell}>{a.dpi}</td>
                            <td style={cell}>{a.nit || "-"}</td>
                            <td style={cell}>{a.email}</td>
                            <td style={{ ...cell, textAlign: "center", color: a.estado ? "green" : "red", fontWeight: 600 }}>
                                {a.estado ? "Activo" : "Inactivo"}
                            </td>
                            <td style={{ ...cell, textAlign: "center" }}>
                                <button
                                    onClick={() => handleEdit(a)}
                                    disabled={!a.estado}
                                    style={{
                                        padding: "6px 14px",
                                        background: a.estado ? "#fb8500" : "#6c757d",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: a.estado ? "pointer" : "not-allowed",
                                        marginRight: "6px",
                                    }}
                                >
                                    Editar
                                </button>

                                {a.estado ? (
                                    <button
                                        onClick={() => handleDelete(a)}
                                        style={{ padding: "6px 14px", background: "#fb8500", color: "#fff", border: "none", borderRadius: "5px" }}
                                    >
                                        Eliminar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleActivate(a.idAspirante)}
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
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No hay aspirantes registrados</td>
                    </tr>
                )}
            </tbody>
        </table>

        {/* Paginación */}
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

export default AspirantesTable;
