import React from "react";

const ConfirmModal = ({ empleado, onConfirm, onCancel }) => (
    <div
        style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
        }}
    >
        <div
            style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                textAlign: "center",
                width: "380px",
            }}
        >
            <h3 style={{ marginBottom: 15, color: "#333" }}>Confirmar desactivación</h3>
            <p style={{ marginBottom: 25, color: "#555" }}>
                ¿Seguro que deseas desactivar al empleado <strong>{empleado?.nombre} {empleado?.apellido}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 15 }}>
                <button
                    onClick={onConfirm}
                    style={{
                        background: "#FCA5A5",            // rojo pastel
                        border: "1px solid #F87171",
                        color: "#7F1D1D",
                        padding: "10px 20px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Sí, desactivar
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        background: "#6c757d",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmModal;
