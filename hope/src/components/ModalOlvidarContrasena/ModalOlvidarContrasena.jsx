// components/ModalOlvidarContrasena/ModalOlvidarContrasena.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API_EMPLEADOS = "http://127.0.0.1:8000/api/empleados/";
const API_USUARIOS = "http://127.0.0.1:8000/api/usuarios/";

const ModalOlvidarContrasena = ({ onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [dpi, setDpi] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [usuarioValido, setUsuarioValido] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar usuarios y empleados
  useEffect(() => {
    obtenerUsuarios();
    obtenerEmpleados();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(API_USUARIOS);
      setUsuarios(res.data.results || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const obtenerEmpleados = async () => {
    try {
      const res = await axios.get(API_EMPLEADOS);
      setEmpleados(res.data.results || []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  // Validar usuario y DPI
  const validarDatos = () => {
    const usuario = usuarios.find(
      (u) => u.nombreusuario.toLowerCase() === nombreUsuario.toLowerCase()
    );

    if (!usuario) {
      showToast("Usuario no encontrado", "error");
      setUsuarioValido(null);
      return;
    }

    const empleado = empleados.find(
      (e) => e.idempleado === usuario.idempleado && e.dpi === dpi
    );

    if (!empleado) {
      showToast("El DPI no coincide con el usuario", "error");
      setUsuarioValido(null);
      return;
    }

    showToast("Datos verificados correctamente", "success");
    setUsuarioValido(usuario);
  };

  // Cambiar contraseña
  const cambiarContrasena = async () => {
    if (!usuarioValido) {
      showToast("Primero debes validar los datos", "error");
      return;
    }

    if (!nuevaContrasena || !confirmarContrasena) {
      showToast("Debes ingresar la nueva contraseña en ambos campos", "error");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      showToast("Las contraseñas no coinciden", "error");
      return;
    }

    try {
      setLoading(true);
      const ahora = new Date().toISOString();

      const payload = {
        nombreusuario: usuarioValido.nombreusuario,
        contrasena: nuevaContrasena,
        estado: usuarioValido.estado,
        createdat: usuarioValido.createdat,
        updatedat: ahora,
        idrol: usuarioValido.idrol,
        idempleado: usuarioValido.idempleado,
      };

      await axios.put(`${API_USUARIOS}${usuarioValido.idusuario}/`, payload);
      showToast("Contraseña actualizada correctamente", "success");
      onClose();
    } catch (error) {
      console.error("Error al cambiar contraseña:", error.response?.data || error);
      showToast("Error al cambiar la contraseña", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "400px",
        }}
      >
        <h3 style={{ marginBottom: "15px", color: "#333" }}>
          Recuperar Contraseña
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="DPI del empleado"
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={validarDatos}
            style={{
              background: "#219ebc",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Validar datos
          </button>

          {usuarioValido && (
            <>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={cambiarContrasena}
                disabled={loading}
                style={{
                  background: "#FED7AA",
                  color: "#fff",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </>
          )}

          <button
            onClick={onClose}
            style={{
              marginTop: "10px",
              background: "#6c757d",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOlvidarContrasena;
