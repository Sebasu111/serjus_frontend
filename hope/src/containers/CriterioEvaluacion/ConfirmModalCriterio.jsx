import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModalCriterio = ({ criterio, onConfirm, onCancel, modo = "desactivar" }) => {
    const esActivar = modo === "activar";
    const titulo = esActivar ? "Confirmar activación" : "Confirmar desactivación";
    const mensaje = esActivar
        ? `¿Seguro que desea activar el criterio `
        : `¿Seguro que desea desactivar el criterio `;
    const botonColor = esActivar ? "#34D399" : "#FCA5A5";
    const botonTexto = esActivar ? "Sí, activar" : "Sí, desactivar";

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>

                <p style={ConfirmModalStyles.mensaje}>
                    {mensaje}
                    <strong>{criterio?.nombrecriterio}</strong>?
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

export default ConfirmModalCriterio;
