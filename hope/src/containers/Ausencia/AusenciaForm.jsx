import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const AusenciaForm = ({ usuario, editingAusencia, onSubmit, onClose, empleados }) => {
  const [idEmpleado, setIdEmpleado] = useState("");
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [archivoActual, setArchivoActual] = useState(""); // ← nombre del archivo existente
  const [subiendo, setSubiendo] = useState(false);

  const [errorFechaFin, setErrorFechaFin] = useState("");
  const [errorArchivo, setErrorArchivo] = useState("");

  //   Inicializar formulario y obtener archivo si existe
  useEffect(() => {
    if (editingAusencia) {
      setTipo(editingAusencia.tipo || "");
      setMotivo(editingAusencia.motivo || "");
      setFechaInicio(editingAusencia.fechainicio || "");
      setFechaFin(editingAusencia.fechafin || "");
      setIdEmpleado(editingAusencia.idempleado || "");

      // ⚡ Obtener nombre del archivo si hay documento asociado
      if (editingAusencia.iddocumento) {
        axios
          .get(`${API}/documentos/${editingAusencia.iddocumento}/`)
          .then((res) => setArchivoActual(res.data.nombrearchivo || ""))
          .catch(() => setArchivoActual("Sin archivo"));
      }
    } else if (usuario && empleados?.length > 0) {
      let idEmp = usuario.idempleado;
      if (!idEmp) {
        const encontrado = empleados.find(e => e.idusuario === usuario.idusuario);
        if (encontrado) idEmp = encontrado.idempleado;
      }
      if (idEmp) setIdEmpleado(idEmp);
    }
  }, [editingAusencia, empleados, usuario]);

  const resetForm = () => {
    setTipo("");
    setMotivo("");
    setFechaInicio("");
    setFechaFin("");
    setArchivo(null);
    setArchivoActual("");
    setErrorArchivo("");
    setErrorFechaFin("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tipo || !motivo || !fechaInicio || !fechaFin) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    setSubiendo(true);
    try {
      let idDocumento = editingAusencia?.iddocumento || null;

      if (archivo) {
        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("nombrearchivo", archivo.name);
        formData.append("mimearchivo", archivo.name.split(".").pop().toLowerCase());
        formData.append("fechasubida", new Date().toISOString().slice(0, 10));
        formData.append("idusuario", usuario.idusuario);
        formData.append("idtipodocumento", 3);
        formData.append("idempleado", idEmpleado);

        if (editingAusencia?.iddocumento) {
          const resp = await axios.put(`${API}/documentos/${editingAusencia.iddocumento}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          idDocumento = resp.data.iddocumento;
        } else {
          const resp = await axios.post(`${API}/documentos/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          idDocumento = resp.data.iddocumento;
        }
      }

      const dataAusencia = {
        idempleado: Number(idEmpleado),
        tipo,
        motivo,
        fechainicio: fechaInicio,
        fechafin: fechaFin,
        iddocumento: idDocumento,
        estado: true,
        idusuario: usuario.idusuario,
      };

      await onSubmit(dataAusencia, editingAusencia?.idausencia);
      resetForm();
    } catch (error) {
      console.error("Error al guardar ausencia:", error.response?.data || error);
      alert("Error al registrar o actualizar la ausencia");
    } finally {
      setSubiendo(false);
    }
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

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        {/* Tipo */}
        <div style={{ marginBottom: "15px" }}>
          <label>Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="">Seleccione tipo</option>
            <option value="Salud">Salud</option>
            <option value="Personal">Personal</option>
          </select>
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: "15px" }}>
          <label>Motivo / Diagnóstico</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Fechas */}
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
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: `1px solid ${errorFechaFin ? "red" : "#ccc"}` }}
            />
            {errorFechaFin && (
              <small style={{ color: "red", fontSize: "12px" }}>{errorFechaFin}</small>
            )}
          </div>
        </div>

        {/* Documento */}
        <div style={{ marginBottom: "20px" }}>
          <label>Documento (Comprobante)</label>
          {editingAusencia?.iddocumento && !archivo && (
            <div style={{ marginBottom: "6px", fontSize: "14px" }}>
              Archivo actual: <strong>{archivoActual || "Sin archivo"}</strong>
            </div>
          )}
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            required={!editingAusencia || !archivoActual}
            style={{ width: "100%", padding: "5px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          {editingAusencia && archivo && (
            <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
              Se reemplazará el archivo existente al guardar.
            </small>
          )}
          {errorArchivo && <small style={{ color: "red", fontSize: "12px" }}>{errorArchivo}</small>}
        </div>

        <button
          type="submit"
          disabled={subiendo}
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
          {subiendo ? "Guardando..." : editingAusencia ? "Actualizar" : "Guardar"}
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
