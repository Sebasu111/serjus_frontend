import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ModalDeseleccion = ({ empleado, onConfirm, onCancel }) => {
    if (!empleado) return null; 

    const nombreEmpleado =
        empleado.nombre ||
        empleado.nombreempleado ||
        empleado.displayName ||
        empleado.nombres ||
        empleado.nombreCompleto ||
        "Empleado seleccionado";

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>Confirmar desasignación</h3>

                <p style={ConfirmModalStyles.mensaje}>
                    ¿Seguro que desea <strong>desasignar</strong> al colaborador{" "}
                    <strong>{nombreEmpleado}</strong> de esta inducción?
                </p>

                <div
                    style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "20px",
                        textAlign: "center",
                    }}
                >
                </div>

                <div style={ConfirmModalStyles.botonesContainer}>
                    <button
                        onClick={onConfirm}
                        style={{
                            ...ConfirmModalStyles.boton,
                            background: "#FCA5A5",
                            color: "#fff",
                            fontWeight: 600,
                        }}
                    >
                        Sí, desasignar
                    </button>
                    <button
                        onClick={onCancel}
                        style={ConfirmModalStyles.botonCancelar}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDeseleccion;
