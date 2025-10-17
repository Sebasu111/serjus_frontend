// components/usuarios/TableUsuarios.jsx
import React from "react";


const TableUsuarios = ({
  usuariosPaginados,
  handleEdit,
  handleDelete,
  handleActivate,
  idUsuarioLogueado,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Usuario", "Estado", "Acciones"].map(h => (
              <th key={h} style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center", fontWeight: "600", background: "#f8f9fa" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.length > 0 ? usuariosPaginados.map(u => (
            <tr key={u.idusuario}>
              <td style={{ padding: "10px", textAlign: "center", whiteSpace: "nowrap", borderBottom: "1px solid #f0f0f0" }}>
                {u.nombreusuario}
              </td>
              <td style={{ padding: "10px", textAlign: "center", width: "120px", color: u.estado ? "green" : "red", fontWeight: "600", borderBottom: "1px solid #f0f0f0" }}>
                {u.estado ? "Activo" : "Inactivo"}
              </td>
              <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                <button
                  onClick={() => handleEdit(u)}
                  disabled={!u.estado || u.idusuario === idUsuarioLogueado}
                  style={{
                    marginRight: "8px",
                    whiteSpace: "nowrap",
                    justifyContent: "center",
                    display: "inline-flex",
                    width: "110px",
                    padding: "6px 14px",
                    background: u.estado && u.idusuario !== idUsuarioLogueado ? "#FED7AA" : "#6c757d",
                    color: "#7C2D12",
                    border: "none",
                    borderRadius: "5px",
                    cursor: u.estado && u.idusuario !== idUsuarioLogueado ? "pointer" : "not-allowed",
                  }}
                >
                  Editar
                </button>
                {u.estado ? (
                  <button
                    onClick={() => handleDelete(u.idusuario)}
                    disabled={u.idusuario === idUsuarioLogueado}
                    style={{
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      width: "110px",
                      padding: "6px 14px",
                      background: u.idusuario !== idUsuarioLogueado ? "#FCA5A5" : "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: u.idusuario !== idUsuarioLogueado ? "pointer" : "not-allowed",
                    }}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(u.idusuario)}
                    disabled={u.idusuario === idUsuarioLogueado}
                    style={{
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      width: "110px",
                      padding: "6px 14px",
                      background: u.idusuario !== idUsuarioLogueado ? "#FED7AA" : "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: u.idusuario !== idUsuarioLogueado ? "pointer" : "not-allowed",
                    }}
                  >
                    Activar
                  </button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
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
};

export default TableUsuarios;