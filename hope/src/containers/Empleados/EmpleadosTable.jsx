import React from "react";

// helpers para leer ids/nombres de los catálogos
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idequipo", "idpueblocultura", "pk", "codigo");

const getName = (o, type) => {
    if (type === "idioma")
        return pick(o, "nombreidioma", "nombre", "idioma", "nombreIdioma", "descripcion", "label");
    if (type === "pueblo")
        return pick(o, "nombrepueblocultura", "nombre_pueblo_cultura", "nombre", "pueblo", "cultura",
            "nombrePueblo", "nombre_cultura", "descripcion", "label");
    if (type === "equipo")
        return pick(o, "nombreequipo", "nombre_equipo", "nombre", "equipo", "nombreEquipo", "descripcion", "label");
    return undefined;
};

const labelFrom = (id, list, type) => {
    if (!id) return "";
    const found = list.find((x) => String(getId(x)) === String(id));
    return getName(found, type) || `#${id}`;
};


const fmtFecha = (v) => {
    if (!v) return "";
    // Soporta "YYYY-MM-DD" o ISO
    const d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return String(v).slice(0, 10);
};

const EmpleadosTable = ({
    empleados,
    handleEdit,
    handleToggle,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    idiomas = [],
    pueblos = [],
    equipos = [],
}) => (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", maxHeight: 420, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
            <thead>
                <tr>
                    {[
                        "Nombre", "Apellido", "Género", "DPI", "NIT", "IGGS",
                        "Lugar nac.", "Fecha nac.", "Estado civil", "# Hijos",
                        "Teléfono", "Email", "Idioma", "Pueblo/Cultura", "Equipo",
                        "Estado", "Acciones"
                    ].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.isArray(empleados) && empleados.length ? (
                    empleados.map((r) => {
                        const idiomaLabel = labelFrom(r.ididioma, idiomas, "idioma");
                        const puebloLabel = labelFrom(r.idpueblocultura, pueblos, "pueblo");
                        const equipoLabel = labelFrom(r.idequipo, equipos, "equipo");
                        const estado = !!r.estado;
                        return (
                            <tr key={r.id || r.idempleado || r.idEmpleado}>
                                <td style={tdStyle}>{r.nombre}</td>
                                <td style={tdStyle}>{r.apellido}</td>
                                <td style={tdStyle}>{r.genero}</td>
                                <td style={tdStyle}>{r.dpi}</td>
                                <td style={tdStyle}>{String(r.nit).toUpperCase()}</td>
                                <td style={tdStyle}>{r.numeroiggs || ""}</td>
                                <td style={tdStyle}>{r.lugarnacimiento}</td>
                                <td style={tdStyle}>{fmtFecha(r.fechanacimiento)}</td>
                                <td style={tdStyle}>{r.estadocivil}</td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>{r.numerohijos ?? 0}</td>
                                <td style={tdStyle}>{r.telefono}</td>
                                <td style={tdStyle}>{r.email}</td>
                                <td style={tdStyle}>{idiomaLabel}</td>
                                <td style={tdStyle}>{puebloLabel}</td>
                                <td style={tdStyle}>{equipoLabel}</td>
                                <td style={{ ...tdStyle, textAlign: "center", color: estado ? "green" : "red", fontWeight: 600 }}>
                                    {estado ? "Activo" : "Inactivo"}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                                    <button onClick={() => handleEdit(r)} disabled={!estado} style={btnWarn}>Editar</button>
                                    <button onClick={() => handleToggle(r)} style={estado ? btnDanger : btnSuccess}>
                                        {estado ? "Desactivar" : "Activar"}
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr><td colSpan={17} style={{ textAlign: "center", padding: 20 }}>No hay empleados</td></tr>
                )}
            </tbody>
        </table>

        {/* Paginación */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div>Página {paginaActual} / {totalPaginas}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => setPaginaActual(1)} disabled={paginaActual === 1} style={paginationBtn}>« Primero</button>
                <button onClick={() => setPaginaActual(paginaActual - 1)} disabled={paginaActual === 1} style={paginationBtn}>‹</button>
                <button onClick={() => setPaginaActual(paginaActual + 1)} disabled={paginaActual === totalPaginas} style={paginationBtn}>›</button>
                <button onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas} style={paginationBtn}>Último »</button>
            </div>
        </div>
    </div>
);

const thStyle = { borderBottom: "2px solid #eee", padding: 10, textAlign: "left", position: "sticky", top: 0, background: "#fff", zIndex: 1 };
const tdStyle = { padding: 10, borderBottom: "1px solid #f0f0f0" };
const btnWarn = { padding: "6px 10px", background: "#fb8500", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13, marginRight: 6 };
const btnDanger = { padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const btnSuccess = { padding: "6px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const paginationBtn = { padding: "6px 8px", borderRadius: 6, cursor: "pointer" };

export default EmpleadosTable;
