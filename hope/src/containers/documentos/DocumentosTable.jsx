import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const DocumentosTable = ({
    documentosPaginados,
    empleados,
    tiposDocumento,
    downloadFile,
    handleEdit,
    paginaActual,
    setPaginaActual,
    totalPaginas,
}) => {
    const [openComboId, setOpenComboId] = useState(null);

    const thStyle = {
        borderBottom: "2px solid #eee",
        padding: "10px",
        textAlign: "left",
    };
    const tdStyle = { padding: "10px", borderBottom: "1px solid #f0f0f0" };

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
        >
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderSpacing: "0 8px",
                }}
            >
                <thead>
                    <tr>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Fecha</th>
                        <th style={thStyle}>Empleado</th>
                        <th style={thStyle}>Tipo</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {documentosPaginados.length > 0 ? (
                        documentosPaginados.map((d) => (
                            <tr key={d.iddocumento}>
                                <td style={tdStyle}>
                                    {d.archivo_url
                                        ? d.nombrearchivo
                                        : `${d.nombrearchivo} (sin archivo)`}
                                </td>
                                <td style={tdStyle}>{formatDate(d.fechasubida)}</td>
                                <td style={tdStyle}>
                                    {empleados.find((e) => e.idempleado === d.idempleado)
                                        ? `${empleados.find((e) => e.idempleado === d.idempleado).nombre} ${empleados.find((e) => e.idempleado === d.idempleado)
                                            .apellido
                                        }`
                                        : "-"}
                                </td>
                                <td style={tdStyle}>
                                    {tiposDocumento.find(
                                        (t) => t.idtipodocumento === d.idtipodocumento
                                    )
                                        ? tiposDocumento.find(
                                            (t) => t.idtipodocumento === d.idtipodocumento
                                        ).nombretipo
                                        : "-"}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center" }}>
                                    {d.archivo_url && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                position: "relative",
                                            }}
                                        >
                                            {/* Combobox */}
                                            <div style={comboBoxStyles.container}>
                                                <button
                                                    style={comboBoxStyles.button.base}
                                                    onClick={() =>
                                                        setOpenComboId(
                                                            openComboId === d.iddocumento
                                                                ? null
                                                                : d.iddocumento
                                                        )
                                                    }
                                                >
                                                    Opciones ▾
                                                </button>
                                                {openComboId === d.iddocumento && (
                                                    <div style={comboBoxStyles.menu.container}>
                                                        <div
                                                            style={comboBoxStyles.menu.item.editar.base}
                                                            onClick={() => {
                                                                handleEdit(d);
                                                                setOpenComboId(null);
                                                            }}
                                                        >
                                                            Editar
                                                        </div>
                                                        <div
                                                            style={comboBoxStyles.menu.item.activar.base}
                                                            onClick={() => {
                                                                downloadFile(
                                                                    d.archivo_url,
                                                                    d.nombrearchivo
                                                                );
                                                                setOpenComboId(null);
                                                            }}
                                                        >
                                                            Descargar
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                No hay documentos registrados
                            </td>
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
};

export default DocumentosTable;
