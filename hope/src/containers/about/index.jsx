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
    const [showForm, setShowForm] = useState(true);
    const [fade, setFade] = useState(true);

    useEffect(() => fetchIdiomas(), []);

    const fetchIdiomas = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/idiomas/");
            setIdiomas(res.data);
        } catch (error) {
            console.error(error);
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

            // Pasar a tabla con animación
            setFade(false);
            setTimeout(() => {
                setShowForm(false);
                setFade(true);
            }, 300);
        } catch {
            setMensaje("Error al registrar el idioma");
        }
    };

    const handleEdit = (idioma) => {
        setNombreIdioma(idioma.nombreidioma);
        setEstado(idioma.estado);
        setEditingId(idioma.ididioma);

        // Pasar a formulario con animación
        setFade(false);
        setTimeout(() => {
            setShowForm(true);
            setFade(true);
        }, 300);
    };

    const toggleView = () => {
        setFade(false);
        setTimeout(() => {
            setShowForm(!showForm);
            setFade(true);
        }, 300);
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
                        {/* Botón alternar */}
                        <div
                            style={{
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            <button
                                onClick={toggleView}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: "#007bff",
                                    color: "#fff",
                                    fontWeight: "600",
                                }}
                            >
                                {showForm
                                    ? "Ver Tabla de Idiomas"
                                    : "Registrar Nuevo Idioma"}
                            </button>
                        </div>

                        {/* 👇 SOLO aquí va la animación */}
                        <div
                            style={{
                                opacity: fade ? 1 : 0,
                                transition: "opacity 0.4s",
                            }}
                        >
                            {showForm ? (
                                // --- FORMULARIO ---
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
                                                    setNombreIdioma(
                                                        e.target.value
                                                    )
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
                            ) : (
                                // --- TABLA ---
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: "12px",
                                        padding: "20px 30px",
                                        boxShadow:
                                            "0 4px 20px rgba(0,0,0,0.08)",
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
                                    <ul
                                        style={{
                                            listStyle: "none",
                                            padding: 0,
                                        }}
                                    >
                                        {idiomas.map((idioma) => (
                                            <li
                                                key={idioma.ididioma}
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    padding: "12px 10px",
                                                    borderBottom:
                                                        "1px solid #eee",
                                                }}
                                            >
                                                <span>
                                                    {idioma.nombreidioma}{" "}
                                                    <span
                                                        style={{
                                                            color: idioma.estado
                                                                ? "green"
                                                                : "red",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {idioma.estado
                                                            ? "(Activo)"
                                                            : "(Inactivo)"}
                                                    </span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(idioma)
                                                    }
                                                    style={{
                                                        padding: "5px 12px",
                                                        background: "#ffc107",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "5px",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
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
