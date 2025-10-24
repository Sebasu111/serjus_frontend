import React, { useEffect, useRef, useState } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const EquiposTable = ({
    equipos,
    empleadosMap,
    handleEdit,
    onVerDetalle,
    paginaActual,
    totalPaginas,
    setPaginaActual
}) => {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = e => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setMenuAbierto(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = id => setMenuAbierto(menuAbierto === id ? null : id);

    return (
        <div
            ref={containerRef}
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
                        <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "left" }}>Equipo</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "left" }}>Coordinador</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>Estado</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {equipos.length > 0 ? (
                        equipos.map(equipo => (
                            <tr key={equipo.idEquipo}>
                                <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                                    <button
                                        type="button"
                                        onClick={() => onVerDetalle && onVerDetalle(equipo)}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            padding: 0,
                                            margin: 0,
                                            color: "#1d4ed8",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            textDecoration: "none" // ← sin subrayado
                                        }}
                                        title="Ver detalle"
                                    >
                                        {equipo.nombreEquipo || "—"}
                                    </button>
                                </td>
                                <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0" }}>
                                    {empleadosMap.get(equipo.idCoordinador) || `#${equipo.idCoordinador ?? ""}`}
                                </td>
                                <td
                                    style={{
                                        padding: 10,
                                        textAlign: "center",
                                        color: equipo.estado ? "green" : "red",
                                        fontWeight: 600,
                                        borderBottom: "1px solid #f0f0f0"
                                    }}
                                >
                                    {equipo.estado ? "Activo" : "Inactivo"}
                                </td>
                                <td
                                    style={{
                                        padding: 10,
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        position: "relative"
                                    }}
                                >
                                    <div style={comboBoxStyles.container}>
                                        <button
                                            onClick={() => toggleMenu(equipo.idEquipo)}
                                            style={comboBoxStyles.button.base}
                                            onMouseEnter={e =>
                                                (e.currentTarget.style.background =
                                                    comboBoxStyles.button.hover.background)
                                            }
                                            onMouseLeave={e =>
                                                (e.currentTarget.style.background =
                                                    comboBoxStyles.button.base.background)
                                            }
                                        >
                                            Opciones ▾
                                        </button>

                                        {menuAbierto === equipo.idEquipo && (
                                            <div style={comboBoxStyles.menu.container}>
                                                <button
                                                    onClick={() => handleEdit(equipo)}
                                                    style={comboBoxStyles.menu.item.editar.base}
                                                    onMouseEnter={e =>
                                                        (e.currentTarget.style.background =
                                                            comboBoxStyles.menu.item.editar.hover.background)
                                                    }
                                                    onMouseLeave={e =>
                                                        (e.currentTarget.style.background =
                                                            comboBoxStyles.menu.item.editar.base.background)
                                                    }
                                                >
                                                    Editar integrantes
                                                </button>
                                                {/* Se eliminó "Ver detalle": ahora se ve tocando el nombre azul */}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: 20 }}>
                                No hay equipos registrados
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
                                ...buttonStyles.paginacion.base,
                                ...(paginaActual === i + 1
                                    ? buttonStyles.paginacion.activo
                                    : buttonStyles.paginacion.inactivo)
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

export default EquiposTable;
