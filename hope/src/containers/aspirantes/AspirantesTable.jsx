import React from "react";

const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idpueblocultura", "idPuebloCultura");
const getIdiomaName = (o) => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloName = (o) => pick(o, "nombrepueblo", "nombrePueblo", "pueblocultura", "descripcion", "label");

const labelFrom = (id, list, type) => {
    if (!id) return "";
    const found = list.find((x) => String(getId(x)) === String(id));
    if (!found) return `#${id}`;
    return type === "idioma" ? getIdiomaName(found) : getPuebloName(found);
};

const fmtFecha = (v) => {
    if (!v) return "";
    const d = new Date(v);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return String(v).slice(0, 10);
};

const thStyle = { borderBottom: "2px solid #eee", padding: "12px", textAlign: "left", fontSize: 15 };
const tdStyle = { padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: 15 };
const btnWarn = { padding: "6px 10px", background: "#fb8500", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13, marginRight: 6 };
const btnDanger = { padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const btnSuccess = { padding: "6px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };

const AspirantesTable = ({
    aspirantes,
    handleEdit,
    handleToggle,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    idiomas = [],
    pueblos = [],
}) => (
    <div style={{ background: "#fff", borderRadius: 12, padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1200px", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {[
                            "Nombre", "Apellido", "Género",
                            "DPI", "NIT", "Fecha nac.",
                            "Teléfono", "Email", "Dirección",
                            "Idioma", "Pueblo/Cultura",
                            "Estado", "Acciones",
                        ].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(aspirantes) && aspirantes.length ? (
                        aspirantes.map((r) => {
                            const idiomaLabel = labelFrom(r.ididioma ?? r.idIdioma, idiomas, "idioma");
                            const puebloLabel = labelFrom(r.idpueblocultura ?? r.idPuebloCultura, pueblos, "pueblo");
                            const estado = !!r.estado;
                            return (
                                <tr key={r.idaspirante ?? r.idAspirante ?? r.id}>
                                    <td style={tdStyle}>{r.nombreaspirante ?? r.nombreAspirante}</td>
                                    <td style={tdStyle}>{r.apellidoaspirante ?? r.apellidoAspirante}</td>
                                    <td style={tdStyle}>{r.genero}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.dpi}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{String(r.nit).toUpperCase()}</td>
                                    <td style={tdStyle}>{fmtFecha(r.fechanacimiento ?? r.fechaNacimiento)}</td>
                                    <td style={tdStyle}>{r.telefono}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.email}</td>
                                    <td style={tdStyle}>{r.direccion}</td>
                                    <td style={tdStyle}>{idiomaLabel}</td>
                                    <td style={tdStyle}>{puebloLabel}</td>
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
                        <tr><td colSpan={13} style={{ textAlign: "center", padding: 20 }}>No hay aspirantes</td></tr>
                    )}
                </tbody>
            </table>
        </div>

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
                            borderRadius: 5,
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
