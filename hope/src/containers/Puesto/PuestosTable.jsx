import React, { useState, useEffect, useRef } from "react";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const PuestosTable = ({ puestos, onAsignarSalario, paginaActual, setPaginaActual, totalPaginas }) => {
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
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                            Nombre del Puesto
                        </th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                            Descripción
                        </th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "right" }}>
                            Salario Base
                        </th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                            Acciones
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {puestos.length > 0 ? (
                        puestos.map(puesto => (
                            <tr key={puesto.idpuesto}>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {puesto.nombrepuesto}
                                </td>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {puesto.descripcion}
                                </td>
                                <td
                                    style={{
                                        padding: "10px",
                                        textAlign: "right",
                                        borderBottom: "1px solid #f0f0f0"
                                    }}
                                >
                                    Q{parseFloat(puesto.salariobase).toFixed(2)}
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
                                            onClick={() => toggleMenu(puesto.idpuesto)}
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

                                        {menuAbierto === puesto.idpuesto && (
                                            <div style={comboBoxStyles.menu.container}>
                                                {/* Asignar Salario */}
                                                <button
                                                    onClick={() => onAsignarSalario(puesto)}
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
                                                    Asignar Salario
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                                No hay puestos registrados
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

export default PuestosTable;
