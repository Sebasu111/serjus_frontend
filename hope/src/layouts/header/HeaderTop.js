import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom"; // ✅ v5
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";
import { FaUserCircle } from "react-icons/fa";

const HeaderTop = () => {
    const [ofcanvasShow, setOfcanvasShow] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [username, setUsername] = useState("Usuario");
    const history = useHistory(); // ✅ hook v5

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
        history.push("/"); // ⬅ redirige al login en la raíz
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
                                ))
                            }
                        </ul>

                        {/* Usuario + menú móvil */}
                        <div className="d-flex align-items-center ms-auto">
                            <div className="header-user position-relative" onClick={toggleUserMenu}>
                                <FaUserCircle size={28} color="#000" />
                                <span className="user-name" style={{ marginLeft: "8px", fontWeight: "600", color: "#000" }}>
                                    {username}
                                </span>

                                {userMenuOpen && (
                                    <ul className="user-dropdown">
                                        <li><a href="/perfil">Perfil</a></li>
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
        </Fragment>
    );
};

export default HeaderTop;
