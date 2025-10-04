import React from "react";
import { NavLink } from "react-router-dom";

const base = process.env.PUBLIC_URL || "";

const MainMenu = () => {
  return (
    <nav>
      <ul className="main-menu">

        {/* =======================================================
            PERSONAL
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/Empleados`}
            className="main-menu-link"
            activeClassName="active"
          >
            Personal
          </NavLink>
          <ul className="sub-menu">

            {/* Empleados */}
            <li className="has-submenu">
              <ul>
                <li>
                  <NavLink to={`${base}/Empleados`} className="sub-menu-link">
                    Empleados
                  </NavLink>
                </li>
                <li>
                  <NavLink to={`${base}/Contratos`} className="sub-menu-link">
                    Contrato
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={`${base}/HistorialPuesto`}
                    className="sub-menu-link"
                  >
                    Historial de Puesto
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Equipo */}
            <li>
              <NavLink to={`${base}/Equipos`} className="sub-menu-link">
                Equipo
              </NavLink>
            </li>

            {/* Usuarios */}
            <li>
              <NavLink to={`${base}/Usuarios`} className="sub-menu-link">
                Usuarios
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            RECLUTAMIENTO
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/Convocatorias`}
            className="main-menu-link"
            activeClassName="active"
          >
            Reclutamiento
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink to={`${base}/Convocatorias`} className="sub-menu-link">
                Convocatorias
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Aspirantes`} className="sub-menu-link">
                Aspirantes
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Seleccion`} className="sub-menu-link">
                Selección / Contratación
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            INTEGRACIÓN
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/Induccion`}
            className="main-menu-link"
            activeClassName="active"
          >
            Integración
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink to={`${base}/Induccion`} className="sub-menu-link">
                Inducción
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Capacitacion`} className="sub-menu-link">
                Capacitación
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            DESEMPEÑO
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/EvaluacionCriterio`}
            className="main-menu-link"
            activeClassName="active"
          >
            Desempeño
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink to={`${base}/Evaluaciones`} className="sub-menu-link">
                Evaluaciones
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`${base}/CriterioEvaluacion`}
                className="sub-menu-link"
              >
                Criterios
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            CONTROL DISCIPLINARIO
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/Amonestacion`}
            className="main-menu-link"
            activeClassName="active"
          >
            Control Disciplinario
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink to={`${base}/Ausencia`} className="sub-menu-link">
                Ausencias
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Amonestacion`} className="sub-menu-link">
                Amonestaciones
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            AUXILIAR
        ======================================================== */}
        <li className="has-submenu">
          <NavLink
            to={`${base}/Puesto`}
            className="main-menu-link"
            activeClassName="active"
          >
            Auxiliar
          </NavLink>
          <ul className="sub-menu">
            <li>
              <NavLink to={`${base}/PuebloCultura`} className="sub-menu-link">
                Pueblos / Culturas
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Idiomas`} className="sub-menu-link">
                Idiomas
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Puesto`} className="sub-menu-link">
                Puestos
              </NavLink>
            </li>
            <li>
              <NavLink to={`${base}/Estados`} className="sub-menu-link">
                Estados
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
                to={`${base}/TerminacionLaboral`}
                className="sub-menu-link"
              >
                Terminación Laboral
              </NavLink>
            </li>
          </ul>
        </li>

        {/* =======================================================
            INFORMES
        ======================================================== */}
        <li>
          <NavLink
            to={`${base}/Informes`}
            className="main-menu-link"
            activeClassName="active"
          >
            Informes
          </NavLink>
        </li>

        {/* =======================================================
            DOCUMENTOS
        ======================================================== */}
        <li>
          <NavLink
            to={`${base}/Documentos`}
            className="main-menu-link"
            activeClassName="active"
          >
            Documentos
          </NavLink>
        </li>

      </ul>
    </nav>
  );
};

export default MainMenu;
