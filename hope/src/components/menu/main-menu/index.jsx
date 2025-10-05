import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar-menu.css";

const base = process.env.PUBLIC_URL || "";

const SidebarMenu = () => {
    // Estado para controlar submenús abiertos
    const [openMenu, setOpenMenu] = useState(null);

    const toggleSubmenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    return (
        <nav className="sidebar-menu">
            <ul className="sidebar-menu-list">
                {/* Botón Home */}
                <li>
                    <NavLink
                        to={`${base}/home`}
                        className="sidebar-menu-link home-link"
                        activeClassName="active"
                        style={{
                            fontWeight: "700",
                            color: "#ffffffff",
                            marginBottom: "15px",
                            display: "block",
                        }}
                    >
                        Inicio
                    </NavLink>
                </li>

                {/* Gestión de Usuarios y Seguridad */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("usuarios")}
                    >
                        Gestión de Usuarios
                    </div>
                    {openMenu === "usuarios" && (
                        <ul className="sidebar-submenu">
                            <li>
                                <NavLink to={`${base}/Usuarios`} className="sidebar-submenu-link">
                                    Usuarios
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={`${base}/Roles`} className="sidebar-submenu-link">
                                    Roles y Permisos
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Gestión de Catálogos */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("catalogos")}
                    >
                        Gestión de Catálogos
                    </div>
                    {openMenu === "catalogos" && (
                        <ul className="sidebar-submenu">
                            <li><NavLink to={`${base}/Idiomas`} className="sidebar-submenu-link">Idiomas</NavLink></li>
                            <li><NavLink to={`${base}/Estados`} className="sidebar-submenu-link">Estados</NavLink></li>
                            <li><NavLink to={`${base}/Puesto`} className="sidebar-submenu-link">Puestos</NavLink></li>
                            <li><NavLink to={`${base}/TiposDocumento`} className="sidebar-submenu-link">Tipos de Documentos</NavLink></li>
                            <li><NavLink to={`${base}/PuebloCultura`} className="sidebar-submenu-link">Pueblos y Culturas</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* Gestión de Empleados */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("empleados")}
                    >
                        Gestión de Empleados
                    </div>
                    {openMenu === "empleados" && (
                        <ul className="sidebar-submenu">
                            <li><NavLink to={`${base}/Empleados`} className="sidebar-submenu-link">Empleados</NavLink></li>
                            <li><NavLink to={`${base}/HistorialPuesto`} className="sidebar-submenu-link">Historial de Puestos</NavLink></li>
                            <li><NavLink to={`${base}/Contratos`} className="sidebar-submenu-link">Contratos</NavLink></li>
                            <li><NavLink to={`${base}/Documentos`} className="sidebar-submenu-link">Documentos</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* Recursos Humanos */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("rrhh")}
                    >
                        Recursos Humanos
                    </div>
                    {openMenu === "rrhh" && (
                        <ul className="sidebar-submenu">
                            <li><NavLink to={`${base}/Amonestacion`} className="sidebar-submenu-link">Amonestaciones</NavLink></li>
                            <li><NavLink to={`${base}/Ausencia`} className="sidebar-submenu-link">Ausencias</NavLink></li>
                            <li><NavLink to={`${base}/TerminacionLaboral`} className="sidebar-submenu-link">Terminación Laboral</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* Selección y Capacitación */}
                <li>
                    <div
                        className="sidebar-menu-link"
                        onClick={() => toggleSubmenu("seleccion")}
                    >
                        Selección y Capacitación
                    </div>
                    {openMenu === "seleccion" && (
                        <ul className="sidebar-submenu">
                            <li><NavLink to={`${base}/Aspirantes`} className="sidebar-submenu-link">Aspirantes</NavLink></li>
                            <li><NavLink to={`${base}/Convocatorias`} className="sidebar-submenu-link">Convocatorias</NavLink></li>
                            <li><NavLink to={`${base}/Evaluaciones`} className="sidebar-submenu-link">Evaluaciones</NavLink></li>
                            <li><NavLink to={`${base}/CriterioEvaluacion`} className="sidebar-submenu-link">Criterios de Evaluación</NavLink></li>
                            <li><NavLink to={`${base}/EvaluacionCriterio`} className="sidebar-submenu-link">Evaluación por Criterios</NavLink></li>
                            <li><NavLink to={`${base}/EmpleadoCapacitacion`} className="sidebar-submenu-link">Empleado - Capacitación</NavLink></li>
                            <li><NavLink to={`${base}/Inducciones`} className="sidebar-submenu-link">Inducciones</NavLink></li>
                            <li><NavLink to={`${base}/InduccionDocumentos`} className="sidebar-submenu-link">Documentos de Inducción</NavLink></li>
                        </ul>
                    )}
                </li>

                {/* Equipos */}
                <li>
                    <NavLink to={`${base}/Equipos`} className="sidebar-menu-link">Equipos</NavLink>
                </li>
                {/* Cerrar Sesion */}
                <li>
                    <NavLink
                        to={`${base}/`}
                        className="sidebar-menu-link home-link"
                        activeClassName="active"
                        style={{
                            fontWeight: "700",
                            color: "#ffffffff",
                            marginBottom: "15px",
                            display: "block",
                        }}
                    >
                        Cerrar Sesion
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default SidebarMenu;
