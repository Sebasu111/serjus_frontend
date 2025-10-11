import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Estilos globales
import "./assets/css/bootstrap.min.css";
import "./assets/scss/style.scss";
import "./assets/css/icofont.css";
import "./assets/css/animate.css";
import "swiper/swiper.scss";
import "swiper/components/navigation/navigation.scss";
import "swiper/components/pagination/pagination.scss";
import "lightgallery.js/dist/css/lightgallery.css";

// Páginas principales
import HomePage from "./pages/index";
import LoginPage from "./pages/LoginPage";


// Componentes generales
import NavScrollTop from "./components/nav-scroll-top";


// =============================================================
//   PERSONAL
// =============================================================
import EmpleadosContainer from "./containers/Empleados/EmpleadosContainer";
import ContratosContainer from "./containers/contratos";
import HistorialPuestoContainer from "./containers/historial-puesto";
import EquiposContainer from "./containers/Equipo/EquiposContainer";

import UsuariosContainer from "./containers/usuarios/UsuariosContainer";


// =============================================================
//   RECLUTAMIENTO
// =============================================================
import ConvocatoriasContainer from "./containers/convocatorias/ConvocatoriasContainer";
// import AspirantesContainer from "./containers/aspirantes";
// import SeleccionContainer from "./containers/seleccion";


// =============================================================
//   INTEGRACIÓN
// =============================================================
import CapacitacionContainer from "./components/capacitacion";
// import InduccionContainer from "./containers/induccion";


// =============================================================
//   DESEMPEÑO
// =============================================================
import CriterioEvaluacionContainer from "./components/CriterioEvaluacion/CriterioEvaluacionContainer";
import EvaluacionCriterioContainer from "./components/EvaluacionCriterio/EvaluacionCriterioContainer";


// =============================================================
//   CONTROL DISCIPLINARIO
// =============================================================
import AusenciaContainer from "./components/Ausencia/AusenciaContainer";
import AmonestacionContainer from "./components/Amonestacion/AmonestacionContainer";


// =============================================================
//   AUXILIAR (catálogos, tablas de apoyo, etc.)
// =============================================================
import IdiomasContainer from "./components/Idiomas/IdiomasContainer";
import EstadosContainer from "./components/Estados/EstadosContainer";
import PuestoContainer from "./components/Puesto/PuestoContainer";
import RolesContainer from "./components/Roles/RolesContainer";
import TiposDocContainer from "./components/TiposDocumento/TiposDocContainer";
import PuebloCulturaContainer from "./components/PuebloCultura/PuebloCulturaContainer";
import TerminacionLaboralContainer from "./components/TerminacionLaboral/TerminacionLaboralContainer";


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
            easing: "ease",
        });
        AOS.refresh();
    }, []);

    return (
        <Router>
            <NavScrollTop>
                <Switch>
                    {/*PÁGINAS PÚBLICAS*/}
                    <Route exact path={`${base}/`} component={LoginPage} />
                    <Route path={`${base}/home`} component={HomePage} />

                    {/*PERSONAL*/}
                    <Route
                        exact
                        path={`${base}/Empleados`}
                        component={EmpleadosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Contratos`}
                        component={ContratosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/HistorialPuesto`}
                        component={HistorialPuestoContainer}
                    />
                    {<Route exact path={`${base}/Equipos`} component={EquiposContainer} />}
                    <Route
                        exact
                        path={`${base}/Usuarios`}
                        component={UsuariosContainer}
                    />

                    {/*RECLUTAMIENTO*/}
                    {<Route exact path={`${base}/Convocatorias`} component={ConvocatoriasContainer} />}
                    {/* <Route exact path={`${base}/Aspirantes`} component={AspirantesContainer} /> */}
                    {/* <Route exact path={`${base}/Seleccion`} component={SeleccionContainer} /> */}

                    {/*INTEGRACIÓN*/}
                    {<Route exact path={`${base}/Capacitacion`} component={CapacitacionContainer} />}
                    {/* <Route exact path={`${base}/Induccion`} component={InduccionContainer} /> */}

                    {/*DESEMPEÑO*/}
                    <Route
                        exact
                        path={`${base}/CriterioEvaluacion`}
                        component={CriterioEvaluacionContainer}
                    />
                    <Route
                        exact
                        path={`${base}/EvaluacionCriterio`}
                        component={EvaluacionCriterioContainer}
                    />

                    {/*CONTROL DISCIPLINARIO*/}
                    <Route
                        exact
                        path={`${base}/Ausencia`}
                        component={AusenciaContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Amonestacion`}
                        component={AmonestacionContainer}
                    />

                    {/*AUXILIAR (Catálogos y tablas de apoyo)*/}
                    <Route
                        exact
                        path={`${base}/Idiomas`}
                        component={IdiomasContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Estados`}
                        component={EstadosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Puesto`}
                        component={PuestoContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Roles`}
                        component={RolesContainer}
                    />
                    <Route
                        exact
                        path={`${base}/TiposDocumento`}
                        component={TiposDocContainer}
                    />
                    <Route
                        exact
                        path={`${base}/PuebloCultura`}
                        component={PuebloCulturaContainer}
                    />
                    <Route
                        exact
                        path={`${base}/TerminacionLaboral`}
                        component={TerminacionLaboralContainer}
                    />

                    {/*DOCUMENTOS*/}
                    <Route
                        exact
                        path={`${base}/Documentos`}
                        component={DocumentosContainer}
                    />
                </Switch>
            </NavScrollTop>
        </Router>
    );
};

export default App;
