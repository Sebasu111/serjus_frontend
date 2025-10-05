// containers/puestos/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const PuestosContainer = () => {
    const [nombrePuesto, setNombrePuesto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [salarioBase, setSalarioBase] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [puestos, setPuestos] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchPuestos();
    }, []);

    const fetchPuestos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/puestos/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setPuestos(data);
        } catch (error) {
            console.error("Error al cargar puestos:", error);
            setPuestos([]);
            setMensaje("Error al cargar los puestos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                nombrepuesto: nombrePuesto,
                descripcion,
                salariobase: salarioBase,
                estado: estadoActivo,
                idusuario: 1, // puedes reemplazar con el usuario logueado
            };
            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/puestos/${editingId}/`,
                    data
                );
                setMensaje("Puesto actualizado correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/puestos/", data);
                setMensaje("Puesto registrado correctamente");
            }
            setNombrePuesto("");
            setDescripcion("");
            setSalarioBase("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchPuestos();
        } catch (error) {
            console.error("Error al guardar puesto:", error);
            setMensaje("Error al registrar el puesto");
        }
    };

    const handleEdit = (puesto) => {
        setNombrePuesto(puesto.nombrepuesto);
        setDescripcion(puesto.descripcion);
        setSalarioBase(puesto.salariobase);
        setEstadoActivo(puesto.estado);
        setEditingId(puesto.idpuesto);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar este puesto?")) return;
        try {
            const puesto = puestos.find((p) => p.idpuesto === id);
            if (!puesto) return;

            await axios.put(`http://127.0.0.1:8000/api/puestos/${id}/`, {
                nombrepuesto: puesto.nombrepuesto,
                descripcion: puesto.descripcion,
                salariobase: puesto.salariobase,
                estado: false,
                idusuario: puesto.idusuario,
            });

            setMensaje("Puesto desactivado correctamente");
            fetchPuestos();
        } catch (error) {
            console.error(
                "Error al desactivar puesto:",
                error.response?.data || error
            );
            setMensaje("Error al desactivar el puesto");
        }
    };

    const handleActivate = async (id) => {
        try {
            const puesto = puestos.find((p) => p.idpuesto === id);
            if (!puesto) return;

            await axios.put(`http://127.0.0.1:8000/api/puestos/${id}/`, {
                nombrepuesto: puesto.nombrepuesto,
                descripcion: puesto.descripcion,
                salariobase: puesto.salariobase,
                estado: true,
                idusuario: puesto.idusuario,
            });

            setMensaje("Puesto activado correctamente");
            fetchPuestos();
        } catch (error) {
            console.error(
                "Error al activar puesto:",
                error.response?.data || error
            );
            setMensaje("Error al activar el puesto");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Puestos" />
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
                                    ? "Editar puesto"
                                    : "Registrar un nuevo puesto"}
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
                                        htmlFor="nombrePuesto"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Nombre del puesto
                                    </label>
                                    <input
                                        type="text"
                                        id="nombrePuesto"
                                        value={nombrePuesto}
                                        onChange={(e) =>
                                            setNombrePuesto(e.target.value)
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

                                <div style={{ marginBottom: "20px" }}>
                                    <label
                                        htmlFor="salarioBase"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Salario base
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        id="salarioBase"
                                        value={salarioBase}
                                        onChange={(e) =>
                                            setSalarioBase(e.target.value)
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
                                        ? "Actualizar Puesto"
                                        : "Guardar Puesto"}
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
                                Puestos Registrados
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
                                                textAlign: "right",
                                            }}
                                        >
                                            Salario Base
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
                                    {Array.isArray(puestos) &&
                                    puestos.length > 0 ? (
                                        puestos.map((puesto) => (
                                            <tr key={puesto.idpuesto}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {puesto.nombrepuesto}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {puesto.descripcion}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "right",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    $
                                                    {parseFloat(
                                                        puesto.salariobase
                                                    ).toFixed(2)}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: puesto.estado
                                                            ? "green"
                                                            : "red",
                                                        fontWeight: "600",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {puesto.estado
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
                                                            handleEdit(puesto)
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

                                                    {puesto.estado ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    puesto.idpuesto
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
                                                                    puesto.idpuesto
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
                                                colSpan="5"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px",
                                                }}
                                            >
                                                No hay puestos registrados
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

export default PuestosContainer;
