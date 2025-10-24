// stylesGenerales/ModalConfirmacionStyles.js
const ModalConfirmacionStyles = {
    overlay: {
        paddingLeft: "250px",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000
    },
    modal: {
        background: "#fff",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "350px"
    },
    titulo: {
        marginBottom: "15px",
        color: "#000"
    },
    mensaje: {
        marginBottom: "25px",
        color: "#000"
    },
    botonesContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "15px"
    },
    boton: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    },
    botonCancelar: {
        background: "#d1d5db",
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};

export default ModalConfirmacionStyles;
