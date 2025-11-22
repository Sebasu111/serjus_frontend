import React, { useEffect, useRef, useState, useMemo } from "react";
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
    handleToggle,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    equipos = [],
    onVerDetalle,
    onTerminacionLaboral,
    onSubirContrato
}) => {

    const [menuAbierto, setMenuAbierto] = useState(null);
    const containerRef = useRef(null);

    // Obtener usuario logueado desde localStorage
    const usuarioStr = localStorage.getItem("usuarioLogueado");
    let usuario = null;
    try { usuario = usuarioStr ? JSON.parse(usuarioStr) : null; } catch { usuario = null; }

    /** 🔥 FILTRAR EMPLEADOS SEGÚN EL ROL */
    const empleadosFiltrados = useMemo(() => {
        if (!usuario || !empleados?.length) return empleados;

        let filtrados = [];

        // 👑 Admin → ve todos
        if (usuario.idrol === 5) {
            filtrados = empleados;
        }

        // 🧑‍💼 Coordinador → solo ve empleados de su equipo (incluyéndose a sí mismo)
        else if (usuario.idrol === 1) {
            const equipoAsignado = equipos.find(
                eq => Number(eq.idcoordinador) === Number(usuario.idempleado)
            );
            const idEquipoUsuario = equipoAsignado?.idequipo;

            if (!idEquipoUsuario) return []; // Coordinador sin equipo

            filtrados = empleados.filter(
                e => Number(e.idequipo) === Number(idEquipoUsuario)
            );
        }

        // 🟢 Secretaría u otros roles → ven todo
        else {
            filtrados = empleados;
        }

        return filtrados;
    }, [usuario, empleados, equipos]);


    useEffect(() => {
        const handleClickOutside = event => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setMenuAbierto(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("click", handleClickOutside);
        };
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
                    {Array.isArray(empleadosFiltrados) && empleadosFiltrados.length ? (
                        empleadosFiltrados.map(r => {
                            const estado = !!r.estado;
                            const equipoLabel = labelEquipoFrom(r.idequipo, equipos);

                            return (
                                <tr key={r.id || r.idempleado || r.idEmpleado}>
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

                                    <td style={{ ...tdBase, textAlign: "center", position: "relative" }}>
                                        <div style={comboBoxStyles.container}>
                                            <button
                                                onClick={() => toggleMenu(r.id || r.idempleado || r.idEmpleado)}
                                                style={comboBoxStyles.button.base}
                                            >
                                                Opciones ▾
                                            </button>

                                            {menuAbierto === (r.id || r.idempleado || r.idEmpleado) && (
                                                <div style={comboBoxStyles.menu.container}>
                                                    <button
                                                        onClick={() => handleEdit(r)}
                                                        disabled={!estado}
                                                        style={{
                                                            ...comboBoxStyles.menu.item.editar.base,
                                                            ...(estado ? {} : comboBoxStyles.menu.item.editar.disabled)
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {estado && (
                                                        <button
                                                            onClick={() => onSubirContrato && onSubirContrato(r)}
                                                            style={comboBoxStyles.menu.item.editar.base}
                                                        >
                                                            Subir Contrato
                                                        </button>
                                                    )}

                                                    {estado && r.contrato && (
                                                        <button
                                                            onClick={() => onTerminacionLaboral && onTerminacionLaboral(r)}
                                                            style={comboBoxStyles.menu.item.editar.base}
                                                        >
                                                            Terminación Laboral
                                                        </button>
                                                    )}

                                                    {estado ? (
                                                        <button
                                                            onClick={() => handleToggle(r)}
                                                            style={comboBoxStyles.menu.item.desactivar.base}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleToggle(r)}
                                                            style={comboBoxStyles.menu.item.activar.base}
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
