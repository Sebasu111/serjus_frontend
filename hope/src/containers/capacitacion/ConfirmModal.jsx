import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({
    title = "Confirmar acción",
    message = "¿Está seguro de realizar esta acción?",
    onConfirm,
    onCancel,
    actionType = "desactivar" // puede ser "activar", "desactivar" o "finalizar"
}) => {
    // Configuración del botón principal según la acción
    const getButtonConfig = () => {
        switch (actionType) {
            case "activar":
                return {
                    text: "Sí, Activar",
                    color: "#86efac" // verde claro
                };
            case "finalizar":
                return {
                    text: "Sí, Finalizar",
                    color: "#fbbf24" // amarillo
                };
            case "desactivar":
            default:
                return {
                    text: "Sí, Desactivar",
                    color: "#fca5a5" // rojo claro
                };
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <div style={ModalConfirmacionStyles.overlay}>
            <div style={ModalConfirmacionStyles.modal}>
                <h3 style={ModalConfirmacionStyles.titulo}>{title}</h3>
                <p style={ModalConfirmacionStyles.mensaje}>{message}</p>

                <div style={ModalConfirmacionStyles.botonesContainer}>
                    <button
                        onClick={onConfirm}
                        style={{
                            ...ModalConfirmacionStyles.boton,
                            background: buttonConfig.color,
                            color: "#000",
                            fontWeight: "600"
                        }}
                    >
                        {buttonConfig.text}
                    </button>

                    <button
                        onClick={onCancel}
                        style={{
                            ...ModalConfirmacionStyles.botonCancelar,
                            color: "#000",
                            fontWeight: "600"
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
