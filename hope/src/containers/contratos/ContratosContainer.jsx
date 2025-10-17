import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
import ContratosForm from "./ContratoForm.jsx";
import ContratosTable from "./ContratosTable.jsx";
import ContratoEditor from "./ContratoEditor.jsx";


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
  const [mensaje, setMensaje] = useState("");
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingId) {
        await axios.put(`${API}/contratos/${editingId}/`, payload);
        setMensaje("Contrato actualizado");
      } else {
        await axios.post(`${API}/contratos/`, payload);
        setMensaje("Contrato registrado");
      }
      setForm({
        fechainicio: "",
        fechafirma: "",
        fechafin: "",
        tipocontrato: "",
        estado: true,
        idusuario: 1,
        idhistorialpuesto: "",
      });
      setEditingId(null);
      fetchList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Error guardar contrato:", e.response?.data || e);
      setMensaje("Error al registrar/actualizar");
    }
  };

  const handleEdit = (row) => {
    setForm({
      fechainicio: row.fechainicio ?? "",
      fechafirma: row.fechafirma ?? "",
      fechafin: row.fechafin ?? "",
      tipocontrato: row.tipocontrato ?? "",
      estado: !!row.estado,
      idusuario: row.idusuario ?? 1,
      idhistorialpuesto: row.idhistorialpuesto ?? "",
    });
    setEditingId(row.idcontrato);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleEstado = async (row, nuevo) => {
    try {
      await axios.put(`${API}/contratos/${row.idcontrato}/`, {
        ...row,
        estado: nuevo,
        idusuario: row.idusuario ?? 1,
      });
      setMensaje(nuevo ? "Activado" : "Desactivado");
      fetchList();
    } catch (e) {
      console.error("Error:", e.response?.data || e);
      setMensaje("No se pudo cambiar el estado");
    }
  };

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
            <ContratoEditor
              rows={rows}
              handleEdit={handleEdit}
              toggleEstado={toggleEstado}
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
