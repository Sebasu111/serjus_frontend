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
        width: "500px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10000,
        position: "relative" // 👈 IMPORTANTE
    },
    body: {
        flex: 1,
        overflowY: "auto",
        paddingRight: "10px",
        marginBottom: "10px"
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        borderTop: "1px solid #eee",
        paddingTop: "10px"
    },
    card: {
        background: "#fff",
        padding: "25px 15px 15px 15px", // 👈 más espacio arriba
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    deleteIcon: {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "#e63946", // rojo sólido
        border: "none",
        color: "#fff", // X blanca
        width: "28px",
        height: "28px",
        borderRadius: "6px", // cuadradito suave
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        transition: "0.2s"
    },
    inputPregunta: {
        width: "100%",
        marginBottom: "10px",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    textarea: {
        width: "100%",
        minHeight: "80px",
        marginBottom: "10px",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    opcionRow: {
        display: "flex",
        alignItems: "flex-start", // 👈 mejora cuando textarea crece
        gap: "8px",
        marginBottom: "10px"
    },
    inputOpcion: {
        flex: 1,
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #ccc"
    },
    dragging: {
        opacity: 0.5,
        border: "2px dashed #219ebc"
    },
    buttonPrimary: {
        background: "#023047",
        color: "#fff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "20px",
        cursor: "pointer",
        fontWeight: "500",
        transition: "0.2s"
    },

    buttonSecondary: {
        background: "#219ebc",
        color: "#ffffff",
        border: "none",
        padding: "8px 14px",
        borderRadius: "20px",
        cursor: "pointer",
        fontWeight: "500"
    },

    buttonDanger: {
        background: "#ffdddd",
        color: "#c1121f",
        border: "none",
        padding: "6px 10px",
        borderRadius: "20px",
        cursor: "pointer"
    },

    buttonGroup: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginTop: "10px"
    },

    textareaPregunta: {
        width: "100%",
        maxHeight: "120px",
        overflowY: "auto",
        resize: "none",
        padding: "8px",
        marginBottom: "12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        lineHeight: "1.4",
        textAlign: "justify" // 👈 AQUI
    },

    textareaOpcion: {
        flex: 1,
        minHeight: "40px",
        resize: "vertical",
        padding: "6px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontFamily: "inherit",
        textAlign: "justify" // 👈 AQUI
    },

    closeIcon: {
        position: "absolute",
        top: "15px",
        right: "15px",
        width: "28px",
        height: "28px",
        background: "transparent", // 👈 sin fondo
        border: "1px solid #ccc",
        color: "#555",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "0.2s"
    },

    headerForm: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginBottom: "15px",
        paddingBottom: "10px",
        borderBottom: "1px solid #eee"
    },

    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#555",
        marginBottom: "5px",
        display: "block"
    },

    selectContainer: {
        display: "flex",
        flexDirection: "column"
    },

    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        background: "#f9f9f9",
        cursor: "pointer",
        fontSize: "14px"
    },

    inputContainer: {
        display: "flex",
        flexDirection: "column"
    },

    inputTitulo: {
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "15px",
        fontWeight: "500",
        outline: "none",
        transition: "0.2s"
    },

    customSelect: {
        position: "relative",
        width: "100%"
    },

    selectInput: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "14px",
        outline: "none"
    },

    dropdown: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginTop: "5px",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    },

    option: {
        padding: "10px",
        cursor: "pointer",
        borderBottom: "1px solid #f0f0f0"
    },

    optionNuevo: {
        padding: "10px",
        cursor: "pointer",
        fontWeight: "600",
        color: "#219ebc",
        borderBottom: "1px solid #eee"
    },

    noResults: {
        padding: "10px",
        color: "#999",
        textAlign: "center"
    },
};


export default styles;