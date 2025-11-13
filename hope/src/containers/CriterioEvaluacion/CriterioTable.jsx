import React, { useRef, useState, useEffect } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const CriterioTable = ({
  criterios,
  handleEdit,
  solicitarDesactivar,
  solicitarActivar,
  paginaActual,
  totalPaginas,
  setPaginaActual,
  busqueda,
  setBusqueda,
  filtroTipo,
  setFiltroTipo,
  filtroVariable,
  setFiltroVariable,
  variables,
  tipos,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => setMenuAbierto(menuAbierto === id ? null : id);

  // 🔹 Generar botones de paginación (máximo 7 visibles)
  const generarBotones = () => {
  const botones = [];
  const maxVisible = 7;

  // Si la cantidad total de páginas es 7 o menos, mostrar todas
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) botones.push(i);
    return botones;
  }

  // 🔹 Si estamos en las primeras páginas (1–4)
  if (paginaActual <= 4) {
    for (let i = 1; i <= 7; i++) botones.push(i);
    botones.push("...");
    botones.push(totalPaginas);
    return botones;
  }

  // 🔹 Si estamos en las últimas páginas (total-3 hasta total)
  if (paginaActual >= totalPaginas - 3) {
    botones.push(1);
    botones.push("...");
    for (let i = totalPaginas - 6; i <= totalPaginas; i++) botones.push(i);
    return botones;
  }

  // 🔹 Si estamos en páginas intermedias
  botones.push(1);
  botones.push("...");

  for (let i = paginaActual - 2; i <= paginaActual + 2; i++) {
    botones.push(i);
  }

  botones.push("...");
  botones.push(totalPaginas);

  return botones;
};



  return (
    <div
      ref={containerRef}
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "25px 30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* Filtros */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "25px",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {/* Combo Tipo Evaluación */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#333", fontWeight: "500", whiteSpace: "nowrap" }}>
            Tipo de Evaluación:
          </span>
          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setFiltroVariable("");
              setPaginaActual(1);
            }}
            style={{
              width: "200px",
              height: "36px",
              borderRadius: 6,
              border: "1px solid #ccc",
              padding: "0 8px",
              fontSize: "14px",
            }}
          >
            <option value="">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.idtipoevaluacion} value={t.idtipoevaluacion}>
                {t.nombretipo}
              </option>
            ))}
          </select>
        </div>

        {/* Combo Variable */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#333", fontWeight: "500", whiteSpace: "nowrap" }}>
            Variable:
          </span>
          <select
            value={filtroVariable}
            onChange={(e) => {
              setFiltroVariable(e.target.value);
              setPaginaActual(1);
            }}
            style={{
              width: "220px",
              height: "36px",
              borderRadius: 6,
              border: "1px solid #ccc",
              padding: "0 8px",
              fontSize: "14px",
            }}
          >
            <option value="">Todas las variables</option>
            {variables
              .filter((v) => !filtroTipo || v.idtipoevaluacion === Number(filtroTipo))
              .map((v) => (
                <option key={v.idvariable} value={v.idvariable}>
                  {v.nombrevariable}
                </option>
              ))}
          </select>
        </div>

        {/* Botón Limpiar */}
        <button
          onClick={() => {
            setBusqueda("");
            setFiltroTipo("");
            setFiltroVariable("");
            setPaginaActual(1);
          }}
          style={{
            height: "36px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "0 12px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {/* 🔹 Tabla */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr>
            <th style={thStyle}>Nombre del Criterio</th>
            <th style={thStyle}>Descripción</th>
            <th style={thStyle}>Variable</th>
            <th style={thStyle}>Tipo de Evaluación</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Estado</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {criterios.length > 0 ? (
            criterios.map((criterio) => {
              const variable = variables.find((v) => v.idvariable === criterio.idvariable);
              const tipo = variable
                ? tipos.find((t) => t.idtipoevaluacion === variable.idtipoevaluacion)
                : null;

              const esDefault = criterio.idcriterio <= 98; // Criterios protegidos

              return (
                <tr key={criterio.idcriterio}>
                  <td style={tdStyle}>{criterio.nombrecriterio}</td>
                  <td style={tdStyle}>{criterio.descripcioncriterio || "—"}</td>
                  <td style={tdStyle}>{variable ? variable.nombrevariable : "—"}</td>
                  <td style={tdStyle}>{tipo ? tipo.nombretipo : "—"}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      color: criterio.estado ? "green" : "red",
                      fontWeight: "600",
                    }}
                  >
                    {criterio.estado ? "Activo" : "Inactivo"}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", position: "relative" }}>
                    <div style={comboBoxStyles.container}>
                      <button
                        onClick={() => toggleMenu(criterio.idcriterio)}
                        style={comboBoxStyles.button.base}
                      >
                        Opciones ▾
                      </button>

                      {menuAbierto === criterio.idcriterio && (
                        <div style={comboBoxStyles.menu.container}>
                          {esDefault ? (
                            <>
                              <button
                                disabled
                                style={{
                                  ...comboBoxStyles.menu.item.editar.base,
                                  opacity: 0.6,
                                  cursor: "not-allowed",
                                }}
                              >
                                No editable
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(criterio)}
                                disabled={!criterio.estado}
                                style={comboBoxStyles.menu.item.editar.base}
                              >
                                Editar
                              </button>

                              {criterio.estado ? (
                                <button
                                  onClick={() => solicitarDesactivar(criterio)}
                                  style={comboBoxStyles.menu.item.desactivar.base}
                                >
                                  Desactivar
                                </button>
                              ) : (
                                <button
                                  onClick={() => solicitarActivar(criterio)}
                                  style={comboBoxStyles.menu.item.activar.base}
                                >
                                  Activar
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No hay criterios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔹 Paginación */}
      {totalPaginas > 1 && (
        <div style={{ marginTop: "25px", textAlign: "center" }}>
          {generarBotones().map((num, index) =>
            num === "..." ? (
              <span key={`ellipsis-${index}`} style={{ margin: "0 6px", color: "#888" }}>
                ...
              </span>
            ) : (
              <button
                key={`page-${num}`}
                onClick={() => setPaginaActual(num)}
                style={{
                  ...buttonStyles.paginacion.base,
                  ...(paginaActual === num
                    ? buttonStyles.paginacion.activo
                    : buttonStyles.paginacion.inactivo),
                }}
              >
                {num}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Estilos
const thStyle = {
  borderBottom: "2px solid #eee",
  padding: "10px 8px",
  textAlign: "left",
  fontWeight: "bold",
  color: "#333",
};
const tdStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #f0f0f0",
  color: "#555",
  fontSize: "14px",
};

export default CriterioTable;
