import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ModalEliminarArchivo = ({
    mostrarModalEliminar,
    setMostrarModalEliminar,
    documentoAEliminar,
    handleDelete
}) => {
    if (!mostrarModalEliminar) return null;

    return (
        <div style={ModalConfirmacionStyles.overlay}>
            <div style={ModalConfirmacionStyles.modal}>
                <h3 style={ModalConfirmacionStyles.titulo}>Confirmar eliminación</h3>
                <p style={ModalConfirmacionStyles.mensaje}>
                    ¿Está seguro que desea eliminar este documento?
                    <br />
                    <small>Esta acción marcará el documento como eliminado y no se podrá deshacer.</small>
                </p>
                <div style={ModalConfirmacionStyles.botonesContainer}>
                    <button
                        onClick={async () => {
                            await handleDelete(documentoAEliminar);
                            setMostrarModalEliminar(false);
                        }}
                        style={{
                            ...ModalConfirmacionStyles.boton,
                            background: "#FCA5A5",
                            color: "#000",
                            cursor: "pointer"
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button
                        onClick={() => setMostrarModalEliminar(false)}
                        style={{
                            ...ModalConfirmacionStyles.botonCancelar,
                            color: "#000",
                            cursor: "pointer"
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalEliminarArchivo;
