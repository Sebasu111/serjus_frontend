import React from "react";
import { X } from "lucide-react";

const ConvocatoriasForm = ({
  form,
  puestos,
  onChange,
  handleSubmit,
  setMostrarFormulario,
  editingId,
}) => {
  // 🔧 Helper para obtener fecha actual en formato YYYY-MM-DD
  const hoyISO = new Date().toISOString().split("T")[0];

  // 🔧 Definir mínimo y máximo según selección
  const minFechaInicio = hoyISO;
  const minFechaFin = form.fechainicio ? form.fechainicio.split("T")[0] || form.fechainicio : "";
  
  // 🔧 Handler general
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "fechainicio") {
      // Al cambiar fecha de inicio, limpiamos fecha fin si ya no es válida
      if (form.fechafin && new Date(value) > new Date(form.fechafin)) {
        onChange({ target: { name: "fechafin", value: "" } });
      }
    }

    onChange(e);
  };

  return (
    <div style={modalStyle}>
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>
        {editingId ? "Editar convocatoria" : "Registrar convocatoria"}
      </h3>

      <form onSubmit={handleSubmit}>
        <label>Nombre</label>
        <input
          name="nombreconvocatoria"
          value={form.nombreconvocatoria}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />

        <label>Descripción</label>
        <textarea
          name="descripcion"
          rows="4"
          value={form.descripcion}
          onChange={handleInputChange}
          required
          style={inputStyle}
        />

        <label>Fecha de inicio:</label>
        <input
          type="date"
          name="fechainicio"
          value={form.fechainicio ? form.fechainicio.split("T")[0] : ""}
          min={minFechaInicio} // ⛔ No permite fechas pasadas
          onChange={handleInputChange}
          required
          style={inputStyle}
        />

        <label>Fecha fin:</label>
        <input
          type="date"
          name="fechafin"
          value={form.fechafin ? form.fechafin.split("T")[0] : ""}
          min={minFechaFin || hoyISO} // ⛔ Solo permite días posteriores al inicio
          onChange={handleInputChange}
          disabled={!form.fechainicio} // ⛔ Deshabilitado si no se seleccionó inicio
          required
          style={{
            ...inputStyle,
            backgroundColor: !form.fechainicio ? "#f3f3f3" : "#fff",
            cursor: !form.fechainicio ? "not-allowed" : "text",
          }}
        />

        <label>Puesto</label>
        <select
          name="idpuesto"
          value={form.idpuesto}
          onChange={handleInputChange}
          required
          style={inputStyle}
        >
          <option value="">-- Seleccionar puesto --</option>
          {puestos.map((p) => (
            <option key={p.idpuesto} value={p.idpuesto}>
              {p.nombrepuesto}
            </option>
          ))}
        </select>

        <button type="submit" style={btnPrimary}>
          {editingId ? "Actualizar" : "Guardar"}
        </button>
      </form>

      <button
        onClick={setMostrarFormulario}
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

// ======== ESTILOS ========
const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  marginBottom: 12,
};

const btnPrimary = {
  padding: 10,
  width: "100%",
  background: "#219ebc",
  color: "#fff",
  borderRadius: 6,
  marginTop: 12,
  border: "none",
  outline: "none",
  cursor: "pointer",
};

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-15%, -50%)",
  width: 400,
  maxWidth: "95%",
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  zIndex: 1000,
};

export default ConvocatoriasForm;
