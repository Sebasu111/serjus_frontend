import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;

const GestionAsistenciaModal = ({ visible, onClose, capacitacion, empleadosAsignados, onActualizar }) => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [modoDocumento, setModoDocumento] = useState(false);
    const [archivo, setArchivo] = useState(null);
    const [observacion, setObservacion] = useState("");
    const [subiendo, setSubiendo] = useState(false);
    const [documentoVisualizando, setDocumentoVisualizando] = useState(null);
    const [modalDocumentoVisible, setModalDocumentoVisible] = useState(false);

    const idRol = parseInt(sessionStorage.getItem("idRol"));
    const idUsuario = parseInt(sessionStorage.getItem("idUsuario"));
    const esCoordinadorOAdmin = [4, 5].includes(idRol);

    useEffect(() => {
        if (visible && empleadosAsignados) {
            setEmpleados(empleadosAsignados);
        }
    }, [visible, empleadosAsignados]);

    if (!visible || !capacitacion) return null;

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        const [year, month, day] = fecha.split("-");
        return `${day}-${month}-${year}`;
    };

    // Solo coordinadores/admins pueden marcar asistencia inicial
    const handleMarcarAsistencia = async (empleado, asistio) => {
        if (!esCoordinadorOAdmin) {
            showToast("No tiene permisos para marcar asistencia", "warning");
            return;
        }

        setLoading(true);
        try {
            // Actualizar asistencia del empleado en la capacitación
            await axios.put(`${API}/empleadocapacitacion/${empleado.idempleadocapacitacion}/`, {
                asistencia: asistio ? "Sí" : "No",
                confirmadopor: idUsuario,
                fechaconfirmacion: new Date().toISOString().slice(0, 10)
            });

            // Actualizar el estado local
            const nuevosEmpleados = empleados.map(emp =>
                emp.idempleadocapacitacion === empleado.idempleadocapacitacion
                    ? { ...emp, asistencia: asistio ? "Sí" : "No" }
                    : emp
            );
            setEmpleados(nuevosEmpleados);

            showToast(`Asistencia marcada como ${asistio ? "Sí" : "No"}`, "success");
            if (onActualizar) onActualizar();
        } catch (error) {
            console.error("Error al marcar asistencia:", error);
            showToast("Error al marcar asistencia", "error");
        } finally {
            setLoading(false);
        }
    };

    // Función para permitir al empleado subir documentos después de confirmada su asistencia
    const handleAbrirDocumento = (empleado) => {
        // Verificar si es el empleado actual y ya tiene asistencia confirmada
        const esElEmpleado = empleado.idempleado === idUsuario;
        const tieneAsistenciaConfirmada = empleado.asistencia && empleado.asistencia !== "";

        if (!esElEmpleado) {
            showToast("Solo puede subir sus propios documentos", "warning");
            return;
        }

        if (!tieneAsistenciaConfirmada) {
            showToast("Debe esperar a que un coordinador confirme su asistencia", "warning");
            return;
        }

        setEmpleadoSeleccionado(empleado);
        setModoDocumento(true);
    };

    const handleVerDocumento = (empleado) => {
        if (!empleado.documento) {
            showToast("No hay documento disponible", "warning");
            return;
        }

        setDocumentoVisualizando({
            ...empleado.documento,
            empleado: `${empleado.nombre} ${empleado.apellido}`,
            asistencia: empleado.asistencia,
            tipoDocumento: empleado.asistencia === "Sí" ? "Informe de Asistencia" : "Justificación de Ausencia"
        });
        setModalDocumentoVisible(true);
    };

    const handleDescargarDocumento = (documento) => {
        if (!documento.archivo_url) {
            showToast("URL del documento no disponible", "warning");
            return;
        }

        const link = document.createElement('a');
        link.href = documento.archivo_url;
        link.download = documento.nombrearchivo || 'documento.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const subirDocumento = async () => {
        if (!archivo) {
            showToast("Debe seleccionar un archivo PDF", "warning");
            return;
        }

        if (archivo.type !== "application/pdf") {
            showToast("Solo se permiten archivos PDF", "warning");
            return;
        }

        setSubiendo(true);
        try {
            const formData = new FormData();
            formData.append("archivo", archivo);
            formData.append("nombrearchivo", archivo.name);
            formData.append("mimearchivo", "pdf");
            formData.append("fechasubida", new Date().toISOString().slice(0, 10));
            formData.append("idusuario", idUsuario);
            formData.append("idtipodocumento", 2);
            formData.append("idempleado", empleadoSeleccionado.idempleado);

            const resDoc = await axios.post(`${API}/documentos/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // Actualizar el empleado con el documento
            await axios.put(`${API}/empleadocapacitacion/${empleadoSeleccionado.idempleadocapacitacion}/`, {
                iddocumento: resDoc.data.iddocumento,
                observacion: observacion || "Documento subido",
                fechaenvio: new Date().toISOString().slice(0, 10)
            });

            const tipoDocumento = empleadoSeleccionado.asistencia === "Sí" ? "informe de asistencia" : "justificación de ausencia";
            showToast(`${tipoDocumento} subido correctamente`, "success");

            // Limpiar estado
            setModoDocumento(false);
            setEmpleadoSeleccionado(null);
            setArchivo(null);
            setObservacion("");

            if (onActualizar) onActualizar();
        } catch (error) {
            console.error("Error al subir documento:", error);
            showToast("Error al subir documento", "error");
        } finally {
            setSubiendo(false);
        }
    };

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    };

    const modalStyle = {
        width: "90%",
        maxWidth: "800px",
        maxHeight: "90vh",
        overflowY: "auto",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
    };

    const buttonStyle = {
        padding: "8px 16px",
        border: "none",
        borderRadius: "6px",
        fontWeight: "600",
        cursor: "pointer",
        color: "#fff",
        transition: "0.2s",
        marginRight: "8px",
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ margin: 0, color: "#0f172a" }}>
                        Gestión de Asistencia - {capacitacion.nombreevento}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            color: "#666",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Información de la capacitación */}
                <div style={{ marginBottom: "20px", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                    <p><strong>Lugar:</strong> {capacitacion.lugar}</p>
                    <p><strong>Fechas:</strong> {formatearFecha(capacitacion.fechainicio)} - {formatearFecha(capacitacion.fechafin)}</p>
                    {esCoordinadorOAdmin && (
                        <p style={{ color: "#059669", fontWeight: "600", fontSize: "14px" }}>
                            📋 Como coordinador/administrador, puede marcar la asistencia de los colaboradores
                        </p>
                    )}
                </div>

                {/* Modal para subir documentos */}
                {modoDocumento && empleadoSeleccionado && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1001,
                    }}>
                        <div style={{
                            width: "500px",
                            maxWidth: "95%",
                            background: "#fff",
                            padding: "25px",
                            borderRadius: "12px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                <h4 style={{ margin: 0 }}>
                                    {empleadoSeleccionado.asistencia === "Sí" ? "Subir Informe de Asistencia" : "Subir Justificación"}
                                </h4>
                                <button
                                    onClick={() => {
                                        setModoDocumento(false);
                                        setEmpleadoSeleccionado(null);
                                        setArchivo(null);
                                        setObservacion("");
                                    }}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        fontSize: "20px",
                                        cursor: "pointer",
                                        color: "#666",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginBottom: "15px" }}>
                                <label htmlFor="archivoDocumento" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                                    Archivo PDF:
                                </label>
                                <input
                                    id="archivoDocumento"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => setArchivo(e.target.files[0])}
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label htmlFor="observacionDoc" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                                    Observaciones (opcional):
                                </label>
                                <textarea
                                    id="observacionDoc"
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    placeholder="Escriba cualquier observación adicional..."
                                    style={{
                                        width: "100%",
                                        height: "80px",
                                        padding: "10px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={subirDocumento}
                                    disabled={subiendo || !archivo}
                                    style={{
                                        ...buttonStyle,
                                        background: subiendo || !archivo ? "#ccc" : "#059669",
                                        cursor: subiendo || !archivo ? "not-allowed" : "pointer",
                                        flex: 1,
                                    }}
                                >
                                    {subiendo ? "Subiendo..." : "Subir Documento"}
                                </button>
                                <button
                                    onClick={() => {
                                        setModoDocumento(false);
                                        setEmpleadoSeleccionado(null);
                                        setArchivo(null);
                                        setObservacion("");
                                    }}
                                    style={{
                                        ...buttonStyle,
                                        background: "#6b7280",
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lista de empleados */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                                <th style={{ padding: "12px", textAlign: "left", border: "1px solid #e5e7eb" }}>
                                    Colaborador
                                </th>
                                <th style={{ padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                                    Asistencia
                                </th>
                                <th style={{ padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                                    Documento
                                </th>
                                <th style={{ padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map((empleado, index) => {
                                const esElEmpleado = empleado.idempleado === idUsuario;
                                const tieneAsistenciaConfirmada = empleado.asistencia && empleado.asistencia !== "";

                                return (
                                    <tr key={index}>
                                        <td style={{ padding: "12px", border: "1px solid #e5e7eb" }}>
                                            {empleado.nombre} {empleado.apellido}
                                            {esElEmpleado && (
                                                <span style={{ color: "#059669", fontSize: "12px", marginLeft: "8px" }}>
                                                    (Usted)
                                                </span>
                                            )}
                                        </td>
                                        <td style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            border: "1px solid #e5e7eb",
                                            fontWeight: "600",
                                            color: empleado.asistencia === "Sí" ? "#16a34a" : empleado.asistencia === "No" ? "#dc2626" : "#6b7280"
                                        }}>
                                            {empleado.asistencia || "Pendiente"}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                                            {empleado.documento ? (
                                                <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                                                    <button
                                                        onClick={() => handleVerDocumento(empleado)}
                                                        style={{
                                                            padding: "4px 8px",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            background: "#2563eb",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontSize: "11px",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        📄 Ver
                                                    </button>
                                                    <button
                                                        onClick={() => handleDescargarDocumento(empleado.documento)}
                                                        style={{
                                                            padding: "4px 8px",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            background: "#059669",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontSize: "11px",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        ⬇️ Descarga
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: "#6b7280", fontSize: "12px" }}>Sin documento</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                                            <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                                                {/* Botones para coordinadores/administradores */}
                                                {esCoordinadorOAdmin && !empleado.asistencia && (
                                                    <>
                                                        <button
                                                            onClick={() => handleMarcarAsistencia(empleado, true)}
                                                            disabled={loading}
                                                            style={{
                                                                ...buttonStyle,
                                                                background: loading ? "#ccc" : "#16a34a",
                                                                fontSize: "12px",
                                                                padding: "6px 12px",
                                                            }}
                                                        >
                                                            Asistió
                                                        </button>
                                                        <button
                                                            onClick={() => handleMarcarAsistencia(empleado, false)}
                                                            disabled={loading}
                                                            style={{
                                                                ...buttonStyle,
                                                                background: loading ? "#ccc" : "#dc2626",
                                                                fontSize: "12px",
                                                                padding: "6px 12px",
                                                            }}
                                                        >
                                                            No Asistió
                                                        </button>
                                                    </>
                                                )}

                                                {/* Botón para empleados subir documento */}
                                                {esElEmpleado && tieneAsistenciaConfirmada && !empleado.documento && (
                                                    <button
                                                        onClick={() => handleAbrirDocumento(empleado)}
                                                        style={{
                                                            ...buttonStyle,
                                                            background: "#2563eb",
                                                            fontSize: "12px",
                                                            padding: "6px 12px",
                                                        }}
                                                    >
                                                        Subir {empleado.asistencia === "Sí" ? "Informe" : "Justificación"}
                                                    </button>
                                                )}

                                                {(!esCoordinadorOAdmin && !esElEmpleado) ||
                                                    (empleado.asistencia && (!esElEmpleado || empleado.documento)) ? (
                                                    <span style={{ color: "#6b7280", fontSize: "12px" }}>
                                                        {empleado.documento ? "Completado" : "Sin acciones"}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {empleados.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                        No hay empleados asignados a esta capacitación.
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                        onClick={onClose}
                        style={{
                            ...buttonStyle,
                            background: "#6b7280",
                            padding: "12px 24px",
                        }}
                    >
                        Cerrar
                    </button>
                </div>

                {/* Modal para visualizar documentos */}
                {modalDocumentoVisible && documentoVisualizando && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,.6)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1001,
                            padding: "20px",
                        }}
                    >
                        <div
                            style={{
                                width: "min(900px, 95vw)",
                                height: "min(700px, 90vh)",
                                background: "#fff",
                                borderRadius: 16,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                            }}
                        >
                            {/* Header del modal */}
                            <div
                                style={{
                                    padding: "20px 25px",
                                    borderBottom: "1px solid #e5e7eb",
                                    background: "#f9fafb",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                                        {documentoVisualizando.tipoDocumento}
                                    </h3>
                                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                                        Colaborador: <strong>{documentoVisualizando.empleado}</strong>
                                    </p>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                                        Archivo: {documentoVisualizando.nombrearchivo}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <button
                                        onClick={() => handleDescargarDocumento(documentoVisualizando)}
                                        style={{
                                            padding: "8px 16px",
                                            border: "none",
                                            borderRadius: "8px",
                                            background: "#059669",
                                            color: "#fff",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            transition: "0.2s",
                                        }}
                                    >
                                        ⬇️ Descargar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setModalDocumentoVisible(false);
                                            setDocumentoVisualizando(null);
                                        }}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            border: "1px solid #e5e7eb",
                                            background: "#fff",
                                            cursor: "pointer",
                                            fontSize: 18,
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#374151",
                                            transition: "0.2s",
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Visor de PDF */}
                            <div
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#f3f4f6",
                                }}
                            >
                                {documentoVisualizando.archivo_url ? (
                                    <iframe
                                        src={documentoVisualizando.archivo_url}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                        }}
                                        title={`Documento: ${documentoVisualizando.nombrearchivo}`}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "40px",
                                            color: "#6b7280",
                                        }}
                                    >
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                                        <p style={{ fontSize: "16px", margin: 0 }}>No se pudo cargar el documento</p>
                                        <p style={{ fontSize: "14px", margin: "8px 0 0 0" }}>
                                            Intente descargarlo para verlo
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer del modal */}
                            <div
                                style={{
                                    padding: "15px 25px",
                                    background: "#f9fafb",
                                    borderTop: "1px solid #e5e7eb",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                                    Estado de asistencia: <strong
                                        style={{
                                            color: documentoVisualizando.asistencia === "Sí" ? "#059669" : "#dc2626"
                                        }}
                                    >
                                        {documentoVisualizando.asistencia}
                                    </strong>
                                </div>
                                <button
                                    onClick={() => {
                                        setModalDocumentoVisible(false);
                                        setDocumentoVisualizando(null);
                                    }}
                                    style={{
                                        padding: "8px 20px",
                                        border: "none",
                                        borderRadius: "6px",
                                        background: "#6b7280",
                                        color: "#fff",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionAsistenciaModal;