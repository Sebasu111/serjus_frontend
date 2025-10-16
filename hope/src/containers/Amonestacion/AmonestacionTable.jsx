import React from "react";

const AmonestacionTable = ({ amonestaciones, handleEdit, handleDelete, handleActivate }) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px 30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        maxHeight: "600px",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
        Amonestaciones Registradas
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Empleado</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Tipo</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Fecha</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Motivo</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Documento</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Estado</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {amonestaciones.length > 0 ? (
            amonestaciones.map((a) => (
              <tr key={a.idamonestacion}>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {a.idempleado || "N/A"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {a.tipo}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {a.fechaamonestacion}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {a.motivo}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                  {a.iddocumento}
                </td>
                <td style={{ padding: "10px", textAlign: "center", color: a.estado ? "green" : "red", fontWeight: "600" }}>
                  {a.estado ? "Activo" : "Inactivo"}
                </td>
                <td style={{ padding: "10px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    <button
                      onClick={() => handleEdit(a)}
                      style={{
                        padding: "6px 14px",
                        background: " #FED7AA",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>
                    {a.estado ? (
                      <button
                        onClick={() => handleDelete(a.idamonestacion)}
                        style={{
                          padding: "6px 14px",
                          background: "#F87171",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(a.idamonestacion)}
                        style={{
                          padding: "6px 14px",
                          background: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Activar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No hay amonestaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AmonestacionTable;
