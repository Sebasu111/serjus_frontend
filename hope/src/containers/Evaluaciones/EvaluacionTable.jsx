import React, { useEffect, useRef, useState } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};

const getId = o => pick(o, "id", "idevaluacion", "idEvaluacion", "idempleado", "idEmpleado", "idpostulacion", "idPostulacion");

const getEmpleadoLabel = (id, empleados = []) => {
    if (!id) return "";
    const found = empleados.find(x => String(getId(x)) === String(id));
    if (found) return `${found.nombre || ""} ${found.apellido || ""}`.trim();
    return `#${id}`;
};

const getPostulacionLabel = (id, postulaciones = []) => {
    if (!id) return "";
    const found = postulaciones.find(x => String(getId(x)) === String(id));
    return found?.observacion || `Postulación #${id}`;
};

const toDMY = value => {
    if (!value) return "—";
    const ymd = String(value).slice(0, 10);
    const [yyyy, mm, dd] = ymd.split("-");
    if (!yyyy || !mm || !dd) return value;
    return `${dd}-${mm}-${yyyy}`;
};

const thStyle = { borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" };
const tdBase = { padding: "10px", borderBottom: "1px solid #f0f0f0", verticalAlign: "middle", fontSize: 14 };

const EvaluacionTable = ({
    evaluaciones,
    handleEdit,
    handleToggle,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    empleados = [],
    postulaciones = [],
    onVerDetalle
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
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Evaluado</th>
                        <th style={thStyle}>Modalidad</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Fecha Evaluación</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Puntaje</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Estado</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(evaluaciones) && evaluaciones.length ? (
                        evaluaciones.map(r => {
                            const estado = !!r.estado;
                            const evaluadoLabel = r.idempleado
                                ? getEmpleadoLabel(r.idempleado, empleados)
                                : getPostulacionLabel(r.idpostulacion, postulaciones);

                            return (
                                <tr key={getId(r)}>
                                    {/* ID como link para ver detalle */}
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
                                            #{getId(r)}
                                        </button>
                                    </td>

                                    <td style={tdBase}>{evaluadoLabel}</td>
                                    <td style={tdBase}>{r.modalidad}</td>
                                    <td style={{ ...tdBase, textAlign: "center" }}>{toDMY(r.fechaevaluacion)}</td>
                                    <td style={{
                                        ...tdBase,
                                        textAlign: "center",
                                        fontWeight: 600,
                                        color: r.puntajetotal >= 70 ? "#059669" : r.puntajetotal >= 60 ? "#d97706" : "#dc2626"
                                    }}>
                                        {r.puntajetotal}
                                    </td>
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

                                    {/* Acciones con el mismo combobox de otros módulos */}
                                    <td style={{ ...tdBase, textAlign: "center", position: "relative" }}>
                                        <div style={comboBoxStyles.container}>
                                            <button
                                                onClick={() => toggleMenu(getId(r))}
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

                                            {menuAbierto === getId(r) && (
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

                                                    {/* Activar/Desactivar */}
                                                    <button
                                                        onClick={() => handleToggle(r)}
                                                        style={
                                                            estado
                                                                ? comboBoxStyles.menu.item.eliminar.base
                                                                : comboBoxStyles.menu.item.activar.base
                                                        }
                                                        onMouseEnter={e =>
                                                        (e.currentTarget.style.background = estado
                                                            ? comboBoxStyles.menu.item.eliminar.hover.background
                                                            : comboBoxStyles.menu.item.activar.hover.background)
                                                        }
                                                        onMouseLeave={e =>
                                                        (e.currentTarget.style.background = estado
                                                            ? comboBoxStyles.menu.item.eliminar.base.background
                                                            : comboBoxStyles.menu.item.activar.base.background)
                                                        }
                                                    >
                                                        {estado ? "Desactivar" : "Activar"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ ...tdBase, textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
                                No hay evaluaciones registradas
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                    <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        style={{
                            ...buttonStyles.navegacion,
                            opacity: paginaActual === 1 ? 0.5 : 1,
                            cursor: paginaActual === 1 ? "not-allowed" : "pointer"
                        }}
                    >
                        « Anterior
                    </button>

                    <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: "500" }}>
                        Página {paginaActual} de {totalPaginas}
                    </span>

                    <button
                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                        disabled={paginaActual === totalPaginas}
                        style={{
                            ...buttonStyles.navegacion,
                            opacity: paginaActual === totalPaginas ? 0.5 : 1,
                            cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer"
                        }}
                    >
                        Siguiente »
                    </button>
                </div>
            )}
        </div>
    );
};

export default EvaluacionTable;