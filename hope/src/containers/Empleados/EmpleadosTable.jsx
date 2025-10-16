import React from "react";

// helpers para catálogos
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idequipo", "idEquipo", "idpueblocultura", "idPuebloCultura", "pk", "codigo");
const getEquipoLabel = (o) => pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");
const labelEquipoFrom = (id, equipos = []) => {
    if (!id) return "";
    const found = equipos.find((x) => String(getId(x)) === String(id));
    return getEquipoLabel(found) || `#${id}`;
};

// Colores pastel estilo Equipos
const pastel = {
    orangeBg: "#FED7AA", orangeBr: "#FED7AA", orangeTx: "#7C2D12",
    redBg: "#FCA5A5", redBr: "#F87171", green: "#28a745",
};

const thStyle = { borderBottom: "2px solid #eee", padding: "10px", textAlign: "left", fontSize: 14, whiteSpace: "nowrap" };
const tdStyle = { padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: 14, verticalAlign: "middle" };

const EmpleadosTable = ({
    empleados,
    handleEdit,
    handleToggle,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    equipos = [],
    onVerDetalle,     // DPI → Detalle
}) => (
    <div
        style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            maxWidth: "900px",              // << más compacta
            margin: "0 auto",
        }}
    >
        <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {["DPI", "Nombre", "Apellido", "Género", "Equipo", "Estado", "Acciones"].map((h) => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(empleados) && empleados.length ? (
                        empleados.map((r) => {
                            const estado = !!r.estado;
                            const equipoLabel = labelEquipoFrom(r.idequipo, equipos);
                            return (
                                <tr key={r.id || r.idempleado || r.idEmpleado}>
                                    {/* DPI (hipervínculo → modal detalle) */}
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => onVerDetalle && onVerDetalle(r)}
                                            style={{
                                                background: "transparent", border: "none", padding: 0, margin: 0,
                                                color: "#1d4ed8", fontWeight: 600, cursor: "pointer", textDecoration: "underline"
                                            }}
                                            title="Ver detalle"
                                        >
                                            {r.dpi}
                                        </button>
                                    </td>

                                    <td style={tdStyle}>{r.nombre}</td>
                                    <td style={tdStyle}>{r.apellido}</td>
                                    <td style={tdStyle}>{r.genero}</td>
                                    <td style={tdStyle}>{equipoLabel}</td>
                                    <td style={{ ...tdStyle, textAlign: "center", color: estado ? "green" : "red", fontWeight: 600 }}>
                                        {estado ? "Activo" : "Inactivo"}
                                    </td>

                                    {/* Acciones */}
                                    <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                                        <button
                                            onClick={() => handleEdit(r)}
                                            disabled={!estado}
                                            style={{
                                                minWidth: 90, padding: "6px 14px",
                                                background: pastel.orangeBg, color: pastel.orangeTx,
                                                border: `1px solid ${pastel.orangeBr}`, borderRadius: "6px",
                                                cursor: estado ? "pointer" : "not-allowed", fontWeight: 600, marginRight: 6
                                            }}
                                            title="Editar"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleToggle(r)}
                                            style={{
                                                minWidth: 100, padding: "6px 14px",
                                                background: estado ? pastel.redBg : pastel.green,
                                                color: "#fff",
                                                border: `1px solid ${estado ? pastel.redBr : "#1c7c31"}`,
                                                borderRadius: "6px", cursor: "pointer", fontWeight: 600
                                            }}
                                        >
                                            {estado ? "Desactivar" : "Activar"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan={7} style={{ textAlign: "center", padding: 20 }}>No hay empleados</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {totalPaginas > 1 && (
            <div style={{ marginTop: "14px", textAlign: "center" }}>
                {Array.from({ length: totalPaginas }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setPaginaActual(i + 1)}
                        style={{
                            margin: "0 4px", padding: "6px 10px",
                            border: "1px solid #219ebc",
                            background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                            color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                            borderRadius: "5px", cursor: "pointer", fontSize: 13
                        }}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export default EmpleadosTable;
