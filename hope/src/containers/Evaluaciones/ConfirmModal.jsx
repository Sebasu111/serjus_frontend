import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const getId = (obj) => {
    if (!obj) return "";
    return obj.id || obj.idevaluacion || obj.idEvaluacion || "";
};

/**
 * Modal de confirmación para Evaluaciones.
 * Soporta activar y desactivar.
 * mode: "activar" | "desactivar"
 */
const ConfirmModal = ({ evaluacion, mode = "desactivar", onConfirm, onCancel }) => {
    const isActivar = mode === "activar";
    const titulo = isActivar ? "Confirmar activación" : "Confirmar desactivación";
    const textoAccion = isActivar ? "activar" : "desactivar";

    const evaluacionId = getId(evaluacion);

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
                <p style={ConfirmModalStyles.mensaje}>
                    ¿Seguro que desea {textoAccion} la evaluación{" "}
                    <strong>
                        #{evaluacionId}
                    </strong>
                    ?
                </p>
                <div style={ConfirmModalStyles.botonesContainer}>
                    <button
                        onClick={onConfirm}
                        style={{
                            ...ConfirmModalStyles.boton,
                            background: isActivar ? "#86efac" : "#FCA5A5",
                            color: "#111827"
                        }}
                    >
                        Sí, {isActivar ? "activar" : "desactivar"}
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