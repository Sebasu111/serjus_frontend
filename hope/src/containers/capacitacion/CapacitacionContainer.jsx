import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { buttonStyles } from "../../stylesGenerales/buttons.js";
import CapacitacionForm from "./CapacitacionForm";
import CapacitacionesTable from "./CapacitacionTable.jsx";
import AsignarCapacitacion from "./AsignarCapacitacion.jsx";
import ConfirmModal from "./ConfirmModal";
import TopTabs from "../../components/Toptabs/TopTabs.jsx";
import "./Capacitacioncontainer.css";
import CapacitacionesExternas from "./CapacitacionesExternas";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const CapacitacionContainer = () => {
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [capacitacionActivaEditando, setCapacitacionActivaEditando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mostrarAsignacion, setMostrarAsignacion] = useState(false);
    const [modalAccion, setModalAccion] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);
    const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);
    const [capacitacionSeleccionada, setCapacitacionSeleccionada] = useState(null);
    const [vistaActiva, setVistaActiva] = useState("registradas");

    const [formData, setFormData] = useState({
        nombreEvento: "",
        lugar: "",
        fechaInicio: "",
        fechaFin: "",
        institucion: "",
        monto: "",
        observacion: "",
    });

    useEffect(() => {
        fetchCapacitaciones();
    }, []);

    useEffect(() => {
        setPaginaActual(1);
    }, [mostrarFinalizadas]);

    const fetchCapacitaciones = async () => {
        try {

            const usuarioActual = JSON.parse(
                sessionStorage.getItem("usuario")
            );

            const [
                resCapacitaciones,
                resEquipos,
                resEmpleados,
                resAsignaciones
            ] = await Promise.all([

                axios.get(`${API}/capacitaciones/`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),

                axios.get(`${API}/equipos/`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),

                axios.get(`${API}/empleados/`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),

                axios.get(`${API}/empleadocapacitacion/`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const capacitacionesData = Array.isArray(resCapacitaciones.data)
                ? resCapacitaciones.data
                : Array.isArray(resCapacitaciones.data.results)
                    ? resCapacitaciones.data.results
                    : [];

            const equiposData = Array.isArray(resEquipos.data)
                ? resEquipos.data
                : resEquipos.data.results || [];

            const empleadosData = Array.isArray(resEmpleados.data)
                ? resEmpleados.data
                : resEmpleados.data.results || [];

            const asignacionesData = Array.isArray(resAsignaciones.data)
                ? resAsignaciones.data
                : resAsignaciones.data.results || [];

            await verificarCapacitacionesFinalizadas(
                capacitacionesData
            );

            let capacitacionesFiltradas =
                capacitacionesData;

            // 🔥 SOLO PARA COORDINADORES
            if (
                usuarioActual &&
                Number(usuarioActual.idrol) === 1
            ) {

                // buscar equipo del coordinador
                const miEquipo = equiposData.find(
                    (eq) =>
                        Number(eq.idcoordinador) ===
                        Number(usuarioActual.idempleado)
                );

                if (miEquipo) {

                    // ids empleados del equipo
                    const idsEquipo = empleadosData
                        .filter(
                            (emp) =>
                                Number(emp.idequipo) ===
                                Number(miEquipo.idequipo)
                        )
                        .map((emp) =>
                            Number(emp.idempleado)
                        );

                    // agregar coordinador
                    idsEquipo.push(
                        Number(usuarioActual.idempleado)
                    );

                    const hoy = new Date();

                    // ids capacitaciones donde participa el equipo
                    const idsCapacitacionesPermitidas =
                        asignacionesData
                            .filter(
                                (asig) =>
                                    asig.estado === true &&
                                    idsEquipo.includes(
                                        Number(asig.idempleado)
                                    )
                            )
                            .map((asig) =>
                                Number(asig.idcapacitacion)
                            );

                    capacitacionesFiltradas =
                        capacitacionesData.filter((cap) => {

                            const idCap =
                                Number(
                                    cap.idcapacitacion || cap.id
                                );

                            const fechaInicio =
                                new Date(cap.fechainicio);

                            const fechaFin =
                                new Date(cap.fechafin);

                            // 🔥 SOLO EN CURSO
                            const enCurso =
                                cap.estado === true &&
                                fechaInicio <= hoy &&
                                hoy <= fechaFin;

                            // 🔥 SOLO SI PARTICIPA SU EQUIPO
                            const perteneceEquipo =
                                idsCapacitacionesPermitidas.includes(
                                    idCap
                                );

                            return (
                                enCurso &&
                                perteneceEquipo
                            );
                        });
                } else {

                    // si no tiene equipo -> vacío
                    capacitacionesFiltradas = [];
                }
            }

            setCapacitaciones(
                capacitacionesFiltradas
            );

        } catch (error) {
            console.error(error);
            showToast(
                "Error al cargar capacitaciones",
                "error"
            );
        }
    };

    const verificarCapacitacionesFinalizadas = async (capacitaciones) => {
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        const capacitacionesAFinalizar = capacitaciones.filter((cap) => {
            if (!cap.estado) return false;
            const fechaFin = new Date(cap.fechafin);
            return fechaFin < hoy;
        });

        for (const cap of capacitacionesAFinalizar) {
            try {
                const idUsuario = Number(sessionStorage.getItem("idUsuario"));
                await axios.put(
                    `${API}/capacitaciones/${cap.idcapacitacion || cap.id}/`,
                    { ...cap, estado: true, idestado_id: 3, idusuario: idUsuario },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error(
                    `Error al finalizar automáticamente la capacitación ${cap.nombreevento}:`,
                    error
                );
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.nombreEvento.trim())
            return showToast("El nombre del evento es obligatorio", "warning");
        if (!formData.lugar.trim())
            return showToast("El lugar es obligatorio", "warning");
        if (!formData.fechaInicio)
            return showToast("La fecha de inicio es obligatoria", "warning");
        if (!formData.fechaFin)
            return showToast("La fecha de fin es obligatoria", "warning");
        if (new Date(formData.fechaInicio) > new Date(formData.fechaFin))
            return showToast(
                "La fecha de fin no puede ser menor a la fecha de inicio",
                "warning"
            );

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaInicio = new Date(formData.fechaInicio);

        if (fechaInicio < hoy)
            return showToast(
                "No se pueden programar capacitaciones en fechas pasadas",
                "warning"
            );

        if (!formData.institucion.trim())
            return showToast("La institución facilitadora es obligatoria", "warning");
        if (isNaN(formData.monto) || Number(formData.monto) <= 0)
            return showToast("El monto debe ser mayor a 0", "warning");

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            const payload = {
                nombreevento: formData.nombreEvento,
                lugar: formData.lugar,
                fechainicio: formData.fechaInicio,
                fechafin: formData.fechaFin,
                institucionfacilitadora: formData.institucion,
                montoejecutado: formData.monto,
                observacion: formData.observacion,
                estado: Boolean(capacitacionActivaEditando),
                idestado_id: Boolean(capacitacionActivaEditando) ? 1 : 2,
                idusuario: idUsuario,
            };

            if (editingId) {
                await axios.put(`${API}/capacitaciones/${editingId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToast("Capacitación actualizada correctamente", "success");
            } else {
                await axios.post(`${API}/capacitaciones/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showToast("Capacitación registrada correctamente", "success");
            }

            setFormData({
                nombreEvento: "",
                lugar: "",
                fechaInicio: "",
                fechaFin: "",
                institucion: "",
                monto: "",
                observacion: "",
            });
            setEditingId(null);
            setCapacitacionActivaEditando(true);
            setMostrarFormulario(false);
            fetchCapacitaciones();
        } catch (error) {
            const apiErr = error.response?.data;
            const detalle =
                (apiErr && (apiErr.detail || JSON.stringify(apiErr))) || "desconocido";
            console.error("POST/PUT /capacitaciones error:", apiErr || error);
            showToast(`Error al guardar capacitación: ${detalle}`, "error");
        }
    };

    const handleEdit = (cap) => {
        if (!cap.estado)
            return showToast("No se puede editar una capacitación inactiva", "warning");

        const hoy = new Date();
        const fechaInicio = new Date(cap.fechainicio);
        const fechaFin = new Date(cap.fechafin);

        if (fechaFin < hoy)
            return showToast("No se puede editar una capacitación que ya finalizó", "warning");
        if (fechaInicio <= hoy && hoy <= fechaFin)
            return showToast("No se puede editar una capacitación que está en proceso", "warning");

        setFormData({
            nombreEvento: cap.nombreevento,
            lugar: cap.lugar,
            fechaInicio: cap.fechainicio,
            fechaFin: cap.fechafin,
            institucion: cap.institucionfacilitadora,
            monto: cap.montoejecutado,
            observacion: cap.observacion || "",
        });
        setEditingId(cap.idcapacitacion || cap.id);
        setCapacitacionActivaEditando(cap.estado);
        setMostrarFormulario(true);
    };

    const handleToggleEstado = (cap, tipo) => {
        setModalAccion({ tipo, data: cap });
    };

    const handleAsignarCapacitacion = (capacitacion) => {
        setCapacitacionSeleccionada(capacitacion);
        setMostrarAsignacion(true);
    };

    const confirmarAccion = async () => {
        if (!modalAccion?.data) return;
        const { tipo, data } = modalAccion;

        if (tipo === "desactivar") {
            try {
                const res = await axios.get(
                    `${API}/empleadocapacitacion/?capacitacion=` + (data.idcapacitacion || data.id),
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const asignados = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.results)
                        ? res.data.results
                        : [];
                const asignadosActivos = asignados.filter(
                    (a) =>
                        a.estado === true &&
                        Number(a.idcapacitacion) === Number(data.idcapacitacion || data.id)
                );
                const idUsuario = Number(sessionStorage.getItem("idUsuario"));

                for (const asignacion of asignadosActivos) {
                    const idAsignacion = asignacion.idempleadocapacitacion || asignacion.id;
                    if (idAsignacion) {
                        await axios.put(
                            `${API}/empleadocapacitacion/${idAsignacion}/`,
                            { ...asignacion, estado: false, idusuario: idUsuario },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                    }
                }
            } catch (error) {
                showToast("Error al desactivar Trabajadores/as asignados", "error");
                setModalAccion(null);
                return;
            }
        }

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            let nuevoEstado, nuevoEstadoId;

            switch (tipo) {
                case "activar":
                    nuevoEstado = true;
                    nuevoEstadoId = 1;
                    break;
                case "desactivar":
                    nuevoEstado = false;
                    nuevoEstadoId = 2;
                    break;
                default:
                    return;
            }

            await axios.put(
                `${API}/capacitaciones/${data.idcapacitacion || data.id}/`,
                { ...data, estado: nuevoEstado, idestado_id: nuevoEstadoId, idusuario: idUsuario },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const mensaje = tipo === "activar" ? "activada" : "desactivada";
            showToast(`Capacitación ${mensaje} correctamente`, "success");
            fetchCapacitaciones();
        } catch (error) {
            console.error(error);
            const accion = tipo === "activar" ? "activar" : "desactivar";
            showToast(`Error al ${accion} la capacitación`, "error");
        } finally {
            setModalAccion(null);
        }
    };

    const handleCloseFormulario = () => {
        setMostrarFormulario(false);
        setFormData({
            nombreEvento: "",
            lugar: "",
            fechaInicio: "",
            fechaFin: "",
            institucion: "",
            monto: "",
        });
        setEditingId(null);
        setCapacitacionActivaEditando(true);
    };

    const determinarEstadoCapacitacion = (capacitacion) => {
        const hoy = new Date();
        const fechaInicio = new Date(capacitacion.fechainicio);
        const fechaFin = new Date(capacitacion.fechafin);

        return {
            esInactivo: !capacitacion.estado,
            esFinalizado: capacitacion.estado && fechaFin < hoy,
            enProceso: capacitacion.estado && fechaInicio <= hoy && hoy <= fechaFin,
            esActivo: capacitacion.estado && fechaInicio > hoy,
            hoy,
            fechaInicio,
            fechaFin,
        };
    };

    const capacitacionesFiltradas = capacitaciones
        .sort((a, b) => {
            const idA = a.idcapacitacion || a.id || 0;
            const idB = b.idcapacitacion || b.id || 0;
            return idB - idA;
        })
        .filter((c) => {
            const textoBusqueda = busqueda.toLowerCase().trim();
            if (!c.estado && !textoBusqueda) return false;
            return true;
        })
        .filter((c) => {
            const { esFinalizado } = determinarEstadoCapacitacion(c);
            const textoBusqueda = busqueda.toLowerCase().trim();

            if (mostrarFinalizadas) {
                if (!esFinalizado) return false;
            } else {
                if (esFinalizado) return false;
            }

            if (!textoBusqueda) return c.estado === true;

            if (/^ac(t(i(v(o)?)?)?)?$/.test(textoBusqueda)) return c.estado === true;
            if (/^in(a(c(t(i(v(o)?)?)?)?)?)?$/.test(textoBusqueda)) return c.estado === false;

            const formatFecha = (dateStr) => {
                if (!dateStr) return "";
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = String(date.getFullYear()).slice(-2);
                return `${day}-${month}-${year}`;
            };

            const fechaInicio = formatFecha(c.fechainicio);
            const fechaFin = formatFecha(c.fechafin);
            const montoStr = String(c.montoejecutado || "").toLowerCase();
            const estadoStr = c.estado ? "activo" : "inactivo";

            return (
                c.nombreevento?.toLowerCase().includes(textoBusqueda) ||
                c.lugar?.toLowerCase().includes(textoBusqueda) ||
                c.institucionfacilitadora?.toLowerCase().includes(textoBusqueda) ||
                fechaInicio.includes(textoBusqueda) ||
                fechaFin.includes(textoBusqueda) ||
                montoStr.includes(textoBusqueda) ||
                estadoStr.includes(textoBusqueda)
            );
        });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const capacitacionesPaginadas = capacitacionesFiltradas.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(capacitacionesFiltradas.length / elementosPorPagina);

    return (
        <Layout>
            <SEO title="Capacitaciones" />

            {/* Wrapper principal */}
            <div className="wrapper capacitacion-container__wrapper">

                {/* Columna de contenido */}
                <div className="capacitacion-container__inner">
                    <Header />

                    <main className="main-content site-wrapper-reveal capacitacion-container__main">
                        <div className="capacitacion-container__content">

                            {/* Tabs de navegación */}
                            <TopTabs
                                active={vistaActiva}
                                onChange={setVistaActiva}
                                options={[
                                    { label: "Capacitaciones Registradas", value: "registradas" },
                                    { label: "Capacitaciones con Informe Externo", value: "externas" },
                                ]}
                            />

                            {/* ===================== VISTA: CAPACITACIONES REGISTRADAS ===================== */}
                            {vistaActiva === "registradas" && (
                                <>
                                    <h2 className="capacitacion-container__title">
                                        Capacitaciones Registradas
                                    </h2>

                                    {/* Buscador + botón nueva capacitación */}
                                    <div className="capacitacion-container__toolbar">
                                        <input
                                            type="text"
                                            placeholder="Buscar capacitación..."
                                            value={busqueda}
                                            onChange={(e) => {
                                                setBusqueda(e.target.value);
                                                setPaginaActual(1);
                                            }}
                                            style={buttonStyles.buscador}
                                        />

                                        <button
                                            onClick={() => setMostrarFormulario(true)}
                                            style={buttonStyles.nuevo}
                                        >
                                            Nueva Capacitación
                                        </button>
                                    </div>

                                    {/* Tabla */}
                                    <CapacitacionesTable
                                        capacitaciones={capacitacionesPaginadas}
                                        handleEdit={handleEdit}
                                        handleDelete={(cap) => handleToggleEstado(cap, "desactivar")}
                                        handleActivate={(id) => {
                                            const cap = capacitaciones.find(
                                                (c) => (c.idcapacitacion || c.id) === id
                                            );
                                            handleToggleEstado(cap, "activar");
                                        }}
                                        handleAsignarCapacitacion={handleAsignarCapacitacion}
                                        mostrarFinalizadas={mostrarFinalizadas}
                                        paginaActual={paginaActual}
                                        totalPaginas={totalPaginas}
                                        setPaginaActual={setPaginaActual}
                                    />

                                    {/* Controles inferiores */}
                                    <div className="capacitacion-container__controls">
                                        <label className="capacitacion-container__controls-label">
                                            Mostrar:
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={elementosPorPagina}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                const numero = val === "" ? "" : Number(val);

                                                setElementosPorPagina(numero > 0 ? numero : 1);
                                                setPaginaActual(1);
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            className="capacitacion-container__per-page-input"
                                        />

                                        <div className="capacitacion-container__finalizadas">
                                            <input
                                                type="checkbox"
                                                id="mostrarFinalizadas"
                                                checked={mostrarFinalizadas}
                                                onChange={(e) => {
                                                    setMostrarFinalizadas(e.target.checked);
                                                    setPaginaActual(1);
                                                }}
                                                className="capacitacion-container__finalizadas-checkbox"
                                            />

                                            <label
                                                htmlFor="mostrarFinalizadas"
                                                className={`capacitacion-container__finalizadas-label capacitacion-container__finalizadas-label--${mostrarFinalizadas ? "active" : "inactive"
                                                    }`}
                                            >
                                                Mostrar capacitaciones finalizadas
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ===================== VISTA: CAPACITACIONES EXTERNAS ===================== */}
                            {vistaActiva === "externas" && (
                                <CapacitacionesExternas />
                            )}

                        </div>
                    </main>

                    <Footer />
                    <ScrollToTop />
                </div>

                {/* Panel: Formulario de creación / edición */}
                {mostrarFormulario && (
                    <CapacitacionForm
                        formData={formData}
                        setFormData={setFormData}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        capacitacionActivaEditando={capacitacionActivaEditando}
                        setMostrarFormulario={setMostrarFormulario}
                        handleSubmit={handleSubmit}
                        onClose={handleCloseFormulario}
                    />
                )}

                {/* Panel: Asignación de trabajadores */}
                {mostrarAsignacion && (
                    <AsignarCapacitacion
                        capacitacionInicial={capacitacionSeleccionada}
                        onClose={() => {
                            setMostrarAsignacion(false);
                            setCapacitacionSeleccionada(null);
                            fetchCapacitaciones();
                        }}
                    />
                )}

                {/* Modal: Confirmar activar / desactivar */}
                {modalAccion && (
                    <ConfirmModal
                        title={modalAccion.tipo === "activar" ? "Activar Capacitación" : "Desactivar Capacitación"}
                        message={`¿Está seguro de ${modalAccion.tipo === "activar" ? "activar" : "desactivar"
                            } la capacitación "${modalAccion.data?.nombreevento}"?`}
                        onConfirm={confirmarAccion}
                        onCancel={() => setModalAccion(null)}
                        actionType={modalAccion.tipo}
                    />
                )}

            </div>
        </Layout>
    );
};

export default CapacitacionContainer;