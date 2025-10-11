import React from "react";
import { X } from "lucide-react";

const EquipoForm = ({
    equipos = [],
    idEquipo,
    setIdEquipo,
    idCoordinador,
    setIdCoordinador,
    empleados = [],
    editingId,
    handleSubmit,
    onClose,
}) => {
    const empleadoDisplayName = (emp) =>
        emp?.nombreCompleto ||
        [emp?.nombres, emp?.apellidos].filter(Boolean).join(" ") ||
        emp?.nombre ||
        emp?.nombre_empleado ||
        `Empleado #${emp?.idEmpleado || emp?.idempleado || "?"}`;

    const empleadoId = (emp) =>
        emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

    const equipoId = (eq) => eq.id ?? eq.idEquipo ?? eq.pk;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "420px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                {editingId ? "Actualizar Coordinador" : "Asignar Coordinador"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "18px" }}>
                    <label htmlFor="equipo" style={{ display: "block", marginBottom: "8px" }}>
                        Selecciona un equipo
                    </label>
                    <select
                        id="equipo"
                        value={idEquipo ?? ""}
                        onChange={(e) => setIdEquipo(Number(e.target.value))}
                        required
                        disabled={!!editingId} // <-- deshabilitado si estamos editando
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    >
                        <option value="" disabled>
                            Selecciona un equipo...
                        </option>
                        {equipos.map((eq) => (
                            <option key={equipoId(eq)} value={equipoId(eq)}>
                                {eq.nombre ?? eq.nombreEquipo ?? `Equipo #${equipoId(eq)}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: "22px" }}>
                    <label htmlFor="coordinador" style={{ display: "block", marginBottom: "8px" }}>
                        Coordinador (empleado)
                    </label>
                    <select
                        id="coordinador"
                        value={idCoordinador ?? ""}
                        onChange={(e) => setIdCoordinador(Number(e.target.value))}
                        required
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    >
                        <option value="" disabled>
                            Selecciona un empleado...
                        </option>
                        {empleados.map((emp) => (
                            <option key={empleadoId(emp)} value={empleadoId(emp)}>
                                {empleadoDisplayName(emp)}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    {editingId ? "Actualizar" : "Asignar"}
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

export default EquipoForm;
