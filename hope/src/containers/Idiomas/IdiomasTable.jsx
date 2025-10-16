import React from "react";

const IdiomasTable = ({
  idiomas,
  handleEdit,
  handleDelete,
  handleActivate,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => (
  <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Nombre</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {idiomas.length > 0 ? (
          idiomas.map((idioma) => (
            <tr key={idioma.ididioma}>
              <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{idioma.nombreidioma}</td>
              <td style={{ padding: "10px", textAlign: "center", color: idioma.estado ? "green" : "red", fontWeight: "600", borderBottom: "1px solid #f0f0f0" }}>
                {idioma.estado ? "Activo" : "Inactivo"}
              </td>
              <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                <button
                  onClick={() => handleEdit(idioma)}
                  disabled={!idioma.estado}
                  style={{
                    padding: "6px 14px",
                    background: idioma.estado ? "#FED7AA" : "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: idioma.estado ? "pointer" : "not-allowed",
                    marginRight: "6px",
                  }}
                >
                  Editar
                </button>
                {idioma.estado ? (
                  <button
                    onClick={() => handleDelete(idioma)}
                    style={{ padding: "6px 14px", background: "#F87171", color: "#fff", border: "none", borderRadius: "5px" }}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(idioma.ididioma)}
                    style={{ padding: "6px 14px", background: "#FED7AA", color: "#fff", border: "none", borderRadius: "5px" }}
                  >
                    Activar
                  </button>
                )}
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
              margin: "0 5px",
              padding: "6px 12px",
              border: "1px solid #219ebc",
              background: paginaActual === i + 1 ? "#219ebc" : "#fff",
              color: paginaActual === i + 1 ? "#fff" : "#219ebc",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default IdiomasTable;
