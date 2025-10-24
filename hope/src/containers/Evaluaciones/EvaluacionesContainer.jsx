import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../utils/toast.js";

import EvaluacionesTable from "./EvaluacionesTable";
import EvaluacionForm from "./EvaluacionForm";

const API_BASE = "http://127.0.0.1:8000/api";

const toNum = v => (v === null || v === undefined || v === "" ? null : Number(v));

const normalizarEvaluacion = e => ({
    idEvaluacion: e.idEvaluacion ?? e.idevaluacion ?? e.id ?? null,
    idEmpleado: e.idEmpleado ?? e.idempleado ?? null,
    tipoEvaluacion: e.tipoEvaluacion ?? e.tipoevaluacion ?? "",
    fechaEvaluacion: e.fechaEvaluacion ?? e.fechaevaluacion ?? null,
    puntajeTotal: Number(e.puntajeTotal ?? e.puntajetotal ?? 0),
    observacion: e.observacion ?? "",
    estado: e.estado !== false,
    idUsuario: e.idUsuario ?? e.idusuario ?? null,
    createdAt: e.createdAt ?? e.createdat ?? null,
    updatedAt: e.updatedAt ?? e.updatedat ?? null
});

const EvaluacionesContainer = () => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    // UI
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // filtros / paginación
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // detalle (solo lectura)
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetchEvaluaciones();
        fetchEmpleados();
    }, []);

    const fetchEvaluaciones = async () => {
        try {
            const res = await axios.get(`${API_BASE}/evaluacion/`);
            const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setEvaluaciones(raw.map(normalizarEvaluacion));
        } catch (err) {
            console.error(err);
            showToast("Error al cargar las evaluaciones", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(`${API_BASE}/empleados/`);
            const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            const activos = raw.filter(e => e.estado !== false);
            setEmpleados(activos);
        } catch (err) {
            console.error(err);
            showToast("Error al cargar empleados", "error");
        }
    };

    // helpers de empleados (mismo estilo que Equipos)
    const empleadoNombre = emp => {
        const cands = [
            emp?.nombreCompleto,
            [emp?.nombres, emp?.apellidos].filter(Boolean).join(" "),
            [emp?.nombre, emp?.apellido].filter(Boolean).join(" "),
            [emp?.primerNombre, emp?.segundoNombre, emp?.apellidoPaterno, emp?.apellidoMaterno]
                .filter(Boolean)
                .join(" "),
            [emp?.first_name, emp?.last_name].filter(Boolean).join(" "),
            emp?.full_name,
            emp?.displayName,
            emp?.nombre_empleado,
            emp?.name
        ]
            .map(s => (typeof s === "string" ? s.trim() : ""))
            .filter(Boolean);
        if (cands[0]) return cands[0];
        const id = emp?.idEmpleado ?? emp?.idempleado ?? emp?.id ?? emp?.pk ?? emp?.uuid ?? emp?.codigo ?? "?";
        return `Empleado #${id}`;
    };
    const empleadoId = emp => emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

    const empleadosMap = useMemo(() => {
        const m = new Map();
        empleados.forEach(e => m.set(Number(empleadoId(e)), empleadoNombre(e)));
        return m;
    }, [empleados]);

    // filtros (por empleado, tipo, observación)
    const listaFiltrada = evaluaciones.filter(ev => {
        const t = busqueda.trim().toLowerCase();
        if (!t) return true;
        const nom = empleadosMap.get(Number(ev.idEmpleado)) || "";
        return (
            nom.toLowerCase().includes(t) ||
            (ev.tipoEvaluacion || "").toLowerCase().includes(t) ||
            (ev.observacion || "").toLowerCase().includes(t)
        );
    });

    // paginación
    const indexLast = paginaActual * elementosPorPagina;
    const indexFirst = indexLast - elementosPorPagina;
    const paginada = listaFiltrada.slice(indexFirst, indexLast);
    const totalPaginas = Math.ceil(listaFiltrada.length / (elementosPorPagina || 1));

    // Crear / Editar
    const onCreate = () => {
        setEditingId(null);
        setMostrarForm(true);
    };

    const onEdit = async ev => {
        setEditingId(ev.idEvaluacion);
        setMostrarForm(true);
    };

    const onVerDetalle = ev => {
        setDetalle(ev);
        setMostrarDetalle(true);
    };

    const handleSubmit = async formValues => {
        try {
            const idUsuario = toNum(sessionStorage.getItem("idUsuario"));

            // Backend espera snake/camel? Mandamos con nombres de la tabla (como en SQL)
            const payload = {
                idEmpleado: toNum(formValues.idEmpleado) ?? null,
                tipoEvaluacion: formValues.tipoEvaluacion || "",
                fechaEvaluacion: formValues.fechaEvaluacion, // datetime ISO; input usa datetime-local
                puntajeTotal: Number(formValues.puntajeTotal || 0),
                observacion: formValues.observacion || "",
                estado: !!formValues.estado,
                idUsuario: idUsuario
                // idPostulacion: null // omitido por ahora
            };

            if (editingId) {
                await axios.put(`${API_BASE}/evaluacion/${editingId}/`, payload);
                showToast("Evaluación actualizada");
            } else {
                await axios.post(`${API_BASE}/evaluacion/`, payload);
                showToast("Evaluación creada");
            }

            setMostrarForm(false);
            setEditingId(null);
            fetchEvaluaciones();
        } catch (err) {
            console.error(err?.response?.data || err);
            showToast("Error al guardar la evaluación", "error");
        }
    };

    return (
        <Layout>
            <SEO title="Evaluaciones" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: 20, textAlign: "center" }}>Evaluaciones</h2>

                            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por empleado, tipo u observación..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                                />
                                <button
                                    onClick={onCreate}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    Nueva Evaluación
                                </button>
                            </div>

                            <EvaluacionesTable
                                evaluaciones={paginada}
                                empleadosMap={empleadosMap}
                                onEdit={onEdit}
                                onVerDetalle={onVerDetalle}
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                            <div style={{ marginTop: 16, textAlign: "center" }}>
                                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const n = Number((e.target.value || "1").replace(/\D/g, "")) || 1;
                                        setElementosPorPagina(n);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={e => e.target.select()}
                                    style={{
                                        width: 80,
                                        padding: 10,
                                        borderRadius: 8,
                                        border: "1px solid #d1d5db",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarForm && (
                    <EvaluacionForm
                        empleados={empleados}
                        editingId={editingId}
                        evaluacion={editingId ? evaluaciones.find(x => x.idEvaluacion === editingId) : null}
                        onCancel={() => {
                            setMostrarForm(false);
                            setEditingId(null);
                        }}
                        onSubmit={handleSubmit}
                    />
                )}

                {mostrarDetalle && detalle && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 4000
                        }}
                    >
                        <div
                            style={{
                                width: "min(720px, 96vw)",
                                maxHeight: "92vh",
                                overflow: "auto",
                                background: "#fff",
                                boxShadow: "0 0 30px rgba(0,0,0,0.25)",
                                padding: 24,
                                borderRadius: 14
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Detalle de Evaluación</h3>
                            <div style={{ lineHeight: 1.7 }}>
                                <p>
                                    <strong>Empleado:</strong>{" "}
                                    {empleadosMap.get(Number(detalle.idEmpleado)) || `#${detalle.idEmpleado ?? ""}`}
                                </p>
                                <p>
                                    <strong>Tipo:</strong> {detalle.tipoEvaluacion || "—"}
                                </p>
                                <p>
                                    <strong>Fecha:</strong>{" "}
                                    {detalle.fechaEvaluacion ? new Date(detalle.fechaEvaluacion).toLocaleString() : "—"}
                                </p>
                                <p>
                                    <strong>Puntaje total:</strong> {Number(detalle.puntajeTotal || 0).toFixed(2)}
                                </p>
                                <p>
                                    <strong>Observación:</strong> {detalle.observacion || "—"}
                                </p>
                                <p>
                                    <strong>Estado:</strong>{" "}
                                    <span style={{ color: detalle.estado ? "green" : "red", fontWeight: 700 }}>
                                        {detalle.estado ? "Activo" : "Inactivo"}
                                    </span>
                                </p>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    style={{
                                        background: "#219ebc",
                                        color: "#fff",
                                        padding: "10px 18px",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontWeight: 600
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default EvaluacionesContainer;
