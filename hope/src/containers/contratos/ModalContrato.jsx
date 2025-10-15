import React from "react";

const ModalContrato = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
        {children}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000,
  },
  modal: { background: "#fff", borderRadius: 10, padding: 30, width: "80%", maxWidth: 600 },
  closeBtn: {
    background: "transparent", border: "none", fontSize: 24, position: "absolute",
    top: 10, right: 20, cursor: "pointer"
  }
};

export default ModalContrato;
