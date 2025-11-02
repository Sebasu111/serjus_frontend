import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={ModalConfirmacionStyles.overlay} onClick={onCancel}>
      <div
        style={ModalConfirmacionStyles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={ModalConfirmacionStyles.titulo}>Confirmación</h3>
        <p style={ModalConfirmacionStyles.mensaje}>
          {message}
        </p>
        <div style={ModalConfirmacionStyles.botonesContainer}>
          <button
            onClick={onConfirm}
            style={{
              ...ModalConfirmacionStyles.boton,
              background: "#34D399",
              color: "#000000ff",
              cursor: "pointer",
            }}
          >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            style={{
              ...ModalConfirmacionStyles.botonCancelar,
              color: "#000",
              cursor: "pointer",
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
