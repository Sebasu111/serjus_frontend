// containers/usuarios/UsuariosContainer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../utils/toast.js";

import FormUsuario from "../../containers/usuarios/FormUsuario";
import TableUsuarios from "../../containers/usuarios/TableUsuarios";
import ModalConfirmacion from "../../containers/usuarios/ModalConfirmacion";

const API = "http://127.0.0.1:8000/api/usuarios/";
const API_ROLES = "http://127.0.0.1:8000/api/roles/";
const API_EMPLEADOS = "http://127.0.0.1:8000/api/empleados/";

const UsuariosContainer = () => {
  const [form, setForm] = useState({
    nombreusuario: "",
    contrasena: "",
    estado: true,
    idrol: "",
    idempleado: "",
  });
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cambiarContrasena, setCambiarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(5);

  const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

  // --- Fetch inicial de datos ---
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
    fetchEmpleados();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await axios.get(API);
      setUsuarios(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      showToast("Error al cargar los usuarios", "error");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(API_ROLES);
      setRoles(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (error) {
      console.error("Error al cargar roles:", error);
      showToast("Error al cargar roles", "error");
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(API_EMPLEADOS);
      setEmpleados(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
      showToast("Error al cargar empleados", "error");
    }
  };

  // --- Crear / actualizar usuario ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const empleadoYaAsignado = usuarios.some(
      (u) =>
        u.idempleado === Number(form.idempleado) &&
        (!editingUsuario || u.idusuario !== editingUsuario.idusuario)
    );
    if (empleadoYaAsignado) {
      showToast("Este empleado ya tiene un usuario asignado", "error");
      return;
    }

    try {
      const ahora = new Date().toISOString();

      if (!form.nombreusuario) {
        showToast("El nombre de usuario es obligatorio", "error");
        return;
      }
      if (!editingUsuario && !form.contrasena) {
        showToast("La contraseña es obligatoria al crear un usuario", "error");
        return;
      }
      if (!form.idrol) {
        showToast("Debe seleccionar un rol", "error");
        return;
      }
      if (!form.idempleado) {
        showToast("Debe seleccionar un empleado", "error");
        return;
      }

      const payload = {
        nombreusuario: form.nombreusuario,
        estado: form.estado,
        createdat: editingUsuario ? editingUsuario.createdat : ahora,
        updatedat: ahora,
        idrol: Number(form.idrol),
        idempleado: Number(form.idempleado),
      };

      if (form.contrasena && (!editingUsuario || cambiarContrasena)) {
        payload.contrasena = form.contrasena;
      }

      if (editingUsuario) {
        if (editingUsuario.idusuario === idUsuarioLogueado) {
          showToast("No puedes editar tu propio usuario desde aquí", "error");
          return;
        }
        await axios.put(`${API}${editingUsuario.idusuario}/`, payload);
        showToast("Usuario actualizado correctamente", "success");
      } else {
        await axios.post(API, payload);
        showToast("Usuario registrado correctamente", "success");
      }

      setForm({ nombreusuario: "", contrasena: "", estado: true, idrol: "", idempleado: "" });
      setCambiarContrasena(false);
      setEditingUsuario(null);
      setMostrarFormulario(false);
      fetchUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario:", error.response?.data || error);
      showToast("Error al registrar/actualizar usuario", "error");
    }
  };

  // --- Editar usuario ---
  const handleEdit = (usuario) => {
    if (!usuario.estado) {
      showToast("No se puede editar un usuario inactivo", "error");
      return;
    }
    if (usuario.idusuario === idUsuarioLogueado) {
      showToast("No puedes editar tu propio usuario desde aquí", "error");
      return;
    }
    setForm({
      nombreusuario: usuario.nombreusuario,
      contrasena: "",
      estado: usuario.estado,
      idrol: usuario.idrol,
      idempleado: usuario.idempleado,
    });
    setEditingUsuario(usuario);
    setCambiarContrasena(false);
    setMostrarFormulario(true);
  };

  // --- Desactivar usuario ---
  const handleDelete = (id) => {
    if (id === idUsuarioLogueado) {
      showToast("No puedes desactivar tu propio usuario", "error");
      return;
    }
    const usuario = usuarios.find((u) => u.idusuario === id);
    if (!usuario) return;
    setUsuarioSeleccionado(usuario);
    setMostrarConfirmacion(true);
  };

  const confirmarDesactivacion = async () => {
    try {
      if (!usuarioSeleccionado) return;
      await axios.put(`${API}${usuarioSeleccionado.idusuario}/`, {
        ...usuarioSeleccionado,
        estado: false,
      });
      showToast("Usuario desactivado correctamente", "success");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al desactivar usuario:", error);
      showToast("Error al desactivar el usuario", "error");
    } finally {
      setMostrarConfirmacion(false);
      setUsuarioSeleccionado(null);
    }
  };

  // --- Activar usuario ---
  const handleActivate = async (id) => {
    if (id === idUsuarioLogueado) {
      showToast("No puedes activar/desactivar tu propio usuario", "error");
      return;
    }
    try {
      const usuario = usuarios.find((u) => u.idusuario === id);
      if (!usuario) return;
      await axios.put(`${API}${id}/`, { ...usuario, estado: true });
      showToast("Usuario activado correctamente", "success");
      fetchUsuarios();
    } catch (error) {
      console.error("Error al activar usuario:", error);
      showToast("Error al activar el usuario", "error");
    }
  };

  // --- Filtrado y paginación ---
  const usuariosFiltrados = usuarios.filter((u) => {
    const textoBusqueda = busqueda.toLowerCase().trim();
    const nombreCoincide = u.nombreusuario.toLowerCase().includes(textoBusqueda);
    const estadoTexto = u.estado ? "activo" : "inactivo";
    const estadoCoincide = estadoTexto.startsWith(textoBusqueda);
    return nombreCoincide || estadoCoincide;
  });

  const indexOfLast = paginaActual * elementosPorPagina;
  const indexOfFirst = indexOfLast - elementosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indexOfFirst, indexOfLast);
  const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina);

  return (
    <Layout>
      <SEO title="Usuarios" />
      <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ padding: "40px 20px", background: "#f0f2f5", justifyContent: "center" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", paddingLeft: "250px" }}>
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Usuarios Registrados</h2>

            {/* Buscador y botón nuevo usuario */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginRight: "10px" }}
              />
              <button
                onClick={() => setMostrarFormulario(true)}
                style={{ padding: "10px 20px", background: "#219ebc", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", whiteSpace: "nowrap" }}
              >
                Nuevo Usuario
              </button>
            </div>

            {/* Tabla de usuarios */}
            <TableUsuarios
              usuariosPaginados={usuariosPaginados}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleActivate={handleActivate}
              idUsuarioLogueado={idUsuarioLogueado}
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              setPaginaActual={setPaginaActual}
            />

            {/* Limite */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
              <input
                type="number"
                min="1"
                value={elementosPorPagina}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  const numero = val === "" ? "" : Number(val);
                  setElementosPorPagina(numero > 0 ? numero : 1);
                  setPaginaActual(1);
                }}
                onFocus={(e) => e.target.select()}
                style={{ width: "80px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", textAlign: "center" }}
              />
            </div>
          </div>
        </main>

        {/* Formulario modal */}
        {mostrarFormulario && (
          <FormUsuario
            form={form}
            setForm={setForm}
            roles={roles}
            empleados={empleados}
            usuarios={usuarios}
            editingUsuario={editingUsuario}
            cambiarContrasena={cambiarContrasena}
            setCambiarContrasena={setCambiarContrasena}
            mostrarContrasena={mostrarContrasena}
            setMostrarContrasena={setMostrarContrasena}
            busquedaEmpleado={busquedaEmpleado}
            setBusquedaEmpleado={setBusquedaEmpleado}
            handleSubmit={handleSubmit}
            setMostrarFormulario={setMostrarFormulario}
          />
        )}

        {/* Modal confirmación */}
        <ModalConfirmacion
          mostrarConfirmacion={mostrarConfirmacion}
          setMostrarConfirmacion={setMostrarConfirmacion}
          usuarioSeleccionado={usuarioSeleccionado}
          confirmarDesactivacion={confirmarDesactivacion}
        />

        <ToastContainer />
        <Footer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default UsuariosContainer;
