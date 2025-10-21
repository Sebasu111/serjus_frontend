import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({
  title = "Confirmar acción",
  message = "¿Estás seguro de realizar esta acción?",
  onConfirm,
  onCancel,
  actionType = "desactivar", // puede ser "activar" o "desactivar"
}) => {
  // Configuración del botón principal según la acción
  const isActivate = actionType === "activar";
  const confirmButtonText = isActivate ? "Sí, Activar" : "Sí, Desactivar";
  const confirmButtonColor = isActivate ? "#86efac" : "#fca5a5"; // verde claro / rojo claro

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
              background: confirmButtonColor,
              color: "#000",
              fontWeight: "600",
            }}
          >
            {confirmButtonText}
          </button>

          <button
            onClick={onCancel}
            style={{
              ...ModalConfirmacionStyles.botonCancelar,
              color: "#000",
              fontWeight: "600",
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
