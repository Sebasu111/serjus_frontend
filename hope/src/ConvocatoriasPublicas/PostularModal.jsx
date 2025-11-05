import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { showToast } from "../utils/toast";

const pick = (obj, ...keys) => {
  for (const k of keys)
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
};
const getId = (o) =>
  pick(o, "id", "ididioma", "idIdioma", "idpueblocultura", "idPuebloCultura");
const getIdiomaLabel = (o) =>
  pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloLabel = (o) =>
  pick(
    o,
    "nombrePueblo",
    "nombrepueblo",
    "nombrepueblocultura",
    "pueblocultura",
    "pueblo",
    "descripcion",
    "label"
  );

const PostularModal = ({ show, onClose, convocatoria }) => {
  const [step, setStep] = useState(1);
  const [idiomas, setIdiomas] = useState([]);
  const [pueblos, setPueblos] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [isCF, setIsCF] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nit: "",
    dpi: "",
    genero: "",
    email: "",
    fechanacimiento: "",
    telefono: "",
    direccion: "",
    ididioma: "",
    idpueblocultura: "",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/idiomas/")
      .then((res) => res.json())
      .then((data) => setIdiomas(data.results))
      .catch((err) => console.error("Error cargando idiomas:", err));

    fetch("http://127.0.0.1:8000/api/pueblocultura/")
      .then((res) => res.json())
      .then((data) => setPueblos(data.results))
      .catch((err) => console.error("Error cargando pueblos:", err));

    localStorage.removeItem("idaspirante");
  }, []);

  if (!show) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    // Validaciones personalizadas inmediatas
    if (name === "nombre" || name === "apellido") {
      // Solo letras y espacios
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) return;
    }

    if (name === "nit" && !isCF) {
      // Solo números, máximo 8, y opcional K/k final
      if (!/^[0-9]{1,8}[Kk]?$/.test(value)) return;
    }

    if (name === "dpi") {
      // Solo números, máximo 13
      if (!/^[0-9]{0,13}$/.test(value)) return;
    }

    if (name === "telefono") {
      // Solo números, máximo 13
      if (!/^[0-9]{0,8}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleCFChange = (e) => {
    const checked = e.target.checked;
    setIsCF(checked);
    setFormData({ ...formData, nit: checked ? "C/F" : "" });
  };

  const validateStep = () => {
    const form = document.querySelector("#form-postulacion");
    if (!form) return false;

    const visibleInputs = form.querySelectorAll(
      `[data-step="${step}"] input:invalid, [data-step="${step}"] select:invalid`
    );

    if (visibleInputs.length > 0) {
      visibleInputs[0].reportValidity();
      return false;
    }
    if (step === 3 && !cvFile) {
       showToast("Debe adjuntar su CV en formato PDF.", "warning");
      return false;
    }
    return true;
  };

  const next = (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const back = (e) => {
    e.preventDefault();
    setStep((s) => Math.max(1, s - 1));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      let idAspirante = localStorage.getItem("idaspirante");

      // 1️⃣ Revisar si existe el aspirante por DPI
      if (!idAspirante) {
        const resAspi = await fetch(
          `http://127.0.0.1:8000/api/aspirantes/?dpi=${formData.dpi}`
        );
        const aspirantes = await resAspi.json();

        if (aspirantes.length > 0) {
          idAspirante = aspirantes[0].idaspirante;
        } else {
          const resCreate = await fetch("http://127.0.0.1:8000/api/aspirantes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombreaspirante: formData.nombre,
              apellidoaspirante: formData.apellido,
              nit: formData.nit,
              dpi: formData.dpi,
              genero: formData.genero,
              email: formData.email,
              fechanacimiento: formData.fechanacimiento,
              telefono: formData.telefono,
              direccion: formData.direccion,
              ididioma: Number(formData.ididioma) || null,
              idpueblocultura: Number(formData.idpueblocultura) || null,
              estado: true,
              idusuario: 1,
            }),
          });

          if (!resCreate.ok) throw new Error("Error al crear el aspirante");
          const creado = await resCreate.json();
          idAspirante = creado.idaspirante;
          localStorage.setItem("idaspirante", idAspirante);
        }
      }

      // 2️⃣ Obtener el estado "Postulado"
      const estadoRes = await fetch("http://127.0.0.1:8000/api/estados/");
      const estadosData = await estadoRes.json();
      const estadoPostulado = estadosData.results.find(e => e.nombreestado === "Postulado");

      if (!estadoPostulado) throw new Error("No se encontró el estado 'Postulado'");

      // 3️⃣ Crear la postulación con el idestado correcto
      const postRes = await fetch("http://127.0.0.1:8000/api/postulaciones/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fechapostulacion: new Date().toISOString().split("T")[0],
          observacion: "Postulación de Bolsa de empleo",
          estado: true,
          idusuario: 1,
          idaspirante: Number(idAspirante),
          idconvocatoria: Number(convocatoria?.idconvocatoria),
          idestado: estadoPostulado.idestado, // ✅ usamos el ID dinámico
        }),
      });

      if (!postRes.ok) {
        const errText = await postRes.text();
        if (errText.includes("ya está postulado")) {
          showToast("Ya te has postulado a esta convocatoria.", "warning");
          return;
        }
        throw new Error("Error al crear la postulación: " + errText);
      }

      // 4️⃣ Subir CV
      const fd = new FormData();
      fd.append("archivo", cvFile);
      fd.append("nombrearchivo", cvFile.name.replace(/\.[^/.]+$/, ""));
      fd.append("mimearchivo", cvFile.name.split(".").pop());
      fd.append("fechasubida", new Date().toISOString().split("T")[0]);
      fd.append("estado", true);
      fd.append("idusuario", 1);
      fd.append("idtipodocumento", 1);
      fd.append("idaspirante", Number(idAspirante));

      const docRes = await fetch("http://127.0.0.1:8000/api/documentos/", {
        method: "POST",
        body: fd,
      });

      if (!docRes.ok) throw new Error("Error al subir el CV");

      showToast("¡Postulación enviada exitosamente!", "success");
      onClose();

    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al enviar la postulación.", "error");
    }
  };

  //   Estilos
  const fs = {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    background: "#fafafa",
  };
  const lg = { padding: "0 8px", fontWeight: 700 };
  const grid3 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 18,
    alignItems: "start",
  };
  const field = { display: "flex", flexDirection: "column", marginBottom: 10 };
  const labelStyle = {
    display: "block",
    fontWeight: 600,
    marginBottom: 6,
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    background: "#fff",
  };
  const btnPrimary = {
    width: "100%",
    marginTop: 16,
    padding: "12px 0",
    background: "#219ebc",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  };
  const btnGhost = {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  };

  return (
    <div
      id="postularModalTop"
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800,
        maxWidth: "95%",
        background: "#fff",
        boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        padding: 28,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <h3 style={{ textAlign: "center" }}>
        {convocatoria?.nombreconvocatoria || "Convocatoria"}
      </h3>
      <div style={{ textAlign: "center", marginBottom: 18, color: "#374151" }}>
        Paso {step} de 3
      </div>

      <form id="form-postulacion" onSubmit={handleSubmit}>
        {/* Paso 1 */}
        {step === 1 && (
          <fieldset style={fs} data-step="1">
            <legend style={lg}>Datos personales</legend>
            <div style={grid3}>
              <div style={field}>
                <label style={labelStyle}>Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                  title="Solo letras y espacios"
                />
              </div>
              <div style={field}>
                <label style={labelStyle}>Apellido</label>
                <input
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                  title="Solo letras y espacios"
                />
              </div>
              <div style={field}>
                <label style={labelStyle}>NIT</label>
                <input
                  name="nit"
                  value={formData.nit}
                  onChange={handleFieldChange}
                  required={!isCF}
                  disabled={isCF}
                  style={inputStyle}
                  title="Solo números y una 'K' al final si aplica"
                />
                <label style={{ marginTop: 8, fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={isCF}
                    onChange={handleCFChange}
                    style={{ marginRight: 6 }}
                  />
                  Consumidor Final (C/F)
                </label>
              </div>
            </div>
          </fieldset>
        )}

        {/* Paso 2 */}
        {step === 2 && (
          <fieldset style={fs} data-step="2">
            <legend style={lg}>Contacto y cultura</legend>
            <div style={grid3}>
              <div style={field}>
                <label style={labelStyle}>DPI</label>
                <input
                  name="dpi"
                  value={formData.dpi}
                  onChange={handleFieldChange}
                  required
                  pattern="^[0-9]{13}$"
                  title="Ingrese exactamente 13 dígitos numéricos"
                  style={inputStyle}
                />
              </div>
              <div style={field}>
                <label style={labelStyle}>Género</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Seleccione</option>
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </div>
              <div style={field}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={field}>
                <label style={labelStyle}>Idioma</label>
                <select
                  name="ididioma"
                  value={formData.ididioma}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Seleccione idioma</option>
                  {idiomas.map((it) => (
                    <option key={getId(it)} value={getId(it)}>
                      {getIdiomaLabel(it)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={field}>
                <label style={labelStyle}>Pueblo / Cultura</label>
                <select
                  name="idpueblocultura"
                  value={formData.idpueblocultura}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Seleccione pueblo/cultura</option>
                  {pueblos.map((p) => (
                    <option key={getId(p)} value={getId(p)}>
                      {getPuebloLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {/* Paso 3 */}
        {step === 3 && (
          <fieldset style={fs} data-step="3">
            <legend style={lg}>Información adicional</legend>
            <div style={grid3}>
              <div style={field}>
                <label style={labelStyle}>Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fechanacimiento"
                  value={formData.fechanacimiento}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                  max={new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split("T")[0]}
                />
              </div>
              <div style={field}>
                <label style={labelStyle}>Teléfono</label>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleFieldChange}
                  required
                  pattern="[0-9]{8}"
                  title="Ingrese 8 dígitos numéricos"
                  style={inputStyle}
                />
              </div>
              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Dirección</label>
                <input
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleFieldChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Curriculum Vitae (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          </fieldset>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 10,
          }}
        >
          <button
            onClick={back}
            disabled={step === 1}
            style={{
              ...btnGhost,
              cursor: step === 1 ? "not-allowed" : "pointer",
              opacity: step === 1 ? 0.6 : 1,
            }}
            type="button"
          >
            Atrás
          </button>
          {step < 3 ? (
            <button onClick={next} style={btnPrimary} type="button">
              Siguiente
            </button>
          ) : (
            <button type="submit" style={btnPrimary}>
              Enviar Postulación
            </button>
          )}
        </div>
      </form>

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 15,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
    </div>
  );
};

export default PostularModal;
