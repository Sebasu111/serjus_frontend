// pages/LoginPage.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import SEO from "../components/seo";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { showToast } from "../utils/toast.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
    const history = useHistory();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleLogin = async e => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/login/", {
                nombreusuario: username,
                contrasena: password
            });

            if (!res.data.success) {
                showToast("Usuario y/o contraseña inválidos", "error");
                return;
            }

            const usuario = res.data.usuario;
            localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
            sessionStorage.setItem("idUsuario", usuario.idusuario);

            showToast("Inicio de sesión exitoso", "success");
            history.push("/home");
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            showToast("Error al iniciar sesión. Intenta más tarde", "error");
        }
    };

    return (
        <>
            <SEO title=" Login" />
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    .login-container {
                        animation: fadeIn 0.8s ease-out;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "linear-gradient(135deg, #1b488f 0%, #1e40af 50%, #1d4ed8 100%)",
                    padding: "20px",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Elementos decorativos del fondo */}
                <div
                    style={{
                        position: "absolute",
                        top: "-50%",
                        left: "-50%",
                        width: "200%",
                        height: "200%",
                        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                        animation: "float 6s ease-in-out infinite"
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        right: "10%",
                        width: "120px",
                        height: "120px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: "50%",
                        animation: "float 4s ease-in-out infinite reverse"
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "20%",
                        left: "15%",
                        width: "80px",
                        height: "80px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                        animation: "float 5s ease-in-out infinite"
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "60%",
                        right: "70%",
                        width: "40px",
                        height: "40px",
                        background: "rgba(30, 64, 175, 0.3)",
                        borderRadius: "50%",
                        animation: "float 7s ease-in-out infinite"
                    }}
                />
                <div
                    className="login-container"
                    style={{
                        width: "100%",
                        maxWidth: "420px",
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        padding: "40px",
                        borderRadius: "20px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        textAlign: "center",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        position: "relative",
                        zIndex: 10
                    }}
                >
                    <img src="/img/logo.png" alt="Hope Logo" style={{ width: "150px", marginBottom: "30px" }} />
                    <h2 style={{ marginBottom: "30px" }}>Iniciar Sesión</h2>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: "20px" }}>
                            <label
                                htmlFor="username"
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontWeight: "600"
                                }}
                            >
                                Usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 15px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    fontSize: "16px",
                                    transition: "border-color 0.3s ease, box-shadow 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#1b488f";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(27, 72, 143, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#ccc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "30px", position: "relative" }}>
                            <label
                                htmlFor="password"
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontWeight: "600"
                                }}
                            >
                                Contraseña
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px 45px 12px 15px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    fontSize: "16px",
                                    transition: "border-color 0.3s ease, box-shadow 0.3s ease"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#1b488f";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(27, 72, 143, 0.1)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#ccc";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "38px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "20px",
                                    color: "#666"
                                }}
                            >
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "14px 0",
                                background: "linear-gradient(135deg, #1b488f 0%, #1e40af 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 15px rgba(27, 72, 143, 0.4)"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 6px 20px rgba(27, 72, 143, 0.6)";
                                e.target.style.background = "linear-gradient(135deg, #163a70 0%, #1d4ed8 100%)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 4px 15px rgba(27, 72, 143, 0.4)";
                                e.target.style.background = "linear-gradient(135deg, #1b488f 0%, #1e40af 100%)";
                            }}
                        >
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
            {/*   Contenedor global de toasts */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </>
    );
};

export default LoginPage;
