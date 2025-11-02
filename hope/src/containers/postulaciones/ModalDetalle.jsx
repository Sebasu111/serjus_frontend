import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

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

const ModalDetalle = ({ aspirante, onClose }) => {
  const [idiomas, setIdiomas] = useState([]);
  const [pueblos, setPueblos] = useState([]);

  useEffect(() => {
    // Cargar idiomas
    const fetchIdiomas = async () => {
      try {
        const res = await axios.get(`${API}/idiomas/`);
        setIdiomas(res.data.results || []);
      } catch (err) {
        console.error("Error al cargar idiomas:", err);
        setIdiomas([]);
      }
    };

    // Cargar pueblos
    const fetchPueblos = async () => {
      try {
        const res = await axios.get(`${API}/pueblocultura/`);
        setPueblos(res.data.results || []);
      } catch (err) {
        console.error("Error al cargar pueblos:", err);
        setPueblos([]);
      }
    };

    fetchIdiomas();
    fetchPueblos();
  }, []);

  if (!aspirante) return null;

  const idiomaNombre = idiomas.find((i) => i.ididioma === aspirante.ididioma)?.nombreidioma || "—";
  const puebloNombre = pueblos.find((p) => p.idpueblocultura === aspirante.idpueblocultura)?.nombrepueblo || "—";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingLeft: "325px",
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
          width: "min(1100px, 95%)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
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

        <h3 style={{ margin: 0, fontSize: 28 }}>Detalle del Aspirante</h3>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
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
        </div>
      </div>
    </div>
  );
};

export default ModalDetalle;
