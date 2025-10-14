import React, { useState } from "react";
import { X } from "lucide-react";

const DEPARTAMENTOS_GT = [/* igual que antes… */ "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso", "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"];

const pick = (obj, ...keys) => { for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idequipo", "idEquipo", "idpueblocultura", "idPuebloCultura", "pk", "codigo");
const getIdiomaLabel = (o) => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloLabel = (o) => pick(o, "nombrePueblo", "nombrepueblo", "nombrepueblocultura", "nombre_pueblocultura", "nombre_pueblo_cultura", "pueblocultura", "pueblo", "cultura", "descripcion", "label");
const getEquipoLabel = (o) => pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");

const EmpleadoForm = ({
    form, errors, onChange, handleSubmit, onClose, editingId,
    idiomas = [], pueblos = [], equipos = [],
    lockEquipo = false,                 // << nuevo
}) => {
    const [step, setStep] = useState(1);
    const next = (e) => { e.preventDefault(); setStep((s) => Math.min(3, s + 1)); };
    const back = (e) => { e.preventDefault(); setStep((s) => Math.max(1, s - 1)); };
    const onFocusHijos = (e) => { if (String(e.target.value) === "0") onChange({ target: { name: "numerohijos", value: "" } }); };
    const onBlurHijos = (e) => { if (e.target.value === "") onChange({ target: { name: "numerohijos", value: 0 } }); };

    const inputStyle = { width: "100%", padding: "12px 15px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16, marginTop: 6 };
    const fs = { border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 16 };
    const lg = { padding: "0 8px", fontWeight: 600 };
    const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 };
    const errStyle = { color: "#b00020", fontSize: 13, marginTop: 6, marginBottom: 6 };
    const btnPrimary = { width: "100%", marginTop: 16, padding: "12px 0", background: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" };

    return (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1100, maxWidth: "95%", background: "#fff", boxShadow: "0 0 20px rgba(0,0,0,0.2)", padding: 30, zIndex: 1000, display: "flex", flexDirection: "column", borderRadius: 12, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: 6, textAlign: "center" }}>{editingId ? "Editar empleado" : "Registrar empleado"}</h3>
            <div style={{ textAlign: "center", marginBottom: 16, color: "#666", fontWeight: 600 }}>Paso {step} de 3</div>

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <>
                        <fieldset style={fs}>
                            <legend style={lg}>Datos personales</legend>
                            <div style={grid3}>
                                <div>
                                    <label>Nombre</label>
                                    <input name="nombre" value={form.nombre} onChange={onChange} required style={inputStyle} />
                                    {errors.nombre && <div style={errStyle}>{errors.nombre}</div>}
                                </div>
                                <div>
                                    <label>Apellido</label>
                                    <input name="apellido" value={form.apellido} onChange={onChange} required style={inputStyle} />
                                    {errors.apellido && <div style={errStyle}>{errors.apellido}</div>}
                                </div>
                                <div>
                                    <label>Género</label>
                                    <input name="genero" value={form.genero} onChange={onChange} required style={inputStyle} />
                                    {errors.genero && <div style={errStyle}>{errors.genero}</div>}
                                </div>
                            </div>

                            <div style={grid3}>
                                <div>
                                    <label>DPI (13 dígitos)</label>
                                    <input name="dpi" value={form.dpi} onChange={onChange} required style={inputStyle} maxLength={13} pattern="\d{13}" />
                                    {errors.dpi && <div style={errStyle}>{errors.dpi}</div>}
                                </div>
                                <div>
                                    <label style={{ display: "block" }}>NIT (1–9 dígitos) o C/F</label>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <input name="nit" value={form.nit} onChange={onChange} disabled={form.isCF} required={!form.isCF} style={{ ...inputStyle, marginBottom: 0 }} maxLength={9} placeholder={form.isCF ? "C/F" : "123456789"} />
                                        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <input type="checkbox" name="isCF" checked={form.isCF} onChange={onChange} />
                                            Consumidor Final (C/F)
                                        </label>
                                    </div>
                                    {errors.nit && <div style={errStyle}>{errors.nit}</div>}
                                </div>
                                <div>
                                    <label>Fecha de nacimiento</label>
                                    <input type="date" name="fechanacimiento" value={form.fechanacimiento} onChange={onChange} required style={inputStyle} />
                                    {errors.fechanacimiento && <div style={errStyle}>{errors.fechanacimiento}</div>}
                                </div>
                            </div>

                            <div style={grid3}>
                                <div>
                                    <label>Lugar de nacimiento (Departamento)</label>
                                    <select name="lugarnacimiento" value={form.lugarnacimiento} onChange={onChange} required style={inputStyle}>
                                        <option value="">Seleccione departamento</option>
                                        {DEPARTAMENTOS_GT.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {errors.lugarnacimiento && <div style={errStyle}>{errors.lugarnacimiento}</div>}
                                </div>
                                <div>
                                    <label>Estado civil</label>
                                    <select name="estadocivil" value={form.estadocivil} onChange={onChange} required style={inputStyle}>
                                        <option value="">Seleccione una opción</option>
                                        <option value="Soltero">Soltero</option><option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option><option value="Viudo">Viudo</option>
                                        <option value="Union de hecho">Union de hecho</option>
                                    </select>
                                    {errors.estadocivil && <div style={errStyle}>{errors.estadocivil}</div>}
                                </div>
                                <div>
                                    <label>Número IGGS (13 dígitos)</label>
                                    <input name="numeroiggs" value={form.numeroiggs} onChange={onChange} required style={inputStyle} maxLength={13} placeholder="0000000000000" />
                                    {errors.numeroiggs && <div style={errStyle}>{errors.numeroiggs}</div>}
                                </div>
                            </div>
                        </fieldset>
                    </>
                )}

                {step === 2 && (
                    <>
                        <fieldset style={fs}>
                            <legend style={lg}>Contacto</legend>
                            <div style={grid3}>
                                <div>
                                    <label>Teléfono residencial</label>
                                    <input name="telefonoresidencial" value={form.telefonoresidencial} onChange={onChange} required style={inputStyle} maxLength={8} inputMode="numeric" pattern="\d{8}" placeholder="77771234" />
                                    {errors.telefonoresidencial && <div style={errStyle}>{errors.telefonoresidencial}</div>}
                                </div>
                                <div>
                                    <label>Teléfono celular</label>
                                    <input name="telefonocelular" value={form.telefonocelular} onChange={onChange} required style={inputStyle} maxLength={8} inputMode="numeric" pattern="\d{8}" placeholder="55551234" />
                                    {errors.telefonocelular && <div style={errStyle}>{errors.telefonocelular}</div>}
                                </div>
                                <div>
                                    <label>Teléfono emergencia</label>
                                    <input name="telefonoemergencia" value={form.telefonoemergencia} onChange={onChange} required style={inputStyle} maxLength={8} inputMode="numeric" pattern="\d{8}" placeholder="44441234" />
                                    {errors.telefonoemergencia && <div style={errStyle}>{errors.telefonoemergencia}</div>}
                                </div>
                            </div>
                            <div style={grid3}>
                                <div>
                                    <label>Email</label>
                                    <input type="email" name="email" value={form.email} onChange={onChange} required style={inputStyle} placeholder="usuario@ejemplo.com" />
                                    {errors.email && <div style={errStyle}>{errors.email}</div>}
                                </div>
                                <div>
                                    <label>Dirección</label>
                                    <input name="direccion" value={form.direccion} onChange={onChange} required style={inputStyle} />
                                    {errors.direccion && <div style={errStyle}>{errors.direccion}</div>}
                                </div>
                                <div />
                            </div>
                        </fieldset>

                        <fieldset style={fs}>
                            <legend style={lg}>Relaciones</legend>
                            <div style={grid3}>
                                <div>
                                    <label>Idioma</label>
                                    <select name="ididioma" value={form.ididioma} onChange={onChange} required style={inputStyle}>
                                        <option value="">Seleccione idioma</option>
                                        {idiomas.map((it) => <option key={getId(it)} value={getId(it)}>{getIdiomaLabel(it) ?? `ID ${getId(it)}`}</option>)}
                                    </select>
                                    {errors.ididioma && <div style={errStyle}>{errors.ididioma}</div>}
                                </div>
                                <div>
                                    <label>Pueblo / Cultura</label>
                                    <select name="idpueblocultura" value={form.idpueblocultura} onChange={onChange} required style={inputStyle}>
                                        <option value="">Seleccione pueblo/cultura</option>
                                        {pueblos.map((p) => <option key={getId(p)} value={getId(p)}>{getPuebloLabel(p) ?? `ID ${getId(p)}`}</option>)}
                                    </select>
                                    {errors.idpueblocultura && <div style={errStyle}>{errors.idpueblocultura}</div>}
                                </div>
                                <div>
                                    <label>Equipo</label>
                                    <select
                                        name="idequipo"
                                        value={form.idequipo}
                                        onChange={onChange}
                                        required
                                        disabled={lockEquipo}      // << bloqueado si viene por URL o al editar
                                        style={{ ...inputStyle, backgroundColor: lockEquipo ? "#f3f4f6" : "#fff" }}
                                        title={lockEquipo ? "El equipo se determina desde la pestaña de equipos" : "Selecciona un equipo"}
                                    >
                                        <option value="">Seleccione equipo</option>
                                        {equipos.map((e) => <option key={getId(e)} value={getId(e)}>{getEquipoLabel(e) ?? `ID ${getId(e)}`}</option>)}
                                    </select>
                                    {errors.idequipo && <div style={errStyle}>{errors.idequipo}</div>}
                                </div>
                            </div>
                        </fieldset>
                    </>
                )}

                {step === 3 && (
                    <fieldset style={fs}>
                        <legend style={lg}>Estado & Familia</legend>
                        <div style={grid3}>
                            <div>
                                <label>Número de hijos</label>
                                <input type="number" name="numerohijos" value={form.numerohijos} onChange={onChange} onFocus={onFocusHijos} onBlur={onBlurHijos} min={0} required style={inputStyle} />
                                {errors.numerohijos && <div style={errStyle}>{errors.numerohijos}</div>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
                                <input type="checkbox" name="estado" checked={true} readOnly />
                                <label>Activo (por defecto)</label>
                            </div>
                            <div />
                        </div>
                        <div style={grid3}>
                            <div>
                                <label>Título de nivel medio</label>
                                <input name="titulonivelmedio" value={form.titulonivelmedio} onChange={onChange} required style={inputStyle} />
                                {errors.titulonivelmedio && <div style={errStyle}>{errors.titulonivelmedio}</div>}
                            </div>
                            <div>
                                <label>Estudios / Título universitario</label>
                                <input name="estudiosuniversitarios" value={form.estudiosuniversitarios} onChange={onChange} required style={inputStyle} />
                                {errors.estudiosuniversitarios && <div style={errStyle}>{errors.estudiosuniversitarios}</div>}
                            </div>
                            <div />
                        </div>
                    </fieldset>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 8 }}>
                    <button onClick={back} disabled={step === 1} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", cursor: step === 1 ? "not-allowed" : "pointer" }} type="button">Atrás</button>
                    {step < 3 ? (
                        <button onClick={next} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#219ebc", color: "#fff", fontWeight: 600, cursor: "pointer" }} type="button">Siguiente</button>
                    ) : (
                        <button type="submit" style={btnPrimary}>{editingId ? "Actualizar Empleado" : "Guardar Empleado"}</button>
                    )}
                </div>
            </form>

            <button onClick={onClose} style={{ position: "absolute", top: 10, right: 15, background: "transparent", border: "none", cursor: "pointer" }} title="Cerrar">
                <X size={24} color="#555" />
            </button>
        </div>
    );
};

export default EmpleadoForm;
