import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
import { buttonStyles } from "../../stylesGenerales/buttons";
import ReporteAusenciasPDF from "./ReporteAusenciasPDF"; // 🆕 importar nuevo componente
import {
  BarraFiltros,
  FiltroFechasRango,
  FiltroSelect,
} from "./ReportesFiltros";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const ReportesAusencias = () => {
  const [ausencias, setAusencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mostrarPDF, setMostrarPDF] = useState(false);

  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [tipo, setTipo] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  useEffect(() => {
    fetchAusencias();
    fetchEmpleados();
  }, []);

  const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const partes = fecha.split("-"); // yyyy-mm-dd
  return `${partes[2]}-${partes[1]}-${partes[0]}`; // dd-mm-yyyy
  };

  const fetchAusencias = async () => {
    try {
      const res = await axios.get(`${API}/ausencias/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setAusencias(data);
    } catch (error) {
      showToast("Error al cargar ausencias", "error");
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(data);
    } catch (error) {
      showToast("Error al cargar empleados", "error");
    }
  };

  const obtenerNombreEmpleado = (id) => {
    const emp = empleados.find(
      (e) => e.idempleado === id || e.idEmpleado === id
    );
    return emp ? `${emp.nombre} ${emp.apellido}` : "Sin registro";
  };

  // FILTROS
  const ausenciasFiltradas = ausencias.filter((a) => {
    let pasa = true;

    if (fechaDesde && a.fechainicio < fechaDesde) pasa = false;
    if (fechaHasta && a.fechafin > fechaHasta) pasa = false;
    if (tipo && a.tipo !== tipo) pasa = false;

    return pasa;
  });

  // PAGINACIÓN
  const indexOfLast = paginaActual * elementosPorPagina;
  const indexOfFirst = indexOfLast - elementosPorPagina;
  const dataPaginada = ausenciasFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.ceil(ausenciasFiltradas.length / elementosPorPagina);

  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    setTipo("");
    setPaginaActual(1);
  };

  return (
    <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Reporte de Ausencias
      </h2>

      <BarraFiltros>
        <FiltroFechasRango
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onChangeDesde={(v) => {
            setFechaDesde(v);
            setPaginaActual(1);
          }}
          onChangeHasta={(v) => {
            setFechaHasta(v);
            setPaginaActual(1);
          }}
        />

        <FiltroSelect
          label="Tipo"
          value={tipo}
          onChange={(v) => {
            setTipo(v);
            setPaginaActual(1);
          }}
          options={[
            { value: "Enfermedad", label: "Enfermedad" },
            { value: "Examen", label: "Exámenes" },
            { value: "Personal", label: "Asunto Personal" },
          ]}
          placeholder="Todos"
        />

        <button
          type="button"
          onClick={limpiarFiltros}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            color: "#495057",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            height: "36px",
          }}
        >
          Limpiar
        </button>

        <button
          type="button"
          onClick={() => setMostrarPDF(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#021826",
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            height: "36px",
          }}
        >
          Generar PDF
        </button>
      </BarraFiltros>

      {/* TABLA */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px" }}>Colaborador</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Tipo</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Diagnóstico</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Días</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Lugar</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Fechas</th>
            </tr>
          </thead>
          <tbody>
            {dataPaginada.length > 0 ? (
              dataPaginada.map((a) => (
                <tr key={a.idausencia}>
                  <td style={{ padding: "10px" }}>
                    {obtenerNombreEmpleado(a.idempleado)}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {a.tipo}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {a.diagnostico}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {a.cantidad_dias}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {a.es_iggs ? "IGGS" : a.otro ?? "No registrado"}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                   {formatearFecha(a.fechainicio)} → {formatearFecha(a.fechafin)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No hay registros con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                style={{
                  ...buttonStyles.paginacion.base,
                  ...(paginaActual === i + 1
                    ? buttonStyles.paginacion.activo
                    : buttonStyles.paginacion.inactivo),
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SELECTOR ELEMENTOS POR PÁGINA */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <label style={{ marginRight: "10px", fontWeight: "600" }}>
          Mostrar:
        </label>
        <input
          type="number"
          min="1"
          value={elementosPorPagina}
          onChange={(e) => {
            const n = Number(e.target.value);
            setElementosPorPagina(n > 0 ? n : 1);
            setPaginaActual(1);
          }}
          onFocus={(e) => e.target.select()}
          style={{
            width: "80px",
            padding: "6px",
            borderRadius: "6px",
            border: "1px solid #ced4da",
            textAlign: "center",
          }}
        />
      </div>

      {/* PDF */}
      {mostrarPDF && (
        <ReporteAusenciasPDF
          ausencias={ausenciasFiltradas.map((a) => ({
            ...a,
            empleado: empleados.find(
              (e) =>
                e.idempleado === a.idempleado ||
                e.idEmpleado === a.idempleado
            ),
          }))}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          tipo={tipo}
          onClose={() => setMostrarPDF(false)}
        />
      )}
    </div>
  );
};

export default ReportesAusencias;
