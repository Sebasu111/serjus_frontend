import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildApiUrl, API_CONFIG } from '../../config/api.js';

const ApiStatusChecker = () => {
    const [apiStatus, setApiStatus] = useState({});
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    const checkApiEndpoint = async (name, endpoint) => {
        try {
            const url = buildApiUrl(endpoint);
            const response = await axios.get(url, { timeout: 5000 });
            return {
                name,
                endpoint,
                status: 'online',
                responseTime: Date.now() - startTime,
                statusCode: response.status,
                url
            };
        } catch (error) {
            return {
                name,
                endpoint,
                status: 'offline',
                error: error.message,
                url: buildApiUrl(endpoint)
            };
        }
    };

    const checkAllEndpoints = async () => {
        setIsChecking(true);
        const startTime = Date.now();

        const endpointsToCheck = [
            { name: 'Contratos', endpoint: API_CONFIG.ENDPOINTS.CONTRATOS },
            { name: 'Puestos', endpoint: API_CONFIG.ENDPOINTS.PUESTOS },
            { name: 'Empleados', endpoint: API_CONFIG.ENDPOINTS.EMPLEADOS },
            { name: 'Usuarios', endpoint: API_CONFIG.ENDPOINTS.USUARIOS }
        ];

        const results = {};

        for (const { name, endpoint } of endpointsToCheck) {
            const checkStartTime = Date.now();
            const result = await checkApiEndpoint(name, endpoint);
            result.responseTime = Date.now() - checkStartTime;
            results[name] = result;
        }

        setApiStatus(results);
        setLastCheck(new Date());
        setIsChecking(false);
    };

    useEffect(() => {
        checkAllEndpoints();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#28a745';
            case 'offline': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const buttonStyle = {
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const cardStyle = {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#f8f9fa'
    };

    const statusIndicatorStyle = (status) => ({
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(status),
        marginRight: '8px'
    });

    return (
        <div style={{ padding: '20px', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#023047' }}>🔍 Estado de las APIs</h3>
                <button
                    onClick={checkAllEndpoints}
                    disabled={isChecking}
                    style={{
                        ...buttonStyle,
                        backgroundColor: isChecking ? '#6c757d' : '#28a745'
                    }}
                >
                    {isChecking ? '🔄 Verificando...' : '🔄 Verificar APIs'}
                </button>
            </div>

            {lastCheck && (
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                    Última verificación: {lastCheck.toLocaleString()}
                </p>
            )}

            <div>
                {Object.values(apiStatus).map((api) => (
                    <div key={api.name} style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={statusIndicatorStyle(api.status)}></span>
                            <strong>{api.name}</strong>
                            <span style={{
                                marginLeft: 'auto',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                backgroundColor: getStatusColor(api.status),
                                color: 'white'
                            }}>
                                {api.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ fontSize: '13px', color: '#666', fontFamily: 'monospace' }}>
                            <div><strong>URL:</strong> {api.url}</div>
                            {api.responseTime && (
                                <div><strong>Tiempo de respuesta:</strong> {api.responseTime}ms</div>
                            )}
                            {api.statusCode && (
                                <div><strong>Código de estado:</strong> {api.statusCode}</div>
                            )}
                            {api.error && (
                                <div style={{ color: '#dc3545' }}><strong>Error:</strong> {api.error}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#023047' }}>ℹ️ Información importante</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#495057' }}>
                    <li>Asegúrate de que el servidor Django esté ejecutándose en <code>127.0.0.1:8000</code></li>
                    <li>Verifica que el endpoint <code>/api/contratos/</code> esté configurado en el backend</li>
                    <li>Si los endpoints están offline, revisa la configuración de CORS en Django</li>
                    <li>Para crear contratos, los endpoints de <strong>Contratos</strong> y <strong>Puestos</strong> deben estar online</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiStatusChecker;