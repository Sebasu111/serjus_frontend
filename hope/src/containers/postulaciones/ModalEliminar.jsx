import React from "react";
import ModalConfirmacionStyles from "../../stylesGenerales/ConfirmModalStyles";
import axios from "axios";
import { showToast } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const ModalEliminarPostulacion = ({
  postulacionSeleccionada,
  mostrarModal,
  setMostrarModal,
  setPostulaciones,
}) => {
  if (!mostrarModal || !postulacionSeleccionada) return null;

  const handleEliminar = async () => {
    try {
      await axios.delete(`${API}/postulaciones/${postulacionSeleccionada.idpostulacion}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

      showToast("Postulación eliminada correctamente.", "success");

      setPostulaciones((prev) =>
        prev.filter((p) => p.idpostulacion !== postulacionSeleccionada.idpostulacion)
      );

      setMostrarModal(false);

    } catch (err) {
      console.error("Error al eliminar:", err.response?.data || err);
      showToast("Error al eliminar. La postulación tiene datos dependientes.", "error");
    }
  };

  return (
    <div style={ModalConfirmacionStyles.overlay}>
      <div style={ModalConfirmacionStyles.modal}>
        <h3 style={ModalConfirmacionStyles.titulo}>Confirmar eliminación</h3>

        <p style={ModalConfirmacionStyles.mensaje}>
          ¿Seguro que desea eliminar la postulación de{" "}
          <strong>
            {postulacionSeleccionada.aspiranteData?.nombreaspirante}{" "}
            {postulacionSeleccionada.aspiranteData?.apellidoaspirante}
          </strong>
          ?<br />
          Esta acción no se puede deshacer.
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

export default ModalEliminarPostulacion;
