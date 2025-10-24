import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const ConvocatoriasTable = ({
    mensaje,
    paginadas,
    busqueda,
    setBusqueda,
    paginaActual,
    setPaginaActual,
    elementosPorPagina,
    setElementosPorPagina,
    totalPaginas,
    handleEdit,
    toggleEstado,
    setMostrarFormulario
}) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const openModal = (descripcion) => {
        setDescripcionSeleccionada(descripcion);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setDescripcionSeleccionada("");
    };

    const tdCenter = {
        padding: 10,
        borderBottom: "1px solid #f0f0f0",
        textAlign: "center",
        whiteSpace: "nowrap",
    };

    const tdCenterLongText = {
        padding: 10,
        borderBottom: "1px solid #f0f0f0",
        textAlign: "center",
        maxWidth: 250,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        color: "#007bff"
    };

    const btnPrimary = {
        padding: 10,
        background: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        marginTop: 12
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
                Convocatorias Registradas
            </h2>

            {mensaje && (
                <p
                    style={{
                        textAlign: "center",
                        color: mensaje.includes("Error") ? "red" : "green",
                        fontWeight: "bold",
                    }}
                >
                    {mensaje}
                </p>
            )}

            {/* Buscador */}
            <div style={{ display: "flex", marginBottom: 15 }}>
                <input
                    placeholder="Buscar convocatoria..."
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                    }}
                    style={{
                        flex: 1,
                        padding: 10,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        marginRight: 10,
                    }}
                />
                <input
                    type="number"
                    min="1"
                    value={elementosPorPagina}
                    onChange={(e) =>
                        setElementosPorPagina(
                            Number(e.target.value) > 0 ? Number(e.target.value) : 1
                        )
                    }
                    style={{
                        width: 80,
                        padding: 10,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        textAlign: "center",
                    }}
                />
            </div>

            {/* Tabla */}
            <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "20px 30px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["Nombre", "Descripción", "Inicio", "Fin", "Estado", "Acciones"].map(h => (
                                <th key={h} style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginadas.length ? paginadas.map(r => (
                            <tr key={r.idconvocatoria}>
                                {/* Nombre completo */}
                                <td style={{ padding: 10, borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
                                    {r.nombreconvocatoria}
                                </td>

                                {/* Descripción truncada con modal */}
                                <td
                                    style={tdCenterLongText}
                                    onClick={() => openModal(r.descripcion)}
                                >
                                    {r.descripcion.length > 50
                                        ? r.descripcion.substring(0, 50) + "..."
                                        : r.descripcion
                                    }
                                </td>

                                <td style={tdCenter}>
                                    {new Date(r.fechainicio).toLocaleDateString("es-ES")}
                                </td>
                                <td style={tdCenter}>
                                    {r.fechafin
                                        ? new Date(r.fechafin).toLocaleDateString("es-ES")
                                        : "-"
                                    }
                                </td>
                                <td style={{ ...tdCenter, color: r.estado ? "green" : "red" }}>
                                    {r.estado ? "Activa" : "Inactiva"}
                                </td>
                                <td style={{ padding: 10, textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                    <div style={comboBoxStyles.container}>
                                        <button
                                            onClick={() => toggleMenu(r.idconvocatoria)}
                                            style={{
                                                ...comboBoxStyles.button.base,
                                                cursor: "pointer",
                                            }}
                                        >
                                            Opciones ▾
                                        </button>

                                        {openMenuId === r.idconvocatoria && (
                                            <div style={comboBoxStyles.menu.container}>
                                                <div
                                                    onClick={() => handleEdit(r)}
                                                    style={comboBoxStyles.menu.item.editar.base}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.background = comboBoxStyles.menu.item.editar.hover.background)
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.background = comboBoxStyles.menu.item.editar.base.background)
                                                    }
                                                >
                                                    Editar
                                                </div>
                                                {r.estado ? (
                                                    <div
                                                        onClick={() => toggleEstado(r, false)}
                                                        style={comboBoxStyles.menu.item.desactivar.base}
                                                        onMouseEnter={(e) =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.desactivar.hover.background)
                                                        }
                                                        onMouseLeave={(e) =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.desactivar.base.background)
                                                        }
                                                    >
                                                        Desactivar
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={() => toggleEstado(r, true)}
                                                        style={comboBoxStyles.menu.item.activar.base}
                                                        onMouseEnter={(e) =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.activar.hover.background)
                                                        }
                                                        onMouseLeave={(e) =>
                                                            (e.currentTarget.style.background =
                                                                comboBoxStyles.menu.item.activar.base.background)
                                                        }
                                                    >
                                                        Activar
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>Sin registros</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Paginación */}
                {totalPaginas > 1 && (
                    <div style={{ marginTop: 20, textAlign: "center" }}>
                        {Array.from({ length: totalPaginas }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setPaginaActual(i + 1)}
                                style={{
                                    margin: "0 5px",
                                    padding: "6px 12px",
                                    borderRadius: 5,
                                    border: "1px solid #007bff",
                                    background: paginaActual === i + 1 ? "#007bff" : "#fff",
                                    color: paginaActual === i + 1 ? "#fff" : "#007bff",
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={() => setMostrarFormulario(true)} style={btnPrimary}>
                Nueva Convocatoria
            </button>

            {/* Modal */}
            {modalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "#fff",
                        padding: 20,
                        borderRadius: 8,
                        maxWidth: "500px",
                        width: "90%",
                        maxHeight: "80%",
                        overflowY: "auto",
                        position: "relative"
                    }}>
                        <h3>Descripción completa</h3>
                        <p>{descripcionSeleccionada}</p>
                        <button onClick={closeModal} style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            background: "red",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 8px",
                            cursor: "pointer"
                        }}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConvocatoriasTable;
