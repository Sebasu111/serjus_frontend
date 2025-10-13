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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./sidebar-menu.css";

const base = process.env.PUBLIC_URL || "";

const SidebarMenu = () => {
    const [openMenu, setOpenMenu] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const history = useHistory();

    const toggleSubmenu = (menuName) => {
        if (collapsed) {
            setCollapsed(false);      // expandir el sidebar si está colapsado
            setOpenMenu(menuName);    // abrir el submenu tocado
        } else {
            setOpenMenu(openMenu === menuName ? null : menuName);
        }
    };

    const handleLogout = (e) => {
        e.preventDefault();
        // aquí tu lógica de logout si aplica
        history.push(`${base}/login`);
    };

    return (
        <>
            {/* BOTÓN FUERA DEL MENU */}
            <div
                className={`sidebar-toggle ${collapsed ? "collapsed" : ""}`}
                onClick={() => {
                    const next = !collapsed;
                    setCollapsed(next);
                    if (!next) setOpenMenu(null); // si colapsas, cierra submenús abiertos
                }}
            >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </div>

            {/* SIDEBAR */}
            <nav className={`sidebar-menu ${collapsed ? "collapsed" : ""}`}>
                <div className="sidebar-logo">
                    <NavLink to={`${base}/home`}>
                        <img
                            src={`${process.env.PUBLIC_URL}/img/logo.png`}
                            alt="Logo"
                            className="logo"
                        />
                    </NavLink>
                </div>

                <ul className="sidebar-menu-list">
                    {/* Inicio */}
                    <li>
                        <NavLink
                            to={`${base}/home`}
                            className="sidebar-menu-link"
                            title={collapsed ? "Inicio" : ""}
                        >
                            <FaHome className="menu-icon" /> {!collapsed && "Inicio"}
                        </NavLink>
                    </li>

                    {/* Personal */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("personal")}
                            title={collapsed ? "Personal" : ""}
                        >
                            <FaUsers className="menu-icon" /> {!collapsed && "Personal"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "personal" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/Empleados`} className="sidebar-submenu-link">Colaboradores</NavLink></li>
                            <li><NavLink to={`${base}/Contrato`} className="sidebar-submenu-link">Contrato</NavLink></li>
                            <li><NavLink to={`${base}/Historial`} className="sidebar-submenu-link">Historial</NavLink></li>
                            <li><NavLink to={`${base}/Usuarios`} className="sidebar-submenu-link">Usuarios</NavLink></li>
                            <li><NavLink to={`${base}/Equipos`} className="sidebar-submenu-link">Equipos</NavLink></li>
                        </ul>
                    </li>

                    {/* Reclutamiento */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("reclutamiento")}
                            title={collapsed ? "Reclutamiento" : ""}
                        >
                            <FaClipboardList className="menu-icon" /> {!collapsed && "Reclutamiento"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "reclutamiento" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/Convocatorias`} className="sidebar-submenu-link">Convocatorias</NavLink></li>
                            <li><NavLink to={`${base}/Aspirantes`} className="sidebar-submenu-link">Aspirantes</NavLink></li>
                            <li><NavLink to={`${base}/Seleccion`} className="sidebar-submenu-link">Selección / Contratación</NavLink></li>
                        </ul>
                    </li>

                    {/* Integración */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("integracion")}
                            title={collapsed ? "Integración" : ""}
                        >
                            <FaBook className="menu-icon" /> {!collapsed && "Integración"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "integracion" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/Induccion`} className="sidebar-submenu-link">Inducción</NavLink></li>
                            <li><NavLink to={`${base}/Capacitacion`} className="sidebar-submenu-link">Capacitación</NavLink></li>
                        </ul>
                    </li>

                    {/* Desempeño */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("desempeno")}
                            title={collapsed ? "Desempeño" : ""}
                        >
                            <FaClipboardList className="menu-icon" /> {!collapsed && "Desempeño"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "desempeno" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/Evaluaciones`} className="sidebar-submenu-link">Evaluaciones</NavLink></li>
                            <li><NavLink to={`${base}/Criterios`} className="sidebar-submenu-link">Criterios</NavLink></li>
                        </ul>
                    </li>

                    {/* Control Disciplinario */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("disciplinario")}
                            title={collapsed ? "Control Disciplinario" : ""}
                        >
                            <FaUserTie className="menu-icon" /> {!collapsed && "Control Disciplinario"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "disciplinario" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/Ausencias`} className="sidebar-submenu-link">Ausencias</NavLink></li>
                            <li><NavLink to={`${base}/Amonestaciones`} className="sidebar-submenu-link">Amonestaciones</NavLink></li>
                        </ul>
                    </li>

                    {/* Catálogo */}
                    <li>
                        <div
                            className="sidebar-menu-link"
                            onClick={() => toggleSubmenu("catalogo")}
                            title={collapsed ? "Catálogo" : ""}
                        >
                            <FaBook className="menu-icon" /> {!collapsed && "Catálogo"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "catalogo" ? "open" : ""}`}>
                            <li><NavLink to={`${base}/PuebloCultura`} className="sidebar-submenu-link">Pueblo/Cultura</NavLink></li>
                            <li><NavLink to={`${base}/Idiomas`} className="sidebar-submenu-link">Idiomas</NavLink></li>
                            <li><NavLink to={`${base}/Puesto`} className="sidebar-submenu-link">Puesto</NavLink></li>
                        </ul>
                    </li>

                    {/* Informes */}
                    <li>
                        <NavLink
                            to={`${base}/Informes`}
                            className="sidebar-menu-link"
                            title={collapsed ? "Informes" : ""}
                        >
                            <FaFileAlt className="menu-icon" /> {!collapsed && "Informes"}
                        </NavLink>
                    </li>

                    {/* Documentos */}
                    <li>
                        <NavLink
                            to={`${base}/Documentos`}
                            className="sidebar-menu-link"
                            title={collapsed ? "Documentos" : ""}
                        >
                            <FaFileAlt className="menu-icon" /> {!collapsed && "Documentos"}
                        </NavLink>
                    </li>

                    {/* Logout (opcional) */}
                    <li className="logout-link">
                        <a href="#logout" className="sidebar-menu-link" onClick={handleLogout} title={collapsed ? "Salir" : ""}>
                            <FaSignOutAlt className="menu-icon" /> {!collapsed && "Salir"}
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default SidebarMenu;
