import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const CriterioModal = ({ onClose, onAdd, criteriosUsados = [] }) => {
  const [criterios, setCriterios] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "" });

  useEffect(() => {
    const cargarCriterios = async () => {
      try {
        const res = await fetch(`${API}/criterio/`);
        const data = (await res.json()).results || [];

        const filtrados = data.filter((c) =>
          c.idcriterio > 12 &&
          c.idvariable == 1 &&
          c.estado !== false && 
          !criteriosUsados.some(u => u.id === c.idcriterio), // 🔥 NO MOSTRAR USADOS
        );

        setCriterios(filtrados);
      } catch (err) {
        console.error("Error cargando criterios:", err);
      }
    };

    cargarCriterios();
  }, [criteriosUsados]);


  const criteriosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return criterios.filter((c) =>
      c.nombrecriterio.toLowerCase().includes(texto)
    );
  }, [busqueda, criterios]);

  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAgregarSeleccionados = () => {
    const seleccionadosCriterios = criterios.filter((c) =>
      seleccionados.includes(c.idcriterio)
    );
    if (!seleccionadosCriterios.length) return;
    seleccionadosCriterios.forEach((c) =>
      onAdd({
        id: c.idcriterio,
        nombre: c.nombrecriterio,
        descripcion: c.descripcioncriterio,
      })
    );
    showToast("Criterios agregados correctamente", "success");
    onClose();
  };

  const handleGuardarNuevo = async (e) => {
    e.preventDefault(); // prevenir recarga por formulario
    try {
      const res = await fetch(`${API}/criterio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombrecriterio: nuevo.nombre.trim(),
          descripcioncriterio: nuevo.descripcion.trim(),
          estado: true,
          idusuario: 2,
          idvariable: 1,
        }),
      });
      if (!res.ok) throw new Error("Error al crear criterio");
      const data = await res.json();

      // ✅ Notificación de éxito
      showToast("Criterio guardado exitosamente", "success");

      // Actualizar lista
      setCriterios((prev) => [...prev, data]);
      setNuevo({ nombre: "", descripcion: "" });
      setMostrarNuevo(false);

      // Añadir a la evaluación actual
      onAdd({
        id: data.idcriterio,
        nombre: data.nombrecriterio,
        descripcion: data.descripcioncriterio,
      });

      onClose();
    } catch (err) {
      console.error("Error guardando criterio:", err);
      showToast("Error guardando criterio", "error");
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={22} color="#555" />
        </button>

        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Agregar Criterios Personalizados
        </h3>

        {/* === LISTBOX === */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "6px",
            }}
          >
            Seleccionar criterios existentes:
          </label>

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#f9fafb",
            }}
          >
            <input
              type="text"
              placeholder="Buscar criterio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderBottom: "1px solid #e5e5e5",
                borderRadius: "6px 6px 0 0",
                outline: "none",
                backgroundColor: "#fff",
              }}
            />

            <div
              style={{
                maxHeight: "180px",
                overflowY: "auto",
                padding: "8px",
              }}
            >
              {criteriosFiltrados.length > 0 ? (
                criteriosFiltrados.map((c) => (
                  <label
                    key={c.idcriterio}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "10px",
                      padding: "8px 10px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      backgroundColor: seleccionados.includes(c.idcriterio)
                        ? "#e3f2fd"
                        : "transparent",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!seleccionados.includes(c.idcriterio))
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      if (!seleccionados.includes(c.idcriterio))
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(c.idcriterio)}
                      onChange={() => toggleSeleccion(c.idcriterio)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#219ebc",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "15px",
                        color: "#333",
                        wordBreak: "break-word",
                      }}
                    >
                      {c.nombrecriterio}
                    </span>
                  </label>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    color: "#777",
                    fontSize: "14px",
                  }}
                >
                  No se encontraron criterios
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAgregarSeleccionados}
            disabled={seleccionados.length === 0}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              color: "#fff",
              background: seleccionados.length ? "#219ebc" : "#ccc",
              cursor: seleccionados.length ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            Agregar seleccionados
          </button>
        </div>

        <hr />

        {/* === BOTÓN NUEVO CRITERIO === */}
        <button
          onClick={() => setMostrarNuevo((prev) => !prev)}
          style={{
            width: "100%",
            padding: "10px",
            background: mostrarNuevo ? "#8ecae6" : "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {mostrarNuevo ? "Cancelar nuevo criterio" : "+ Nuevo criterio"}
        </button>

        {/* === FORMULARIO NUEVO === */}
        {mostrarNuevo && (
          <form
            onSubmit={handleGuardarNuevo}
            style={{
              background: "#f8f9fa",
              borderRadius: "6px",
              padding: "12px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          >
            <label style={{ fontWeight: "bold" }}>Nombre del criterio:</label>
            <input
              type="text"
              placeholder="Ingrese el nombre..."
              value={nuevo.nombre}
              required
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />

            <label style={{ fontWeight: "bold", marginTop: "10px" }}>
              Descripción:
            </label>
            <textarea
              placeholder="Descripción del criterio..."
              value={nuevo.descripcion}
              required
              onChange={(e) =>
                setNuevo({ ...nuevo, descripcion: e.target.value })
              }
              style={{
                width: "100%",
                marginTop: "5px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                minHeight: "70px",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "10px",
                background: "#219ebc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Guardar Criterio
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  position: "relative",
  background: "#fff",
  padding: "25px 30px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "480px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
};

export default CriterioModal;
