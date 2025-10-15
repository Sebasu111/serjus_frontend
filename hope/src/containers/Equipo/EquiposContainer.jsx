import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { ToastContainer } from "react-toastify";

import EquipoForm from "./EquipoForm";
import EquiposTable from "./EquiposTable";

const API_BASE = "http://127.0.0.1:8000/api";

const toNum = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

const EquiposContainer = () => {
    const [equipos, setEquipos] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    // UI / formulario
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loadingMiembros, setLoadingMiembros] = useState(false);

    // campos form
    const [idEquipo, setIdEquipo] = useState("");
    const [idCoordinador, setIdCoordinador] = useState("");
    const [miembros, setMiembros] = useState([]);

    // buscar / paginación
    const [busqueda, setBusqueda] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [elementosPorPagina, setElementosPorPagina] = useState(5);

    // >>> Cache local: idEquipo -> [idMiembro,...]
    const [miembrosCache, setMiembrosCache] = useState(() => new Map());

    // Detalle
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [detalle, setDetalle] = useState({
        idEquipo: null,
        nombreEquipo: "",
        coordinadorNombre: "",
        miembrosNombres: [],
        estado: true,
    });

    useEffect(() => {
        fetchEquipos();
        fetchEmpleados();
    }, []);

    const fetchEquipos = async () => {
        try {
            const res = await axios.get(`${API_BASE}/equipos/`);
            const raw = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            const data = raw.map((e) => {
                const id = e.idEquipo ?? e.idequipo ?? e.id;
                const coord = e.idCoordinador ?? e.idcoordinador ?? e.coordinadorId ?? null;

                const posiblesListas =
                    e.miembros ??
                    e.integrantes ??
                    e.members ??
                    e.equipoMiembros ??
                    e.detalleMiembros ??
                    [];

                const miembrosNormalizados = Array.isArray(posiblesListas)
                    ? posiblesListas.map((x) =>
                        Number(
                            typeof x === "object"
                                ? (x.idEmpleado ?? x.idempleado ?? x.id ?? x.pk ?? x.uuid ?? x.codigo)
                                : x
                        )
                    )
                    : [];

                return {
                    idEquipo: id,
                    nombreEquipo: (e.nombreEquipo ?? e.nombreequipo ?? "") || "",
                    idCoordinador: coord == null ? null : Number(coord),
                    estado: e.estado !== false,
                    miembros: miembrosNormalizados,
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
            const res = await axios.get(`${API_BASE}/empleados/`);
            const data = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.results)
                    ? res.data.results
                    : [];
            const activos = data.filter((e) => e.estado !== false);
            setEmpleados(activos);
        } catch (error) {
            console.error(error);
            showToast("Error al cargar los empleados", "error");
        }
    };

    // helpers
    const empleadoDisplayName = (emp) => {
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
            emp?.name,
        ]
            .map((s) => (typeof s === "string" ? s.trim() : ""))
            .filter(Boolean);
        if (candidates[0]) return candidates[0];
        const id =
            emp?.idEmpleado ?? emp?.idempleado ?? emp?.id ?? emp?.pk ?? emp?.uuid ?? emp?.codigo ?? "?";
        return `Empleado #${id}`;
    };
    const empleadoId = (emp) =>
        emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;

    const empleadosMap = useMemo(() => {
        const m = new Map();
        empleados.forEach((e) => m.set(Number(empleadoId(e)), empleadoDisplayName(e)));
        return m;
    }, [empleados]);

    // ==== helpers para detalle ====
    const extractIdsFrom = (obj) => {
        if (!obj) return [];
        const candidates = [
            "miembros",
            "integrantes",
            "members",
            "empleados",
            "equipo_empleados",
            "equipoMiembros",
            "detalleMiembros",
        ];
        for (const key of candidates) {
            const v = obj[key];
            if (Array.isArray(v) && v.length) {
                return v.map((x) =>
                    Number(
                        typeof x === "object"
                            ? (x.idEmpleado ?? x.idempleado ?? x.id ?? x.pk ?? x.uuid ?? x.codigo)
                            : x
                    )
                );
            }
        }
        const nested = obj.detalle || obj.data || obj.result || obj.payload;
        if (nested) return extractIdsFrom(nested);
        return [];
    };

    const fetchEquipoDetalle = async (id) => {
        try {
            const r1 = await axios.get(`${API_BASE}/equipos/${id}/`);
            const ids = extractIdsFrom(r1.data);
            if (ids.length) return ids;
        } catch { }
        try {
            const r2 = await axios.get(`${API_BASE}/equipos/${id}/miembros/`);
            const ids = extractIdsFrom({ miembros: r2.data });
            if (ids.length) return ids;
        } catch { }
        try {
            const r3 = await axios.get(`${API_BASE}/miembros`, { params: { equipo: id } });
            const ids = extractIdsFrom({ miembros: r3.data });
            if (ids.length) return ids;
        } catch { }
        return [];
    };

    // reglas de negocio (coordinador único, sin duplicados, máx. 6)
    const coordinadoresOcupados = useMemo(
        () =>
            new Set(
                equipos
                    .filter((e) => e.idCoordinador != null && e.idEquipo !== editingId)
                    .map((e) => e.idCoordinador)
            ),
        [equipos, editingId]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!idEquipo || !idCoordinador) return;

        if (coordinadoresOcupados.has(toNum(idCoordinador))) {
            showToast("Este empleado ya es coordinador en otro equipo.", "error");
            return;
        }

        const setUnique = Array.from(new Set(miembros.map(Number))).filter(
            (id) => id !== toNum(idCoordinador)
        );
        if (setUnique.length !== miembros.length || miembros.includes(toNum(idCoordinador))) {
            showToast("Revisar duplicados / el coordinador no puede ir como miembro.", "error");
            return;
        }
        if (setUnique.length > 6) {
            showToast("Máximo 6 acompañantes.", "error");
            return;
        }

        const idUsuario = toNum(sessionStorage.getItem("idUsuario"));
        const equipoSel = equipos.find((eq) => eq.idEquipo === idEquipo);
        if (!equipoSel) {
            showToast("No se encontró el equipo seleccionado", "error");
            return;
        }

        try {
            const payload = {
                nombreequipo: equipoSel.nombreEquipo ?? "",
                idcoordinador: toNum(idCoordinador),
                miembros: setUnique,
                idusuario: idUsuario,
                validadoEn: new Date().toISOString(),
            };

            await axios.put(`${API_BASE}/equipos/${idEquipo}/`, payload);

            setMiembrosCache((prev) => {
                const copy = new Map(prev);
                copy.set(idEquipo, setUnique);
                return copy;
            });

            try {
                const again = await fetchEquipoDetalle(idEquipo);
                if (again.length) {
                    setMiembrosCache((prev) => {
                        const copy = new Map(prev);
                        copy.set(idEquipo, again);
                        return copy;
                    });
                }
            } catch { }

            showToast("Integrantes asignados/actualizados correctamente");

            setIdEquipo("");
            setIdCoordinador("");
            setMiembros([]);
            setEditingId(null);
            setMostrarFormulario(false);
            fetchEquipos();
        } catch (error) {
            console.error("PUT /equipos error:", error.response?.data || error);
            showToast("Error al asignar integrantes", "error");
        }
    };

    // === EDITAR: usa cache primero; si no hay, trae detalle y luego abre modal ===
    const handleEdit = async (equipo) => {
        setIdEquipo(equipo.idEquipo);
        setIdCoordinador(equipo.idCoordinador ?? "");
        setEditingId(equipo.idEquipo);

        const cached = miembrosCache.get(equipo.idEquipo);
        if (Array.isArray(cached) && cached.length) {
            const unique = Array.from(new Set(cached.map(Number))).filter(
                (m) => m !== toNum(equipo.idCoordinador)
            );
            setMiembros(unique);
            setMostrarFormulario(true);
            return;
        }

        setLoadingMiembros(true);
        let miembrosActuales = Array.isArray(equipo.miembros) ? equipo.miembros.map(Number) : [];
        try {
            if (!miembrosActuales.length) {
                miembrosActuales = await fetchEquipoDetalle(equipo.idEquipo);
            }
        } catch { }
        const unique = Array.from(new Set(miembrosActuales.map(Number))).filter(
            (m) => m !== toNum(equipo.idCoordinador)
        );

        setMiembrosCache((prev) => {
            const copy = new Map(prev);
            copy.set(equipo.idEquipo, unique);
            return copy;
        });

        setMiembros(unique);
        setLoadingMiembros(false);
        setMostrarFormulario(true);
    };

    // === VER DETALLE (modal de solo lectura) ===
    const handleVerDetalle = async (equipo) => {
        try {
            const ids =
                miembrosCache.get(equipo.idEquipo) ??
                (await fetchEquipoDetalle(equipo.idEquipo)) ??
                [];
            if (!miembrosCache.has(equipo.idEquipo)) {
                setMiembrosCache((prev) => {
                    const copy = new Map(prev);
                    copy.set(equipo.idEquipo, ids);
                    return copy;
                });
            }
            const miembrosNombres = ids
                .map((id) => empleadosMap.get(Number(id)) || `Empleado #${id}`)
                .filter(Boolean);

            setDetalle({
                idEquipo: equipo.idEquipo,
                nombreEquipo: equipo.nombreEquipo || `Equipo #${equipo.idEquipo}`,
                coordinadorNombre:
                    empleadosMap.get(equipo.idCoordinador) || `#${equipo.idCoordinador ?? ""}`,
                miembrosNombres,
                estado: equipo.estado !== false,
            });
            setMostrarDetalle(true);
        } catch (e) {
            console.error(e);
            showToast("No se pudo cargar el detalle del equipo", "error");
        }
    };

    // búsqueda / paginado (SOLO EQUIPO y COORDINADOR)
    const equiposFiltrados = equipos.filter((e) => {
        const texto = busqueda.toLowerCase().trim();
        if (!texto) return true;
        const porNombre = (e.nombreEquipo || "").toLowerCase().includes(texto);
        const porCoord = (empleadosMap.get(e.idCoordinador) || "").toLowerCase().includes(texto);
        return porNombre || porCoord;
    });

    const indexOfLast = paginaActual * elementosPorPagina;
    const indexOfFirst = indexOfLast - elementosPorPagina;
    const equiposPaginados = equiposFiltrados.slice(indexOfFirst, indexOfLast);
    const totalPaginas = Math.ceil(equiposFiltrados.length / (elementosPorPagina || 1));

    return (
        <Layout>
            <SEO title="Equipos" />
            <div style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
                        <div style={{ maxWidth: "1000px", margin: "0 auto", paddingLeft: "250px" }}>
                            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Equipos Registrados</h2>

                            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por equipo o coordinador..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1);
                                    }}
                                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
                                />
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setIdEquipo("");
                                        setIdCoordinador("");
                                        setMiembros([]);
                                        setMostrarFormulario(true);
                                    }}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#219ebc",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "10px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Asignar Integrantes
                                </button>
                            </div>

                            <EquiposTable
                                equipos={equiposPaginados}
                                empleadosMap={empleadosMap}
                                handleEdit={handleEdit}
                                onVerDetalle={handleVerDetalle}   // << NUEVO
                                paginaActual={paginaActual}
                                totalPaginas={totalPaginas}
                                setPaginaActual={setPaginaActual}
                            />

                            <div style={{ marginTop: 16, textAlign: "center" }}>
                                <label style={{ marginRight: 10, fontWeight: 600 }}>Mostrar:</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={elementosPorPagina}
                                    onChange={(e) => {
                                        const numero = Number((e.target.value || "1").replace(/\D/g, "")) || 1;
                                        setElementosPorPagina(numero);
                                        setPaginaActual(1);
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    style={{
                                        width: 80,
                                        padding: 10,
                                        borderRadius: 8,
                                        border: "1px solid #d1d5db",
                                        textAlign: "center",
                                    }}
                                />
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>

                {mostrarFormulario && (
                    <EquipoForm
                        equipos={equipos}
                        idEquipo={idEquipo}
                        setIdEquipo={setIdEquipo}
                        idCoordinador={idCoordinador}
                        setIdCoordinador={setIdCoordinador}
                        empleados={empleados}
                        miembros={miembros}
                        setMiembros={setMiembros}
                        editingId={editingId}
                        loadingMiembros={loadingMiembros}
                        handleSubmit={handleSubmit}
                        onClose={() => setMostrarFormulario(false)}
                    />
                )}

                {/* === MODAL DETALLE === */}
                {mostrarDetalle && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.45)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 4000,
                        }}
                    >
                        <div
                            style={{
                                width: "min(720px, 96vw)",
                                maxHeight: "92vh",
                                overflow: "auto",
                                background: "#fff",
                                boxShadow: "0 0 30px rgba(0,0,0,0.25)",
                                padding: 24,
                                borderRadius: 14,
                            }}
                        >
                            <h3 style={{ marginTop: 0, marginBottom: 10 }}>Detalle del Equipo</h3>
                            <div style={{ lineHeight: 1.7 }}>
                                <p><strong>Equipo:</strong> {detalle.nombreEquipo}</p>
                                <p><strong>Coordinador:</strong> {detalle.coordinadorNombre || "—"}</p>
                                <p>
                                    <strong>Estado:</strong>{" "}
                                    <span style={{ color: detalle.estado ? "green" : "red", fontWeight: 700 }}>
                                        {detalle.estado ? "Activo" : "Inactivo"}
                                    </span>
                                </p>
                                <div>
                                    <strong>Miembros:</strong>
                                    {detalle.miembrosNombres.length === 0 ? (
                                        <p style={{ marginTop: 6, color: "#6b7280" }}>Sin miembros asignados.</p>
                                    ) : (
                                        <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                                            {detalle.miembrosNombres.map((n, i) => (
                                                <li key={i}>{n}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                <button
                                    onClick={() => setMostrarDetalle(false)}
                                    style={{
                                        background: "#219ebc",
                                        color: "#fff",
                                        padding: "10px 18px",
                                        border: "none",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        fontWeight: 600,
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ToastContainer />
                <ScrollToTop />
            </div>
        </Layout>
    );
};

export default EquiposContainer;
