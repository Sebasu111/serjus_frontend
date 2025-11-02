import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";
import axios from "axios";
import { showToast } from "../../utils/toast";

const API = "http://127.0.0.1:8000/api";

const ModalEliminarAspirante = ({
  aspiranteSeleccionado,
  mostrarModal,
  setMostrarModal,
  setAspirantes,
}) => {
  if (!mostrarModal || !aspiranteSeleccionado) return null;

  const handleEliminar = async () => {
  try {
    await axios.delete(`${API}/aspirantes/${aspiranteSeleccionado.idaspirante}/`);

    showToast(`Aspirante ${aspiranteSeleccionado.nombreaspirante} eliminado correctamente.`, "success");

    // 🔹 Actualización inmediata del frontend
    if (setAspirantes) {
      setAspirantes(prev =>
        prev.filter(a => a.idaspirante !== aspiranteSeleccionado.idaspirante)
      );
    }

    setMostrarModal(false);
  } catch (err) {
    showToast("Error al eliminar el aspirante.", "error");
  }
};

  return (
    <div style={ModalConfirmacionStyles.overlay}>
      <div style={ModalConfirmacionStyles.modal}>
        <h3 style={ModalConfirmacionStyles.titulo}>Confirmar eliminación</h3>
        <p style={ModalConfirmacionStyles.mensaje}>
          ¿Seguro que deseas eliminar al aspirante{" "}
          <strong>
            {aspiranteSeleccionado.nombreaspirante} {aspiranteSeleccionado.apellidoaspirante}
          </strong>
          ? <br />Se eliminarán también sus postulaciones y documentos.
        </p>

        <div style={ModalConfirmacionStyles.botonesContainer}>
          <button
            onClick={handleEliminar}
            style={{
              ...ModalConfirmacionStyles.boton,
              background: "#F87171",
              color: "#000",
              cursor: "pointer",
            }}
          >
            Sí, eliminar
          </button>

          <button
            onClick={() => setMostrarModal(false)}
            style={{
              ...ModalConfirmacionStyles.botonCancelar,
              color: "#000",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarAspirante;
