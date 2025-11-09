import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const DocumentosAsignadosModal = ({ induccion, onClose }) => {
    const [items, setItems] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(10);
    const [empleados, setEmpleados] = useState([]);
    const [documentos, setDocumentos] = useState([]);

    useEffect(() => {
        if (induccion) {
            fetchDocumentosAsignados();
            fetchEmpleados();
            fetchDocumentos();
        }
    }, [induccion]);

    const fetchDocumentosAsignados = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/inducciondocumentos/`);
            const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            // Filtrar solo los documentos de esta inducción
            const documentosInduccion = raw.filter(item => item.idinduccion === induccion.idinduccion);
            setItems(documentosInduccion);
        } catch (e) {
            console.error(e);
            showToast("Error al cargar documentos asignados", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setEmpleados(data.filter(item => item.estado));
        } catch (e) {
            console.error("Error al cargar colaboradores:", e);
        }
    };

    const fetchDocumentos = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/documentos/");
            const data = Array.isArray(res.data) ? res.data : res.data.results || [];
            setDocumentos(data);
        } catch (e) {
            console.error("Error al cargar documentos:", e);
        }
    };

    const filtrados = items.filter(i => {
        const empleado = empleados.find(emp => emp.idempleado === i.idempleado);
        const nombreEmpleado = empleado ? `${empleado.nombre} ${empleado.apellido}`.toLowerCase() : "";
        return nombreEmpleado.includes(busqueda.toLowerCase());
    });

    const indexLast = paginaActual * elementosPorPagina;
    const indexFirst = indexLast - elementosPorPagina;
    const paginados = filtrados.slice(indexFirst, indexLast);
    const totalPaginas = Math.ceil(filtrados.length / elementosPorPagina);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "900px",
                    maxHeight: "90vh",
                    overflow: "auto",
                    padding: "30px",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    <X size={24} color="#555" />
                </button>

                <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
                    Documentos Asignados - {induccion?.nombre}
                </h2>

                <div>
                    <input
                        type="text"
                        placeholder="Buscar por colaborador..."
                        value={busqueda}
                        onChange={e => {
                            setBusqueda(e.target.value);
                            setPaginaActual(1);
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "20px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            fontSize: "14px"
                        }}
                    />

                    <div style={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                    <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #eee", fontWeight: "600" }}>Nombre</th>
                                    <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #eee", fontWeight: "600" }}>Fecha</th>
                                    <th style={{ padding: "15px", textAlign: "left", borderBottom: "2px solid #eee", fontWeight: "600" }}>Colaborador</th>
                                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #eee", fontWeight: "600" }}>Tipo</th>
                                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #eee", fontWeight: "600" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginados.length > 0 ? (
                                    paginados.map(item => {
                                        const empleado = empleados.find(emp => emp.idempleado === item.idempleado);
                                        const documento = documentos.find(doc => (doc.iddocumento || doc.id) === item.iddocumento);
                                        return (
                                            <tr key={item.idinducciondocumento} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                {/* Nombre del documento */}
                                                <td style={{ padding: "15px" }}>
                                                    <div style={{ fontSize: "14px", fontWeight: "500" }}>
                                                        {documento ? documento.nombrearchivo : "Documento no encontrado"}
                                                    </div>
                                                </td>

                                                {/* Fecha */}
                                                <td style={{ padding: "15px", fontSize: "14px" }}>
                                                    {new Date(item.fechaasignado).toLocaleDateString("es-ES")}
                                                </td>

                                                {/* Colaborador */}
                                                <td style={{ padding: "15px" }}>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        fontSize: "14px",
                                                        fontWeight: "500"
                                                    }}>
                                                        <div style={{
                                                            width: "32px",
                                                            height: "32px",
                                                            borderRadius: "50%",
                                                            backgroundColor: "#219ebc",
                                                            color: "#fff",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            marginRight: "10px",
                                                            fontSize: "12px",
                                                            fontWeight: "600"
                                                        }}>
                                                            {empleado ? `${empleado.nombre[0]}${empleado.apellido[0]}` : "?"}
                                                        </div>
                                                        <div>
                                                            {empleado ? `${empleado.nombre} ${empleado.apellido}` : "Colaborador no encontrado"}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Tipo */}
                                                <td style={{ padding: "15px", textAlign: "center" }}>
                                                    <span style={{
                                                        padding: "4px 12px",
                                                        borderRadius: "12px",
                                                        backgroundColor: "#e8f5e8",
                                                        color: "#2e7d32",
                                                        fontSize: "12px",
                                                        fontWeight: "500"
                                                    }}>
                                                        DOCUMENTOS DE INDUCCIÓN
                                                    </span>
                                                </td>

                                                {/* Acciones */}
                                                <td style={{ padding: "15px", textAlign: "center" }}>
                                                    <select style={{
                                                        padding: "6px 12px",
                                                        borderRadius: "6px",
                                                        border: "1px solid #ccc",
                                                        fontSize: "12px",
                                                        cursor: "pointer"
                                                    }}>
                                                        <option>Opciones</option>
                                                        <option>Ver documento</option>
                                                        <option>Marcar como completado</option>
                                                        <option>Eliminar asignación</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{
                                            textAlign: "center",
                                            padding: "40px 20px",
                                            color: "#666",
                                            fontSize: "14px"
                                        }}>
                                            <div style={{ marginBottom: "8px", fontSize: "48px", opacity: 0.3 }}>📄</div>
                                            No hay documentos asignados para esta inducción
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Paginación y elementos por página */}
                        <div style={{
                            padding: "20px",
                            borderTop: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "15px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <label style={{ fontSize: "14px", color: "#666" }}>Mostrar:</label>
                                <select
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        setElementosPorPagina(Number(e.target.value));
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        padding: "6px 10px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        fontSize: "14px"
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={20}>20</option>
                                </select>
                                <span style={{ fontSize: "14px", color: "#666" }}>
                                    de {filtrados.length} registros
                                </span>
                            </div>

                            {totalPaginas > 1 && (
                                <div style={{ display: "flex", gap: "5px" }}>
                                    <button
                                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                                        disabled={paginaActual === 1}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #219ebc",
                                            background: "#fff",
                                            color: "#219ebc",
                                            borderRadius: "5px",
                                            cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                                            opacity: paginaActual === 1 ? 0.5 : 1,
                                            fontSize: "14px"
                                        }}
                                    >
                                        Anterior
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                        const startPage = Math.max(1, paginaActual - 2);
                                        const page = startPage + i;
                                        if (page > totalPaginas) return null;

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setPaginaActual(page)}
                                                style={{
                                                    padding: "8px 12px",
                                                    border: "1px solid #219ebc",
                                                    background: paginaActual === page ? "#219ebc" : "#fff",
                                                    color: paginaActual === page ? "#fff" : "#219ebc",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    minWidth: "40px"
                                                }}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                                        disabled={paginaActual === totalPaginas}
                                        style={{
                                            padding: "8px 12px",
                                            border: "1px solid #219ebc",
                                            background: "#fff",
                                            color: "#219ebc",
                                            borderRadius: "5px",
                                            cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer",
                                            opacity: paginaActual === totalPaginas ? 0.5 : 1,
                                            fontSize: "14px"
                                        }}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentosAsignadosModal;