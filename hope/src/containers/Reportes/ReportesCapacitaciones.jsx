import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
import { buttonStyles } from "../../stylesGenerales/buttons";

// Componentes reutilizables de filtros
import {
  BarraFiltros,
  FiltroFechasRango,
  FiltroSelect,
} from "./ReportesFiltros";

import ReporteCapacitacionesPDF from "./ReporteCapacitacionesPDF"; // ⬅️ Luego lo implementaremos

const ReportesCapacitaciones = () => {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [empleadoCap, setEmpleadoCap] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [mostrarPDF, setMostrarPDF] = useState(false);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina] = useState(5);

  useEffect(() => {
    fetchCapacitaciones();
    fetchEmpleadoCap();
    fetchEmpleados();
  }, []);

  const fetchCapacitaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
      setCapacitaciones(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar capacitaciones", "error");
    }
  };

  const fetchEmpleadoCap = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      setEmpleadoCap(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar empleados por capacitación", "error");
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
      setEmpleados(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar empleados", "error");
    }
  };

  // 📌 Obtener cuántos empleados tiene una capacitación
  const getParticipantes = (id) =>
    empleadoCap.filter((e) => e.idcapacitacion === id).length;

  // 📌 FILTROS
  const filtradas = capacitaciones.filter((c) => {
    let pasa = true;
    if (fechaDesde && c.fechainicio < fechaDesde) pasa = false;
    if (fechaHasta && c.fechafin > fechaHasta) pasa = false;
    if (estado && String(c.estado) !== estado) pasa = false;
    return pasa;
  });

  // 📌 PAGINACIÓN
  const indexLast = paginaActual * porPagina;
  const indexFirst = indexLast - porPagina;
  const dataPaginada = filtradas.slice(indexFirst, indexLast);
  const totalPaginas = Math.ceil(filtradas.length / porPagina);

  const limpiar = () => {
    setFechaDesde("");
    setFechaHasta("");
    setEstado("");
    setPaginaActual(1);
  };

  return (
    <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Reporte de Capacitaciones
      </h2>

      {/* 🔹 FILTROS */}
      <BarraFiltros>
        <FiltroFechasRango
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onChangeDesde={(v) => { setFechaDesde(v); setPaginaActual(1); }}
          onChangeHasta={(v) => { setFechaHasta(v); setPaginaActual(1); }}
        />

        <FiltroSelect
          label="Estado"
          value={estado}
          onChange={(v) => { setEstado(v); setPaginaActual(1); }}
          options={[
            { value: "true", label: "Activas" },
            { value: "false", label: "Cerradas" },
          ]}
          placeholder="Todas"
        />

        <button type="button" onClick={limpiar}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            backgroundColor: "#fff",
            cursor: "pointer",
            height: "36px",
          }}>
          Limpiar
        </button>

        <button type="button" onClick={() => setMostrarPDF(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#021826",
            color: "white",
            border: "none",
            cursor: "pointer",
            height: "36px",
          }}>
          Generar PDF
        </button>
      </BarraFiltros>

      {/* 🔹 TABLA */}
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
              <th style={{ padding: "10px" }}>Evento</th>
              <th style={{ padding: "10px" }}>Lugar</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Fechas</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Participantes</th>
            </tr>
          </thead>
          <tbody>
            {dataPaginada.length > 0 ? (
              dataPaginada.map((c) => (
                <tr key={c.idcapacitacion}>
                  <td style={{ padding: "10px" }}>{c.nombreevento}</td>
                  <td style={{ padding: "10px" }}>{c.lugar}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {c.fechainicio} → {c.fechafin}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {getParticipantes(c.idcapacitacion)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  No hay registros con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ▶ PAGINACIÓN */}
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

      {/* 🔹 MODAL PDF */}
      {mostrarPDF && (
        <ReporteCapacitacionesPDF
          capacitaciones={filtradas}
          asistencias={empleadoCap}
          empleados={empleados}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          estado={estado}
          onClose={() => setMostrarPDF(false)}
        />
      )}
    </div>
  );
};

export default ReportesCapacitaciones;
