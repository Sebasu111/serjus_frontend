import { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import ProtectedRoute from "./ProtectedRoute";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Estilos
import "./assets/css/bootstrap.min.css";
import "./assets/scss/style.scss";
import "./assets/css/icofont.css";
import "./assets/css/animate.css";
import "swiper/swiper-bundle.min.css";
import "lightgallery.js/dist/css/lightgallery.css";

// Páginas
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/Inicio";
import PerfilContainer from "./containers/perfil/PerfilContainer";
import FormUsuario from "./containers/usuarios/FormUsuario";
import ConvocatoriasPublicPage from "./ConvocatoriasPublicas/ConvocatoriasPublicPage";

// Containers
import EmpleadosContainer from "./containers/Empleados/EmpleadosContainer";
import ContratosContainer from "./containers/contratos/ContratosContainer";
import EquiposContainer from "./containers/Equipo/EquiposContainer";
import UsuariosContainer from "./containers/usuarios/UsuariosContainer";
import ConvocatoriasContainer from "./containers/convocatorias/ConvocatoriasContainer";
import PostulacionesContainer from "./containers/postulaciones/PostulacionesContainer";
import SeleccionContainer from "./containers/Seleccion/SeleccionContainer";
import InduccionContainer from "./containers/Induccion";
import CapacitacionContainer from "./containers/capacitacion/CapacitacionContainer";
import CriterioEvaluacionContainer from "./containers/CriterioEvaluacion/CriterioEvaluacionContainer";
import EvaluacionContainer from "./containers/Evaluaciones/EvaluacionContainer";
import EvaluacionCriterioContainer from "./containers/EvaluacionCriterio/EvaluacionCriterioContainer";
import AusenciaContainer from "./containers/Ausencia/AusenciaContainer";
import AmonestacionContainer from "./containers/Amonestacion/AmonestacionContainer";
import IdiomasContainer from "./containers/Idiomas/IdiomasContainer";
import EstadosContainer from "./containers/Estados/EstadosContainer";
import PuestoContainer from "./containers/Puesto/PuestoContainer";
import RolesContainer from "./containers/Roles/RolesContainer";
import TiposDocContainer from "./containers/TiposDocumento/TiposDocContainer";
import PuebloCulturaContainer from "./containers/PuebloCultura/PuebloCulturaContainer";
import TerminacionLaboralContainer from "./containers/TerminacionLaboral/TerminacionLaboralContainer";
import ReportesContainer from "./containers/Reportes/ReportesContainer";
import DocumentosContainer from "./containers/documentos/DocumentosContainer";
import Dashboard from "./containers/Dashboard/Dashboard";

import NavScrollTop from "./components/nav-scroll-top";
const base = process.env.PUBLIC_URL || "";

const App = () => {
    useEffect(() => {
        AOS.init({ offset: 80, duration: 1000, once: true, easing: "ease" });
        AOS.refresh();
    }, []);

    return (
        <Router>
            <NavScrollTop>
                <Switch>

                    {/* Público */}
                    <Route exact path={`${base}/`} component={LoginPage} />
                    <Route exact path={`${base}/Bolsadeempleo`} component={ConvocatoriasPublicPage} />
                    <ProtectedRoute exact path={`${base}/home`} component={HomePage} rolesPermitidos={[6,5,1,4,3,2]} />

                    {/* Perfil / usuario */}
                    <ProtectedRoute exact path={`${base}/perfil`} component={PerfilContainer} rolesPermitidos={[6,5,1,4,3,2]} />
                    <ProtectedRoute exact path={`${base}/cambiar-contrasena`} component={FormUsuario} rolesPermitidos={[6,5,1,4,3,2]} />

                    {/* Personal */}
                    <ProtectedRoute exact path={`${base}/Empleados`} component={EmpleadosContainer} rolesPermitidos={[1,6,4,5]} />
                    <ProtectedRoute exact path={`${base}/Contratos`} component={ContratosContainer} rolesPermitidos={[6,4,5]} />
                    <ProtectedRoute exact path={`${base}/Equipos`} component={EquiposContainer} rolesPermitidos={[6,1,5]} />
                    <ProtectedRoute exact path={`${base}/Usuarios`} component={UsuariosContainer} rolesPermitidos={[6,5]} />

                    {/* Reclutamiento */}
                    <ProtectedRoute exact path={`${base}/Convocatorias`} component={ConvocatoriasContainer} rolesPermitidos={[6,4,5]} />
                    <ProtectedRoute exact path={`${base}/Postulaciones`} component={PostulacionesContainer} rolesPermitidos={[6,1,5]} />
                    <ProtectedRoute exact path={`${base}/Seleccion`} component={SeleccionContainer} rolesPermitidos={[6,1,5]} />

                    {/* Integración */}
                    <ProtectedRoute exact path={`${base}/Induccion`} component={InduccionContainer} rolesPermitidos={[6,4,5]} />
                    <ProtectedRoute exact path={`${base}/Capacitacion`} component={CapacitacionContainer} rolesPermitidos={[6,1,4,5]} />

                    {/* Desempeño */}
                    <ProtectedRoute exact path={`${base}/Evaluaciones`} component={EvaluacionContainer} rolesPermitidos={[6,1,5,2,4,3]} />
                    <ProtectedRoute exact path={`${base}/EvaluacionCriterio`} component={EvaluacionCriterioContainer} rolesPermitidos={[6,1,5,2,4,3]} />
                    <ProtectedRoute exact path={`${base}/Criterios`} component={CriterioEvaluacionContainer} rolesPermitidos={[6,5]} />

                    {/* Control disciplinario */}
                    <ProtectedRoute exact path={`${base}/Ausencias`} component={AusenciaContainer} rolesPermitidos={[6,1,5,4]} />
                    <ProtectedRoute exact path={`${base}/Amonestaciones`} component={AmonestacionContainer} rolesPermitidos={[6,1,5]} />

                    {/* Catálogos / auxiliar */}
                    <ProtectedRoute exact path={`${base}/Idiomas`} component={IdiomasContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/Estados`} component={EstadosContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/Puesto`} component={PuestoContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/Roles`} component={RolesContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/TiposDocumento`} component={TiposDocContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/PuebloCultura`} component={PuebloCulturaContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/TerminacionLaboral`} component={TerminacionLaboralContainer} rolesPermitidos={[6,5]} />
                    <ProtectedRoute exact path={`${base}/Reportes`} component={ReportesContainer} rolesPermitidos={[6,5]} />

                    {/* Dashboard */}
                    <ProtectedRoute exact path={`${base}/Dashboard`} component={Dashboard} rolesPermitidos={[6,5]} />

                    {/* Documentos */}
                    <ProtectedRoute exact path={`${base}/Documentos`} component={DocumentosContainer} rolesPermitidos={[6,4,5]} />

                </Switch>
            </NavScrollTop>

            <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </Router>
    );
};

export default App;
