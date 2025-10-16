import React from "react";

const ConfirmModalAspirante = ({ aspirante, onConfirm, onCancel }) => (
    <div
        style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000,
        }}
    >
        <div
            style={{
                background: "#fff", padding: 30, borderRadius: 10,
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)", textAlign: "center", width: 380,
            }}
        >
            <h3 style={{ marginBottom: 15, color: "#333" }}>Confirmar desactivación</h3>
            <p style={{ marginBottom: 25, color: "#555" }}>
                ¿Seguro que deseas desactivar al aspirante{" "}
                <strong>{aspirante?.nombreaspirante} {aspirante?.apellidoaspirante}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 15 }}>
                <button
                    onClick={onConfirm}
                    style={{ background: "#FED7AA", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 8, cursor: "pointer" }}
                >
                    Sí, desactivar
                </button>
                <button
                    onClick={onCancel}
                    style={{ background: "#6c757d", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 8, cursor: "pointer" }}
                >
                    Cancelar
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmModalAspirante;
