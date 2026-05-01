const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10000
    },
    modal: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        width: "600px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative"
    },
    body: {
        flex: 1,
        overflowY: "auto",
        marginTop: "10px",
        paddingRight: "10px"
    },
    card: {
        background: "#f9f9f9",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
        cursor: "pointer"
    },
    pregunta: {
        fontWeight: "600",
        marginBottom: "5px"
    },
    respuesta: {
        background: "#eef2f7",
        padding: "8px",
        borderRadius: "6px"
    },
    closeIcon: {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "28px",
        height: "28px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        cursor: "pointer",
        background: "transparent"
    },
    backButton: {
        marginBottom: "10px",
        background: "#219ebc",
        color: "#fff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer"
    }
};

export default styles;