import React from "react";
import { Eye, EyeOff, X } from "lucide-react";

const FormUsuario = ({
    form,
    setForm,
    roles,
    empleados,
    usuarios,
    editingUsuario,
    cambiarContrasena,
    setCambiarContrasena,
    mostrarContrasena,
    setMostrarContrasena,
    busquedaEmpleado,
    setBusquedaEmpleado,
    handleSubmit,
    setMostrarFormulario
}) => {
    // Función para obtener nombre del colaborador
    const obtenerNombreEmpleado = (idEmpleado) => {
        const empleado = empleados?.find(emp =>
            (emp.id || emp.idempleado || emp.idEmpleado) === idEmpleado
        );
        return empleado ? `${empleado.nombre} ${empleado.apellido}` : "Colaborador no encontrado";
    };

    // Función para obtener nombre del rol
    const obtenerNombreRol = (idRol) => {
        const rol = roles?.find(r => r.idrol === idRol);
        return rol ? rol.nombrerol : "Rol no encontrado";
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "350px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px"
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                Cambiar Contraseña
            </h3>            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                {/* Información del usuario (solo lectura) */}
                <div
                    style={{
                        backgroundColor: "#dbeafe",
                        border: "1px solid #93c5fd",
                        borderRadius: "6px",
                        padding: "15px",
                        marginBottom: "20px"
                    }}
                >
                    <div style={{ marginBottom: "10px" }}>
                        <strong style={{ color: "#1e40af", fontSize: "14px" }}>
                            Nombre de usuario:
                        </strong>
                        <div style={{ color: "#1f2937", fontSize: "16px", marginTop: "2px" }}>
                            {form.nombreusuario}
                        </div>
                    </div>

                    <div style={{ marginBottom: "10px" }}>
                        <strong style={{ color: "#1e40af", fontSize: "14px" }}>
                            Rol:
                        </strong>
                        <div style={{ color: "#1f2937", fontSize: "16px", marginTop: "2px" }}>
                            {obtenerNombreRol(form.idrol)}
                        </div>
                    </div>

                    <div>
                        <strong style={{ color: "#1e40af", fontSize: "14px" }}>
                            Colaborador:
                        </strong>
                        <div style={{ color: "#1f2937", fontSize: "16px", marginTop: "2px" }}>
                            {obtenerNombreEmpleado(form.idempleado)}
                        </div>
                    </div>
                </div>

                {/* Nueva Contraseña */}
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="contrasena" style={{ display: "block", marginBottom: "8px" }}>
                        Nueva Contraseña
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            id="contrasena"
                            type={mostrarContrasena ? "text" : "password"}
                            value={form.contrasena}
                            onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                            required
                            style={{
                                width: "100%",
                                padding: "10px 40px 10px 10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarContrasena(!mostrarContrasena)}
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "none",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Actualizar
                </button>
            </form>

            <button
                onClick={() => setMostrarFormulario(false)}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                }}
                title="Cerrar"
            >
                <X size={24} color="#555" />
            </button>
        </div>
    );
};

export default FormUsuario;
