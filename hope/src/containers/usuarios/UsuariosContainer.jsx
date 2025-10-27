// containers/usuarios/UsuariosContainer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";

import FormUsuario from "../../containers/usuarios/FormUsuario";
import TableUsuarios from "../../containers/usuarios/TableUsuarios";
import ModalConfirmacion from "../../containers/usuarios/ModalConfirmacion";
import { buttonStyles } from "../../stylesGenerales/buttons.js";

const API = "http://127.0.0.1:8000/api/usuarios/";
const API_ROLES = "http://127.0.0.1:8000/api/roles/";
const API_EMPLEADOS = "http://127.0.0.1:8000/api/empleados/";

const UsuariosContainer = () => {
    const [form, setForm] = useState({
        nombreusuario: "",
        contrasena: "",
        estado: true,
        idrol: "",
        idempleado: ""
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

    // --- Cambiar contraseña de usuario ---
    const handleSubmit = async e => {
        e.preventDefault();

        if (!editingUsuario) {
            showToast("Error: No se puede crear usuarios desde aquí", "error");
            return;
        }

        if (!form.contrasena) {
            showToast("La nueva contraseña es obligatoria", "error");
            return;
        }

        if (form.contrasena.length < 4) {
            showToast("La contraseña debe tener al menos 4 caracteres", "error");
            return;
        }

        try {
            const ahora = new Date().toISOString();

            const payload = {
                nombreusuario: editingUsuario.nombreusuario,
                estado: editingUsuario.estado,
                createdat: editingUsuario.createdat,
                updatedat: ahora,
                idrol: editingUsuario.idrol,
                idempleado: editingUsuario.idempleado,
                contrasena: form.contrasena
            };

            await axios.put(`${API}${editingUsuario.idusuario}/`, payload);
            showToast("Contraseña actualizada correctamente", "success");

            setForm({ nombreusuario: "", contrasena: "", estado: true, idrol: "", idempleado: "" });
            setCambiarContrasena(false);
            setEditingUsuario(null);
            setMostrarFormulario(false);
            fetchUsuarios();
        } catch (error) {
            console.error("Error al cambiar contraseña:", error.response?.data || error);
            showToast("Error al cambiar la contraseña", "error");
        }
    };

    // --- Editar usuario (solo cambiar contraseña) ---
    const handleEdit = usuario => {
        if (!usuario.estado) {
            showToast("No se puede cambiar la contraseña de un usuario desactivado", "error");
            return;
        }

        setForm({
            nombreusuario: usuario.nombreusuario,
            contrasena: "",
            estado: usuario.estado,
            idrol: usuario.idrol,
            idempleado: usuario.idempleado
        });
        setEditingUsuario(usuario);
        setCambiarContrasena(true); // Siempre cambiar contraseña en modo edición
        setMostrarFormulario(true);
    };

    // --- Desactivar usuario ---
    const handleDelete = id => {
        if (id === idUsuarioLogueado) {
            showToast("No puedes desactivar tu propio usuario", "error");
            return;
        }
        const usuario = usuarios.find(u => u.idusuario === id);
        if (!usuario) return;
        setUsuarioSeleccionado(usuario);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacion = async () => {
        try {
            if (!usuarioSeleccionado) return;
            await axios.put(`${API}${usuarioSeleccionado.idusuario}/`, {
                ...usuarioSeleccionado,
                estado: false
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
    const handleActivate = async id => {
        if (id === idUsuarioLogueado) {
            showToast("No puedes activar/desactivar tu propio usuario", "error");
            return;
        }
        try {
            const usuario = usuarios.find(u => u.idusuario === id);
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
    const usuariosFiltrados = usuarios
        // Ordenar por ID descendente (último agregado primero)
        .sort((a, b) => (b.idusuario || 0) - (a.idusuario || 0))
        .filter(u => {
            const textoBusqueda = busqueda.toLowerCase().trim();
            if (!textoBusqueda) return true;

            // Obtener nombres para búsqueda
            const nombreEmpleado = empleados?.find(emp =>
                (emp.id || emp.idempleado || emp.idEmpleado) === u.idempleado
            );
            const nombreCompletoEmpleado = nombreEmpleado ?
                `${nombreEmpleado.nombre} ${nombreEmpleado.apellido}`.toLowerCase() : '';

            const rol = roles?.find(r => r.idrol === u.idrol);
            const nombreRol = rol ? rol.nombrerol.toLowerCase() : '';

            // Campos a buscar
            const usuario = u.nombreusuario.toLowerCase();
            const estadoTexto = (u.estado ? "activo" : "inactivo").toLowerCase();

            // Para el estado, usar coincidencia exacta si se busca específicamente "activo" o "inactivo"
            const esCoincidenciaEstado = textoBusqueda === "activo" || textoBusqueda === "inactivo"
                ? estadoTexto === textoBusqueda
                : estadoTexto.includes(textoBusqueda);

            return usuario.includes(textoBusqueda) ||
                nombreCompletoEmpleado.includes(textoBusqueda) ||
                nombreRol.includes(textoBusqueda) ||
                esCoincidenciaEstado;
        });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Usuarios" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <div style={{ width: "min(1100px, 96vw)" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Usuarios Registrados</h2>

                            {/* Solo buscador - sin botón nuevo usuario */}
                            <div
                                style={{
                                    marginBottom: "15px"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar usuario..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "2px solid #e5e7eb",
                                        fontSize: "16px",
                                        transition: "border-color 0.2s, box-shadow 0.2s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#219ebc";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(33, 158, 188, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e5e7eb";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
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
                                empleados={empleados}
                                roles={roles}
                            />

                            {/* Limite */}
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: "600" }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        const numero = val === "" ? "" : Number(val);
                                        setElementosPorPagina(numero > 0 ? numero : 1);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={e => e.target.select()}
                                    style={{
                                        width: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

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
            </div>
        </Layout>
    );
};

export default UsuariosContainer;
