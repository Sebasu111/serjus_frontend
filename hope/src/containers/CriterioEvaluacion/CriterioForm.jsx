import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const CriterioForm = ({ onClose, variables, tipos, onSuccess, criterioEditar }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [idVariable, setIdVariable] = useState("");
  const [estado, setEstado] = useState(true);
  const [cargando, setCargando] = useState(false);

  // 🔹 Cargar datos si es modo edición
  useEffect(() => {
    if (criterioEditar) {
      setNombre(criterioEditar.nombrecriterio);
      setDescripcion(criterioEditar.descripcioncriterio);
      setIdVariable(criterioEditar.idvariable);
      setEstado(criterioEditar.estado);

      const variableEncontrada = variables.find(
        (v) => v.idvariable === criterioEditar.idvariable
      );

      if (variableEncontrada) {
        setIdTipo(variableEncontrada.idtipoevaluacion);
      }
    }
  }, [criterioEditar, variables]);

  // 🔹 Variables filtradas según tipo
  const variablesFiltradas = variables.filter(
    (v) => !idTipo || v.idtipoevaluacion === Number(idTipo)
  );
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !idVariable) {
      showToast("Por favor completa los campos obligatorios", "warning");
      return;
    }

    try {
      setCargando(true);
      const idUsuario = Number(sessionStorage.getItem("idUsuario")) || 1;

      // 🔥 Crear payload base
      let payload = {
        nombrecriterio: nombre,
        descripcioncriterio: descripcion,
        idusuario: idUsuario,
        idvariable: Number(idVariable),
      };

      // 🔥 Solo agregar estado si es nuevo
      if (!criterioEditar) {
        payload.estado = true;
      }

      // 🔥 UPDATE
      if (criterioEditar) {
        await axios.put(`${API}/criterio/${criterioEditar.idcriterio}/`, payload);
        showToast("Criterio actualizado correctamente", "success");
      } 
      // 🔥 CREATE
      else {
        await axios.post(`${API}/criterio/`, payload);
        showToast("Criterio creado correctamente", "success");
      }

      await onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Error al guardar el criterio", "error");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
          {criterioEditar ? "Editar Criterio" : "Nuevo Criterio de Evaluación"}
        </h3>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Nombre */}
          <label style={labelStyle}>
            Nombre del Criterio
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
              required
            />
          </label>

          {/* Descripción */}
          <label style={labelStyle}>
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              style={{ ...inputStyle, minHeight: "70px", resize: "vertical" }}
              required
            />
          </label>

          {/* Tipo */}
          <label style={labelStyle}>
            Tipo de Evaluación
            <select
              value={idTipo}
              onChange={(e) => {
                if (!criterioEditar) {       // ⛔ No permitir cambiar en edición
                  setIdTipo(e.target.value);
                  setIdVariable("");
                }
              }}
              style={inputStyle}
              required
              disabled={!!criterioEditar}
            >
              <option value="">Seleccione un tipo</option>
              {tipos.map((t) => (
                <option key={t.idtipoevaluacion} value={t.idtipoevaluacion}>
                  {t.nombretipo}
                </option>
              ))}
            </select>
          </label>

          {/* Variable */}
          <label style={labelStyle}>
            Variable Asociada
            <select
              value={idVariable}
              onChange={(e) => {
                if (!criterioEditar) {       // ⛔ No permitir cambiar en edición
                  setIdVariable(e.target.value);
                }
              }}
              style={inputStyle}
              required
              disabled={!!criterioEditar}
            >
              <option value="">
                {idTipo ? "Seleccione una variable" : "Primero seleccione un tipo"}
              </option>
              {variablesFiltradas.map((v) => (
                <option key={v.idvariable} value={v.idvariable}>
                  {v.nombrevariable}
                </option>
              ))}
            </select>
          </label>

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={cargando}
              style={{
                background: "#219ebc",
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
              {cargando ? "Guardando..." : criterioEditar ? "Actualizar" : "Guardar"}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#919191ff",
                color: "#fff",
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

/* --- ESTILOS IGUALES --- */
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
