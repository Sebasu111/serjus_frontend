import React from "react";
import axios from "axios";

const CapacitacionForm = ({ formData, setFormData, setMostrarFormulario, editingId, setEditingId, fetchCapacitaciones, setMensaje }) => {

    const validarFormulario = () => {
        const { nombreEvento, lugar, fechaInicio, fechaFin, institucion, monto } = formData;
        if (!nombreEvento.trim()) return "El nombre del evento es obligatorio";
        if (!lugar.trim()) return "El lugar es obligatorio";
        if (!fechaInicio) return "La fecha de inicio es obligatoria";
        if (!fechaFin) return "La fecha de fin es obligatoria";
        if (new Date(fechaInicio) > new Date(fechaFin)) return "La fecha de fin no puede ser menor a la fecha de inicio";
        if (!institucion.trim()) return "La institución facilitadora es obligatoria";
        if (isNaN(monto) || Number(monto) <= 0) return "El monto debe ser un número mayor a 0";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorValidacion = validarFormulario();
        if (errorValidacion) {
            setMensaje(errorValidacion);
            return;
        }

        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            const data = {
                nombreevento: formData.nombreEvento,
                lugar: formData.lugar,
                fechainicio: formData.fechaInicio,
                fechafin: formData.fechaFin,
                institucionfacilitadora: formData.institucion,
                montoejecutado: formData.monto,
                estado: true,
                idusuario: idUsuario,
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/capacitaciones/${editingId}/`, data);
                setMensaje("Capacitación actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/capacitaciones/", data);
                setMensaje("Capacitación registrada correctamente");
            }

            setFormData({ nombreEvento: "", lugar: "", fechaInicio: "", fechaFin: "", institucion: "", monto: "" });
            setEditingId(null);
            setMostrarFormulario(false);
            fetchCapacitaciones();
        } catch (error) {
            console.error(error);
            setMensaje("Error al registrar la capacitación");
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "500px",
            maxWidth: "95%",
            background: "#fff",
            padding: "30px",
            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            borderRadius: "12px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column"
        }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
                {editingId ? "Editar Capacitación" : "Registrar Capacitación"}
            </h3>
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
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
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
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
