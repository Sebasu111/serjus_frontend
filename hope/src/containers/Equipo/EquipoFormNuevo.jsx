import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast.js";

const EquipoFormNuevo = ({
    equipos = [],
    idEquipo,
    setIdEquipo,
    idCoordinador,
    setIdCoordinador,
    empleados = [],
    miembros = [],
    setMiembros,
    editingId,
    handleSubmit,
    onClose,
    ocupadosSet = new Set(),
    originales = { coord: null, miembros: [] }
}) => {
    const [busquedaCoordinador, setBusquedaCoordinador] = useState("");
    const [busquedaMiembros, setBusquedaMiembros] = useState("");
    const [showError, setShowError] = useState(false);

    // Filtros para coordinador
    const coordinadoresFiltrados = useMemo(() => {
        const texto = busquedaCoordinador.toLowerCase().trim();
        const originalesSet = new Set([Number(originales.coord), ...originales.miembros.map(Number)].filter(Boolean));

        return empleados.filter(emp => {
            const nombre = `${emp.nombre || ''} ${emp.apellido || ''}`.toLowerCase();
            const coincideNombre = nombre.includes(texto);
            const empId = Number(emp.idempleado || emp.id);
            const idPuesto = emp.idpuesto ?? emp.idPuesto;
            // Solo puestos de coordinador (2, 3, 4)
            const esCoordinador = [2, 3, 4].includes(Number(idPuesto));
            const noOcupado = !ocupadosSet.has(empId) || originalesSet.has(empId);
            const noEsMiembro = !miembros.includes(empId);
            // Excluir el coordinador ya seleccionado de la lista
            const noEsCoordinadorSeleccionado = empId !== Number(idCoordinador);

            return esCoordinador && coincideNombre && noOcupado && noEsMiembro && noEsCoordinadorSeleccionado && emp.estado !== false;
        });
    }, [empleados, busquedaCoordinador, ocupadosSet, miembros, idCoordinador, originales]);

    // Filtros para miembros
    const miembrosFiltrados = useMemo(() => {
        const texto = busquedaMiembros.toLowerCase().trim();
        const originalesSet = new Set([Number(originales.coord), ...originales.miembros.map(Number)].filter(Boolean));

        return empleados.filter(emp => {
            const nombre = `${emp.nombre || ''} ${emp.apellido || ''}`.toLowerCase();
            const coincideNombre = nombre.includes(texto);
            const empId = Number(emp.idempleado || emp.id);
            const noOcupado = !ocupadosSet.has(empId) || originalesSet.has(empId);
            const noEsCoordinador = empId !== Number(idCoordinador);

            return coincideNombre && noOcupado && noEsCoordinador && emp.estado !== false;
        });
    }, [empleados, busquedaMiembros, ocupadosSet, idCoordinador, originales]);

    const toggleMiembro = idEmpleado => {
        const empId = Number(idEmpleado);
        setMiembros(prev =>
            prev.includes(empId)
                ? prev.filter(id => id !== empId)
                : [...prev, empId]
        );
    };

    const getEmpleadoNombre = empId => {
        const emp = empleados.find(e => Number(e.idempleado || e.id) === Number(empId));
        return emp ? `${emp.nombre || ''} ${emp.apellido || ''}`.trim() : `Empleado #${empId}`;
    };

    const equipoSeleccionado = equipos.find(eq => eq.idEquipo === idEquipo);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "600px",
                    maxHeight: "90vh",
                    overflow: "auto",
                    position: "relative"
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "20px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer"
                    }}
                    title="Cerrar"
                >
                    <X size={24} color="#555" />
                </button>

                <h3 style={{ textAlign: "center", marginBottom: "25px" }}>
                    {editingId ? "Editar Integrantes del Equipo" : "Crear Nuevo Equipo"}
                </h3>

                <form onSubmit={handleSubmit}>
                    {/* Selección de Equipo */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                            Equipo <span style={{ color: "red" }}>*</span>
                        </label>
                        {editingId && equipoSeleccionado ? (
                            <div style={{
                                padding: "10px",
                                backgroundColor: "#e3f2fd",
                                border: "1px solid #2196f3",
                                borderRadius: "6px",
                                fontSize: "16px",
                                color: "#0d47a1"
                            }}>
                                {equipoSeleccionado.nombreEquipo}
                            </div>
                        ) : (
                            <select
                                value={idEquipo}
                                onChange={e => setIdEquipo(Number(e.target.value))}
                                required
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: `1px solid ${!idEquipo && showError ? "red" : "#ccc"}`
                                }}
                            >
                                <option value="">Seleccione un equipo</option>
                                {equipos.map(eq => (
                                    <option key={eq.idEquipo} value={eq.idEquipo}>
                                        {eq.nombreEquipo}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Selección de Coordinador */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                            Coordinador <span style={{ color: "red" }}>*</span>
                        </label>

                        {idCoordinador && (
                            <div style={{
                                marginBottom: "10px",
                                padding: "8px 12px",
                                backgroundColor: "#e8f5e8",
                                border: "1px solid #4caf50",
                                borderRadius: "6px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <span>{getEmpleadoNombre(idCoordinador)}</span>
                                <button
                                    type="button"
                                    onClick={() => setIdCoordinador("")}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#666"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div style={{
                            border: `1px solid ${!idCoordinador && showError ? "red" : "#ccc"}`,
                            borderRadius: "6px",
                            backgroundColor: "#f9fafb"
                        }}>
                            <input
                                type="text"
                                placeholder="Buscar coordinador por nombre..."
                                value={busquedaCoordinador}
                                onChange={e => setBusquedaCoordinador(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "none",
                                    borderBottom: "1px solid #e5e5e5",
                                    borderRadius: "6px 6px 0 0",
                                    outline: "none",
                                    backgroundColor: "#fff"
                                }}
                            />

                            <div style={{
                                maxHeight: "120px",
                                overflowY: "auto",
                                padding: "8px"
                            }}>
                                {coordinadoresFiltrados.length > 0 ? (
                                    coordinadoresFiltrados.map(emp => (
                                        <div
                                            key={emp.idempleado || emp.id}
                                            onClick={() => {
                                                setIdCoordinador(emp.idempleado || emp.id);
                                                setBusquedaCoordinador("");
                                            }}
                                            style={{
                                                padding: "8px 12px",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                                transition: "background-color 0.2s",
                                                backgroundColor: "transparent"
                                            }}
                                            onMouseEnter={e => {
                                                e.target.style.backgroundColor = "#f0f0f0";
                                            }}
                                            onMouseLeave={e => {
                                                e.target.style.backgroundColor = "transparent";
                                            }}
                                        >
                                            {emp.nombre} {emp.apellido}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: "#666"
                                    }}>
                                        No se encontraron coordinadores disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Selección de Miembros */}
                    <div style={{ marginBottom: "25px" }}>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>
                            Miembros del Equipo
                        </label>

                        {miembros.length > 0 && (
                            <div style={{ marginBottom: "10px" }}>
                                <strong>Seleccionados ({miembros.length}):</strong>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                                    {miembros.map(idMiembro => (
                                        <span
                                            key={idMiembro}
                                            style={{
                                                padding: "4px 8px",
                                                backgroundColor: "#e3f2fd",
                                                border: "1px solid #2196f3",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            {getEmpleadoNombre(idMiembro)}
                                            <button
                                                type="button"
                                                onClick={() => toggleMiembro(idMiembro)}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#666",
                                                    fontSize: "10px"
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            backgroundColor: "#f9fafb"
                        }}>
                            <input
                                type="text"
                                placeholder="Buscar miembros por nombre..."
                                value={busquedaMiembros}
                                onChange={e => setBusquedaMiembros(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    border: "none",
                                    borderBottom: "1px solid #e5e5e5",
                                    borderRadius: "6px 6px 0 0",
                                    outline: "none",
                                    backgroundColor: "#fff"
                                }}
                            />

                            <div style={{
                                maxHeight: "150px",
                                overflowY: "auto",
                                padding: "8px"
                            }}>
                                {miembrosFiltrados.length > 0 ? (
                                    miembrosFiltrados.map(emp => (
                                        <label
                                            key={emp.idempleado || emp.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                padding: "8px 6px",
                                                cursor: "pointer",
                                                borderRadius: "4px",
                                                transition: "background-color 0.2s",
                                                backgroundColor: miembros.includes(emp.idempleado || emp.id)
                                                    ? "#e3f2fd" : "transparent"
                                            }}
                                            onMouseEnter={e => {
                                                if (!miembros.includes(emp.idempleado || emp.id)) {
                                                    e.target.style.backgroundColor = "#f5f5f5";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!miembros.includes(emp.idempleado || emp.id)) {
                                                    e.target.style.backgroundColor = "transparent";
                                                }
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={miembros.includes(emp.idempleado || emp.id)}
                                                onChange={() => toggleMiembro(emp.idempleado || emp.id)}
                                                style={{ margin: 0 }}
                                            />
                                            <span>{emp.nombre} {emp.apellido}</span>
                                        </label>
                                    ))
                                ) : (
                                    <div style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: "#666"
                                    }}>
                                        No se encontraron miembros disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: "#219ebc",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "16px"
                        }}
                        onClick={() => setShowError(true)}
                    >
                        {editingId ? "Actualizar Equipo" : "Crear Equipo"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EquipoFormNuevo;