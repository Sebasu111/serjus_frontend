import React, { Fragment, useState } from "react";
import HeaderContactInfo from "../../components/header-contact-info";
import HomeData from "../../data/home.json";
import MobileMenu from "../../components/menu/mobile-menu";
import MenuOverlay from "../../components/menu/menu-overlay";
import { FaUserCircle } from "react-icons/fa";

const HeaderTop = ({ username = "Usuario" }) => {
    const [ofcanvasShow, setOfcanvasShow] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const onCanvasHandler = () => setOfcanvasShow(prev => !prev);
    const toggleUserMenu = () => setUserMenuOpen(prev => !prev);

    return (
        <Fragment>
            <div className="header-top">
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
                            <FaUserCircle size={28} color="#fff" />
                            <span className="user-name">{username}</span>

                        </div>

                        {/* Botón para menú móvil */}
                        <div className="mobile-menu-toggle d-lg-none">
                            <button onClick={onCanvasHandler} className="offcanvas-toggle">
                                {/* Aquí puede ir un icono tipo hamburguesa */}
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
