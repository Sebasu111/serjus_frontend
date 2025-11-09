import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({
    title = "Confirmar acción",
    message = "¿Está seguro de realizar esta acción?",
    onConfirm,
    onCancel,
    actionType = "desactivar" // puede ser "activar", "desactivar", "eliminar", "finalizar"
}) => {
    // Configuración del botón principal según la acción
    const getButtonConfig = () => {
        switch (actionType) {
            case "activar":
                return { text: "Sí, Activar", color: "#86efac" };
            case "desactivar":
                return { text: "Sí, Desactivar", color: "#fca5a5" };
            case "eliminar":
                return { text: "Sí, Eliminar", color: "#dc2626" };
            case "finalizar":
                return { text: "Sí, Finalizar", color: "#f59e0b" };
            default:
                return { text: "Confirmar", color: "#fca5a5" };
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
                            color: actionType === "eliminar" ? "#fff" : "#000",
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
