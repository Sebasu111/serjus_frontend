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

import ReporteConvocatoriasPDF from "./ReporteConvocatoriasPDF"; // (se implementará después)

const ReportesConvocatorias = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [aspirantes, setAspirantes] = useState([]);

  const [mostrarPDF, setMostrarPDF] = useState(false);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  useEffect(() => {
    fetchConvocatorias();
    fetchPostulaciones();
    fetchAspirantes();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/convocatorias/");
      setConvocatorias(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar convocatorias", "error");
    }
  };

  const fetchPostulaciones = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/postulaciones/");
      setPostulaciones(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar postulaciones", "error");
    }
  };

  const fetchAspirantes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/aspirantes/");
      setAspirantes(res.data.results || res.data || []);
    } catch {
      showToast("Error al cargar aspirantes", "error");
    }
  };

  // Obtener número total de postulaciones por convocatoria
  const getPostulacionesPorConvocatoria = (id) =>
    postulaciones.filter((p) => p.idconvocatoria === id).length;

  // FILTROS
  const convocatoriasFiltradas = convocatorias.filter((c) => {
    let pasa = true;
    if (fechaDesde && c.fechainicio < fechaDesde) pasa = false;
    if (fechaHasta && c.fechafin > fechaHasta) pasa = false;
    if (estado && String(c.estado) !== estado) pasa = false;
    return pasa;
  });

  // PAGINACIÓN
  const indexOfLast = paginaActual * elementosPorPagina;
  const indexOfFirst = indexOfLast - elementosPorPagina;
  const dataPaginada = convocatoriasFiltradas.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.ceil(convocatoriasFiltradas.length / elementosPorPagina);

  const limpiarFiltros = () => {
    setFechaDesde("");
    setFechaHasta("");
    setEstado("");
    setPaginaActual(1);
  };

  return (
    <div style={{ width: "min(1100px, 96vw)", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Reporte de Convocatorias
      </h2>

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
            { value: "false", label: "Cerradas" }
          ]}
          placeholder="Todas"
        />

        <button type="button" onClick={limpiarFiltros}
          style={{ padding: "8px 16px", borderRadius: "4px",
            border: "1px solid #ced4da", backgroundColor: "#fff",
            cursor: "pointer", height: "36px" }}>
          Limpiar
        </button>

        <button type="button" onClick={() => setMostrarPDF(true)}
          style={{ padding: "8px 16px", borderRadius: "4px",
            backgroundColor: "#021826", color: "white",
            border: "none", cursor: "pointer", height: "36px" }}>
          Generar PDF
        </button>
      </BarraFiltros>

      {/* TABLA */}
      <div style={{
        background: "#fff", borderRadius: "12px",
        padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px" }}>Convocatoria</th>
              <th style={{ padding: "10px" }}>Puesto</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Fechas</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Postulaciones</th>
            </tr>
          </thead>
          <tbody>
            {dataPaginada.length > 0 ? (
              dataPaginada.map((c) => (
                <tr key={c.idconvocatoria}>
                  <td style={{ padding: "10px" }}>{c.nombreconvocatoria}</td>
                  <td style={{ padding: "10px" }}>{c.nombrepuesto}</td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {c.fechainicio} → {c.fechafin}
                  </td>
                  <td style={{ textAlign: "center", padding: "10px" }}>
                    {getPostulacionesPorConvocatoria(c.idconvocatoria)}
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

      {mostrarPDF && (
  <ReporteConvocatoriasPDF
    convocatorias={convocatoriasFiltradas}
    postulaciones={postulaciones}
    aspirantes={aspirantes}  
    fechaDesde={fechaDesde}
    fechaHasta={fechaHasta}
    estado={estado}
    onClose={() => setMostrarPDF(false)}
  />
)}

    </div>
  );
};

export default ReportesConvocatorias;
