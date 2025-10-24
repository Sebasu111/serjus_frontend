import React from "react";
import { X } from "lucide-react";

const IdiomaForm = ({ nombreIdioma, setNombreIdioma, idiomaActivoEditando, editingId, handleSubmit, onClose }) => {
    const handleNombreChange = e => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;
        if (regex.test(e.target.value)) {
            setNombreIdioma(e.target.value);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "350px",
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
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                {editingId ? "Editar idioma" : "Registrar idioma"}
            </h3>
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="nombreIdioma" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre del idioma
                    </label>
                    <input
                        id="nombreIdioma"
                        type="text"
                        value={nombreIdioma}
                        onChange={handleNombreChange}
                        required
                        disabled={!idiomaActivoEditando}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!idiomaActivoEditando}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: idiomaActivoEditando ? "#219ebc" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: idiomaActivoEditando ? "pointer" : "not-allowed"
                    }}
                >
                    {editingId ? "Actualizar" : "Guardar"}
                </button>
            </form>
            <button
                onClick={onClose}
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
};

export default IdiomaForm;
