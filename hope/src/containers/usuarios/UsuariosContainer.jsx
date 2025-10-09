// containers/usuarios/UsuariosContainer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { X, Eye, EyeOff } from "lucide-react";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

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
    const [cambiarContrasena, setCambiarContrasena] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [busquedaEmpleado, setBusquedaEmpleado] = useState("");

    // Paginación y búsqueda
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    // Leer el id del usuario logueado desde sessionStorage
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
            showToast("Error al cargar los usuarios");
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

            // Validaciones
            if (!form.nombreusuario) {
                showToast("El nombre de usuario es obligatorio");
                return;
            }
            if (!editingUsuario && !form.contrasena) {
                showToast("La contraseña es obligatoria al crear un usuario");
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

            // Solo agregar contraseña si se ingresó
            if (form.contrasena && (!editingUsuario || cambiarContrasena)) {
                payload.contrasena = form.contrasena;
            }

            if (editingUsuario) {
                // Evitar que se edite el usuario logueado
                if (editingUsuario.idusuario === idUsuarioLogueado) {
                    showToast("No puedes editar tu propio usuario desde aquí");
                    return;
                }
                await axios.put(`${API}${editingUsuario.idusuario}/`, payload);
                showToast("Usuario actualizado correctamente");
            } else {
                await axios.post(API, payload);
                showToast("Usuario registrado correctamente");
            }

            // Reset
            setForm({
                nombreusuario: "",
                contrasena: "",
                estado: true,
                idrol: "",
                idempleado: "",
            });
            setCambiarContrasena(false);
            setEditingUsuario(null);
            setUsuarioActivoEditando(true);
            setMostrarFormulario(false);
            fetchUsuarios();
        } catch (error) {
            console.error(
                "Error al guardar usuario:",
                error.response?.data || error
            );
            showToast("Error al registrar/actualizar usuario");
        }
    };

    const handleEdit = (usuario) => {
        if (!usuario.estado) {
            showToast("No se puede editar un usuario inactivo");
            return;
        }
        if (usuario.idusuario === idUsuarioLogueado) {
            showToast("No puedes editar tu propio usuario desde aquí");
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
        setCambiarContrasena(false);
    };

   const handleDelete = (id) => {
        if (id === idUsuarioLogueado) {
            showToast("No puedes desactivar tu propio usuario");
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

            showToast("Usuario desactivado correctamente");
            fetchUsuarios();
        } catch (error) {
            console.error("Error al desactivar usuario:", error);
            showToast("Error al desactivar el usuario");
        } finally {
            setMostrarConfirmacion(false);
            setUsuarioSeleccionado(null);
        }
    };

    const handleActivate = async (id) => {
        if (id === idUsuarioLogueado) {
            showToast("No puedes desactivar/activar tu propio usuario");
            return;
        }
        try {
            const usuario = usuarios.find((u) => u.idusuario === id);
            if (!usuario) return;

            await axios.put(`${API}${id}/`, { ...usuario, estado: true });
            showToast("Usuario activado correctamente");
            fetchUsuarios();
        } catch (error) {
            console.error("Error al activar usuario:", error);
            showToast("Error al activar el usuario");
        }
    };

    // --- FILTRO + PAGINACIÓN ---
   const usuariosFiltrados = usuarios.filter((u) => {
        const textoBusqueda = busqueda.toLowerCase().trim();
        const nombreCoincide = u.nombreusuario.toLowerCase().includes(textoBusqueda);

        // Convertir el estado booleano a texto legible
        const estadoTexto = u.estado ? "activo" : "inactivo";

        // Coincide si el texto buscado aparece parcial o completamente
        const estadoCoincide = estadoTexto.startsWith(textoBusqueda);

        return nombreCoincide || estadoCoincide;
    });
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
                        padding: "40px 20px",
                        background: "#f0f2f5",
                        justifyContent: "center",
                    }}
                >
                    <div style={{ 
                        maxWidth: "900px", 
                        margin: "0 auto",
                        paddingLeft: "250px",
                        }}>
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

                        {/* --- BUSCADOR Y NUEVO USUARIO --- */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "15px",
                                alignItems: "center",
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

                            <button
                                onClick={() => setMostrarFormulario(true)}
                                style={{
                                    padding: "10px 20px",
                                    background: "#219ebc",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Nuevo Usuario
                            </button>
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
                                                        borderBottom: "2px solid #eee",
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        fontWeight: "600",
                                                        background: "#f8f9fa",
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
                                                        textAlign: "center",
                                                        whiteSpace: "nowrap",
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
                                                        width: "120px",
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
                                                            marginRight: "8px",
                                                            whiteSpace: "nowrap",
                                                            justifyContent: "center",
                                                            display: "inline-flex",
                                                            width: "110px",
                                                            padding: "6px 14px",
                                                            background:
                                                                u.estado &&
                                                                u.idusuario !==
                                                                    idUsuarioLogueado
                                                                    ? "#fb8500"
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
                                                                whiteSpace: "nowrap",
                                                                justifyContent: "center",
                                                                display: "inline-flex",
                                                                width: "110px",
                                                                padding:
                                                                    "6px 14px",
                                                                background:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "#fb8500"
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
                                                                whiteSpace: "nowrap",
                                                                justifyContent: "center",
                                                                display: "inline-flex",
                                                                width: "110px",
                                                                padding:
                                                                    "6px 14px",
                                                                background:
                                                                    u.idusuario !==
                                                                    idUsuarioLogueado
                                                                        ? "#ffb703"
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
                                                    border: "1px solid #219ebc",
                                                    background:
                                                        paginaActual === i + 1
                                                            ? "#219ebc"
                                                            : "#fff",
                                                    color:
                                                        paginaActual === i + 1
                                                            ? "#fff"
                                                            : "#219ebc",
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

                        {/* --- LÍMITE --- */}
                        <div
                            style={{
                                marginTop: "20px",
                                textAlign: "center",
                            }}
                        >
                            <label style={{ marginRight: "10px", fontWeight: "600" }}>
                                Mostrar:
                            </label>
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
                                style={{
                                    width: "80px",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    textAlign: "center",
                                }}
                            />
                        </div>
                    </div>
                </main>

                {/* --- MODAL Usuarios --- */}
                {mostrarFormulario && (
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
                            <div style={{ marginBottom: "15px", position: "relative" }}>
                                <label
                                    htmlFor="contrasena"
                                    style={{ display: "block", marginBottom: "8px" }}
                                >
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
                                            marginBottom: "10px",
                                        }}
                                        >
                                        Cambiar contraseña
                                        </button>
                                    ) : null}

                                    {cambiarContrasena && (
                                        <div style={{ position: "relative" }}>
                                        <input
                                            id="contrasena"
                                            type={mostrarContrasena ? "text" : "password"}
                                            value={form.contrasena}
                                            onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                contrasena: e.target.value,
                                            }))
                                            }
                                            placeholder="Ingrese nueva contraseña"
                                            required
                                            style={{
                                            width: "100%",
                                            padding: "10px 40px 10px 10px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
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
                                            cursor: "pointer",
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
                                        onChange={(e) =>
                                        setForm((f) => ({ ...f, contrasena: e.target.value }))
                                        }
                                        required
                                        style={{
                                        width: "100%",
                                        padding: "10px 40px 10px 10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
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
                                        cursor: "pointer",
                                        }}
                                    >
                                        {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                    </div>
                                )}

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
                            </div>

                            {/* Empleado con búsqueda combinada */}
                            <div style={{ marginBottom: "15px" }}>
                                <label
                                    htmlFor="empleado"
                                    style={{ display: "block", marginBottom: "8px" }}
                                >
                                    Empleado
                                </label>

                                <input
                                    type="text"
                                    placeholder="Escriba nombre del empleado..."
                                    value={busquedaEmpleado}
                                    onChange={(e) => {
                                        setBusquedaEmpleado(e.target.value);
                                        setForm((f) => ({ ...f, idempleado: "" })); // resetear selección
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />

                                <ul
                                    style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                >
                                    {empleados
                                        .filter(
                                            (emp) =>
                                                !usuarios.some(
                                                    (u) =>
                                                        u.idempleado === emp.idempleado &&
                                                        (!editingUsuario || u.idusuario !== editingUsuario.idusuario)
                                                )
                                        )
                                        .filter((emp) =>
                                            `${emp.nombre} ${emp.apellido}`
                                                .toLowerCase()
                                                .includes(busquedaEmpleado.toLowerCase())
                                        )
                                        .map((emp) => (
                                            <li
                                                key={emp.idempleado}
                                                onClick={() => {
                                                    setForm((f) => ({ ...f, idempleado: emp.idempleado }));
                                                    setBusquedaEmpleado(`${emp.nombre} ${emp.apellido}`);
                                                }}
                                                style={{
                                                    padding: "8px 10px",
                                                    cursor: "pointer",
                                                    background:
                                                        form.idempleado === emp.idempleado ? "#f0f0f0" : "#fff",
                                                }}
                                            >
                                                {emp.nombre} {emp.apellido}
                                            </li>
                                        ))}
                                </ul>
                            </div>


                            {/* Botón Guardar / Actualizar */}
                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: "#219ebc",
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
                                position: "absolute",
                                top: "10px",
                                right: "15px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                            title="Cerrar"
                            >
                            <X size={24} color="#555" />
                            </button>
                    </div>
                )}
                {/* Modal de eliminacion */}
                {mostrarConfirmacion && (
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
                                width: "350px",
                            }}
                        >
                            <h3 style={{ marginBottom: "15px", color: "#333" }}>
                                Confirmar desactivación
                            </h3>
                            <p style={{ marginBottom: "25px", color: "#555" }}>
                                ¿Seguro que deseas desactivar al usuario{" "}
                                <strong>{usuarioSeleccionado?.nombreusuario}</strong>?
                            </p>

                            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                                <button
                                    onClick={confirmarDesactivacion}
                                    style={{
                                        background: "#fb8500",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Sí, desactivar
                                </button>
                                <button
                                    onClick={() => setMostrarConfirmacion(false)}
                                    style={{
                                        background: "#6c757d",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer />
                <Footer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default UsuariosContainer;
