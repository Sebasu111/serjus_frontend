import React from "react";

// helpers para leer ids/nombres de los catálogos
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };

const getId = (o) =>
    pick(
        o,
        "id",
        "ididioma", "idIdioma",
        "idequipo", "idEquipo",             // <- Equipo
        "idpueblocultura", "idPuebloCultura",
        "pk", "codigo"
    );

const getName = (o, type) => {
    if (type === "equipo")
        return pick(
            o,
            "nombreequipo", "nombreEquipo",   // <- Equipo
            "nombre", "descripcion", "label"
        );

    if (type === "idioma")
        return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");

    if (type === "pueblo")
        return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label");

    return pick(o, "nombre", "descripcion", "label");
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
    <div
        style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px 30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
    >
        {/* contenedor de scroll horizontal */}
        <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1400px", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {[
                            "Nombre",
                            "Apellido",
                            "Género",
                            "DPI",
                            "NIT",
                            "IGGS",
                            "Lugar nac.",
                            "Fecha nac.",
                            "Estado civil",
                            "# Hijos",
                            "Tel. Residencial",
                            "Tel. Celular",
                            "Tel. Emergencia",
                            "Título medio",
                            "Estudios univ.",
                            "Email",
                            "Idioma",
                            "Pueblo/Cultura",
                            "Equipo",
                            "Estado",
                            "Acciones",
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
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.dpi}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{String(r.nit).toUpperCase()}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.numeroiggs || ""}</td>
                                    <td style={tdStyle}>{r.lugarnacimiento}</td>
                                    <td style={tdStyle}>{fmtFecha(r.fechanacimiento)}</td>
                                    <td style={tdStyle}>{r.estadocivil}</td>
                                    <td style={{ ...tdStyle, textAlign: "right" }}>{r.numerohijos ?? 0}</td>
                                    <td style={tdStyle}>{r.telefonoresidencial ?? r.telefonoResidencial ?? ""}</td>
                                    <td style={tdStyle}>{r.telefonocelular ?? r.telefonoCelular ?? ""}</td>
                                    <td style={tdStyle}>{r.telefonoemergencia ?? r.telefonoEmergencia ?? ""}</td>
                                    <td style={tdStyle}>{r.titulonivelmedio ?? r.tituloNivelMedio ?? ""}</td>
                                    <td style={tdStyle}>{r.estudiosuniversitarios ?? r.estudiosUniversitarios ?? ""}</td>
                                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{r.email}</td>
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
                        <tr>
                            <td colSpan={17} style={{ textAlign: "center", padding: 20 }}>
                                No hay empleados
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* PAGINACIÓN (idéntica a Idiomas) */}
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

const thStyle = { borderBottom: "2px solid #eee", padding: "12px", textAlign: "left", fontSize: 15 };
const tdStyle = { padding: "12px", borderBottom: "1px solid #f0f0f0", fontSize: 15 };
const btnWarn = { padding: "6px 10px", background: "#fb8500", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13, marginRight: 6 };
const btnDanger = { padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const btnSuccess = { padding: "6px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };

export default EmpleadosTable;
