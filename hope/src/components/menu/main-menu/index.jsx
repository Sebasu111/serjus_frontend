import React from "react";
import { NavLink } from "react-router-dom";

const base = process.env.PUBLIC_URL || "";

const MainMenu = () => {
  return (
    <nav>
      <ul className="main-menu">
        <li>
          <NavLink
            exact
            to="/"
            className="main-menu-link"
            activeClassName="active"
          >
            Home
          </NavLink>
        </li>

        <li className="has-submenu">
          <NavLink
            to={`${base}`}
            className="main-menu-link"
            activeClassName="active"
            exact
          >
            Gestión de Datos
          </NavLink>

          <ul className="sub-menu">
            <li>
              <NavLink
                to={`${base}/Idiomas`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Idiomas
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/Estados`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Estados
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/Puesto`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Puesto
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/Roles`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Roles
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/TiposDocumento`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Tipos de Documentos
              </NavLink>
            </li>
          </ul>
        </li>

        {/* Nuevos */}
        <li>
          <NavLink
            to={`${base}/Empleados`}
            className="main-menu-link"
            activeClassName="active"
          >
            Empleados
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${base}/HistorialPuesto`}
            className="main-menu-link"
            activeClassName="active"
          >
            Historial de Puestos
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${base}/Contratos`}
            className="main-menu-link"
            activeClassName="active"
          >
            Contratos
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${base}/Documentos`}
            className="main-menu-link"
            activeClassName="active"
          >
            Documentos
          </NavLink>
        </li>

        <li className="has-submenu">
          <NavLink
            to={`${base}/blog`}
            className="main-menu-link"
            activeClassName="active"
          >
            Blog
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink
                to={`${base}/blog`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Blog list
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/blog-details/1`}
                className="sub-menu-link"
                activeClassName="active"
              >
                Blog Details
              </NavLink>
            </li>
          </ul>
        </li>

        <li>
          <NavLink
            to={`${base}/about`}
            className="main-menu-link"
            activeClassName="active"
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink
            to={`${base}/contact`}
            className="main-menu-link"
            activeClassName="active"
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default MainMenu;
