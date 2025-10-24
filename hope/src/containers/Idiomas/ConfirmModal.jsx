import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({ idioma, onConfirm, onCancel, modo = "desactivar" }) => {
    const esActivar = modo === "activar";
    const titulo = esActivar ? "Confirmar activación" : "Confirmar desactivación";
    const mensaje = esActivar ? `¿Seguro que   desea activar el idioma ` : `¿Seguro que   desea desactivar el idioma `;
    const botonColor = esActivar ? "#34D399" : "#FCA5A5";
    const botonTexto = esActivar ? "Sí, activar" : "Sí, desactivar";

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
                <p style={ConfirmModalStyles.mensaje}>
                    {mensaje}
                    <strong>{idioma?.nombreidioma}</strong>?
                </p>
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
