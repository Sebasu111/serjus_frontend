import React, { useMemo, useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

const displayName = emp => {
    const candidates = [
        emp?.nombreCompleto,
        [emp?.nombres, emp?.apellidos].filter(Boolean).join(" "),
        [emp?.nombre, emp?.apellido].filter(Boolean).join(" "),
        [emp?.primerNombre, emp?.segundoNombre, emp?.apellidoPaterno, emp?.apellidoMaterno].filter(Boolean).join(" "),
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
const empId = emp => emp.idEmpleado ?? emp.idempleado ?? emp.id ?? emp.pk ?? emp.uuid ?? emp.codigo;
const eqId = eq => eq.id ?? eq.idEquipo ?? eq.pk;

const EquipoForm = ({
    equipos = [],
    idEquipo,
    setIdEquipo,
    idCoordinador,
    setIdCoordinador,
    empleados = [],
    editingId,
    miembros = [],
    setMiembros,
    loadingMiembros = false,
    handleSubmit,
    onClose,
    ocupadosSet = new Set(), // empleados ocupados globalmente
    originales = { coord: null, miembros: [] } // permitidos aunque estén ocupados
}) => {
    const [qCoord, setQCoord] = useState("");
    const [qMiembro, setQMiembro] = useState("");
    const [openCoordMenu, setOpenCoordMenu] = useState(false);

    const wrapperRef = useRef(null);
    useEffect(() => {
        const onClick = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpenCoordMenu(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const equipoSel = useMemo(() => equipos.find(eq => Number(eqId(eq)) === Number(idEquipo)), [equipos, idEquipo]);
    const nombreEquipo = equipoSel?.nombre ?? equipoSel?.nombreEquipo ?? `Equipo #${idEquipo}`;

    const empleadosOrdenados = useMemo(
        () =>
            [...empleados].sort((a, b) => displayName(a).localeCompare(displayName(b), "es", { sensitivity: "base" })),
        [empleados]
    );

    // set de “originales” del equipo que se edita
    const permitidosActuales = useMemo(() => {
        const set = new Set();
        if (originales?.coord != null) set.add(Number(originales.coord));
        (originales?.miembros || []).forEach(m => set.add(Number(m)));
        return set;
    }, [originales]);

    const estaOcupadoGlobal = id => ocupadosSet.has(Number(id)) && !permitidosActuales.has(Number(id));

    // Coordinador: combobox con búsqueda integrada
    const opcionesCoord = useMemo(() => {
        const t = qCoord.trim().toLowerCase();
        return empleadosOrdenados.filter(e => {
            const id = empId(e);
            if (estaOcupadoGlobal(id)) return false;
            return displayName(e).toLowerCase().includes(t);
        });
    }, [empleadosOrdenados, qCoord, ocupadosSet, permitidosActuales]);

    const seleccionarCoordinador = id => {
        setIdCoordinador(Number(id));
        setOpenCoordMenu(false);
    };

    // Miembros: excluye coordinador, actuales y TODOS los ocupados globales (salvo originales del equipo)
    const opcionesMiembro = useMemo(() => {
        const t = qMiembro.trim().toLowerCase();
        const setActuales = new Set(miembros.map(Number));
        return empleadosOrdenados.filter(e => {
            const id = Number(empId(e));
            if (id === Number(idCoordinador)) return false;
            if (setActuales.has(id)) return false;
            if (estaOcupadoGlobal(id)) return false;
            return displayName(e).toLowerCase().includes(t);
        });
    }, [empleadosOrdenados, qMiembro, idCoordinador, miembros, ocupadosSet, permitidosActuales]);

    const maxAcompanantes = 6;
    const quitarMiembro = id => setMiembros(miembros.filter(x => Number(x) !== Number(id)));
    const agregarMiembro = id => {
        id = Number(id);
        if (id === Number(idCoordinador)) return;
        if (miembros.includes(id)) return;
        if (miembros.length >= maxAcompanantes) return;
        if (estaOcupadoGlobal(id)) return;
        setMiembros([...miembros, id]);
    };
    const vaciarMiembros = () => setMiembros([]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 3000
            }}
        >
            <div
                style={{
                    width: "min(960px,96vw)",
                    maxHeight: "92vh",
                    overflow: "auto",
                    background: "#fff",
                    boxShadow: "0 0 30px rgba(0,0,0,0.25)",
                    padding: 28,
                    borderRadius: 12,
                    position: "relative"
                }}
                ref={wrapperRef}
            >
                <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 18 }}>Actualizar Equipo</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                        {/* Equipo (input de solo lectura) */}
                        <div>
                            <label style={{ display: "block", marginBottom: 6 }}>Equipo</label>
                            <input
                                type="text"
                                readOnly
                                value={nombreEquipo}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    background: "#f9fafb"
                                }}
                            />
                        </div>

                        {/* Coordinador — combobox (sin select aparte) */}
                        <div style={{ position: "relative" }}>
                            <label style={{ display: "block", marginBottom: 6 }}>Coordinador</label>
                            <input
                                type="text"
                                placeholder="Buscar y seleccionar coordinador..."
                                value={
                                    openCoordMenu
                                        ? qCoord
                                        : (empleadosOrdenados.find(e => Number(empId(e)) === Number(idCoordinador)) &&
                                              displayName(
                                                  empleadosOrdenados.find(
                                                      e => Number(empId(e)) === Number(idCoordinador)
                                                  )
                                              )) ||
                                          ""
                                }
                                onChange={e => {
                                    setQCoord(e.target.value);
                                    if (!openCoordMenu) setOpenCoordMenu(true);
                                }}
                                onFocus={() => setOpenCoordMenu(true)}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db"
                                }}
                            />
                            {openCoordMenu && (
                                <div
                                    style={{
                                        position: "absolute",
                                        zIndex: 10,
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 8,
                                        marginTop: 4,
                                        width: "100%",
                                        maxHeight: 220,
                                        overflow: "auto",
                                        boxShadow: "0 10px 20px rgba(0,0,0,0.08)"
                                    }}
                                >
                                    {opcionesCoord.length === 0 ? (
                                        <div style={{ padding: 10, color: "#6b7280" }}>Sin resultados</div>
                                    ) : (
                                        opcionesCoord.map(emp => (
                                            <button
                                                key={empId(emp)}
                                                type="button"
                                                onClick={() => seleccionarCoordinador(empId(emp))}
                                                style={{
                                                    width: "100%",
                                                    textAlign: "left",
                                                    padding: 10,
                                                    border: "none",
                                                    background: "transparent",
                                                    cursor: "pointer"
                                                }}
                                                onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
                                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                                title="Seleccionar coordinador"
                                            >
                                                {displayName(emp)}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                            <small style={{ color: "#6b7280" }}>Solo puede haber un coordinador por equipo.</small>
                        </div>

                        {/* Miembros actuales */}
                        <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 6
                                }}
                            >
                                <label style={{ fontWeight: 600 }}>
                                    Miembros actuales ({miembros.length} / {maxAcompanantes})
                                </label>
                                <button
                                    type="button"
                                    onClick={vaciarMiembros}
                                    disabled={miembros.length === 0 || loadingMiembros}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        cursor: miembros.length && !loadingMiembros ? "pointer" : "not-allowed"
                                    }}
                                    title="Quitar todos"
                                >
                                    Quitar todos
                                </button>
                            </div>

                            {loadingMiembros ? (
                                <div
                                    style={{
                                        border: "1px dashed #e5e7eb",
                                        padding: 14,
                                        borderRadius: 10,
                                        color: "#6b7280",
                                        marginBottom: 12
                                    }}
                                >
                                    Cargando miembros…
                                </div>
                            ) : miembros.length === 0 ? (
                                <div
                                    style={{
                                        border: "1px dashed #e5e7eb",
                                        padding: 14,
                                        borderRadius: 10,
                                        color: "#6b7280",
                                        marginBottom: 12
                                    }}
                                >
                                    No hay miembros asignados. Usa la búsqueda para agregarlos.
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                                        gap: 10,
                                        marginBottom: 12
                                    }}
                                >
                                    {miembros.map(id => {
                                        const emp = empleadosOrdenados.find(e => Number(empId(e)) === Number(id));
                                        return (
                                            <div
                                                key={id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 12px",
                                                    borderRadius: 10,
                                                    border: "1px solid #e5e7eb",
                                                    background: "#f9fafb"
                                                }}
                                            >
                                                <span style={{ fontWeight: 600 }}>
                                                    {emp ? displayName(emp) : `Empleado #${id}`}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => quitarMiembro(id)}
                                                    disabled={loadingMiembros}
                                                    style={{
                                                        border: "none",
                                                        background: "#ef4444",
                                                        color: "#fff",
                                                        borderRadius: 8,
                                                        padding: "6px 10px",
                                                        cursor: loadingMiembros ? "not-allowed" : "pointer"
                                                    }}
                                                    title="Quitar"
                                                >
                                                    <X size={16} color="#fff" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Agregar nuevos */}
                            <label style={{ display: "block", marginBottom: 6 }}>
                                Agregar miembros (máx. {maxAcompanantes})
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar por nombre para agregar..."
                                value={qMiembro}
                                onChange={e => setQMiembro(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: 10,
                                    borderRadius: 8,
                                    border: "1px solid #d1d5db",
                                    marginBottom: 8
                                }}
                            />

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                                    gap: 8,
                                    maxHeight: 220,
                                    overflow: "auto",
                                    border: "1px solid #f3f4f6",
                                    borderRadius: 10,
                                    padding: 8,
                                    background: "#fff"
                                }}
                            >
                                {opcionesMiembro.length === 0 ? (
                                    <div style={{ color: "#6b7280", padding: 8 }}>
                                        No hay resultados o ya no están disponibles.
                                    </div>
                                ) : (
                                    opcionesMiembro.map(emp => (
                                        <button
                                            key={empId(emp)}
                                            type="button"
                                            disabled={miembros.length >= maxAcompanantes || loadingMiembros}
                                            onClick={() => agregarMiembro(empId(emp))}
                                            style={{
                                                textAlign: "left",
                                                padding: 10,
                                                borderRadius: 8,
                                                border: "1px solid #e5e7eb",
                                                background: "#fafafa",
                                                cursor:
                                                    miembros.length >= maxAcompanantes || loadingMiembros
                                                        ? "not-allowed"
                                                        : "pointer"
                                            }}
                                            title="Agregar"
                                        >
                                            {displayName(emp)}
                                        </button>
                                    ))
                                )}
                            </div>
                            <small style={{ color: "#6b7280" }}>
                                El coordinador no puede ser miembro. No se permiten duplicados.
                            </small>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: "#6c757d",
                                color: "#fff",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer"
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loadingMiembros}
                            style={{
                                background: "#219ebc",
                                color: "#fff",
                                padding: "10px 18px",
                                border: "none",
                                borderRadius: 8,
                                cursor: loadingMiembros ? "not-allowed" : "pointer",
                                fontWeight: 600
                            }}
                        >
                            Actualizar
                        </button>
                    </div>
                </form>

                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 14,
                        right: 18,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer"
                    }}
                    title="Cerrar"
                >
                    <X size={22} color="#555" />
                </button>
            </div>
        </div>
    );
};

export default EquipoForm;
