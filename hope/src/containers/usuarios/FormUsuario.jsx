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
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "350px",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "2px 0 15px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column"
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                {editingUsuario ? "Editar Usuario" : "Registrar Usuario"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                {/* Nombre de usuario */}
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="nombreusuario" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre de usuario
                    </label>
                    <input
                        id="nombreusuario"
                        type="text"
                        value={form.nombreusuario}
                        onChange={e => setForm(f => ({ ...f, nombreusuario: e.target.value }))}
                        required
                        disabled={!!editingUsuario}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: editingUsuario ? "#f0f0f0" : "#fff",
                            cursor: editingUsuario ? "not-allowed" : "text"
                        }}
                    />
                </div>

                {/* Contraseña */}
                <div style={{ marginBottom: "15px", position: "relative" }}>
                    <label htmlFor="contrasena" style={{ display: "block", marginBottom: "8px" }}>
                        Contraseña
                    </label>

                    {editingUsuario ? (
                        <>
                            {!cambiarContrasena ? (
                                <button
                                    type="button"
                                    onClick={() => setCambiarContrasena(true)}
                                    style={{
                                        padding: "8px 12px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        marginBottom: "10px"
                                    }}
                                >
                                    Cambiar contraseña
                                </button>
                            ) : (
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="contrasena"
                                        type={mostrarContrasena ? "text" : "password"}
                                        value={form.contrasena}
                                        onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                                        placeholder="Ingrese nueva contraseña"
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
                            )}
                        </>
                    ) : (
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
                    )}
                </div>

                {/* Rol */}
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="rol" style={{ display: "block", marginBottom: "8px" }}>
                        Rol
                    </label>
                    <select
                        id="rol"
                        value={form.idrol}
                        onChange={e => setForm(f => ({ ...f, idrol: e.target.value }))}
                        required
                        disabled={!!editingUsuario}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: editingUsuario ? "#f0f0f0" : "#fff",
                            cursor: editingUsuario ? "not-allowed" : "pointer"
                        }}
                    >
                        <option value="">Seleccione un rol</option>
                        {roles.map(r => (
                            <option key={r.idrol} value={r.idrol}>
                                {r.nombrerol}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Empleado */}
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="empleado" style={{ display: "block", marginBottom: "8px" }}>
                        Empleado
                    </label>
                    <input
                        type="text"
                        placeholder="Escriba nombre del empleado..."
                        value={busquedaEmpleado}
                        onChange={e => {
                            if (!editingUsuario) {
                                setBusquedaEmpleado(e.target.value);
                                setForm(f => ({ ...f, idempleado: "" }));
                            }
                        }}
                        disabled={!!editingUsuario}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: editingUsuario ? "#f0f0f0" : "#fff",
                            cursor: editingUsuario ? "not-allowed" : "text"
                        }}
                    />
                    {!editingUsuario && (
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                maxHeight: "90px",
                                overflowY: "auto",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                        >
                            {empleados
                                .filter(
                                    emp =>
                                        !usuarios.some(
                                            u =>
                                                u.idempleado === emp.idempleado &&
                                                (!editingUsuario || u.idusuario !== editingUsuario.idusuario)
                                        )
                                )
                                .filter(emp =>
                                    `${emp.nombre} ${emp.apellido}`
                                        .toLowerCase()
                                        .includes(busquedaEmpleado.toLowerCase())
                                )
                                .map(emp => (
                                    <li
                                        key={emp.idempleado}
                                        onClick={() => {
                                            setForm(f => ({ ...f, idempleado: emp.idempleado }));
                                            setBusquedaEmpleado(`${emp.nombre} ${emp.apellido}`);
                                        }}
                                        style={{
                                            padding: "8px 10px",
                                            cursor: "pointer",
                                            background: form.idempleado === emp.idempleado ? "#f0f0f0" : "#fff"
                                        }}
                                    >
                                        {emp.nombre} {emp.apellido}
                                    </li>
                                ))}
                        </ul>
                    )}
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
                        cursor: "pointer"
                    }}
                >
                    {editingUsuario ? "Actualizar" : "Guardar"}
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
