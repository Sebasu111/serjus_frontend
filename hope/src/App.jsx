import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Estilos globales
import "./assets/css/bootstrap.min.css";
import "./assets/scss/style.scss";
import "./assets/css/icofont.css";
import "./assets/css/animate.css";
import "swiper/swiper-bundle.min.css";
import "lightgallery.js/dist/css/lightgallery.css";

//formulario
import FormUsuario from "../src/containers/usuarios/FormUsuario";

// Páginas principales
import HomePage from "./pages/Inicio";
import LoginPage from "./pages/LoginPage";

//Perfil.
import PerfilContainer from "./containers/perfil/PerfilContainer";

// Componentes generales
import NavScrollTop from "./components/nav-scroll-top";

// ============================================================
// ConvocatoriasPublicas
// ============================================================
import ConvocatoriasPublicPage from "./ConvocatoriasPublicas/ConvocatoriasPublicPage";

// =============================================================
//   PERSONAL
// =============================================================
import EmpleadosContainer from "./containers/Empleados/EmpleadosContainer";
import ContratosContainer from "./containers/contratos/ContratosContainer";
import EquiposContainer from "./containers/Equipo/EquiposContainer";
import UsuariosContainer from "./containers/usuarios/UsuariosContainer";

// =============================================================
//   RECLUTAMIENTO
// =============================================================
import ConvocatoriasContainer from "./containers/convocatorias/ConvocatoriasContainer";
import PostulacionesContainer from "./containers/postulaciones/PostulacionesContainer";
// import AspirantesContainer from "./containers/aspirantes";
// import SeleccionContainer from "./containers/seleccion";

// =============================================================
//   INTEGRACIÓN
// =============================================================
import CapacitacionContainer from "./containers/capacitacion/CapacitacionContainer";
import InduccionContainer from "./containers/Induccion";

// =============================================================
//   DESEMPEÑO
// =============================================================
import CriterioEvaluacionContainer from "./containers/CriterioEvaluacion/CriterioEvaluacionContainer";
import EvaluacionCriterioContainer from "./containers/EvaluacionCriterio/EvaluacionCriterioContainer";
import EvaluacionContainer from "./containers/Evaluaciones/EvaluacionContainer";

// =============================================================
//   CONTROL DISCIPLINARIO
// =============================================================
import AusenciaContainer from "./containers/Ausencia/AusenciaContainer";
import AmonestacionContainer from "./containers/Amonestacion/AmonestacionContainer";

// =============================================================
//   Seleccion/Contratacion
// =============================================================
import SeleccionContainer from "./containers/Seleccion/SeleccionContainer";

// =============================================================
//   AUXILIAR (catálogos, tablas de apoyo, etc.)
// =============================================================
import IdiomasContainer from "./containers/Idiomas/IdiomasContainer";
import EstadosContainer from "./containers/Estados/EstadosContainer";
import PuestoContainer from "./containers/Puesto/PuestoContainer";
import RolesContainer from "./containers/Roles/RolesContainer";
import TiposDocContainer from "./containers/TiposDocumento/TiposDocContainer";
import PuebloCulturaContainer from "./containers/PuebloCultura/PuebloCulturaContainer";
import TerminacionLaboralContainer from "./containers/TerminacionLaboral/TerminacionLaboralContainer";

// =============================================================
//   INFORMES (pendiente)
// =============================================================
// import InformesContainer from "./containers/informes";

// =============================================================
//   DOCUMENTOS
// =============================================================
import DocumentosContainer from "./containers/documentos/DocumentosContainer";

// =============================================================
// APP PRINCIPAL
// =============================================================
const base = process.env.PUBLIC_URL || "";

const App = () => {
    useEffect(() => {
        AOS.init({
            offset: 80,
            duration: 1000,
            once: true,
            easing: "ease"
        });
        AOS.refresh();
    }, []);

    return (
        <Router>
            <NavScrollTop>
                <Switch>
                    {/*Publico*/}
                    <Route exact path={`${base}/Bolsadeempleo`} component={ConvocatoriasPublicPage} />

                    {/*Perfil*/}
                    <Route exact path={`${base}/perfil`} component={PerfilContainer} />

                    {/*Cambiar Contraseña*/}
                    <Route exact path={`${base}/cambiar-contrasena`} component={FormUsuario} />

                    {/*PÁGINAS PÚBLICAS*/}
                    <Route exact path={`${base}/`} component={LoginPage} />
                    <Route path={`${base}/home`} component={HomePage} />

                    {/*PERSONAL*/}
                    <Route exact path={`${base}/Empleados`} component={EmpleadosContainer} />
                    <Route exact path={`${base}/Contratos`} component={ContratosContainer} />
                    <Route exact path={`${base}/Equipos`} component={EquiposContainer} />
                    <Route exact path={`${base}/Usuarios`} component={UsuariosContainer} />

                    {/*RECLUTAMIENTO*/}
                    <Route exact path={`${base}/Convocatorias`} component={ConvocatoriasContainer} />
                    <Route exact path={`${base}/Postulaciones`} component={PostulacionesContainer} />
                    <Route exact path={`${base}/Seleccion`} component={SeleccionContainer} />

                    {/*INTEGRACIÓN*/}
                    <Route exact path={`${base}/Capacitacion`} component={CapacitacionContainer} />
                    <Route exact path={`${base}/Induccion`} component={InduccionContainer} />

                    {/*DESEMPEÑO*/}
                    <Route exact path={`${base}/CriterioEvaluacion`} component={CriterioEvaluacionContainer} />
                    <Route exact path={`${base}/EvaluacionCriterio`} component={EvaluacionCriterioContainer} />
                    <Route exact path={`${base}/Evaluaciones`} component={EvaluacionContainer} />

                    {/*CONTROL DISCIPLINARIO*/}
                    <Route exact path={`${base}/Ausencias`} component={AusenciaContainer} />
                    <Route exact path={`${base}/Amonestaciones`} component={AmonestacionContainer} />

                    {/*AUXILIAR (Catálogos y tablas de apoyo)*/}
                    <Route exact path={`${base}/Idiomas`} component={IdiomasContainer} />
                    <Route exact path={`${base}/Estados`} component={EstadosContainer} />
                    <Route exact path={`${base}/Puesto`} component={PuestoContainer} />
                    <Route exact path={`${base}/Roles`} component={RolesContainer} />
                    <Route exact path={`${base}/TiposDocumento`} component={TiposDocContainer} />
                    <Route exact path={`${base}/PuebloCultura`} component={PuebloCulturaContainer} />
                    <Route exact path={`${base}/TerminacionLaboral`} component={TerminacionLaboralContainer} />

                    {/*DOCUMENTOS*/}
                    <Route exact path={`${base}/Documentos`} component={DocumentosContainer} />
                </Switch>
            </NavScrollTop>

            {/* ToastContainer global para todas las notificaciones */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </Router>
    );
};

export default App;
