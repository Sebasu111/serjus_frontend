// containers/terminacionlaboral/index.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { buildApiUrl, buildApiUrlWithId, API_CONFIG } from "../../config/api.js";

const TerminacionLaboralContainer = () => {
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
    const [tipoTerminacion, setTipoTerminacion] = useState("");
    const [fechaTerminacion, setFechaTerminacion] = useState(new Date().toISOString().split('T')[0]); // Fecha actual automática
    const [causa, setCausa] = useState("");
    const [observacion, setObservacion] = useState("");
    const [documentoPdf, setDocumentoPdf] = useState(null);
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [terminaciones, setTerminaciones] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchTerminaciones(),
            fetchEmpleados(),
            fetchContratos()
        ]);
    };

    const fetchTerminaciones = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.TERMINACIONLABORAL || 'terminacionlaboral');
            const res = await axios.get(apiUrl);
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            setTerminaciones(data);
        } catch (error) {
            console.error("Error al cargar terminaciones:", error);
            setTerminaciones([]);
            showToast("Error al cargar las terminaciones", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.EMPLEADOS);
            const response = await axios.get(apiUrl);
            const empleadosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setEmpleados(empleadosData);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
            setEmpleados([]);
        }
    };

    const fetchContratos = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.CONTRATOS);
            const response = await axios.get(apiUrl);
            const contratosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            // Solo contratos activos
            setContratos(contratosData.filter(contrato => contrato.estado === true));
        } catch (error) {
            console.error("Error al cargar contratos:", error);
            setContratos([]);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        
        // Validar campos obligatorios
        if (!empleadoSeleccionado) {
            showToast("Debe seleccionar un empleado", "error");
            return;
        }
        if (!causa.trim()) {
            showToast("La causa es obligatoria", "error");
            return;
        }
        
        try {
            // Buscar el contrato activo del empleado seleccionado
            const contratoEmpleado = contratos.find(contrato => {
                // Aquí asumimos que el contrato tiene un campo que lo relaciona con el empleado
                // Esto puede variar según tu estructura de BD
                return contrato.idempleado === empleadoSeleccionado || 
                       contrato.empleado_id === empleadoSeleccionado;
            });

            if (!contratoEmpleado && !editingId) {
                showToast("No se encontró un contrato activo para este empleado", "error");
                return;
            }

            // Preparar datos de la terminación
            const terminacionData = {
                tipoterminacion: tipoTerminacion,
                fechaterminacion: fechaTerminacion,
                causa: causa,
                observacion: observacion || "",
                idempleado: empleadoSeleccionado,
                idcontrato: contratoEmpleado?.idcontrato || null,
                estado: estadoActivo,
                idusuario: 1 // reemplazar con usuario logueado
            };

            let terminacionCreada = null;

            if (editingId) {
                const apiUrl = buildApiUrlWithId(API_CONFIG.ENDPOINTS.TERMINACIONLABORAL || 'terminacionlaboral', editingId);
                await axios.put(apiUrl, terminacionData);
                showToast("Terminación actualizada correctamente", "success");
            } else {
                const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.TERMINACIONLABORAL || 'terminacionlaboral');
                const response = await axios.post(apiUrl, terminacionData);
                terminacionCreada = response.data;
                showToast("Terminación registrada correctamente", "success");

                // Finalizar (inactivar) el contrato automáticamente
                if (contratoEmpleado) {
                    try {
                        const contratoApiUrl = buildApiUrlWithId(API_CONFIG.ENDPOINTS.CONTRATOS, contratoEmpleado.idcontrato);
                        await axios.patch(contratoApiUrl, { estado: false });
                        showToast("Contrato finalizado automáticamente", "info");
                    } catch (contratoError) {
                        console.error("Error al finalizar contrato:", contratoError);
                        showToast("Terminación creada pero error al finalizar contrato", "warning");
                    }
                }
            }

            // Reset form
            resetForm();
            fetchAllData();
        } catch (error) {
            console.error("Error al guardar terminación:", error);
            showToast("Error al registrar la terminación", "error");
        }
    };

    const resetForm = () => {
        setEmpleadoSeleccionado("");
        setTipoTerminacion("");
        setFechaTerminacion(new Date().toISOString().split('T')[0]);
        setCausa("");
        setObservacion("");
        setDocumentoPdf(null);
        setEstadoActivo(true);
        setEditingId(null);
    };

    const handleEdit = terminacion => {
        setEmpleadoSeleccionado(terminacion.idempleado || "");
        setTipoTerminacion(terminacion.tipoterminacion);
        setFechaTerminacion(terminacion.fechaterminacion);
        setCausa(terminacion.causa || "");
        setObservacion(terminacion.observacion || "");
        setEstadoActivo(terminacion.estado);
        setEditingId(terminacion.idterminacionlaboral);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async id => {
        if (!window.confirm("¿Estás seguro de desactivar esta terminación?")) return;
        try {
            const terminacion = terminaciones.find(t => t.idterminacionlaboral === id);
            if (!terminacion) return;

            const apiUrl = buildApiUrlWithId(API_CONFIG.ENDPOINTS.TERMINACIONLABORAL || 'terminacionlaboral', id);
            await axios.put(apiUrl, {
                ...terminacion,
                estado: false
            });

            showToast("Terminación desactivada correctamente", "success");
            fetchTerminaciones();
        } catch (error) {
            console.error("Error al desactivar terminación:", error.response?.data || error);
            showToast("Error al desactivar la terminación", "error");
        }
    };

    const handleActivate = async id => {
        try {
            const terminacion = terminaciones.find(t => t.idterminacionlaboral === id);
            if (!terminacion) return;

            const apiUrl = buildApiUrlWithId(API_CONFIG.ENDPOINTS.TERMINACIONLABORAL || 'terminacionlaboral', id);
            await axios.put(apiUrl, {
                ...terminacion,
                estado: true
            });

            showToast("Terminación activada correctamente", "success");
            fetchTerminaciones();
        } catch (error) {
            console.error("Error al activar terminación:", error.response?.data || error);
            showToast("Error al activar la terminación", "error");
        }
    };

    return (
        <Layout>
            <SEO title="Terminaciones Laborales" />
            <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Header />

                <main style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5" }}>
                    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
                            <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#023047", fontFamily: '"Inter", sans-serif' }}>
                                {editingId ? "Editar Terminación Laboral" : "Registrar Terminación Laboral"}
                            </h2>
                            
                            <form onSubmit={handleSubmit}>
                                {/* Selección de Empleado */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Empleado <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <select
                                        value={empleadoSeleccionado}
                                        onChange={e => setEmpleadoSeleccionado(e.target.value)}
                                        required
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                            fontFamily: '"Inter", sans-serif'
                                        }}
                                    >
                                        <option value="">Seleccionar empleado...</option>
                                        {empleados.map(empleado => {
                                            const nombreCompleto = `${empleado.nombre || empleado.primernombre || ''} ${empleado.apellido || empleado.primerapellido || ''}`.trim();
                                            return (
                                                <option key={empleado.idempleado} value={empleado.idempleado}>
                                                    {nombreCompleto}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                {/* Fecha de Terminación (automática, estilo azul) */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif',
                                        color: "#1976d2"
                                    }}>
                                        Fecha de terminación:
                                    </label>
                                    <div style={{
                                        padding: "12px",
                                        backgroundColor: "#e3f2fd",
                                        border: "1px solid #2196f3",
                                        borderRadius: "6px",
                                        fontSize: "16px",
                                        color: "#0d47a1",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        {new Date(fechaTerminacion).toLocaleDateString('es-GT', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {/* Tipo de Terminación */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Tipo de Terminación <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <select
                                        value={tipoTerminacion}
                                        onChange={e => setTipoTerminacion(e.target.value)}
                                        required
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                            fontFamily: '"Inter", sans-serif'
                                        }}
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        <option value="Renuncia voluntaria">Renuncia voluntaria</option>
                                        <option value="Despido con causa justa">Despido con causa justa</option>
                                        <option value="Despido sin causa justa">Despido sin causa justa</option>
                                        <option value="Fin de contrato temporal">Fin de contrato temporal</option>
                                        <option value="Mutuo acuerdo">Mutuo acuerdo</option>
                                        <option value="Jubilación">Jubilación</option>
                                    </select>
                                </div>

                                {/* Causa (obligatoria) */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Causa <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <textarea
                                        value={causa}
                                        onChange={e => setCausa(e.target.value)}
                                        required
                                        placeholder="Describa la causa de la terminación laboral..."
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                            fontFamily: '"Inter", sans-serif',
                                            minHeight: "80px",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                {/* Observación (opcional) */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Observación (opcional)
                                    </label>
                                    <textarea
                                        value={observacion}
                                        onChange={e => setObservacion(e.target.value)}
                                        placeholder="Observaciones adicionales..."
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                            fontFamily: '"Inter", sans-serif',
                                            minHeight: "60px",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                {/* Documento PDF */}
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ 
                                        display: "block", 
                                        marginBottom: "8px", 
                                        fontWeight: "bold",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Documento de terminación (solo PDF)
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={e => setDocumentoPdf(e.target.files[0])}
                                        style={{ 
                                            width: "100%", 
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "6px",
                                            fontSize: "14px",
                                            fontFamily: '"Inter", sans-serif'
                                        }}
                                    />
                                    <small style={{ 
                                        color: "#666", 
                                        fontSize: "12px",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Solo se permiten archivos PDF
                                    </small>
                                </div>

                                {/* Botón de envío */}
                                <button
                                    type="submit"
                                    style={{
                                        width: "100%",
                                        padding: "14px",
                                        background: "#023047",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        fontFamily: '"Inter", sans-serif',
                                        transition: "background-color 0.3s"
                                    }}
                                    onMouseOver={e => e.target.style.backgroundColor = "#034a6b"}
                                    onMouseOut={e => e.target.style.backgroundColor = "#023047"}
                                >
                                    {editingId ? "Actualizar Terminación" : "Finalizar Contrato y Registrar"}
                                </button>
                                
                                {!editingId && (
                                    <p style={{
                                        marginTop: "10px",
                                        fontSize: "13px",
                                        color: "#666",
                                        textAlign: "center",
                                        fontFamily: '"Inter", sans-serif'
                                    }}>
                                        Al registrar la terminación, el contrato del empleado se finalizará automáticamente
                                    </p>
                                )}
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
                            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                                Terminaciones Laborales Registradas
                            </h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ 
                                    width: "100%", 
                                    borderCollapse: "collapse",
                                    fontFamily: '"Inter", sans-serif',
                                    fontSize: "14px"
                                }}>
                                    <thead>
                                        <tr>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "left",
                                                fontWeight: "600"
                                            }}>Empleado</th>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "left",
                                                fontWeight: "600"
                                            }}>Tipo</th>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "left",
                                                fontWeight: "600"
                                            }}>Fecha</th>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "left",
                                                fontWeight: "600"
                                            }}>Causa</th>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "left",
                                                fontWeight: "600"
                                            }}>Estado</th>
                                            <th style={{ 
                                                borderBottom: "2px solid #023047", 
                                                padding: "12px 8px", 
                                                backgroundColor: "#023047",
                                                color: "white",
                                                textAlign: "center",
                                                fontWeight: "600"
                                            }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {terminaciones.length > 0 ? (
                                            terminaciones.map(t => {
                                                const empleado = empleados.find(emp => emp.idempleado === t.idempleado);
                                                const nombreEmpleado = empleado ? 
                                                    `${empleado.nombre || empleado.primernombre || ''} ${empleado.apellido || empleado.primerapellido || ''}`.trim() 
                                                    : 'N/A';
                                                
                                                return (
                                                    <tr key={t.idterminacionlaboral} style={{ 
                                                        backgroundColor: t.estado ? 'white' : '#f8f9fa' 
                                                    }}>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top"
                                                        }}>
                                                            {nombreEmpleado}
                                                        </td>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top"
                                                        }}>
                                                            {t.tipoterminacion}
                                                        </td>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top"
                                                        }}>
                                                            {new Date(t.fechaterminacion).toLocaleDateString('es-GT')}
                                                        </td>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top",
                                                            maxWidth: "200px"
                                                        }}>
                                                            <div style={{ 
                                                                overflow: "hidden", 
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap"
                                                            }} title={t.causa}>
                                                                {t.causa}
                                                            </div>
                                                        </td>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top"
                                                        }}>
                                                            <span style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                backgroundColor: t.estado ? '#d4edda' : '#f8d7da',
                                                                color: t.estado ? '#155724' : '#721c24'
                                                            }}>
                                                                {t.estado ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                        <td style={{ 
                                                            padding: "10px 8px", 
                                                            textAlign: "center",
                                                            borderBottom: "1px solid #eee",
                                                            verticalAlign: "top"
                                                        }}>
                                                            <button
                                                                onClick={() => handleEdit(t)}
                                                                style={{
                                                                    padding: "6px 12px",
                                                                    background: "#007bff",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius: "4px",
                                                                    marginRight: "6px",
                                                                    cursor: "pointer",
                                                                    fontSize: "12px",
                                                                    fontWeight: "500"
                                                                }}
                                                            >
                                                                Editar
                                                            </button>
                                                            {t.estado ? (
                                                                <button
                                                                    onClick={() => handleDelete(t.idterminacionlaboral)}
                                                                    style={{
                                                                        padding: "6px 12px",
                                                                        background: "#6c757d",
                                                                        color: "#fff",
                                                                        border: "none",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        fontWeight: "500"
                                                                    }}
                                                                >
                                                                    Inactivar
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivate(t.idterminacionlaboral)}
                                                                    style={{
                                                                        padding: "6px 12px",
                                                                        background: "#28a745",
                                                                        color: "#fff",
                                                                        border: "none",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                        fontSize: "12px",
                                                                        fontWeight: "500"
                                                                    }}
                                                                >
                                                                    Activar
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={{ 
                                                    textAlign: "center", 
                                                    padding: "40px",
                                                    color: "#666",
                                                    fontStyle: "italic"
                                                }}>
                                                    No hay terminaciones laborales registradas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default TerminacionLaboralContainer;
