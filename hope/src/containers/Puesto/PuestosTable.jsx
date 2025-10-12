import React from "react";
import { showToast } from "../../utils/toast.js";

const PuestosTable = ({
  puestos,
  onAsignarSalario,
  onToggleEstado,
}) => {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px 25px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflowY: "auto",
        maxHeight: "600px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            <th
              style={{
                padding: "10px",
                borderBottom: "2px solid #eee",
                textAlign: "left",
              }}
            >
              Nombre del Puesto
            </th>
            <th
              style={{
                padding: "10px",
                borderBottom: "2px solid #eee",
                textAlign: "left",
              }}
            >
              Descripción
            </th>
            <th
              style={{
                padding: "10px",
                borderBottom: "2px solid #eee",
                textAlign: "right",
              }}
            >
              Salario Base
            </th>
            <th
              style={{
                padding: "10px",
                borderBottom: "2px solid #eee",
                textAlign: "center",
              }}
            >
              Estado
            </th>
            <th
              style={{
                padding: "10px",
                borderBottom: "2px solid #eee",
                textAlign: "center",
              }}
            >
              Acción
            </th>
          </tr>
        </thead>

        <tbody>
          {puestos.length > 0 ? (
            puestos.map((puesto) => (
              <tr key={puesto.idpuesto}>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {puesto.nombrepuesto}
                </td>
                <td
                  style={{
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {puesto.descripcion}
                </td>
                <td
                  style={{
                    padding: "10px",
                    textAlign: "right",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  Q{parseFloat(puesto.salariobase).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: "600",
                    color: puesto.estado ? "green" : "red",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {puesto.estado ? "Activo" : "Inactivo"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!puesto.estado) {
                          showToast(
                            "No se puede modificar un puesto inactivo",
                            "warning"
                          );
                          return;
                        }
                        onAsignarSalario(puesto);
                      }}
                      style={{
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#197b9b")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#219ebc")
                      }
                    >
                      Asignar Salario
                    </button>

                    <button
                      onClick={() => onToggleEstado(puesto)}
                      style={{
                        background: puesto.estado ? "#fb8500" : "#38b000",
                        color: "#fff",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = puesto.estado
                          ? "#e07a00"
                          : "#2d9100")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = puesto.estado
                          ? "#fb8500"
                          : "#38b000")
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
  );
};

export default PuestosTable;
