import React from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

const ConfirmModal = ({ historial, modo, onConfirm, onCancel }) => {
    if (!historial) return null;

    const esDesactivar = modo === "desactivar";

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "30px",
                    width: "450px",
                    maxWidth: "90vw",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
            >
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {esDesactivar ? (
                            <AlertTriangle
                                size={24}
                                color="#dc2626"
                                style={{
                                    padding: "8px",
                                    backgroundColor: "#fee2e2",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px"
                                }}
                            />
                        ) : (
                            <CheckCircle
                                size={24}
                                color="#059669"
                                style={{
                                    padding: "8px",
                                    backgroundColor: "#dcfce7",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px"
                                }}
                            />
                        )}
                        <h3 style={{
                            margin: 0,
                            color: "#1f2937",
                            fontSize: "18px",
                            fontWeight: "600"
                        }}>
                            {esDesactivar ? "Desactivar Historial" : "Activar Historial"}
                        </h3>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px",
                            borderRadius: "6px"
                        }}
                        onMouseEnter={e => e.target.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={e => e.target.style.backgroundColor = "transparent"}
                    >
                        <X size={20} color="#6b7280" />
                    </button>
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <p style={{
                        color: "#374151",
                        lineHeight: "1.6",
                        margin: "0 0 16px 0",
                        fontSize: "14px"
                    }}>
                        {esDesactivar
                            ? "¿Estás seguro de que deseas desactivar este historial de puesto?"
                            : "¿Estás seguro de que deseas activar este historial de puesto?"
                        }
                    </p>

                    {/* Información del historial */}
                    <div style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "16px",
                        marginTop: "16px"
                    }}>
                        <div style={{ marginBottom: "8px" }}>
                            <span style={{ fontWeight: "600", color: "#374151" }}>ID:</span>
                            <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                                #{historial.idhistorialpuesto}
                            </span>
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                            <span style={{ fontWeight: "600", color: "#374151" }}>Fechas:</span>
                            <span style={{ marginLeft: "8px", color: "#6b7280" }}>
                                {new Date(historial.fechainicio).toLocaleDateString('es-GT')}
                                {historial.fechafin && (
                                    ` - ${new Date(historial.fechafin).toLocaleDateString('es-GT')}`
                                )}
                                {!historial.fechafin && (
                                    <span style={{
                                        marginLeft: "4px",
                                        padding: "2px 6px",
                                        backgroundColor: "#dbeafe",
                                        color: "#1e40af",
                                        borderRadius: "4px",
                                        fontSize: "12px"
                                    }}>
                                        En curso
                                    </span>
                                )}
                            </span>
                        </div>

                        <div style={{ marginBottom: "8px" }}>
                            <span style={{ fontWeight: "600", color: "#374151" }}>Salario:</span>
                            <span style={{
                                marginLeft: "8px",
                                color: "#059669",
                                fontWeight: "600"
                            }}>
                                Q {parseFloat(historial.salario || 0).toLocaleString('es-GT', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>

                        {historial.observacion && (
                            <div>
                                <span style={{ fontWeight: "600", color: "#374151" }}>Observación:</span>
                                <div style={{
                                    marginTop: "4px",
                                    padding: "8px",
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                    color: "#6b7280",
                                    fontStyle: "italic"
                                }}>
                                    "{historial.observacion}"
                                </div>
                            </div>
                        )}
                    </div>

                    {esDesactivar && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "#dc2626"
                        }}>
                            <strong>Nota:</strong> Al desactivar este historial, no será visible en reportes activos
                            pero se conservará en el sistema para fines de auditoría.
                        </div>
                    )}

                    {!esDesactivar && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "#166534"
                        }}>
                            <strong>Nota:</strong> Al activar este historial, volverá a estar disponible
                            en el sistema y reportes.
                        </div>
                    )}
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px"
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: "10px 20px",
                            border: "2px solid #e5e7eb",
                            borderRadius: "8px",
                            background: "#fff",
                            color: "#374151",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "14px",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                            e.target.style.borderColor = "#d1d5db";
                            e.target.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={e => {
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.backgroundColor = "#fff";
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: "10px 20px",
                            border: `2px solid ${esDesactivar ? "#dc2626" : "#059669"}`,
                            borderRadius: "8px",
                            background: esDesactivar ? "#dc2626" : "#059669",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "500",
                            fontSize: "14px",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                            const hoverColor = esDesactivar ? "#b91c1c" : "#047857";
                            e.target.style.borderColor = hoverColor;
                            e.target.style.backgroundColor = hoverColor;
                        }}
                        onMouseLeave={e => {
                            const originalColor = esDesactivar ? "#dc2626" : "#059669";
                            e.target.style.borderColor = originalColor;
                            e.target.style.backgroundColor = originalColor;
                        }}
                    >
                        {esDesactivar ? "Sí, Desactivar" : "Sí, Activar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;