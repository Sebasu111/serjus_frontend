import { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

// Estilos
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
import AboutPage from "./pages/about";
import ServicePage from "./pages/service";
import ContactPage from "./pages/contact";
import BlogPage from "./pages/blog";

// Templates
import ServiceDetails from "./templates/service-details";
import BlogDetailsPage from "./templates/blog-details";
import BlogCategory from "./templates/blog-category";
import BlogTag from "./templates/blog-tag";
import BlogDate from "./templates/blog-date";
import BlogAuthor from "./templates/blog-author";

// Componentes generales
import NavScrollTop from "./components/nav-scroll-top";

// Gestión de catálogos
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

// Gestión de empleados
import EmpleadosContainer from "./containers/empleados";
import HistorialPuestoContainer from "./containers/historial-puesto";
import ContratosContainer from "./containers/contratos";
import DocumentosContainer from "./containers/documentos";

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
                    {/* Páginas principales */}
                    <Route exact path={`${base}/`} component={HomePage} />

                    {/* Gestión de catálogos */}
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

                    {/* Gestión de empleados */}
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
                </Switch>
            </NavScrollTop>
        </Router>
    );
};

export default App;
