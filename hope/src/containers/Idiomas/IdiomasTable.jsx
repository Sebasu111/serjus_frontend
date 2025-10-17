import React, { useState, useRef, useEffect } from "react";
import { buttonStyles } from "../../stylesGenerales/buttons";

const IdiomasTable = ({
  idiomas,
  handleEdit,
  handleDelete,
  handleActivate,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRef = useRef(null);

  // cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => {
    setMenuAbierto(menuAbierto === id ? null : id);
  };

  return (
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
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
              Nombre
            </th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
              Estado
            </th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {idiomas.length > 0 ? (
            idiomas.map((idioma) => (
              <tr key={idioma.ididioma}>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {idioma.nombreidioma}
                </td>
                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    color: idioma.estado ? "green" : "red",
                    fontWeight: "600",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {idioma.estado ? "Activo" : "Inactivo"}
                </td>

                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                    position: "relative",
                  }}
                  ref={menuRef}
                >
                  {/* BOTÓN COMBOBOX */}
                  <div style={{ position: "relative", display: "inline-block", width: "130px" }}>
                    <button
                      onClick={() => toggleMenu(idioma.ididioma)}
                      style={{
                        ...buttonStyles.base,
                        background: "#E5E7EB",
                        color: "#0A0A0A",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      Opciones ▾
                    </button>

                    {/* LISTA DEL COMBOBOX */}
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        background: "#E5E7EB",
                        border: "1px solid #ccc",
                        borderTop: "none",
                        borderRadius: "0 0 6px 6px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        zIndex: 5,
                        display: menuAbierto === idioma.ididioma ? "block" : "none",
                      }}
                    >
                      {/* OPCIONES */}
                      <button
                        onClick={() => idioma.estado && handleEdit(idioma)}
                        disabled={!idioma.estado}
                        style={{
                          ...buttonStyles.base,
                          ...(idioma.estado
                            ? buttonStyles.editarActivo
                            : buttonStyles.editarInactivo),
                          width: "100%",
                          borderRadius: 0,
                          padding: "8px 0",
                        }}
                      >
                        Editar
                      </button>

                      {idioma.estado ? (
                        <button
                          onClick={() => handleDelete(idioma)}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.desactivar,
                            width: "100%",
                            borderRadius: 0,
                            padding: "8px 0",
                          }}
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(idioma.ididioma)}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.activar,
                            width: "100%",
                            borderRadius: 0,
                            padding: "8px 0",
                          }}
                        >
                          Activar
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                No hay idiomas registrados
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
  );
};

export default IdiomasTable;
