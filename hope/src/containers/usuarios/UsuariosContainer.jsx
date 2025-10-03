// containers/usuarios/UsuariosContainer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

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
    const [mensaje, setMensaje] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [usuarioActivoEditando, setUsuarioActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Paginación y búsqueda
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    // 🔹 Leer el id del usuario logueado desde sessionStorage
    const idUsuarioLogueado = Number(sessionStorage.getItem("idUsuario"));

    useEffect(() => {
        fetchUsuarios();
        fetchRoles();
        fetchEmpleados();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get(API);
            const data = Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            setUsuarios([]);
            setMensaje("Error al cargar los usuarios");
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get(API_ROLES);
            const data = Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setRoles(data);
        } catch (error) {
            console.error("Error al cargar roles:", error);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(API_EMPLEADOS);
            const data = Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setEmpleados(data);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const ahora = new Date().toISOString();

            // Validaciones
            if (!form.nombreusuario) {
                setMensaje("El nombre de usuario es obligatorio");
                return;
            }
            if (!editingUsuario && !form.contrasena) {
                setMensaje("La contraseña es obligatoria al crear un usuario");
                return;
            }
            if (!form.idrol) {
                setMensaje("Debe seleccionar un rol");
                return;
            }
            if (!form.idempleado) {
                setMensaje("Debe seleccionar un empleado");
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

            // Solo agregar contraseña si se ingresó
            if (form.contrasena) payload.contrasena = form.contrasena;

            if (editingUsuario) {
                // Evitar que se edite el usuario logueado
                if (editingUsuario.idusuario === idUsuarioLogueado) {
                    setMensaje("No puedes editar tu propio usuario desde aquí");
                    return;
                }
                await axios.put(`${API}${editingUsuario.idusuario}/`, payload);
                setMensaje("Usuario actualizado correctamente");
            } else {
                await axios.post(API, payload);
                setMensaje("Usuario registrado correctamente");
            }

            // Reset
            setForm({
                nombreusuario: "",
                contrasena: "",
                estado: true,
                idrol: "",
                idempleado: "",
            });
            setEditingUsuario(null);
            setUsuarioActivoEditando(true);
            setMostrarFormulario(false);
            fetchUsuarios();
        } catch (error) {
            console.error(
                "Error al guardar usuario:",
                error.response?.data || error
            );
            setMensaje("Error al registrar/actualizar usuario");
        }
    };

    const handleEdit = (usuario) => {
        if (!usuario.estado) {
            setMensaje("No se puede editar un usuario inactivo");
            return;
        }
        if (usuario.idusuario === idUsuarioLogueado) {
            setMensaje("No puedes editar tu propio usuario desde aquí");
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
        setUsuarioActivoEditando(usuario.estado);
        setMostrarFormulario(true);
    };

    const handleDelete = async (id) => {
        if (id === idUsuarioLogueado) {
            setMensaje("No puedes desactivar tu propio usuario");
            return;
        }
        if (!window.confirm("¿Estás seguro de desactivar este usuario?"))
            return;
        try {
            const usuario = usuarios.find((u) => u.idusuario === id);
            if (!usuario) return;

            await axios.put(`${API}${id}/`, { ...usuario, estado: false });
            setMensaje("Usuario desactivado correctamente");
            fetchUsuarios();
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            setMensaje("Error al desactivar el usuario");
        }
    };

    const handleActivate = async (id) => {
        if (id === idUsuarioLogueado) {
            setMensaje("No puedes desactivar/activar tu propio usuario");
            return;
        }
        try {
            const usuario = usuarios.find((u) => u.idusuario === id);
            if (!usuario) return;

            await axios.put(`${API}${id}/`, { ...usuario, estado: true });
            setMensaje("Usuario activado correctamente");
            fetchUsuarios();
        } catch (error) {
            console.error("Error al activar usuario:", error);
            setMensaje("Error al activar el usuario");
        }
    };

    // --- FILTRO + PAGINACIÓN ---
    const usuariosFiltrados = usuarios.filter((u) =>
        u.nombreusuario.toLowerCase().includes(busqueda.toLowerCase())
    );
    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const usuariosPaginados = usuariosFiltrados.slice(
        indexOfFirst,
        indexOfLast
    );
    const totalPaginas = Math.ceil(
        usuariosFiltrados.length / elementosPorPagina
    );

    return (
        <Layout>
            <SEO title="Hope – Usuarios" />
            <div
                className="wrapper"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                <Header />
                <main
                    style={{
                        flex: 1,
                        padding: "40px 20px",
                        background: "#f0f2f5",
                    }}
                >
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                        <h2
                            style={{
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            Usuarios Registrados
                        </h2>
                        {mensaje && (
                            <p
                                style={{
                                    textAlign: "center",
                                    color: mensaje.includes("Error")
                                        ? "red"
                                        : "green",
                                    fontWeight: "bold",
                                }}
                            >
                                {mensaje}
                            </p>
                        )}

                        {/* --- BUSCADOR Y LÍMITE --- */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "15px",
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                }}
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    marginRight: "10px",
                                }}
                            />
                            <input
                                type="number"
                                min="1"
                                value={elementosPorPagina}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setElementosPorPagina(val > 0 ? val : 1);
                                    setPaginaActual(1);
                                }}
                                style={{
                                    width: "80px",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    textAlign: "center",
                                }}
                            />
                        </div>

                        {/* --- TABLA --- */}
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                padding: "20px 30px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                }}
                            >
                                <thead>
                                    <tr>
                                        {["Usuario", "Estado", "Acciones"].map(
                                            (h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        borderBottom:
                                                            "2px solid #eee",
                                                        padding: "10px",
                                                        textAlign:
                                                            h === "Estado"
                                                                ? "center"
                                                                : "left",
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosPaginados.length > 0 ? (
                                        usuariosPaginados.map((u) => (
                                            <tr key={u.idusuario}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {u.nombreusuario}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: u.estado
                                                            ? "green"
                                                            : "red",
                                                        fontWeight: "600",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {u.estado
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(u)
                                                        }
                                                        disabled={
                                                            !u.estado ||
                                                            u.idusuario ===
                                                                idUsuarioLogueado
                                                        }
                                                        style={{
                                                            padding: "6px 14px",
                                                            background:
                                                                u.estado &&
                                                                u.idusuario !==
                                                                    idUsuarioLogueado
                                                                    ? "#0054fd"
                                                                    : "#6c757d",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor:
                                                                u.estado &&
                                                                u.idusuario !==
                                                                    idUsuarioLogueado
                                                                    ? "pointer"
                                                                    : "not-allowed",
                                                            marginRight: "6px",
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    {u.estado ? (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    u.idusuario
                                                                )
                                                            }
                                                            disabled={
                                                                u.idusuario ===
                                                                idUsuarioLogueado
                                                            }
                                                            style={{
                                                                padding:
                                                                    "6px 14px",
                                                                background:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "#dc3545"
                                                                        : "#6c757d",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius:
                                                                    "5px",
                                                                cursor:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "pointer"
                                                                        : "not-allowed",
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleActivate(
                                                                    u.idusuario
                                                                )
                                                            }
                                                            disabled={
                                                                u.idusuario ===
                                                                idUsuarioLogueado
                                                            }
                                                            style={{
                                                                padding:
                                                                    "6px 14px",
                                                                background:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "#28a745"
                                                                        : "#6c757d",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius:
                                                                    "5px",
                                                                cursor:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "pointer"
                                                                        : "not-allowed",
                                                            }}
                                                        >
                                                            Activar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="3"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px",
                                                }}
                                            >
                                                No hay usuarios registrados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* --- PAGINACIÓN --- */}
                            {totalPaginas > 1 && (
                                <div
                                    style={{
                                        marginTop: "20px",
                                        textAlign: "center",
                                    }}
                                >
                                    {Array.from(
                                        { length: totalPaginas },
                                        (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() =>
                                                    setPaginaActual(i + 1)
                                                }
                                                style={{
                                                    margin: "0 5px",
                                                    padding: "6px 12px",
                                                    border: "1px solid #007bff",
                                                    background:
                                                        paginaActual === i + 1
                                                            ? "#007bff"
                                                            : "#fff",
                                                    color:
                                                        paginaActual === i + 1
                                                            ? "#fff"
                                                            : "#007bff",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* --- BOTÓN NUEVO --- */}
                        <button
                            onClick={() => setMostrarFormulario(true)}
                            style={{
                                marginTop: "20px",
                                padding: "12px 20px",
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                            }}
                        >
                            Nuevo Usuario
                        </button>
                    </div>
                </main>

                {/* --- MODAL LATERAL --- */}
                {mostrarFormulario && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            bottom: 0,
                            width: "350px",
                            background: "#fff",
                            boxShadow: "2px 0 15px rgba(0,0,0,0.2)",
                            padding: "30px",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h3
                            style={{
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            {editingUsuario
                                ? "Editar Usuario"
                                : "Registrar Usuario"}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                            {/* Nombre de usuario */}
                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    htmlFor="nombreusuario"
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Nombre de usuario
                                </label>
                                <input
                                    id="nombreusuario"
                                    type="text"
                                    value={form.nombreusuario}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            nombreusuario: e.target.value,
                                        }))
                                    }
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>

                            {/* Contraseña */}
                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    htmlFor="contrasena"
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="contrasena"
                                    type="password"
                                    value={form.contrasena}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            contrasena: e.target.value,
                                        }))
                                    }
                                    required={!editingUsuario}
                                    placeholder={
                                        editingUsuario
                                            ? "Dejar vacío para no cambiar"
                                            : ""
                                    }
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>

                            {/* Rol */}
                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    htmlFor="rol"
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Rol
                                </label>
                                <select
                                    id="rol"
                                    value={form.idrol}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            idrol: e.target.value,
                                        }))
                                    }
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <option value="">Seleccione un rol</option>
                                    {roles.map((r) => (
                                        <option key={r.idrol} value={r.idrol}>
                                            {r.nombrerol}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Empleado */}
                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    htmlFor="empleado"
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Empleado
                                </label>
                                <select
                                    id="empleado"
                                    value={form.idempleado}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            idempleado: e.target.value,
                                        }))
                                    }
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                >
                                    <option value="">
                                        Seleccione un empleado
                                    </option>
                                    {empleados.map((emp) => (
                                        <option
                                            key={emp.idempleado}
                                            value={emp.idempleado}
                                        >
                                            {emp.nombre} {emp.apellido} -{" "}
                                            {emp.dpi}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Botón Guardar / Actualizar */}
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                {editingUsuario ? "Actualizar" : "Guardar"}
                            </button>
                        </form>

                        {/* Botón Cerrar */}
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            style={{
                                marginTop: "10px",
                                padding: "10px",
                                background: "#6c757d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                <Footer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default UsuariosContainer;
