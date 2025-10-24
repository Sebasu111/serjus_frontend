// components/usuarios/ModalConfirmacion.jsx
import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";

const ModalConfirmacion = ({
    usuarioSeleccionado,
    mostrarConfirmacion,
    setMostrarConfirmacion,
    confirmarDesactivacion,
    modo = "desactivar"
}) => {
    if (!mostrarConfirmacion) return null;

    const esActivar = modo === "activar";
    const titulo = esActivar ? "Confirmar activación" : "Confirmar desactivación";
    const mensaje = esActivar
        ? "¿Seguro que   desea activar al usuario "
        : "¿Seguro que   desea desactivar al usuario ";
    const botonColor = esActivar ? "#34D399" : "#FCA5A5";
    const botonTexto = esActivar ? "Sí, activar" : "Sí, desactivar";

    return (
        <div style={ModalConfirmacionStyles.overlay}>
            <div style={ModalConfirmacionStyles.modal}>
                <h3 style={ModalConfirmacionStyles.titulo}>{titulo}</h3>
                <p style={ModalConfirmacionStyles.mensaje}>
                    {mensaje}
                    <strong>{usuarioSeleccionado?.nombreusuario}</strong>?
                </p>
                <div style={ModalConfirmacionStyles.botonesContainer}>
                    <button
                        onClick={confirmarDesactivacion}
                        style={{
                            ...ModalConfirmacionStyles.boton,
                            background: botonColor,
                            color: "#000",
                            cursor: "pointer"
                        }}
                    >
                        {botonTexto}
                    </button>
                    <button
                        onClick={() => setMostrarConfirmacion(false)}
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

export default ModalConfirmacion;
