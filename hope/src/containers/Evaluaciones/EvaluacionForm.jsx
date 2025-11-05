import React, { useState } from "react";
import { X } from "lucide-react";

const pick = (obj, ...keys) => {
    for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
};

const getId = o => pick(o, "id", "idempleado", "idEmpleado", "idaspirante", "idAspirante", "idpostulacion", "idPostulacion");
const getEmpleadoLabel = o => `${pick(o, "nombre") || ""} ${pick(o, "apellido") || ""}`.trim();
const getPostulacionLabel = o => pick(o, "observacion", "descripcion", "nombre");

const EvaluacionForm = ({
    form,
    errors,
    onChange,
    handleSubmit,
    onClose,
    editingId,
    empleados = [],
    postulaciones = []
}) => {
    const [tipoEvaluacion, setTipoEvaluacion] = useState(
        form.idempleado ? "empleado" : form.idpostulacion ? "postulacion" : ""
    );

    const Field = ({ label, name, type = "text", required = false, children, full = false }) => (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                gridColumn: full ? "1 / -1" : "auto"
            }}
        >
            <label
                style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                }}
            >
                {label}
                {required && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            {children}
            {errors[name] && (
                <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
                    {typeof errors[name] === "string" ? errors[name] : "Este campo es obligatorio"}
                </span>
            )}
        </div>
    );

    const Input = ({ name, type = "text", placeholder = "", step, min, max, ...props }) => (
        <input
            name={name}
            type={type}
            value={form[name] || ""}
            onChange={onChange}
            placeholder={placeholder}
            step={step}
            min={min}
            max={max}
            {...props}
            style={{
                padding: "12px 16px",
                border: `1px solid ${errors[name] ? "#ef4444" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: "#fff",
                fontFamily: "inherit"
            }}
        />
    );

    const Select = ({ name, children, ...props }) => (
        <select
            name={name}
            value={form[name] || ""}
            onChange={onChange}
            {...props}
            style={{
                padding: "12px 16px",
                border: `1px solid ${errors[name] ? "#ef4444" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: "#fff",
                fontFamily: "inherit",
                cursor: "pointer"
            }}
        >
            {children}
        </select>
    );

    const TextArea = ({ name, placeholder = "", rows = 3 }) => (
        <textarea
            name={name}
            value={form[name] || ""}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            style={{
                padding: "12px 16px",
                border: `1px solid ${errors[name] ? "#ef4444" : "#d1d5db"}`,
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: "#fff",
                fontFamily: "inherit",
                resize: "vertical",
                minHeight: "80px"
            }}
        />
    );

    const handleTipoChange = (tipo) => {
        setTipoEvaluacion(tipo);
        // Limpiar los campos contrarios
        if (tipo === "empleado") {
            onChange({ target: { name: "idpostulacion", value: "" } });
        } else if (tipo === "postulacion") {
            onChange({ target: { name: "idempleado", value: "" } });
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: "20px"
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    width: "100%",
                    maxWidth: "700px",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 32px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f8fafc"
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
                        {editingId ? "Editar Evaluación" : "Nueva Evaluación"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 8,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6b7280"
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: "32px",
                        overflowY: "auto",
                        flex: 1
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gap: 24
                        }}
                    >
                        {/* Tipo de Evaluación */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 12, display: "block" }}>
                                Tipo de Evaluación <span style={{ color: "#ef4444" }}>*</span>
                            </label>
                            <div style={{ display: "flex", gap: 16 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="tipoEvaluacion"
                                        value="empleado"
                                        checked={tipoEvaluacion === "empleado"}
                                        onChange={(e) => handleTipoChange(e.target.value)}
                                        style={{ marginRight: 4 }}
                                    />
                                    <span>Colaborador</span>
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                                    <input
                                        type="radio"
                                        name="tipoEvaluacion"
                                        value="postulacion"
                                        checked={tipoEvaluacion === "postulacion"}
                                        onChange={(e) => handleTipoChange(e.target.value)}
                                        style={{ marginRight: 4 }}
                                    />
                                    <span>Postulación</span>
                                </label>
                            </div>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: 20
                            }}
                        >
                            {/* Colaborador o Postulación */}
                            {tipoEvaluacion === "empleado" && (
                                <Field label="Colaborador" name="idempleado" required>
                                    <Select name="idempleado">
                                        <option value="">Seleccionar colaborador...</option>
                                        {empleados.map(emp => (
                                            <option key={getId(emp)} value={getId(emp)}>
                                                {getEmpleadoLabel(emp)}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            )}

                            {tipoEvaluacion === "postulacion" && (
                                <Field label="Postulación" name="idpostulacion" required>
                                    <Select name="idpostulacion">
                                        <option value="">Seleccionar postulación...</option>
                                        {postulaciones.map(post => (
                                            <option key={getId(post)} value={getId(post)}>
                                                {getPostulacionLabel(post) || `Postulación #${getId(post)}`}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            )}

                            {/* Modalidad */}
                            <Field label="Modalidad" name="modalidad" required>
                                <Select name="modalidad">
                                    <option value="">Seleccionar modalidad...</option>
                                    <option value="Presencial">Presencial</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Híbrida">Híbrida</option>
                                </Select>
                            </Field>

                            {/* Fecha de Evaluación */}
                            <Field label="Fecha de Evaluación" name="fechaevaluacion" required>
                                <Input
                                    name="fechaevaluacion"
                                    type="date"
                                    max={new Date().toISOString().slice(0, 10)}
                                />
                            </Field>

                            {/* Puntaje Total */}
                            <Field label="Puntaje Total (0-100)" name="puntajetotal" required>
                                <Input
                                    name="puntajetotal"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="Ej: 85.5"
                                />
                            </Field>
                        </div>

                        {/* Observación */}
                        <Field label="Observación" name="observacion" required full>
                            <TextArea
                                name="observacion"
                                placeholder="Describe los aspectos relevantes de la evaluación..."
                                rows={4}
                            />
                        </Field>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "24px 32px",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 12,
                        background: "#f8fafc"
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            border: "1px solid #d1d5db",
                            borderRadius: 8,
                            background: "#ffffff",
                            color: "#374151",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: "10px 20px",
                            border: "none",
                            borderRadius: 8,
                            background: "#3b82f6",
                            color: "#ffffff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        {editingId ? "Actualizar" : "Registrar"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EvaluacionForm;