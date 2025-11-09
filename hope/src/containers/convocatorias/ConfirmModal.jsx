import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({ convocatoria, onConfirm, onCancel, modo = "cerrar" }) => {
  let titulo = "";
  let mensaje = "";
  let botonColor = "";
  let botonTexto = "";

  switch (modo) {
    case "reabrir":
      titulo = "Reabrir convocatoria";
      mensaje = "¿Desea volver a abrir la convocatoria ";
      botonColor = "#22c55e";
      botonTexto = "Sí, reabrir";
      break;

    case "limpiar":
      titulo = "Limpiar postulaciones";
      mensaje = "¿Está seguro de eliminar todas las postulaciones de la convocatoria ";
      botonColor = "#e11d48";
      botonTexto = "Sí, limpiar";
      break;

    default:
      titulo = "Cerrar convocatoria";
      mensaje = "¿Desea cerrar la convocatoria ";
      botonColor = "#f59e0b";
      botonTexto = "Sí, cerrar";
      break;
  }

  return (
    <div style={ConfirmModalStyles.overlay}>
      <div style={ConfirmModalStyles.modal}>
        <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
        <p style={ConfirmModalStyles.mensaje}>
          {mensaje}
          <strong>{convocatoria?.nombreconvocatoria}</strong>?
        </p>
        <div style={ConfirmModalStyles.botonesContainer}>
          <button
            onClick={onConfirm}
            style={{ ...ConfirmModalStyles.boton, background: botonColor }}
          >
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
