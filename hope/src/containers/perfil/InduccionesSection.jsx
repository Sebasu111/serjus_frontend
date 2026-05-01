import React from "react";
const idRol = Number(sessionStorage.getItem("idRol"));
const esAdmin = idRol === 5;

const InduccionesSection = ({
  induccionesAsignadas,
  formatFecha,
  onVerDocumentos,
  onPlanInduccion,
  onRealizarFormulario,
  onVerComentarios
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Inducciones asignadas</span>

        <span
          onClick={onPlanInduccion}
          style={{
            color: "#219ebc",
            fontSize: "13px",
            cursor: "pointer",
            textDecoration: "underline",
            fontWeight: "500",
          }}
        >
          {esAdmin
            ? "Subir plan de inducción"
            : "Descargar plan de inducción"}
        </span>
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

              <th style={{ padding: "14px", background: "#f8f9fa", fontWeight: "600", width: "180px" }}>
                Formulario
              </th>
              <th style={{ padding: "14px", background: "#f8f9fa", fontWeight: "600", width: "180px" }}>
                Ver Comentarios
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

                {/* 👇 BOTÓN FORMULARIO */}
                <td style={{ padding: "14px" }}>
                  <button
                    onClick={() => !ind.formulario_respondido && onRealizarFormulario(ind)}
                    disabled={ind.formulario_respondido}
                    style={{
                      padding: "8px 14px",
                      background: ind.formulario_respondido ? "#ccc" : "#219ebc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: ind.formulario_respondido ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      opacity: ind.formulario_respondido ? 0.7 : 1,
                    }}
                  >
                    {ind.formulario_respondido ? "Ya respondido" : "Realizar formulario"}
                  </button>
                </td>

                <td style={{ padding: "14px" }}>
                  <button
                    onClick={() => onVerComentarios(ind)}
                    disabled={!ind.formulario_respondido}
                    style={{
                      padding: "8px 14px",
                      background: ind.formulario_respondido ? "#8ecae6" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: ind.formulario_respondido ? "pointer" : "not-allowed",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}
                  >
                    Ver comentarios
                  </button>
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
