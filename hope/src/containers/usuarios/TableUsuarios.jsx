// components/usuarios/TableUsuarios.jsx
import React, { useState, useEffect, useRef } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import { buttonStyles } from "../../stylesGenerales/buttons";
import ModalConfirmacion from "./ModalConfirmacion";

const TableUsuarios = ({
    usuariosPaginados,
    handleEdit,
    handleDelete,
    handleActivate,
    idUsuarioLogueado,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    empleados,
    roles
}) => {
    const [menuAbierto, setMenuAbierto] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [modo, setModo] = useState("desactivar"); // "desactivar" o "activar"
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

    const abrirModal = (usuario, accion) => {
        setUsuarioSeleccionado(usuario);
        setModo(accion);
        setMostrarConfirmacion(true);
        setMenuAbierto(null); // cerrar menú
    };

    const confirmarAccion = () => {
        if (modo === "desactivar") {
            handleDelete(usuarioSeleccionado.idusuario);
        } else {
            handleActivate(usuarioSeleccionado.idusuario);
        }
        setMostrarConfirmacion(false);
    };

    // Función para obtener nombre del colaborador
    const obtenerNombreEmpleado = (idEmpleado) => {
        const empleado = empleados?.find(emp =>
            (emp.id || emp.idempleado || emp.idEmpleado) === idEmpleado
        );
        return empleado ? `${empleado.nombre} ${empleado.apellido}` : "Colaborador no encontrado";
    };

    // Función para obtener nombre del rol
    const obtenerNombreRol = (idRol) => {
        const rol = roles?.find(r => r.idrol === idRol);
        return rol ? rol.nombrerol : "Rol no encontrado";
    };

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
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Usuario</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Colaborador</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Rol</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuariosPaginados.length > 0 ? (
                        usuariosPaginados.map(usuario => (
                            <tr key={usuario.idusuario}>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {usuario.nombreusuario}
                                </td>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {obtenerNombreEmpleado(usuario.idempleado)}
                                </td>
                                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                    {obtenerNombreRol(usuario.idrol)}
                                </td>
                                <td
                                    style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: usuario.estado ? "green" : "red",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #f0f0f0"
                                    }}
                                >
                                    {usuario.estado ? "Activo" : "Inactivo"}
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
                                            onClick={() => toggleMenu(usuario.idusuario)}
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

                                        {menuAbierto === usuario.idusuario && (
                                            <div style={comboBoxStyles.menu.container}>
                                                <button
                                                    onClick={() => handleEdit(usuario)}
                                                    style={{
                                                        ...comboBoxStyles.menu.item.editar.base,
                                                        ...(usuario.estado
                                                            ? {}
                                                            : comboBoxStyles.menu.item.editar.disabled)
                                                    }}
                                                    onMouseEnter={e =>
                                                        usuario.estado &&
                                                        (e.currentTarget.style.background =
                                                            comboBoxStyles.menu.item.editar.hover.background)
                                                    }
                                                    onMouseLeave={e =>
                                                    (e.currentTarget.style.background =
                                                        comboBoxStyles.menu.item.editar.base.background)
                                                    }
                                                >
                                                    Cambiar contraseña
                                                </button>

                                                {/* Activar o Desactivar */}
                                                {usuario.estado ? (
                                                    <button
                                                        onClick={() => abrirModal(usuario, "desactivar")}
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
                                                        onClick={() => abrirModal(usuario, "activar")}
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
                            <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                                No hay usuarios registrados
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

            {/* Modal de confirmación */}
            <ModalConfirmacion
                mostrarConfirmacion={mostrarConfirmacion}
                setMostrarConfirmacion={setMostrarConfirmacion}
                usuarioSeleccionado={usuarioSeleccionado}
                confirmarDesactivacion={confirmarAccion}
                modo={modo}
            />
        </div>
    );
};

export default TableUsuarios;
