import React from "react";

const ContratosTable = ({ rows, handleEdit, toggleEstado }) => {
  return (
    <div style={styles.wrapper}>
      <h3 style={{ marginBottom: 20, textAlign: "center" }}>Contratos</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Inicio", "Firma", "Fin", "Tipo", "Historial", "Estado", "Acciones"].map(
              (h) => (
                <th key={h} style={styles.th}>
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rows) && rows.length ? (
            rows.map((r) => (
              <tr key={r.idcontrato}>
                <td style={styles.td}>{r.fechainicio}</td>
                <td style={styles.td}>{r.fechafirma}</td>
                <td style={styles.td}>{r.fechafin || "-"}</td>
                <td style={styles.td}>{r.tipocontrato}</td>
                <td style={styles.td}>{r.idhistorialpuesto || "-"}</td>
                <td
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    color: r.estado ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  {r.estado ? "Activo" : "Inactivo"}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <button onClick={() => handleEdit(r)} style={styles.btnWarn}>
                    Editar
                  </button>
                  {r.estado ? (
                    <button onClick={() => toggleEstado(r, false)} style={styles.btnDanger}>
                      Desactivar
                    </button>
                  ) : (
                    <button onClick={() => toggleEstado(r, true)} style={styles.btnSuccess}>
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                Sin contratos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  wrapper: {
    background: "#fff",
    borderRadius: 12,
    padding: "20px 30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxHeight: 600,
    overflowY: "auto",
  },
  th: { borderBottom: "2px solid #eee", padding: 10, textAlign: "left" },
  td: { padding: 10, borderBottom: "1px solid #f0f0f0" },
  btnWarn: {
    padding: "6px 14px",
    background: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
    marginRight: 6,
  },
  btnDanger: {
    padding: "6px 14px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
  },
  btnSuccess: {
    padding: "6px 14px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 14,
  },
};

export default ContratosTable;
