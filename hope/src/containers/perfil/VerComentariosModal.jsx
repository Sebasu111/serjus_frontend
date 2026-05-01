import React from "react";

const VerComentariosModal = ({ visible, onClose, data }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000
        }}>
            <div style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                width: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative" // 👈 clave
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "28px",
                        height: "28px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: "transparent"
                    }}
                >
                    ✕
                </button>

                <h3>Comentarios</h3>

                {data?.respuestas?.map((r, i) => (
                    <div key={i} style={{ marginBottom: "15px" }}>
                        <div style={{ fontWeight: "600" }}>
                            {r.pregunta}
                        </div>

                        <div style={{
                            background: "#eef2f7",
                            padding: "8px",
                            borderRadius: "6px"
                        }}>
                            {r.respuesta}
                        </div>

                        {r.comentario && (
                            <div style={{
                                marginTop: "5px",
                                fontStyle: "italic",
                                color: "#555"
                            }}>
                                OBSERVACION {r.comentario}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VerComentariosModal;