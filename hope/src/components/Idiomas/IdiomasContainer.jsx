// containers/idiomas/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const IdiomasContainer = () => {
    const [nombreIdioma, setNombreIdioma] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [idiomas, setIdiomas] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [idiomaActivoEditando, setIdiomaActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Paginación y búsqueda
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        fetchIdiomas();
    }, []);

    const fetchIdiomas = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/idiomas/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            setIdiomas(data);
        } catch (error) {
            console.error("Error al cargar idiomas:", error);
            setIdiomas([]);
            setMensaje("Error al cargar los idiomas");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            const data = {
                nombreidioma: nombreIdioma,
                estado: true,
                idusuario: idUsuario,
            };

            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/idiomas/${editingId}/`,
                    data
                );
                setMensaje("Idioma actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/idiomas/", data);
                setMensaje("Idioma registrado correctamente");
            }

            setNombreIdioma("");
            setEditingId(null);
            setIdiomaActivoEditando(true);
            setMostrarFormulario(false);
            fetchIdiomas();
        } catch (error) {
            console.error("Error al guardar idioma:", error);
            setMensaje("Error al registrar el idioma");
        }
    };

    const handleEdit = (idioma) => {
        if (!idioma.estado) {
            setMensaje("No se puede editar un idioma inactivo");
            return;
        }
        setNombreIdioma(idioma.nombreidioma);
        setEditingId(idioma.ididioma);
        setIdiomaActivoEditando(idioma.estado);
        setMostrarFormulario(true);
    };

    const handleNombreChange = (e) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;
        if (regex.test(e.target.value)) {
            setNombreIdioma(e.target.value);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar este idioma?")) return;
        try {
            const idioma = idiomas.find((i) => i.ididioma === id);
            if (!idioma) return;

            const idUsuario = sessionStorage.getItem("idUsuario");

            await axios.put(`http://127.0.0.1:8000/api/idiomas/${id}/`, {
                nombreidioma: idioma.nombreidioma,
                estado: false,
                idusuario: idUsuario,
            });

            setMensaje("Idioma desactivado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error("Error al desactivar idioma:", error);
            setMensaje("Error al desactivar el idioma");
        }
    };

    const handleActivate = async (id) => {
        try {
            const idioma = idiomas.find((i) => i.ididioma === id);
            if (!idioma) return;

            const idUsuario = sessionStorage.getItem("idUsuario");

            await axios.put(`http://127.0.0.1:8000/api/idiomas/${id}/`, {
                nombreidioma: idioma.nombreidioma,
                estado: true,
                idusuario: idUsuario,
            });

            setMensaje("Idioma activado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error("Error al activar idioma:", error);
            setMensaje("Error al activar el idioma");
        }
    };

    const idiomasFiltrados = idiomas.filter((i) =>
        i.nombreidioma.toLowerCase().includes(busqueda.toLowerCase())
    );

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const idiomasPaginados = idiomasFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(
        idiomasFiltrados.length / elementosPorPagina
    );

    return (
        <Layout>
            <SEO title="Hope – Idiomas" />
            <div
                style={{
                    display: "flex",
                    minHeight: "100vh",
                }}
            >

                {/* Contenedor principal: header + main + footer */}
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
                        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                            <h2
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Idiomas Registrados
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

                            {/* BUSCADOR Y INPUT PARA LÍMITE */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "15px",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar idioma..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        marginRight: "10px",
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
                                        width: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                    }}
                                />
                            </div>

                            {/* TABLA */}
                            <div
                                style={{
                                    background: "#fff",
                                    borderRadius: "12px",
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
                                            <th
                                                style={{
                                                    borderBottom:
                                                        "2px solid #eee",
                                                    padding: "10px",
                                                    textAlign: "left",
                                                }}
                                            >
                                                Nombre
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        "2px solid #eee",
                                                    padding: "10px",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Estado
                                            </th>
                                            <th
                                                style={{
                                                    borderBottom:
                                                        "2px solid #eee",
                                                    padding: "10px",
                                                    textAlign: "center",
                                                }}
                                            >
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {idiomasPaginados.length > 0 ? (
                                            idiomasPaginados.map((idioma) => (
                                                <tr key={idioma.ididioma}>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {idioma.nombreidioma}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "center",
                                                            color: idioma.estado
                                                                ? "green"
                                                                : "red",
                                                            fontWeight: "600",
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        {idioma.estado
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "10px",
                                                            textAlign: "center",
                                                            borderBottom:
                                                                "1px solid #f0f0f0",
                                                        }}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(
                                                                    idioma
                                                                )
                                                            }
                                                            disabled={
                                                                !idioma.estado
                                                            }
                                                            style={{
                                                                padding:
                                                                    "6px 14px",
                                                                background:
                                                                    idioma.estado
                                                                        ? "#0054fd"
                                                                        : "#6c757d",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius:
                                                                    "5px",
                                                                cursor: idioma.estado
                                                                    ? "pointer"
                                                                    : "not-allowed",
                                                                marginRight:
                                                                    "6px",
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                        {idioma.estado ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        idioma.ididioma
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 14px",
                                                                    background:
                                                                        "#dc3545",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "5px",
                                                                }}
                                                            >
                                                                Eliminar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        idioma.ididioma
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 14px",
                                                                    background:
                                                                        "#28a745",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius:
                                                                        "5px",
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
                                                    colSpan="3"
                                                    style={{
                                                        textAlign: "center",
                                                        padding: "20px",
                                                    }}
                                                >
                                                    No hay idiomas registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* PAGINACIÓN */}
                                {totalPaginas > 1 && (
                                    <div
                                        style={{
                                            marginTop: "20px",
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
                                                        borderRadius: "5px",
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

                            {/* BOTÓN NUEVO */}
                            <button
                                onClick={() => setMostrarFormulario(true)}
                                style={{
                                    marginTop: "20px",
                                    padding: "12px 20px",
                                    background: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                }}
                            >
                                Nuevo Idioma
                            </button>
                        </div>
                    </main>

                    <Footer />
                </div>

                {/* MODAL LATERAL */}
                {mostrarFormulario && (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "400px",
                            maxWidth: "90%",
                            background: "#fff",
                            boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                            padding: "30px",
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: "12px",
                        }}
                    >
                        <h3
                            style={{
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            {editingId ? "Editar idioma" : "Registrar idioma"}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                            <div style={{ marginBottom: "20px" }}>
                                <label
                                    htmlFor="nombreIdioma"
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Nombre del idioma
                                </label>
                                <input
                                    id="nombreIdioma"
                                    type="text"
                                    value={nombreIdioma}
                                    onChange={handleNombreChange}
                                    required
                                    disabled={!idiomaActivoEditando}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!idiomaActivoEditando}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    background: idiomaActivoEditando
                                        ? "#007bff"
                                        : "#6c757d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: idiomaActivoEditando
                                        ? "pointer"
                                        : "not-allowed",
                                }}
                            >
                                {editingId ? "Actualizar" : "Guardar"}
                            </button>
                        </form>
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            style={{
                                marginTop: "10px",
                                padding: "10px",
                                background: "#6c757d",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
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

export default IdiomasContainer;
