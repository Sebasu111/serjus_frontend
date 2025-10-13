// CapacitacionForm.jsx
import React from "react";

const CapacitacionForm = ({
  formData,
  setFormData,
  editingId,
  setEditingId,
  capacitacionActivaEditando,
  setMostrarFormulario,
  handleSubmit,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-15%, -50%)",
        width: "500px",
        maxWidth: "95%",
        background: "#fff",
        padding: "30px",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        borderRadius: "12px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        {editingId ? "Editar Capacitación" : "Registrar Capacitación"}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ flex: 1 }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Nombre del evento</label>
          <input
            value={formData.nombreEvento}
            onChange={(e) => setFormData({ ...formData, nombreEvento: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Lugar</label>
          <input
            value={formData.lugar}
            onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Fecha Inicio</label>
            <input
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "6px" }}>Fecha Fin</label>
            <input
              type="date"
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Institución facilitadora</label>
          <input
            value={formData.institucion}
            onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "6px" }}>Monto ejecutado</label>
          <input
            type="number"
            value={formData.monto}
            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#fb8500",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {editingId ? "Actualizar" : "Guardar"}
        </button>
      </form>

      <button
        onClick={() => setMostrarFormulario(false)}
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#6c757d",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>
    </div>
  );
};

export default CapacitacionForm;
