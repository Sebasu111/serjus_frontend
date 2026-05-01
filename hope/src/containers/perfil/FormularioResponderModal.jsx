import React, { useEffect, useState } from "react";
import styles from "../Induccion/FormularioModal.styles";
import { showToast } from "../../utils/toast.js";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const FormularioResponderModal = ({ visible, onClose, formulario, empleado }) => {
    const [respuestas, setRespuestas] = useState({});
    useEffect(() => {
        if (formulario && Object.keys(respuestas).length === 0) {
            const inicial = {};

            (formulario.preguntas || []).forEach(p => {
                inicial[p.idpregunta] = {
                    idpregunta: p.idpregunta,
                    respuesta_texto: "",
                    idopcion: null
                };
            });

            setRespuestas(inicial);
        }
    }, [formulario]);

    const guardarRespuestas = async () => {
        try {
            // 🔥 VALIDAR ANTES
            const todasRespondidas = (formulario?.preguntas || []).every(p => {
                const r = respuestas[p.idpregunta];

                if (p.tipo === "abierta") {
                    return r?.respuesta_texto && r.respuesta_texto.trim() !== "";
                }

                if (p.tipo === "opcion_multiple") {
                    return r?.idopcion !== null;
                }

                return true;
            });

            if (!todasRespondidas) {
                showToast("Responde todas las preguntas", "warning");
                return;
            }

            const idEmpleado = empleado?.idempleado;

            const respuestasLimpias = Object.values(respuestas)
                .filter(r => r.idpregunta) // 🔥 clave
                .map(r => ({
                    idpregunta: r.idpregunta,
                    respuesta_texto: r.respuesta_texto || null,
                    idopcion: r.idopcion || null
                }));

            const payload = {
                idformulario: formulario.idformulario,
                idempleado: idEmpleado,
                respuestas: respuestasLimpias
            };
            //console.log("RESPUESTAS:", respuestas);

            await axios.post(`${API}/formulario-respuestas/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showToast("Formulario enviado correctamente", "success");
            onClose();

        } catch (error) {
            console.error(error);
            showToast("Error al guardar respuestas", "error");
        }
    };

    const handleTexto = (idpregunta, valor) => {
        if (!idpregunta) return; // 🔥 protección

        setRespuestas(prev => ({
            ...prev,
            [idpregunta]: {
                ...prev[idpregunta],
                idpregunta,
                respuesta_texto: valor
            }
        }));
    };

    const handleOpcion = (idpregunta, idopcion) => {
        if (!idpregunta) return; // 🔥 protección

        setRespuestas(prev => ({
            ...prev,
            [idpregunta]: {
                ...prev[idpregunta],
                idpregunta,
                idopcion
            }
        }));
    };

    const formularioCompleto = (formulario?.preguntas || []).every(p => {
        const r = respuestas[p.idpregunta];

        if (p.tipo === "abierta") return r?.respuesta_texto?.trim();
        if (p.tipo === "opcion_multiple") return r?.idopcion;

        return true;
    });


    if (!visible) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* ❌ cerrar */}
                <button style={styles.closeIcon} onClick={onClose}>
                    ✕
                </button>

                {/* 🧠 título */}
                <h3 style={{ marginBottom: "15px" }}>
                    {formulario?.titulo || "Formulario"}
                </h3>

                <div style={styles.body}>
                    {formulario?.preguntas?.length > 0 ? (
                        formulario.preguntas.map((p, index) => (
                            <div key={p.idpregunta || index} style={styles.card}>

                                {/* 📝 pregunta */}
                                <p style={{ fontWeight: "600" }}>
                                    {index + 1}. {p.texto}
                                </p>

                                {/* 🔹 ABIERTA */}
                                {p.tipo === "abierta" && (
                                    <textarea
                                        rows={3}
                                        placeholder="Escribe tu respuesta..."
                                        value={respuestas[p.idpregunta]?.respuesta_texto || ""}
                                        onChange={(e) => handleTexto(p.idpregunta, e.target.value)}
                                        style={styles.textareaPregunta}
                                    />
                                )}

                                {/* 🔹 OPCIÓN MÚLTIPLE */}
                                {p.tipo === "opcion_multiple" && (
                                    <div>
                                        {p.opciones?.map((op) => (
                                            <label
                                                key={`${p.idpregunta}-${op.idopcion}`}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    marginBottom: "8px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`pregunta-${p.idpregunta}`}
                                                    checked={respuestas[p.idpregunta]?.idopcion === op.idopcion}
                                                    onChange={() => handleOpcion(p.idpregunta, op.idopcion)}
                                                />
                                                {op.texto}
                                            </label>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ))
                    ) : (
                        <p>No hay preguntas</p>
                    )}
                </div>

                {/* 🔘 footer */}
                <div style={styles.footer}>
                    <button style={styles.buttonSecondary} onClick={onClose}>
                        Cerrar
                    </button>

                    <button
                        style={styles.buttonPrimary}
                        onClick={guardarRespuestas}
                        disabled={!formularioCompleto}
                    >
                        Enviar respuestas
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FormularioResponderModal;