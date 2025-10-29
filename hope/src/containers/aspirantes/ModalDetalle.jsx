import React, { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Calendar, User, Globe } from "lucide-react";

const API = "http://127.0.0.1:8000/api";

const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// --------------------
//  Utilidades
// --------------------
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
//  Componente principal
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

  // Nombres legibles
  const idiomaNombre = labelFrom(aspirante.ididioma, idiomas, "idioma");
  const puebloNombre = labelFrom(aspirante.idpueblocultura, pueblos, "pueblo");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: "32px",
          width: "min(900px, 95%)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
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
            fontSize: 22,
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        {/* Encabezado tipo ficha */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: "#f7f9fc",
            padding: "20px 24px",
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#d9e2ec",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 600,
              color: "#334e68",
            }}
          >
            {aspirante.nombreaspirante?.charAt(0)}
            {aspirante.apellidoaspirante?.charAt(0)}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: "#102a43" }}>
              {aspirante.nombreaspirante} {aspirante.apellidoaspirante}
            </h2>
          </div>
        </div>

        {/* Datos personales tipo ficha */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <p><User size={16} style={{ marginRight: 6 }} /> <strong>DPI:</strong> {aspirante.dpi}</p>
            <p><User size={16} style={{ marginRight: 6 }} /> <strong>NIT:</strong> {aspirante.nit || "—"}</p>
            <p><Calendar size={16} style={{ marginRight: 6 }} /> <strong>Fecha de nacimiento:</strong> {formatDate(aspirante.fechanacimiento)}</p>
            <p><Globe size={16} style={{ marginRight: 6 }} /> <strong>Idioma:</strong> {idiomaNombre}</p>
          </div>

          <div
            style={{
              background: "#f9fafb",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
          >
            <p><Mail size={16} style={{ marginRight: 6 }} /> <strong>Correo:</strong> {aspirante.email}</p>
            <p><Phone size={16} style={{ marginRight: 6 }} /> <strong>Teléfono:</strong> {aspirante.telefono}</p>
            <p><MapPin size={16} style={{ marginRight: 6 }} /> <strong>Dirección:</strong> {aspirante.direccion}</p>
            <p><Globe size={16} style={{ marginRight: 6 }} /> <strong>Pueblo/Cultura:</strong> {puebloNombre}</p>
          </div>
        </div>

        {/* Postulaciones */}
        <h3 style={{ margin: "0 0 12px" }}>Postulaciones</h3>

        {loading ? (
          <p>Cargando postulaciones...</p>
        ) : postulaciones.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
                fontSize: "0.95rem",
              }}
            >
              <thead>
                <tr>
                  {["ID", "Fecha", "Convocatoria", "Puesto", "Observación"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        backgroundColor: "#219ebc",
                        color: "#fff",
                        borderRadius: "8px 8px 0 0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postulaciones.map((p) => {
                  const convocatoria = convocatorias.find(
                    (c) => String(c.idconvocatoria) === String(p.idconvocatoria)
                  );
                  const convNombre = convocatoria?.nombreconvocatoria || `#${p.idconvocatoria}`;
                  const puesto = convocatoria?.nombrepuesto || "—";

                  return (
                    <tr key={p.idpostulacion} style={{ background: "#f1f5f9", borderRadius: 8 }}>
                      <td style={{ padding: 10 }}>{p.idpostulacion}</td>
                      <td style={{ padding: 10 }}>{new Date(p.fechapostulacion).toLocaleDateString()}</td>
                      <td style={{ padding: 10 }}>{convNombre}</td>
                      <td style={{ padding: 10 }}>{puesto}</td>
                      <td style={{ padding: 10 }}>{p.observacion || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#555" }}>No tiene postulaciones registradas.</p>
        )}
      </div>
    </div>
  );
};

export default ModalDetalle;
