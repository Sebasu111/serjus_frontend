import React from "react";
import { X } from "lucide-react";

const EquipoForm = ({
    nombreEquipo,
    setNombreEquipo,
    idCoordinador,
    setIdCoordinador,
    empleados,
    equipoActivoEditando,
    editingId,
    handleSubmit,
    onClose,
}) => {
    const handleNombreChange = (e) => {
        // Letras, números, espacios, acentos, punto y guion
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s.-]*$/;
        if (regex.test(e.target.value)) {
            setNombreEquipo(e.target.value);
        }
    };

    const empleadoDisplayName = (emp) =>
        emp?.nombreCompleto ||
        [emp?.nombres, emp?.apellidos].filter(Boolean).join(" ") ||
        emp?.nombre ||
        emp?.nombre_empleado ||
        `Empleado #${emp?.idEmpleado || emp?.idempleado || "?"}`;

    const empleadoId = (emp) =>
        emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

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
                {editingId ? "Editar equipo" : "Registrar equipo"}
            </h3>
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "18px" }}>
                    <label htmlFor="nombreEquipo" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre del equipo
                    </label>
                    <input
                        id="nombreEquipo"
                        type="text"
                        value={nombreEquipo}
                        onChange={handleNombreChange}
                        required
                        disabled={!equipoActivoEditando}
                        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}
                    />
                </div>

                <div style={{ marginBottom: "22px" }}>
                    <label htmlFor="coordinador" style={{ display: "block", marginBottom: "8px" }}>
                        Coordinador (empleado)
                    </label>
                    <select
                        id="coordinador"
                        value={idCoordinador ?? ""}
                        onChange={(e) => setIdCoordinador(Number(e.target.value))}
                        disabled={!equipoActivoEditando}
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
                    disabled={!equipoActivoEditando}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: equipoActivoEditando ? "#219ebc" : "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: equipoActivoEditando ? "pointer" : "not-allowed",
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

export default EquipoForm;
