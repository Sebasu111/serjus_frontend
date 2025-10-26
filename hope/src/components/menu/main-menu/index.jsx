import React, { useState, useEffect } from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaUserTie, FaClipboardList, FaBook, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./sidebar-menu.css";

const base = process.env.PUBLIC_URL || "";

const SidebarMenu = () => {
    const [openMenu, setOpenMenu] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const history = useHistory();
    const location = useLocation();

    // Mapeo de rutas a submenús
    const routeToSubmenu = {
        '/Empleados': 'personal',
        '/Contratos': 'personal',
        '/Historial': 'personal',
        '/Usuarios': 'personal',
        '/Equipos': 'personal',
        '/Convocatorias': 'reclutamiento',
        '/Aspirantes': 'reclutamiento',
        '/Seleccion': 'reclutamiento',
        '/Induccion': 'integracion',
        '/Capacitacion': 'integracion',
        '/Evaluaciones': 'desempeno',
        '/Criterios': 'desempeno',
        '/Ausencias': 'disciplinario',
        '/Amonestaciones': 'disciplinario',
        '/PuebloCultura': 'catalogo',
        '/Idiomas': 'catalogo',
        '/Puesto': 'catalogo',
        '/Documentos': 'documentos' // Agregado para Documentos
    };

    // Auto-abrir el submenu correcto basado en la ruta actual
    useEffect(() => {
        const currentPath = location.pathname.replace(base, '');
        const activeSubmenu = routeToSubmenu[currentPath];
        if (activeSubmenu && !collapsed) {
            setOpenMenu(activeSubmenu);
        }
    }, [location.pathname, collapsed]);

    React.useEffect(() => {
        // Sync collapsed state with body class for CSS rules
        const body = document.body;
        if (collapsed) body.classList.add("sidebar-collapsed");
        else body.classList.remove("sidebar-collapsed");
        return () => {
            // cleanup
            body.classList.remove("sidebar-collapsed");
        };
    }, [collapsed]);

    React.useEffect(() => {
        // Toggle body class for mobile overlay to prevent background scroll
        const body = document.body;
        if (mobileOpen) body.classList.add("sidebar-open");
        else body.classList.remove("sidebar-open");
        return () => body.classList.remove("sidebar-open");
    }, [mobileOpen]);

    const toggleSubmenu = menuName => {
        if (collapsed) {
            setCollapsed(false); // expandir el sidebar si está colapsado
            setOpenMenu(menuName); // abrir el submenu tocado
            return;
        }
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const handleLogout = e => {
        e.preventDefault();
        // aquí tu lógica de logout si aplica
        history.push(`${base}/login`);
    };

    React.useEffect(() => {
        const onKey = e => {
            if (e.key === "Escape") {
                setMobileOpen(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            {/* BOTÓN FUERA DEL MENU */}
            <div
                className={`sidebar-toggle ${collapsed ? "collapsed" : ""}`}
                onClick={() => {
                    // On small screens we should open the overlay; on large screens toggle collapsed
                    if (window.innerWidth <= 991) {
                        setMobileOpen(s => !s);
                        return;
                    }
                    const next = !collapsed;
                    setCollapsed(next);
                    if (!next) setOpenMenu(null); // si colapsas, cierra submenús abiertos
                }}
                aria-label="Toggle sidebar"
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.currentTarget.click();
                    }
                }}
            >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </div>

            {/* Overlay for mobile when sidebar is open */}
            <div className={`content-overlay ${mobileOpen ? "visible" : ""}`} onClick={() => setMobileOpen(false)} />

            {/* SIDEBAR */}
            <nav className={`sidebar-menu ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <NavLink to={`${base}/home`}>
                        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Logo" className="logo" />
                    </NavLink>
                </div>

                <ul className="sidebar-menu-list">
                    {/* Personal */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "personal" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("personal")}
                            title={collapsed ? "Personal" : ""}
                        >
                            <FaUsers className="menu-icon" /> {!collapsed && "Personal"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "personal" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/Empleados`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Colaboradores/as
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Contratos`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Contrato
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Historial`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Historial de Puestos
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Usuarios`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Usuarios
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Equipos`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Equipos
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Reclutamiento */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "reclutamiento" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("reclutamiento")}
                            title={collapsed ? "Reclutamiento" : ""}
                        >
                            <FaClipboardList className="menu-icon" /> {!collapsed && "Reclutamiento"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "reclutamiento" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/Convocatorias`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Convocatorias
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Aspirantes`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Aspirantes
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Seleccion`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Selección / Contratación
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Integración */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "integracion" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("integracion")}
                            title={collapsed ? "Integración" : ""}
                        >
                            <FaBook className="menu-icon" /> {!collapsed && "Integración"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "integracion" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/Induccion`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Inducción
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Capacitacion`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Capacitación
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Desempeño */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "desempeno" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("desempeno")}
                            title={collapsed ? "Desempeño" : ""}
                        >
                            <FaClipboardList className="menu-icon" /> {!collapsed && "Desempeño"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "desempeno" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/Evaluaciones`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Evaluaciones
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Criterios`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Criterios
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Control Disciplinario */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "disciplinario" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("disciplinario")}
                            title={collapsed ? "Control Disciplinario" : ""}
                        >
                            <FaUserTie className="menu-icon" /> {!collapsed && "Control Disciplinario"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "disciplinario" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/Ausencias`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Ausencias
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Amonestaciones`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Amonestaciones
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Catálogo */}
                    <li>
                        <div
                            className={`sidebar-menu-link ${openMenu === "catalogo" ? "has-active-child" : ""}`}
                            onClick={() => toggleSubmenu("catalogo")}
                            title={collapsed ? "Catálogo" : ""}
                        >
                            <FaBook className="menu-icon" /> {!collapsed && "Catálogo"}
                        </div>
                        <ul className={`sidebar-submenu ${openMenu === "catalogo" ? "open" : ""}`}>
                            <li>
                                <NavLink
                                    to={`${base}/PuebloCultura`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Pueblo/Cultura
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Idiomas`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Idiomas
                                </NavLink>
                            </li>
                            <li>
                                <NavLink
                                    to={`${base}/Puesto`}
                                    className="sidebar-submenu-link"
                                    activeClassName="active"
                                >
                                    Puesto
                                </NavLink>
                            </li>
                        </ul>
                    </li>

                    {/* Informes */}
                    <li>
                        <NavLink
                            to={`${base}/Informes`}
                            className="sidebar-menu-link"
                            activeClassName="active"
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
                            activeClassName="active"
                            title={collapsed ? "Documentos" : ""}
                        >
                            <FaFileAlt className="menu-icon" /> {!collapsed && "Documentos"}
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default SidebarMenu;
