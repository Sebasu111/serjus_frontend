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

    const cambiarEstadoContrato = async (id, estadoActual) => {
        const accion = estadoActual ? 'inactivar' : 'activar';
        if (!window.confirm(`¿Está seguro que desea ${accion} este contrato?`)) {
            return;
        }

        try {
            const apiUrl = buildApiUrlWithId(API_CONFIG.ENDPOINTS.CONTRATOS, id);
            await axios.patch(apiUrl, { estado: !estadoActual });
            showToast(`Contrato ${estadoActual ? 'inactivado' : 'activado'} exitosamente`, "success");
            fetchAllData(); // Recargar todos los datos
        } catch (error) {
            console.error(`❌ Error al ${accion} contrato:`, error);
            showToast(`Error al ${accion} el contrato`, "error");
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
        padding: '12px 8px',
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
        fontWeight: '600'
    };

    const tdStyle = {
        padding: '10px 8px',
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

    const inactiveButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
    };

    const activeButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white'
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
        <div style={{ padding: '20px', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#023047' }}>Contratos Registrados</h2>
                <button
                    onClick={fetchAllData}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#28a745',
                        color: 'white'
                    }}
                >
                    Actualizar
                </button>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Buscar por nombre del empleado, puesto o tipo de contrato..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={inputStyle}
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
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Empleado</th>
                                <th style={thStyle}>Puesto</th>
                                <th style={thStyle}>Fecha Inicio</th>
                                <th style={thStyle}>Fecha Fin</th>
                                <th style={thStyle}>Fecha Firma</th>
                                <th style={thStyle}>Tipo Contrato</th>
                                <th style={thStyle}>Salario</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Creado</th>
                                <th style={thStyle}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contratosFiltrados.map((contrato) => {
                                const { nombre, puesto, salario } = getEmpleadoData(contrato);
                                return (
                                    <tr key={contrato.idcontrato} style={{ backgroundColor: contrato.estado ? 'white' : '#f8f9fa' }}>
                                        <td style={tdStyle}>{contrato.idcontrato}</td>
                                        <td style={tdStyle}>{nombre}</td>
                                        <td style={tdStyle}>{puesto}</td>
                                        <td style={tdStyle}>{formatearFecha(contrato.fechainicio)}</td>
                                        <td style={tdStyle}>{formatearFecha(contrato.fechafin) || 'Indefinido'}</td>
                                        <td style={tdStyle}>{formatearFecha(contrato.fechafirma)}</td>
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
                                        <td style={tdStyle}>{formatearFecha(contrato.createdat)}</td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => cambiarEstadoContrato(contrato.idcontrato, contrato.estado)}
                                                style={contrato.estado ? inactiveButtonStyle : activeButtonStyle}
                                                title={contrato.estado ? "Inactivar contrato" : "Activar contrato"}
                                            >
                                                {contrato.estado ? 'Inactivar' : 'Activar'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: '20px', color: '#666', fontSize: '13px' }}>
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