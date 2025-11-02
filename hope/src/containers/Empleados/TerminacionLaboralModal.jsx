import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast";
import { generarConstanciaTrabajo } from "./constanciaTrabajoPdf";

const TerminacionLaboralModal = ({ empleado, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        tipoterminacion: "",
        causa: "",
        observacion: "",
        finalizarContrato: true
    });

    const [archivoDocumento, setArchivoDocumento] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && empleado) {
            // Reset form when opening modal
            setFormData({
                tipoterminacion: "",
                causa: "",
                observacion: "",
                finalizarContrato: true
            });
            setArchivoDocumento(null);
        }
    }, [isOpen, empleado]);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Primero subir el documento si existe
            let documentoId = null;
            if (archivoDocumento) {
                const formDataDoc = new FormData();
                formDataDoc.append('archivo', archivoDocumento);
                formDataDoc.append('nombredocumento', `Documento_Terminacion_${empleado.dpi}_${Date.now()}`);
                formDataDoc.append('estado', true);
                formDataDoc.append('idusuario', 1); // TODO: Usuario logueado

                const responseDoc = await axios.post("http://127.0.0.1:8000/api/documentos/", formDataDoc, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                documentoId = responseDoc.data.iddocumento || responseDoc.data.id;
            }

            // 2. Crear la terminación laboral
            const dataToSend = {
                tipoterminacion: formData.tipoterminacion,
                fechaterminacion: new Date().toISOString().split('T')[0], // Fecha actual
                causa: formData.causa,
                observacion: formData.observacion || null,
                iddocumento: documentoId,
                idcontrato: null, // Se maneja automáticamente por el empleado
                estado: true,
                idusuario: 1 // TODO: Reemplazar con el usuario logueado real
            };

            const response = await axios.post("http://127.0.0.1:8000/api/terminacionlaboral/", dataToSend);

            // 3. Finalizar contrato del empleado si está marcado
            if (formData.finalizarContrato) {
                try {
                    // Buscar contratos activos del empleado
                    const contratosResponse = await axios.get("http://127.0.0.1:8000/api/contratos/");
                    const contratosData = Array.isArray(contratosResponse.data) ? contratosResponse.data : contratosResponse.data?.results || [];

                    // Buscar contratos del empleado usando el historial de puestos
                    const historialResponse = await axios.get("http://127.0.0.1:8000/api/historialpuestos/");
                    const historialData = Array.isArray(historialResponse.data) ? historialResponse.data : historialResponse.data?.results || [];

                    const contratosDelEmpleado = contratosData.filter(contrato => {
                        if (contrato.estado) { // Solo contratos activos
                            const historial = historialData.find(h => h.idhistorialpuesto === contrato.idhistorialpuesto);
                            return historial && historial.idempleado === empleado.idempleado;
                        }
                        return false;
                    });

                    // Inactivar todos los contratos activos del empleado
                    for (const contrato of contratosDelEmpleado) {
                        await axios.patch(`http://127.0.0.1:8000/api/contratos/${contrato.idcontrato}/`, {
                            estado: false
                        });
                    }

                    if (contratosDelEmpleado.length > 0) {
                        showToast(`${contratosDelEmpleado.length} contrato(s) finalizados correctamente`, "success");
                    }
                } catch (contractError) {
                    console.error("Error al finalizar contratos:", contractError);
                    showToast("Terminación registrada, pero hubo un error al finalizar los contratos", "warning");
                }
            }

            showToast("Terminación laboral registrada correctamente", "success");

            // 3. Generar y descargar la constancia de trabajo
            try {
                await generarConstanciaTrabajo(empleado, formData, new Date());
                showToast("Constancia de trabajo generada correctamente", "success");
            } catch (pdfError) {
                console.error("Error al generar PDF:", pdfError);
                showToast("Terminación registrada, pero hubo un error al generar la constancia", "warning");
            }

            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error("Error al registrar terminación laboral:", error);
            showToast("Error al registrar la terminación laboral", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleArchivoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo - Solo PDF
            if (file.type !== 'application/pdf') {
                showToast("Solo se permiten archivos PDF", "error");
                e.target.value = '';
                return;
            }
            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                showToast("El archivo no puede ser mayor a 5MB", "error");
                e.target.value = '';
                return;
            }
            setArchivoDocumento(file);
        }
    };

    if (!isOpen) return null;

    const tiposTerminacion = [
        "Renuncia",
        "Despido",
        "Despido Justificado"
    ];

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "500px",
                    maxWidth: "90%",
                    background: "#fff",
                    boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                    padding: "30px",
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "12px",
                    maxHeight: "90vh",
                    overflowY: "auto"
                }}
            >
                <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                    Terminación Laboral
                </h3>

                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "15px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer"
                    }}
                    title="Cerrar"
                >
                    <X size={24} color="#555" />
                </button>

                {empleado && (
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "bold",
                            color: "#1976d2"
                        }}>
                            Empleado Seleccionado:
                        </label>
                        <div style={{
                            padding: "12px",
                            backgroundColor: "#e3f2fd",
                            border: "1px solid #2196f3",
                            borderRadius: "6px",
                            fontSize: "16px",
                            color: "#0d47a1"
                        }}>
                            <strong>DPI:</strong> {empleado.dpi} <br />
                            <strong>Nombre:</strong> {empleado.nombre} {empleado.apellido}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                    {/* Tipo de Terminación */}
                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="tipoterminacion" style={{ display: "block", marginBottom: "8px" }}>
                            Tipo de Terminación <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                            id="tipoterminacion"
                            name="tipoterminacion"
                            value={formData.tipoterminacion}
                            onChange={handleInputChange}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                        >
                            <option value="">Seleccione el tipo de terminación</option>
                            {tiposTerminacion.map((tipo) => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha de Terminación - Estilo azul como capacitación seleccionada */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "bold",
                            color: "#1976d2"
                        }}>
                            Fecha de Terminación:
                        </label>
                        <div style={{
                            padding: "12px",
                            backgroundColor: "#e3f2fd",
                            border: "1px solid #2196f3",
                            borderRadius: "6px",
                            fontSize: "16px",
                            color: "#0d47a1"
                        }}>
                            {new Date().toLocaleDateString('es-ES')}
                        </div>
                    </div>

                    {/* Causa - Ahora obligatoria */}
                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="causa" style={{ display: "block", marginBottom: "8px" }}>
                            Causa <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            id="causa"
                            type="text"
                            name="causa"
                            value={formData.causa}
                            onChange={handleInputChange}
                            required
                            maxLength={150}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                            placeholder="Especifique la causa de la terminación"
                        />
                    </div>

                    {/* Observación - Ahora opcional */}
                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="observacion" style={{ display: "block", marginBottom: "8px" }}>
                            Observación (Opcional)
                        </label>
                        <textarea
                            id="observacion"
                            name="observacion"
                            value={formData.observacion}
                            onChange={handleInputChange}
                            maxLength={150}
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                resize: "vertical"
                            }}
                            placeholder="Ingrese observaciones adicionales (opcional)"
                        />
                    </div>

                    {/* Documento - Solo PDF */}
                    <div style={{ marginBottom: "20px" }}>
                        <label htmlFor="documento" style={{ display: "block", marginBottom: "8px" }}>
                            Documento de Terminación <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                            id="documento"
                            type="file"
                            accept=".pdf"
                            onChange={handleArchivoChange}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "6px"
                            }}
                        />
                        <small style={{ color: "#666", fontSize: "12px" }}>
                            Sube la carta de renuncia/despido (Solo PDF máx. 5MB)
                        </small>
                        {archivoDocumento && (
                            <div style={{ marginTop: "8px", fontSize: "14px", color: "#28a745" }}>
                                ✓ Archivo seleccionado: {archivoDocumento.name}
                            </div>
                        )}
                    </div>

                    {/* Finalización de Contrato */}
                    <div style={{
                        marginBottom: "20px",
                        padding: "15px",
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeaa7",
                        borderRadius: "6px"
                    }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
                            Finalización de Contrato
                        </h4>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#856404" }}>
                            Al procesar esta terminación laboral, se finalizará automáticamente el contrato activo del empleado.
                        </p>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                                type="checkbox"
                                id="finalizarContrato"
                                checked={formData.finalizarContrato || true}
                                onChange={(e) => setFormData(prev => ({ ...prev, finalizarContrato: e.target.checked }))}
                                style={{ marginRight: "8px" }}
                            />
                            <label htmlFor="finalizarContrato" style={{ fontSize: "14px", color: "#856404" }}>
                                Finalizar contrato del empleado
                            </label>
                        </div>
                    </div>

                    {/* Botón de envío */}
                    <button
                        type="submit"
                        disabled={loading || !archivoDocumento || !formData.causa.trim()}
                        style={{
                            width: "100%",
                            padding: "10px",
                            background: (loading || !archivoDocumento || !formData.causa.trim()) ? "#6c757d" : "#219ebc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: (loading || !archivoDocumento || !formData.causa.trim()) ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Procesando..." : "Registrar Terminación"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default TerminacionLaboralModal;