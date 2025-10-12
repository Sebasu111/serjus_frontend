import React from "react";

const ConfirmModal = ({ registro, onConfirm, onCancel }) => (
  <div
    style={{
      paddingLeft: "250px",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
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
        width: "350px",
      }}
    >
      <h3 style={{ marginBottom: "15px", color: "#333" }}>
        Confirmar desactivación
      </h3>
      <p style={{ marginBottom: "25px", color: "#555" }}>
        ¿Seguro que deseas desactivar el puesto{" "}
        <strong>{registro?.nombrepuesto}</strong>?
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
        <button
          onClick={onConfirm}
          style={{
            background: "#fb8500",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
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
            borderRadius: "8px",
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
