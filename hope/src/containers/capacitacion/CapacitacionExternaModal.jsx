import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, FileText } from "lucide-react";
import "./CapacitacionExternaModal.css";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");
const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-GT");
};
const CapacitacionExternaModal = ({
    show,
    onClose,
    registro
}) => {
    const [documentos, setDocumentos] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [pagina, setPagina] = useState(1);
    const totalPaginas = 4;
    useEffect(() => {
        if (show && registro?.idinformecapacitacion) {
            cargarDocumentos();
        }
    }, [show, registro]);
    useEffect(() => {
        if (show) {
            setPagina(1);
        }
    }, [show]);
    const cargarDocumentos = async () => {
        try {
            setLoadingDocs(true);
            const resRelacion = await axios.get(
                `${API}/informecapacitaciondocumento/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const relaciones =
                resRelacion.data.results || resRelacion.data;
            const relacionados = relaciones.filter(
                rel =>
                    Number(rel.idinformecapacitacion) ===
                    Number(registro.idinformecapacitacion)
            );
            if (relacionados.length === 0) {
                setDocumentos([]);
                return;
            }
            const resDocs = await axios.get(
                `${API}/documentos/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const docs =
                resDocs.data.results || resDocs.data;
            const docsFinales = relacionados.map((rel) =>
                docs.find(
                    d =>
                        Number(d.iddocumento) ===
                        Number(rel.iddocumento)
                )
            ).filter(Boolean);
            setDocumentos(docsFinales);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDocs(false);
        }
    };
    if (!show || !registro) return null;
    return (
        <div className="capext-overlay">

            <div className="capext-modal">

                {/* HEADER */}
                <div className="capext-header">

                    <div>
                        <span className="capext-badge">
                            Informe Externo
                        </span>

                        <h2 className="capext-title">
                            {registro.nombreCapacitacion}
                        </h2>

                        <p className="capext-subtitle">
                            {registro.lugar}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="capext-close"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* PAGINAS */}
                <div className="capext-content">

                    {/* PAGINA 1 */}
                    {pagina === 1 && (

                        <div className="capext-page">

                            <div className="capext-section">
                                <h3>Información General</h3>

                                <div className="capext-grid">

                                    <div className="capext-card">
                                        <span>Capacitación</span>
                                        <strong>
                                            {registro.nombreCapacitacion}
                                        </strong>
                                    </div>

                                    <div className="capext-card">
                                        <span>Lugar</span>
                                        <strong>
                                            {registro.lugar}
                                        </strong>
                                    </div>

                                    <div className="capext-card">
                                        <span>Fecha Inicio</span>
                                        <strong>
                                            {formatearFecha(registro.fechaInicio)}
                                        </strong>
                                    </div>

                                    <div className="capext-card">
                                        <span>Fecha Fin</span>
                                        <strong>
                                            {formatearFecha(registro.fechaFin)}
                                        </strong>
                                    </div>

                                    <div className="capext-card capext-card-full">
                                        <span>Informe realizado por</span>
                                        <strong>
                                            {registro.empleado}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                    {/* PAGINA 2 */}
                    {pagina === 2 && (

                        <div className="capext-page">

                            <div className="capext-section">
                                <h3>Contenido del Informe</h3>

                                <div className="capext-info-block">
                                    <h4>Objetivos</h4>
                                    <p>{registro.objetivos || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Temáticas</h4>
                                    <p>{registro.tematicas_contenidos || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Metodología</h4>
                                    <p>{registro.metodologia || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Conclusiones</h4>
                                    <p>{registro.conclusiones || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Aciertos y dificultades</h4>
                                    <p>{registro.aciertos_dificultades || "-"}</p>
                                </div>

                            </div>

                        </div>

                    )}

                    {/* PAGINA 3 */}
                    {pagina === 3 && (

                        <div className="capext-page">

                            <div className="capext-section">

                                <h3>Resultados y Seguimiento</h3>

                                <div className="capext-info-block">
                                    <h4>Utilidad</h4>
                                    <p>{registro.utilidad_formacion || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Resultados Institución</h4>
                                    <p>{registro.resultados_institucion || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Resultados Participante</h4>
                                    <p>{registro.resultados_participante || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Compromiso</h4>
                                    <p>{registro.compromiso_aplicacion || "-"}</p>
                                </div>

                                <div className="capext-info-block">
                                    <h4>Seguimiento</h4>
                                    <p>{registro.propuesta_seguimiento || "-"}</p>
                                </div>

                            </div>

                        </div>

                    )}

                    {/* PAGINA 4 */}
                    {pagina === 4 && (

                        <div className="capext-page">

                            <div className="capext-section">

                                <h3>Documentos Adjuntos</h3>

                                <div className="capext-docs">

                                    {loadingDocs ? (

                                        <p>Cargando documentos...</p>

                                    ) : documentos.length === 0 ? (

                                        <div className="capext-empty">
                                            No hay documentos adjuntos.
                                        </div>

                                    ) : (

                                        documentos.map((doc) => (

                                            <a
                                                key={doc.iddocumento}
                                                href={doc.archivo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="capext-doc"
                                            >
                                                <FileText size={20} />

                                                <span>
                                                    {doc.nombrearchivo}
                                                </span>

                                            </a>

                                        ))

                                    )}

                                </div>

                            </div>

                        </div>

                    )}

                </div>

                {/* FOOTER */}
                <div className="capext-footer">

                    <button
                        disabled={pagina === 1}
                        onClick={() => setPagina(pagina - 1)}
                        className="capext-btn"
                    >
                        Anterior
                    </button>

                    <div className="capext-pages">
                        Página {pagina} de {totalPaginas}
                    </div>

                    <button
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina(pagina + 1)}
                        className="capext-btn"
                    >
                        Siguiente
                    </button>

                </div>

            </div>

        </div>
    );
};

export default CapacitacionExternaModal;