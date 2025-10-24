import React, { useState, useEffect, useRef } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const IdiomasTable = ({
    idiomas,
    handleEdit,
    handleDelete,
    handlePrepareActivate, // <-- nueva prop para activar con modal
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
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Nombre</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {idiomas.length > 0 ? (
                        idiomas.map(idioma => (
                            <tr key={idioma.ididioma}>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {idioma.nombreidioma}
                                </td>
                                <td
                                    style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: idioma.estado ? "green" : "red",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #f0f0f0"
                                    }}
                                >
                                    {idioma.estado ? "Activo" : "Inactivo"}
                                </td>
                                <td
                                    style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                        position: "relative"
                                    }}
                                >
                                    {/* COMBOBOX */}
                                    <div style={comboBoxStyles.container}>
                                        <button
                                            onClick={() => toggleMenu(idioma.ididioma)}
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

                                        {menuAbierto === idioma.ididioma && (
                                            <div style={comboBoxStyles.menu.container}>
                                                {/* Editar */}
                                                <button
                                                    onClick={() => handleEdit(idioma)}
                                                    disabled={!idioma.estado}
                                                    style={{
                                                        ...comboBoxStyles.menu.item.editar.base,
                                                        ...(idioma.estado
                                                            ? {}
                                                            : comboBoxStyles.menu.item.editar.disabled)
                                                    }}
                                                    onMouseEnter={e => {
                                                        if (idioma.estado)
                                                            e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.editar.hover.background;
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (idioma.estado)
                                                            e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.editar.base.background;
                                                    }}
                                                >
                                                    Editar
                                                </button>

                                                {/* Activar / Desactivar */}
                                                {idioma.estado ? (
                                                    <button
                                                        onClick={() => handleDelete(idioma)}
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
                                                        onClick={() => handlePrepareActivate(idioma)} // <-- abrir modal para activar
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
                            <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                                No hay idiomas registrados
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

export default IdiomasTable;
