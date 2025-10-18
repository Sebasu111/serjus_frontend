import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import ContratoEditor from "./ContratoEditor.jsx";
import ContratoForm from "./ContratoForm.jsx";
import { showToast } from "../../utils/toast.js";
import { useReactToPrint } from "react-to-print";

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

  const handlePrint = useReactToPrint({
    content: () => editorRef.current || document.createElement("div"), // <-- protección
    documentTitle: "Contrato Individual de Trabajo",
    pageStyle: `
      @page { margin: 2cm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    `,
  });

  return (
    <Layout>
      <SEO title="Contratos" />
      <div
        className="wrapper"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5", paddingLeft: "250px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <ContratoForm data={data} onChange={onChange} imprimirContrato={handlePrint} />

            {/* Pasamos el ref al editor */}
            <ContratoEditor
              ref={editorRef}
              data={data}
            />
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default ContratosContainer;
