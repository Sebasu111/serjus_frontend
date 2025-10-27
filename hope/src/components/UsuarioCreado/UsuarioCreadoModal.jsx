import React from 'react';
import { X } from 'lucide-react';

const UsuarioCreadoModal = ({
    mostrar,
    onCerrar,
    datosUsuario
}) => {
    if (!mostrar) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5000
            }}
        >
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-15%, -50%)",
                    width: "350px",
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
                {/* Icono de éxito */}
                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: "#10b981",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px auto",
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "bold"
                    }}
                >
                    ✓
                </div>

                <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                    Usuario Creado Exitosamente
                </h3>

                {/* Usuario */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Usuario
                    </label>
                    <input
                        type="text"
                        value={datosUsuario?.usuario || ''}
                        readOnly
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                            color: "#555"
                        }}
                    />
                </div>                {/* Contraseña */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Contraseña
                    </label>
                    <input
                        type="text"
                        value={datosUsuario?.contrasena || ''}
                        readOnly
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                            color: "#555",
                            fontFamily: "monospace"
                        }}
                    />
                </div>

                {/* Advertencia */}
                <p
                    style={{
                        color: "#dc3545",
                        fontSize: "14px",
                        fontStyle: "italic",
                        marginBottom: "20px",
                        textAlign: "center"
                    }}
                >
                    Guarda estos datos. La contraseña se puede cambiar después.
                </p>

                <button
                    type="button"
                    onClick={onCerrar}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Entendido
                </button>                <button
                    onClick={onCerrar}
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
        </div>
    );
};

export default UsuarioCreadoModal;