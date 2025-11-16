import React, { useState, useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
const API = process.env.REACT_APP_API_URL;
const API_HISTORIAL = `${API}/historialpuestos/`;
const API_PUESTOS = `${API}/puestos/`;

const HistorialPuestosModal = ({ empleado, onClose, mostrar }) => {
    const [historial, setHistorial] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (mostrar && empleado) {
            fetchHistorial();
            fetchPuestos();
        }
    }, [mostrar, empleado]);

    const fetchHistorial = async () => {
        try {
            setCargando(true);
            const empleadoId = empleado.id || empleado.idempleado || empleado.idEmpleado;
            const res = await axios.get(API_HISTORIAL);
            const todosHistoriales = Array.isArray(res.data) ? res.data : res.data?.results || [];

            // Filtrar solo el historial de este empleado y ordenar por fecha más reciente
            const historialEmpleado = todosHistoriales
                .filter(h => h.idempleado === empleadoId)
                .sort((a, b) => {
                    const da = a.fechainicio ? new Date(a.fechainicio) : new Date(0);
                    const db = b.fechainicio ? new Date(b.fechainicio) : new Date(0);
                    // ordenar descendente (más reciente primero)
                    if (db - da !== 0) return db - da;
                    // fallback por id si las fechas son iguales o ausentes
                    return (b.idhistorialpuesto || 0) - (a.idhistorialpuesto || 0);
                });

            setHistorial(historialEmpleado);
        } catch (error) {
            console.error("Error al cargar historial:", error);
            showToast("Error al cargar el historial de puestos", "error");
            setHistorial([]);
        } finally {
            setCargando(false);
        }
    };

    const fetchPuestos = async () => {
        try {
            const res = await axios.get(API_PUESTOS);
            const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
            setPuestos(data);
        } catch (error) {
            console.error("Error al cargar puestos:", error);
            setPuestos([]);
        }
    };

    const obtenerNombrePuesto = (idPuesto) => {
        const puesto = puestos.find(p => p.idpuesto === idPuesto);
        return puesto ? puesto.nombrepuesto : "Puesto no encontrado";
    };

    const obtenerSalarioPuesto = (idPuesto) => {
        const puesto = puestos.find(p => Number(p.idpuesto || p.id) === Number(idPuesto));
        if (!puesto) return null;
        // distintos nombres posibles en el catálogo: salariobase, salario, salario_base, etc.
        return (
            puesto.salariobase ?? puesto.salario ?? puesto.salario_base ?? puesto.salarioBase ?? null
        );
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "—";
        const date = new Date(fecha);
        return date.toLocaleDateString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatearSalario = (salario) => {
        if (salario == null || salario === "" || Number(salario) === 0) return "—";
        const n = Number(salario);
        if (Number.isNaN(n)) return "—";
        return `Q. ${n.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
    };

    if (!mostrar) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 5000
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: "min(900px, 96vw)",
                    maxHeight: "90vh",
                    overflow: "auto",
                    background: "#fff",
                    boxShadow: "0 10px 40px rgba(0,0,0,.25)",
                    padding: 32,
                    borderRadius: 16,
                    position: "relative"
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        cursor: "pointer",
                        fontSize: 18,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0f172a"
                    }}
                >
                    ✕
                </button>

                {/* Título */}
                <div style={{ marginBottom: 24 }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#0f172a",
                        letterSpacing: 0.2
                    }}>
                        Historial de Puestos
                    </h3>
                    <p style={{
                        margin: "8px 0 0 0",
                        fontSize: 16,
                        color: "#6b7280",
                        fontWeight: 500
                    }}>
                        {empleado?.nombre} {empleado?.apellido}
                    </p>
                </div>

                {cargando ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px 0",
                        color: "#6b7280"
                    }}>
                        Cargando historial...
                    </div>
                ) : (
                    <>
                        {/* Puesto Actual */}
                        <div style={{ marginBottom: 32 }}>
                            <h4 style={{
                                margin: "0 0 16px 0",
                                fontSize: 20,
                                fontWeight: 600,
                                color: "#0f172a",
                                borderBottom: "2px solid #e5e7eb",
                                paddingBottom: 8
                            }}>
                                Puesto Actual
                            </h4>
                            <div style={{
                                background: "#f0f9ff",
                                border: "1px solid #0ea5e9",
                                borderRadius: 12,
                                padding: 20
                            }}>
                                <div style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    marginBottom: 8
                                }}>
                                    {empleado?.puesto || "Sin puesto asignado"}
                                </div>
                                {(() => {
                                    // Buscar el registro de historial activo (sin fecha fin) más reciente
                                    const historialActivo = historial.find(h =>
                                        !h.fechafin || h.fechafin === null || h.fechafin === ""
                                    );
                                    return (
                                        <>
                                            <div style={{
                                                fontSize: 14,
                                                color: "#6b7280",
                                                marginBottom: 6
                                            }}>
                                                Fecha de inicio: {formatearFecha(historialActivo?.fechainicio || empleado?.inicioLaboral)}
                                            </div>
                                            <div style={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                color: "#059669"
                                            }}>
                                                Salario actual: {(() => {
                                                    const salarioActual = historialActivo?.salario || obtenerSalarioPuesto(empleado?.idpuesto || empleado?.idPuesto);
                                                    return formatearSalario(salarioActual);
                                                })()}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Historial */}
                        <div>
                            <h4 style={{
                                margin: "0 0 16px 0",
                                fontSize: 20,
                                fontWeight: 600,
                                color: "#0f172a",
                                borderBottom: "2px solid #e5e7eb",
                                paddingBottom: 8
                            }}>
                                Historial de Puestos
                            </h4>

                            {historial.length === 0 ? (
                                <div style={{
                                    textAlign: "center",
                                    padding: "32px 0",
                                    color: "#6b7280",
                                    fontSize: 16
                                }}>
                                    No hay historial de puestos registrado
                                </div>
                            ) : (
                                <div style={{
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 12,
                                    overflow: "hidden"
                                }}>
                                    {/* Header de tabla */}
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
                                        gap: 16,
                                        padding: "16px 20px",
                                        background: "#f9fafb",
                                        borderBottom: "1px solid #e5e7eb",
                                        fontWeight: 600,
                                        fontSize: 14,
                                        color: "#374151"
                                    }}>
                                        <div>Puesto</div>
                                        <div>Fecha Inicio</div>
                                        <div>Fecha Fin</div>
                                        <div>Salario</div>
                                    </div>

                                    {/* Filas de datos */}
                                    {historial.map((item, index) => (
                                        <div
                                            key={item.idhistorialpuesto || index}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "2fr 1fr 1fr 1.5fr",
                                                gap: 16,
                                                padding: "16px 20px",
                                                borderBottom: index < historial.length - 1 ? "1px solid #e5e7eb" : "none",
                                                background: index % 2 === 0 ? "#fff" : "#fafafa"
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: 500,
                                                color: "#0f172a"
                                            }}>
                                                {obtenerNombrePuesto(item.idpuesto)}
                                            </div>
                                            <div style={{ color: "#6b7280" }}>
                                                {formatearFecha(item.fechainicio)}
                                            </div>
                                            <div style={{ color: "#6b7280" }}>
                                                {formatearFecha(item.fechafin)}
                                            </div>
                                            <div style={{
                                                fontWeight: 600,
                                                color: "#059669"
                                            }}>
                                                {(() => {
                                                    // PRIORIDAD: usar el salario guardado en el historial
                                                    // Solo usar salario del catálogo si no hay salario en historial
                                                    const salarioHistorial = item.salario;
                                                    if (salarioHistorial && Number(salarioHistorial) > 0) {
                                                        return formatearSalario(salarioHistorial);
                                                    }
                                                    // Fallback al salario del catálogo de puestos
                                                    const salarioPuesto = obtenerSalarioPuesto(item.idpuesto);
                                                    return formatearSalario(salarioPuesto);
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default HistorialPuestosModal;