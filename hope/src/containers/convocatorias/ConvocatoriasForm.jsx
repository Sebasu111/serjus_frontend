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
  // 🔧 Helper para asegurar formato válido
  const toISODate = (fecha) => {
    if (!fecha) return "";
    if (fecha.includes("/")) {
      const [dia, mes, anio] = fecha.split("/");
      return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
    }
    return fecha;
  };

  const fromISODate = (fecha) => {
    if (!fecha) return "";
    if (fecha.includes("-")) {
      const [anio, mes, dia] = fecha.split("-");
      return `${dia}/${mes}/${anio}`;
    }
    return fecha;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Si es una fecha, convertimos el formato al estilo DD/MM/YYYY
    if (name === "fechainicio" || name === "fechafin") {
      const formatted = fromISODate(value);
      if (name === "fechainicio") {
        onChange({ target: { name: "fechainicio", value: formatted } });
        onChange({ target: { name: "fechafin", value: "" } });
      } else {
        onChange({ target: { name, value: formatted } });
      }
      return;
    }

    onChange(e);
  };

  // Definir minFechaInicio según si es edición o creación
  const minFechaInicio = editingId
    ? toISODate(form.fechainicio) || new Date().toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

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
          onChange={onChange}
          className="form-control"
        />

        <label>Fecha fin:</label>
        <input
          type="date"
          name="fechafin"
          value={form.fechafin ? form.fechafin.split("T")[0] : ""}
          onChange={onChange}
          className="form-control"
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
