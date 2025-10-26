// pages/LoginPage.js
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import SEO from "../components/seo";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { showToast } from "../utils/toast.js";

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
            <SEO title="Login - SERJUS" />
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                    
                    @keyframes floatIn {
                        from { 
                            opacity: 0; 
                            transform: translateY(30px) scale(0.95); 
                        }
                        to { 
                            opacity: 1; 
                            transform: translateY(0) scale(1); 
                        }
                    }
                    
                    @keyframes shimmer {
                        0% { background-position: -200% center; }
                        100% { background-position: 200% center; }
                    }
                    
                    .login-container {
                        animation: floatIn 1s ease-out;
                    }
                    
                    .login-form {
                        backdrop-filter: blur(20px);
                        background: rgba(255, 255, 255, 0.96);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        box-shadow: 0 25px 50px rgba(11, 52, 123, 0.25);
                    }
                    
                    .login-bg {
                        background: linear-gradient(rgba(11, 52, 123, 0.85), rgba(22, 105, 193, 0.85)), url('/img/login-meeting.jpg');
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                    }
                    
                    .logo-container {
                        position: relative;
                        display: inline-block;
                    }
                    
                    .logo-container::before {
                        content: '';
                        position: absolute;
                        top: -10px;
                        left: -10px;
                        right: -10px;
                        bottom: -10px;
                        background: linear-gradient(45deg, #0b347b, #1669c1, #1a73e8);
                        background-size: 200% 200%;
                        animation: shimmer 3s linear infinite;
                        border-radius: 50%;
                        z-index: -1;
                        opacity: 0.4;
                    }
                    
                    @media (max-width: 768px) {
                        .login-form {
                            margin: 20px !important;
                            padding: 30px !important;
                        }
                        .login-bg {
                            background-attachment: scroll;
                        }
                    }
                `}
            </style>
            <div
                className="login-container login-bg"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    padding: "20px",
                    fontFamily: "'Inter', sans-serif",
                    position: "relative",
                    overflow: "hidden"
                }}
            >
                {/* Elementos decorativos flotantes */}
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "10%",
                        width: "100px",
                        height: "100px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        backdropFilter: "blur(10px)",
                        animation: "floatIn 2s ease-out 0.5s both"
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "20%",
                        right: "15%",
                        width: "60px",
                        height: "60px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "50%",
                        backdropFilter: "blur(10px)",
                        animation: "floatIn 2s ease-out 0.8s both"
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "15%",
                        left: "20%",
                        width: "80px",
                        height: "80px",
                        background: "rgba(255, 255, 255, 0.06)",
                        borderRadius: "50%",
                        backdropFilter: "blur(10px)",
                        animation: "floatIn 2s ease-out 1s both"
                    }}
                />

                {/* Formulario de login principal */}
                <div
                    className="login-form"
                    style={{
                        width: "100%",
                        maxWidth: "420px",
                        padding: "50px 40px",
                        borderRadius: "25px",
                        textAlign: "center",
                        position: "relative",
                        zIndex: 10
                    }}
                >
                    {/* Logo con efecto brillante */}
                    <div className="logo-container" style={{ marginBottom: "30px" }}>
                        <img
                            src="/img/logo.png"
                            alt="SERJUS Logo"
                            style={{
                                width: "140px",
                                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                                transition: "transform 0.3s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "scale(1)";
                            }}
                        />
                    </div>

                    {/* Título elegante */}
                    <div style={{ marginBottom: "40px" }}>
                        <h1 style={{
                            fontSize: "2.2rem",
                            fontWeight: "700",
                            background: "linear-gradient(135deg, #0b347b, #1669c1)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "8px",
                            letterSpacing: "-0.5px"
                        }}>
                            ¡Bienvenido!
                        </h1>
                        <p style={{
                            color: "#475569",
                            fontSize: "1rem",
                            fontWeight: "400"
                        }}>
                            Inicia sesión para acceder a tu cuenta
                        </p>
                    </div>

                    {/* Formulario estilizado */}
                    <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
                        <div style={{ marginBottom: "25px" }}>
                            <label
                                htmlFor="username"
                                style={{
                                    display: "block",
                                    marginBottom: "10px",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.95rem"
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
                                placeholder="Ingresa tu usuario"
                                style={{
                                    width: "100%",
                                    padding: "16px 20px",
                                    borderRadius: "15px",
                                    border: "2px solid #e2e8f0",
                                    fontSize: "16px",
                                    transition: "all 0.4s ease",
                                    backgroundColor: "#f8fafc",
                                    boxSizing: "border-box",
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#1a73e8";
                                    e.target.style.backgroundColor = "#ffffff";
                                    e.target.style.boxShadow = "0 0 0 6px rgba(26, 115, 232, 0.1)";
                                    e.target.style.transform = "translateY(-2px)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e2e8f0";
                                    e.target.style.backgroundColor = "#f8fafc";
                                    e.target.style.boxShadow = "none";
                                    e.target.style.transform = "translateY(0)";
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "35px", position: "relative" }}>
                            <label
                                htmlFor="password"
                                style={{
                                    display: "block",
                                    marginBottom: "10px",
                                    fontWeight: "600",
                                    color: "#374151",
                                    fontSize: "0.95rem"
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
                                placeholder="Ingresa tu contraseña"
                                style={{
                                    width: "100%",
                                    padding: "16px 55px 16px 20px",
                                    borderRadius: "15px",
                                    border: "2px solid #e2e8f0",
                                    fontSize: "16px",
                                    transition: "all 0.4s ease",
                                    backgroundColor: "#f8fafc",
                                    boxSizing: "border-box",
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#1a73e8";
                                    e.target.style.backgroundColor = "#ffffff";
                                    e.target.style.boxShadow = "0 0 0 6px rgba(26, 115, 232, 0.1)";
                                    e.target.style.transform = "translateY(-2px)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#e2e8f0";
                                    e.target.style.backgroundColor = "#f8fafc";
                                    e.target.style.boxShadow = "none";
                                    e.target.style.transform = "translateY(0)";
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "18px",
                                    top: "48px",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "22px",
                                    color: "#64748b",
                                    transition: "all 0.3s ease",
                                    padding: "5px"
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = "#1a73e8";
                                    e.target.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = "#64748b";
                                    e.target.style.transform = "scale(1)";
                                }}
                            >
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>

                        {/* Botón con gradiente animado */}
                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "18px 0",
                                background: "linear-gradient(135deg, #0b347b 0%, #1669c1 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "15px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.4s ease",
                                boxShadow: "0 8px 25px rgba(26, 115, 232, 0.4)",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                fontFamily: "'Inter', sans-serif",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 15px 35px rgba(26, 115, 232, 0.6)";
                                e.target.style.background = "linear-gradient(135deg, #1a73e8 0%, #0b347b 100%)";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 8px 25px rgba(26, 115, 232, 0.4)";
                                e.target.style.background = "linear-gradient(135deg, #0b347b 0%, #1669c1 100%)";
                            }}
                        >
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
