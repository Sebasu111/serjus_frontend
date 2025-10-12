import React, { useState } from "react";
import { X } from "lucide-react";

const PuestoForm = ({
  puestoSeleccionado,
  handleSubmit,
  onClose,
}) => {
  const [descripcion, setDescripcion] = useState(puestoSeleccionado?.descripcion || "");
  const [salarioBase, setSalarioBase] = useState(puestoSeleccionado?.salariobase || "");

  const handleSalarioChange = (e) => {
    const valor = e.target.value.replace(/[^0-9.]/g, ""); // solo números y punto
    setSalarioBase(valor);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const idUsuario = Number(sessionStorage.getItem("idUsuario"));
    const payload = {
      nombrepuesto: puestoSeleccionado.nombrepuesto,
      descripcion,
      salariobase: parseFloat(salarioBase),
      estado: puestoSeleccionado.estado,
      idusuario: idUsuario,
    };
    handleSubmit(puestoSeleccionado.idpuesto, payload);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-15%, -50%)",
        width: "380px",
        maxWidth: "90%",
        background: "#fff",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        padding: "30px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
        Asignar Salario
      </h3>

      <form onSubmit={onSubmit}>
        {/* Nombre del Puesto (solo lectura) */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="nombrepuesto" style={{ display: "block", marginBottom: "8px" }}>
            Nombre del Puesto
          </label>
          <input
            id="nombrepuesto"
            type="text"
            value={puestoSeleccionado.nombrepuesto}
            disabled
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#f8f9fa",
              color: "#555",
            }}
          />
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="descripcion" style={{ display: "block", marginBottom: "8px" }}>
            Descripción
          </label>
          <input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={150}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        {/* Salario Base */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="salariobase" style={{ display: "block", marginBottom: "8px" }}>
            Salario Base (Q)
          </label>
          <input
            id="salariobase"
            type="text"
            value={salarioBase}
            onChange={handleSalarioChange}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Asignar Salario
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
          cursor: "pointer",
        }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
    </div>
  );
};

export default PuestoForm;
