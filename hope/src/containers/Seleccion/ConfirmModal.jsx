import React from "react";

const ConfirmModal = ({ visible, onConfirm, onCancel, mensaje }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "24px",
          width: "360px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          textAlign: "center",
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <h3 style={{ color: "#023047", marginBottom: "12px" }}>Confirmación</h3>
        <p style={{ fontSize: "15px", marginBottom: "24px" }}>{mensaje}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
                onClick={onConfirm}
                style={{
                backgroundColor: "#FCA5A5",
                border: "none",
                color: "#000000ff",
                borderRadius: "8px",
                padding: "8px 14px",
                cursor: "pointer",
                fontWeight: 500,
                }}
            >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "#adb5bd",
              border: "none",
              color: "#000000ff",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
