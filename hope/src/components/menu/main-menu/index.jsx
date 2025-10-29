import React, { useState, useEffect } from "react";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import {
    FaUsers,
    FaUserTie,
    FaClipboardList,
    FaBook,
    FaFileAlt
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./sidebar-menu.css";

const base = process.env.PUBLIC_URL || "";

const SidebarMenu = () => {
    const [openMenu, setOpenMenu] = useState(null);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const history = useHistory();
    const location = useLocation();
    const idRol = parseInt(sessionStorage.getItem("idRol"), 10);

    // --- CONFIGURACIÓN DEL MENÚ ---
    const menuConfig = [
        {
            id: "personal",
            label: "Personal",
            icon: <FaUsers className="menu-icon" />,
            submenus: [
                { path: "/Empleados", label: "Colaboradores/as", roles: [4, 5] },
                { path: "/Contratos", label: "Contrato", roles: [4, 5] },
                { path: "/Usuarios", label: "Usuarios", roles: [5] },
                { path: "/Equipos", label: "Equipos", roles: [1, 5] }
            ]
        },
        {
            id: "reclutamiento",
            label: "Reclutamiento",
            icon: <FaClipboardList className="menu-icon" />,
            submenus: [
                { path: "/Convocatorias", label: "Convocatorias", roles: [4, 5] },
                { path: "/Aspirantes", label: "Aspirantes", roles: [1,5] },
                { path: "/Seleccion", label: "Selección / Contratación", roles: [1,5] }
            ]
        },
        {
            id: "integracion",
            label: "Integración",
            icon: <FaBook className="menu-icon" />,
            submenus: [
                { path: "/Induccion", label: "Inducción", roles: [1, 2, 4, 5] },
                { path: "/Capacitacion", label: "Capacitación", roles: [1, 4, 5] }
            ]
        },
        {
            id: "desempeno",
            label: "Desempeño",
            icon: <FaClipboardList className="menu-icon" />,
            submenus: [
                { path: "/Evaluaciones", label: "Evaluaciones", roles: [1, 5] },
                { path: "/Criterios", label: "Criterios", roles: [1, 5] }
            ]
        },
        {
            id: "disciplinario",
            label: "Control Disciplinario",
            icon: <FaUserTie className="menu-icon" />,
            submenus: [
                { path: "/Ausencias", label: "Ausencias", roles: [1, 5] },
                { path: "/Amonestaciones", label: "Amonestaciones", roles: [1, 5] }
            ]
        },
        {
            id: "catalogo",
            label: "Catálogo",
            icon: <FaBook className="menu-icon" />,
            submenus: [
                { path: "/PuebloCultura", label: "Pueblo/Cultura", roles: [5] },
                { path: "/Idiomas", label: "Idiomas", roles: [5] },
                { path: "/Puesto", label: "Puesto", roles: [5] }
            ]
        },
        {
            id: "informes",
            label: "Informes",
            icon: <FaFileAlt className="menu-icon" />,
            path: "/Informes",
            roles: [1, 2, 3, 5]
        },
        {
            id: "documentos",
            label: "Documentos",
            icon: <FaFileAlt className="menu-icon" />,
            path: "/Documentos",
            roles: [1, 2, 4, 5]
        }
    ];

    // --- AUTO-ABRIR SUBMENÚ ACTUAL ---
    useEffect(() => {
        const currentPath = location.pathname.replace(base, "");
        const activeSubmenu = menuConfig.find(menu =>
            menu.submenus?.some(sub => sub.path === currentPath)
        )?.id;
        if (activeSubmenu && !collapsed) {
            setOpenMenu(activeSubmenu);
        }
    }, [location.pathname, collapsed]);

    // --- CLASES CSS AL BODY ---
    useEffect(() => {
        const body = document.body;
        if (collapsed) body.classList.add("sidebar-collapsed");
        else body.classList.remove("sidebar-collapsed");
        return () => body.classList.remove("sidebar-collapsed");
    }, [collapsed]);

    useEffect(() => {
        const body = document.body;
        if (mobileOpen) body.classList.add("sidebar-open");
        else body.classList.remove("sidebar-open");
        return () => body.classList.remove("sidebar-open");
    }, [mobileOpen]);

    // --- TOGGLE ---
    const toggleSubmenu = menuName => {
        if (collapsed) {
            setCollapsed(false);
            setOpenMenu(menuName);
            return;
        }
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const handleLogout = e => {
        e.preventDefault();
        history.push(`${base}/login`);
    };

    // --- ESCAPE PARA MÓVIL ---
    useEffect(() => {
        const onKey = e => { if (e.key === "Escape") setMobileOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <>
            {/* BOTÓN FUERA DEL MENU */}
            <div
                className={`sidebar-toggle ${collapsed ? "collapsed" : ""}`}
                onClick={() => {
                    if (window.innerWidth <= 991) {
                        setMobileOpen(s => !s);
                        return;
                    }
                    const next = !collapsed;
                    setCollapsed(next);
                    if (!next) setOpenMenu(null);
                }}
                aria-label="Toggle sidebar"
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
            >
                {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </div>

            {/* Overlay móvil */}
            <div
                className={`content-overlay ${mobileOpen ? "visible" : ""}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* SIDEBAR */}
            <nav className={`sidebar-menu ${collapsed ? "collapsed" : ""} ${mobileOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <NavLink to={`${base}/home`}>
                        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Logo" className="logo" />
                    </NavLink>
                </div>

                <ul className="sidebar-menu-list">
                    {menuConfig.map(menu => {
                        const visibleSubmenus = menu.submenus?.filter(sub => sub.roles.includes(idRol)) || [];
                        if (menu.submenus && visibleSubmenus.length === 0) return null;
                        if (!menu.submenus && !menu.roles.includes(idRol)) return null;

                        return (
                            <li key={menu.id}>
                                {menu.submenus ? (
                                    <>
                                        <div
                                            className={`sidebar-menu-link ${openMenu === menu.id ? "has-active-child" : ""}`}
                                            onClick={() => toggleSubmenu(menu.id)}
                                            title={collapsed ? menu.label : ""}
                                        >
                                            {menu.icon} {!collapsed && menu.label}
                                        </div>
                                        <ul className={`sidebar-submenu ${openMenu === menu.id ? "open" : ""}`}>
                                            {visibleSubmenus.map(sub => (
                                                <li key={sub.path}>
                                                    <NavLink
                                                        to={`${base}${sub.path}`}
                                                        className="sidebar-submenu-link"
                                                        activeClassName="active"
                                                    >
                                                        {sub.label}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <NavLink
                                        to={`${base}${menu.path}`}
                                        className="sidebar-menu-link"
                                        activeClassName="active"
                                        title={collapsed ? menu.label : ""}
                                    >
                                        {menu.icon} {!collapsed && menu.label}
                                    </NavLink>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
};

export default SidebarMenu;
