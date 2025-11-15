import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const EvaluacionesTable = ({ onSeleccionarEvaluacion }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [qEmpleado, setQEmpleado] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  const wrapperRef = useRef(null);

  const displayName = (e) => `${e.nombre} ${e.apellido}`;
  const empId = (e) => e.idempleado ?? e.idEmpleado;

  const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

  // 🔹 Cargar usuario logueado
  useEffect(() => {
    if (!idUsuarioLogueado) return;
    axios
      .get(`${API_BASE}/usuarios/${idUsuarioLogueado}/`)
      .then((res) => setUsuario(res.data))
      .catch((err) => console.error("Error cargando usuario:", err));
  }, [idUsuarioLogueado]);

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

        const puestosMap = new Map(
          puestosData.map((p) => [p.idpuesto, p.nombrepuesto])
        );

        let filtradas = evalData.filter(
          (ev) => ev.modalidad !== "Entrevista" && ev.idpostulacion === null
        );

        filtradas.sort(
          (a, b) => new Date(b.fechaevaluacion) - new Date(a.fechaevaluacion)
        );

        const extendidas = filtradas.map((ev) => {
          const emp = empData.find((e) => e.idempleado === ev.idempleado);
          return {
            ...ev,
            empleado: emp,
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

  // 🔥 FILTRO DEL COMBOBOX POR PUESTO
  const empleadosFiltrados = useMemo(() => {
    let filtrados = [...empleados];

    const empLog = empleados.find((e) => e.idempleado === usuario?.idempleado);
    const equipoUsuario = empLog?.idequipo;

    filtrados = filtrados.filter((e) => e.idempleado !== usuario?.idempleado);
    filtrados = filtrados.filter(
      (e) => !(e.nombre === "Empleado" && e.apellido === "Default")
    );

    if (usuario?.idrol === 5) {
      // Admin → ve todos
    } else if (usuario?.idrol === 4) {
      filtrados = filtrados.filter((e) => [2, 3, 4].includes(e.idpuesto));
    } else {
      filtrados = filtrados.filter(
        (e) => e.idequipo !== null && e.idequipo === equipoUsuario
      );
    }

    const q = qEmpleado.toLowerCase().trim();
    return filtrados.filter((e) => displayName(e).toLowerCase().includes(q));
  }, [qEmpleado, empleados, usuario]);

  const seleccionarEmpleado = (emp) => {
    setEmpleadoSeleccionado(empId(emp));
    setQEmpleado(displayName(emp));
    setOpenMenu(false);
  };

  // 🔥 Aquí agrupamos evaluaciones: auto + supervisor por empleado
  const evaluacionesFiltradas = useMemo(() => {
    const delEmpleado = evaluaciones.filter(
      (ev) => ev.idempleado === Number(empleadoSeleccionado)
    );

    const auto = delEmpleado.find((e) => e.modalidad === "Autoevaluación") || null;
    const coord = delEmpleado.find((e) => e.modalidad === "Evaluacion") || null;

    // SI NO HAY AUTOEVALUACIÓN → NO SE DEBE MOSTRAR NADA
    if (!auto) return [];

    return [
      {
        auto,
        coord,
        puedeEvaluarse: !!auto && !coord,   // Auto ✔ y NO hay Evaluacion → Evaluar
        puedeConsultarse: !!auto && !!coord // Auto + Evaluacion → Ver Evaluación Final
      }
    ];
  }, [evaluaciones, empleadoSeleccionado]);


  if (cargando || !usuario) {
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

      {/* ---- ComboBox ---- */}
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
            <th style={th}>Estado</th>
            <th style={th}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {evaluacionesFiltradas.length === 0 ||
          (!evaluacionesFiltradas[0].auto &&
            !evaluacionesFiltradas[0].coord) ? (
            <tr>
              <td colSpan="5" style={tdEmpty}>
                El empleado aún no tiene autoevaluación.
              </td>
            </tr>
          ) : (
            evaluacionesFiltradas.map((item, i) => (
              <tr key={i}>
                <td style={td}>
                  {item.puedeEvaluarse && (
                    <span style={{ color: "green", fontWeight: "600" }}>
                      Autoevaluado - Falta Evaluación
                    </span>
                  )}
                  {item.puedeConsultarse && (
                    <span style={{ color: "#023047", fontWeight: "600" }}>
                      Evaluación Finalizada
                    </span>
                  )}
                </td>

                <td style={td}>
                 <td style={td}>
                    {/* Autoevaluado y NO tiene evaluación final → ADMIN puede evaluar */}
                    {item.puedeEvaluarse && (
                      <button
                        onClick={() => onSeleccionarEvaluacion(item.auto)}
                        style={btnPrimary}
                      >
                        Evaluar
                      </button>
                    )}

                    {/* Si ya tiene evaluación final → NO mostrar botones */}
                    {item.puedeConsultarse && (
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#6c757d",
                          opacity: 0.8,
                        }}
                      >
                        (Evaluacion Finalizada)
                      </span>
                    )}
                  </td>
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

const btnPrimary = {
  padding: "8px 12px",
  background: "#219ebc",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  marginRight: "6px",
};

const btnGray = {
  padding: "8px 12px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

export default EvaluacionesTable;
