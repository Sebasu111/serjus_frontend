import React, { useEffect, useRef, useState } from "react";
//   estilos compartidos como en Idiomas
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = o =>
    pick(o, "id", "ididioma", "idIdioma", "idequipo", "idEquipo", "idpueblocultura", "idPuebloCultura", "pk", "codigo");
const getEquipoLabel = o => pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");
const labelEquipoFrom = (id, equipos = []) => {
    if (!id) return "";
    const found = equipos.find(x => String(getId(x)) === String(id));
    return getEquipoLabel(found) || `#${id}`;
};

const thStyle = { borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" };
const tdBase = { padding: "10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle", fontSize: 14 };

const EmpleadosTable = ({
    empleados,
    handleEdit,
    handleToggle, // activa/desactiva (con confirm en ambos casos)
    paginaActual,
    totalPaginas,
    setPaginaActual,
    equipos = [],
    onVerDetalle, // abrir modal detalle con el DPI
    onTerminacionLaboral, // nueva prop para manejar terminación laboral
    onSubirContrato // nueva prop para subir contrato
}) => {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setMenuAbierto(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = id => setMenuAbierto(menuAbierto === id ? null : id);

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "22px 30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
            ref={containerRef}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={thStyle}>DPI</th>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Apellido</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Género</th>
                        <th style={thStyle}>Equipo</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Estado</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(empleados) && empleados.length ? (
                        empleados.map(r => {
                            const estado = !!r.estado;
                            const equipoLabel = labelEquipoFrom(r.idequipo, equipos);
                            return (
                                <tr key={r.id || r.idempleado || r.idEmpleado}>
                                    {/* DPI como link para ver detalle */}
                                    <td style={{ ...tdBase, whiteSpace: "nowrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => onVerDetalle && onVerDetalle(r)}
                                            style={{
                                                background: "transparent",
                                                border: "none",
                                                padding: 0,
                                                margin: 0,
                                                color: "#1d4ed8",
                                                fontWeight: 600,
                                                cursor: "pointer"
                                            }}
                                            title="Ver detalle"
                                        >
                                            {r.dpi}
                                        </button>
                                    </td>

                                    <td style={tdBase}>{r.nombre}</td>
                                    <td style={tdBase}>{r.apellido}</td>
                                    <td style={{ ...tdBase, textAlign: "center" }}>{r.genero}</td>
                                    <td style={tdBase}>{equipoLabel}</td>
                                    <td
                                        style={{
                                            ...tdBase,
                                            textAlign: "center",
                                            color: estado ? "green" : "red",
                                            fontWeight: 600
                                        }}
                                    >
                                        {estado ? "Activo" : "Inactivo"}
                                    </td>

                                    {/* Acciones con el mismo combobox de Idiomas */}
                                    <td style={{ ...tdBase, textAlign: "center", position: "relative" }}>
                                        <div style={comboBoxStyles.container}>
                                            <button
                                                onClick={() => toggleMenu(r.id || r.idempleado || r.idEmpleado)}
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

                                            {menuAbierto === (r.id || r.idempleado || r.idEmpleado) && (
                                                <div style={comboBoxStyles.menu.container}>
                                                    {/* Editar */}
                                                    <button
                                                        onClick={() => handleEdit(r)}
                                                        disabled={!estado}
                                                        style={{
                                                            ...comboBoxStyles.menu.item.editar.base,
                                                            ...(estado ? {} : comboBoxStyles.menu.item.editar.disabled)
                                                        }}
                                                        onMouseEnter={e => {
                                                            if (estado)
                                                                e.currentTarget.style.background =
                                                                    comboBoxStyles.menu.item.editar.hover.background;
                                                        }}
                                                        onMouseLeave={e => {
                                                            if (estado)
                                                                e.currentTarget.style.background =
                                                                    comboBoxStyles.menu.item.editar.base.background;
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {/* Subir Contrato - solo para empleados activos */}
                                                    {estado && (
                                                        <button
                                                            onClick={() => onSubirContrato && onSubirContrato(r)}
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
                                                            Subir Contrato
                                                        </button>
                                                    )}

                                                    {/* Terminación Laboral - solo para empleados activos */}
                                                    {estado && (
                                                        <button
                                                            onClick={() => onTerminacionLaboral && onTerminacionLaboral(r)}
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
                                                            Terminación Laboral
                                                        </button>
                                                    )}

                                                    {/* Activar / Desactivar — ambos confirman */}
                                                    {estado ? (
                                                        <button
                                                            onClick={() => handleToggle(r)}
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
                                                            onClick={() => handleToggle(r)}
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
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                                No hay colaboradores
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Paginación con los mismos estilos */}
            {totalPaginas > 1 && (
                <div style={{ marginTop: "14px", textAlign: "center" }}>
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

export default EmpleadosTable;
