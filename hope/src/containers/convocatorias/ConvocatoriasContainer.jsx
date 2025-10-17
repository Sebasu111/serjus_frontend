import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

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

    // Paginación y búsqueda
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
            console.error("Error convocatorias:", e);
            setRows([]);
            setMensaje("Error al cargar las convocatorias");
        }
    };

    const fetchPuestos = async () => {
        try {
            const r = await axios.get(`${API}/puestos/`);
            const data = Array.isArray(r.data?.results) ? r.data.results : [];
            // Solo activos
            setPuestos(data.filter((p) => p.estado));
        } catch (e) {
            console.error("Error puestos:", e);
            setPuestos([]);
        }
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                estado: true,
                idusuario: Number(sessionStorage.getItem("idUsuario")) || 1,
            };

            if (editingId) {
                await axios.put(`${API}/convocatorias/${editingId}/`, payload);
                setMensaje("Convocatoria actualizada");
            } else {
                await axios.post(`${API}/convocatorias/`, payload);
                setMensaje("Convocatoria registrada");
            }

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
            fetchList();
        } catch (e) {
            console.error("Error guardar:", e.response?.data || e);
            setMensaje("Error al registrar/actualizar");
        }
    };

    const handleEdit = (row) => {
        setForm({
            nombreconvocatoria: row.nombreconvocatoria ?? "",
            descripcion: row.descripcion ?? "",
            fechainicio: row.fechainicio ?? "",
            fechafin: row.fechafin ?? "",
            idpuesto: row.idpuesto ?? "",
            estado: !!row.estado,
            idusuario: row.idusuario ?? 1,
        });
        setEditingId(row.idconvocatoria);
        setMostrarFormulario(true);
    };

    const toggleEstado = async (row, nuevo) => {
        try {
            await axios.put(`${API}/convocatorias/${row.idconvocatoria}/`, {
                ...row,
                estado: nuevo,
                idusuario: row.idusuario ?? 1,
            });
            setMensaje(nuevo ? "Activada" : "Desactivada");
            fetchList();
        } catch (e) {
            console.error("Error:", e.response?.data || e);
            setMensaje("No se pudo cambiar el estado");
        }
    };

    // Filtrado y paginación
    const filtradas = rows.filter((r) =>
        r.nombreconvocatoria.toLowerCase().includes(busqueda.toLowerCase())
    );
    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const paginadas = filtradas.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(filtradas.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title=" Convocatorias" />
            <div style={{ display: "flex", minHeight: "100vh" }}>

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Header />
                    <main
                        style={{
                            flex: 1,
                            padding: "40px 20px",
                            background: "#f0f2f5",
                        }}
                    >
                        <div style={{ maxWidth: 900, margin: "0 auto" }}>
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: 20,
                                }}
                            >
                                Convocatorias Registradas
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error")
                                            ? "red"
                                            : "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}

                            {/* BUSCADOR Y LIMIT */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: 15,
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar convocatoria..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        marginRight: 10,
                                    }}
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setElementosPorPagina(
                                            value > 0 ? value : 1
                                        );
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        width: 80,
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                    }}
                                />
                            </div>

                            {/* TABLA */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: 12,
                                    padding: "20px 30px",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {[
                                                "Nombre",
                                                "Descripción",
                                                "Inicio",
                                                "Fin",
                                                "Puesto",
                                                "Estado",
                                                "Acciones",
                                            ].map((h) => (
                                                <th
                                                    key={h}
                                                    style={{
                                                        borderBottom:
                                                            "2px solid #eee",
                                                        padding: 10,
                                                        textAlign: "left",
                                                    }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginadas.length ? (
                                            paginadas.map((r) => (
                                                <tr key={r.idconvocatoria}>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {r.nombreconvocatoria}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {r.descripcion || "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {new Date(
                                                            r.fechainicio
                                                        ).toLocaleDateString(
                                                            "es-ES"
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {r.fechafin
                                                            ? new Date(
                                                                r.fechafin
                                                            ).toLocaleDateString(
                                                                "es-ES"
                                                            )
                                                            : "-"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {r.idpuesto}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            textAlign: "center",
                                                            color: r.estado
                                                                ? "green"
                                                                : "red",
                                                            fontWeight: 600,
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {r.estado
                                                            ? "Activa"
                                                            : "Inactiva"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: 10,
                                                            textAlign: "center",
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(r)
                                                            }
                                                            style={{
                                                                ...btnStyle,
                                                                background:
                                                                    "#0054fd",
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                        {r.estado ? (
                                                            <button
                                                                onClick={() =>
                                                                    toggleEstado(
                                                                        r,
                                                                        false
                                                                    )
                                                                }
                                                                style={{
                                                                    ...btnStyle,
                                                                    background:
                                                                        "#F87171",
                                                                }}
                                                            >
                                                                Desactivar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    toggleEstado(
                                                                        r,
                                                                        true
                                                                    )
                                                                }
                                                                style={{
                                                                    ...btnStyle,
                                                                    background:
                                                                        "#28a745",
                                                                }}
                                                            >
                                                                Activar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: 20,
                                                    }}
                                                >
                                                    Sin registros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* PAGINACIÓN */}
                                {totalPaginas > 1 && (
                                    <div
                                        style={{
                                            marginTop: 20,
                                            textAlign: "center",
                                        }}
                                    >
                                        {Array.from(
                                            { length: totalPaginas },
                                            (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    onClick={() =>
                                                        setPaginaActual(i + 1)
                                                    }
                                                    style={{
                                                        margin: "0 5px",
                                                        padding: "6px 12px",
                                                        border: "1px solid #007bff",
                                                        background:
                                                            paginaActual ===
                                                                i + 1
                                                                ? "#007bff"
                                                                : "#fff",
                                                        color:
                                                            paginaActual ===
                                                                i + 1
                                                                ? "#fff"
                                                                : "#007bff",
                                                        borderRadius: 5,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {i + 1}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setMostrarFormulario(true)}
                                style={btnPrimary}
                            >
                                Nueva Convocatoria
                            </button>
                        </div>
                    </main>
                    <Footer />
                </div>

                {/* MODAL LATERAL */}
                {mostrarFormulario && (
                    <div style={modalStyle}>
                        <h3 style={{ marginBottom: 20, textAlign: "center" }}>
                            {editingId
                                ? "Editar convocatoria"
                                : "Registrar convocatoria"}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gap: 16 }}>
                                <label>Nombre</label>
                                <input
                                    name="nombreconvocatoria"
                                    value={form.nombreconvocatoria}
                                    onChange={onChange}
                                    required
                                    style={inputStyle}
                                />
                                <label>Descripción</label>
                                <textarea
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={onChange}
                                    rows={4}
                                    style={{
                                        ...inputStyle,
                                        resize: "vertical",
                                    }}
                                    required
                                />
                                <label>Fecha inicio</label>
                                <input
                                    type="date"
                                    name="fechainicio"
                                    value={form.fechainicio}
                                    onChange={onChange}
                                    required
                                    style={inputStyle}
                                />
                                <label>Fecha fin</label>
                                <input
                                    type="date"
                                    name="fechafin"
                                    value={form.fechafin}
                                    onChange={onChange}
                                    style={inputStyle}
                                />
                                <label>Puesto</label>
                                <select
                                    name="idpuesto"
                                    value={form.idpuesto}
                                    onChange={onChange}
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        -- Seleccionar puesto --
                                    </option>
                                    {puestos.map((p) => (
                                        <option
                                            key={p.idpuesto}
                                            value={p.idpuesto}
                                        >
                                            {p.nombrepuesto}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" style={btnPrimary}>
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </form>
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            style={btnClose}
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                <ScrollToTop />
            </div>
        </Layout>
    );
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    marginBottom: 12,
};
const btnPrimary = {
    padding: "10px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    marginTop: 12,
    cursor: "pointer",
};
const btnClose = {
    width: "100%",
    padding: "10px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    marginTop: 10,
    cursor: "pointer",
};
const btnStyle = {
    padding: "6px 14px",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    marginRight: 6,
    cursor: "pointer",
};
const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "400px",
    maxWidth: "90%",
    background: "#fff",
    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
    padding: 30,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
};

export default ConvocatoriasContainer;
