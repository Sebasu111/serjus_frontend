// containers/ausencia/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const AusenciaContainer = () => {
    const [idEmpleado, setIdEmpleado] = useState("");
    const [tipo, setTipo] = useState("");
    const [motivo, setMotivo] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [idDocumento, setIdDocumento] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [ausencias, setAusencias] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAusencias();
    }, []);

    const fetchAusencias = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/ausencias/");
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                ? res.data.results
                : [];
            setAusencias(data);
        } catch (error) {
            console.error("Error al cargar ausencias:", error);
            setAusencias([]);
            setMensaje("Error al cargar las ausencias");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                idempleado: idEmpleado || null,
                tipo,
                motivo,
                fechainicio: fechaInicio,
                fechafin: fechaFin || null,
                iddocumento: idDocumento,
                estado: estadoActivo,
                idusuario: 1, // reemplazar con usuario logueado
            };

            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/ausencias/${editingId}/`,
                    data
                );
                setMensaje("Ausencia actualizada correctamente");
            } else {
                await axios.post("http://127.0.0.1:8000/api/ausencias/", data);
                setMensaje("Ausencia registrada correctamente");
            }

            // Reset form
            setIdEmpleado("");
            setTipo("");
            setMotivo("");
            setFechaInicio("");
            setFechaFin("");
            setIdDocumento("");
            setEstadoActivo(true);
            setEditingId(null);

            fetchAusencias();
        } catch (error) {
            console.error(
                "Error al guardar ausencia:",
                error.response?.data || error
            );
            setMensaje("Error al registrar la ausencia");
        }
    };

    const handleEdit = (ausencia) => {
        setIdEmpleado(ausencia.idempleado || "");
        setTipo(ausencia.tipo);
        setMotivo(ausencia.motivo);
        setFechaInicio(ausencia.fechainicio);
        setFechaFin(ausencia.fechafin || "");
        setIdDocumento(ausencia.iddocumento);
        setEstadoActivo(ausencia.estado);
        setEditingId(ausencia.idausencia);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de desactivar esta ausencia?"))
            return;
        try {
            const aus = ausencias.find((a) => a.idausencia === id);
            if (!aus) return;

            await axios.put(`http://127.0.0.1:8000/api/ausencias/${id}/`, {
                ...aus,
                estado: false,
            });

            setMensaje("Ausencia desactivada correctamente");
            fetchAusencias();
        } catch (error) {
            console.error(
                "Error al desactivar ausencia:",
                error.response?.data || error
            );
            setMensaje("Error al desactivar la ausencia");
        }
    };

    const handleActivate = async (id) => {
        try {
            const aus = ausencias.find((a) => a.idausencia === id);
            if (!aus) return;

            await axios.put(`http://127.0.0.1:8000/api/ausencias/${id}/`, {
                ...aus,
                estado: true,
            });

            setMensaje("Ausencia activada correctamente");
            fetchAusencias();
        } catch (error) {
            console.error(
                "Error al activar ausencia:",
                error.response?.data || error
            );
            setMensaje("Error al activar la ausencia");
        }
    };

    return (
        <Layout>
            <SEO title="Hope – Ausencias" />
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
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
                                    ? "Editar Ausencia"
                                    : "Registrar nueva Ausencia"}
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
                                    <label>ID Empleado</label>
                                    <input
                                        type="number"
                                        value={idEmpleado}
                                        onChange={(e) =>
                                            setIdEmpleado(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Tipo</label>
                                    <input
                                        type="text"
                                        value={tipo}
                                        onChange={(e) =>
                                            setTipo(e.target.value)
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Motivo</label>
                                    <input
                                        type="text"
                                        value={motivo}
                                        onChange={(e) =>
                                            setMotivo(e.target.value)
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={fechaInicio}
                                        onChange={(e) =>
                                            setFechaInicio(e.target.value)
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={fechaFin}
                                        onChange={(e) =>
                                            setFechaFin(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <label>ID Documento</label>
                                    <input
                                        type="number"
                                        value={idDocumento}
                                        onChange={(e) =>
                                            setIdDocumento(e.target.value)
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "20px" }}>
                                    <input
                                        type="checkbox"
                                        checked={estadoActivo}
                                        onChange={(e) =>
                                            setEstadoActivo(e.target.checked)
                                        }
                                    />{" "}
                                    Activo
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        background: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                    }}
                                >
                                    {editingId ? "Actualizar" : "Guardar"}
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
                                Ausencias Registradas
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
                                            }}
                                        >
                                            Empleado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Tipo
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Motivo
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Fecha Inicio
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Fecha Fin
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Documento
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Estado
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "2px solid #eee",
                                                padding: "10px",
                                            }}
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ausencias.length > 0 ? (
                                        ausencias.map((a) => (
                                            <tr key={a.idausencia}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.idempleado || "N/A"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.tipo}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.motivo}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.fechainicio}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.fechafin || "N/A"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    {a.iddocumento}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: a.estado
                                                            ? "green"
                                                            : "red",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {a.estado
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(a)
                                                        }
                                                        style={{
                                                            padding: "6px 14px",
                                                            background:
                                                                "#ffc107",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "5px",
                                                            marginRight: "6px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    {a.estado ? (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    a.idausencia
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
                                                            }}
                                                        >
                                                            Desactivar
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleActivate(
                                                                    a.idausencia
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
                                                colSpan="8"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px",
                                                }}
                                            >
                                                No hay ausencias registradas
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

export default AusenciaContainer;
