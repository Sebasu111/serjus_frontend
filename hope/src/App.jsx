import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import HomePage from "./pages/index";
import "./assets/css/bootstrap.min.css";
import "./assets/scss/style.scss";
import "./assets/css/icofont.css";
import "swiper/components/navigation/navigation.scss";
import "swiper/swiper.scss";
import "./assets/css/animate.css";
import "lightgallery.js/dist/css/lightgallery.css";
import "swiper/components/pagination/pagination.scss";

import AboutPage from "./pages/about";
import ServicePage from "./pages/service";
import ServiceDetails from "./templates/service-details";
import BlogPage from "./pages/blog";
import BlogDetailsPage from "./templates/blog-details";
import BlogCategory from "./templates/blog-category";
import BlogTag from "./templates/blog-tag";
import BlogDate from "./templates/blog-date";
import BlogAuthor from "./templates/blog-author";
import ContactPage from "./pages/contact";
import NavScrollTop from "./components/nav-scroll-top";

import IdiomasContainer from "./components/Idiomas/IdiomasContainer";
import EstadosContainer from "./components/Estados/EstadosContainer";
import PuestoContainer from "./components/Puesto/PuestoContainer";
import RolesContainer from "./components/Roles/RolesContainer";
import TiposDocContainer from "./components/TiposDocumento/TiposDocContainer";
import PuebloCulturaContainer from "./components/PuebloCultura/PuebloCulturaContainer";
import TerminacionLaboralContainer from "./components/TerminacionLaboral/TerminacionLaboralContainer";
import AmonestacionContainer from "./components/Amonestacion/AmonestacionContainer";
import AusenciaContainer from "./components/Ausencia/AusenciaContainer";
import CriterioEvaluacionContainer from "./components/CriterioEvaluacion/CriterioEvaluacionContainer";
import EvaluacionCriterioContainer from "./components/EvaluacionCriterio/EvaluacionCriterioContainer";

//1
import EmpleadosContainer from "./containers/empleados";
import HistorialPuestoContainer from "./containers/historial-puesto";
import ContratosContainer from "./containers/contratos";
import DocumentosContainer from "./containers/documentos";
//2
import AspirantesContainer from "./containers/aspirantes";
import ConvocatoriasContainer from "./containers/convocatorias";
import EvaluacionesContainer from "./containers/evaluaciones";
import EquiposContainer from "./containers/equipos";
import EmpleadoCapacitacionContainer from "./containers/empleado-capacitacion";
//3
import InduccionesContainer from "./containers/inducciones";
import InduccionDocumentosContainer from "./containers/induccion-documentos";
import PostulacionesContainer from "./containers/postulaciones";
import CapacitacionesContainer from "./containers/capacitaciones";
import UsuariosContainer from "./containers/usuarios";

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
                    <Route exact path={`${base}/`} component={HomePage} />
                    <Route path={`${base}/about`} component={AboutPage} />

                    {/* Gestión de datos */}
                    <Route
                        path={`${base}/Idiomas`}
                        component={IdiomasContainer}
                    />
                    <Route
                        path={`${base}/Estados`}
                        component={EstadosContainer}
                    />
                    <Route
                        path={`${base}/Puesto`}
                        component={PuestoContainer}
                    />
                    <Route path={`${base}/Roles`} component={RolesContainer} />
                    <Route
                        path={`${base}/TiposDocumento`}
                        component={TiposDocContainer}
                    />
                    <Route
                        path={`${base}/PuebloCultura`}
                        component={PuebloCulturaContainer}
                    />
                    <Route
                        path={`${base}/TerminacionLaboral`}
                        component={TerminacionLaboralContainer}
                    />
                    <Route
                        path={`${base}/Amonestacion`}
                        component={AmonestacionContainer}
                    />
                    <Route
                        path={`${base}/Ausencia`}
                        component={AusenciaContainer}
                    />
                    <Route
                        path={`${base}/CriterioEvaluacion`}
                        component={CriterioEvaluacionContainer}
                    />
                    <Route
                        path={`${base}/EvaluacionCriterio`}
                        component={EvaluacionCriterioContainer}
                    />

                    {/* 1 */}
                    <Route
                        exact
                        path={`${base}/Empleados`}
                        component={EmpleadosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/HistorialPuesto`}
                        component={HistorialPuestoContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Contratos`}
                        component={ContratosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Documentos`}
                        component={DocumentosContainer}
                    />
                    {/* 2 */}
                    <Route
                        exact
                        path={`${base}/Aspirantes`}
                        component={AspirantesContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Convocatorias`}
                        component={ConvocatoriasContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Evaluaciones`}
                        component={EvaluacionesContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Equipos`}
                        component={EquiposContainer}
                    />
                    <Route
                        exact
                        path={`${base}/EmpleadoCapacitacion`}
                        component={EmpleadoCapacitacionContainer}
                    />
                    {/* 3 */}
                    <Route
                        exact
                        path={`${base}/Inducciones`}
                        component={InduccionesContainer}
                    />
                    <Route
                        exact
                        path={`${base}/InduccionDocumentos`}
                        component={InduccionDocumentosContainer}
                    />
                    <Route
                        exact
                        path={`${base}/Usuarios`}
                        component={UsuariosContainer}
                    />

                    {/* Blog */}
                    <Route path={`${base}/blog`} component={BlogPage} />
                    <Route
                        path={`${base}/category/:slug`}
                        component={BlogCategory}
                    />
                    <Route path={`${base}/tag/:slug`} component={BlogTag} />
                    <Route path={`${base}/date/:date`} component={BlogDate} />
                    <Route
                        path={`${base}/author/:author`}
                        component={BlogAuthor}
                    />
                    <Route
                        path={`${base}/blog-details/:id`}
                        component={BlogDetailsPage}
                    />

                    {/* Otros */}
                    <Route path={`${base}/contact`} component={ContactPage} />
                </Switch>
            </NavScrollTop>
        </Router>
    );
};

export default App;
