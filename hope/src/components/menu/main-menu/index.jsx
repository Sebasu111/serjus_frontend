import React from "react";
import { NavLink } from "react-router-dom";

const base = process.env.PUBLIC_URL || "";

const MainMenu = () => {
    return (
        <nav>
            <ul className="main-menu">
                {/* Gestión de Usuarios y Seguridad */}
                <li className="has-submenu">
                    <NavLink
                        to={`${base}/Usuarios`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Gestión de Usuarios
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                to={`${base}/Usuarios`}
                                className="sub-menu-link"
                                activeClassName="active"
                            >
                                Usuarios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Roles`}
                                className="sub-menu-link"
                                activeClassName="active"
                            >
                                Roles y Permisos
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Gestión de Catálogos */}
                <li className="has-submenu">
                    <NavLink
                        to={`${base}/PuebloCultura`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Gestión de Catálogos
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                to={`${base}/Idiomas`}
                                className="sub-menu-link"
                            >
                                Idiomas
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Estados`}
                                className="sub-menu-link"
                            >
                                Estados
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Puesto`}
                                className="sub-menu-link"
                            >
                                Puestos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/TiposDocumento`}
                                className="sub-menu-link"
                            >
                                Tipos de Documentos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/PuebloCultura`}
                                className="sub-menu-link"
                            >
                                Pueblos y Culturas
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Gestión de Empleados */}
                <li className="has-submenu">
                    <NavLink
                        to={`${base}/empleados`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Gestión de Empleados
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                to={`${base}/Empleados`}
                                className="sub-menu-link"
                            >
                                Empleados
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/HistorialPuesto`}
                                className="sub-menu-link"
                            >
                                Historial de Puestos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Contratos`}
                                className="sub-menu-link"
                            >
                                Contratos
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Documentos`}
                                className="sub-menu-link"
                            >
                                Documentos
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Gestión de RRHH */}
                <li className="has-submenu">
                    <NavLink
                        to={`${base}/Amonestacion`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Recursos Humanos
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                to={`${base}/Amonestacion`}
                                className="sub-menu-link"
                            >
                                Amonestaciones
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Ausencia`}
                                className="sub-menu-link"
                            >
                                Ausencias
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/TerminacionLaboral`}
                                className="sub-menu-link"
                            >
                                Terminación Laboral
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Selección y Capacitación */}
                <li className="has-submenu">
                    <NavLink
                        to={`${base}/Convocatorias`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Selección y Capacitación
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                to={`${base}/Aspirantes`}
                                className="sub-menu-link"
                            >
                                Aspirantes
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Convocatorias`}
                                className="sub-menu-link"
                            >
                                Convocatorias
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Evaluaciones`}
                                className="sub-menu-link"
                            >
                                Evaluaciones
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/CriterioEvaluacion`}
                                className="sub-menu-link"
                            >
                                Criterios de Evaluación
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/EvaluacionCriterio`}
                                className="sub-menu-link"
                            >
                                Evaluación por Criterios
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/EmpleadoCapacitacion`}
                                className="sub-menu-link"
                            >
                                Empleado - Capacitación
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/Inducciones`}
                                className="sub-menu-link"
                            >
                                Inducciones
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`${base}/InduccionDocumentos`}
                                className="sub-menu-link"
                            >
                                Documentos de Inducción
                            </NavLink>
                        </li>
                    </ul>
                </li>

                {/* Equipos */}
                <li>
                    <NavLink
                        to={`${base}/Equipos`}
                        className="main-menu-link"
                        activeClassName="active"
                    >
                        Equipos
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default MainMenu;
