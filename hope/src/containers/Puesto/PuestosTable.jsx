import React from "react";
import { showToast } from "../../utils/toast.js";

const PuestosTable = ({
  puestos,
  onAsignarSalario,
  onToggleEstado,
  paginaActual,
  setPaginaActual,
  totalPaginas,
}) => {
  return (
    // Contenedor principal centrado en pantalla
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#f0f2f5",
      }}
    >
      {/* Cuadro blanco */}
      <div
        style={{
          paddingLeft: "250px",
          background: "#fff",
          borderRadius: "12px",
          padding: "20px 25px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxHeight: "600px",
          width: "fit-content", // 🔹 se ajusta al contenido
          minWidth: "1100px",
        }}
      >
        {/* Contenedor de la tabla centrada */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <table
            style={{
              width: "100%",
              minWidth: "900px",
              borderCollapse: "collapse",
              fontSize: "15px",
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px", borderBottom: "2px solid #eee", textAlign: "left", minWidth: "200px" }}>
                  Nombre del Puesto
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #eee", textAlign: "left", minWidth: "300px" }}>
                  Descripción
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #eee", textAlign: "right", minWidth: "150px" }}>
                  Salario Base
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #eee", textAlign: "center", minWidth: "120px" }}>
                  Estado
                </th>
                <th style={{ padding: "12px", borderBottom: "2px solid #eee", textAlign: "center", minWidth: "220px" }}>
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {puestos.length > 0 ? (
                puestos.map((puesto) => (
                  <tr key={puesto.idpuesto}>
                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{puesto.nombrepuesto}</td>
                    <td style={{ padding: "12px", borderBottom: "1px solid #f0f0f0" }}>{puesto.descripcion}</td>
                    <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                      Q{parseFloat(puesto.salariobase).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: puesto.estado ? "green" : "red",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {puesto.estado ? "Activo" : "Inactivo"}
                    </td>
                    <td style={{ textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
                        <button
                          onClick={() => {
                            if (!puesto.estado) {
                              showToast("No se puede modificar un puesto inactivo", "warning");
                              return;
                            }
                            onAsignarSalario(puesto);
                          }}
                          style={{
                            background: "#FED7AA",
                            color: "#7C2D12",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "0.2s ease",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Asignar Salario
                        </button>

                        <button
                          onClick={() => onToggleEstado(puesto)}
                          style={{
                            background: puesto.estado ? "#F87171" : "#38b000",
                            color: "#fff",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            transition: "0.2s ease",
                            whiteSpace: "nowrap",
                          }}
                          onMouseLeave={(e) =>
                            (e.target.style.background = puesto.estado ? "#F87171" : "#38b000")
                          }
                        >
                          {puesto.estado ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No hay puestos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN siempre debajo de la tabla */}
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
      </div>
    </div>
  );
};

export default PuestosTable;
