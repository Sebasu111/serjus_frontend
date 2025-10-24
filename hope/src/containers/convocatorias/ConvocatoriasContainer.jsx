import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

import ConvocatoriasTable from "./ConvocatoriasTable.jsx";
import ConvocatoriasForm from "./ConvocatoriasForm.jsx";

const API = "http://127.0.0.1:8000/api";

const ConvocatoriasContainer = () => {
    const [form, setForm] = useState({
        nombreconvocatoria: "",
        descripcion: "",
        fechainicio: "",
        fechafin: "",
        idpuesto: "",
        estado: true,
        idusuario: Number(sessionStorage.getItem("idUsuario")) || 1,
    });
    const [mensaje, setMensaje] = useState("");
    const [rows, setRows] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetchList();
        fetchPuestos();
    }, []);

    const fetchList = async () => {
        try {
            const r = await axios.get(`${API}/convocatorias/`);
            const data = Array.isArray(r.data)
                ? r.data
                : Array.isArray(r.data?.results)
                    ? r.data.results
                    : [];
            setRows(data);
        } catch (e) {
            setMensaje("Error al cargar las convocatorias");
            setRows([]);
        }
    };

    const fetchPuestos = async () => {
        try {
            const r = await axios.get(`${API}/puestos/`);
            const data = Array.isArray(r.data?.results) ? r.data.results : [];
            setPuestos(data.filter((p) => p.estado));
        } catch (e) {
            setPuestos([]);
        }
    };

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombreconvocatoria: form.nombreconvocatoria.trim(),
                descripcion: form.descripcion.trim(),
                fechainicio: form.fechainicio,
                fechafin: form.fechafin,
                estado: true,
                idusuario: Number(sessionStorage.getItem("idUsuario")) || 1,
                idpuesto: Number(form.idpuesto)
            };

            if (editingId) {
                await axios.put(`${API}/convocatorias/${editingId}/`, payload);
                setMensaje("Convocatoria actualizada");
            } else {
                await axios.post(`${API}/convocatorias/`, payload);
                setMensaje("Convocatoria registrada");
            }

            fetchList();
            setMostrarFormulario(false);
            setEditingId(null);

        } catch (error) {
            console.error(error);
            setMensaje("Error al registrar/actualizar");
        }
    };

    const handleEdit = (row) => {
        setForm({ ...row });
        setEditingId(row.idconvocatoria);
        setMostrarFormulario(true);
    };

    const toggleEstado = async (row, nuevo) => {
        try {
            await axios.put(`${API}/convocatorias/${row.idconvocatoria}/`, {
                ...row,
                estado: nuevo,
            });
            fetchList();
        } catch {}
    };

    const resetForm = () => {
        setForm({
            nombreconvocatoria: "",
            descripcion: "",
            fechainicio: "",
            fechafin: "",
            idpuesto: "",
            estado: true,
            idusuario: Number(sessionStorage.getItem("idUsuario")) || 1,
        });
        setEditingId(null);
        setMostrarFormulario(false);
    };

    const filtradas = rows.filter((r) =>
        r.nombreconvocatoria.toLowerCase().includes(busqueda.toLowerCase())
    );
    const indexOfLast = paginaActual * elementosPorPagina;
    const paginadas = filtradas.slice(indexOfLast - elementosPorPagina, indexOfLast);
    const totalPaginas = Math.ceil(filtradas.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Convocatorias" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5", paddingLeft: "250px" }}>
                        <ConvocatoriasTable
                            mensaje={mensaje}
                            paginadas={paginadas}
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            paginaActual={paginaActual}
                            setPaginaActual={setPaginaActual}
                            elementosPorPagina={elementosPorPagina}
                            setElementosPorPagina={setElementosPorPagina}
                            totalPaginas={totalPaginas}
                            handleEdit={handleEdit}
                            toggleEstado={toggleEstado}
                            setMostrarFormulario={setMostrarFormulario}
                        />
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <ConvocatoriasForm
                        form={form}
                        puestos={puestos}
                        onChange={onChange}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        editingId={editingId}
                    />
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default ConvocatoriasContainer;
