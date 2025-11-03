import React from "react";
import { X } from "lucide-react";

const InduccionForm = ({ nombre, setNombre, fechainicio, setFechaInicio, activoEditando, editingId, handleSubmit, onClose }) => {

    const handleNombreChange = e => {
        // Letras, números, espacios, acentos y algunos símbolos (máximo 200 chars)
        const value = e.target.value;
        const regex = /^[A-Za-z0-9ÁÉÍÓÚáéíóúñÑ\s.,-]*$/;
        if (regex.test(value) && value.length <= 200) {
            setNombre(value);
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
                {editingId ? "Editar Inducción" : "Registrar Inducción"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "18px" }}>
                    <label htmlFor="nombre" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre
                    </label>
                    <input
                        id="nombre"
                        type="text"
                        value={nombre}
                        onChange={handleNombreChange}
                        required
                        disabled={!activoEditando}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                        placeholder="Nombre de la inducción"
                    />
                </div>

                {/* Solo mostrar fecha de inicio cuando se está editando */}
                {editingId && (
                    <div style={{ marginBottom: "18px" }}>
                        <label htmlFor="fechainicio" style={{ display: "block", marginBottom: "8px" }}>
                            Fecha de Inicio
                        </label>
                        <input
                            id="fechainicio"
                            type="date"
                            value={fechainicio}
                            onChange={e => setFechaInicio(e.target.value)}
                            required
                            disabled={true}  // Siempre deshabilitado en edición
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #219ebc",
                                borderRadius: "6px",
                                backgroundColor: "#e3f2fd",
                                color: "#1976d2",
                                cursor: "not-allowed"
                            }}
                        />
                    </div>
                )}

                {/* Mostrar información de fecha de inicio automática cuando no se está editando */}
                {!editingId && (
                    <div style={{ marginBottom: "18px" }}>
                        <div style={{
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: "6px",
                            fontSize: "14px",
                            color: "#495057"
                        }}>
                            <strong>Fecha de Inicio:</strong> {new Date().toLocaleDateString("es-ES")} (Automática)
                        </div>
                    </div>
                )}

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

export default InduccionForm;