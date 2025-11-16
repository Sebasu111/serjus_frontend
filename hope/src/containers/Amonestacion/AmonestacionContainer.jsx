import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import CartaLlamadaAtencion from "./CartaLlamadaAtencion.jsx";
import AmonestacionForm from "./AmonestacionForm.jsx";
import AmonestacionTable from "./AmonestacionTable.jsx";
import SubirCartaModal from "./SubirCartaModal.jsx";
import html2pdf from "html2pdf.js";
import axios from "axios";
import { showToast, showPDFToasts } from "../../utils/toast.js";
import { crearAmonestacion } from "../Amonestacion/AmonestaciónService.js";

const API = process.env.REACT_APP_API_URL;

const AmonestacionesContainer = () => {
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [vistaActual, setVistaActual] = useState("crear");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    document.body.classList.contains("sidebar-collapsed")
  );

  const [empleados, setEmpleados] = useState([]); // Todos los empleados (colaboradores)
  const [responsables, setResponsables] = useState([]); // Solo los que tienen ciertos roles
  const [amonestaciones, setAmonestaciones] = useState([]);

  const [data, setData] = useState({
    dia: "",
    mes: "",
    anio: "",
    nombreTrabajador: "",
    puesto: "",
    descripcionHecho: "",
    tipoFalta: "",
    articuloReglamento: "",
    descripcionArticuloReglamento: "",
    articuloCodigoTrabajo: "",
    descripcionArticuloCodigoTrabajo: "",
    plazoDias: "",
    nombreResponsable: "",
    cargoResponsable: "",
  });

  const [mostrarModalCarta, setMostrarModalCarta] = useState(false);
  const [amonestacionSeleccionada, setAmonestacionSeleccionada] = useState(null);
  const [archivoCarta, setArchivoCarta] = useState(null);
  const editorRef = useRef();

  // 🧠 Detectar resize y cambios de sidebar
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
        }
      });
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  // 🔹 Cuando se entra a la vista de listar, carga datos
  // 🔹 Cuando se entra a la vista de crear o listar, carga empleados y responsables
useEffect(() => {
  if (vistaActual === "crear" || vistaActual === "listar") {
    fetchEmpleadosPorRol(); // Carga empleados y responsables
  }

  if (vistaActual === "listar") {
    fetchAmonestaciones(); // Solo carga amonestaciones en listar
  }
}, [vistaActual]);


  // 🔹 Obtener amonestaciones
  const fetchAmonestaciones = async () => {
    try {
      const res = await axios.get(`${API}/amonestaciones/`);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setAmonestaciones(data);
    } catch (error) {
      showToast("Error al cargar las amonestaciones", "error");
    }
  };

  const handleCartaActualizada = async () => {
  await fetchAmonestaciones(); // refresca la lista
  if (amonestacionSeleccionada) {
    // vuelve a abrir el modal actualizado para ver el nuevo archivo
    const actualizada = await axios.get(
      `${API}/amonestaciones/${amonestacionSeleccionada.idamonestacion}/`
    );
    setAmonestacionSeleccionada(actualizada.data);
  }
};

  // 🔹 Un solo método para obtener empleados y filtrar responsables
  const fetchEmpleadosPorRol = async (rolesPermitidos = [1, 5]) => {
    try {
      const [resEmpleados, resUsuarios] = await Promise.all([
        axios.get(`${API}/empleados/`),
        axios.get(`${API}/usuarios/`),
      ]);

      const empleadosData = Array.isArray(resEmpleados.data.results)
        ? resEmpleados.data.results
        : resEmpleados.data;

      const usuariosData = Array.isArray(resUsuarios.data.results)
        ? resUsuarios.data.results
        : resUsuarios.data;

      // 🔹 Todos los empleados para colaboradores
      setEmpleados(empleadosData);
       console.log("Empleados (todos):", empleadosData);

      // 🔹 Filtrar responsables por roles permitidos
      const responsablesFiltrados = empleadosData.filter((emp) => {
        const usuario = usuariosData.find(
          (u) => u.idempleado === emp.idempleado || u.id_empleado === emp.idempleado
        );
        return usuario && rolesPermitidos.includes(usuario.idrol);
      });

      setResponsables(responsablesFiltrados);
      console.log("Responsables (según rol):", responsablesFiltrados);
    } catch (error) {
      showToast("Error al cargar empleados o usuarios", "error");
    }
  };

  const abrirModalCarta = (amonestacion) => {
    setAmonestacionSeleccionada(amonestacion);
    setArchivoCarta(null);
    setMostrarModalCarta(true);
  };

  const cerrarModalCarta = () => {
    setMostrarModalCarta(false);
    setAmonestacionSeleccionada(null);
    setArchivoCarta(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    const fecha = new Date();
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];

    setData({
      dia: fecha.getDate(),
      mes: meses[fecha.getMonth()],
      anio: fecha.getFullYear(),
      nombreTrabajador: "",
      puesto: "",
      descripcionHecho: "",
      tipoFalta: "",
      articuloReglamento: "",
      descripcionArticuloReglamento: "",
      articuloCodigoTrabajo: "",
      descripcionArticuloCodigoTrabajo: "",
      plazoDias: "",
      nombreResponsable: "",
      cargoResponsable: "",
    });
  };

  // 🔹 Generar carta PDF y guardar registro
  const handlePrint = async () => {
    try {
      setGenerandoPDF(true);
      showPDFToasts.generando();

      const hoy = new Date();
      const fechaLocal = hoy.toLocaleDateString("en-CA");

      const nuevaAmonestacion = {
        idEmpleado: data.idEmpleado,
        tipo: data.tipoFalta,
        motivo: data.descripcionHecho,
        fechaAmonestacion: fechaLocal,
        idDocumento: 0,
        idUsuario: localStorage.getItem("idUsuario") || 1,
      };

      await crearAmonestacion(nuevaAmonestacion);

      const content = document.getElementById("printable");
      if (!content) throw new Error("No se encontró el contenido a imprimir");

      const inputs = content.querySelectorAll(".input-field");
      const originalStyles = [];
      inputs.forEach((el, i) => {
        originalStyles[i] = {
          background: el.style.background,
          border: el.style.border,
          boxShadow: el.style.boxShadow,
          padding: el.style.padding,
        };
        el.style.background = "transparent";
        el.style.border = "none";
        el.style.boxShadow = "none";
        el.style.padding = "0";
      });

      const opt = {
        margin: [20, 20, 20, 20],
        filename: `Carta_Llamada_Atencion_${data.nombreTrabajador || "empleado"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(content).save();

      showPDFToasts.descargado();
      limpiarFormulario();
    } catch (error) {
      showPDFToasts.error(error.message || "Error al generar la carta");
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <Layout>
      <SEO title="Amonestaciones" />
      <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <main
            className="main-content site-wrapper-reveal"
            style={{
              flex: 1,
              backgroundColor: "#fff",
              padding: 0,
              minHeight: "calc(100vh - 80px)",
              marginLeft: isMobile ? "0" : sidebarCollapsed ? "90px" : "300px",
              transition: "margin-left 0.3s ease",
              width: `calc(100vw - ${
                isMobile ? "0px" : sidebarCollapsed ? "90px" : "300px"
              })`,
              overflow: "hidden",
            }}
          >
            {/* 🔹 Botones de navegación */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                padding: vistaActual === "crear" ? "0 20px" : "0",
              }}
            >
              <div style={{ display: "flex", marginLeft: vistaActual === "listar" ? "20px" : "0" }}>
                <button
                  onClick={() => setVistaActual("crear")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "crear" ? "#023047" : "transparent",
                    color: vistaActual === "crear" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "crear" ? "2px solid #023047" : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Crear Amonestación
                </button>
                <button
                  onClick={() => setVistaActual("listar")}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    backgroundColor: vistaActual === "listar" ? "#023047" : "transparent",
                    color: vistaActual === "listar" ? "white" : "#023047",
                    cursor: "pointer",
                    borderBottom:
                      vistaActual === "listar" ? "2px solid #023047" : "2px solid transparent",
                    fontWeight: "600",
                  }}
                >
                  Ver Amonestaciones
                </button>
              </div>
            </div>

            {/* 🔹 Contenido principal */}
            {vistaActual === "crear" ? (
              <div
                style={{
                  display: "flex",
                  height: "calc(100vh - 130px)",
                  gap: "2px",
                  maxWidth: sidebarCollapsed ? "calc(100vw - 90px)" : "calc(100vw - 300px)",
                  width: "100%",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <div
                  style={{
                    flex: isMobile ? "1" : "0 0 70%",
                    backgroundColor: "#fff",
                    overflow: "auto",
                    padding: "8px",
                  }}
                >
                  <div
                    style={{
                      transform: isMobile
                        ? "scale(0.88)"
                        : sidebarCollapsed
                        ? "scale(1.05)"
                        : "scale(1)",
                      transformOrigin: "top left",
                      width: isMobile ? "114%" : sidebarCollapsed ? "95%" : "100%",
                    }}
                  >
                    <CartaLlamadaAtencion ref={editorRef} data={data} />
                  </div>
                </div>

                <AmonestacionForm
                  data={data}
                  onChange={onChange}
                  onPrint={handlePrint}
                  generandoPDF={generandoPDF}
                  limpiarFormulario={limpiarFormulario}
                  empleados={empleados}
                  responsables={responsables}
                />
              </div>
            ) : (
              <>
                <AmonestacionTable
                  amonestaciones={amonestaciones}
                  empleados={empleados}
                  onSubirCarta={abrirModalCarta}
                />

                {/* Modal de subir carta */}
                {mostrarModalCarta && (
                  <SubirCartaModal
                    isOpen={mostrarModalCarta}
                    onClose={cerrarModalCarta}
                    amonestacion={amonestacionSeleccionada}
                    onFileChange={setArchivoCarta}
                    archivo={archivoCarta}
                    onActualizado={handleCartaActualizada}
                  />
                )}
              </>
            )}
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </div>
    </Layout>
  );
};

export default AmonestacionesContainer;
