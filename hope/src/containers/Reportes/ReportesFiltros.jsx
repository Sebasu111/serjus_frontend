// src/containers/Reportes/ReportesFiltros.jsx
import React, { useState, useRef, useEffect } from "react";
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
        {/* FECHA DESDE */}
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

        {/* FECHA HASTA — DESHABILITA DÍAS MENORES A FECHA DESDE */}
        <input
          type="date"
          value={fechaHasta || ""}
          min={fechaDesde || ""}       // ⬅️ ESTA LÍNEA DESHABILITA FECHAS PREVIAS EN EL CALENDARIO
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

export const FiltroEmpleadoSearch = ({
  empleados,
  value,
  onChange,
  label = "Colaborador/a",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const activos = empleados.filter((e) => e.estado === true);

  const filtrados = activos.filter((emp) =>
    `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  // Cerrar lista cuando se hace clic afuera
  useEffect(() => {
    const handleClick = (e) => {
      if (!inputRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSelect = (emp) => {
    onChange(emp.idempleado);
    setSearch(`${emp.nombre} ${emp.apellido}`);
    setOpen(false);
  };

  // Mantener el texto sincronizado cuando cambia el value desde fuera
  useEffect(() => {
    const emp = activos.find((e) => e.idempleado === value);
    setSearch(emp ? `${emp.nombre} ${emp.apellido}` : "");
  }, [value, empleados]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: "240px", position: "relative" }}>
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

      {/* ComboBox input */}
      <div ref={inputRef}>
        <input
          type="text"
          placeholder="Buscar colaborador..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            onChange(""); // limpia selección mientras se escribe
          }}
          onFocus={() => setOpen(true)}
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: "4px",
            border: "1px solid #ced4da",
            fontSize: "13px",
          }}
        />

        {open && (
          <ul
            style={{
              position: "absolute",
              top: "65px",
              left: 0,
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              background: "#fff",
              listStyle: "none",
              border: "1px solid #ced4da",
              borderRadius: "4px",
              margin: 0,
              padding: 0,
              zIndex: 99,
            }}
          >
            <li
              onClick={() => {
                setSearch("");
                onChange("");
                setOpen(false);
              }}
              style={{
                padding: "7px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background: value === "" ? "#e9ecef" : "transparent",
              }}
            >
              Todos los empleados
            </li>

            {filtrados.length === 0 && (
              <li style={{ padding: "8px 12px", color: "#777" }}>
                Sin resultados
              </li>
            )}

            {filtrados.map((emp) => (
              <li
                key={emp.idempleado}
                onClick={() => handleSelect(emp)}
                style={{
                  padding: "7px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f1f1f1")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {emp.nombre} {emp.apellido}
              </li>
            ))}
          </ul>
        )}
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
