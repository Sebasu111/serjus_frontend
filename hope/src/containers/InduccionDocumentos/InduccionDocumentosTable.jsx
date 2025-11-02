import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal";

const InduccionDocumentosTable = ({
    items,
    handleEdit,
    handleDelete,
    handleActivate,
    paginaActual,
    totalPaginas,
    setPaginaActual,
    formatDateForDisplay,
    getNombreInduccion
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

    const formatearEmpleados = (empleados) => {
        if (!empleados || empleados.length === 0) return "Sin asignar";
        if (empleados.length === 1) {
            const emp = empleados[0];
            return `${emp.primernombre} ${emp.primerapellido}`;
        }
        return `${empleados.length} empleados`;
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
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Inducción</th>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Documento PDF</th>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Empleados</th>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Fecha Asignado</th>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map(row => {
                                return (
                                    <tr key={row.idinducciondocumento}>
                                        <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                                            {getNombreInduccion(row.idinduccion)}
                                        </td>
                                        <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                                            {row.documento_pdf_nombre ? (
                                                <span style={{
                                                    color: "#dc3545",
                                                    fontWeight: "500"
                                                }}>
                                                    📄 {row.documento_pdf_nombre}
                                                </span>
                                            ) : (
                                                <span style={{ color: "#6c757d" }}>Sin documento</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0", fontSize: "13px" }}>
                                            <div title={row.empleados?.map(emp => `${emp.primernombre} ${emp.primerapellido}`).join(', ')}>
                                                {formatearEmpleados(row.empleados)}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: "10px",
                                            textAlign: "center",
                                            borderBottom: "1px solid #f0f0f0",
                                            fontSize: "13px"
                                        }}>
                                            {formatDateForDisplay(row.fechaasignado)}
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
                                                    onClick={() => toggleMenu(row.idinducciondocumento)}
                                                >
                                                    Opciones ▾
                                                </button>
                                                {openMenuId === row.idinducciondocumento && (
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
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                    No hay registros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        else handleActivate(registroSeleccionado.idinducciondocumento);
                        setModalOpen(false);
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default InduccionDocumentosTable;