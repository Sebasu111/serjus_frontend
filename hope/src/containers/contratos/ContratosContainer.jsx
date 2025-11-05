import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import ContratoEditor from "./ContratoEditor.jsx";
import ContratoForm from "./ContratoForm.jsx";
import ContratosTable from "./ContratosTable.jsx";
import html2pdf from "html2pdf.js";
import { showPDFToasts } from "../../utils/toast.js";
import { buildApiUrl, API_CONFIG } from "../../config/api.js";

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
    const [empleados, setEmpleados] = useState([]);
    const [historialPuestos, setHistorialPuestos] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(document.body.classList.contains('sidebar-collapsed'));
    const [vistaActual, setVistaActual] = useState('crear'); // 'crear' o 'listar'
    const [data, setData] = useState({
        empleadoSeleccionado: "",
        idHistorialPuesto: "",
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
        fetchEmpleados();
        fetchHistorialPuestos();

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
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.PUESTOS);
            console.log("Cargando puestos desde:", apiUrl);
            const response = await axios.get(apiUrl);
            const puestosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setPuestos(puestosData);
        } catch (error) {
            console.error("Error al cargar puestos:", error);
            setPuestos([]);
        }
    };

    const fetchEmpleados = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.EMPLEADOS);
            console.log("Cargando empleados desde:", apiUrl);
            const response = await axios.get(apiUrl);
            console.log("Respuesta empleados completa:", response.data);
            const empleadosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            console.log("Empleados procesados:", empleadosData.length, empleadosData);
            setEmpleados(empleadosData);
        } catch (error) {
            console.error("Error al cargar empleados:", error.response?.data || error.message);
            setEmpleados([]);
        }
    };

    const fetchHistorialPuestos = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.HISTORIALPUESTO);
            console.log("Cargando historial de puestos desde:", apiUrl);
            const response = await axios.get(apiUrl);
            console.log("Respuesta historial completa:", response.data);
            const historialData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            console.log("Historial procesado:", historialData.length, historialData);
            setHistorialPuestos(historialData);
        } catch (error) {
            console.error("Error al cargar historial de puestos:", error.response?.data || error.message);
            setHistorialPuestos([]);
        }
    };



    const onChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const limpiarFormulario = () => {
        setData({
            empleadoSeleccionado: "",
            idHistorialPuesto: "",
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
    };

    // Función para guardar el contrato en la base de datos
    const guardarContrato = async (contratoData) => {
        try {
            console.log("💾 Guardando contrato en la base de datos...", contratoData);

            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.CONTRATOS);
            const response = await axios.post(apiUrl, contratoData);
            console.log("✅ Contrato guardado exitosamente:", response.data);

            // Mostrar mensaje de éxito
            showPDFToasts.success("Contrato guardado exitosamente en la base de datos");

            return response.data;
        } catch (error) {
            console.error("❌ Error al guardar contrato:", error);
            showPDFToasts.error("Error al guardar el contrato en la base de datos");
            throw error;
        }
    };

    const handlePrint = async () => {
        try {
            setGenerandoPDF(true);
            showPDFToasts.generando();

            // Validar que se haya seleccionado un empleado (por historial o directo)
            if (!data.idHistorialPuesto && !data.empleadoSeleccionado) {
                throw new Error("Debe seleccionar un colaborador");
            }

            // Validar otros campos obligatorios
            const camposObligatorios = [
                'nombreTrabajadora', 'fechaInicio', 'fechaContrato', 'puesto',
                'salario', 'sueldoOrdinario', 'bonificacion'
            ]; const camposFaltantes = camposObligatorios.filter(campo => !data[campo]);

            if (camposFaltantes.length > 0) {
                throw new Error(`Faltan los siguientes campos: ${camposFaltantes.join(', ')}`);
            }

            // Preparar los datos del contrato para guardar en la base de datos
            const contratoParaGuardar = {
                fechainicio: data.fechaInicio,
                fechafin: null, // Por tiempo indefinido
                fechafirma: data.fechaContrato,
                tipocontrato: "Indefinido", // Según el contrato es por tiempo indefinido
                estado: true,
                idusuario: 1, // Temporalmente hardcodeado, debería venir del usuario logueado
                // Usar historial de puesto si está disponible, sino null
                idhistorialpuesto: data.idHistorialPuesto || null,
                // Campos adicionales para casos donde no hay historial
                ...((!data.idHistorialPuesto && data.empleadoSeleccionado) && {
                    empleado_id_temp: data.empleadoSeleccionado,
                    empleado_nombre_temp: data.nombreTrabajadora,
                    puesto_nombre_temp: data.puesto,
                })
            };

            // Guardar en la base de datos primero
            await guardarContrato(contratoParaGuardar);

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

            // Preguntar si desea limpiar el formulario para crear un nuevo contrato
            setTimeout(() => {
                if (window.confirm('¿Desea limpiar el formulario para crear un nuevo contrato?')) {
                    limpiarFormulario();
                }
            }, 2000);

        } catch (error) {
            console.error("Error al generar/guardar contrato:", error);
            setGenerandoPDF(false);
            showPDFToasts.error(error.message || "Error al procesar el contrato");
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
                        {/* Pestañas de navegación */}
                        <div style={{
                            borderBottom: "2px solid #e0e0e0",
                            backgroundColor: "#f8f9fa",
                            padding: "0 20px"
                        }}>
                            <div style={{ display: "flex", gap: "0" }}>
                                <button
                                    onClick={() => setVistaActual('crear')}
                                    style={{
                                        padding: "12px 24px",
                                        border: "none",
                                        backgroundColor: vistaActual === 'crear' ? "#023047" : "transparent",
                                        color: vistaActual === 'crear' ? "white" : "#023047",
                                        cursor: "pointer",
                                        borderBottom: vistaActual === 'crear' ? "2px solid #023047" : "2px solid transparent",
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: "600",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Crear Contrato
                                </button>
                                <button
                                    onClick={() => setVistaActual('listar')}
                                    style={{
                                        padding: "12px 24px",
                                        border: "none",
                                        backgroundColor: vistaActual === 'listar' ? "#023047" : "transparent",
                                        color: vistaActual === 'listar' ? "white" : "#023047",
                                        cursor: "pointer",
                                        borderBottom: vistaActual === 'listar' ? "2px solid #023047" : "2px solid transparent",
                                        fontFamily: '"Inter", sans-serif',
                                        fontWeight: "600",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    Ver Contratos
                                </button>
                            </div>
                        </div>

                        {/* Contenido según la vista seleccionada */}
                        {vistaActual === 'crear' ? (
                            <div style={{
                                display: "flex",
                                height: "calc(100vh - 130px)", // Ajustado por la altura de las pestañas
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
                                        empleados={empleados}
                                        historialPuestos={historialPuestos}
                                        departamentos={DEPARTAMENTOS_GT}
                                        limpiarFormulario={limpiarFormulario}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                height: "calc(100vh - 130px)", // Ajustado por la altura de las pestañas
                                overflow: "auto",
                                backgroundColor: "#fff"
                            }}>
                                <ContratosTable />
                            </div>
                        )}
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

            </div>
        </Layout>
    );
};

export default ContratosContainer;

