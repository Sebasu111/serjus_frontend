import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AusenciaForm = ({ mensaje, editingAusencia, onSubmit, onClose }) => {
  const [idEmpleado, setIdEmpleado] = useState("");
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idDocumento, setIdDocumento] = useState("");
  const [estadoActivo, setEstadoActivo] = useState(true);

  useEffect(() => {
    if (editingAusencia) {
      setIdEmpleado(editingAusencia.idempleado || "");
      setTipo(editingAusencia.tipo || "");
      setMotivo(editingAusencia.motivo || "");
      setFechaInicio(editingAusencia.fechainicio || "");
      setFechaFin(editingAusencia.fechafin || "");
      setIdDocumento(editingAusencia.iddocumento || "");
      setEstadoActivo(editingAusencia.estado || true);
    } else {
      resetForm();
    }
  }, [editingAusencia]);

  const resetForm = () => {
    setIdEmpleado("");
    setTipo("");
    setMotivo("");
    setFechaInicio("");
    setFechaFin("");
    setIdDocumento("");
    setEstadoActivo(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      idempleado: idEmpleado || null,
      tipo,
      motivo,
      fechainicio: fechaInicio,
      fechafin: fechaFin || null,
      iddocumento: idDocumento,
      estado: estadoActivo,
      idusuario: 1,
    };
    onSubmit(data, editingAusencia?.idausencia);
    resetForm();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        maxWidth: "90%",
        background: "#fff",
        boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        padding: "30px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
        {editingAusencia ? "Editar Ausencia" : "Registrar Ausencia"}
      </h3>

      {mensaje && (
        <p style={{
          textAlign: "center",
          color: mensaje.includes("Error") ? "red" : "green",
          marginBottom: "15px",
          fontWeight: "bold",
        }}>
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <div style={{ marginBottom: "15px" }}>
          <label>ID Empleado</label>
          <input
            type="number"
            value={idEmpleado}
            onChange={(e) => setIdEmpleado(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Tipo</label>
          <input
            type="text"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Motivo</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>ID Documento</label>
          <input
            type="number"
            value={idDocumento}
            onChange={(e) => setIdDocumento(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <input
            type="checkbox"
            checked={estadoActivo}
            onChange={(e) => setEstadoActivo(e.target.checked)}
          />{" "}Activo
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            background: "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {editingAusencia ? "Actualizar" : "Guardar"}
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

export default AusenciaForm;
