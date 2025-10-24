import React from "react";
//   mismo style object que usa Idiomas
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

/**
 * Modal de confirmación para Empleados.
 * Soporta activar y desactivar (igual que Idiomas).
 * mode: "activar" | "desactivar"
 */
const ConfirmModal = ({ empleado, mode = "desactivar", onConfirm, onCancel }) => {
    const isActivar = mode === "activar";
    const titulo = isActivar ? "Confirmar activación" : "Confirmar desactivación";
    const textoAccion = isActivar ? "activar" : "desactivar";

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
                <p style={ConfirmModalStyles.mensaje}>
                    ¿Seguro que desea {textoAccion} al empleado{" "}
                    <strong>
                        {empleado?.nombre} {empleado?.apellido}
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
