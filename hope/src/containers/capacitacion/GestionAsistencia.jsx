import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
import { X } from "lucide-react";

const GestionAsistencia = ({ visible, onClose, capacitacion, empleadosAsignados = [], onRefresh }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [usuarioRol, setUsuarioRol] = useState("");

    useEffect(() => {
        if (visible) {
            verificarRolUsuario();
            setEmpleados(empleadosAsignados.map(emp => ({
                ...emp,
                idempleado: emp.idempleado || emp.id,
                asistenciaTemp: emp.asistencia || "no",
                observacionTemp: emp.observacion || "",
                documentoTemp: emp.documento || null
            })));
        }
    }, [visible, empleadosAsignados]);

    const verificarRolUsuario = async () => {
        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            const res = await axios.get(`http://127.0.0.1:8000/api/usuarios/${idUsuario}/`);

            // Obtener información del rol
            const rolRes = await axios.get(`http://127.0.0.1:8000/api/roles/${res.data.idrol}/`);
            setUsuarioRol(rolRes.data.nombre?.toLowerCase() || "");
        } catch (error) {
            console.error("Error al verificar rol:", error);
            setUsuarioRol("");
        }
    };

    const puedeMarcarAsistencia = () => {
        return usuarioRol === "coordinador" || usuarioRol === "administrador";
    };

    const actualizarAsistencia = (index, campo, valor) => {
        setEmpleados(prev => prev.map((emp, i) =>
            i === index ? { ...emp, [`${campo}Temp`]: valor } : emp
        ));
    };

    const guardarCambios = async () => {
        if (!puedeMarcarAsistencia()) {
            showToast("No tiene permisos para marcar asistencia", "warning");
            return;
        }

        try {
            setLoading(true);

            for (const empleado of empleados) {
                if (empleado.asistenciaTemp !== empleado.asistencia ||
                    empleado.observacionTemp !== empleado.observacion) {

                    // Buscar la asignación específica
                    const resAsignaciones = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
                    const asignaciones = resAsignaciones.data.results || resAsignaciones.data;

                    const asignacion = asignaciones.find(asig =>
                        Number(asig.idempleado) === empleado.idempleado &&
                        Number(asig.idcapacitacion) === (capacitacion.idcapacitacion || capacitacion.id)
                    );

                    if (asignacion) {
                        const payload = {
                            ...asignacion,
                            asistencia: empleado.asistenciaTemp,
                            observacion: empleado.observacionTemp,
                            idusuario: Number(sessionStorage.getItem("idUsuario"))
                        };

                        await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${asignacion.id}/`, payload);
                    }
                }
            }

            showToast("Asistencia actualizada correctamente", "success");
            if (onRefresh) onRefresh();
            onClose();
        } catch (error) {
            console.error("Error al guardar asistencia:", error);
            showToast("Error al guardar asistencia", "error");
        } finally {
            setLoading(false);
        }
    };

    const subirDocumento = async (empleadoIndex, file) => {
        try {
            const formData = new FormData();
            formData.append('archivo', file);
            formData.append('nombre', `Informe_${empleados[empleadoIndex].nombre}_${empleados[empleadoIndex].apellido}`);
            formData.append('descripcion', `Informe de capacitación: ${capacitacion.nombreevento}`);
            formData.append('idusuario', sessionStorage.getItem("idUsuario"));

            const resDoc = await axios.post("http://127.0.0.1:8000/api/documentos/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Actualizar la asignación con el documento
            const resAsignaciones = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
            const asignaciones = resAsignaciones.data.results || resAsignaciones.data;

            const asignacion = asignaciones.find(asig =>
                Number(asig.idempleado) === empleados[empleadoIndex].idempleado &&
                Number(asig.idcapacitacion) === (capacitacion.idcapacitacion || capacitacion.id)
            );

            if (asignacion) {
                await axios.put(`http://127.0.0.1:8000/api/empleadocapacitacion/${asignacion.id}/`, {
                    ...asignacion,
                    iddocumento: resDoc.data.iddocumento,
                    fechaenvio: new Date().toISOString().split('T')[0],
                    idusuario: Number(sessionStorage.getItem("idUsuario"))
                });

                // Actualizar el estado local
                actualizarAsistencia(empleadoIndex, "documento", {
                    nombrearchivo: resDoc.data.nombrearchivo,
                    archivo_url: resDoc.data.archivo_url
                });

                showToast("Documento subido correctamente", "success");
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error("Error al subir documento:", error);
            showToast("Error al subir documento", "error");
        }
    };

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>
            <div style={{
                width: "min(900px, 95vw)",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0 }}>Gestión de Asistencia - {capacitacion.nombreevento}</h3>
                    <button onClick={onClose} style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px"
                    }}>
                        <X size={24} color="#555" />
                    </button>
                </div>

                {!puedeMarcarAsistencia() && (
                    <div style={{
                        background: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        borderRadius: "6px",
                        padding: "12px",
                        marginBottom: "20px",
                        color: "#856404"
                    }}>
                        <strong>Atención:</strong> Solo coordinadores y administradores pueden marcar asistencia y gestionar documentos.
                    </div>
                )}

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Colaborador</th>
                                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>Asistencia</th>
                                <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Justificación/Observación</th>
                                <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>Informe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map((empleado, index) => (
                                <tr key={empleado.idempleado}>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                                        {empleado.nombre} {empleado.apellido}
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                                        <select
                                            value={empleado.asistenciaTemp}
                                            onChange={(e) => actualizarAsistencia(index, "asistencia", e.target.value)}
                                            disabled={!puedeMarcarAsistencia()}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: "4px",
                                                border: "1px solid #ced4da",
                                                backgroundColor: !puedeMarcarAsistencia() ? "#e9ecef" : "#fff"
                                            }}
                                        >
                                            <option value="no">No asistió</option>
                                            <option value="sí">Sí asistió</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                                        <textarea
                                            value={empleado.observacionTemp}
                                            onChange={(e) => actualizarAsistencia(index, "observacion", e.target.value)}
                                            disabled={!puedeMarcarAsistencia() || empleado.asistenciaTemp !== "sí"}
                                            placeholder={empleado.asistenciaTemp === "sí" ? "Observaciones sobre la participación..." : "Justificación de la ausencia..."}
                                            style={{
                                                width: "100%",
                                                minHeight: "60px",
                                                padding: "8px",
                                                borderRadius: "4px",
                                                border: "1px solid #ced4da",
                                                resize: "vertical",
                                                backgroundColor: (!puedeMarcarAsistencia() || empleado.asistenciaTemp !== "sí") ? "#e9ecef" : "#fff"
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #dee2e6" }}>
                                        {empleado.asistenciaTemp === "sí" && puedeMarcarAsistencia() ? (
                                            <div>
                                                {empleado.documentoTemp ? (
                                                    <a
                                                        href={empleado.documentoTemp.archivo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "#007bff", textDecoration: "underline" }}
                                                    >
                                                        Ver documento
                                                    </a>
                                                ) : (
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt"
                                                        onChange={(e) => {
                                                            if (e.target.files[0]) {
                                                                subirDocumento(index, e.target.files[0]);
                                                            }
                                                        }}
                                                        style={{ fontSize: "12px" }}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: "#6c757d", fontSize: "14px" }}>
                                                {empleado.asistenciaTemp === "no" ? "No disponible" : "Marcar asistencia primero"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            background: "#6c757d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Cancelar
                    </button>
                    {puedeMarcarAsistencia() && (
                        <button
                            onClick={guardarCambios}
                            disabled={loading}
                            style={{
                                padding: "10px 20px",
                                background: loading ? "#ccc" : "#28a745",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GestionAsistencia;