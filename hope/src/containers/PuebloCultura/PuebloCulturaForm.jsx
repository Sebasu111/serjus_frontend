import React from "react";
import { X } from "lucide-react";

const PuebloCulturaForm = ({ nombrePueblo, setNombrePueblo, activoEditando, editingId, handleSubmit, onClose }) => {
    const handleNombreChange = e => {
        // Letras, espacios, acentos y guiones/puntos (máximo 20 chars)
        const value = e.target.value;
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s.-]*$/;
        if (regex.test(value) && value.length <= 20) {
            setNombrePueblo(value);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "360px",
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
                {editingId ? "Editar Pueblo/Cultura" : "Registrar Pueblo/Cultura"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "18px" }}>
                    <label htmlFor="nombrePueblo" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre
                    </label>
                    <input
                        id="nombrePueblo"
                        type="text"
                        value={nombrePueblo}
                        onChange={handleNombreChange}
                        required
                        disabled={!activoEditando}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!activoEditando}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: activoEditando ? "#219ebc" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: activoEditando ? "pointer" : "not-allowed"
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

export default PuebloCulturaForm;
