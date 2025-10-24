import React from "react";
import { X } from "lucide-react";

const AmonestacionForm = ({
    idEmpleado,
    setIdEmpleado,
    tipo,
    setTipo,
    fechaAmonestacion,
    setFechaAmonestacion,
    motivo,
    setMotivo,
    idDocumento,
    setIdDocumento,
    estadoActivo,
    setEstadoActivo,
    mensaje,
    editingId,
    handleSubmit,
    onClose
}) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "400px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px"
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                {editingId ? "Editar Amonestación" : "Registrar Amonestación"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="idEmpleado" style={{ display: "block", marginBottom: "8px" }}>
                        ID del Empleado
                    </label>
                    <input
                        id="idEmpleado"
                        type="text"
                        value={idEmpleado}
                        onChange={e => setIdEmpleado(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="tipo" style={{ display: "block", marginBottom: "8px" }}>
                        Tipo de Amonestación
                    </label>
                    <input
                        id="tipo"
                        type="text"
                        value={tipo}
                        onChange={e => setTipo(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="fechaAmonestacion" style={{ display: "block", marginBottom: "8px" }}>
                        Fecha de Amonestación
                    </label>
                    <input
                        id="fechaAmonestacion"
                        type="date"
                        value={fechaAmonestacion}
                        onChange={e => setFechaAmonestacion(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="motivo" style={{ display: "block", marginBottom: "8px" }}>
                        Motivo
                    </label>
                    <textarea
                        id="motivo"
                        rows={3}
                        value={motivo}
                        onChange={e => setMotivo(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            resize: "none"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="idDocumento" style={{ display: "block", marginBottom: "8px" }}>
                        ID del Documento
                    </label>
                    <input
                        id="idDocumento"
                        type="text"
                        value={idDocumento}
                        onChange={e => setIdDocumento(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                            type="checkbox"
                            checked={estadoActivo}
                            onChange={e => setEstadoActivo(e.target.checked)}
                        />
                        Activo
                    </label>
                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    {editingId ? "Actualizar" : "Guardar"}
                </button>
            </form>

            {mensaje && (
                <p
                    style={{
                        marginTop: "15px",
                        textAlign: "center",
                        color: mensaje.includes("Error") ? "red" : "green"
                    }}
                >
                    {mensaje}
                </p>
            )}

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
        </div>
    );
};

export default AmonestacionForm;
