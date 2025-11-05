import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const GestionarDocumentosModal = ({ induccion, onClose }) => {
    const [documentoPDF, setDocumentoPDF] = useState(null);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [fechaasignado, setFechaAsignado] = useState("");
    const [busquedaEmpleados, setBusquedaEmpleados] = useState("");

    // Opciones para dropdowns
    const [empleados, setEmpleados] = useState([]);

    useEffect(() => {
        if (induccion) {
            fetchEmpleados();
            // Inicializar fecha de asignado con fecha actual
            const fechaActual = new Date().toISOString().split('T')[0];
            setFechaAsignado(fechaActual);
        }
    }, [induccion]);



    const fetchEmpleados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setEmpleados(data.filter(item => item.estado));
        } catch (e) {
            console.error("Error al cargar colaboradores:", e);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            // Validaciones
            if (!documentoPDF || empleadosSeleccionados.length === 0) {
                showToast("Debe subir un documento PDF y seleccionar al menos un colaborador", "warning");
                return;
            }

            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const formData = new FormData();
            formData.append('idinduccion', Number(induccion.idinduccion));
            formData.append('documento_pdf', documentoPDF);
            formData.append('empleados', JSON.stringify(empleadosSeleccionados));
            formData.append('fechaasignado', fechaasignado);
            formData.append('idusuario', idUsuario);

            await axios.post("http://127.0.0.1:8000/api/inducciondocumentos/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showToast("Documentos de inducción asignados correctamente");
            
            // Resetear formulario
            setDocumentoPDF(null);
            setEmpleadosSeleccionados([]);

        } catch (error) {
            console.error("Error al asignar documentos:", error);
            showToast("Error al asignar documentos de inducción", "error");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showToast("Solo se permiten archivos PDF", "warning");
                e.target.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                showToast("El archivo no puede ser mayor a 10MB", "warning");
                e.target.value = '';
                return;
            }
            setDocumentoPDF(file);
        }
    };

    const toggleEmpleadoSeleccionado = (empleadoId) => {
        setEmpleadosSeleccionados(prev => {
            if (prev.includes(empleadoId)) {
                return prev.filter(id => id !== empleadoId);
            } else {
                return [...prev, empleadoId];
            }
        });
    };



    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "600px",
                    maxHeight: "80vh",
                    overflow: "auto",
                    padding: "30px",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <X size={24} color="#555" />
                </button>

                <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                    Asignar Documentos - {induccion?.nombre}
                </h2>

                {/* Formulario para asignar documentos */}
                <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <h3 style={{ marginBottom: "15px" }}>Asignar Documento a Colaboradores</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                    Documento PDF *
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px"
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                    Fecha de Asignado
                                </label>
                                <input
                                    type="date"
                                    value={fechaasignado}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #2196f3",
                                        borderRadius: "4px",
                                        backgroundColor: "#e3f2fd",
                                        color: "#1976d2",
                                        fontWeight: "600"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                                Seleccionar Colaboradores *
                            </label>
                            <div style={{
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                backgroundColor: "#f9fafb"
                            }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o apellido..."
                                    value={busquedaEmpleados}
                                    onChange={e => setBusquedaEmpleados(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        border: "none",
                                        borderBottom: "1px solid #e5e5e5",
                                        borderRadius: "6px 6px 0 0",
                                        outline: "none",
                                        backgroundColor: "#fff"
                                    }}
                                />
                                <div style={{ maxHeight: "150px", overflowY: "auto", padding: "8px" }}>
                                    {empleados.filter(emp => {
                                        const nombreCompleto = `${emp.nombre} ${emp.apellido}`.toLowerCase();
                                        return nombreCompleto.includes(busquedaEmpleados.toLowerCase());
                                    }).length > 0 ? (
                                        empleados.filter(emp => {
                                            const nombreCompleto = `${emp.nombre} ${emp.apellido}`.toLowerCase();
                                            return nombreCompleto.includes(busquedaEmpleados.toLowerCase());
                                        }).map(empleado => (
                                            <label
                                                key={empleado.idempleado}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    padding: "8px 6px",
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                    transition: "background-color 0.2s",
                                                    backgroundColor: empleadosSeleccionados.includes(empleado.idempleado)
                                                        ? "#e3f2fd" : "transparent"
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={empleadosSeleccionados.includes(empleado.idempleado)}
                                                    onChange={() => toggleEmpleadoSeleccionado(empleado.idempleado)}
                                                    style={{ width: "16px", height: "16px", accentColor: "#2196f3" }}
                                                />
                                                <span style={{ 
                                                    fontSize: "14px", 
                                                    fontWeight: empleadosSeleccionados.includes(empleado.idempleado) ? "500" : "normal" 
                                                }}>
                                                    {empleado.nombre} {empleado.apellido}
                                                </span>
                                            </label>
                                        ))
                                    ) : (
                                        <div style={{ padding: "20px", textAlign: "center", color: "#777", fontSize: "14px" }}>
                                            {busquedaEmpleados ? "No se encontraron colaboradores con ese nombre" : "No hay colaboradores disponibles"}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {empleadosSeleccionados.length > 0 && (
                                <div style={{
                                    marginTop: "8px",
                                    padding: "6px 8px",
                                    backgroundColor: "#e8f5e8",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                    color: "#2e7d32"
                                }}>
                                    {empleadosSeleccionados.length} colaborador{empleadosSeleccionados.length > 1 ? "es" : ""} seleccionado{empleadosSeleccionados.length > 1 ? "s" : ""}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%",
                                padding: "12px",
                                backgroundColor: "#219ebc",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Asignar a Colaboradores
                        </button>
                    </form>
                </div>


            </div>
        </div>
    );
};

export default GestionarDocumentosModal;