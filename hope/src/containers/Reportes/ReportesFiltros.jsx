// src/containers/Reportes/ReportesFiltros.jsx
import React from "react";

/**
 * Contenedor general para la barra de filtros.
 * Lo usas como:
 * <BarraFiltros>
 *   ...aquí van FiltroFechasRango, FiltroSelect, etc...
 * </BarraFiltros>
 */
export const BarraFiltros = ({ children }) => {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px 20px",
          alignItems: "flex-end",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * Filtro de rango de fechas (desde / hasta)
 */
export const FiltroFechasRango = ({
  label = "Rango de fechas",
  fechaDesde,
  fechaHasta,
  onChangeDesde,
  onChangeHasta,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: "220px" }}>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#023047",
          marginBottom: "4px",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="date"
          value={fechaDesde || ""}
          onChange={(e) => onChangeDesde && onChangeDesde(e.target.value)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            fontSize: "13px",
          }}
        />
        <input
          type="date"
          value={fechaHasta || ""}
          onChange={(e) => onChangeHasta && onChangeHasta(e.target.value)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            fontSize: "13px",
          }}
        />
      </div>
    </div>
  );
};

/**
 * Filtro genérico tipo select
 * options = [{ value: "1", label: "Opción 1" }, ...]
 */
export const FiltroSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Seleccione...",
  minWidth = "200px",
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth }}>
      {label && (
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#023047",
            marginBottom: "4px",
          }}
        >
          {label}
        </span>
      )}
      <select
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          padding: "6px 10px",
          borderRadius: "4px",
          border: "1px solid #ced4da",
          fontSize: "13px",
          backgroundColor: "white",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
            {opt.label ?? opt.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Botones de acción típicos para reportes:
 * - Buscar
 * - Limpiar
 * - (después podemos meter Exportar, etc.)
 */
export const FiltroAcciones = ({
  onBuscar,
  onLimpiar,
  textoBuscar = "Buscar",
  textoLimpiar = "Limpiar",
}) => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        type="button"
        onClick={onBuscar}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          border: "none",
          backgroundColor: "#023047",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {textoBuscar}
      </button>
      <button
        type="button"
        onClick={onLimpiar}
        style={{
          padding: "8px 16px",
          borderRadius: "4px",
          border: "1px solid #ced4da",
          backgroundColor: "#fff",
          color: "#495057",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {textoLimpiar}
      </button>
    </div>
  );
};
