import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // v5
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";
import { FaUserCircle, FaHome } from "react-icons/fa";
import CambiarContrasenaModal from "../../components/CambiarContrasenaModal";
import { showToast } from "../../utils/toast"; //  Importa el toast

const HeaderTop = () => {
    const [ofcanvasShow, setOfcanvasShow] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [username, setUsername] = useState("Usuario");
    const [mostrarCambiarContrasena, setMostrarCambiarContrasena] = useState(false);

    const history = useHistory();

    const onCanvasHandler = () => setOfcanvasShow(prev => !prev);
    const toggleUserMenu = () => setUserMenuOpen(prev => !prev);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuarioLogueado");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setUsername(usuario.nombreusuario || "Usuario");
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogueado");
        sessionStorage.removeItem("idUsuario");
        showToast("Sesión cerrada correctamente", "success");
        history.push("/"); // Redirige al login
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
                            <a
                                href="/home"
                                className="me-3"
                                style={{ color: "#000", display: "flex", alignItems: "center" }}
                            >
                                <FaHome size={22} />
                            </a>
                            <div className="header-user position-relative" onClick={toggleUserMenu}>
                                <FaUserCircle size={28} color="#000" />
                                <span
                                    className="user-name"
                                    style={{ marginLeft: "8px", fontWeight: "600", color: "#000" }}
                                >
                                    {username}
                                </span>

                                {userMenuOpen && (
                                    <ul className="user-dropdown">
                                        <li>
                                            <a href="/perfil">Perfil</a>
                                        </li>

                                        {/* Botón de cambio de contraseña */}
                                        <li>
                                            <button
                                                onClick={() => {
                                                    setMostrarCambiarContrasena(true);
                                                    setUserMenuOpen(false);
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
            {mostrarCambiarContrasena && (
                <CambiarContrasenaModal
                    onClose={() => setMostrarCambiarContrasena(false)}
                />
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
