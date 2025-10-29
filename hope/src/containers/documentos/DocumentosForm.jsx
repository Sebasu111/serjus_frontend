import React from "react";
import Select from "react-select";
import { X } from "lucide-react";

const DocumentosForm = ({
    form,
    handleSubmit,
    editingId,
    setMostrarFormulario,
    setMostrarModalEliminar,
    setDocumentoAEliminar
}) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "420px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px"
            }}
        >
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
                ¿Desea eliminar el archivo?
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                {editingId && form.nombrearchivo && (
                    <button
                        type="button"
                        onClick={() => {
                            setDocumentoAEliminar(editingId);
                            setMostrarModalEliminar(true);
                        }}
                        style={{
                            marginTop: "10px",
                            background: "#FCA5A5",
                            color: "#000000ff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            width: "100%"
                        }}
                    >
                        Eliminar archivo actual
                    </button>
                )}
            </form>

            <button
                onClick={() => {
                    setMostrarFormulario(false);
                }}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                }}
                title="Cerrar"
            >
                <X size={24} color="#555" />
            </button>
        </div>
    );
}; export default DocumentosForm;
