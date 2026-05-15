import React, { useEffect, useState } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast";
import CapacitacionExternaModal from "./CapacitacionExternaModal";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const CapacitacionesExternas = () => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState("");
    const [fechaFinFiltro, setFechaFinFiltro] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const registrosPorPagina = elementosPorPagina;

    useEffect(() => {
        cargarDatos();
    }, []);

    const abrirDetalle = (registro) => {
        setRegistroSeleccionado(registro);
        setModalAbierto(true);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";

        const date = new Date(fecha);

        return date.toLocaleDateString("es-GT");
    };

    const cargarDatos = async () => {

        try {

            setLoading(true);

            const [
                resInformes,
                resCapacitaciones,
                resEmpleadoCap,
                resEmpleados
            ] = await Promise.all([
                axios.get(
                    `${API}/informes-capacitacion/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API}/capacitaciones/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API}/empleadocapacitacion/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API}/empleados/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
            ]);

            const informes =
                resInformes.data.results || resInformes.data;

            const capacitaciones =
                resCapacitaciones.data.results || resCapacitaciones.data;

            const empleadoCapacitacion =
                resEmpleadoCap.data.results || resEmpleadoCap.data;

            const empleados =
                resEmpleados.data.results || resEmpleados.data;

            const registrosFinales = informes.map((inf) => {

                const asignacion =
                    empleadoCapacitacion.find(
                        ec =>
                            Number(ec.idempleadocapacitacion) ===
                            Number(inf.idempleadocapacitacion)
                    );

                const capacitacion =
                    capacitaciones.find(
                        cap =>
                            Number(cap.idcapacitacion) ===
                            Number(asignacion?.idcapacitacion)
                    );

                const empleado = empleados.find(
                    emp =>
                        Number(emp.idempleado) ===
                        Number(asignacion?.idempleado)
                );

                return {
                    ...inf,

                    nombreCapacitacion:
                        capacitacion?.nombreevento ||
                        "Capacitación",

                    lugar:
                        capacitacion?.lugar ||
                        "-",

                    fechaInicio:
                        capacitacion?.fechainicio,

                    fechaFin:
                        capacitacion?.fechafin,

                    empleado:
                        empleado
                            ? `${empleado.nombre} ${empleado.apellido}`
                            : "Empleado no encontrado"
                };
            });

            setRegistros(registrosFinales);

        } catch (error) {

            console.error(error);

            showToast(
                "Error cargando capacitaciones externas",
                "error"
            );

        } finally {

            setLoading(false);

        }
    };

    const registrosFiltrados = registros.filter((item) => {

        const texto = busqueda.toLowerCase();

        const coincideTexto =
            item.nombreCapacitacion?.toLowerCase().includes(texto) ||
            item.lugar?.toLowerCase().includes(texto) ||
            item.empleado?.toLowerCase().includes(texto);

        const fechaItemInicio = item.fechaInicio
            ? new Date(item.fechaInicio)
            : null;

        let coincideFecha = true;

        if (fechaInicioFiltro) {
            coincideFecha =
                coincideFecha &&
                fechaItemInicio >= new Date(fechaInicioFiltro);
        }

        if (fechaFinFiltro) {

            const fechaFin = new Date(fechaFinFiltro);
            fechaFin.setHours(23, 59, 59, 999);

            coincideFecha =
                coincideFecha &&
                fechaItemInicio <= fechaFin;
        }

        return coincideTexto && coincideFecha;
    });

    const totalPaginas = Math.ceil(
        registrosFiltrados.length / registrosPorPagina
    );

    const indiceInicial =
        (paginaActual - 1) * registrosPorPagina;

    const registrosPaginados =
        registrosFiltrados.slice(
            indiceInicial,
            indiceInicial + registrosPorPagina
        );

    return (
        <div>

            <h2
                style={{
                    marginBottom: "20px",
                    textAlign: "center"
                }}
            >
                Capacitaciones con Informe Externo
            </h2>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: "12px",
                    marginBottom: "25px",
                    background: "#fff",
                    padding: "18px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                }}
            >

                <input
                    type="text"
                    placeholder="Buscar por empleado, capacitación o lugar..."
                    value={busqueda}
                    onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                    }}
                    style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        outline: "none"
                    }}
                />

                <input
                    type="date"
                    value={fechaInicioFiltro}
                    onChange={(e) => {
                        setFechaInicioFiltro(e.target.value);
                        setPaginaActual(1);
                    }}
                    style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        outline: "none"
                    }}
                />

                <input
                    type="date"
                    value={fechaFinFiltro}
                    onChange={(e) => {
                        setFechaFinFiltro(e.target.value);
                        setPaginaActual(1);
                    }}
                    style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        outline: "none"
                    }}
                />

            </div>

            {loading ? (

                <p>Cargando...</p>

            ) : registros.length === 0 ? (

                <p>No hay informes registrados.</p>

            ) : (

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}
                >

                    {registrosPaginados.map((item) => (

                        <div
                            key={item.idinformecapacitacion}
                            onClick={() => abrirDetalle(item)}
                            style={{
                                background: "#fff",
                                borderRadius: "10px",
                                padding: "16px 18px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                borderLeft: "5px solid #023047",
                                cursor: "pointer",
                                transition: "0.2s"
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "10px"
                                }}
                            >

                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "17px",
                                            color: "#023047"
                                        }}
                                    >
                                        {item.nombreCapacitacion}
                                    </h3>

                                    <p
                                        style={{
                                            margin: "6px 0 0",
                                            color: "#555",
                                            fontSize: "14px"
                                        }}
                                    >
                                        {item.lugar}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        textAlign: "right",
                                        fontSize: "14px",
                                        color: "#444"
                                    }}
                                >
                                    <div>
                                        <strong>Inicio:</strong>{" "}
                                        {formatearFecha(item.fechaInicio)}
                                    </div>

                                    <div>
                                        <strong>Fin:</strong>{" "}
                                        {formatearFecha(item.fechaFin)}
                                    </div>
                                </div>

                            </div>

                            <div
                                style={{
                                    marginTop: "12px",
                                    paddingTop: "10px",
                                    borderTop: "1px solid #eee",
                                    fontSize: "14px",
                                    color: "#333"
                                }}
                            >
                                <strong>Informe realizado por:</strong>{" "}
                                {item.empleado}
                            </div>

                        </div>

                    ))}

                    {/* CONFIGURACIÓN + PAGINACIÓN */}
                    <div
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "20px",
                            flexWrap: "wrap",
                        }}
                    >

                        <div>
                            <label
                                style={{
                                    marginRight: "10px",
                                    fontWeight: "600"
                                }}
                            >
                                Mostrar:
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={elementosPorPagina}
                                onChange={(e) => {

                                    const val =
                                        e.target.value.replace(/\D/g, "");

                                    const n =
                                        val === "" ? "" : Number(val);

                                    setElementosPorPagina(
                                        n > 0 ? n : 1
                                    );

                                    setPaginaActual(1);
                                }}
                                style={{
                                    width: "80px",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    textAlign: "center"
                                }}
                            />
                        </div>

                        {/* PAGINACIÓN */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                flexWrap: "wrap",
                                justifyContent: "center"
                            }}
                        >
                            {Array.from(
                                { length: totalPaginas || 1 },
                                (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPaginaActual(i + 1)}
                                        style={{
                                            padding: "6px 12px",
                                            border: "1px solid #219ebc",
                                            background:
                                                paginaActual === i + 1
                                                    ? "#219ebc"
                                                    : "#fff",
                                            color:
                                                paginaActual === i + 1
                                                    ? "#fff"
                                                    : "#219ebc",
                                            borderRadius: "5px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            )}
                        </div>

                    </div>

                    <CapacitacionExternaModal
                        show={modalAbierto}
                        onClose={() => setModalAbierto(false)}
                        registro={registroSeleccionado}
                    />

                </div>

            )}

        </div>
    );
};

export default CapacitacionesExternas;