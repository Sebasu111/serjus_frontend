import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
import { buttonStyles } from "../../stylesGenerales/buttons";
import ReporteAusenciasPDF from "./ReporteAusenciasPDF";
import {
  BarraFiltros,
  FiltroFechasRango,
  FiltroSelect,
  FiltroEmpleadoSearch,
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
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const idRol = parseInt(sessionStorage.getItem("idRol"));
  const idUsuario = parseInt(sessionStorage.getItem("idUsuario"));
  const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

  const esCoordinador = idRol === 1;

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  useEffect(() => {
    if (empleados.length > 0) {
      fetchAusencias();
    }
  }, [empleados]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const partes = fecha.split("-");
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  };

  const fetchAusencias = async () => {
    try {

      const [
        resAusencias,
        resEquipos,
        resEmpleados
      ] = await Promise.all([

        axios.get(`${API}/ausencias/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),

        axios.get(`${API}/equipos/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),

        axios.get(`${API}/empleados/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const ausenciasData = Array.isArray(resAusencias.data)
        ? resAusencias.data
        : Array.isArray(resAusencias.data.results)
          ? resAusencias.data.results
          : [];

      const equiposData = Array.isArray(resEquipos.data)
        ? resEquipos.data
        : resEquipos.data.results || [];

      const empleadosData = Array.isArray(resEmpleados.data)
        ? resEmpleados.data
        : resEmpleados.data.results || [];

      let ausenciasFiltradas = ausenciasData;

      // 🔥 SOLO PARA COORDINADOR
      if (
        usuarioActual &&
        Number(usuarioActual.idrol) === 1
      ) {

        // buscar equipo del coordinador
        const miEquipo = equiposData.find(
          (eq) =>
            Number(eq.idcoordinador) ===
            Number(usuarioActual.idempleado)
        );

        if (miEquipo) {

          // ids de empleados del equipo
          const idsEquipo = empleadosData
            .filter(
              (emp) =>
                Number(emp.idequipo) ===
                Number(miEquipo.idequipo)
            )
            .map((emp) =>
              Number(emp.idempleado)
            );

          // agregar coordinador
          idsEquipo.push(
            Number(usuarioActual.idempleado)
          );

          // filtrar ausencias
          ausenciasFiltradas = ausenciasData.filter(
            (ausencia) =>
              idsEquipo.includes(
                Number(ausencia.idempleado)
              )
          );

        } else {

          // si no tiene equipo → vacío
          ausenciasFiltradas = [];
        }
      }

      setAusencias(ausenciasFiltradas);

    } catch (error) {
      console.error(error);
      showToast("Error al cargar ausencias", "error");
    }
  };

  const fetchEmpleados = async () => {
    try {

      const [
        resEmpleados,
        resEquipos
      ] = await Promise.all([

        axios.get(`${API}/empleados/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),

        axios.get(`${API}/equipos/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const empleadosData = Array.isArray(resEmpleados.data)
        ? resEmpleados.data
        : Array.isArray(resEmpleados.data.results)
          ? resEmpleados.data.results
          : [];

      const equiposData = Array.isArray(resEquipos.data)
        ? resEquipos.data
        : resEquipos.data.results || [];

      let empleadosFiltrados = empleadosData;

      // 🔥 SOLO PARA COORDINADOR
      if (
        usuarioActual &&
        Number(usuarioActual.idrol) === 1
      ) {

        // buscar equipo del coordinador
        const miEquipo = equiposData.find(
          (eq) =>
            Number(eq.idcoordinador) ===
            Number(usuarioActual.idempleado)
        );

        if (miEquipo) {

          empleadosFiltrados = empleadosData.filter(
            (emp) =>
              Number(emp.idequipo) ===
              Number(miEquipo.idequipo)
          );

        } else {

          empleadosFiltrados = [];
        }
      }

      setEmpleados(empleadosFiltrados);

    } catch (error) {
      console.error(error);
      showToast("Error al cargar Trabajadores", "error");
    }
  };

  const obtenerNombreEmpleado = (id) => {
    const emp = empleados.find((e) => e.idempleado === id || e.idEmpleado === id);
    return emp ? `${emp.nombre} ${emp.apellido}` : "Sin registro";
  };

  // FILTROS
  const ausenciasFiltradas = ausencias.filter((a) => {
    let pasa = true;

    if (fechaDesde && a.fechainicio < fechaDesde) pasa = false;
    if (fechaHasta && a.fechafin > fechaHasta) pasa = false;
    if (tipo && a.tipo !== tipo) pasa = false;
    if (empleadoSeleccionado && a.idempleado !== Number(empleadoSeleccionado)) pasa = false;

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
    setEmpleadoSeleccionado("");
    setPaginaActual(1);
  };

  return (
    <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Reporte de Ausencias
      </h2>

      <BarraFiltros>

        {/* FILTRO EMPLEADO */}
        <FiltroEmpleadoSearch
          empleados={empleados}
          value={empleadoSeleccionado}
          onChange={(v) => {
            setEmpleadoSeleccionado(Number(v));  // 👈 aseguramos número
            setPaginaActual(1);
          }}
        />

        {/* FILTRO FECHAS */}
        <FiltroFechasRango
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          minHasta={fechaDesde}
          onChangeDesde={(v) => {
            setFechaDesde(v);
            setPaginaActual(1);
            if (fechaHasta && v > fechaHasta) setFechaHasta(v);
          }}
          onChangeHasta={(v) => {
            if (fechaDesde && v < fechaDesde) {
              showToast("La fecha de fin no puede ser menor que la fecha de inicio", "warning");
              return;
            }
            setFechaHasta(v);
            setPaginaActual(1);
          }}
        />

        {/* FILTRO TIPO */}
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

        {/* BOTONES */}
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
              <th style={{ padding: "10px" }}>Trabajador</th>
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
                  <td style={{ textAlign: "center", padding: "10px" }}>{a.tipo}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{a.diagnostico}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>{a.cantidad_dias}</td>
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
            border: "1px solid #ced4da",   // 🔥 FIX
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
          empleado={empleadoSeleccionado}
          onClose={() => setMostrarPDF(false)}
        />
      )}
    </div>
  );
};

export default ReportesAusencias;
