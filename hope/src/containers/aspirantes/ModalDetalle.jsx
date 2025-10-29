import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

// --------------------
//  Utilidades
// --------------------
const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const thStyle = {
  padding: "8px 12px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 14,
  color: "#111827",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: "8px 12px",
  color: "#374151",
  fontSize: 14,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
};

const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};

const getId = (o) =>
    pick(
        o,
        "id",
        "ididioma",
        "idIdioma",
        "idpueblocultura",
        "idPuebloCultura",
        "idconvocatoria"
    );

const getName = (o, type) => {
    if (type === "idioma")
        return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
    if (type === "pueblo")
        return pick(o, "nombrepueblo", "nombrePueblo", "pueblocultura", "descripcion", "label");
    if (type === "convocatoria")
        return pick(o, "nombreconvocatoria", "titulo", "nombre", "descripcion", "label");
    return "";
};

const labelFrom = (id, list, type) => {
    if (!id) return "";
    const found = list.find((x) => String(getId(x)) === String(id));
    if (!found) return `#${id}`;
    return getName(found, type);
};

// --------------------
//  Componentes de estilo
// --------------------
const Section = ({ title, children }) => (
    <div>
        <h4 style={{ margin: "0 0 12px", color: "#1e293b", fontSize: 18 }}>{title}</h4>
        {children}
    </div>
);

const Grid = ({ children }) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 14,
            background: "#f9fafb",
            borderRadius: 10,
            padding: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
    >
        {children}
    </div>
);

const Item = ({ label, value, full }) => (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
        <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
            <strong style={{ color: "#0f172a" }}>{label}:</strong>{" "}
            <span style={{ color: "#334155" }}>{value || "—"}</span>
        </p>
    </div>
);

// --------------------
//  Modal principal
// --------------------
const ModalDetalle = ({ aspirante, onClose, idiomas = [], pueblos = [], convocatorias = [] }) => {
    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (aspirante) fetchPostulaciones();
    }, [aspirante]);

    const fetchPostulaciones = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/postulaciones/`);
            const all = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.results)
                ? res.data.results
                : [];

            const propias = all.filter((p) => p.idaspirante === aspirante.idaspirante);
            setPostulaciones(propias);
        } catch (err) {
            console.error("Error al cargar postulaciones:", err);
            setPostulaciones([]);
        } finally {
            setLoading(false);
        }
    };

    if (!aspirante) return null;

    const idiomaNombre = labelFrom(aspirante.ididioma, idiomas, "idioma");
    const puebloNombre = labelFrom(aspirante.idpueblocultura, pueblos, "pueblo");

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 32,
                    width: "min(900px, 95%)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                    position: "relative",
                }}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                    }}
                >
                    <X size={24} color="#555" />
                </button>

                {/* CABECERA */}
                <div
                    style={{
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>
                        Detalle del Aspirante
                    </h3>
                </div>

                {/* NOMBRE Y ESTADO */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                        margin: "6px 0 10px 0",
                    }}
                >
                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {aspirante.nombreaspirante} {aspirante.apellidoaspirante}
                    </div>
                    <span
                        style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "rgba(16,185,129,.12)",
                            color: "#065f46",
                            fontWeight: 700,
                            fontSize: 14,
                        }}
                    >
                        Registrado
                    </span>
                </div>

                {/* SECCIONES */}
                <div style={{ display: "grid", gap: 22, marginTop: 32 }}>
                    <Section title="Identificación">
                        <Grid>
                            <Item label="DPI" value={aspirante.dpi} />
                            <Item label="NIT" value={aspirante.nit} />
                            <Item label="Fecha nacimiento" value={formatDate(aspirante.fechanacimiento)} />
                            <Item label="Idioma" value={idiomaNombre} />
                            <Item label="Pueblo / Cultura" value={puebloNombre} />
                        </Grid>
                    </Section>

                    <Section title="Contacto">
                        <Grid>
                            <Item label="Teléfono" value={aspirante.telefono} />
                            <Item label="Correo" value={aspirante.email} />
                            <Item full label="Dirección" value={aspirante.direccion} />
                        </Grid>
                    </Section>

                    <Section title="Postulaciones">
                      {loading ? (
                        <div style={{ textAlign: "center", color: "#666" }}>Cargando postulaciones...</div>
                      ) : postulaciones.length === 0 ? (
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
                          No tiene postulaciones registradas.
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              fontSize: 14,
                              tableLayout: "fixed"
                            }}
                          >
                            <colgroup>
                              <col style={{ width: "25%" }} />
                              <col style={{ width: "35%" }} />
                              <col style={{ width: "20%" }} />
                              <col style={{ width: "20%" }} />
                            </colgroup>
                            <thead>
                              <tr style={{ background: "#f3f4f6" }}>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Convocatoria</th>
                                <th style={thStyle}>Puesto</th>
                                <th style={thStyle}>Observación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {postulaciones.map((p, idx) => {
                                const convocatoria = convocatorias.find(
                                  (c) => String(c.idconvocatoria) === String(p.idconvocatoria)
                                );
                                const convNombre = convocatoria?.nombreconvocatoria || `#${p.idconvocatoria}`;
                                const puesto = convocatoria?.nombrepuesto || "—";

                                return (
                                  <tr key={p.idpostulacion} style={{ cursor: "default" }}>
                                    <td style={tdStyle}>{formatDate(p.fechapostulacion)}</td>
                                    <td style={tdStyle}>{convNombre}</td>
                                    <td style={tdStyle}>{puesto}</td>
                                    <td style={tdStyle}>{p.observacion || "-"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default ModalDetalle;
