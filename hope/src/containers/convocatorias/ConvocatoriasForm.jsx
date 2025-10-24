import React from "react";

const ConvocatoriasForm = ({
    form,
    puestos,
    onChange,
    handleSubmit,
    resetForm,
    editingId,
}) => (
    <div style={modalStyle}>
        <h3 style={{ textAlign: "center", marginBottom: 20 }}>
            {editingId ? "Editar convocatoria" : "Registrar convocatoria"}
        </h3>

        <form onSubmit={handleSubmit}>
            <label>Nombre</label>
            <input name="nombreconvocatoria" value={form.nombreconvocatoria} onChange={onChange} required style={inputStyle} />

            <label>Descripción</label>
            <textarea name="descripcion" rows="4" value={form.descripcion} onChange={onChange} required style={inputStyle} />

            <label>Fecha inicio</label>
            <input type="date" name="fechainicio" value={form.fechainicio} onChange={onChange} required style={inputStyle} />

            <label>Fecha fin</label>
            <input type="date" name="fechafin" value={form.fechafin} onChange={onChange} style={inputStyle} />

            <label>Puesto</label>
            <select name="idpuesto" value={form.idpuesto} onChange={onChange} required style={inputStyle}>
                <option value="">-- Seleccionar puesto --</option>
                {puestos.map(p => (
                    <option key={p.idpuesto} value={p.idpuesto}>
                        {p.nombrepuesto}
                    </option>
                ))}
            </select>

            <button type="submit" style={btnPrimary}>
                {editingId ? "Actualizar" : "Guardar"}
            </button>
        </form>

        <button onClick={resetForm} style={btnClose}>Cerrar</button>
    </div>
);

// Estilos
const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginBottom: 12,
};
const btnPrimary = { padding: 10, width: "100%", background: "#007bff", color: "#fff", borderRadius: 6, marginTop: 12 };
const btnClose = { ...btnPrimary, background: "#6c757d" };
const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    maxWidth: "95%",
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    zIndex: 1000,
};

export default ConvocatoriasForm;
