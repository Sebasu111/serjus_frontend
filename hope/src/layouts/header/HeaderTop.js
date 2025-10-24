import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // v5
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";
import { FaUserCircle, FaHome } from "react-icons/fa";
import FormUsuario from "../../containers/usuarios/FormUsuario"; // Ajusta la ruta según tu estructura
import { showToast } from "../../utils/toast"; //  Importa el toast

const HeaderTop = () => {
    const [ofcanvasShow, setOfcanvasShow] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [username, setUsername] = useState("Usuario");
    const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);

    const history = useHistory();

    const onCanvasHandler = () => setOfcanvasShow(prev => !prev);
    const toggleUserMenu = () => setUserMenuOpen(prev => !prev);

    const [form, setForm] = useState({
        nombreusuario: "",
        contrasena: "",
        idrol: "",
        idempleado: ""
    });
    const [roles] = useState([]);
    const [empleados] = useState([]);
    const [usuarios] = useState([]);
    const [editingUsuario] = useState(true);
    const [cambiarContrasena, setCambiarContrasena] = useState(true);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [busquedaEmpleado, setBusquedaEmpleado] = useState("");

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuarioLogueado");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setUsername(usuario.nombreusuario || "Usuario");
            setForm(f => ({ ...f, nombreusuario: usuario.nombreusuario || "" }));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogueado");
        sessionStorage.removeItem("idUsuario");
        showToast("Sesión cerrada correctamente", "success");
        history.push("/"); // Redirige al login
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.contrasena) {
            showToast("Debe ingresar una nueva contraseña", "error");
            return;
        }

        try {
            const usuarioGuardado = JSON.parse(localStorage.getItem("usuarioLogueado"));
            const idUsuario = usuarioGuardado?.idusuario;

            if (!idUsuario) {
                showToast("Error: no se encontró el usuario logueado", "error");
                return;
            }

            // Se construye el payload completo que requiere la API
            const payload = {
                nombreusuario: form.nombreusuario,
                contrasena: form.contrasena,
                estado: true,
                createdat: usuarioGuardado.createdat || new Date().toISOString(),
                updatedat: new Date().toISOString(),
                idrol: form.idrol || usuarioGuardado.idrol || 0,
                idempleado: form.idempleado || usuarioGuardado.idempleado || 0,
            };

            const response = await fetch(`http://127.0.0.1:8000/api/usuarios/${idUsuario}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    // "Authorization": `Bearer ${token}`, // si tu API lo requiere
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showToast("Contraseña actualizada correctamente ", "success");
                setMostrarFormUsuario(false);
                setForm(f => ({ ...f, contrasena: "" }));
            } else {
                const error = await response.json();
                showToast(error.message || "Error al actualizar la contraseña", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error de conexión con el servidor", "error");
        }
    };

    return (
        <Fragment>
            <div className="header-top" style={{ background: "#fff", borderBottom: "1px solid #ddd" }}>
                <div className="container">
                    <div className="header-middle-content d-flex align-items-center">

                        {/* Info de contacto */}
                        <ul className="media-wrap d-none d-lg-flex">
                            {HomeData[0].headerInfo &&
                                HomeData[0].headerInfo.map((single, key) => (
                                    <HeaderContactInfo key={key} data={single} />
                                ))}
                        </ul>

                        {/* Usuario + menú móvil */}
                        <div className="d-flex align-items-center ms-auto">
                            <a href="/home" className="me-3" style={{ color: "#000", display: "flex", alignItems: "center" }}>
                                <FaHome size={22} />
                            </a>
                            <div className="header-user position-relative" onClick={toggleUserMenu}>
                                <FaUserCircle size={28} color="#000" />
                                <span className="user-name" style={{ marginLeft: "8px", fontWeight: "600", color: "#000" }}>
                                    {username}
                                </span>

                                {userMenuOpen && (
                                    <ul className="user-dropdown">
                                        <li><a href="/perfil">Perfil</a></li>

                                        {/* Botón de cambio de contraseña */}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setMostrarFormUsuario(true);
                                                    setUserMenuOpen(false);
                                                    showToast("Abriendo formulario de cambio de contraseña", "info");
                                                }}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#fff",
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "0",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Cambiar Contraseña
                                            </button>
                                        </li>

                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#fff",
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: "0",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Cerrar sesión
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>

                            {/* Botón menú móvil */}
                            <div className="mobile-menu-toggle d-lg-none ms-3">
                                <button onClick={onCanvasHandler} className="offcanvas-toggle">
                                    <span style={{ fontSize: "24px", color: "#000" }}>☰</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <MenuOverlay show={ofcanvasShow} />
                <MobileMenu show={ofcanvasShow} onClose={onCanvasHandler} />
            </div>

            {/* Modal de cambio de contraseña */}
            {mostrarFormUsuario && (
                <>
                    {/* Fondo semitransparente */}
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0, 0, 0, 0.5)",
                            zIndex: 999
                        }}
                        onClick={() => setMostrarFormUsuario(false)}
                    ></div>

                    {/* Formulario en modal */}
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
                        setMostrarFormulario={setMostrarFormUsuario}
                    />
                </>
            )}
        </Fragment>
    );
};

//    Componente auxiliar original
const HeaderContactInfo = ({ data }) => (
    <li>
        <i className={data.icon}></i> {data.text}
    </li>
);

export default HeaderTop;
