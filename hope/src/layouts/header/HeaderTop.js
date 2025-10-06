import React, { Fragment, useState, useEffect } from "react";
import HeaderContactInfo from "../../components/header-contact-info";
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";
import { FaUserCircle } from "react-icons/fa";

const HeaderTop = () => {
    const [ofcanvasShow, setOfcanvasShow] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [username, setUsername] = useState("Usuario");

    const onCanvasHandler = () => setOfcanvasShow(prev => !prev);
    const toggleUserMenu = () => setUserMenuOpen(prev => !prev);

    // ✅ Cargar usuario desde localStorage al montar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuarioLogueado");
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setUsername(usuario.nombreusuario || "Usuario");
        }
    }, []);

    return (
        <Fragment>
            <div className="header-top" style={{ background: "#fff", borderBottom: "1px solid #ddd" }}>
                <div className="container">
                    <div className="header-middle-content d-flex justify-content-between align-items-center">

                        {/* Info de contacto o redes */}
                        <ul className="media-wrap d-none d-lg-flex">
                            {HomeData[0].headerInfo &&
                                HomeData[0].headerInfo.map((single, key) => (
                                    <HeaderContactInfo key={key} data={single} />
                                ))
                            }
                        </ul>

                        {/* Usuario */}
                        <div className="header-user" onClick={toggleUserMenu}>
                            <FaUserCircle size={28} color="#000" /> {/* negro para que se vea en fondo blanco */}
                            <span className="user-name" style={{ marginLeft: "8px", fontWeight: "600", color: "#000" }}>
                                {username}
                            </span>
                        </div>

                        {/* Botón para menú móvil */}
                        <div className="mobile-menu-toggle d-lg-none">
                            <button onClick={onCanvasHandler} className="offcanvas-toggle">
                                {/* Icono hamburguesa */}
                                <span style={{ fontSize: "24px", color: "#000" }}>☰</span>
                            </button>
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
