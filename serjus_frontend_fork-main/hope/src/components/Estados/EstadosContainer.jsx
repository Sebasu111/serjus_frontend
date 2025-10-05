// containers/estados/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const EstadosContainer = () => {
    const [nombreEstado, setNombreEstado] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [estados, setEstados] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchEstados();
    }, []);

    const fetchEstados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/estados/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setEstados(data);
        } catch (error) {
            console.error("Error al cargar estados:", error);
            setEstados([]);
            setMensaje("Error al cargar los estados");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                nombreestado: nombreEstado,
                descripcion,
                estado: estadoActivo,
                idusuario: 1,
            };
            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/estados/${editingId}/`,
                    data
                );
                setMensaje("Estado actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/estados/", data);
                setMensaje("Estado registrado correctamente");
            }
            setNombreEstado("");
            setDescripcion("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchEstados();
        } catch (error) {
            console.error("Error al guardar estado:", error);
            setMensaje("Error al registrar el estado");
        }
    };

    const handleEdit = (estado) => {
        setNombreEstado(estado.nombreestado);
        setDescripcion(estado.descripcion);
        setEstadoActivo(estado.estado);
        setEditingId(estado.idestado);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Borrado lógico (desactivar)
    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar este estado?")) return;
        try {
            const estado = estados.find((e) => e.idestado === id);
            if (!estado) return;

            await axios.put(`http://127.0.0.1:8000/api/estados/${id}/`, {
                nombreestado: estado.nombreestado,
                descripcion: estado.descripcion,
                estado: false,
                idusuario: estado.idusuario,
            });

            setMensaje("Estado desactivado correctamente");
            fetchEstados();
        } catch (error) {
            console.error(
                "Error al desactivar estado:",
                error.response?.data || error
            );
            setMensaje("Error al desactivar el estado");
        }
    };

    // Activar estado
    const handleActivate = async (id) => {
        try {
            const estado = estados.find((e) => e.idestado === id);
            if (!estado) return;

            await axios.put(`http://127.0.0.1:8000/api/estados/${id}/`, {
                nombreestado: estado.nombreestado,
                descripcion: estado.descripcion,
                estado: true,
                idusuario: estado.idusuario,
            });

            setMensaje("Estado activado correctamente");
            fetchEstados();
        } catch (error) {
            console.error(
                "Error al activar estado:",
                error.response?.data || error
            );
            setMensaje("Error al activar el estado");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Estados" />
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
                                    ? "Editar estado"
                                    : "Registrar un nuevo estado"}
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
                                        htmlFor="nombreEstado"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Nombre del estado
                                    </label>
                                    <input
                                        type="text"
                                        id="nombreEstado"
                                        value={nombreEstado}
                                        onChange={(e) =>
                                            setNombreEstado(e.target.value)
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

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="descripcion"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        id="descripcion"
                                        value={descripcion}
                                        onChange={(e) =>
                                            setDescripcion(e.target.value)
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
                                        id="estadoActivo"
                                        checked={estadoActivo}
                                        onChange={(e) =>
                                            setEstadoActivo(e.target.checked)
                                        }
                                        style={{
                                            width: "18px",
                                            height: "18px",
                                        }}
                                    />
                                    <label
                                        htmlFor="estadoActivo"
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
                                        ? "Actualizar Estado"
                                        : "Guardar Estado"}
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
                                Estados Registrados
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
                                                textAlign: "left",
                                            }}
                                        >
                                            Descripción
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
                                    {Array.isArray(estados) &&
                                    estados.length > 0 ? (
                                        estados.map((estado) => (
                                            <tr key={estado.idestado}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {estado.nombreestado}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {estado.descripcion}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: estado.estado
                                                            ? "green"
                                                            : "red",
                                                        fontWeight: "600",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {estado.estado
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
                                                            handleEdit(estado)
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

                                                    {estado.estado ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    estado.idestado
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
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleActivate(
                                                                    estado.idestado
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
                                                colSpan="4"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px",
                                                }}
                                            >
                                                No hay estados registrados
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

export default EstadosContainer;
