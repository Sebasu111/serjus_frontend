import React from "react";
import { NavLink } from "react-router-dom";

const MainMenu = () => {
    return (
        <nav>
            <ul className="main-menu">
                <li>
                    <NavLink
                        className="main-menu-link"
                        activeClassName="active"
                        exact
                        to="/"
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="main-menu-link"
                        to={process.env.PUBLIC_URL + ""}
                    >
                        Gestion de Datos
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                activeClassName="active"
                                to={process.env.PUBLIC_URL + "/Idiomas"}
                            >
                                Idiomas
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/Estados"}
                            >
                                Estados
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/Puesto"}
                            >
                                Puesto
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/Roles"}
                            >
                                Roles
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/TiposDocumento"}
                            >
                                Tipos de Documentos
                            </NavLink>
                        </li>
                    </ul>
                </li>

                <li>
                    <NavLink
                        className="main-menu-link"
                        to={process.env.PUBLIC_URL + "/blog"}
                    >
                        Blog
                    </NavLink>
                    <ul className="sub-menu">
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/blog"}
                            >
                                Blog list
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                className="sub-menu-link"
                                to={process.env.PUBLIC_URL + "/blog-details/1"}
                            >
                                Blog Details
                            </NavLink>
                        </li>
                    </ul>
                </li>

                <li>
                    <NavLink
                        className="main-menu-link"
                        to={process.env.PUBLIC_URL + "/about"}
                    >
                        About
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        className="main-menu-link"
                        to={process.env.PUBLIC_URL + "/contact"}
                    >
                        Contact
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default MainMenu;
