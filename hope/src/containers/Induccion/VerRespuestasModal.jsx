import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./VerRespuestasModal.styles";
import { showToast } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const VerRespuestasModal = ({ visible, onClose, induccion }) => {
    const [empleados, setEmpleados] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [comentarios, setComentarios] = useState({});
    const [modoComentario, setModoComentario] = useState(false);

    useEffect(() => {
        if (visible && induccion) {
            axios.get(`${API}/respuestas-induccion/${induccion.idinduccion}/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setEmpleados(res.data))
                .catch(() => setEmpleados([]));
        }
    }, [visible, induccion]);

    useEffect(() => {
        if (detalle && detalle.respuestas) {
            const comentariosIniciales = {};

            detalle.respuestas.forEach(r => {
                comentariosIniciales[r.idrespuesta] = r.comentario || "";
            });

            setComentarios(comentariosIniciales);
        }
    }, [detalle]);

    const guardarComentarios = () => {
        const payload = {
            respuestas: detalle.respuestas.map(r => ({
                idrespuesta: r.idrespuesta,
                comentario: comentarios[r.idrespuesta] || "",
                puntaje: 0
            }))
        };

        showToast("Guardando comentarios...", "info");

        axios.put(
            `${API}/formulario-respuestas/${detalle.idformulariorespuesta}/calificar/`,
            payload,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
            .then(() => {
                showToast("Comentarios guardados correctamente", "success");
                setModoComentario(false);
            })
            .catch(() => {
                showToast("Error al guardar los comentarios", "error");
            });
    };

    const cargarDetalle = (id) => {
        axios.get(`${API}/detalle-respuesta/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setDetalle(res.data));
    };

    if (!visible) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* BOTÓN CERRAR */}
                <button style={styles.closeIcon} onClick={onClose}>
                    ✕
                </button>

                <h3>Respuestas de Inducción</h3>

                <div style={styles.body}>

                    {!detalle ? (
                        <>
                            <h4>Empleados</h4>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o apellido..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    marginBottom: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc"
                                }}
                            />

                            {empleados.length === 0 ? (
                                <p>No hay respuestas</p>
                            ) : (
                                <div style={{
                                    maxHeight: empleados.length > 4 ? "260px" : "auto",
                                    overflowY: empleados.length > 4 ? "auto" : "visible"
                                }}>
                                    {empleados
                                        .filter(e =>
                                            e.nombre.toLowerCase().includes(busqueda.toLowerCase())
                                        )
                                        .map(e => (
                                            <div
                                                key={e.idformulariorespuesta}
                                                style={styles.card}
                                                onClick={() => cargarDetalle(e.idformulariorespuesta)}
                                            >
                                                {e.nombre}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <button
                                style={styles.backButton}
                                onClick={() => setDetalle(null)}
                            >
                                ← Volver
                            </button>

                            <button
                                onClick={() => setModoComentario(true)}
                                style={{
                                    background: "#fb8500",
                                    color: "#fff",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    marginBottom: "10px"
                                }}
                            >
                                Agregar comentarios
                            </button>


                            <h4>{detalle.empleado}</h4>

                            {detalle.respuestas.map((r, i) => (
                                <div key={i} style={{ marginBottom: "15px" }}>
                                    <div style={styles.pregunta}>
                                        {r.pregunta}
                                    </div>

                                    <div style={styles.respuesta}>
                                        {r.respuesta}
                                    </div>

                                    {modoComentario && (
                                        <textarea
                                            placeholder="Escribir comentario..."
                                            value={comentarios[r.idrespuesta] || ""}
                                            onChange={(e) =>
                                                setComentarios({
                                                    ...comentarios,
                                                    [r.idrespuesta]: e.target.value
                                                })
                                            }
                                            style={{
                                                width: "100%",
                                                marginTop: "5px",
                                                padding: "6px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc"
                                            }}
                                        />
                                    )}

                                    {!modoComentario && r.comentario && (
                                        <div style={{
                                            marginTop: "5px",
                                            fontStyle: "italic",
                                            color: "#555"
                                        }}>
                                            OBSERVACIONES: {r.comentario}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {modoComentario && (
                                <button
                                    onClick={guardarComentarios}
                                    style={{
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        padding: "8px",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Guardar comentarios
                                </button>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerRespuestasModal;