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
import { ToastContainer } from "react-toastify";

const API = "http://127.0.0.1:8000/api";

const ContratosContainer = () => {
  const [form, setForm] = useState({
    fechainicio: "",
    fechafirma: "",
    fechafin: "",
    tipocontrato: "",
    estado: true,
    idusuario: 1,
    idhistorialpuesto: "",
  });

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
    fechaContrato: "",
  });

  const [mensaje, setMensaje] = useState("");
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Aquí definimos el ref
  const editorRef = useRef();

  const fetchList = async () => {
    try {
      const r = await axios.get(`${API}/contratos/`);
      const data = Array.isArray(r.data)
        ? r.data
        : Array.isArray(r.data?.results)
        ? r.data.results
        : [];
      setRows(data);
    } catch (e) {
      console.error("Error contratos:", e);
      setRows([]);
      setMensaje("Error al cargar los contratos");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);


  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    const content = document.getElementById("printable");
    if (!content) return;

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
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf().set(opt).from(content).save().finally(() => {
      // Restauramos estilos originales
      inputs.forEach((el, i) => {
        el.style.background = originalStyles[i].background;
        el.style.border = originalStyles[i].border;
        el.style.boxShadow = originalStyles[i].boxShadow;
        el.style.padding = originalStyles[i].padding;
      });
    });
  };



  return (
    <Layout>
      <SEO title="Contratos" />
      {/* Estilo global para asegurar tipografía Inter en sidebar */}
      <style>{`
        .sidebar-menu,
        .sidebar-menu *,
        .sidebar-menu-link,
        .sidebar-submenu-link {
          font-family: "Inter", sans-serif !important;
        }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <main className="main-content site-wrapper-reveal" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#EEF2F7", padding: "48px 20px 8rem" }}>
            <div style={{ width: "min(1100px, 96vw)" }}>
              <ContratoForm data={data} onChange={onChange} imprimirContrato={handlePrint} />

              {/* Pasamos el ref al editor */}
              <ContratoEditor
                ref={editorRef}
                data={data}
              />
            </div>
          </main>
          <Footer />
        </div>
        <ScrollToTop />
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default ContratosContainer;
