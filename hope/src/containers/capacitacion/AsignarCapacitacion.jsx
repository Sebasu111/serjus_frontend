import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";
import { X } from "lucide-react";

const AsignarCapacitacion = ({ capacitacionInicial = null, onClose }) => {
    const [empleados, setEmpleados] = useState([]);
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(capacitacionInicial || "");
    const [observacion, setObservacion] = useState("");
    const [showError, setShowError] = useState(false);
    const [busqueda, setBusqueda] = useState(""); // <-- Nuevo estado para búsqueda

    const fechaActual = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

    useEffect(() => {
        fetchEmpleados();
        fetchCapacitaciones();
    }, []);

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
            setEmpleados(res.data.results || res.data);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
            showToast("Error al cargar empleados", "error");
        }
    };

    const fetchCapacitaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
            const activas = (res.data.results || res.data).filter(c => c.estado === true);
            setCapacitaciones(activas);
        } catch (error) {
            console.error("Error al cargar capacitaciones:", error);
            showToast("Error al cargar capacitaciones", "error");
        }
    };

    const toggleEmpleadoSeleccionado = id => {
        setEmpleadosSeleccionados(prev => (prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!capacitacionSeleccionada || !empleadosSeleccionados.length || !observacion.trim()) {
            setShowError(true);
            showToast("Complete todos los campos obligatorios", "warning");
            return;
        }

        setShowError(false);

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario") || 1);

            // Obtener asignaciones existentes
            const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
            const asignacionesExistentes = res.data.results || res.data;

            let asignacionesRealizadas = 0;

            for (const idEmpleado of empleadosSeleccionados) {
                const yaAsignado = asignacionesExistentes.some(
                    asig =>
                        Number(asig.idempleado) === Number(idEmpleado) &&
                        Number(asig.idcapacitacion) === Number(capacitacionSeleccionada)
                );

                // Buscar datos del empleado para mostrar su nombre
                const empleado = empleados.find(emp => Number(emp.idempleado || emp.id) === Number(idEmpleado));
                const nombreEmpleado = empleado ? `${empleado.nombre} ${empleado.apellido}` : `Empleado ${idEmpleado}`;

                if (yaAsignado) {
                    showToast(`El empleado ${nombreEmpleado} ya está asignado a esta capacitación.`, "warning");
                    continue; // Saltar este empleado
                }

                const payload = {
                    idempleado: Number(idEmpleado),
                    idcapacitacion: Number(capacitacionSeleccionada),
                    observacion,
                    fechaenvio: new Date().toISOString().split("T")[0],
                    asistencia: "no",
                    idusuario: idUsuario,
                    estado: true
                };

                await axios.post("http://127.0.0.1:8000/api/empleadocapacitacion/", payload);
                asignacionesRealizadas++;
            }

            if (asignacionesRealizadas > 0) {
                showToast("Capacitación asignada correctamente", "success");
                setEmpleadosSeleccionados([]);
                setCapacitacionSeleccionada(capacitacionInicial || "");
                setObservacion("");
            } else {
                showToast("No se realizó ninguna asignación nueva", "info");
            }
        } catch (error) {
            console.error(error);
            showToast("Error al asignar capacitación", "error");
        }
    };

    // Filtrado por nombre o apellido
    const empleadosFiltrados = empleados.filter(emp => {
        const nombreCompleto = `${emp.nombre} ${emp.apellido}`.toLowerCase();
        return nombreCompleto.includes(busqueda.toLowerCase());
    });

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "500px",
                maxWidth: "95%",
                background: "#fff",
                padding: "30px",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                borderRadius: "12px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column"
            }}
        >
            <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Asignar Capacitación</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {/* Capacitación */}
                <div>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Seleccione una capacitación <span style={{ color: "red" }}>*</span>
                    </label>
                    <select
                        value={capacitacionSeleccionada}
                        onChange={e => setCapacitacionSeleccionada(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc"
                        }}
                    >
                        <option value="">Seleccione una capacitación</option>
                        {capacitaciones.map(cap => (
                            <option key={cap.idcapacitacion || cap.id} value={cap.idcapacitacion || cap.id}>
                                {cap.nombreevento}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro de empleados */}
                <div>
                    <label style={{ display: "block", marginBottom: "6px" }}>Buscar empleado</label>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            marginBottom: "8px"
                        }}
                    />
                </div>

                {/* Empleados */}
                <div>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Seleccione empleados <span style={{ color: "red" }}>*</span>
                    </label>

                    <div
                        style={{
                            maxHeight: "120px",
                            overflowY: "auto",
                            border: `1px solid ${empleadosSeleccionados.length === 0 && showError ? "red" : "#ccc"}`,
                            borderRadius: "6px",
                            padding: "8px",
                            backgroundColor: "#f9fafb"
                        }}
                    >
                        {empleadosFiltrados.length > 0 ? (
                            empleadosFiltrados.map(emp => (
                                <label
                                    key={emp.idempleado || emp.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "6px 4px",
                                        borderBottom: "1px solid #eee",
                                        cursor: "pointer"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={empleadosSeleccionados.includes(emp.idempleado || emp.id)}
                                        onChange={() => toggleEmpleadoSeleccionado(emp.idempleado || emp.id)}
                                    />
                                    <span>
                                        {emp.nombre} {emp.apellido}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p style={{ fontSize: "14px", color: "#777" }}>No se encontraron empleados</p>
                        )}
                    </div>

                    {empleadosSeleccionados.length === 0 && showError && (
                        <span
                            style={{
                                color: "red",
                                fontSize: "12px",
                                marginTop: "4px",
                                display: "block"
                            }}
                        >
                            Debe seleccionar al menos un empleado
                        </span>
                    )}
                </div>

                {/* Observación */}
                <div>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Observaciones <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={observacion}
                        onChange={e => setObservacion(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc"
                        }}
                    />
                </div>

                <p>
                    Fecha de envío: <strong>{fechaActual}</strong>
                </p>

                <button
                    type="submit"
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
                    Asignar
                </button>

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
                    type="button"
                >
                    <X size={24} color="#555" />
                </button>
            </form>

            <ToastContainer />
        </div>
    );
};

export default AsignarCapacitacion;
