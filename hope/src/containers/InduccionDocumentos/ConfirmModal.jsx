import React from "react";
import ConfirmModalStyles from "../../stylesGenerales/ConfirmModalStyles";

const ConfirmModal = ({ registro, onConfirm, onCancel, tipo = "asignación de documento", getNombreInduccion }) => {
    const titulo = `Confirmar desactivación`;
    const mensaje = `¿Seguro que desea desactivar esta ${tipo}`;
    const botonColor = "#FCA5A5";
    const botonTexto = "Sí, desactivar";

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES");
    };

    const getDescripcionAsignacion = () => {
        if (!registro) return "";

        const induccion = getNombreInduccion ? getNombreInduccion(registro.idinduccion) : `Inducción ID: ${registro.idinduccion}`;
        const empleados = registro.empleados && registro.empleados.length > 0
            ? `${registro.empleados.length} empleado(s)`
            : "Sin empleados asignados";

        return `${induccion} - ${empleados}`;
    };

    return (
        <div style={ConfirmModalStyles.overlay}>
            <div style={ConfirmModalStyles.modal}>
                <h3 style={ConfirmModalStyles.titulo}>{titulo}</h3>
                <p style={ConfirmModalStyles.mensaje}>
                    {mensaje}
                    <strong>{getDescripcionAsignacion()}</strong>?
                </p>
                <div style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    Fecha asignado: {formatDateForDisplay(registro?.fechaasignado)}
                    {registro?.documento_pdf_nombre && (
                        <><br />Documento: {registro.documento_pdf_nombre}</>
                    )}
                </div>
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