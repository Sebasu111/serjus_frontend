import React, { useState } from "react";
import { X } from "lucide-react";
import { showToast } from "../utils/toast";
import "./EstadoPostulacionModal.css";

const API = process.env.REACT_APP_API_URL;

const EstadoPostulacionModal = ({ show, onClose }) => {
    const [dpi, setDpi] = useState("");
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [indexActual, setIndexActual] = useState(0);

    const siguiente = () => {
        if (indexActual < resultados.length - 1) {
            setIndexActual(indexActual + 1);
        }
    };

    const anterior = () => {
        if (indexActual > 0) {
            setIndexActual(indexActual - 1);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "—";
        const d = new Date(fecha);
        if (isNaN(d)) return fecha;

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    if (!show) return null;

    const buscarEstado = async () => {
        if (!/^[0-9]{13}$/.test(dpi)) {
            showToast("Ingrese un DPI válido (13 dígitos)", "warning");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API}/postulaciones/por-dpi/?dpi=${dpi}`);
            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || "Error al consultar", "error");
                setResultados([]);
                return;
            }

            if (!data.postulaciones || data.postulaciones.length === 0) {
                showToast("No tienes postulaciones registradas", "info");
                setResultados([]);
                return;
            }

            const ordenadas = data.postulaciones.sort((a, b) => {
                // 1️⃣ Rechazadas al final
                if (a.estado === "Rechazado") return 1;
                if (b.estado === "Rechazado") return -1;

                // 2️⃣ Más recientes primero
                return new Date(b.fecha) - new Date(a.fecha);
            });

            setResultados(ordenadas);
            setIndexActual(0);

        } catch (err) {
            console.error(err);
            showToast("Error al consultar el estado", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-estado">
            <h3 style={{ textAlign: "center" }}>Consultar Estado</h3>

            {/* INPUT DPI */}
            <input
                className="modal-input"
                type="text"
                placeholder="Ingrese su DPI"
                value={dpi}
                onChange={(e) => {
                    if (/^[0-9]*$/.test(e.target.value)) setDpi(e.target.value);
                }}
            />

            <button onClick={buscarEstado} className="modal-btn">
                {loading ? "Buscando..." : "Consultar"}
            </button>

            {/* RESULTADOS */}
            <div className="modal-resultados">
                {resultados.length > 0 && (
                    <div className="modal-card">
                        <h4>{resultados[indexActual].puesto}</h4>
                        <p><strong>Convocatoria:</strong> {resultados[indexActual].convocatoria}</p>
                        <p><strong>Fecha:</strong> {formatFecha(resultados[indexActual].fecha)}</p>
                        <p>
                            <strong>Estado:</strong>{" "}
                            <span className={getEstadoClass(resultados[indexActual].estado)}>
                                {resultados[indexActual].estado === "Rechazado"
                                    ? "No Seleccionado"
                                    : resultados[indexActual].estado}
                            </span>
                        </p>

                        {/* 🔽 CONTROLES */}
                        <div className="modal-nav">
                            <button onClick={anterior} disabled={indexActual === 0}>
                                ◀
                            </button>

                            <span>
                                {indexActual + 1} / {resultados.length}
                            </span>

                            <button
                                onClick={siguiente}
                                disabled={indexActual === resultados.length - 1}
                            >
                                ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button onClick={onClose} className="modal-close">
                <X size={24} />
            </button>
        </div>
    );
};


const getEstadoClass = (estado) => {
    if (estado === "Postulado") return "estado-postulado";
    if (estado === "Rechazado") return "estado-rechazado";
    if (estado.includes("Entrevista")) return "estado-entrevista";
    if (estado === "Contratado") return "estado-contratado";
    return "";
};

export default EstadoPostulacionModal;