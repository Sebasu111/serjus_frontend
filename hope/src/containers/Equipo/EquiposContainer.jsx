import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { } from "react-toastify"; import { buttonStyles } from "../../stylesGenerales/buttons.js";

import EquipoFormNuevo from "./EquipoFormNuevo";
import EquiposTable from "./EquiposTable";

const API_BASE = process.env.REACT_APP_API_URL;
const toNum = v => (v === null || v === undefined || v === "" ? null : Number(v));
const token = sessionStorage.getItem("token");

// ---------- UI helpers para la vista de detalle ----------
const Section = ({ title, children }) => (
    <section style={{ marginBottom: 24 }}>
        <h4
            style={{
                margin: "0 0 12px 0",
                fontSize: 19,
                fontWeight: 800,
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: 6,
                color: "#0f172a",
                letterSpacing: 0.2
            }}
        >
            {title}
        </h4>
        {children}
    </section>
);

const Grid = ({ children }) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14
        }}
    >
        {children}
    </div>
);

const Item = ({ label, value, full }) => (
    <div
        style={{
            gridColumn: full ? "1 / -1" : "auto",
            background: "#f9fafb",
            border: "1px solid #eef2f7",
            borderRadius: 12,
            padding: 12
        }}
    >
        <div
            style={{
                fontSize: 12.5,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                color: "#6b7280",
                marginBottom: 6
            }}
        >
            {label}
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", lineHeight: 1.35 }}>{value || "â€”"}</div>
    </div>
);

