import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const PostularModal = ({ show, onClose, convocatoriaId }) => {
  const [step, setStep] = useState(1);
  const [idiomas, setIdiomas] = useState([]);
  const [pueblos, setPueblos] = useState([]);
  const [cvFile, setCvFile] = useState(null);
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
      .then(res => res.json())
      .then(data => setIdiomas(data.results))
      .catch(err => console.error("Error cargando idiomas:", err));

    fetch("http://127.0.0.1:8000/api/pueblocultura/")
      .then(res => res.json())
      .then(data => setPueblos(data.results))
      .catch(err => console.error("Error cargando pueblos:", err));
  }, []);

  if (!show) return null;

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleDpiChange = async (e) => {
  const dpiValue = e.target.value;
  setFormData({ ...formData, dpi: dpiValue });

  if (dpiValue.length >= 7) { // Longitud mínima aproximada
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/aspirantes/?dpi=${dpiValue}`);
      const data = await res.json();
      if (data.length > 0) {
        alert(" Este DPI ya está registrado");
      }
    } catch (err) {
      console.error("Error verificando DPI:", err);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      alert("Debe adjuntar su CV en PDF");
      return;
    }

    try {
      if (!cvFile) {
        alert("Debe adjuntar su CV en PDF");
        return;
      }

      if (!formData.dpi) {
        alert("Debe ingresar un DPI válido");
        return;
      }
      //  Buscar Aspirante por DPI
      const checkRes = await fetch(`http://127.0.0.1:8000/api/aspirantes/?dpi=${formData.dpi}`);
      const aspirantesExistentes = await checkRes.json();

      let idAspirante;

      if (aspirantesExistentes.length > 0) {
        idAspirante = aspirantesExistentes[0].idaspirante;
        console.log(" Aspirante existente:", idAspirante);
      } else {
        //  Crear aspirante
        const dataAspirante = {
          nombreaspirante: formData.nombre,
          apellidoaspirante: formData.apellido,
          nit: formData.nit,
          dpi: formData.dpi,
          genero: formData.genero,
          email: formData.email,
          fechanacimiento: formData.fechanacimiento,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ididioma: formData.ididioma ? Number(formData.ididioma) : null,
          idpueblocultura: formData.idpueblocultura ? Number(formData.idpueblocultura) : null,
          estado: true,
          idusuario: 1
        };

        const resAspirante = await fetch("http://127.0.0.1:8000/api/aspirantes/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataAspirante),
        });
        if (!resAspirante.ok) throw new Error("Error creando aspirante");

        const aspiranteData = await resAspirante.json();
        idAspirante = aspiranteData.idaspirante;
        console.log(" Aspirante creado:", idAspirante);
      }

      //  Crear postulación
      const dataPostulacion = {
        fechapostulacion: new Date().toISOString().split("T")[0],
        observacion: "Postulación desde formulario",
        estado: true,
        idusuario: 1,
        idaspirante: idAspirante,
        idconvocatoria: convocatoriaId,
      };

      const resPostulacion = await fetch("http://127.0.0.1:8000/api/postulaciones/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPostulacion),
      });
      if (!resPostulacion.ok) throw new Error("Error creando postulación");

      console.log(" Postulación creada");

      //  Subir CV
      const formDataCv = new FormData();
      const extension = cvFile.name.split(".").pop().toLowerCase();
      const nombreSinExt = cvFile.name.replace(/\.[^/.]+$/, "");

      formDataCv.append("archivo", cvFile);
      formDataCv.append("nombrearchivo", nombreSinExt);
      formDataCv.append("mimearchivo", extension);
      formDataCv.append("fechasubida", new Date().toISOString().split("T")[0]);
      formDataCv.append("estado", true);
      formDataCv.append("idusuario", 1);
      formDataCv.append("idtipodocumento", 1); // 📌 tipo "CV"
      formDataCv.append("idempleado", ""); // puede ir vacío
      formDataCv.append("idaspirante", idAspirante);

      const resCV = await fetch("http://127.0.0.1:8000/api/documentos/", {
        method: "POST",
        body: formDataCv
      });

      if (!resCV.ok) throw new Error("Error subiendo CV");

      console.log(" CV Subido");

      alert(" ¡Postulación enviada con CV exitosamente!");
      onClose();

    } catch (error) {
      console.error(error);
      alert(" Error al procesar la postulación");
    }
  };

  const next = () => setStep(s => Math.min(3, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    width: 600,
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
    zIndex: 2000,
    display: "flex",
    flexDirection: "column",
  };

  const btnStyle = {
    minWidth: 120,
    height: 45,
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
  };

  const btnPrimary = { ...btnStyle, background: "#1a73e8", color: "#fff" };
  const btnGhost = { ...btnStyle, background: "#ccc", color: "#333" };
  const btnCancel = { ...btnStyle, background: "#f44336", color: "#fff" };

  return (
    <div style={modalStyle}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Postularse a Convocatoria</h2>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>NIT</label>
              <input name="nit" value={formData.nit} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>DPI</label>
              <input name="dpi" value={formData.dpi} onChange={handleDpiChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Género</label>
              <select name="genero" value={formData.genero} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}>
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
            <label>Idioma</label>
            <select
              name="ididioma"
              value={formData.ididioma}
              onChange={(e) => setFormData({ ...formData, ididioma: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">Seleccione un idioma</option>
              {idiomas.map((idioma) => (
                <option key={idioma.ididioma} value={idioma.ididioma}>
                  {idioma.nombreidioma}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label>Pueblo / Cultura</label>
            <select
              name="idpueblocultura"
              value={formData.idpueblocultura}
              onChange={(e) => setFormData({ ...formData, idpueblocultura: e.target.value })}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">Seleccione un pueblo</option>
              {pueblos.map((pueblo) => (
                <option key={pueblo.idpueblocultura} value={pueblo.idpueblocultura}>
                  {pueblo.nombrepueblo}
                </option>
              ))}
            </select>
          </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ marginBottom: 15 }}>
              <label>Fecha de nacimiento</label>
              <input type="date" name="fechanacimiento" value={formData.fechanacimiento} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Teléfono</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Dirección</label>
              <input name="direccion" value={formData.direccion} onChange={handleChange} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: 15 }}>
              <label>Curriculum Vitae (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setCvFile(e.target.files[0])}
                required
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
              />
            </div>
          </>
        )}

        {/* BOTONES */}
        <div style={{ display: "flex", justifyContent: step === 3 ? "center" : "space-between", gap: 12, marginTop: 20 }}>
          {step > 1 && step < 3 && <button type="button" onClick={back} style={btnGhost}>Atrás</button>}
          {step < 3 && <button type="button" onClick={next} style={btnPrimary}>Siguiente</button>}
          {step === 3 && <>
            <button type="submit" style={btnPrimary}>Enviar</button>
            <button type="button" onClick={onClose} style={btnCancel}>Cancelar</button>
          </>}
        </div>
      </form>

      <button
        onClick={onClose}
        style={{ position: "absolute", top: 10, right: 15, background: "transparent", border: "none", cursor: "pointer" }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
    </div>
  );
};

export default PostularModal;
