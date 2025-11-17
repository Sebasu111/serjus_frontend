import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiStatusChecker = () => {
    const [apiStatus, setApiStatus] = useState({});
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    const BASE_URL = process.env.REACT_APP_API_URL; // 👈 desde .env

    const endpointsToCheck = [
        { name: 'Contratos', path: '/contratos/' },
        { name: 'Puestos', path: '/puestos/' },
        { name: 'Empleados', path: '/empleados/' },
        { name: 'Usuarios', path: '/usuarios/' }
    ];

    const checkApiEndpoint = async (name, path) => {
        const url = `${BASE_URL}${path}`;
        const startTime = Date.now();

        try {
            const response = await axios.get(url, { timeout: 5000 });
            return {
                name,
                url,
                status: 'online',
                statusCode: response.status,
                responseTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                name,
                url,
                status: 'offline',
                error: error.message,
                responseTime: Date.now() - startTime
            };
        }
    };

    const checkAllEndpoints = async () => {
        setIsChecking(true);
        const results = {};

        for (const { name, path } of endpointsToCheck) {
            const endpointStatus = await checkApiEndpoint(name, path);
            results[name] = endpointStatus;
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

    return (
        <div style={{ padding: '20px', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#023047' }}>🔍 Estado de las APIs</h3>
                <button
                    onClick={checkAllEndpoints}
                    disabled={isChecking}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isChecking ? '#6c757d' : '#28a745',
                        color: 'white',
                        fontWeight: '500'
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

            {Object.values(apiStatus).map(api => (
                <div key={api.name} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '10px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(api.status),
                            marginRight: 8
                        }} />
                        <strong>{api.name}</strong>
                        <span style={{
                            marginLeft: 'auto',
                            backgroundColor: getStatusColor(api.status),
                            color: 'white',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }}>
                            {api.status.toUpperCase()}
                        </span>
                    </div>

                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#555' }}>
                        <div><strong>URL:</strong> {api.url}</div>
                        <div><strong>Tiempo de respuesta:</strong> {api.responseTime}ms</div>
                        {api.statusCode && <div><strong>Código HTTP:</strong> {api.statusCode}</div>}
                        {api.error && (
                            <div style={{ color: '#dc3545' }}><strong>Error:</strong> {api.error}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApiStatusChecker;
