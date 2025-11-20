import React, { useState } from "react";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const ModalColaboradoresAsignados = ({ visible, onClose, empleados, evento, loading, offsetRight = 170 }) => {
  const [documentoVisualizando, setDocumentoVisualizando] = useState(null);
  const [modalDocumentoVisible, setModalDocumentoVisible] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [errorAsistencia, setErrorAsistencia] = useState(null);
  const [empleadosConDocs, setEmpleadosConDocs] = useState([]);

  // Obtener rol actual
  const idRol = parseInt(sessionStorage.getItem("idRol"));
  const esCoordinadorOAdmin = [4, 5].includes(idRol);

  // 🔥 Cargar documentos cuando se abra el modal
  React.useEffect(() => {
    if (!visible || !empleados || empleados.length === 0 || !evento?.fechainicio || !evento?.fechafin) return;

    const fetchDocs = async () => {

      const res = await fetch(`${API}/documentos/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docs = await res.json();
      const docsArray = docs.results || [];

      // 🔥 Solo tipos 2 y 3
      const docsValidosTipo = docsArray.filter(
        d => d.idtipodocumento === 2 || d.idtipodocumento === 3
      );


      // 🗓 Fechas importantes
      const inicio = new Date(evento.fechainicio);
      const fin = new Date(evento.fechafin);

      // Fecha límite = fin + 15 días
      const fechaLimite = new Date(fin);
      fechaLimite.setDate(fechaLimite.getDate() + 15);

      // 🔥 Condición:
      // 1) Subido durante el evento (inicio <= subida <= fin)
      // 2) Subido después de 15 días del fin (subida > fechaLimite)
      const docsValidos = docsValidosTipo.filter(d => {
        const subida = new Date(d.fechasubida);
        const duranteEvento = subida >= inicio && subida <= fin;
        const despues15 = subida > fechaLimite;
        return duranteEvento || despues15;
      });

      // 🔗 Relacionar documento con empleado
      const empleadosActualizados = empleados.map(emp => {
        const doc = docsValidos.find(d => d.idempleado === emp.idempleado);
        if (doc) {
          return {
            ...emp,
            documento: { ...doc, archivo_url: doc.archivo },
            fechaenvio: doc.fechasubida
          };
        }
        return emp;
      });

      setEmpleadosConDocs(empleadosActualizados);
    };

    fetchDocs();
  }, [visible, empleados, evento]);



  // Actualizar asistencia
  const handleActualizarAsistencia = async (idEmpleado, nuevoEstado) => {
    setActualizandoId(idEmpleado);
    setErrorAsistencia(null);
    if (!idEmpleado) {
      setErrorAsistencia("Advertencia: El idempleadocapacitacion está ausente. No se puede actualizar la asistencia.");
      setActualizandoId(null);
      return;
    }
    try {
      // 1. Obtener el objeto completo actual
      const getRes = await fetch(`${API}/empleadocapacitacion/${idEmpleado}/`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      if (!getRes.ok) throw new Error("No se pudo obtener el registro actual");
      const data = await getRes.json();
      // 2. Actualizar solo el campo asistencia
      const payload = { ...data, asistencia: nuevoEstado };
      // 3. Enviar el objeto completo por PUT
      const putRes = await fetch(`${API}/empleadocapacitacion/${idEmpleado}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!putRes.ok) throw new Error("Error al actualizar asistencia");
      window.location.reload();
    } catch (err) {
      setErrorAsistencia("No se pudo actualizar la asistencia. Intente nuevamente.");
    } finally {
      setActualizandoId(null);
    }
  };

  if (!visible || !evento) return null;


  // Formateo de fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const partes = dateStr.split("-");
    if (partes.length !== 3) return dateStr;
    const [year, month, day] = partes;
    return `${day}-${month}-${year}`;
  };

  const Section = ({ title, children }) => (
    <section style={{ marginBottom: 24 }}>
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: 19,
          fontWeight: 800,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 6,
          color: "#0f172a",
          letterSpacing: 0.2
        }}
      >
        {title}
      </h4>
      {children}
    </section>
  );

  const handleVerDocumento = (empleado) => {
    if (!empleado.documento) return;

    setDocumentoVisualizando({
      ...empleado.documento,
      empleado: `${empleado.nombre} ${empleado.apellido}`,
      asistencia: empleado.asistencia,
      tipoDocumento: empleado.asistencia === "Sí" ? "Informe de Asistencia" : "Justificación de Ausencia"
    });
    setModalDocumentoVisible(true);
  };

  const handleDescargarDocumento = (documento) => {
    if (!documento.archivo_url) return;

    const link = document.createElement('a');
    link.href = documento.archivo_url;
    link.download = documento.nombrearchivo || 'documento.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const thStyle = {
    textAlign: "center",
    padding: "10px",
    borderBottom: "2px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151"
  };

  const tdStyle = {
    textAlign: "center",
    padding: "10px",
    borderBottom: "1px solid #f3f4f6",
    color: "#374151",
    verticalAlign: "middle"
  };

  const observaciones = evento.observacionescapacitacion || evento.observacion || "-";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 4000,
        paddingRight: `${offsetRight}px`
      }}
    >
      <div
        style={{
          width: "min(1100px,95vw)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#fff",
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          padding: 28,
          borderRadius: 16,
          position: "relative"
        }}
      >
        {/* Botón cerrar */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
            position: "sticky",
            top: 0,
            zIndex: 10
          }}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1,
              display: "grid",
              placeItems: "center",
              color: "#0f172a",
              boxShadow: "0 1px 6px rgba(0,0,0,.06)"
            }}
          >
            ✕
          </button>
        </div>

        <h3 style={{ marginBottom: 12, fontSize: 28, textAlign: "center" }}>{evento.nombreevento}</h3>

        {/* Información del evento */}
        <Section title="Información del Evento">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14
            }}
          >
            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Lugar</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{evento.lugar}</div>
            </div>

            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Fechas</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {`${formatDate(evento.fechainicio)} a ${formatDate(evento.fechafin)}`}
              </div>
            </div>

            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Institución</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{evento.institucionfacilitadora}</div>
            </div>

            <div style={{ background: "#f9fafb", border: "1px solid #eef2f7", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Monto</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{evento.montoejecutado || 0}</div>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                background: "#f9fafb",
                border: "1px solid #eef2f7",
                borderRadius: 12,
                padding: 12
              }}
            >
              <div style={{ fontSize: 12.5, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                Observaciones
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{observaciones}</div>
            </div>
          </div>
        </Section>

        {/* Colaboradores asignados */}
        <Section title="Colaboradores Asignados">
          {loading ? (
            <div style={{ textAlign: "center", color: "#666" }}>Cargando...</div>
          ) : empleados.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                borderRadius: 12,
                padding: 14,
                color: "#6b7280",
                textAlign: "center"
              }}
            >
              No hay colaboradores asignados.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {errorAsistencia && (
                <div style={{ color: "#dc2626", marginBottom: 8, textAlign: "center" }}>{errorAsistencia}</div>
              )}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  tableLayout: "fixed"
                }}
              >
                <colgroup>
                  <col style={{ width: "35%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={thStyle}>Colaborador</th>
                    <th style={thStyle}>Asistencia</th>
                    <th style={thStyle}>Documento</th>
                    <th style={thStyle}>Fecha envío</th>
                  </tr>
                </thead>
                <tbody>
                  {(empleadosConDocs.length > 0 ? empleadosConDocs : empleados).map((emp, idx) => {
                    const asistenciaSi = emp.asistencia?.toLowerCase() === "sí" || emp.asistencia?.toLowerCase() === "si";
                    const asistenciaNo = emp.asistencia?.toLowerCase() === "no";
                    // Usar idempleadocapacitacion para actualizar asistencia
                    const idCap = emp.idempleadocapacitacion;
                    const idCapAusente = !idCap;
                    return (
                      <tr key={idx}>
                        <td style={tdStyle}>{emp.nombre} {emp.apellido}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>
                          {esCoordinadorOAdmin ? (
                            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                              <button
                                disabled={actualizandoId === idCap || idCapAusente}
                                title={idCapAusente ? "Falta idempleadocapacitacion" : ""}
                                onClick={() => handleActualizarAsistencia(idCap, "Sí")}
                                style={{
                                  padding: "4px 18px",
                                  borderRadius: 8,
                                  border: asistenciaSi ? "2px solid #16a34a" : "1px solid #e5e7eb",
                                  background: asistenciaSi ? "#e6fbe8" : "#f3f4f6",
                                  color: asistenciaSi ? "#16a34a" : "#374151",
                                  fontWeight: 700,
                                  cursor: actualizandoId === idCap || idCapAusente ? "not-allowed" : "pointer",
                                  boxShadow: asistenciaSi ? "0 2px 8px rgba(22,163,74,.08)" : "none",
                                  transition: "0.2s",
                                  outline: "none",
                                  position: "relative",
                                  opacity: idCapAusente ? 0.5 : 1
                                }}
                                onMouseOver={e => { if (!asistenciaSi && !idCapAusente) e.target.style.background = "#d1fae5"; }}
                                onMouseOut={e => { if (!asistenciaSi && !idCapAusente) e.target.style.background = "#f3f4f6"; }}
                              >
                                {idCapAusente ? "Sin ID" : actualizandoId === idCap ? "Actualizando..." : "Sí"}
                              </button>
                              <button
                                disabled={actualizandoId === idCap || idCapAusente}
                                title={idCapAusente ? "Falta idempleadocapacitacion" : ""}
                                onClick={() => handleActualizarAsistencia(idCap, "No")}
                                style={{
                                  padding: "4px 18px",
                                  borderRadius: 8,
                                  border: asistenciaNo ? "2px solid #dc2626" : "1px solid #e5e7eb",
                                  background: asistenciaNo ? "#fee2e2" : "#f3f4f6",
                                  color: asistenciaNo ? "#dc2626" : "#374151",
                                  fontWeight: 700,
                                  cursor: actualizandoId === idCap || idCapAusente ? "not-allowed" : "pointer",
                                  boxShadow: asistenciaNo ? "0 2px 8px rgba(220,38,38,.08)" : "none",
                                  transition: "0.2s",
                                  outline: "none",
                                  position: "relative",
                                  opacity: idCapAusente ? 0.5 : 1
                                }}
                                onMouseOver={e => { if (!asistenciaNo && !idCapAusente) e.target.style.background = "#fecaca"; }}
                                onMouseOut={e => { if (!asistenciaNo && !idCapAusente) e.target.style.background = "#f3f4f6"; }}
                              >
                                {idCapAusente ? "Sin ID" : actualizandoId === idCap ? "Actualizando..." : "No"}
                              </button>
                              {idCapAusente && (
                                <span style={{ color: "#dc2626", fontSize: 12, marginLeft: 8 }}>
                                  ⚠️ Falta idempleadocapacitacion
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              color: asistenciaSi ? "#16a34a" : asistenciaNo ? "#dc2626" : "#374151",
                              background: asistenciaSi ? "#e6fbe8" : asistenciaNo ? "#fee2e2" : "#f3f4f6",
                              borderRadius: 8,
                              padding: "4px 18px",
                              fontWeight: 700,
                              border: asistenciaSi ? "2px solid #16a34a" : asistenciaNo ? "2px solid #dc2626" : "1px solid #e5e7eb"
                            }}>
                              {asistenciaSi ? "Sí" : asistenciaNo ? "No" : emp.asistencia || "-"}
                            </span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {emp.documento ? (
                            <button
                              onClick={() => handleVerDocumento(emp)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#2563eb",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "12px",
                                padding: "0"
                              }}
                            >
                              {emp.documento.nombrearchivo}
                            </button>
                          ) : (
                            <span style={{ color: "#6b7280" }}>Sin documento</span>
                          )}
                        </td>
                        <td style={tdStyle}>{emp.fechaenvio ? formatDate(emp.fechaenvio) : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Modal para visualizar documentos */}
        {modalDocumentoVisible && documentoVisualizando && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 5000,
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "min(900px, 95vw)",
                height: "min(700px, 90vh)",
                background: "#fff",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header del modal */}
              <div
                style={{
                  padding: "20px 25px",
                  borderBottom: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                    {documentoVisualizando.tipoDocumento}
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                    Colaborador: <strong>{documentoVisualizando.empleado}</strong>
                  </p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                    Archivo: {documentoVisualizando.nombrearchivo}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={() => handleDescargarDocumento(documentoVisualizando)}
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#059669",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "0.2s",
                    }}
                  >
                    ⬇️ Descargar
                  </button>
                  <button
                    onClick={() => {
                      setModalDocumentoVisible(false);
                      setDocumentoVisualizando(null);
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#374151",
                      transition: "0.2s",
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Visor de PDF */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f3f4f6",
                }}
              >
                {documentoVisualizando.archivo_url ? (
                  <iframe
                    src={documentoVisualizando.archivo_url}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                    title={`Documento: ${documentoVisualizando.nombrearchivo}`}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#6b7280",
                    }}
                  >
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                    <p style={{ fontSize: "16px", margin: 0 }}>No se pudo cargar el documento</p>
                    <p style={{ fontSize: "14px", margin: "8px 0 0 0" }}>
                      Intente descargarlo para verlo
                    </p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div
                style={{
                  padding: "15px 25px",
                  background: "#f9fafb",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Estado de asistencia: <strong
                    style={{
                      color: documentoVisualizando.asistencia === "Sí" ? "#059669" : "#dc2626"
                    }}
                  >
                    {documentoVisualizando.asistencia}
                  </strong>
                </div>
                <button
                  onClick={() => {
                    setModalDocumentoVisible(false);
                    setDocumentoVisualizando(null);
                  }}
                  style={{
                    padding: "8px 20px",
                    border: "none",
                    borderRadius: "6px",
                    background: "#6b7280",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalColaboradoresAsignados;
