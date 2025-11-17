// containers/roles/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header/index.jsx";
import Footer from "../../layouts/footer/index.jsx";
import ScrollToTop from "../../components/scroll-to-top/index.jsx";
import SEO from "../../components/seo/index.jsx";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const RolesContainer = () => {
    const [nombreRol, setNombreRol] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [roles, setRoles] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get(`${API}/roles/`);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setRoles(data);
        } catch (error) {
            console.error("Error al cargar roles:", error);
            setRoles([]);
            setMensaje("Error al cargar los roles");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = {
                nombrerol: nombreRol,
                descripcion,
                estado: estadoActivo,
                idusuario: 1 // puedes reemplazar con usuario logueado
            };
            if (editingId) {
                await axios.put(`${API}/roles/${editingId}/`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
                setMensaje("Rol actualizado correctamente");
            } else {
                await axios.post(`${API}/roles/`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
                setMensaje("Rol registrado correctamente");
            }
            setNombreRol("");
            setDescripcion("");
            setEstadoActivo(true);
            setEditingId(null);
            fetchRoles();
        } catch (error) {
            console.error("Error al guardar rol:", error);
            setMensaje("Error al registrar el rol");
        }
    };

    const handleEdit = rol => {
        setNombreRol(rol.nombrerol);
        setDescripcion(rol.descripcion);
        setEstadoActivo(rol.estado);
        setEditingId(rol.idrol);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Está seguro de desactivar este rol?")) return;
        try {
            const rol = roles.find(r => r.idrol === id);
            if (!rol) return;

            await axios.put(`${API}/roles/${id}/`, {
                nombrerol: rol.nombrerol,
                descripcion: rol.descripcion,
                estado: false,
                idusuario: rol.idusuario
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje("Rol desactivado correctamente");
            fetchRoles();
        } catch (error) {
            console.error("Error al desactivar rol:", error.response?.data || error);
            setMensaje("Error al desactivar el rol");
        }
    };

    const handleActivate = async id => {
        try {
            const rol = roles.find(r => r.idrol === id);
            if (!rol) return;

            await axios.put(`${API}/roles/${id}/`, {
                nombrerol: rol.nombrerol,
                descripcion: rol.descripcion,
                estado: true,
                idusuario: rol.idusuario
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensaje("Rol activado correctamente");
            fetchRoles();
        } catch (error) {
            console.error("Error al activar rol:", error.response?.data || error);
            setMensaje("Error al activar el rol");
        }
    };

    return (
        <Layout>
            <SEO title="Roles" />
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
                                {editingId ? "Editar rol" : "Registrar un nuevo rol"}
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
                                        htmlFor="nombreRol"
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Nombre del rol
                                    </label>
                                    <input
                                        type="text"
                                        id="nombreRol"
                                        value={nombreRol}
                                        onChange={e => setNombreRol(e.target.value)}
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
                                    {editingId ? "Actualizar Rol" : "Guardar Rol"}
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
                                Roles Registrados
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
                                    {Array.isArray(roles) && roles.length > 0 ? (
                                        roles.map(rol => (
                                            <tr key={rol.idrol}>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {rol.nombrerol}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {rol.descripcion}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "10px",
                                                        textAlign: "center",
                                                        color: rol.estado ? "green" : "red",
                                                        fontWeight: "600",
                                                        borderBottom: "1px solid #f0f0f0"
                                                    }}
                                                >
                                                    {rol.estado ? "Activo" : "Inactivo"}
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
                                                        onClick={() => handleEdit(rol)}
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

                                                    {rol.estado ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(rol.idrol)}
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
                                                            onClick={() => handleActivate(rol.idrol)}
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
                                                colSpan="4"
                                                style={{
                                                    textAlign: "center",
                                                    padding: "20px"
                                                }}
                                            >
                                                No hay roles registrados
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

export default RolesContainer;
