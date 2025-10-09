// containers/idiomas/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import { X } from "lucide-react";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

const IdiomasContainer = () => {
    const [nombreIdioma, setNombreIdioma] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [idiomas, setIdiomas] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [idiomaActivoEditando, setIdiomaActivoEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(null);

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
            showToast("Error al cargar los idiomas", error);
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
                showToast("Idioma actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/idiomas/", data);
                showToast("Idioma registrado correctamente");
            }

            setNombreIdioma("");
            setEditingId(null);
            setIdiomaActivoEditando(true);
            setMostrarFormulario(false);
            fetchIdiomas();
        } catch (error) {
            console.error("Error al guardar idioma:", error);
            showToast("Error al registrar el idioma", error);
        }
    };

    const handleEdit = (idioma) => {
        if (!idioma.estado) {
            showToast("No se puede editar un idioma inactivo");
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

    const handleDelete = (idioma) => {
        setIdiomaSeleccionado(idioma);
        setMostrarConfirmacion(true);
    };

    const confirmarDesactivacionIdioma = async () => {
        if (!idiomaSeleccionado) return;

        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            await axios.put(
                `http://127.0.0.1:8000/api/idiomas/${idiomaSeleccionado.ididioma}/`,
                {
                    nombreidioma: idiomaSeleccionado.nombreidioma,
                    estado: false,
                    idusuario: idUsuario,
                }
            );

            showToast("Idioma desactivado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error("Error al desactivar idioma:", error);
            showToast("Error al desactivar el idioma");
        } finally {
            setMostrarConfirmacion(false);
            setIdiomaSeleccionado(null);
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

            showToast("Idioma activado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error("Error al activar idioma:", error);
            showToast("Error al activar el idioma");
        }
    };

    const idiomasFiltrados = idiomas.filter((i) => {
        const textoBusqueda = busqueda.toLowerCase().trim();

        // Verifica que nombreidioma exista antes de usar toLowerCase
        const nombreCoincide =
            i.nombreidioma?.toLowerCase().includes(textoBusqueda) || false;

        // Convertir el estado booleano a texto legible
        const estadoTexto = i.estado ? "activo" : "inactivo";

        // Coincide si el texto buscado aparece parcial o completamente
        const estadoCoincide = estadoTexto.startsWith(textoBusqueda);

        return nombreCoincide || estadoCoincide;
    });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const idiomasPaginados = idiomasFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(
        idiomasFiltrados.length / elementosPorPagina
    );

    return (
        <Layout>
            <SEO title="Idiomas" />
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
                        <div
                            style={{
                                maxWidth: "900px",
                                margin: "0 auto",
                                paddingLeft: "250px",
                            }}
                        >
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
                                    alignItems: "center",
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

                                <button
                                    onClick={() => setMostrarFormulario(true)}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "600",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Nuevo Idioma
                                </button>
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
                                                                        ? "#fb8500"
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
                                                                        idioma
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "6px 14px",
                                                                    background:
                                                                        "#fb8500",
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
                                                                        "#ffb703",
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
                                                        border: "1px solid #219ebc",
                                                        background:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#219ebc"
                                                                : "#fff",
                                                        color:
                                                            paginaActual ===
                                                            i + 1
                                                                ? "#fff"
                                                                : "#219ebc",
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

                            {/* --- LÍMITE --- */}
                            <div
                                style={{
                                    marginTop: "20px",
                                    textAlign: "center",
                                }}
                            >
                                <label
                                    style={{
                                        marginRight: "10px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Mostrar:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );
                                        const numero =
                                            val === "" ? "" : Number(val);
                                        setElementosPorPagina(
                                            numero > 0 ? numero : 1
                                        );
                                        setPaginaActual(1);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    style={{
                                        width: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        textAlign: "center",
                                    }}
                                />
                            </div>
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
                            transform: "translate(-15%, -50%)",
                            width: "350px",
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
                                        ? "#219ebc"
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
                                position: "absolute",
                                top: "10px",
                                right: "15px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                            title="Cerrar"
                        >
                            <X size={24} color="#555" />
                        </button>
                    </div>
                )}

                {/* Modal de eliminación */}
                {mostrarConfirmacion && (
                    <div
                        style={{
                            paddingLeft: "250px",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            background: "rgba(0,0,0,0.4)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 2000,
                        }}
                    >
                        <div
                            style={{
                                background: "#fff",
                                padding: "30px",
                                borderRadius: "10px",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                                textAlign: "center",
                                width: "350px",
                            }}
                        >
                            <h3 style={{ marginBottom: "15px", color: "#333" }}>
                                Confirmar desactivación
                            </h3>
                            <p style={{ marginBottom: "25px", color: "#555" }}>
                                ¿Seguro que deseas desactivar el idioma{" "}
                                <strong>
                                    {idiomaSeleccionado?.nombreidioma}
                                </strong>
                                ?
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "15px",
                                }}
                            >
                                <button
                                    onClick={confirmarDesactivacionIdioma}
                                    style={{
                                        background: "#fb8500",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Sí, desactivar
                                </button>
                                <button
                                    onClick={() =>
                                        setMostrarConfirmacion(false)
                                    }
                                    style={{
                                        background: "#6c757d",
                                        color: "#fff",
                                        padding: "10px 20px",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancelar
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

export default IdiomasContainer;
