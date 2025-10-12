import React from "react";
import { X } from "lucide-react";

const label = { display: "block", marginBottom: "6px", fontWeight: 600 };
const inputStyle = { width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" };
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };

const AspiranteForm = ({
    form,
    setForm,
    aspiranteEditable,
    idiomas,
    pueblos,
    editingId,
    handleSubmit,
    onClose,
}) => {
    const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

    const onlyLetters = (v) => /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/.test(v);
    const onlyDigits = (v) => /^[0-9]*$/.test(v);

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "700px",
                maxWidth: "95%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "24px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
            }}
        >
            <h3 style={{ marginBottom: "12px", textAlign: "center" }}>
                {editingId ? "Editar aspirante" : "Registrar aspirante"}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
                <div style={twoCol}>
                    <div>
                        <label style={label}>Nombre</label>
                        <input
                            type="text"
                            value={form.nombreAspirante}
                            onChange={(e) => onlyLetters(e.target.value) && set("nombreAspirante", e.target.value)}
                            required
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={label}>Apellido</label>
                        <input
                            type="text"
                            value={form.apellidoAspirante}
                            onChange={(e) => onlyLetters(e.target.value) && set("apellidoAspirante", e.target.value)}
                            required
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={twoCol}>
                    <div>
                        <label style={label}>DPI</label>
                        <input
                            type="text"
                            value={form.dpi}
                            onChange={(e) => onlyDigits(e.target.value) && set("dpi", e.target.value)}
                            placeholder="13 dígitos"
                            required
                            maxLength={13}
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={label}>NIT</label>
                        <input
                            type="text"
                            value={form.nit}
                            onChange={(e) => set("nit", e.target.value)}
                            placeholder="Opcional (formato local)"
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={twoCol}>
                    <div>
                        <label style={label}>Género</label>
                        <select
                            value={form.genero}
                            onChange={(e) => set("genero", e.target.value)}
                            required
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        >
                            <option value="">Seleccione…</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label style={label}>Correo</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            required
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={twoCol}>
                    <div>
                        <label style={label}>Fecha de nacimiento</label>
                        <input
                            type="date"
                            value={form.fechaNacimiento}
                            onChange={(e) => set("fechaNacimiento", e.target.value)}
                            required
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label style={label}>Teléfono</label>
                        <input
                            type="text"
                            value={form.telefono}
                            onChange={(e) => onlyDigits(e.target.value) && set("telefono", e.target.value)}
                            required
                            maxLength={20}
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div>
                    <label style={label}>Dirección</label>
                    <input
                        type="text"
                        value={form.direccion}
                        onChange={(e) => set("direccion", e.target.value)}
                        required
                        disabled={!aspiranteEditable}
                        style={inputStyle}
                    />
                </div>

                <div style={twoCol}>
                    <div>
                        <label style={label}>Idioma</label>
                        <select
                            value={form.idIdioma || ""}
                            onChange={(e) => set("idIdioma", e.target.value)}
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        >
                            <option value="">-- Sin especificar --</option>
                            {idiomas.map((i) => (
                                <option key={i.ididioma ?? i.idIdioma} value={i.ididioma ?? i.idIdioma}>
                                    {i.nombreidioma || i.nombre || "Idioma"}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={label}>Pueblo/Cultura</label>
                        <select
                            value={form.idPuebloCultura || ""}
                            onChange={(e) => set("idPuebloCultura", e.target.value)}
                            disabled={!aspiranteEditable}
                            style={inputStyle}
                        >
                            <option value="">-- Sin especificar --</option>
                            {pueblos.map((p) => (
                                <option key={p.idPuebloCultura ?? p.idpueblocultura} value={p.idPuebloCultura ?? p.idpueblocultura}>
                                    {p.nombrepueblocultura || p.nombre || "Pueblo/Cultura"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!aspiranteEditable}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: aspiranteEditable ? "#219ebc" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: aspiranteEditable ? "pointer" : "not-allowed",
                        marginTop: "6px",
                    }}
                >
                    {editingId ? "Actualizar" : "Guardar"}
                </button>
            </form>

            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
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

export default AspiranteForm;
