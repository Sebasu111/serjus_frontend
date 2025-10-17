import React, { useMemo, useState } from "react";
import { X } from "lucide-react";

const displayName = (emp) => {
    const candidates = [
        emp?.nombreCompleto,
        [emp?.nombres, emp?.apellidos].filter(Boolean).join(" "),
        [emp?.nombre, emp?.apellido].filter(Boolean).join(" "),
        [emp?.primerNombre, emp?.segundoNombre, emp?.apellidoPaterno, emp?.apellidoMaterno].filter(Boolean).join(" "),
        [emp?.first_name, emp?.last_name].filter(Boolean).join(" "),
        emp?.full_name,
        emp?.displayName,
        emp?.nombre_empleado,
        emp?.name,
    ].map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
    if (candidates[0]) return candidates[0];
    const id = emp?.idEmpleado ?? emp?.idempleado ?? emp?.id ?? emp?.pk ?? emp?.uuid ?? emp?.codigo ?? "?";
    return `Empleado #${id}`;
};
const empId = (emp) => emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

const toLocalDT = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const EvaluacionForm = ({
    empleados = [],
    editingId,
    evaluacion,
    onCancel,
    onSubmit,
}) => {
    const [idEmpleado, setIdEmpleado] = useState(evaluacion?.idEmpleado ?? "");
    const [tipoEvaluacion, setTipoEvaluacion] = useState(evaluacion?.tipoEvaluacion ?? "");
    const [fechaEvaluacion, setFechaEvaluacion] = useState(toLocalDT(evaluacion?.fechaEvaluacion) || "");
    const [puntajeTotal, setPuntajeTotal] = useState(evaluacion?.puntajeTotal ?? "");
    const [observacion, setObservacion] = useState(evaluacion?.observacion ?? "");
    const [estado, setEstado] = useState(evaluacion?.estado ?? true);

    const [qEmpleado, setQEmpleado] = useState("");

    const empleadosOrdenados = useMemo(
        () => [...empleados].sort((a, b) => displayName(a).localeCompare(displayName(b), "es", { sensitivity: "base" })),
        [empleados]
    );

    const opcionesEmpleado = useMemo(() => {
        const t = qEmpleado.trim().toLowerCase();
        return empleadosOrdenados.filter((e) => displayName(e).toLowerCase().includes(t));
    }, [empleadosOrdenados, qEmpleado]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!idEmpleado || !tipoEvaluacion || !fechaEvaluacion) return;

        // Convertimos datetime-local a ISO (backend acepta datetime)
        const iso = new Date(fechaEvaluacion).toISOString();

        onSubmit({
            idEmpleado,
            tipoEvaluacion,
            fechaEvaluacion: iso,
            puntajeTotal,
            observacion,
            estado,
        });
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 3000,
            }}
        >
            <div
                style={{
                    width: "min(720px,96vw)",
                    maxHeight: "92vh",
                    overflow: "auto",
                    background: "#fff",
                    boxShadow: "0 0 30px rgba(0,0,0,0.25)",
                    padding: 24,
                    borderRadius: 14,
                }}
            >
                <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 18 }}>
                    {editingId ? "Editar Evaluación" : "Nueva Evaluación"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {/* Empleado */}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: 6 }}>Empleado</label>
                            <input
                                type="text"
                                placeholder="Buscar empleado..."
                                value={qEmpleado}
                                onChange={(e) => setQEmpleado(e.target.value)}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 8 }}
                            />
                            <select
                                value={idEmpleado ?? ""}
                                onChange={(e) => setIdEmpleado(Number(e.target.value))}
                                required
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            >
                                <option value="" disabled>Selecciona un empleado...</option>
                                {opcionesEmpleado.map((emp) => (
                                    <option key={empId(emp)} value={empId(emp)}>
                                        {displayName(emp)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Tipo de evaluación</label>
                            <input
                                type="text"
                                value={tipoEvaluacion}
                                onChange={(e) => setTipoEvaluacion(e.target.value)}
                                placeholder="p. ej. Desempeño trimestral"
                                required
                                maxLength={100}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            />
                        </div>

                        {/* Fecha */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Fecha de evaluación</label>
                            <input
                                type="datetime-local"
                                value={fechaEvaluacion}
                                onChange={(e) => setFechaEvaluacion(e.target.value)}
                                required
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            />
                        </div>

                        {/* Puntaje */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Puntaje total</label>
                            <input
                                type="number"
                                step="0.01"
                                value={puntajeTotal}
                                onChange={(e) => setPuntajeTotal(e.target.value)}
                                required
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            />
                        </div>

                        {/* Estado */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Estado</label>
                            <select
                                value={String(estado)}
                                onChange={(e) => setEstado(e.target.value === "true")}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            >
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>

                        {/* Observación */}
                        <div style={{ gridColumn: "1 / -1" }}>
                            <label style={{ display: "block", marginBottom: 6 }}>Observación</label>
                            <input
                                type="text"
                                maxLength={150}
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                placeholder="Comentario breve (máx. 150)"
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                background: "#6c757d",
                                color: "#fff",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                background: "#219ebc",
                                color: "#fff",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontWeight: 600,
                            }}
                        >
                            {editingId ? "Actualizar" : "Crear"}
                        </button>
                    </div>
                </form>

                <button
                    onClick={onCancel}
                    style={{
                        position: "absolute",
                        top: 14,
                        right: 18,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                    }}
                    title="Cerrar"
                >
                    <X size={22} color="#555" />
                </button>
            </div>
        </div>
    );
};

export default EvaluacionForm;
