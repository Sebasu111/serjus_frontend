import React from "react";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js"; 

const PuestosTable = ({
  puestos,
  onAsignarSalario,
  paginaActual,
  setPaginaActual,
  totalPaginas,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          paddingLeft: "250px",
          background: "#fff",
          borderRadius: "12px",
          padding: "20px 25px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          maxHeight: "600px",
          width: "fit-content",
          minWidth: "1100px",
        }}
      >
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
                          style={{ ...buttonStyles.base, ...buttonStyles.editarActivo }}
                        >
                          Asignar Salario
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

        {/* PAGINACIÓN */}
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
      </div>
    </div>
  );
};

export default PuestosTable;