// ---------- Component ----------
const EquiposContainer = () => {
    const [equipos, setEquipos] = useState([]); // crudo desde API
    const [empleados, setEmpleados] = useState([]); // crudo desde API

    // UI / formulario
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loadingMiembros, setLoadingMiembros] = useState(false);

    // campos form
    const [idEquipo, setIdEquipo] = useState("");
    const [idCoordinador, setIdCoordinador] = useState("");
    const [miembros, setMiembros] = useState([]);

    // originales (permitidos aunque estén ocupados)
    const [originalEquipo, setOriginalEquipo] = useState({ coord: null, miembros: [] });

    // buscar / paginación
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // cache de detalle (idEquipo -> [idEmpleado,...])
    const [miembrosCache, setMiembrosCache] = useState(() => new Map());

    // Detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState({
        idEquipo: null,
        nombreEquipo: "",
        coordinadorNombre: "",
        miembrosNombres: [],
        estado: true
    });

    // ====== Fetch inicial ======
    useEffect(() => {
        fetchEquipos();
        fetchEmpleados();
    }, []);

    const fetchEquipos = async () => {
        try {
            const res = await axios.get(`${API_BASE}/equipos/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const raw = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            const data = raw.map(e => {
                const id = e.idEquipo ?? e.idequipo ?? e.id;
                const coord = e.idCoordinador ?? e.idcoordinador ?? e.coordinadorId ?? null;
                // Si la API trae miembros, normalizamos; si no, lo rellenaremos desde empleados más abajo
                const posiblesListas =
                    e.miembros ?? e.integrantes ?? e.members ?? e.equipoMiembros ?? e.detalleMiembros ?? [];
                const miembrosNormalizados = Array.isArray(posiblesListas)
                    ? posiblesListas.map(x =>
                        Number(
                            typeof x === "object"
                                ? x.idEmpleado ?? x.idempleado ?? x.id ?? x.pk ?? x.uuid ?? x.codigo
                                : x
                        )
                    )
                    : [];
                return {
                    idEquipo: Number(id),
                    nombreEquipo: (e.nombreEquipo ?? e.nombreequipo ?? "") || "",
                    idCoordinador: coord == null ? null : Number(coord),
                    estado: e.estado !== false,
                    miembros: miembrosNormalizados // puede venir vacío
                };
            });
            setEquipos(data);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los equipos", "error");
        }
    };

    const fetchEmpleados = async () => {
        try {
            const res = await axios.get(`${API_BASE}/empleados/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data.results) ? res.data.results : [];
            const activos = data.filter(e => e.estado !== false);
            setEmpleados(activos);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los colaboradores", "error");
        }
    };

    // ====== Helpers de nombres/ids ======
    const empleadoDisplayName = emp => {
        const candidates = [
            emp?.nombreCompleto,
            [emp?.nombres, emp?.apellidos].filter(Boolean).join(" "),
            [emp?.nombre, emp?.apellido].filter(Boolean).join(" "),
            [emp?.primerNombre, emp?.segundoNombre, emp?.apellidoPaterno, emp?.apellidoMaterno]
                .filter(Boolean)
                .join(" "),
            [emp?.first_name, emp?.last_name].filter(Boolean).join(" "),
            emp?.full_name,
            emp?.displayName,
            emp?.nombre_empleado,
            emp?.name
        ]
            .map(s => (typeof s === "string" ? s.trim() : ""))
            .filter(Boolean);
        if (candidates[0]) return candidates[0];
        const id = emp?.idEmpleado ?? emp?.idempleado ?? emp?.id ?? emp?.pk ?? emp?.uuid ?? emp?.codigo ?? "?";
        return `Empleado #${id}`;
    };
    const empleadoId = emp => Number(emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo);

    const empleadosMap = useMemo(() => {
        const m = new Map();
        empleados.forEach(e => m.set(empleadoId(e), empleadoDisplayName(e)));
        return m;
    }, [empleados]);

    // ====== Derivar miembros desde empleados (para persistir tras refresh) ======
    const empleadoEquipoId = emp => {
        // detecta el id de equipo de un empleado en varias formas
        const raw =
            emp?.idEquipo ??
            emp?.idequipo ??
            emp?.equipoId ??
            emp?.equipo_id ??
            (typeof emp?.equipo === "object"
                ? emp?.equipo?.id ?? emp?.equipo?.idEquipo ?? emp?.equipo?.idequipo
                : emp?.equipo) ??
            null;
        return raw != null ? Number(raw) : null;
    };

    // Mapa: idEquipo -> [idEmpleado, ...] (excluyendo coordinadores)
    const miembrosPorEquipoMap = useMemo(() => {
        const m = new Map();

        // Crear un mapa de coordinadores por equipo
        const coordinadoresPorEquipo = new Map();
        (equipos || []).forEach(eq => {
            if (eq.idCoordinador != null) {
                coordinadoresPorEquipo.set(Number(eq.idEquipo), Number(eq.idCoordinador));
            }
        });

        empleados.forEach(emp => {
            const ideq = empleadoEquipoId(emp);
            const idem = empleadoId(emp);
            if (ideq != null && !Number.isNaN(ideq)) {
                // Verificar si este empleado es el coordinador del equipo
                const coordinadorDelEquipo = coordinadoresPorEquipo.get(ideq);

                // Solo agregar como miembro si NO es el coordinador
                if (idem !== coordinadorDelEquipo) {
                    if (!m.has(ideq)) m.set(ideq, []);
                    m.get(ideq).push(idem);
                }
            }
        });
        return m;
    }, [empleados, equipos]);

    // Equipos fusionados: si API no trae miembros, usamos los derivados desde empleados
    const equiposConMiembros = useMemo(() => {
        return (equipos || []).map(eq => {
            const listaApi = Array.isArray(eq.miembros) ? eq.miembros.filter(x => x != null) : [];
            const listaDerivada = miembrosPorEquipoMap.get(Number(eq.idEquipo)) || [];
            const miembrosFinal = listaApi.length ? listaApi : listaDerivada;
            return { ...eq, miembros: miembrosFinal };
        });
    }, [equipos, miembrosPorEquipoMap]);

    // ====== Ocupados globales (coordinadores o miembros) ======
    const ocupadosGlobal = useMemo(() => {
        const set = new Set();
        equiposConMiembros.forEach(eq => {
            if (eq.idCoordinador != null) set.add(Number(eq.idCoordinador));
            (eq.miembros || []).forEach(m => set.add(Number(m)));
        });
        return set;
    }, [equiposConMiembros]);

    // ====== fetchEquipoDetalle (solo /equipos/:id/ y fallback a derivados) ======
    const extractIdsFrom = obj => {
        if (!obj) return [];
        const candidates = [
            "miembros",
            "integrantes",
            "members",
            "empleados",
            "equipo_empleados",
            "equipoMiembros",
            "detalleMiembros"
        ];
        for (const key of candidates) {
            const v = obj[key];
            if (Array.isArray(v) && v.length) {
                return v.map(x =>
                    Number(
                        typeof x === "object" ? x.idEmpleado ?? x.idempleado ?? x.id ?? x.pk ?? x.uuid ?? x.codigo : x
                    )
                );
            }
        }
        const nested = obj.detalle || obj.data || obj.result || obj.payload;
        if (nested) return extractIdsFrom(nested);
        return [];
    };

    const fetchEquipoDetalle = async id => {
        try {
            const r1 = await axios.get(`${API_BASE}/equipos/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const idsApi = extractIdsFrom(r1.data);
            if (idsApi.length) return idsApi;
        } catch (e) {
            console.warn("GET /equipos/:id/ sin miembros, uso empleados derivados.");
        }
        // Fallback a los derivados desde empleados (persisten tras refresh)
        return miembrosPorEquipoMap.get(Number(id)) || [];
    };

    // ====== Reglas y handlers ======
    const coordinadoresOcupados = useMemo(
        () =>
            new Set(
                equiposConMiembros
                    .filter(e => e.idCoordinador != null && e.idEquipo !== editingId)
                    .map(e => e.idCoordinador)
            ),
        [equiposConMiembros, editingId]
    );

    //    NUEVA FUNCIÓN: Actualizar empleados para sincronizar con el equipo
    const actualizarEmpleadosDelEquipo = async (equipoId, coordinadorId, nuevosMiembros) => {
        try {

            // Obtener equipo anterior para saber qué empleados remover
            const equipoAnterior = equiposConMiembros.find(e => e.idEquipo === equipoId);
            const miembrosAnteriores = equipoAnterior?.miembros || [];
            const coordinadorAnterior = equipoAnterior?.idCoordinador;

            // 1. Limpiar empleados que ya no pertenecen al equipo
            const empleadosARemover = [];

            // Remover coordinador anterior si cambió
            if (coordinadorAnterior && coordinadorAnterior !== coordinadorId) {
                empleadosARemover.push(coordinadorAnterior);
            }

            // Remover miembros que ya no están seleccionados
            miembrosAnteriores.forEach(miembroId => {
                if (!nuevosMiembros.includes(Number(miembroId))) {
                    empleadosARemover.push(Number(miembroId));
                }
            });

            // Actualizar empleados que se removieron del equipo
            for (const empId of empleadosARemover) {
                const empleado = empleados.find(e => empleadoId(e) === empId);
                if (empleado) {
                    await axios.put(`${API_BASE}/empleados/${empId}/`, {
                        ...empleado,
                        idequipo: null, // Remover del equipo
                        idusuario: toNum(sessionStorage.getItem("idUsuario"))
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`   Empleado ${empId} removido del equipo`);
                }
            }

            // 2. Actualizar coordinador
            if (coordinadorId) {
                const coordinador = empleados.find(e => empleadoId(e) === Number(coordinadorId));
                if (coordinador) {
                    await axios.put(`${API_BASE}/empleados/${coordinadorId}/`, {
                        ...coordinador,
                        idequipo: equipoId,
                        idusuario: toNum(sessionStorage.getItem("idUsuario"))
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`   Coordinador ${coordinadorId} asignado al equipo ${equipoId}`);
                }
            }

            // 3. Actualizar miembros
            for (const miembroId of nuevosMiembros) {
                const miembro = empleados.find(e => empleadoId(e) === Number(miembroId));
                if (miembro) {
                    await axios.put(`${API_BASE}/empleados/${miembroId}/`, {
                        ...miembro,
                        idequipo: equipoId,
                        idusuario: toNum(sessionStorage.getItem("idUsuario"))
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`   Miembro ${miembroId} asignado al equipo ${equipoId}`);
                }
            }

            console.log("🎉 Sincronización de empleados completada");
        } catch (error) {
            console.error("  Error al actualizar empleados del equipo:", error);
            showToast("Equipo actualizado, pero hubo problemas al sincronizar algunos colaboradores", "warning");
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!idEquipo || !idCoordinador) return;

        if (coordinadoresOcupados.has(toNum(idCoordinador))) {
            showToast("Este colaborador ya es coordinador en otro equipo.", "error");
            return;
        }

        // No permitir miembros ocupados en otro equipo (salvo los del propio equipo original)
        const originalesSet = new Set(
            [Number(originalEquipo.coord), ...originalEquipo.miembros.map(Number)].filter(Boolean)
        );
        const ocupadosNoPropios = new Set([...ocupadosGlobal].filter(id => !originalesSet.has(Number(id))));

        const setUnique = Array.from(new Set(miembros.map(Number))).filter(id => id !== toNum(idCoordinador));
        if (setUnique.length !== miembros.length || miembros.includes(toNum(idCoordinador))) {
            showToast("Revisar duplicados / el coordinador no puede ir como miembro.", "error");
            return;
        }
        const conflicto = setUnique.find(id => ocupadosNoPropios.has(Number(id)));
        if (conflicto != null) {
            showToast("Uno o más miembros ya pertenecen a otro equipo.", "error");
            return;
        }

        const idUsuario = toNum(sessionStorage.getItem("idUsuario"));
        const equipoSel = equiposConMiembros.find(eq => eq.idEquipo === idEquipo);
        if (!equipoSel) {
            showToast("No se encontró el equipo seleccionado", "error");
            return;
        }

        // Asegurar que todos los campos sean del tipo correcto
        const nombreEquipoStr = Array.isArray(equipoSel.nombreEquipo)
            ? equipoSel.nombreEquipo[0]
            : String(equipoSel.nombreEquipo || "");

        const coordinadorId = toNum(idCoordinador);
        const miembrosArray = Array.isArray(setUnique) ? setUnique.map(Number) : [];

        try {
            const payload = {
                nombreequipo: nombreEquipoStr,
                idcoordinador: coordinadorId,
                miembros: miembrosArray,
                idusuario: idUsuario,
                estado: true
            };

            console.log("Payload enviado:", payload); // Para debug

            await axios.put(`${API_BASE}/equipos/${idEquipo}/`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            //    NUEVO: Actualizar empleados para sincronizar correctamente
            await actualizarEmpleadosDelEquipo(idEquipo, coordinadorId, miembrosArray);

            // Actualizamos cache local del equipo
            setMiembrosCache(prev => {
                const copy = new Map(prev);
                copy.set(idEquipo, setUnique);
                return copy;
            });

            // Refrescamos ambos para que el detalle persista tras recargar
            await Promise.all([fetchEquipos(), fetchEmpleados()]);

            showToast("Equipo actualizado correctamente");

            setIdEquipo("");
            setIdCoordinador("");
            setMiembros([]);
            setEditingId(null);
            setMostrarFormulario(false);
        } catch (error) {
            console.error("PUT /equipos error:", error.response?.data || error);
            const errorMsg = error.response?.data?.nombreequipo?.[0] ||
                error.response?.data?.detail ||
                "Error al actualizar el equipo";
            showToast(errorMsg, "error");
        }
    };

    const handleEdit = async equipo => {
        setIdEquipo(equipo.idEquipo);
        setIdCoordinador(equipo.idCoordinador ?? "");
        setEditingId(equipo.idEquipo);

        // Tomamos miembros del cache, o de la fusión equipos+empleados, o del detalle API
        const merged = equiposConMiembros.find(e => e.idEquipo === equipo.idEquipo);
        let miembrosActuales = miembrosCache.get(equipo.idEquipo) ?? (merged?.miembros || []) ?? [];

        if (!miembrosActuales.length) {
            setLoadingMiembros(true);
            try {
                miembrosActuales = await fetchEquipoDetalle(equipo.idEquipo);
            } finally {
                setLoadingMiembros(false);
            }
        }

        const unique = Array.from(new Set(miembrosActuales.map(Number))).filter(m => m !== toNum(equipo.idCoordinador));

        setMiembrosCache(prev => {
            const copy = new Map(prev);
            copy.set(equipo.idEquipo, unique);
            return copy;
        });

        setOriginalEquipo({ coord: toNum(equipo.idCoordinador), miembros: unique });
        setMiembros(unique);
        setMostrarFormulario(true);
    };

    const handleVerDetalle = async equipo => {
        try {
            console.log("🔍 Ver detalle de equipo:", equipo); // Debug

            // Intentar obtener miembros desde varias fuentes
            let ids = [];

            // 1. Desde cache si existe
            if (miembrosCache.has(equipo.idEquipo)) {
                ids = miembrosCache.get(equipo.idEquipo);
                console.log("📋 Miembros desde cache:", ids);
            }
            // 2. Desde equiposConMiembros (fusionado)
            else {
                const merged = equiposConMiembros.find(e => e.idEquipo === equipo.idEquipo);
                ids = merged?.miembros || [];
                console.log("🔄 Miembros desde equiposConMiembros:", ids);

                // 3. Si no hay miembros, intentar desde API
                if (!ids.length) {
                    try {
                        ids = (await fetchEquipoDetalle(equipo.idEquipo)) || [];
                        console.log("🌐 Miembros desde API:", ids);
                    } catch (apiError) {
                        console.warn("⚠️ No se pudieron cargar miembros desde API:", apiError);
                    }
                }

                // Actualizar cache con los miembros encontrados
                setMiembrosCache(prev => {
                    const copy = new Map(prev);
                    copy.set(equipo.idEquipo, ids);
                    return copy;
                });
            }

            // Convertir IDs a nombres, asegurar que sean números válidos
            const miembrosNombres = ids
                .map(Number)
                .filter(id => !isNaN(id) && id > 0)
                .map(id => {
                    const nombre = empleadosMap.get(id);
                    console.log(`👤 Empleado ID ${id} -> ${nombre || 'No encontrado'}`);
                    return nombre || `Empleado #${id}`;
                })
                .filter(Boolean);

            console.log("   Miembros nombres finales:", miembrosNombres);

            setDetalle({
                idEquipo: equipo.idEquipo,
                nombreEquipo: equipo.nombreEquipo || `Equipo #${equipo.idEquipo}`,
                coordinadorNombre: empleadosMap.get(equipo.idCoordinador) || "Sin coordinador asignado",
                miembrosNombres,
                estado: equipo.estado !== false
            });
            setMostrarDetalle(true);
        } catch (e) {
            console.error("  Error al cargar detalle del equipo:", e);
            showToast("No se pudo cargar el detalle del equipo", "error");
        }
    };

    // ====== Búsqueda y paginado (en equiposConMiembros) ======
    const equiposFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();
        const equiposOrdenados = [...equiposConMiembros]
            // Ordenar alfabéticamente por nombre (A-Z)
            .sort((a, b) => {
                const nombreA = (a.nombreEquipo || "").toLowerCase();
                const nombreB = (b.nombreEquipo || "").toLowerCase();
                return nombreA.localeCompare(nombreB);
            });

        if (!texto) return equiposOrdenados;
        return equiposOrdenados.filter(e => {
            const porNombre = (e.nombreEquipo || "").toLowerCase().includes(texto);
            const porCoord = (empleadosMap.get(e.idCoordinador) || "").toLowerCase().includes(texto);
            const porMiembros = (e.miembros || []).some(idMiembro =>
                (empleadosMap.get(Number(idMiembro)) || "").toLowerCase().includes(texto)
            );
            return porNombre || porCoord || porMiembros;
        });
    }, [equiposConMiembros, empleadosMap, busqueda]);

    const indexOfLast = paginaActual * (elementosPorPagina || 1);
    const indexOfFirst = indexOfLast - (elementosPorPagina || 1);
    const equiposPaginados = equiposFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(equiposFiltrados.length / (elementosPorPagina || 1));

    // set para el form (con los fusionados)
    const ocupadosSet = ocupadosGlobal;

    return (
        <Layout>
            <SEO title="Equipos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <div style={{ width: "min(1100px, 96vw)" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Equipos Registrados</h2>

                            {/* Solo buscador - sin botón nuevo equipo */}
                            <div
                                style={{
                                    marginBottom: "15px"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar equipo..."
                                    value={busqueda}
                                    onChange={e => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "2px solid #e5e7eb",
                                        fontSize: "16px",
                                        transition: "border-color 0.2s, box-shadow 0.2s",
                                        outline: "none"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#219ebc";
                                        e.target.style.boxShadow = "0 0 0 3px rgba(33, 158, 188, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = "#e5e7eb";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                            </div>

                            <EquiposTable
                                equipos={equiposPaginados}
                                empleadosMap={empleadosMap}
                                handleEdit={handleEdit}
                                onVerDetalle={handleVerDetalle}
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <label style={{ marginRight: "10px", fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={e => {
                                        const numero = Number((e.target.value || "1").replace(/\D/g, "")) || 1;
                                        setElementosPorPagina(numero);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={e => e.target.select()}
                                    style={{
                                        width: 80,
                                        padding: 10,
                                        borderRadius: 8,
                                        border: "1px solid #ccc",
                                        textAlign: "center"
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {mostrarFormulario && (
                    <EquipoFormNuevo
                        equipos={equiposConMiembros}
                        idEquipo={idEquipo}
                        setIdEquipo={setIdEquipo}
                        idCoordinador={idCoordinador}
                        setIdCoordinador={setIdCoordinador}
                        empleados={empleados}
                        miembros={miembros}
                        setMiembros={setMiembros}
                        editingId={editingId}
                        handleSubmit={handleSubmit}
                        onClose={() => setMostrarFormulario(false)}
                        ocupadosSet={ocupadosSet}
                        originales={{ coord: originalEquipo.coord, miembros: originalEquipo.miembros }}
                    />
                )}                {/* === DETALLE estilizado === */}
                {mostrarDetalle && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 4000
                        }}
                    >
                        <div
                            style={{
                                width: "min(980px,96vw)",
                                maxHeight: "92vh",
                                overflow: "auto",
                                background: "#fff",
                                boxShadow: "0 10px 40px rgba(0,0,0,.25)",
                                padding: 28,
                                paddingRight: 43,
                                borderRadius: 16,
                                position: "relative"
                            }}
                        >
                            <div
                                style={{
                                    position: "sticky",
                                    top: 8,
                                    zIndex: 5,
                                    width: "100%",
                                    height: 0,
                                    pointerEvents: "none",
                                    overflow: "visible"
                                }}
                            >
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    aria-label="Cerrar"
                                    title="Cerrar"
                                    style={{
                                        position: "absolute",
                                        right: -40,
                                        pointerEvents: "auto",
                                        width: 36,
                                        height: 36,
                                        borderRadius: "999px",
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        cursor: "pointer",
                                        fontSize: 18,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#0f172a",
                                        transition: "background .15s, transform .05s",
                                        outline: "none",
                                        boxShadow: "0 1px 6px rgba(0,0,0,.06)"
                                    }}
                                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <h3 style={{ margin: 0, fontSize: 28, letterSpacing: 0.2 }}>Detalle del Equipo</h3>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    margin: "6px 0 10px 0"
                                }}
                            >
                                <div style={{ fontSize: 22, fontWeight: 700 }}>{detalle.nombreEquipo}</div>
                                <span
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 999,
                                        background: detalle.estado ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)",
                                        color: detalle.estado ? "#065f46" : "#7f1d1d",
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}
                                >
                                    {detalle.estado ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <div style={{ display: "grid", gap: 22 }}>
                                <Section title="Coordinador">
                                    <Grid>
                                        <div
                                            style={{
                                                background: "#f9fafb",
                                                border: "1px solid #eef2f7",
                                                borderRadius: 12,
                                                padding: 12
                                            }}
                                        >
                                            <div style={{ fontSize: 16, fontWeight: 600, color: "#1f2937" }}>
                                                {detalle.coordinadorNombre || "—"}
                                            </div>
                                        </div>
                                    </Grid>
                                </Section>

                                <Section title="Miembros">
                                    {detalle.miembrosNombres.length === 0 ? (
                                        <div
                                            style={{
                                                background: "#f9fafb",
                                                border: "1px dashed #e5e7eb",
                                                borderRadius: 12,
                                                padding: 14,
                                                color: "#6b7280"
                                            }}
                                        >
                                            Sin miembros asignados.
                                        </div>
                                    ) : (
                                        <Grid>
                                            {detalle.miembrosNombres.map((n, i) => (
                                                <Item key={i} label={`Miembro ${i + 1}`} value={n} />
                                            ))}
                                        </Grid>
                                    )}
                                </Section>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default EquiposContainer;

