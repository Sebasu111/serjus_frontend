import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { showToast } from "../../utils/toast";

const API_URL = process.env.REACT_APP_API_URL;

const CambiarContrasenaModal = ({ onClose }) => {
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mostrarActual, setMostrarActual] = useState(false);
    const [mostrarNueva, setMostrarNueva] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!contrasenaActual.trim()) {
            showToast("Debe ingresar su contraseña actual", "error");
            return;
        }

        if (!contrasenaNueva.trim()) {
            showToast("Debe ingresar una nueva contraseña", "error");
            return;
        }

        if (contrasenaNueva.length < 6) {
            showToast("La nueva contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        if (contrasenaNueva !== confirmarContrasena) {
            showToast("Las contraseñas no coinciden", "error");
            return;
        }

        if (contrasenaActual === contrasenaNueva) {
            showToast("La nueva contraseña debe ser diferente a la actual", "error");
            return;
        }

        setEnviando(true);

        try {
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioLogueado"));
            const idUsuario = usuarioGuardado?.idusuario;

            if (!idUsuario) {
                showToast("Error: no se encontró el usuario logueado", "error");
                return;
            }

            // Payload simplificado - solo enviamos la nueva contraseña
            const payload = {
                nombreusuario: usuarioGuardado.nombreusuario,
                contrasena: contrasenaNueva,        // nueva contraseña
                estado: usuarioGuardado.estado,
                createdat: usuarioGuardado.createdat,
                updatedat: new Date().toISOString(), // actualizar fecha
                idrol: usuarioGuardado.idrol,
                idempleado: usuarioGuardado.idempleado
            };

            const response = await fetch(`${API_URL}/usuarios/${idUsuario}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast("Contraseña actualizada correctamente", "success");
                onClose();
            } else {
                const error = await response.json();
                const errorMsg = error.detail || error.message || "Error al actualizar la contraseña";
                showToast(errorMsg, "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Error de conexión con el servidor", "error");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "450px",
                    position: "relative",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "20px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px"
                    }}
                    title="Cerrar"
                >
                    <X size={24} color="#666" />
                </button>

                <h3 style={{
                    textAlign: "center",
                    marginBottom: "25px",
                    color: "#333",
                    fontSize: "1.5rem"
                }}>
                    Cambiar Contraseña
                </h3>

                <form onSubmit={handleSubmit}>
                    {/* Contraseña Actual */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#333"
                        }}>
                            Contraseña Actual <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={mostrarActual ? "text" : "password"}
                                value={contrasenaActual}
                                onChange={(e) => setContrasenaActual(e.target.value)}
                                placeholder="Ingrese su contraseña actual"
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 45px 12px 15px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    fontSize: "16px",
                                    boxSizing: "border-box",
                                    outline: "none",
                                    transition: "border-color 0.3s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#ccc"}
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarActual(!mostrarActual)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                {mostrarActual ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Nueva Contraseña */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#333"
                        }}>
                            Nueva Contraseña <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={mostrarNueva ? "text" : "password"}
                                value={contrasenaNueva}
                                onChange={(e) => setContrasenaNueva(e.target.value)}
                                placeholder="Ingrese la nueva contraseña (mín. 6 caracteres)"
                                required
                                minLength={6}
                                style={{
                                    width: "100%",
                                    padding: "12px 45px 12px 15px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    fontSize: "16px",
                                    boxSizing: "border-box",
                                    outline: "none",
                                    transition: "border-color 0.3s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor = "#ccc"}
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarNueva(!mostrarNueva)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                {mostrarNueva ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div style={{ marginBottom: "30px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                            color: "#333"
                        }}>
                            Confirmar Nueva Contraseña <span style={{ color: "red" }}>*</span>
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={mostrarConfirmar ? "text" : "password"}
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="Confirme la nueva contraseña"
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 45px 12px 15px",
                                    border: `1px solid ${confirmarContrasena && contrasenaNueva && confirmarContrasena !== contrasenaNueva
                                            ? "#ff4444"
                                            : "#ccc"
                                        }`,
                                    borderRadius: "6px",
                                    fontSize: "16px",
                                    boxSizing: "border-box",
                                    outline: "none",
                                    transition: "border-color 0.3s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a73e8"}
                                onBlur={(e) => e.target.style.borderColor =
                                    confirmarContrasena && contrasenaNueva && confirmarContrasena !== contrasenaNueva
                                        ? "#ff4444"
                                        : "#ccc"
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#666"
                                }}
                            >
                                {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {confirmarContrasena && contrasenaNueva && confirmarContrasena !== contrasenaNueva && (
                            <small style={{ color: "#ff4444", fontSize: "14px", marginTop: "5px", display: "block" }}>
                                Las contraseñas no coinciden
                            </small>
                        )}
                    </div>

                    {/* Botones */}
                    <div style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "flex-end"
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "12px 24px",
                                background: "#6b7280",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "16px",
                                transition: "background 0.3s"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#4b5563"}
                            onMouseLeave={(e) => e.target.style.background = "#6b7280"}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={enviando}
                            style={{
                                padding: "12px 24px",
                                background: enviando ? "#9ca3af" : "#219ebc",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: enviando ? "not-allowed" : "pointer",
                                fontSize: "16px",
                                fontWeight: "600",
                                transition: "background 0.3s"
                            }}
                            onMouseEnter={(e) => {
                                if (!enviando) e.target.style.background = "#1a7a96"
                            }}
                            onMouseLeave={(e) => {
                                if (!enviando) e.target.style.background = "#219ebc"
                            }}
                        >
                            {enviando ? "Actualizando..." : "Cambiar Contraseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CambiarContrasenaModal;