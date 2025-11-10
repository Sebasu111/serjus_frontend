import React, { useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const CriterioForm = ({ onClose, variables, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idVariable, setIdVariable] = useState("");
  const [estado] = useState(true); // activo por defecto, oculto
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !idVariable) {
      showToast("Por favor completa los campos obligatorios", "warning");
      return;
    }

    try {
      setCargando(true);
      const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

      const payload = {
        nombrecriterio: nombre,
        descripcioncriterio: descripcion,
        estado,
        idusuario: idUsuario,
        idvariable: Number(idVariable),
      };

      await axios.post(`${API}/criterio/`, payload);
      showToast("Criterio creado correctamente ✅");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Error al crear el criterio", "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
          Nuevo Criterio de Evaluación
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <label style={labelStyle}>
            Nombre del Criterio <span style={{ color: "red" }}>*</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelStyle}>
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
            />
          </label>

          <label style={labelStyle}>
            Variable Asociada <span style={{ color: "red" }}>*</span>
            <select
              value={idVariable}
              onChange={(e) => setIdVariable(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Seleccione una variable</option>
              {variables.map((v) => (
                <option key={v.idvariable} value={v.idvariable}>
                  {v.nombrevariable}
                </option>
              ))}
            </select>
          </label>

          {/* Botones al final */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <button
              type="submit"
              disabled={cargando}
              style={{
                background: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                cursor: "pointer",
                fontSize: "14px",
                flex: 1,
                marginRight: "10px",
                opacity: cargando ? 0.6 : 1,
              }}
            >
              {cargando ? "Guardando..." : "Guardar"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                cursor: "pointer",
                fontSize: "14px",
                flex: 1,
              }}
            >
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🎨 Estilos
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "#fff",
  padding: "25px 30px",
  borderRadius: "10px",
  width: "min(450px, 90vw)",
  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "14px",
  color: "#333",
  fontWeight: "500",
};

const inputStyle = {
  marginTop: "4px",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

export default CriterioForm;
