// ConfirmModal.jsx
import React from "react";

const ConfirmModal = ({ title = "Confirmar acción", message, onConfirm, onCancel }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-15%, -50%)",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        zIndex: 1000,
        width: "400px",
        maxWidth: "95%",
      }}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>{title}</h3>
      <p style={{ marginBottom: "30px", textAlign: "center" }}>{message}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <button
          onClick={onConfirm}
          style={{
            padding: "10px 20px",
            background: "#FED7AA",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Sí, Desactivar
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
