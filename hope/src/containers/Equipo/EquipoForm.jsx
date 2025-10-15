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
    ]
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean);

    if (candidates[0]) return candidates[0];

    const id =
        emp?.idEmpleado ?? emp?.idempleado ?? emp?.id ?? emp?.pk ?? emp?.uuid ?? emp?.codigo ?? "?";
    return `Empleado #${id}`;
};

const empId = (emp) =>
    emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

const eqId = (eq) => eq.id ?? eq.idEquipo ?? eq.pk;

const EquipoForm = ({
    equipos = [],
    idEquipo,
    setIdEquipo,
    idCoordinador,
    setIdCoordinador,
    empleados = [],
    editingId,
    miembros = [],
    setMiembros,
    loadingMiembros = false,
    handleSubmit,
    onClose,
}) => {
    const [qCoord, setQCoord] = useState("");
    const [qMiembro, setQMiembro] = useState("");

    const empleadosOrdenados = useMemo(
        () =>
            [...empleados].sort((a, b) =>
                displayName(a).localeCompare(displayName(b), "es", { sensitivity: "base" })
            ),
        [empleados]
    );

    const opcionesCoord = useMemo(() => {
        const t = qCoord.trim().toLowerCase();
        return empleadosOrdenados.filter((e) => displayName(e).toLowerCase().includes(t));
    }, [empleadosOrdenados, qCoord]);

    const opcionesMiembro = useMemo(() => {
        const t = qMiembro.trim().toLowerCase();
        const setActuales = new Set(miembros.map(Number));
        return empleadosOrdenados.filter((e) => {
            const id = empId(e);
            return (
                displayName(e).toLowerCase().includes(t) &&
                id !== Number(idCoordinador) &&
                !setActuales.has(Number(id))
            );
        });
    }, [empleadosOrdenados, qMiembro, idCoordinador, miembros]);

    const maxAcompanantes = 6;

    const quitarMiembro = (id) => setMiembros(miembros.filter((x) => Number(x) !== Number(id)));
    const agregarMiembro = (id) => {
        if (Number(id) === Number(idCoordinador)) return;
        if (miembros.includes(Number(id))) return;
        if (miembros.length >= maxAcompanantes) return;
        setMiembros([...miembros, Number(id)]);
    };
    const vaciarMiembros = () => setMiembros([]);

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
                    width: "min(960px,96vw)",
                    maxHeight: "92vh",
                    overflow: "auto",
                    background: "#fff",
                    boxShadow: "0 0 30px rgba(0,0,0,0.25)",
                    padding: "28px",
                    borderRadius: "14px",
                }}
            >
                <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 18 }}>
                    {editingId ? "Actualizar Integrantes" : "Asignar Integrantes"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {/* Equipo */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Equipo</label>
                            <select
                                value={idEquipo ?? ""}
                                onChange={(e) => setIdEquipo(Number(e.target.value))}
                                required
                                disabled={!!editingId}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            >
                                <option value="" disabled>
                                    Selecciona un equipo...
                                </option>
                                {equipos.map((eq) => (
                                    <option key={eqId(eq)} value={eqId(eq)}>
                                        {eq.nombre ?? eq.nombreEquipo ?? `Equipo #${eqId(eq)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Coordinador */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Coordinador</label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={qCoord}
                                onChange={(e) => setQCoord(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    marginBottom: 8,
                                }}
                            />
                            <select
                                value={idCoordinador ?? ""}
                                onChange={(e) => setIdCoordinador(Number(e.target.value))}
                                required
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                            >
                                <option value="" disabled>
                                    Selecciona un empleado...
                                </option>
                                {opcionesCoord.map((emp) => (
                                    <option key={empId(emp)} value={empId(emp)}>
                                        {displayName(emp)}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: "#6b7280" }}>Solo puede haber un coordinador por equipo.</small>
                        </div>

                        {/* Miembros actuales */}
                        <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 6,
                                }}
                            >
                                <label style={{ fontWeight: 600 }}>
                                    Miembros actuales ({miembros.length} / {maxAcompanantes})
                                </label>
                                <button
                                    type="button"
                                    onClick={vaciarMiembros}
                                    disabled={miembros.length === 0 || loadingMiembros}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        cursor: miembros.length && !loadingMiembros ? "pointer" : "not-allowed",
                                    }}
                                    title="Quitar todos"
                                >
                                    Quitar todos
                                </button>
                            </div>

                            {loadingMiembros ? (
                                <div
                                    style={{
                                        border: "1px dashed #e5e7eb",
                                        padding: 14,
                                        borderRadius: 10,
                                        color: "#6b7280",
                                        marginBottom: 12,
                                    }}
                                >
                                    Cargando miembros…
                                </div>
                            ) : miembros.length === 0 ? (
                                <div
                                    style={{
                                        border: "1px dashed #e5e7eb",
                                        padding: 14,
                                        borderRadius: 10,
                                        color: "#6b7280",
                                        marginBottom: 12,
                                    }}
                                >
                                    No hay miembros asignados. Usa la búsqueda para agregarlos.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                                        gap: 10,
                                        marginBottom: 12,
                                    }}
                                >
                                    {miembros.map((id) => {
                                        const emp = empleadosOrdenados.find((e) => Number(empId(e)) === Number(id));
                                        return (
                                            <div
                                                key={id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 12px",
                                                    borderRadius: 10,
                                                    border: "1px solid #e5e7eb",
                                                    background: "#f9fafb",
                                                }}
                                            >
                                                <span style={{ fontWeight: 600 }}>
                                                    {emp ? displayName(emp) : `Empleado #${id}`}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => quitarMiembro(id)}
                                                    disabled={loadingMiembros}
                                                    style={{
                                                        border: "none",
                                                        background: "#ef4444",
                                                        color: "#fff",
                                                        borderRadius: 8,
                                                        padding: "6px 10px",
                                                        cursor: loadingMiembros ? "not-allowed" : "pointer",
                                                    }}
                                                    title="Quitar"
                                                >
                                                    <X size={16} color="#fff" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Agregar nuevos */}
                            <label style={{ display: "block", marginBottom: 6 }}>
                                Agregar miembros (máx. {maxAcompanantes})
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre para agregar..."
                                value={qMiembro}
                                onChange={(e) => setQMiembro(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    marginBottom: 8,
                                }}
                            />

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                                    gap: 8,
                                    maxHeight: 220,
                                    overflow: "auto",
                                    border: "1px solid #f3f4f6",
                                    borderRadius: 10,
                                    padding: 8,
                                    background: "#fff",
                                }}
                            >
                                {opcionesMiembro.length === 0 ? (
                                    <div style={{ color: "#6b7280", padding: 8 }}>
                                        No hay resultados o ya están agregados.
                                    </div>
                                ) : (
                                    opcionesMiembro.map((emp) => (
                                        <button
                                            key={empId(emp)}
                                            type="button"
                                            disabled={miembros.length >= maxAcompanantes || loadingMiembros}
                                            onClick={() => agregarMiembro(empId(emp))}
                                            style={{
                                                textAlign: "left",
                                                padding: 10,
                                                borderRadius: 8,
                                                border: "1px solid #e5e7eb",
                                                background: "#fafafa",
                                                cursor:
                                                    miembros.length >= maxAcompanantes || loadingMiembros
                                                        ? "not-allowed"
                                                        : "pointer",
                                            }}
                                            title="Agregar"
                                        >
                                            {displayName(emp)}
                                        </button>
                                    ))
                                )}
                            </div>
                            <small style={{ color: "#6b7280" }}>
                                El coordinador no puede ser miembro. No se permiten duplicados.
                            </small>
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                        <button
                            type="button"
                            onClick={onClose}
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
                            disabled={loadingMiembros}
                            style={{
                                background: "#219ebc",
                                color: "#fff",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: 8,
                                cursor: loadingMiembros ? "not-allowed" : "pointer",
                                fontWeight: 600,
                            }}
                        >
                            {editingId ? "Actualizar" : "Asignar"}
                        </button>
                    </div>
                </form>

                <button
                    onClick={onClose}
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

export default EquipoForm;
