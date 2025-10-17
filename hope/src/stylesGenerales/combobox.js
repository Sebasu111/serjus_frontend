// styles/combobox.js
import { buttonStyles } from "./buttons";

export const comboBoxStyles = {
  container: {
    position: "relative",
    display: "inline-block",
    width: "140px",
  },
  button: {
    base: {
      ...buttonStyles.base,
      width: "100%",
      borderRadius: "8px",
      fontWeight: 500,
      cursor: "pointer",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      background: buttonStyles.editarActivo.background, // fondo default del botón
      color: buttonStyles.editarActivo.color,
      border: "none",
      padding: "6px 12px",
      transition: "all 0.2s ease",
    },
    hover: {
      background: "#d1d5db",
    },
  },
  menu: {
    container: {
      position: "absolute",
      top: "110%",
      left: 0,
      width: "100%",
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
      zIndex: 10,
      overflow: "hidden",
    },
    item: {
      editar: {
        base: {
          ...buttonStyles.base,
          width: "100%",
          textAlign: "center",
          borderRadius: 0,
          borderBottom: "1px solid #f0f0f0",
          fontWeight: 500,
          padding: "8px 0",
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: buttonStyles.editarActivo.background,
          color: buttonStyles.editarActivo.color,
        },
        disabled: {
          cursor: "not-allowed",
          color: buttonStyles.editarInactivo.color,
          background: buttonStyles.editarInactivo.background,
        },
        hover: {
          background: "#f0f0f0",
        },
      },
      desactivar: {
        base: {
          ...buttonStyles.base,
          width: "100%",
          textAlign: "center",
          borderRadius: 0,
          borderBottom: "1px solid #f0f0f0",
          fontWeight: 500,
          padding: "8px 0",
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: buttonStyles.desactivar.background,
          color: buttonStyles.desactivar.color,
        },
        hover: {
          background: "#e5e7eb34",
        },
      },
      activar: {
        base: {
          ...buttonStyles.base,
          width: "100%",
          textAlign: "center",
          borderRadius: 0,
          borderBottom: "1px solid #f0f0f0",
          fontWeight: 500,
          padding: "8px 0",
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: buttonStyles.activar.background,
          color: buttonStyles.activar.color,
        },
        hover: {
          background: "#f0f0f0",
        },
      },
    },
  },
};
