// containers/tipodocumentos/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";

const TiposDocumentoContainer = () => {
    const [nombreTipo, setNombreTipo] = useState("");
    const [cantidadRepetir, setCantidadRepetir] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [tipos, setTipos] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTipos();
    }, []);

    const fetchTipos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/tipodocumento/");
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setTipos(data);
        } catch (error) {
            console.error("Error al cargar tipos de documento:", error);
            setTipos([]);
            setMensaje("Error al cargar los tipos de documento");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                nombretipo: nombreTipo,
                cantidadrepetir: cantidadRepetir ? parseInt(cantidadRepetir) : null,
                descripcion,
                estado: estadoActivo,
                idusuario: 1 // reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/api/tipodocumento/${editingId}/`, data);
                setMensaje("Tipo de documento actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/tipodocumento/", data);
                setMensaje("Tipo de documento registrado correctamente");
            }

            setNombreTipo("");
            setCantidadRepetir("");
            setDescripcion("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchTipos();
        } catch (error) {
            console.error("Error al guardar tipo de documento:", error);
            setMensaje("Error al registrar el tipo de documento");
        }
    };

    const handleEdit = tipo => {
        setNombreTipo(tipo.nombretipo);
        setCantidadRepetir(tipo.cantidadrepetir || "");
        setDescripcion(tipo.descripcion);
        setEstadoActivo(tipo.estado);
        setEditingId(tipo.idtipodocumento);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar este tipo de documento?")) return;
        try {
            const tipo = tipos.find(t => t.idtipodocumento === id);
            if (!tipo) return;

            await axios.put(`http://127.0.0.1:8000/api/tipodocumento/${id}/`, {
                nombretipo: tipo.nombretipo,
                cantidadrepetir: tipo.cantidadrepetir,
                descripcion: tipo.descripcion,
                estado: false,
                idusuario: tipo.idusuario
            });

            setMensaje("Tipo de documento desactivado correctamente");
            fetchTipos();
        } catch (error) {
            console.error("Error al desactivar tipo de documento:", error.response?.data || error);
            setMensaje("Error al desactivar el tipo de documento");
        }
    };

    const handleActivate = async id => {
        try {
            const tipo = tipos.find(t => t.idtipodocumento === id);
            if (!tipo) return;

            await axios.put(`http://127.0.0.1:8000/api/tipodocumento/${id}/`, {
                nombretipo: tipo.nombretipo,
                cantidadrepetir: tipo.cantidadrepetir,
                descripcion: tipo.descripcion,
                estado: true,
                idusuario: tipo.idusuario
            });

            setMensaje("Tipo de documento activado correctamente");
            fetchTipos();
        } catch (error) {
            console.error("Error al activar tipo de documento:", error.response?.data || error);
            setMensaje("Error al activar el tipo de documento");
        }
    };

    return (
        <Layout>
            <SEO title=" Tipos de Documento" />
            <div
                className="wrapper"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh"
                }}
            >
                <Header />

                <main
                    style={{
                        flex: 1,
                        padding: "60px 20px",
                        background: "#f0f2f5"
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
                                marginBottom: "40px"
                            }}
                        >
                            <h2
                                style={{
                                    textAlign: "center",
                                    marginBottom: "30px"
                                }}
                            >
                                {editingId ? "Editar tipo de documento" : "Registrar un nuevo tipo de documento"}
                            </h2>
                            {mensaje && (
                                <p
                                    style={{
                                        textAlign: "center",
                                        color: mensaje.includes("Error") ? "red" : "green",
                                        marginBottom: "20px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {mensaje}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="nombreTipo"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        id="nombreTipo"
                                        value={nombreTipo}
                                        onChange={e => setNombreTipo(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px 15px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="cantidadRepetir"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Cantidad a repetir
                                    </label>
                                    <input
                                        type="number"
                                        id="cantidadRepetir"
                                        value={cantidadRepetir}
                                        onChange={e => setCantidadRepetir(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "12px 15px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="descripcion"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        id="descripcion"
                                        value={descripcion}
                                        onChange={e => setDescripcion(e.target.value)}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "12px 15px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            fontSize: "16px"
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        marginBottom: "30px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="estadoActivo"
                                        checked={estadoActivo}
                                        onChange={e => setEstadoActivo(e.target.checked)}
                                        style={{
                                            width: "18px",
                                            height: "18px"
                                        }}
                                    />
                                    <label
                                        htmlFor="estadoActivo"
                                        style={{
                                            fontWeight: "600",
                                            cursor: "pointer"
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
                                        cursor: "pointer"
                                    }}
                                >
                                    {editingId ? "Actualizar Tipo" : "Guardar Tipo"}
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
                                overflowY: "auto"
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: "20px",
                                    textAlign: "center"
                                }}
                            >
                                Tipos de Documento Registrados
                            </h3>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "left"
                                            }}
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center"
                                            }}
                                        >
                                            Cantidad
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "left"
                                            }}
                                        >
                                            Descripción
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center"
                                            }}
                                        >
                                            Estado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                                textAlign: "center"
                                            }}
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(tipos) && tipos.length > 0 ? (
                                        tipos.map(tipo => (
                                            <tr key={tipo.idtipodocumento}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {tipo.nombretipo}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {tipo.cantidadrepetir || "-"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {tipo.descripcion}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: tipo.estado ? "green" : "red",
                                                        fontWeight: "600",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {tipo.estado ? "Activo" : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(tipo)}
                                                        style={{
                                                            padding: "6px 14px",
                                                            background: " #FED7AA",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            marginRight: "6px"
                                                        }}
                                                    >
                                                        Editar
                                                    </button>

                                                    {tipo.estado ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(tipo.idtipodocumento)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#F87171",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                                fontSize: "14px"
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleActivate(tipo.idtipodocumento)}
                                                            style={{
                                                                padding: "6px 14px",
                                                                background: "#28a745",
                                                                color: "#fff",
                                                                border: "none",
                                                                borderRadius: "5px",
                                                                cursor: "pointer",
                                                                fontSize: "14px"
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
                                                colSpan="5"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px"
                                                }}
                                            >
                                                No hay tipos de documento registrados
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

export default TiposDocumentoContainer;
