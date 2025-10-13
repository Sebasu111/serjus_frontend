import React from "react";
import { X } from "lucide-react";

const inputStyle = { width: "100%", padding: "12px 15px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16, marginTop: 6 };
const fs = { border: "1px solid #eee", borderRadius: 10, padding: 16, marginBottom: 16 };
const lg = { padding: "0 8px", fontWeight: 600 };
const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 };
const errStyle = { color: "#b00020", fontSize: 13, marginTop: 6, marginBottom: 6 };
const btnPrimary = { width: "100%", marginTop: 16, padding: "12px 0", background: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" };

const pick = (obj, ...keys) => { for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; };
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idpueblocultura", "idPuebloCultura");

const getIdiomaLabel = (o) => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloLabel = (o) => pick(o, "nombrepueblo", "nombrePueblo", "pueblocultura", "descripcion", "label");

const AspiranteForm = ({
    form, errors, onChange, handleSubmit, onClose, editingId, idiomas = [], pueblos = [],
}) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 1000, maxWidth: "95%",
                background: "#fff", boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: 30, zIndex: 1000, display: "flex",
                flexDirection: "column", borderRadius: 12,
                maxHeight: "90vh", overflowY: "auto",
            }}
        >
            <h3 style={{ marginBottom: 6, textAlign: "center" }}>
                {editingId ? "Editar aspirante" : "Registrar aspirante"}
            </h3>

            <form onSubmit={handleSubmit}>
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
                                <input
                                    name="nit"
                                    value={form.nit}
                                    onChange={onChange}
                                    disabled={form.isCF}
                                    style={{ ...inputStyle, marginBottom: 0 }}
                                    maxLength={9}
                                    placeholder={form.isCF ? "C/F" : "123456789"}
                                />
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
                </fieldset>

                <fieldset style={fs}>
                    <legend style={lg}>Contacto y relaciones</legend>
                    <div style={grid3}>
                        <div>
                            <label>Teléfono</label>
                            <input name="telefono" value={form.telefono} onChange={onChange} required style={inputStyle} />
                            {errors.telefono && <div style={errStyle}>{errors.telefono}</div>}
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" name="email" value={form.email} onChange={onChange} required style={inputStyle} />
                            {errors.email && <div style={errStyle}>{errors.email}</div>}
                        </div>
                        <div>
                            <label>Dirección</label>
                            <input name="direccion" value={form.direccion} onChange={onChange} required style={inputStyle} />
                            {errors.direccion && <div style={errStyle}>{errors.direccion}</div>}
                        </div>
                    </div>

                    <div style={grid3}>
                        <div>
                            <label>Idioma (opcional)</label>
                            <select name="ididioma" value={form.ididioma} onChange={onChange} style={inputStyle}>
                                <option value="">Seleccione idioma</option>
                                {idiomas.map((it) => {
                                    const id = getId(it);
                                    const label = getIdiomaLabel(it) ?? `ID ${id}`;
                                    return <option key={id} value={id}>{label}</option>;
                                })}
                            </select>
                        </div>
                        <div>
                            <label>Pueblo / Cultura (opcional)</label>
                            <select name="idpueblocultura" value={form.idpueblocultura} onChange={onChange} style={inputStyle}>
                                <option value="">Seleccione pueblo/cultura</option>
                                {pueblos.map((p) => {
                                    const id = getId(p);
                                    const label = getPuebloLabel(p) ?? `ID ${id}`;
                                    return <option key={id} value={id}>{label}</option>;
                                })}
                            </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 28 }}>
                            <input type="checkbox" checked readOnly />
                            <label>Activo (por defecto)</label>
                        </div>
                    </div>
                </fieldset>

                <button type="submit" style={btnPrimary}>
                    {editingId ? "Actualizar Aspirante" : "Guardar Aspirante"}
                </button>
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

export default AspiranteForm;
