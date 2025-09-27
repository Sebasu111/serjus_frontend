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
    const [estado, setEstado] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [idiomas, setIdiomas] = useState([]);
    const [editingId, setEditingId] = useState(null);

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
            const data = { nombreidioma: nombreIdioma, estado, idusuario: 1 };
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
            setEstado(true);
            setEditingId(null);
            fetchIdiomas();
        } catch (error) {
            console.error("Error al guardar idioma:", error);
            setMensaje("Error al registrar el idioma");
        }
    };

    const handleEdit = (idioma) => {
        setNombreIdioma(idioma.nombreidioma);
        setEstado(idioma.estado);
        setEditingId(idioma.ididioma);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Borrado lógico (desactivar)
    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar este idioma?")) return;
        try {
            const idioma = idiomas.find((i) => i.ididioma === id);
            if (!idioma) return;

            await axios.put(`http://127.0.0.1:8000/api/idiomas/${id}/`, {
                nombreidioma: idioma.nombreidioma,
                estado: false,
                idusuario: idioma.idusuario,
            });

            setMensaje("Idioma desactivado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error(
                "Error al desactivar idioma:",
                error.response?.data || error
            );
            setMensaje("Error al desactivar el idioma");
        }
    };

    // Activar idioma
    const handleActivate = async (id) => {
        try {
            const idioma = idiomas.find((i) => i.ididioma === id);
            if (!idioma) return;

            await axios.put(`http://127.0.0.1:8000/api/idiomas/${id}/`, {
                nombreidioma: idioma.nombreidioma,
                estado: true,
                idusuario: idioma.idusuario,
            });

            setMensaje("Idioma activado correctamente");
            fetchIdiomas();
        } catch (error) {
            console.error(
                "Error al activar idioma:",
                error.response?.data || error
            );
            setMensaje("Error al activar el idioma");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Idiomas" />
            <div
                className="wrapper"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                <Header />

                <main
                    style={{
                        flex: 1,
                        padding: "60px 20px",
                        background: "#f0f2f5",
                    }}
                >
                    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                        {/* --- FORMULARIO --- */}
                        <div
                            style={{
                                background: "#fff",
                                padding: "40px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                marginBottom: "40px",
                            }}
                        >
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: "30px",
                                }}
                            >
                                {editingId
                                    ? "Editar idioma"
                                    : "Registrar un nuevo idioma"}
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error")
                                            ? "red"
                                            : "green",
                                        marginBottom: "20px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="nombreIdioma"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Nombre del idioma
                                    </label>
                                    <input
                                        type="text"
                                        id="nombreIdioma"
                                        value={nombreIdioma}
                                        onChange={(e) =>
                                            setNombreIdioma(e.target.value)
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px 15px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px",
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        marginBottom: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="estado"
                                        checked={estado}
                                        onChange={(e) =>
                                            setEstado(e.target.checked)
                                        }
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                        }}
                                    />
                                    <label
                                        htmlFor="estado"
                                        style={{
                                            fontWeight: "600",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Activo
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "12px 0",
                                        background: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    {editingId
                                        ? "Actualizar Idioma"
                                        : "Guardar Idioma"}
                                </button>
                            </form>
                        </div>

                        {/* --- TABLA --- */}
                        <div
                            style={{
                                background: "#fff",
                                borderRadius: "12px",
                                padding: "20px 30px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                maxHeight: "600px",
                                overflowY: "auto",
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center",
                                }}
                            >
                                Idiomas Registrados
                            </h3>
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
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "left",
                                            }}
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            Estado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center",
                                            }}
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(idiomas) &&
                                    idiomas.length > 0 ? (
                                        idiomas.map((idioma) => (
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
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(idioma)
                                                        }
                                                        style={{
                                                            padding: "6px 14px",
                                                            background:
                                                                "#ffc107",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            marginRight: "6px",
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {idioma.estado ? (
                                                        <button
                                                            type="button"
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
                                                                cursor: "pointer",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
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
                                                                cursor: "pointer",
                                                                fontSize:
                                                                    "14px",
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
                        </div>
                    </div>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default IdiomasContainer;
