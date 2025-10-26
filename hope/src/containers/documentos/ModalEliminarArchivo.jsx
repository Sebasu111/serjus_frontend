import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ModalEliminarArchivo = ({
    mostrarModalEliminar,
    setMostrarModalEliminar,
    documentoAEliminar,
    handleDeleteArchivo
}) => {
    if (!mostrarModalEliminar) return null;

    return (
        <div style={ModalConfirmacionStyles.overlay}>
            <div style={ModalConfirmacionStyles.modal}>
                <h3 style={ModalConfirmacionStyles.titulo}>Confirmar eliminación</h3>
                <p style={ModalConfirmacionStyles.mensaje}>
                    ¿Está seguro que desea eliminar el archivo actual?
                    <br />
                    <small>Esta acción eliminará el archivo asociado al documento, pero conservará el registro.</small>
                </p>
                <div style={ModalConfirmacionStyles.botonesContainer}>
                    <button
                        onClick={async () => {
                            await handleDeleteArchivo(documentoAEliminar);
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
