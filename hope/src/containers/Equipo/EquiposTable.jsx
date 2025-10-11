import React from "react";

const EquiposTable = ({
    equipos,
    empleadosMap,
    handleEdit,
    handleDelete,
    handleActivate,
    paginaActual,
    totalPaginas,
    setPaginaActual,
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px 30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
    >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                        Equipo
                    </th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                        Coordinador
                    </th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                        Estado
                    </th>
                    <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                {equipos.length > 0 ? (
                    equipos.map((equipo) => (
                        <tr key={equipo.idEquipo}>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                {equipo.nombreEquipo}
                            </td>
                            <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                {empleadosMap.get(equipo.idCoordinador) || `#${equipo.idCoordinador}`}
                            </td>
                            <td
                                style={{
                                    padding: "10px",
                                    textAlign: "center",
                                    color: equipo.estado ? "green" : "red",
                                    fontWeight: "600",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            >
                                {equipo.estado ? "Activo" : "Inactivo"}
                            </td>
                            <td
                                style={{
                                    padding: "10px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #f0f0f0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <button
                                        onClick={() => handleEdit(equipo)}
                                        disabled={!equipo.estado}
                                        style={{
                                            width: "85px",
                                            padding: "6px 14px",
                                            background: equipo.estado ? "#fb8500" : "#6c757d",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: equipo.estado ? "pointer" : "not-allowed",
                                        }}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() =>
                                            equipo.estado ? handleDelete(equipo) : handleActivate(equipo.idEquipo)
                                        }
                                        style={{
                                            width: "85px",
                                            padding: "6px 14px",
                                            background: equipo.estado ? "#fb8500" : "#ffb703",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {equipo.estado ? "Eliminar" : "Activar"}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                            No hay equipos registrados
                        </td>
                    </tr>
                )}
            </tbody>
        </table>

        {/* PAGINACIÓN */}
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

export default EquiposTable;
