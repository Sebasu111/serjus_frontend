import React, { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import {
    FaHome,
    FaUsers,
    FaUserTie,
    FaClipboardList,
    FaBook,
    FaFileAlt,
    FaSignOutAlt,
} from "react-icons/fa";
import "./sidebar-menu.css";

const base = process.env.PUBLIC_URL || "";

const SidebarMenu = () => {
    const [openMenu, setOpenMenu] = useState(null);
    const history = useHistory(); // <-- useHistory en v5

    const toggleSubmenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const handleLogout = () => {
        localStorage.removeItem("usuarioLogueado");
        sessionStorage.removeItem("idUsuario");
        history.push("/login"); // <-- redirige al login en v5
    };

    return (
        <nav className="sidebar-menu">
            <div className="sidebar-logo">
                <img
                    src={`${process.env.PUBLIC_URL}/img/logo.png`}
                    alt="Logo"
                />
            </div>

            <ul className="sidebar-menu-list">
                {/* Inicio */}
                <li>
                    <NavLink to={`${base}/home`} className="sidebar-menu-link">
                        <FaHome className="menu-icon" /> Inicio
                    </NavLink>
                </li>

                {/* Personal */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("personal")}
                    >
                        <FaUsers className="menu-icon" /> Personal
                    </div>
                    {openMenu === "personal" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/Empleados`}
                                    className="sidebar-submenu-link"
                                >
                                    Empleados
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Contrato`}
                                    className="sidebar-submenu-link"
                                >
                                    Contrato
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Historial`}
                                    className="sidebar-submenu-link"
                                >
                                    Historial
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Usuarios`}
                                    className="sidebar-submenu-link"
                                >
                                    Usuarios
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Reclutamiento */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("reclutamiento")}
                    >
                        <FaClipboardList className="menu-icon" /> Reclutamiento
                    </div>
                    {openMenu === "reclutamiento" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/Convocatorias`}
                                    className="sidebar-submenu-link"
                                >
                                    Convocatorias
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Aspirantes`}
                                    className="sidebar-submenu-link"
                                >
                                    Aspirantes
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Seleccion`}
                                    className="sidebar-submenu-link"
                                >
                                    Selección / Contratación
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Integración */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("integracion")}
                    >
                        <FaBook className="menu-icon" /> Integración
                    </div>
                    {openMenu === "integracion" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/Induccion`}
                                    className="sidebar-submenu-link"
                                >
                                    Inducción
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Capacitacion`}
                                    className="sidebar-submenu-link"
                                >
                                    Capacitación
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Desempeño */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("desempeno")}
                    >
                        <FaClipboardList className="menu-icon" /> Desempeño
                    </div>
                    {openMenu === "desempeno" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/Evaluaciones`}
                                    className="sidebar-submenu-link"
                                >
                                    Evaluaciones
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Criterios`}
                                    className="sidebar-submenu-link"
                                >
                                    Criterios
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Control Disciplinario */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("disciplinario")}
                    >
                        <FaUserTie className="menu-icon" /> Control
                        Disciplinario
                    </div>
                    {openMenu === "disciplinario" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/Ausencias`}
                                    className="sidebar-submenu-link"
                                >
                                    Ausencias
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Amonestaciones`}
                                    className="sidebar-submenu-link"
                                >
                                    Amonestaciones
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Catálogo */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("catalogo")}
                    >
                        <FaBook className="menu-icon" /> Catálogo
                    </div>
                    {openMenu === "catalogo" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink
                                    to={`${base}/CulturaPueblo`}
                                    className="sidebar-submenu-link"
                                >
                                    Cultura Pueblo
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Idioma`}
                                    className="sidebar-submenu-link"
                                >
                                    Idioma
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Puestos`}
                                    className="sidebar-submenu-link"
                                >
                                    Puestos
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Informes */}
                <li>
                    <NavLink
                        to={`${base}/Informes`}
                        className="sidebar-menu-link"
                    >
                        <FaFileAlt className="menu-icon" /> Informes
                    </NavLink>
                </li>

                {/* Documentos */}
                <li>
                    <NavLink
                        to={`${base}/Documentos`}
                        className="sidebar-menu-link"
                    >
                        <FaFileAlt className="menu-icon" /> Documentos
                    </NavLink>
                </li>

                {/* Cerrar Sesión */}
                <li>
                    <NavLink
                        to={`${base}/`}
                        className="sidebar-menu-link logout-link"
                    >
                        <FaSignOutAlt className="menu-icon" /> Cerrar Sesión
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default SidebarMenu;
