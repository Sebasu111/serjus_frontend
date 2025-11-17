import React, { useState } from "react";
import axios from "axios";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ModalEmpleadosAsignados from "./ModalEmpleadosAsignados";
import GestionAsistenciaModal from "./GestionAsistenciaModal";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const CapacitacionesTable = ({
    capacitaciones,
    handleEdit,
    handleDelete,
    handleActivate,
    handleAsignarCapacitacion,
    mostrarFinalizadas,
    paginaActual,
    totalPaginas,
    setPaginaActual
}) => {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [loadingEmpleados, setLoadingEmpleados] = useState(false);
    const [modalAsistenciaVisible, setModalAsistenciaVisible] = useState(false);
    const [capacitacionAsistencia, setCapacitacionAsistencia] = useState(null);

    const idRol = parseInt(sessionStorage.getItem("idRol"));
    const esCoordinadorOAdmin = [4, 5].includes(idRol);

    const toggleMenu = id => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const formatDate = dateStr => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    };

    const handleVerEmpleados = async capacitacion => {
        try {
            setEventoSeleccionado(capacitacion);
            setLoadingEmpleados(true);
            setModalVisible(true);

            const res = await axios.get(`${API}/empleadocapacitacion/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.results || res.data;

            const asignados = data.filter(
                item => Number(item.idcapacitacion) === Number(capacitacion.idcapacitacion || capacitacion.id) && item.estado === true
            );

            const empleadosRes = await axios.get(`${API}/empleados/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const empleados = empleadosRes.data.results || empleadosRes.data;

            const resDocumentos = await axios.get(`${API}/documentos/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const documentos = resDocumentos.data.results || resDocumentos.data;

            const listaFinal = asignados
                .map(asig => {
                    const emp = empleados.find(e => Number(e.idempleado) === Number(asig.idempleado));
                    let doc = null;
                    if (asig.iddocumento) {
                        doc = documentos.find(d => Number(d.iddocumento) === Number(asig.iddocumento)) || null;
                    }
                    return emp
                        ? {
                            idempleadocapacitacion: asig.idempleadocapacitacion,
                            idempleado: asig.idempleado,
                            nombre: emp.nombre,
                            apellido: emp.apellido,
                            asistencia: asig.asistencia,
                            observacion: asig.observacion,
                            fechaenvio: asig.fechaenvio,
                            documento: doc ? { nombrearchivo: doc.nombrearchivo, archivo_url: doc.archivo_url } : null
                        }
                        : null;
                })
                .filter(Boolean);

            setEmpleadosAsignados(listaFinal);
        } catch (error) {
            console.error("Error al obtener empleados asignados:", error);
            setEmpleadosAsignados([]);
        } finally {
            setLoadingEmpleados(false);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEventoSeleccionado(null);
        setEmpleadosAsignados([]);
    };

    const handleGestionAsistencia = async (capacitacion) => {
        setCapacitacionAsistencia(capacitacion);
        setLoadingEmpleados(true);

        try {
            const response = await axios.get(`${API}/empleadocapacitacion/?capacitacion=${capacitacion.idcapacitacion || capacitacion.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const asignacionesActivas = response.data.filter(asig => asig.estado);

            if (asignacionesActivas.length > 0) {
                const listaFinal = await Promise.all(
                    asignacionesActivas.map(async asig => {
                        const emp = await axios.get(`${API}/empleados/${asig.idempleado}/`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        let documento = null;
                        if (asig.iddocumento) {
                            try {
                                const doc = await axios.get(`${API}/documentos/${asig.iddocumento}/`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                documento = doc.data;
                            } catch (docError) {
                                console.warn("Error al obtener documento:", docError);
                            }
                        }

                        return {
                            idempleadocapacitacion: asig.idempleadocapacitacion,
                            idempleado: asig.idempleado,
                            nombre: emp.data.nombre,
                            apellido: emp.data.apellido,
                            asistencia: asig.asistencia,
                            documento: documento,
                            fechaenvio: asig.fechaenvio,
                            observacion: asig.observacion
                        };
                    })
                );
                setEmpleadosAsignados(listaFinal);
            } else {
                setEmpleadosAsignados([]);
            }
        } catch (error) {
            console.error("Error al obtener empleados para asistencia:", error);
            setEmpleadosAsignados([]);
        } finally {
            setLoadingEmpleados(false);
            setModalAsistenciaVisible(true);
        }
    };

    const closeModalAsistencia = () => {
        setModalAsistenciaVisible(false);
        setCapacitacionAsistencia(null);
        setEmpleadosAsignados([]);
    };

    return (
        <div
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "30px 40px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}
        >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Evento</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Lugar</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Fechas</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>
                            Institución
                        </th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "right" }}>Monto</th>
                        <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
                        {!mostrarFinalizadas && (
                            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>
                                Acciones
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {capacitaciones.length > 0 ? (
                        capacitaciones.map(c => {
                            const id = c.idcapacitacion || c.id;
                            return (
                                <tr key={id}>
                                    {/*   Nombre del evento sin subrayado */}
                                    <td
                                        style={{
                                            padding: "10px",
                                            borderBottom: "1px solid #f0f0f0",
                                            color: "#007bff",
                                            cursor: "pointer",
                                            fontWeight: "500"
                                        }}
                                        onClick={() => handleVerEmpleados(c)}
                                    >
                                        {c.nombreevento}
                                    </td>

                                    <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.lugar}</td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            textAlign: "center",
                                            borderBottom: "1px solid #f0f0f0"
                                        }}
                                    >
                                        {formatDate(c.fechainicio)} a {formatDate(c.fechafin)}
                                    </td>
                                    <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                                        {c.institucionfacilitadora}
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            textAlign: "right",
                                            borderBottom: "1px solid #f0f0f0"
                                        }}
                                    >
                                        {c.montoejecutado || 0}
                                    </td>
                                    <td
                                        style={{
                                            padding: "10px",
                                            textAlign: "center",
                                            borderBottom: "1px solid #f0f0f0",
                                            fontWeight: "600",
                                            color: (() => {
                                                const hoy = new Date();
                                                const fechaInicio = new Date(c.fechainicio);
                                                const fechaFin = new Date(c.fechafin);

                                                // Si está desactivado manualmente
                                                if (!c.estado) {
                                                    return "#dc2626"; // Rojo (mismo que otros elementos del proyecto)
                                                }

                                                // Si ya terminó
                                                if (fechaFin < hoy) {
                                                    return "#dc2626"; // Rojo para finalizado
                                                }

                                                // Si está en proceso (entre inicio y fin)
                                                if (fechaInicio <= hoy && hoy <= fechaFin) {
                                                    return "#2563eb"; // Azul para en proceso
                                                }

                                                // Si aún no ha empezado
                                                return "#16a34a"; // Verde para activo
                                            })()
                                        }}
                                    >
                                        {(() => {
                                            const hoy = new Date();
                                            const fechaInicio = new Date(c.fechainicio);
                                            const fechaFin = new Date(c.fechafin);

                                            // Si está desactivado manualmente
                                            if (!c.estado) {
                                                return "Inactivo";
                                            }

                                            // Si ya terminó
                                            if (fechaFin < hoy) {
                                                return "Finalizado";
                                            }

                                            // Si está en proceso (entre inicio y fin)
                                            if (fechaInicio <= hoy && hoy <= fechaFin) {
                                                return "En Proceso";
                                            }

                                            // Si aún no ha empezado
                                            return "Activo";
                                        })()}
                                    </td>
                                    {!mostrarFinalizadas && (
                                        <td
                                            style={{
                                                padding: "10px",
                                                textAlign: "center",
                                                borderBottom: "1px solid #f0f0f0"
                                            }}
                                        >
                                            <div style={comboBoxStyles.container}>
                                                <button style={comboBoxStyles.button.base} onClick={() => toggleMenu(id)}>
                                                    Opciones ▾
                                                </button>
                                                {openMenuId === id && (
                                                    <div style={comboBoxStyles.menu.container}>
                                                        {(() => {
                                                            const hoy = new Date();
                                                            const fechaInicio = new Date(c.fechainicio);
                                                            const fechaFin = new Date(c.fechafin);

                                                            // Si está inactivo (desactivado manualmente)
                                                            if (!c.estado) {
                                                                return (
                                                                    <div
                                                                        style={comboBoxStyles.menu.item.activar.base}
                                                                        onClick={() => {
                                                                            handleActivate(id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Reactivar
                                                                    </div>
                                                                );
                                                            }

                                                            // Si ya finalizó (después de fecha fin) o está en proceso, mostrar gestión de asistencia si es coordinador/admin
                                                            if (fechaFin < hoy || (fechaInicio <= hoy && hoy <= fechaFin)) {
                                                                // Para capacitaciones finalizadas, mostrar gestión de asistencia
                                                                if (fechaFin < hoy && (esCoordinadorOAdmin || !esCoordinadorOAdmin)) {
                                                                    return (
                                                                        <div
                                                                            style={comboBoxStyles.menu.item.editar.base}
                                                                            onClick={() => {
                                                                                handleGestionAsistencia(c);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                        >
                                                                            Gestionar Asistencia
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
                                                                    <div style={{ padding: "10px", color: "#666", textAlign: "center" }}>
                                                                        Sin acciones disponibles
                                                                    </div>
                                                                );
                                                            }

                                                            // Si aún no ha empezado, todas las acciones disponibles
                                                            return (
                                                                <>
                                                                    <div
                                                                        style={comboBoxStyles.menu.item.editar.base}
                                                                        onClick={() => {
                                                                            handleAsignarCapacitacion(c);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Asignar Colaboradores
                                                                    </div>
                                                                    <div
                                                                        style={comboBoxStyles.menu.item.editar.base}
                                                                        onClick={() => {
                                                                            handleEdit(c);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Editar
                                                                    </div>
                                                                    <div
                                                                        style={comboBoxStyles.menu.item.desactivar.base}
                                                                        onClick={() => {
                                                                            handleDelete(c);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        Desactivar
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={mostrarFinalizadas ? "6" : "7"} style={{ textAlign: "center", padding: "20px" }}>
                                No hay capacitaciones registradas
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* PAGINACIÓN */}
            {totalPaginas > 1 && (
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPaginaActual(i + 1)}
                            style={{
                                margin: "0 5px",
                                padding: "6px 12px",
                                border: "1px solid #007bff",
                                background: paginaActual === i + 1 ? "#007bff" : "#fff",
                                color: paginaActual === i + 1 ? "#fff" : "#007bff",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal separado */}
            {modalVisible && (
                <ModalEmpleadosAsignados
                    visible={modalVisible}
                    onClose={closeModal}
                    empleados={empleadosAsignados}
                    evento={eventoSeleccionado}
                    loading={loadingEmpleados}
                />
            )}

            {/* Modal de gestión de asistencia */}
            {modalAsistenciaVisible && capacitacionAsistencia && (
                <GestionAsistenciaModal
                    visible={modalAsistenciaVisible}
                    onClose={closeModalAsistencia}
                    capacitacion={capacitacionAsistencia}
                    empleadosAsignados={empleadosAsignados}
                    onActualizar={() => {
                        // Recargar empleados después de actualizar
                        handleGestionAsistencia(capacitacionAsistencia);
                    }}
                />
            )}
        </div>
    );
};

export default CapacitacionesTable;
