import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal";

const InduccionTable = ({
    items,
    handleEdit,
    handleDelete,
    handleActivate,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    formatDateForDisplay
}) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
    const [modoModal, setModoModal] = useState("desactivar"); // "desactivar" o "activar"

    const toggleMenu = id => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const abrirModal = (row, modo) => {
        setRegistroSeleccionado(row);
        setModoModal(modo);
        setModalOpen(true);
    };

    const calcularDuracion = (fechaInicio, fechaFin) => {
        if (!fechaInicio) return "-";
        if (!fechaFin) return "En progreso";
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    };

    return (
        <div
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
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Nombre</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Fecha Inicio</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Fecha Fin</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Duración</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? (
                        items.map(row => (
                            <tr key={row.idinduccion}>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {row.nombre}
                                </td>
                                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                    {formatDateForDisplay(row.fechainicio)}
                                </td>
                                <td style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #f0f0f0",
                                    color: row.fechafin ? "inherit" : "#999",
                                    fontStyle: row.fechafin ? "normal" : "italic"
                                }}>
                                    {row.fechafin ? formatDateForDisplay(row.fechafin) : "Sin definir"}
                                </td>
                                <td style={{
                                    padding: "10px",
                                    textAlign: "center",
                                    borderBottom: "1px solid #f0f0f0",
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
                                    {calcularDuracion(row.fechainicio, row.fechafin)}
                                </td>
                                <td
                                    style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: row.estado ? "green" : "red",
                                        fontWeight: "600",
                                        borderBottom: "1px solid #f0f0f0"
                                    }}
                                >
                                    {row.estado ? "Activo" : "Inactivo"}
                                </td>
                                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                                    <div style={comboBoxStyles.container}>
                                        <button
                                            style={comboBoxStyles.button.base}
                                            onClick={() => toggleMenu(row.idinduccion)}
                                        >
                                            Opciones ▾
                                        </button>
                                        {openMenuId === row.idinduccion && (
                                            <div style={comboBoxStyles.menu.container}>
                                                <div
                                                    style={{
                                                        ...comboBoxStyles.menu.item.editar.base,
                                                        ...(row.estado ? {} : comboBoxStyles.menu.item.editar.disabled)
                                                    }}
                                                    onClick={() => row.estado && handleEdit(row)}
                                                >
                                                    Editar
                                                </div>
                                                {row.estado ? (
                                                    <div
                                                        style={comboBoxStyles.menu.item.desactivar.base}
                                                        onClick={() => abrirModal(row, "desactivar")}
                                                    >
                                                        Desactivar
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={comboBoxStyles.menu.item.activar.base}
                                                        onClick={() => abrirModal(row, "activar")}
                                                    >
                                                        Activar
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                No hay registros
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
                                cursor: "pointer"
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {modalOpen && (
                <ConfirmModal
                    registro={registroSeleccionado}
                    modo={modoModal}
                    onConfirm={() => {
                        if (modoModal === "desactivar") handleDelete(registroSeleccionado);
                        else handleActivate(registroSeleccionado.idinduccion);
                        setModalOpen(false);
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default InduccionTable;