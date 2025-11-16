import React, { useEffect, useState } from "react";
import axios from "axios";
const API = process.env.REACT_APP_API_URL;

const DocumentosAsignadosModal = ({ induccion, onClose, visible }) => {
  const [documentos, setDocumentos] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    if (!visible || !induccion) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/inducciondocumentos/`);
        const raw = Array.isArray(res.data) ? res.data : res.data.results || [];

        const filtrados = raw.filter(
          d => Number(d.idinduccion) === Number(induccion.idinduccion) && d.estado === true
        );

        const empleadosIds = [...new Set(filtrados.map(f => Number(f.idempleado)).filter(Boolean))];
        const documentosIds = [...new Set(filtrados.map(f => Number(f.iddocumento)).filter(Boolean))];

        const resEmp = await axios.get(`${API}/empleados/`);
        const allEmps = Array.isArray(resEmp.data) ? resEmp.data : resEmp.data.results || [];
        const empleadosFiltrados = allEmps.filter(e => {
          const empId = Number(e.idempleado ?? e.id ?? e.pk);
          return e.estado === true && empleadosIds.includes(empId);
        });
        setEmpleados(empleadosFiltrados);

        const resDocs = await axios.get(`${API}/documentos/`);
        const allDocs = Array.isArray(resDocs.data) ? resDocs.data : resDocs.data.results || [];
        const documentosFiltrados = allDocs.filter(d => {
          const docId = Number(d.iddocumento ?? d.id);
          return documentosIds.includes(docId) && d.estado === true;
        });
        setDocumentos(documentosFiltrados);
      } catch (e) {
        console.error("Error cargando documentos asignados:", e);
      }
    };

    fetchData();
  }, [visible, induccion]);

  if (!visible || !induccion) return null;

  const infoBoxStyle = {
    background: "#f9fafb",
    border: "1px solid #eef2f7",
    borderRadius: 12,
    padding: 12,
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
          letterSpacing: 0.2,
        }}
      >
        {title}
      </h4>
      {children}
    </section>
  );

  const formatDate = dateStr => {
    if (!dateStr) return "-";
    const partes = dateStr.split("-");
    if (partes.length !== 3) return dateStr;
    const [year, month, day] = partes;
    return `${day}-${month}-${year}`;
  };

  const getEmpleadoNombre = emp => {
    const nombresPosibles = [
      emp.nombreempleado,
      `${emp.nombres || ""} ${emp.apellidos || ""}`.trim(),
      `${emp.nombre || ""} ${emp.apellido || ""}`.trim(),
      emp.full_name,
      emp.nombreCompleto,
    ].filter(Boolean);
    return nombresPosibles[0] || `Empleado #${emp.idempleado ?? emp.id}`;
  };

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
        paddingRight: "170px",
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
          position: "relative",
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
            zIndex: 10,
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
              boxShadow: "0 1px 6px rgba(0,0,0,.06)",
            }}
          >
            ✕
          </button>
        </div>

        <h3 style={{ marginBottom: 12, fontSize: 28, textAlign: "center" }}>
          Detalle de la Inducción
        </h3>

        {/* === INFORMACIÓN PRINCIPAL === */}
        <Section title="Información de la Inducción">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            <div style={infoBoxStyle}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Nombre
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {induccion.nombre || "-"}
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div
                style={{
                  fontSize: 12.5,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Fecha de Inicio
              </div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {formatDate(induccion.fechainicio)}
              </div>
            </div>
          </div>
        </Section>

        {/* === DOCUMENTOS === */}
        <Section title="Documentos Asignados">
          {documentos.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                borderRadius: 12,
                padding: 14,
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              No hay documentos activos asignados.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {documentos.map((doc, i) => (
                <div key={i} style={infoBoxStyle}>
                  <a
                    href={doc.archivo_url}
                    download={doc.nombrearchivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                      fontWeight: 600,
                      fontSize: 15,
                    }}
                  >
                    {doc.nombrearchivo}.pdf
                  </a>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* === EMPLEADOS === */}
        <Section title="Colaboradores Asignados">
          {empleados.length === 0 ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                borderRadius: 12,
                padding: 14,
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              No hay colaboradores activos asignados.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
              }}
            >
              {empleados.map((emp, i) => (
                <div key={i} style={infoBoxStyle}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#1f2937",
                    }}
                  >
                    {getEmpleadoNombre(emp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

export default DocumentosAsignadosModal;
