import React, { useState } from "react";
import { X, User, Briefcase, Calendar, DollarSign, FileText } from "lucide-react";

const HistorialPuestoForm = ({
    form,
    setForm,
    empleados,
    puestos,
    editingId,
    handleSubmit,
    onClose
}) => {
    const [busquedaEmpleado, setBusquedaEmpleado] = useState("");
    const [busquedaPuesto, setBusquedaPuesto] = useState("");
    const [mostrarEmpleados, setMostrarEmpleados] = useState(false);
    const [mostrarPuestos, setMostrarPuestos] = useState(false);

    // Filtrar empleados activos
    const empleadosActivos = empleados.filter(emp => emp.estado === true);
    const empleadosFiltrados = empleadosActivos.filter(emp =>
        `${emp.nombre} ${emp.apellido}`.toLowerCase().includes(busquedaEmpleado.toLowerCase())
    );

    // Filtrar puestos activos
    const puestosActivos = puestos.filter(puesto => puesto.estado === true);
    const puestosFiltrados = puestosActivos.filter(puesto =>
        puesto.nombrepuesto.toLowerCase().includes(busquedaPuesto.toLowerCase())
    );

    const handleInputChange = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const seleccionarEmpleado = (empleado) => {
        const idEmpleado = empleado.id || empleado.idempleado || empleado.idEmpleado;
        handleInputChange('idempleado', idEmpleado);
        setBusquedaEmpleado(`${empleado.nombre} ${empleado.apellido}`);
        setMostrarEmpleados(false);
    };

    const seleccionarPuesto = (puesto) => {
        handleInputChange('idpuesto', puesto.idpuesto);
        setBusquedaPuesto(puesto.nombrepuesto);
        setMostrarPuestos(false);
    };

    const empleadoSeleccionado = empleados.find(emp =>
        (emp.id || emp.idempleado || emp.idEmpleado) === form.idempleado
    );

    const puestoSeleccionado = puestos.find(puesto =>
        puesto.idpuesto === form.idpuesto
    );

    React.useEffect(() => {
        if (empleadoSeleccionado && !busquedaEmpleado) {
            setBusquedaEmpleado(`${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}`);
        }
        if (puestoSeleccionado && !busquedaPuesto) {
            setBusquedaPuesto(puestoSeleccionado.nombrepuesto);
        }
    }, [empleadoSeleccionado, puestoSeleccionado]);

    // Validar que fecha fin sea mayor a fecha inicio
    const validarFechas = (fechaInicio, fechaFin) => {
        if (!fechaInicio || !fechaFin) return true;
        return new Date(fechaFin) > new Date(fechaInicio);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "30px",
                    width: "600px",
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    overflow: "auto",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
                    <h3 style={{ margin: 0, color: "#1f2937", fontSize: "20px", fontWeight: "600" }}>
                        {editingId ? "Editar Historial de Puesto" : "Nuevo Historial de Puesto"}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px",
                            borderRadius: "6px"
                        }}
                        onMouseEnter={e => e.target.style.backgroundColor = "#f3f4f6"}
                        onMouseLeave={e => e.target.style.backgroundColor = "transparent"}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Colaborador */}
                        <div style={{ position: "relative" }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontWeight: "500",
                                color: "#374151"
                            }}>
                                <User size={16} />
                                Colaborador *
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar colaborador..."
                                value={busquedaEmpleado}
                                onChange={e => {
                                    setBusquedaEmpleado(e.target.value);
                                    setMostrarEmpleados(true);
                                    if (!e.target.value) {
                                        handleInputChange('idempleado', '');
                                    }
                                }}
                                onFocus={() => setMostrarEmpleados(true)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocusCapture={e => e.target.style.borderColor = "#219ebc"}
                                onBlur={e => {
                                    setTimeout(() => setMostrarEmpleados(false), 200);
                                    e.target.style.borderColor = "#e5e7eb";
                                }}
                            />

                            {mostrarEmpleados && empleadosFiltrados.length > 0 && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    zIndex: 1001,
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                }}>
                                    {empleadosFiltrados.map(empleado => (
                                        <div
                                            key={empleado.id || empleado.idempleado || empleado.idEmpleado}
                                            onClick={() => seleccionarEmpleado(empleado)}
                                            style={{
                                                padding: "12px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid #f3f4f6"
                                            }}
                                            onMouseEnter={e => e.target.style.backgroundColor = "#f9fafb"}
                                            onMouseLeave={e => e.target.style.backgroundColor = "transparent"}
                                        >
                                            {empleado.nombre} {empleado.apellido}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Puesto */}
                        <div style={{ position: "relative" }}>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontWeight: "500",
                                color: "#374151"
                            }}>
                                <Briefcase size={16} />
                                Puesto *
                            </label>
                            <input
                                type="text"
                                placeholder="Buscar puesto..."
                                value={busquedaPuesto}
                                onChange={e => {
                                    setBusquedaPuesto(e.target.value);
                                    setMostrarPuestos(true);
                                    if (!e.target.value) {
                                        handleInputChange('idpuesto', '');
                                    }
                                }}
                                onFocus={() => setMostrarPuestos(true)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocusCapture={e => e.target.style.borderColor = "#219ebc"}
                                onBlur={e => {
                                    setTimeout(() => setMostrarPuestos(false), 200);
                                    e.target.style.borderColor = "#e5e7eb";
                                }}
                            />

                            {mostrarPuestos && puestosFiltrados.length > 0 && (
                                <div style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    zIndex: 1001,
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                }}>
                                    {puestosFiltrados.map(puesto => (
                                        <div
                                            key={puesto.idpuesto}
                                            onClick={() => seleccionarPuesto(puesto)}
                                            style={{
                                                padding: "12px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid #f3f4f6"
                                            }}
                                            onMouseEnter={e => e.target.style.backgroundColor = "#f9fafb"}
                                            onMouseLeave={e => e.target.style.backgroundColor = "transparent"}
                                        >
                                            {puesto.nombrepuesto}
                                            {puesto.salariobase && (
                                                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                                    Salario base: Q {parseFloat(puesto.salariobase).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fecha de Inicio */}
                        <div>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontWeight: "500",
                                color: "#374151"
                            }}>
                                <Calendar size={16} />
                                Fecha de Inicio *
                            </label>
                            <input
                                type="date"
                                value={form.fechainicio}
                                onChange={e => handleInputChange('fechainicio', e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={e => e.target.style.borderColor = "#219ebc"}
                                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* Fecha de Fin */}
                        <div>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontWeight: "500",
                                color: "#374151"
                            }}>
                                <Calendar size={16} />
                                Fecha de Fin
                            </label>
                            <input
                                type="date"
                                value={form.fechafin}
                                min={form.fechainicio}
                                onChange={e => handleInputChange('fechafin', e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: `2px solid ${!validarFechas(form.fechainicio, form.fechafin) ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={e => e.target.style.borderColor = "#219ebc"}
                                onBlur={e => e.target.style.borderColor = !validarFechas(form.fechainicio, form.fechafin) ? '#ef4444' : '#e5e7eb'}
                            />
                            {!validarFechas(form.fechainicio, form.fechafin) && (
                                <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>
                                    La fecha de fin debe ser posterior a la fecha de inicio
                                </div>
                            )}
                        </div>

                        {/* Salario */}
                        <div>
                            <label style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "8px",
                                fontWeight: "500",
                                color: "#374151"
                            }}>
                                <DollarSign size={16} />
                                Salario *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.salario}
                                onChange={e => handleInputChange('salario', e.target.value)}
                                placeholder="0.00"
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "2px solid #e5e7eb",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={e => e.target.style.borderColor = "#219ebc"}
                                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                            />
                        </div>

                        {/* Estado (solo en edición) */}
                        {editingId && (
                            <div>
                                <label style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "8px",
                                    fontWeight: "500",
                                    color: "#374151"
                                }}>
                                    Estado
                                </label>
                                <select
                                    value={form.estado}
                                    onChange={e => handleInputChange('estado', e.target.value === 'true')}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        border: "2px solid #e5e7eb",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        outline: "none",
                                        transition: "border-color 0.2s"
                                    }}
                                    onFocus={e => e.target.style.borderColor = "#219ebc"}
                                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                                >
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Observación */}
                    <div style={{ marginTop: "20px" }}>
                        <label style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            fontWeight: "500",
                            color: "#374151"
                        }}>
                            <FileText size={16} />
                            Observación
                        </label>
                        <textarea
                            value={form.observacion}
                            onChange={e => handleInputChange('observacion', e.target.value)}
                            placeholder="Observaciones adicionales..."
                            rows={4}
                            maxLength={150}
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                transition: "border-color 0.2s",
                                resize: "vertical"
                            }}
                            onFocus={e => e.target.style.borderColor = "#219ebc"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                        />
                        <div style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            textAlign: "right",
                            marginTop: "4px"
                        }}>
                            {form.observacion.length}/150 caracteres
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        marginTop: "25px"
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "12px 24px",
                                border: "2px solid #e5e7eb",
                                borderRadius: "8px",
                                background: "#fff",
                                color: "#374151",
                                cursor: "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                                e.target.style.borderColor = "#d1d5db";
                                e.target.style.backgroundColor = "#f9fafb";
                            }}
                            onMouseLeave={e => {
                                e.target.style.borderColor = "#e5e7eb";
                                e.target.style.backgroundColor = "#fff";
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: "12px 24px",
                                border: "2px solid #219ebc",
                                borderRadius: "8px",
                                background: "#219ebc",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                                e.target.style.borderColor = "#1a7a96";
                                e.target.style.backgroundColor = "#1a7a96";
                            }}
                            onMouseLeave={e => {
                                e.target.style.borderColor = "#219ebc";
                                e.target.style.backgroundColor = "#219ebc";
                            }}
                        >
                            {editingId ? "Actualizar" : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HistorialPuestoForm;