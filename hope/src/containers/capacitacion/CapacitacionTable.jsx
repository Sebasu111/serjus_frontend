import React from "react";

const CapacitacionesTable = ({
  capacitaciones,
  handleEdit,
  handleDelete,
  handleActivate,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => (
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
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Evento</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Lugar</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Fechas</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Institución</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "right" }}>Monto</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
          <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {capacitaciones.length > 0 ? (
          capacitaciones.map((c) => {
            const id = c.idcapacitacion || c.id;
            return (
              <tr key={id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.nombreevento}</td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.lugar}</td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  {c.fechainicio} - {c.fechafin}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.institucionfacilitadora}</td>
                <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                  {c.montoejecutado || 0}
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0", fontWeight: "600", color: c.estado ? "#28a745" : "#dc3545" }}>
                  {c.estado ? "Activo" : "Inactivo"}
                </td>
                <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                    <button
                      onClick={() => handleEdit(c)}
                      disabled={!c.estado}
                      style={{
                        padding: "6px 14px",
                        background: c.estado ? "#fb8500" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: c.estado ? "pointer" : "not-allowed",
                      }}
                    >
                      Editar
                    </button>
                    {c.estado ? (
                      <button
                        onClick={() => handleDelete(c)}
                        style={{
                          padding: "6px 14px",
                          background: "#fb8500",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(id)}
                        style={{
                          padding: "6px 14px",
                          background: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        Activar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
              No hay capacitaciones registradas
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
              border: "1px solid #007bff",
              background: paginaActual === i + 1 ? "#007bff" : "#fff",
              color: paginaActual === i + 1 ? "#fff" : "#007bff",
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

export default CapacitacionesTable;
