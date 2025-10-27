import React, { useState, useEffect, useRef } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const HistorialPuestoTable = ({
    historiales,
    handleEdit,
    handleDelete,
    handlePrepareActivate,
    obtenerNombreEmpleado,
    obtenerNombrePuesto,
    paginaActual,
    totalPaginas,
    setPaginaActual
}) => {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const containerRef = useRef(null);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setMenuAbierto(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = id => {
        setMenuAbierto(menuAbierto === id ? null : id);
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString('es-GT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Formatear salario
    const formatearSalario = (salario) => {
        if (!salario) return "Q 0.00";
        return `Q ${parseFloat(salario).toLocaleString('es-GT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px 30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
            ref={containerRef}
        >
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                    <thead>
                        <tr>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "left",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Empleado
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "left",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Puesto
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Fecha Inicio
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Fecha Fin
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Salario
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Estado
                            </th>
                            <th style={{
                                borderBottom: "2px solid #eee",
                                padding: "12px 8px",
                                textAlign: "center",
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#374151"
                            }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {historiales.length > 0 ? (
                            historiales.map(historial => (
                                <tr key={historial.idhistorialpuesto} style={{ transition: "background-color 0.2s" }}>
                                    {/* Empleado */}
                                    <td style={{
                                        padding: "12px 8px",
                                        borderBottom: "1px solid #f0f0f0",
                                        fontSize: "14px"
                                    }}>
                                        <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                            {obtenerNombreEmpleado(historial.idempleado)}
                                        </div>
                                    </td>

                                    {/* Puesto */}
                                    <td style={{
                                        padding: "12px 8px",
                                        borderBottom: "1px solid #f0f0f0",
                                        fontSize: "14px"
                                    }}>
                                        <div style={{ fontWeight: "500", color: "#1f2937" }}>
                                            {obtenerNombrePuesto(historial.idpuesto)}
                                        </div>
                                    </td>

                                    {/* Fecha Inicio */}
                                    <td style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        fontSize: "14px",
                                        color: "#374151"
                                    }}>
                                        {formatearFecha(historial.fechainicio)}
                                    </td>

                                    {/* Fecha Fin */}
                                    <td style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        fontSize: "14px",
                                        color: "#374151"
                                    }}>
                                        <span style={{
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                            backgroundColor: historial.fechafin ? "#f3f4f6" : "#dbeafe",
                                            color: historial.fechafin ? "#374151" : "#1e40af"
                                        }}>
                                            {historial.fechafin ? formatearFecha(historial.fechafin) : "En curso"}
                                        </span>
                                    </td>

                                    {/* Salario */}
                                    <td style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#059669"
                                    }}>
                                        {formatearSalario(historial.salario)}
                                    </td>

                                    {/* Estado */}
                                    <td style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0"
                                    }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            backgroundColor: historial.estado ? "#dcfce7" : "#fee2e2",
                                            color: historial.estado ? "#166534" : "#dc2626"
                                        }}>
                                            {historial.estado ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td style={{
                                        padding: "12px 8px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        position: "relative"
                                    }}>
                                        <div style={comboBoxStyles.container}>
                                            <button
                                                onClick={() => toggleMenu(historial.idhistorialpuesto)}
                                                style={{
                                                    ...comboBoxStyles.button.base,
                                                    fontSize: "12px",
                                                    padding: "8px 12px"
                                                }}
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

                                            {menuAbierto === historial.idhistorialpuesto && (
                                                <div style={comboBoxStyles.menu.container}>
                                                    {/* Ver detalles */}
                                                    {historial.observacion && (
                                                        <div style={{
                                                            padding: "8px 12px",
                                                            borderBottom: "1px solid #e5e7eb",
                                                            fontSize: "11px",
                                                            color: "#6b7280",
                                                            backgroundColor: "#f9fafb"
                                                        }}>
                                                            <strong>Observación:</strong><br />
                                                            {historial.observacion}
                                                        </div>
                                                    )}

                                                    {/* Editar */}
                                                    <button
                                                        onClick={() => {
                                                            handleEdit(historial);
                                                            setMenuAbierto(null);
                                                        }}
                                                        disabled={!historial.estado}
                                                        style={{
                                                            ...comboBoxStyles.menu.item.editar.base,
                                                            ...(historial.estado
                                                                ? {}
                                                                : comboBoxStyles.menu.item.editar.disabled)
                                                        }}
                                                        onMouseEnter={e => {
                                                            if (historial.estado)
                                                                e.currentTarget.style.background =
                                                                    comboBoxStyles.menu.item.editar.hover.background;
                                                        }}
                                                        onMouseLeave={e => {
                                                            if (historial.estado)
                                                                e.currentTarget.style.background =
                                                                    comboBoxStyles.menu.item.editar.base.background;
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {/* Activar / Desactivar */}
                                                    {historial.estado ? (
                                                        <button
                                                            onClick={() => {
                                                                handleDelete(historial);
                                                                setMenuAbierto(null);
                                                            }}
                                                            style={comboBoxStyles.menu.item.desactivar.base}
                                                            onMouseEnter={e =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.desactivar.hover.background)
                                                            }
                                                            onMouseLeave={e =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.desactivar.base.background)
                                                            }
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                handlePrepareActivate(historial);
                                                                setMenuAbierto(null);
                                                            }}
                                                            style={comboBoxStyles.menu.item.activar.base}
                                                            onMouseEnter={e =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.activar.hover.background)
                                                            }
                                                            onMouseLeave={e =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.activar.base.background)
                                                            }
                                                        >
                                                            Activar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{
                                    textAlign: "center",
                                    padding: "40px 20px",
                                    color: "#6b7280",
                                    fontSize: "14px"
                                }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        <div>No hay historiales de puestos registrados</div>
                                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                                            Agrega el primer historial para comenzar
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINACIÓN */}
            {totalPaginas > 1 && (
                <div style={{
                    marginTop: "20px",
                    textAlign: "center",
                    paddingTop: "20px",
                    borderTop: "1px solid #e5e7eb"
                }}>
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                        {Array.from({ length: totalPaginas }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPaginaActual(i + 1)}
                                style={{
                                    ...buttonStyles.paginacion.base,
                                    ...(paginaActual === i + 1
                                        ? {
                                            ...buttonStyles.paginacion.activo,
                                            backgroundColor: "#219ebc",
                                            borderColor: "#219ebc",
                                            color: "#fff"
                                        }
                                        : buttonStyles.paginacion.inactivo)
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <div style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#6b7280"
                    }}>
                        Página {paginaActual} de {totalPaginas}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialPuestoTable;