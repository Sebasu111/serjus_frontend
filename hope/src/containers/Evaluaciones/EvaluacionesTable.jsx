import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const EvaluacionesTable = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [qEmpleado, setQEmpleado] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [cargando, setCargando] = useState(true);

  const wrapperRef = useRef(null);

  const displayName = (e) => `${e.nombre} ${e.apellido}`;
  const empId = (e) => e.idempleado ?? e.idEmpleado;

  // --- Acción del botón ---
const cargarCriterios = async (ev) => {
  try {
    console.log("🔍 Buscando criterios de la evaluación:", ev.idevaluacion);

    // Trae todo (porque tu backend no filtra)
    const res = await axios.get(`${API_BASE}/evaluacioncriterio/`);

    const data = res.data.results || res.data || [];

    // 🔥 FILTRAR EN REACT (solución inmediata)
    const criterios = data.filter(
      (c) => c.idevaluacion === ev.idevaluacion
    );

    console.log("✅ Criterios filtrados correctamente:", criterios);
  } catch (err) {
    console.error("❌ Error cargando criterios:", err);
  }
};


  // -------- Cargar data inicial --------
  useEffect(() => {
    const loadData = async () => {
      try {
        const [resEval, resEmp, resPuestos] = await Promise.all([
          axios.get(`${API_BASE}/evaluacion/`),
          axios.get(`${API_BASE}/empleados/`),
          axios.get(`${API_BASE}/puestos/`),
        ]);

        const evalData = resEval.data.results || resEval.data || [];
        const empData = resEmp.data.results || resEmp.data || [];
        const puestosData = resPuestos.data.results || resPuestos.data || [];

        setEmpleados(empData);

        if (!empleadoSeleccionado && empData.length > 0) {
          setEmpleadoSeleccionado(empData[0].idempleado);
          setQEmpleado(displayName(empData[0]));
        }

        const puestosMap = new Map(
          puestosData.map((p) => [p.idpuesto, p.nombrepuesto])
        );

        let filtradas = evalData.filter(
          (ev) => ev.modalidad !== "Entrevista" && ev.idpostulacion === null
        );

        filtradas.sort(
          (a, b) =>
            new Date(b.fechaevaluacion) - new Date(a.fechaevaluacion)
        );

        const extendidas = filtradas.map((ev) => {
          const emp = empData.find((e) => e.idempleado === ev.idempleado);

          return {
            ...ev,
            nombreEmpleado: emp ? displayName(emp) : "Sin empleado",
            nombrePuesto: emp
              ? puestosMap.get(emp.idpuesto) || "Sin puesto"
              : "Sin puesto",
          };
        });

        setEvaluaciones(extendidas);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setCargando(false);
      }
    };

    loadData();
  }, []);

  // --- Filtro del combobox ---
  const empleadosFiltrados = useMemo(() => {
    const q = qEmpleado.toLowerCase().trim();
    return empleados.filter((e) => displayName(e).toLowerCase().includes(q));
  }, [qEmpleado, empleados]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const seleccionarEmpleado = (emp) => {
    setEmpleadoSeleccionado(empId(emp));
    setQEmpleado(displayName(emp));
    setOpenMenu(false);
  };

  const evaluacionesFiltradas = evaluaciones.filter(
    (ev) => ev.idempleado === Number(empleadoSeleccionado)
  );

  if (cargando) {
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        Cargando evaluaciones...
      </p>
    );
  }
  

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ color: "#023047", fontWeight: 700, marginBottom: "20px" }}>
        Evaluaciones Guardadas
      </h2>

      {/* ---- ComboBox de empleado ---- */}
      <div style={{ marginBottom: "20px", width: "350px" }} ref={wrapperRef}>
        <label
          style={{
            fontWeight: "600",
            color: "#023047",
            marginBottom: "6px",
            display: "block",
          }}
        >
          Seleccionar empleado
        </label>

        <input
          type="text"
          placeholder="Buscar empleado..."
          value={qEmpleado}
          onChange={(e) => {
            setQEmpleado(e.target.value);
            setOpenMenu(true);
          }}
          onFocus={() => setOpenMenu(true)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {openMenu && (
          <div
            style={{
              position: "absolute",
              background: "white",
              width: "350px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              marginTop: "4px",
              maxHeight: "180px",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
            {empleadosFiltrados.length === 0 ? (
              <div style={{ padding: 10, color: "#666" }}>Sin resultados</div>
            ) : (
              empleadosFiltrados.map((emp) => (
                <button
                  key={empId(emp)}
                  type="button"
                  onClick={() => seleccionarEmpleado(emp)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 10,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {displayName(emp)}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ---- Tabla ---- */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr style={{ background: "#023047", color: "white" }}>
            <th style={th}>Modalidad</th>
            <th style={th}>Fecha</th>
            <th style={th}>Empleado</th>
            <th style={th}>Puesto</th>
            <th style={th}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {evaluacionesFiltradas.length === 0 ? (
            <tr>
              <td colSpan="5" style={tdEmpty}>
                No hay evaluaciones para este empleado.
              </td>
            </tr>
          ) : (
            evaluacionesFiltradas.map((ev) => (
              <tr key={ev.idevaluacion}>
                <td style={td}>{ev.modalidad}</td>
                <td style={td}>
                  {new Date(ev.fechaevaluacion).toLocaleDateString()}
                </td>
                <td style={td}>{ev.nombreEmpleado}</td>
                <td style={td}>{ev.nombrePuesto}</td>

                {/* --- Botón de acción --- */}
                <td style={td}>
                  <button
                        onClick={() => cargarCriterios(ev)}
                        style={{
                        padding: "8px 12px",
                        background: "#219ebc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        }}
                    >
                        Cargar Criterios
                    </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// estilos rápidos
const th = {
  padding: "12px",
  textAlign: "left",
  fontWeight: 600,
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

const tdEmpty = {
  padding: "20px",
  textAlign: "center",
  color: "#666",
};

export default EvaluacionesTable;
