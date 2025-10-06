import React, { useEffect, useState } from "react";
import axios from "axios";

const AsignarCapacitacion = ({ capacitacionInicial = null }) => {
    const [empleados, setEmpleados] = useState([]);
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
    const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(capacitacionInicial || "");
    const [observacion, setObservacion] = useState("");
    const [mensaje, setMensaje] = useState("");

    // Fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split("T")[0];

    useEffect(() => {
        fetchEmpleados();
        fetchCapacitaciones();
    }, []);

    useEffect(() => {
        if (capacitacionInicial) {
            setCapacitacionSeleccionada(capacitacionInicial);
        }
    }, [capacitacionInicial]);

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/empleados/");
            setEmpleados(res.data.results || res.data);
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        }
    };

    const fetchCapacitaciones = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/capacitaciones/");
            // Filtramos solo las capacitaciones activas
            const activas = (res.data.results || res.data).filter(c => c.estado === true);
            setCapacitaciones(activas);
        } catch (error) {
            console.error("Error al cargar capacitaciones:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!empleadoSeleccionado || !capacitacionSeleccionada) {
            setMensaje("Complete todos los campos obligatorios");
            return;
        }

        try {
            const idUsuario = sessionStorage.getItem("idUsuario");
            await axios.post("http://127.0.0.1:8000/api/empleadocapacitacion/", {
                idempleado: Number(empleadoSeleccionado),
                idcapacitacion: Number(capacitacionSeleccionada),
                observacion,
                fechaenvio: fechaActual,
                asistencia: "no", // inicia inactivo
                idusuario: Number(idUsuario),
                estado: true
            });

            setMensaje("Capacitación asignada correctamente");
            setEmpleadoSeleccionado("");
            setCapacitacionSeleccionada(capacitacionInicial || "");
            setObservacion("");
        } catch (error) {
            console.error(error);
            setMensaje("Error al asignar capacitación");
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Asignar Capacitación a Empleado</h2>
            {mensaje && (
                <p style={{ color: mensaje.includes("Error") ? "red" : "green" }}>
                    {mensaje}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <select
                    value={empleadoSeleccionado}
                    onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
                >
                    <option value="">Seleccione un empleado</option>
                    {empleados.map((emp, index) => (
                        <option key={`${emp.id}-${index}`} value={emp.id}>
                            {emp.nombre}
                        </option>
                    ))}
                </select>

                <select
                    value={capacitacionSeleccionada}
                    onChange={(e) => setCapacitacionSeleccionada(e.target.value)}
                >
                    <option value="">Seleccione una capacitación</option>
                    {capacitaciones.map((cap, index) => (
                        <option key={`${cap.idcapacitacion || cap.id}-${index}`} value={cap.idcapacitacion || cap.id}>
                            {cap.nombreevento}
                        </option>
                    ))}
                </select>

                <p>Fecha de envío: <strong>{fechaActual}</strong></p>

                <input
                    type="text"
                    placeholder="Observaciones"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                />

                <button type="submit" style={{ marginTop: "15px" }}>Asignar</button>
            </form>
        </div>
    );
};

export default AsignarCapacitacion;
