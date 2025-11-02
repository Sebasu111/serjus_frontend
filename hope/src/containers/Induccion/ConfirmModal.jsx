import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({ registro, onConfirm, onCancel, modo = "desactivar" }) => {
    const esActivar = modo === "activar";
    const titulo = esActivar ? "Confirmar activación" : "Confirmar desactivación";
    const mensaje = esActivar
        ? `¿Seguro que desea activar la inducción `
        : `¿Seguro que desea desactivar la inducción `;
    const botonColor = esActivar ? "#34D399" : "#FCA5A5";
    const botonTexto = esActivar ? "Sí, activar" : "Sí, desactivar";

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES");
    };

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
                <p style={ConfirmModalStyles.mensaje}>
                    {mensaje}
                    <strong>{registro?.nombre}</strong>?
                </p>
                <div style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    Desde: {formatDateForDisplay(registro?.fechainicio)}
                    <br />
                    Hasta: {registro?.fechafin ? formatDateForDisplay(registro.fechafin) : "Sin definir"}
                </div>
                <div style={ConfirmModalStyles.botonesContainer}>
                    <button onClick={onConfirm} style={{ ...ConfirmModalStyles.boton, background: botonColor }}>
                        {botonTexto}
                    </button>
                    <button onClick={onCancel} style={ConfirmModalStyles.botonCancelar}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;