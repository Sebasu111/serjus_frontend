import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../../utils/toast.js';
import { buildApiUrl, buildApiUrlWithId, API_CONFIG } from '../../config/api.js';

const ContratosTable = () => {
    const [contratos, setContratos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [historialPuestos, setHistorialPuestos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        await Promise.all([
            fetchContratos(),
            fetchEmpleados(),
            fetchPuestos(),
            fetchHistorialPuestos()
        ]);
    };

    const fetchContratos = async () => {
        try {
            setLoading(true);
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.CONTRATOS);
            console.log("🔄 Cargando contratos desde:", apiUrl);
            const response = await axios.get(apiUrl);
            console.log("📄 Respuesta contratos:", response.data);

            const contratosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setContratos(contratosData);
        } catch (error) {
            console.error("❌ Error al cargar contratos:", error);
            showToast("Error al cargar los contratos", "error");
            setContratos([]);
        } finally {
            setLoading(false);
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

    const fetchPuestos = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.PUESTOS);
            const response = await axios.get(apiUrl);
            const puestosData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setPuestos(puestosData);
        } catch (error) {
            console.error("Error al cargar puestos:", error);
            setPuestos([]);
        }
    };

    const fetchHistorialPuestos = async () => {
        try {
            const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.HISTORIALPUESTO);
            const response = await axios.get(apiUrl);
            const historialData = Array.isArray(response.data) ? response.data : response.data?.results || [];
            setHistorialPuestos(historialData);
        } catch (error) {
            console.error("Error al cargar historial de puestos:", error);
            setHistorialPuestos([]);
        }
    };

    const descargarContrato = async (contrato) => {
        try {
            console.log("🔄 Iniciando descarga de contrato:", contrato);
            
            // Obtener todos los documentos
            const documentosResponse = await axios.get(buildApiUrl(API_CONFIG.ENDPOINTS.DOCUMENTOS));
            const documentos = Array.isArray(documentosResponse.data) ? documentosResponse.data : documentosResponse.data?.results || [];
            
            console.log("📄 Documentos disponibles:", documentos);
            
            // Buscar el empleado relacionado con este contrato
            let empleadoId = null;
            
            if (contrato.idhistorialpuesto) {
                // Si tiene historial de puesto, buscar el empleado a través del historial
                const historial = historialPuestos.find(h => h.idhistorialpuesto === contrato.idhistorialpuesto);
                empleadoId = historial?.idempleado;
                console.log("👤 Empleado encontrado via historial:", empleadoId);
            }
            
            if (!empleadoId) {
                showToast("No se pudo identificar al empleado para este contrato", "warning");
                return;
            }
            
            // Buscar el documento del contrato (tipo 2) para este empleado
            const documentoContrato = documentos.find(doc => 
                doc.idempleado == empleadoId && doc.idtipodocumento == 2
            );
            
            console.log("📋 Documento contrato encontrado:", documentoContrato);
            
            if (!documentoContrato) {
                showToast("No se encontró documento PDF para este contrato. Puede subir uno desde la gestión de empleados.", "info");
                return;
            }
            
            if (!documentoContrato.archivo_url && !documentoContrato.archivo) {
                showToast("El documento no tiene archivo asociado", "warning");
                return;
            }
            
            // Usar la URL del archivo
            const fileUrl = documentoContrato.archivo_url || documentoContrato.archivo;
            console.log("🔗 Descargando desde URL:", fileUrl);
            
            // Usar fetch para forzar descarga como blob (igual que funciona con CVs)
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const blob = await response.blob();
            console.log("📦 Blob creado:", blob);
            
            // Crear URL del blob y descargar
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = documentoContrato.nombrearchivo || `Contrato_${empleadoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showToast("Descarga de contrato iniciada exitosamente", "success");
            
        } catch (error) {
            console.error("❌ Error al descargar contrato:", error);
            showToast(`Error al descargar el contrato: ${error.message}`, "error");
        }
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatearMoneda = (valor) => {
        if (!valor) return 'N/A';
        return `Q ${Number(valor).toLocaleString()}`;
    };

    const getEmpleadoData = (contrato) => {
        // Si hay datos temporales del contrato (mientras no funciona el historial)
        if (contrato.empleado_nombre_temp && contrato.puesto_nombre_temp) {
            return {
                nombre: contrato.empleado_nombre_temp,
                puesto: contrato.puesto_nombre_temp,
                salario: 'Temporal'
            };
        }

        // Método original con historial de puestos
        if (!contrato.idhistorialpuesto) return { nombre: 'N/A', puesto: 'N/A', salario: 'N/A' };

        const historial = historialPuestos.find(h => h.idhistorialpuesto == contrato.idhistorialpuesto);
        if (!historial) return { nombre: 'N/A', puesto: 'N/A', salario: 'N/A' };

        const empleado = empleados.find(emp => emp.idempleado == historial.idempleado);
        const puesto = puestos.find(p => p.idpuesto == historial.idpuesto);

        const nombreCompleto = empleado
            ? `${empleado.primernombre || empleado.nombre || ''} ${empleado.segundonombre || ''} ${empleado.primerapellido || empleado.apellido || ''} ${empleado.segundoapellido || ''}`.trim()
            : 'N/A';

        const nombrePuesto = puesto?.nombrepuesto || puesto?.nombrePuesto || 'N/A';
        const salario = historial.salario || 'N/A';

        return { nombre: nombreCompleto, puesto: nombrePuesto, salario };
    };

    const contratosFiltrados = contratos.filter(contrato => {
        const { nombre, puesto } = getEmpleadoData(contrato);
        return (
            nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
            puesto?.toLowerCase().includes(filtro.toLowerCase()) ||
            contrato.tipocontrato?.toLowerCase().includes(filtro.toLowerCase())
        );
    });

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        fontFamily: '"Inter", sans-serif',
        fontSize: '14px'
    };

    const thStyle = {
        backgroundColor: '#023047',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
        fontWeight: '600'
    };

    const tdStyle = {
        padding: '10px 20px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'top'
    };

    const buttonStyle = {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        margin: '0 2px'
    };



    const inputStyle = {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        fontFamily: '"Inter", sans-serif',
        width: '300px',
        marginBottom: '20px'
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>Cargando contratos...</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: '"Inter", sans-serif' }}>
            <div style={{ marginBottom: '20px', padding: '20px 20px 0px 20px' }}>
                <h2 style={{ margin: 0, color: '#023047' }}>Contratos Registrados</h2>
            </div>

            <div style={{ padding: '0px 20px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre del colaborador, puesto o tipo de contrato..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{...inputStyle, width: 'calc(100% - 24px)'}}
                />
            </div>

            {contratosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>{contratos.length === 0 ? 'No hay contratos registrados' : 'No se encontraron contratos que coincidan con el filtro'}</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Colaborador</th>
                                <th style={thStyle}>Puesto</th>
                                <th style={thStyle}>Tipo Contrato</th>
                                <th style={thStyle}>Salario</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Descargar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contratosFiltrados.map((contrato) => {
                                const { nombre, puesto, salario } = getEmpleadoData(contrato);
                                return (
                                    <tr key={contrato.idcontrato} style={{ backgroundColor: contrato.estado ? 'white' : '#f8f9fa' }}>
                                        <td style={tdStyle}>{nombre}</td>
                                        <td style={tdStyle}>{puesto}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: contrato.tipocontrato === 'Indefinido' ? '#d4edda' : '#fff3cd',
                                                color: contrato.tipocontrato === 'Indefinido' ? '#155724' : '#856404'
                                            }}>
                                                {contrato.tipocontrato}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{formatearMoneda(salario)}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                backgroundColor: contrato.estado ? '#d4edda' : '#f8d7da',
                                                color: contrato.estado ? '#155724' : '#721c24'
                                            }}>
                                                {contrato.estado ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => descargarContrato(contrato)}
                                                style={{
                                                    padding: '6px 12px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}
                                                title="Descargar contrato PDF"
                                            >
                                                Descargar Contrato
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: '20px', padding: '20px', color: '#666', fontSize: '13px' }}>
                <p>Total de contratos: {contratosFiltrados.length} {filtro && `(filtrados de ${contratos.length})`}</p>
                {historialPuestos.length === 0 && (
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '4px',
                        color: '#856404'
                    }}>
                        <strong>Nota:</strong> El endpoint de historial de puestos no está disponible.
                        Los contratos creados muestran datos temporales hasta que se configure correctamente el backend.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContratosTable;