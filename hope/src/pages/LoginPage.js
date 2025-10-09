// pages/LoginPage.js 
import React, { useState } from "react";
import { useHistory } from "react-router-dom"; 
import SEO from "../components/seo";
import axios from "axios";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // 👈 Solo react-icons

const LoginPage = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", {
        nombreusuario: username,
        contrasena: password,
      });

      if (!res.data.success) {
        setMensaje("Usuario y/o contraseña inválidos"); // 👈 unificado
        return;
      }

      const usuario = res.data.usuario;
      localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
      sessionStorage.setItem("idUsuario", usuario.idusuario);

      setMensaje("");
      history.push("/home"); 
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Error al iniciar sesión. Intenta más tarde");
    }
  };

  return (
    <>
      <SEO title="Hope – Login" />
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
        padding: "20px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}>
          <img src="/img/logo.png" alt="Hope Logo" style={{ width: "150px", marginBottom: "30px" }} />
          <h2 style={{ marginBottom: "30px" }}>Iniciar Sesión</h2>

          {mensaje && <p style={{ textAlign: "center", color: "red", fontWeight: "bold", marginBottom: "20px" }}>{mensaje}</p>}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="username" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              />
            </div>

            <div style={{ marginBottom: "30px", position: "relative" }}>
              <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", padding: "12px 45px 12px 15px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "16px" }}
              />
              {/* 👇 Botón de ver/ocultar con react-icons */}
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

            <button type="submit" style={{ width: "100%", padding: "12px 0", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
