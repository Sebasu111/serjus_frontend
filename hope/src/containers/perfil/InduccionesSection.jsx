import React from "react";

const InduccionesSection = ({
  induccionesAsignadas,
  formatFecha,
  onVerDocumentos,
}) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        marginTop: "30px",
      }}
    >
      <h4
        style={{
          marginBottom: "20px",
          color: "#219ebc",
          fontWeight: "600",
        }}
      >
        Inducciones asignadas
      </h4>

      {induccionesAsignadas.length === 0 ? (
        <p style={{ fontSize: "16px", margin: 0 }}>
          No hay inducciones asignadas.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "16px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th
                style={{
                  padding: "14px",
                  background: "#f8f9fa",
                  fontWeight: "600",
                }}
              >
                Nombre de la inducción
              </th>
              <th
                style={{
                  padding: "14px",
                  background: "#f8f9fa",
                  fontWeight: "600",
                  width: "200px",
                }}
              >
                Fecha de inicio
              </th>
              <th
                style={{
                  padding: "14px",
                  background: "#f8f9fa",
                  fontWeight: "600",
                  width: "160px",
                }}
              >
                Documentos
              </th>
            </tr>
          </thead>
          <tbody>
            {induccionesAsignadas.map((ind) => (
              <tr key={ind.idinduccion} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "14px" }}>{ind.nombre}</td>
                <td style={{ padding: "14px" }}>
                  {formatFecha(ind.fechainicio)}
                </td>
                <td style={{ padding: "14px" }}>
                  <button
                    onClick={() => onVerDocumentos(ind)}
                    style={{
                      padding: "8px 14px",
                      background: "#219ebc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Ver documentos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InduccionesSection;
