import React, { useState } from "react";
import { X } from "lucide-react";

const PostularModal = ({ show, onClose, convocatoriaId }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nit: "",
    dpi: "",
    genero: "",
    email: "",
    fechanacimiento: "",
    telefono: "",
    direccion: "",
  });

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", { ...formData, convocatoriaId });
    onClose();
  };

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    width: 600,
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
  };

  const btnStyle = {
    minWidth: 120,
    height: 45,
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
  };

  const btnPrimary = { ...btnStyle, background: "#1a73e8", color: "#fff" };
  const btnGhost = { ...btnStyle, background: "#ccc", color: "#333" };
  const btnCancel = { ...btnStyle, background: "#f44336", color: "#fff" };

  return (
    <div style={modalStyle}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Postularse a Convocatoria</h2>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>NIT</label>
              <input name="nit" value={formData.nit} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>DPI</label>
              <input name="dpi" value={formData.dpi} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>Fecha de nacimiento</label>
              <input type="date" name="fechanacimiento" value={formData.fechanacimiento} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Teléfono</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Dirección</label>
              <input name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
          </>
        )}

        {/* BOTONES */}
        <div style={{ display: "flex", justifyContent: step === 3 ? "center" : "space-between", gap: 12, marginTop: 20 }}>
          {step > 1 && step < 3 && <button type="button" onClick={back} style={btnGhost}>Atrás</button>}
          {step < 3 && <button type="button" onClick={next} style={btnPrimary}>Siguiente</button>}
          {step === 3 && <>
            <button type="submit" style={btnPrimary}>Enviar</button>
            <button type="button" onClick={onClose} style={btnCancel}>Cancelar</button>
          </>}
        </div>
      </form>

      <button
        onClick={onClose}
        style={{ position: "absolute", top: 10, right: 15, background: "transparent", border: "none", cursor: "pointer" }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
    </div>
  );
};

export default PostularModal;
