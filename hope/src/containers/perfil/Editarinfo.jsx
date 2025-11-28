import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchIdiomasYPueblos, updateEmpleado, saveCVEmpleado } from "./editarinfo";
import { showToast } from "../../utils/toast";

const DEPARTAMENTOS_GT = [
  "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso",
  "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa",
  "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos",
  "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
];

const Editarinfo = ({ form, onChange, onClose }) => {
  const [step, setStep] = useState(1);
  const [idiomas, setIdiomas] = useState([]);
  const [pueblos, setPueblos] = useState([]);
  const [saving, setSaving] = useState(false);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  useEffect(() => {
    const loadData = async () => {
      const { idiomas, pueblos } = await fetchIdiomasYPueblos();
      setIdiomas(idiomas);
      setPueblos(pueblos);
    };
    loadData();
  }, []);

  // === estilos ===
  const labelStyle = { display: "block", fontWeight: 600, marginBottom: 6 };
  const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 15 };
  const field = { display: "flex", flexDirection: "column", marginBottom: 20 };
  const fs = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 18, background: "#fafafa" };
  const lg = { padding: "0 8px", fontWeight: 700 };
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 };

  const hasCustomLugar = form.lugarnacimiento && !DEPARTAMENTOS_GT.includes(form.lugarnacimiento);
  const [showCustomLugar, setShowCustomLugar] = useState(hasCustomLugar);

  const handleLugarNacimientoChange = (e) => {
    const value = e.target.value;
    if (value === "__otro__") {
      setShowCustomLugar(true);
      onChange({ target: { name: "lugarnacimiento", value: "" } });
    } else {
      setShowCustomLugar(false);
      onChange(e);
    }
  };

  // === Guardar ===
  const handleGuardar = async () => {
    try {
      setSaving(true);

      const empleadoPayload = { ...form };
      delete empleadoPayload.cvUrl;
      delete empleadoPayload.cvFile;
      delete empleadoPayload.isCF;

      await updateEmpleado(form.idempleado, empleadoPayload);

      if (form.cvFile) {
        await saveCVEmpleado(form.idempleado, form.cvFile);
      }

      showToast("Perfil actualizado correctamente", "success");
      onClose();
    } catch (e) {
      console.error(e);
      showToast("Error al guardar la información", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* overlay fondo */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 999 }}
      />

      {/* modal */}
      <div
        style={{
          width: "min(1100px, 95vw)",
          position: "fixed",
          top: "50%",
          left: "53%",
          transform: "translate(-50%, -50%)",
          background: "white",
          borderRadius: 14,
          padding: 20,
          maxHeight: "90vh",
          overflowY: "auto",
          zIndex: 1000
        }}
      >
        <div className="empleado-form-container">
          <h3 style={{ marginBottom: 4, textAlign: "center" }}>Editar información del colaborador</h3>
          <div style={{ textAlign: "center", marginBottom: 18, fontWeight: 700 }}>Paso {step} de 3</div>

          {/* paso 1 */}
          {step === 1 && (
            <div data-step="1">
              <fieldset style={fs}>
                <legend style={lg}>Datos personales</legend>

                <div style={grid3}>
                  <div style={field}>
                    <label style={labelStyle}>Nombre</label>
                    <input name="nombre" value={form.nombre || ""} onChange={onChange} style={inputStyle} />
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>Apellido</label>
                    <input name="apellido" value={form.apellido || ""} onChange={onChange} style={inputStyle} />
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>Género</label>
                    <select name="genero" value={form.genero || ""} onChange={onChange} style={inputStyle}>
                      <option value="">Seleccione género</option>
                      <option>Masculino</option>
                      <option>Femenino</option>
                      <option>Otros</option>
                    </select>
                  </div>
                </div>

                <div style={grid3}>
                  <div style={field}>
                    <label style={labelStyle}>Lugar de nacimiento</label>
                    <select
                      name="lugarnacimiento"
                      value={DEPARTAMENTOS_GT.includes(form.lugarnacimiento) ? form.lugarnacimiento : (showCustomLugar ? "__otro__" : form.lugarnacimiento)}
                      onChange={handleLugarNacimientoChange}
                      style={inputStyle}
                    >
                      <option value="">Seleccione departamento</option>
                      {DEPARTAMENTOS_GT.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="__otro__">Otro...</option>
                    </select>

                    {showCustomLugar && (
                      <input
                        type="text"
                        name="lugarnacimiento"
                        placeholder="Escriba la opción"
                        value={form.lugarnacimiento || ""}
                        onChange={onChange}
                        style={{ ...inputStyle, marginTop: 8 }}
                      />
                    )}
                  </div>

                  <div style={field}>
                    <label style={labelStyle}>Fecha de nacimiento</label>
                    <input type="date" name="fechanacimiento" value={form.fechanacimiento || ""} onChange={onChange} style={inputStyle} />
                  </div>

                  <div style={field}>
                    <label style={labelStyle}>Estado civil</label>
                    <select name="estadocivil" value={form.estadocivil || ""} onChange={onChange} style={inputStyle}>
                      <option value="">Seleccione estado civil</option>
                      <option>Soltero</option>
                      <option>Casado</option>
                      <option>Divorciado</option>
                      <option>Viudo</option>
                      <option>Union de hecho</option>
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset style={fs}>
                <legend style={lg}>Identificación</legend>

                <div style={grid3}>
                  <div style={field}>
                    <label style={labelStyle}>DPI</label>
                    <input name="dpi" value={form.dpi || ""} onChange={onChange} style={inputStyle} />
                  </div>

                  <div style={field}>
                    <label style={labelStyle}>NIT</label>
                    <input name="nit" value={form.nit || ""} onChange={onChange} style={inputStyle} />
                  </div>

                  <div style={field}>
                    <label style={labelStyle}>Número IGSS</label>
                    <input name="numeroiggs" value={form.numeroiggs || ""} onChange={onChange} style={inputStyle} />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* paso 2 */}
          {step === 2 && (
            <div data-step="2">
              <fieldset style={fs}>
                <legend style={lg}>Contacto</legend>

                <div style={grid3}>
                  <div style={field}>
                    <label style={labelStyle}>Tel. celular</label>
                    <input name="telefonocelular" value={form.telefonocelular || ""} onChange={onChange} style={inputStyle} />
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>Tel. emergencia</label>
                    <input name="telefonoemergencia" value={form.telefonoemergencia || ""} onChange={onChange} style={inputStyle} />
                  </div>
                  <div style={field}>
                    <label style={labelStyle}>Tel. residencial</label>
                    <input name="telefonoresidencial" value={form.telefonoresidencial || ""} onChange={onChange} style={inputStyle} />
                  </div>
                </div>

                <div style={grid3}>
                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Email</label>
                    <input name="email" value={form.email || ""} onChange={onChange} style={inputStyle} />
                  </div>
                  <div style={{ ...field, gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Dirección</label>
                    <input name="direccion" value={form.direccion || ""} onChange={onChange} style={inputStyle} />
                  </div>
                </div>
              </fieldset>

              <fieldset style={fs}>
                <legend style={lg}>Cultura</legend>
                <div style={grid3}>
                  <div style={field}>
                    <label style={labelStyle}>Idioma</label>
                    <select name="ididioma" value={form.ididioma || ""} onChange={onChange} style={inputStyle}>
                      <option value="">Seleccione idioma</option>
                      {idiomas.map((i) => (
                        <option key={i.ididioma} value={i.ididioma}>{i.nombreidioma}</option>
                      ))}
                    </select>
                  </div>

                  <div style={field}>
                    <label style={labelStyle}>Pueblo / Cultura</label>
                    <select name="idpueblocultura" value={form.idpueblocultura || ""} onChange={onChange} style={inputStyle}>
                      <option value="">Seleccione cultura</option>
                      {pueblos.map((p) => (
                        <option key={p.idpueblocultura} value={p.idpueblocultura}>{p.nombrepueblo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {step === 3 && (
          <div data-step="3">
            <fieldset style={fs}>
              <legend style={lg}>Estado & Formación</legend>

              <div style={grid3}>
                <div style={field}>
                  <label style={labelStyle}>Número de hijos</label>
                  <input
                    name="numerohijos"
                    value={form.numerohijos ?? ""}
                    onChange={onChange}
                    style={inputStyle}
                  />
                </div>

                <div style={field}>
                  <label style={labelStyle}>Título nivel medio</label>
                  <input
                    name="titulonivelmedio"
                    value={form.titulonivelmedio || ""}
                    onChange={onChange}
                    style={inputStyle}
                  />
                </div>

                <div style={field}>
                  <label style={labelStyle}>Estudios universitarios</label>
                  <input
                    name="estudiosuniversitarios"
                    value={form.estudiosuniversitarios || ""}
                    onChange={onChange}
                    style={inputStyle}
                  />
                </div>

                <div style={field}>
                  <label style={labelStyle}>Fecha de inicio laboral</label>
                  <input
                    type="date"
                    name="inicioLaboral"           // 👈 ojo aquí
                    value={form.inicioLaboral || ""} // 👈 y aquí
                    onChange={onChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* CV igual que ya lo tienes */}
              <div style={{ ...field, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>CV del colaborador</label>

                {form.cvUrl && (
                  <a
                    href={form.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginBottom: 10,
                      padding: "10px 14px",
                      background: "#0a9396",
                      color: "white",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Ver CV actual
                  </a>
                )}

                <input
                  style={inputStyle}
                  type="file"
                  name="cvFile"
                  accept=".pdf"
                  onChange={(e) =>
                    onChange({
                      target: {
                        name: "cvFile",
                        value: e.target.files[0] || null,
                      },
                    })
                  }
                />
                <small style={{ marginTop: 4, fontSize: 13, color: "#555" }}>
                  Solo PDF, máximo 5MB
                </small>
              </div>
            </fieldset>
          </div>
        )}

          {/* navegación */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 0,
              paddingTop: 18,
              borderTop: "1px solid #e5e7eb"
            }}
          >
            <button disabled={step === 1} onClick={back} type="button" style={{ padding: "10px 16px" }}>
              Atrás
            </button>

            {step < 3 ? (
              <button
                onClick={next}
                type="button"
                style={{ padding: "10px 16px", background: "#219ebc", color: "white", borderRadius: 8 }}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGuardar}
                disabled={saving}
                style={{
                  padding: "10px 16px",
                  background: saving ? "#999" : "#219ebc",
                  color: "white",
                  borderRadius: 8,
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            )}
          </div>

          {/* cerrar */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 10, right: 15, background: "transparent", border: "none", cursor: "pointer" }}
          >
            <X size={24} color="#555" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Editarinfo;
