import React from "react";
import "./DescripcionModal.css";

const DescripcionModal = ({ show, onClose, convocatoria }) => {
    if (!show || !convocatoria) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>✖</button>

                <h2>{convocatoria.nombrepuesto}</h2>
                <h4>{convocatoria.nombreconvocatoria}</h4>

                <div className="descripcion-completa">
                    {convocatoria.descripcion || "Sin descripción disponible."}
                </div>
            </div>
        </div>
    );
};

export default DescripcionModal;