import React from "react";

const ModalEliminarArchivo = ({
    mostrarModalEliminar,
    setMostrarModalEliminar,
    documentoAEliminar,
    handleDeleteArchivo,
}) => {
    if (!mostrarModalEliminar) return null;

    return (
        <div
            style={{
                paddingLeft: "225px",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    width: "400px",
                    textAlign: "center",
                    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                }}
            >
                <h3 style={{ marginBottom: "15px" }}>¿Eliminar el archivo actual?</h3>
                <p style={{ color: "#555", marginBottom: "20px" }}>
                    Esta acción eliminará el archivo asociado al documento, pero
                    conservará el registro.
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <button
                        onClick={async () => {
                            await handleDeleteArchivo(documentoAEliminar);
                            setMostrarModalEliminar(false);
                        }}
                        style={{
                            background: "#FED7AA",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 20px",
                            cursor: "pointer",
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button
                        onClick={() => setMostrarModalEliminar(false)}
                        style={{
                            background: "#ccc",
                            color: "#333",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 20px",
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

export default ModalEliminarArchivo;
