import React, { useState } from "react";

//   Utilidades
const pick = (o, ...keys) => {
  for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = o => pick(o, "id", "ididioma", "idIdioma", "idpueblocultura", "idPuebloCultura");
const getIdiomaName = o => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloName = o => pick(o, "nombrepueblo", "nombrePueblo", "pueblocultura", "descripcion", "label");

const labelFrom = (id, list, type) => {
  if (!id) return "";
  const found = list.find(x => String(getId(x)) === String(id));
  if (!found) return `#${id}`;
  return type === "idioma" ? getIdiomaName(found) : getPuebloName(found);
};

const fmtFecha = v => {
  if (!v) return "";
  const d = new Date(v);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
};

//   Estilos
const thStyle = { borderBottom: "2px solid #eee", padding: 12, textAlign: "left", fontSize: 15 };
const tdStyle = { padding: 12, borderBottom: "1px solid #f0f0f0", fontSize: 15 };
const btnPrimary = {
  padding: "6px 10px", background: "#219ebc", color: "#fff",
  border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13, marginRight: 6
};
const btnDownload = {
  padding: "6px 10px", background: "#2A9D8F", color: "#fff",
  border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13
};

// =======================
// ✅ COMPONENTE PRINCIPAL
// =======================
const AspirantesTable = ({
  aspirantes,
  paginaActual,
  totalPaginas,
  setPaginaActual,
  idiomas = [],
  pueblos = [],
}) => {
  const [modalAspirante, setModalAspirante] = useState(null);

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nombre", "Género", "Teléfono", "Idioma", "Pueblo/Cultura", "Estado", "Acciones"]
                  .map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(aspirantes) && aspirantes.length ? (
                aspirantes.map(r => {
                  const idioma = labelFrom(r.ididioma ?? r.idIdioma, idiomas, "idioma");
                  const pueblo = labelFrom(r.idpueblocultura ?? r.idPuebloCultura, pueblos, "pueblo");
                  const estado = !!r.estado;

                  return (
                    <tr key={r.idaspirante ?? r.idAspirante ?? r.id}>
                      <td
                        style={{ ...tdStyle, color: "#0077cc", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => setModalAspirante(r)}
                      >
                        {r.nombreaspirante} {r.apellidoaspirante}
                      </td>
                      <td style={tdStyle}>{r.genero}</td>
                      <td style={tdStyle}>{r.telefono}</td>
                      <td style={tdStyle}>{idioma}</td>
                      <td style={tdStyle}>{pueblo}</td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "center",
                          fontWeight: 600,
                          color: estado ? "green" : "red"
                        }}
                      >
                        {estado ? "Activo" : "Inactivo"}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                        {r.cvs && r.cvs.length > 0 ? (
                          <a
                            href={r.cvs[0].archivo}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={btnDownload}
                          >
                            Ver CV
                          </a>
                        ) : (
                          <span style={{ color: "#888", fontSize: 13 }}>Sin CV</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>
                    No hay aspirantes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                style={{
                  padding: "6px 12px",
                  margin: "0 5px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                  color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                  border: "1px solid #219ebc"
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ MODAL DE DETALLE */}
      {modalAspirante && (
        <ModalDetalle aspirante={modalAspirante} onClose={() => setModalAspirante(null)} />
      )}
    </>
  );
};

// ✅ Modal de detalle de aspirante con CVs
const ModalDetalle = ({ aspirante, onClose }) => (
  <div style={styles.overlay}>
    <div style={styles.modal}>
      <h2>Detalles del Aspirante</h2>
      <p><strong>Nombre:</strong> {aspirante.nombreaspirante} {aspirante.apellidoaspirante}</p>
      <p><strong>DPI:</strong> {aspirante.dpi}</p>
      <p><strong>NIT:</strong> {aspirante.nit}</p>
      <p><strong>Email:</strong> {aspirante.email}</p>
      <p><strong>Dirección:</strong> {aspirante.direccion}</p>
      <p><strong>Fecha Nacimiento:</strong> {fmtFecha(aspirante.fechanacimiento)}</p>

      {aspirante.cvs && aspirante.cvs.length > 0 ? (
        <>
          <h3 style={{ marginTop: 15 }}>Currículum(s) Vitae:</h3>
          <ul>
            {aspirante.cvs.map(cv => (
              <li key={cv.iddocumento ?? cv.id}>
                <a
                  href={cv.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0077cc", textDecoration: "underline" }}
                >
                  {cv.nombrearchivo || "Ver archivo PDF"}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: "#777" }}>No hay CVs asociados.</p>
      )}

      <button style={styles.btnClose} onClick={onClose}>Cerrar</button>
    </div>
  </div>
);

// ✅ Estilos Modal
const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 9999
  },
  modal: {
    background: "#fff", width: "450px", padding: 25,
    borderRadius: 10, animation: "fadeIn .25s ease-in-out",
    boxShadow: "0 4px 25px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto"
  },
  btnClose: {
    marginTop: 15, background: "#E63946", color: "#fff",
    padding: "8px 14px", borderRadius: 5, border: "none", cursor: "pointer"
  }
};

export default AspirantesTable;
