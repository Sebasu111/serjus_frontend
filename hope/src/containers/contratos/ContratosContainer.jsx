import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import ContratoEditor from "./ContratoEditor.jsx";
import ContratoForm from "./ContratoForm.jsx";
import html2pdf from "html2pdf.js";
import { showPDFToasts } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const DEPARTAMENTOS_GT = [
    "Alta Verapaz",
    "Baja Verapaz",
    "Chimaltenango",
    "Chiquimula",
    "El Progreso",
    "Escuintla",
    "Guatemala",
    "Huehuetenango",
    "Izabal",
    "Jalapa",
    "Jutiapa",
    "Petén",
    "Quetzaltenango",
    "Quiché",
    "Retalhuleu",
    "Sacatepéquez",
    "San Marcos",
    "Santa Rosa",
    "Sololá",
    "Suchitepéquez",
    "Totonicapán",
    "Zacapa"
];

const ContratosContainer = () => {
    const [generandoPDF, setGenerandoPDF] = useState(false);
    const [puestos, setPuestos] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(document.body.classList.contains('sidebar-collapsed'));
    const [data, setData] = useState({
        nombreEmpleadora: "",
        edadEmpleadora: "",
        sexoEmpleadora: "",
        estadoCivilEmpleadora: "",
        direccionEmpleadora: "",
        dpiEmpleadora: "",
        nombreEntidad: "",
        direccionEntidad: "",
        nombreTrabajadora: "",
        edadTrabajadora: "",
        sexoTrabajadora: "",
        estadoCivilTrabajadora: "",
        direccionTrabajadora: "",
        dpiTrabajadora: "",
        residenciaTrabajadora: "",
        departamentoTrabajadora: "",
        fechaInicio: "",
        puesto: "",
        funciones: "",
        lugarServicios: "",
        salario: "",
        sueldoOrdinario: "",
        bonificacion: "",
        banco: "",
        fechaContrato: ""
    });

    // Aquí definimos el ref
    const editorRef = useRef();

    useEffect(() => {
        fetchPuestos();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Observer para detectar cambios en las clases del body (sidebar collapse)
        const observerCallback = (mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setSidebarCollapsed(document.body.classList.contains('sidebar-collapsed'));
                }
            });
        };

        const observer = new MutationObserver(observerCallback);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    const fetchPuestos = async () => {
        try {
            console.log("🔄 Cargando puestos desde:", `${API}/puestos/`);
            const response = await axios.get(`${API}/puestos/`);
            console.log("📄 Respuesta completa:", response.data);
            const puestosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            console.log("📋 Puestos procesados:", puestosData);
            setPuestos(puestosData);
        } catch (error) {
            console.error("❌ Error al cargar puestos:", error);
            setPuestos([]);
        }
    };



    const onChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handlePrint = async () => {
        try {
            setGenerandoPDF(true);
            showPDFToasts.generando();

            const content = document.getElementById("printable");
            if (!content) {
                throw new Error("No se encontró el contenido a imprimir");
            }

            // Guardamos los estilos originales
            const inputs = content.querySelectorAll(".input-field");
            const originalStyles = [];
            inputs.forEach((el, i) => {
                originalStyles[i] = {
                    background: el.style.background,
                    border: el.style.border,
                    boxShadow: el.style.boxShadow,
                    padding: el.style.padding
                };
                el.style.background = "transparent";
                el.style.border = "none";
                el.style.boxShadow = "none";
                el.style.padding = "0";
            });

            const opt = {
                margin: [20, 20, 20, 20],
                filename: "Contrato_Individual_de_Trabajo.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };

            // Envolver html2pdf en una promesa
            await new Promise((resolve, reject) => {
                html2pdf()
                    .set(opt)
                    .from(content)
                    .save()
                    .then(() => {
                        // Restauramos estilos originales
                        inputs.forEach((el, i) => {
                            el.style.background = originalStyles[i].background;
                            el.style.border = originalStyles[i].border;
                            el.style.boxShadow = originalStyles[i].boxShadow;
                            el.style.padding = originalStyles[i].padding;
                        });
                        // Simular tiempo de procesamiento y descarga
                        setTimeout(() => {
                            resolve();
                        }, 1200);
                    })
                    .catch(reject);
            });

            setGenerandoPDF(false);
            showPDFToasts.descargado();

        } catch (error) {
            console.error("Error al generar contrato:", error);
            setGenerandoPDF(false);
            showPDFToasts.error();
        }
    };

    return (
        <Layout>
            <SEO title="Contratos" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            backgroundColor: "#fff",
                            padding: "0",
                            minHeight: "calc(100vh - 80px)",
                            marginLeft: isMobile ? "0" : (sidebarCollapsed ? "90px" : "300px"),
                            transition: "margin-left 0.3s ease"
                        }}
                    >
                        <div style={{
                            display: "flex",
                            height: "calc(100vh - 80px)",
                            gap: "2px",
                            maxWidth: sidebarCollapsed ? "calc(100vw - 90px)" : "calc(100vw - 300px)",
                            width: "100%",
                            margin: "0",
                            flexDirection: isMobile ? "column" : "row"
                        }}>
                            {/* Editor de Contrato - 70% */}
                            <div style={{
                                flex: isMobile ? "1" : "0 0 70%",
                                backgroundColor: "#fff",
                                overflow: "auto",
                                minHeight: isMobile ? "400px" : "100%",
                                padding: "8px"
                            }}>
                                <div style={{
                                    transform: isMobile ? "scale(0.88)" : (sidebarCollapsed ? "scale(1.05)" : "scale(1)"),
                                    transformOrigin: "top left",
                                    width: isMobile ? "114%" : (sidebarCollapsed ? "95%" : "100%")
                                }}>
                                    <ContratoEditor ref={editorRef} data={data} />
                                </div>
                            </div>

                            {/* Formulario - 30% */}
                            <div style={{
                                flex: isMobile ? "1" : "0 0 30%",
                                backgroundColor: "#f8f9fa",
                                padding: "15px",
                                overflow: "auto",
                                borderLeft: isMobile ? "none" : "1px solid #e0e0e0"
                            }}>
                                <ContratoForm
                                    data={data}
                                    onChange={onChange}
                                    imprimirContrato={handlePrint}
                                    generandoPDF={generandoPDF}
                                    puestos={puestos}
                                    departamentos={DEPARTAMENTOS_GT}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

            </div>
        </Layout>
    );
};

export default ContratosContainer;

