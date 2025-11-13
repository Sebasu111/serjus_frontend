import React, { useState, useRef } from "react";
import SEO from "../../components/seo";

const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
];

const ContratoForm = ({ data, onChange, imprimirContrato, generandoPDF = false, puestos = [], empleados = [], historialPuestos = [], departamentos = [], contratos = [] }) => {
    const [pagina, setPagina] = useState(1);
    const formRef = useRef(null);

    const input = {
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        width: "100%",
        fontSize: "14px",
        transition: "all 0.2s",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
        fontFamily: '"Inter", sans-serif'
    };

    const grid = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "12px",
        marginBottom: "15px"
    };

    const btnPrimary = {
        background: "#023047",
        color: "#fff",
        padding: "12px 25px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "all 0.2s",
        fontFamily: '"Inter", sans-serif',
        fontWeight: "600"
    };

    const btnNav = {
        background: "#e5e7eb",
        color: "#0A0A0A",
        padding: "10px 18px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        margin: "10px 5px",
        transition: "all 0.2s",
        fontFamily: '"Inter", sans-serif',
        fontWeight: "500"
    };

    const commonProps = { autoComplete: "off", required: true };

    const handleTextOnlyChange = e => {
        const { name, value } = e.target;
        const soloTexto = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
        onChange({ target: { name, value: soloTexto } });
    };

    const handleAddressChange = e => {
        const { name, value } = e.target;
        const texto = value.replace(/[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ#\-\s.,]/g, "");
        onChange({ target: { name, value: texto } });
    };

    const handleNumberChange = e => {
        const { name, value } = e.target;
        let onlyNumbers = value.replace(/\D/g, "");
        if (name.includes("dpi")) onlyNumbers = onlyNumbers.slice(0, 13);
        onChange({ target: { name, value: onlyNumbers } });
    };

    const handleCurrencyChange = e => {
        const { name, value } = e.target;
        const number = value.replace(/[^\d]/g, "");
        const formatted = number ? `Q ${Number(number).toLocaleString()}` : "";
        onChange({ target: { name, value: formatted } });
    };

    const limpiarDatosEmpleado = () => {
        const camposEmpleado = [
            'idHistorialPuesto', 'empleadoSeleccionado', 'nombreTrabajadora',
            'edadTrabajadora', 'sexoTrabajadora', 'estadoCivilTrabajadora',
            'dpiTrabajadora', 'direccionTrabajadora', 'residenciaTrabajadora',
            'departamentoTrabajadora', 'puesto', 'salario'
        ];

        camposEmpleado.forEach(campo => {
            onChange({ target: { name: campo, value: '' } });
        });
    };

    const handleEmpleadoHistorialChange = e => {
        const { value } = e.target;
        if (!value) {
            // Limpiar todos los datos del empleado si no se selecciona ninguno
            limpiarDatosEmpleado();
            return;
        }

        const historialSeleccionado = historialPuestos.find(h => (h.idhistorialpuesto || h.id) == value);
        if (historialSeleccionado) {


            // Auto-completar datos del empleado
            const empleadoId = historialSeleccionado.idempleado || historialSeleccionado.empleado_id || historialSeleccionado.empleado;
            const empleadoRelacionado = empleados.find(emp =>
                emp.idempleado == empleadoId ||
                emp.empleado_id == empleadoId ||
                emp.id == empleadoId
            );

            const puestoId = historialSeleccionado.idpuesto || historialSeleccionado.puesto_id || historialSeleccionado.puesto;
            const puestoRelacionado = puestos.find(p =>
                p.idpuesto == puestoId ||
                p.puesto_id == puestoId ||
                p.id == puestoId
            );

            onChange({ target: { name: 'idHistorialPuesto', value: historialSeleccionado.idhistorialpuesto || historialSeleccionado.id } });

            if (empleadoRelacionado) {


                // Nombre completo con múltiples variaciones posibles
                const nombreCompleto = `${empleadoRelacionado.nombre || empleadoRelacionado.primernombre || empleadoRelacionado.primer_nombre || ''} ${empleadoRelacionado.segundonombre || empleadoRelacionado.segundo_nombre || ''} ${empleadoRelacionado.apellido || empleadoRelacionado.primerapellido || empleadoRelacionado.primer_apellido || ''} ${empleadoRelacionado.segundoapellido || empleadoRelacionado.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
                onChange({ target: { name: 'nombreTrabajadora', value: nombreCompleto } });

                // Calcular edad desde fecha de nacimiento si no hay campo edad directo
                let edad = '';
                if (empleadoRelacionado.edad) {
                    edad = empleadoRelacionado.edad.toString();
                } else if (empleadoRelacionado.fechanacimiento || empleadoRelacionado.fecha_nacimiento || empleadoRelacionado.birthDate) {
                    const fechaNac = empleadoRelacionado.fechanacimiento || empleadoRelacionado.fecha_nacimiento || empleadoRelacionado.birthDate;
                    const birthDate = new Date(fechaNac);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        calculatedAge--;
                    }
                    edad = calculatedAge.toString();
                }
                onChange({ target: { name: 'edadTrabajadora', value: edad } });

                // Sexo/Género con múltiples variaciones
                let sexo = '';
                const sexoRaw = empleadoRelacionado.sexo || empleadoRelacionado.genero || empleadoRelacionado.gender || '';
                if (sexoRaw) {
                    // Normalizar valores comunes
                    const sexoLower = sexoRaw.toLowerCase();
                    if (sexoLower.includes('m') && sexoLower.includes('masculino')) {
                        sexo = 'Masculino';
                    } else if (sexoLower.includes('f') && sexoLower.includes('femenino')) {
                        sexo = 'Femenino';
                    } else if (sexoLower === 'm' || sexoLower === 'male') {
                        sexo = 'Masculino';
                    } else if (sexoLower === 'f' || sexoLower === 'female') {
                        sexo = 'Femenino';
                    } else {
                        sexo = sexoRaw; // Usar valor original si no se puede normalizar
                    }
                }
                onChange({ target: { name: 'sexoTrabajadora', value: sexo } });

                // Estado civil con múltiples variaciones y normalización
                let estadoCivil = empleadoRelacionado.estadocivil || empleadoRelacionado.estado_civil || empleadoRelacionado.maritalStatus || '';
                if (estadoCivil) {
                    const estadoCivilLower = estadoCivil.toString().toLowerCase().trim();
                    if (estadoCivilLower.includes('soltero') || estadoCivilLower === 'single') {
                        estadoCivil = 'Soltero/a';
                    } else if (estadoCivilLower.includes('casado') || estadoCivilLower === 'married') {
                        estadoCivil = 'Casado/a';
                    } else if (estadoCivilLower.includes('viudo') || estadoCivilLower === 'widowed') {
                        estadoCivil = 'Viudo/a';
                    } else if (estadoCivilLower.includes('divorciado') || estadoCivilLower === 'divorced') {
                        estadoCivil = 'Divorciado/a';
                    }
                    // Si no coincide con ninguna opción, usar el valor original
                }
                onChange({ target: { name: 'estadoCivilTrabajadora', value: estadoCivil } });

                // DPI con múltiples variaciones
                const dpi = empleadoRelacionado.dpi || empleadoRelacionado.cui || empleadoRelacionado.cedula || empleadoRelacionado.documento || '';
                onChange({ target: { name: 'dpiTrabajadora', value: dpi } });

                // País/Nacionalidad
                const pais = empleadoRelacionado.pais || empleadoRelacionado.nacionalidad || empleadoRelacionado.country || empleadoRelacionado.nationality || 'Guatemala';
                onChange({ target: { name: 'direccionTrabajadora', value: pais } });

                // Dirección/Residencia
                const residencia = empleadoRelacionado.direccion || empleadoRelacionado.address || empleadoRelacionado.residencia || '';
                onChange({ target: { name: 'residenciaTrabajadora', value: residencia } });

                // Departamento
                const departamento = empleadoRelacionado.departamento || empleadoRelacionado.department || empleadoRelacionado.provincia || '';
                onChange({ target: { name: 'departamentoTrabajadora', value: departamento } });


            }

            if (puestoRelacionado) {
                onChange({ target: { name: 'puesto', value: puestoRelacionado.nombrepuesto || puestoRelacionado.nombrePuesto || '' } });
            }

            // Auto-completar salario si existe en el historial
            if (historialSeleccionado.salario) {
                const salarioFormateado = `Q ${Number(historialSeleccionado.salario).toLocaleString()}`;
                onChange({ target: { name: 'salario', value: salarioFormateado } });
            }
        }
    };

    const handleEmpleadoDirectoChange = e => {
        const { value } = e.target;
        if (!value) {
            // Limpiar todos los datos del empleado si no se selecciona ninguno
            limpiarDatosEmpleado();
            return;
        }

        const empleadoSeleccionado = empleados.find(emp => emp.idempleado == value);
        if (empleadoSeleccionado) {


            // Guardar el ID del empleado seleccionado
            onChange({ target: { name: 'empleadoSeleccionado', value: empleadoSeleccionado.idempleado } });

            // Usar la misma lógica mejorada de auto-completado
            // Nombre completo con múltiples variaciones posibles
            const nombreCompleto = `${empleadoSeleccionado.nombre || empleadoSeleccionado.primernombre || empleadoSeleccionado.primer_nombre || ''} ${empleadoSeleccionado.segundonombre || empleadoSeleccionado.segundo_nombre || ''} ${empleadoSeleccionado.apellido || empleadoSeleccionado.primerapellido || empleadoSeleccionado.primer_apellido || ''} ${empleadoSeleccionado.segundoapellido || empleadoSeleccionado.segundo_apellido || ''}`.replace(/\s+/g, ' ').trim();
            onChange({ target: { name: 'nombreTrabajadora', value: nombreCompleto } });

            // Calcular edad desde fecha de nacimiento si no hay campo edad directo
            let edad = '';
            if (empleadoSeleccionado.edad) {
                edad = empleadoSeleccionado.edad.toString();
            } else if (empleadoSeleccionado.fechanacimiento || empleadoSeleccionado.fecha_nacimiento || empleadoSeleccionado.birthDate) {
                const fechaNac = empleadoSeleccionado.fechanacimiento || empleadoSeleccionado.fecha_nacimiento || empleadoSeleccionado.birthDate;
                const birthDate = new Date(fechaNac);
                const today = new Date();
                let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    calculatedAge--;
                }
                edad = calculatedAge.toString();
            }
            onChange({ target: { name: 'edadTrabajadora', value: edad } });

            // Sexo/Género con múltiples variaciones
            let sexo = '';
            const sexoRaw = empleadoSeleccionado.sexo || empleadoSeleccionado.genero || empleadoSeleccionado.gender || '';
            if (sexoRaw) {
                // Normalizar valores comunes
                const sexoLower = sexoRaw.toLowerCase();
                if (sexoLower.includes('m') && sexoLower.includes('masculino')) {
                    sexo = 'Masculino';
                } else if (sexoLower.includes('f') && sexoLower.includes('femenino')) {
                    sexo = 'Femenino';
                } else if (sexoLower === 'm' || sexoLower === 'male') {
                    sexo = 'Masculino';
                } else if (sexoLower === 'f' || sexoLower === 'female') {
                    sexo = 'Femenino';
                } else {
                    sexo = sexoRaw; // Usar valor original si no se puede normalizar
                }
            }
            onChange({ target: { name: 'sexoTrabajadora', value: sexo } });

            // Estado civil con múltiples variaciones y normalización
            let estadoCivil = empleadoSeleccionado.estadocivil || empleadoSeleccionado.estado_civil || empleadoSeleccionado.maritalStatus || '';
            if (estadoCivil) {
                const estadoCivilLower = estadoCivil.toString().toLowerCase().trim();
                if (estadoCivilLower.includes('soltero') || estadoCivilLower === 'single') {
                    estadoCivil = 'Soltero/a';
                } else if (estadoCivilLower.includes('casado') || estadoCivilLower === 'married') {
                    estadoCivil = 'Casado/a';
                } else if (estadoCivilLower.includes('viudo') || estadoCivilLower === 'widowed') {
                    estadoCivil = 'Viudo/a';
                } else if (estadoCivilLower.includes('divorciado') || estadoCivilLower === 'divorced') {
                    estadoCivil = 'Divorciado/a';
                }
                // Si no coincide con ninguna opción, usar el valor original
            }
            onChange({ target: { name: 'estadoCivilTrabajadora', value: estadoCivil } });

            // DPI con múltiples variaciones
            const dpi = empleadoSeleccionado.dpi || empleadoSeleccionado.cui || empleadoSeleccionado.cedula || empleadoSeleccionado.documento || '';
            onChange({ target: { name: 'dpiTrabajadora', value: dpi } });

            // País/Nacionalidad
            const pais = empleadoSeleccionado.pais || empleadoSeleccionado.nacionalidad || empleadoSeleccionado.country || empleadoSeleccionado.nationality || 'Guatemala';
            onChange({ target: { name: 'direccionTrabajadora', value: pais } });

            // Dirección/Residencia
            const residencia = empleadoSeleccionado.direccion || empleadoSeleccionado.address || empleadoSeleccionado.residencia || '';
            onChange({ target: { name: 'residenciaTrabajadora', value: residencia } });

            // Departamento
            const departamento = empleadoSeleccionado.departamento || empleadoSeleccionado.department || empleadoSeleccionado.provincia || '';
            onChange({ target: { name: 'departamentoTrabajadora', value: departamento } });

            // El puesto se seleccionará manualmente en la página 3
            // No auto-completar salario sin historial de puesto específico
        }
    };

    const handleDateChange = e => {
        const { name, value } = e.target;
        onChange({ target: { name, value } });
        if (value) {
            const [year, month, day] = value.split("-");
            const mesNombre = meses[parseInt(month, 10) - 1];
            const formateada = `${parseInt(day)} de ${mesNombre} de ${year}`;
            onChange({ target: { name: `${name}Formateada`, value: formateada } });
        } else {
            onChange({ target: { name: `${name}Formateada`, value: "" } });
        }
    };

    // Campos que se auto-completan cuando se selecciona un empleado
    const camposAutoCompletados = [
        'nombreTrabajadora', 'edadTrabajadora', 'sexoTrabajadora',
        'estadoCivilTrabajadora', 'dpiTrabajadora', 'direccionTrabajadora',
        'residenciaTrabajadora', 'departamentoTrabajadora', 'puesto', 'salario'
    ];    // Verifica si un campo está auto-completado (tiene empleado seleccionado y tiene valor)
    const esAutoCompletado = (campo) => {
        const tieneEmpleadoSeleccionado = data.idHistorialPuesto || data.empleadoSeleccionado;
        const tieneValor = data[campo] && data[campo].toString().trim() !== '';
        return camposAutoCompletados.includes(campo) && tieneEmpleadoSeleccionado && tieneValor;
    };

    const renderFields = fields =>
        Object.entries(fields).map(([k, { label, placeholder }]) => {
            if (k.includes("sexo")) {
                return (
                    <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            htmlFor={k}
                            style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {label}:
                        </label>
                        <select id={k} name={k} value={data[k]} onChange={onChange} style={input} {...commonProps}>
                            <option value="">Seleccione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                        </select>
                    </div>
                );
            }

            if (k.includes("estadoCivil")) {
                return (
                    <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            htmlFor={k}
                            style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {label}:
                        </label>
                        <select id={k} name={k} value={data[k]} onChange={onChange} style={input} {...commonProps}>
                            <option value="">Seleccione...</option>
                            <option value="Soltero/a">Soltero/a</option>
                            <option value="Casado/a">Casado/a</option>
                        </select>
                    </div>
                );
            }

            // Menú desplegable para puesto
            if (k === "puesto") {
                const autoCompletado = esAutoCompletado(k);

                return (
                    <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            htmlFor={k}
                            style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontFamily: '"Inter", sans-serif',
                                color: autoCompletado ? "#1976d2" : "inherit"
                            }}
                        >
                            {label}:
                        </label>
                        {autoCompletado ? (
                            <div style={{
                                padding: "12px",
                                backgroundColor: "#e3f2fd",
                                border: "1px solid #2196f3",
                                borderRadius: "6px",
                                fontSize: "16px",
                                color: "#0d47a1"
                            }}>
                                {data[k]}
                            </div>
                        ) : (
                            <select id={k} name={k} value={data[k]} onChange={onChange} style={input} {...commonProps}>
                                <option value="">Seleccione un puesto...</option>
                                {puestos.map(puesto => {
                                    const puestoNombre = puesto.nombrepuesto ?? puesto.nombrePuesto ?? puesto.puesto ?? puesto.nombre ?? `ID ${puesto.idpuesto || puesto.id}`;
                                    return (
                                        <option key={puesto.idpuesto || puesto.id} value={puestoNombre}>
                                            {puestoNombre}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    </div>
                );
            }

            // Menú desplegable para departamento
            if (k === "departamentoTrabajadora") {
                return (
                    <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            htmlFor={k}
                            style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {label}:
                        </label>
                        <select id={k} name={k} value={data[k]} onChange={onChange} style={input} {...commonProps}>
                            <option value="">Seleccione un departamento...</option>
                            {departamentos.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }

            if (k === "fechaInicio" || k === "fechaContrato") {
                return (
                    <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                        <label
                            htmlFor={k}
                            style={{
                                marginBottom: "4px",
                                fontWeight: "bold",
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {label}:
                        </label>
                        <input type="date" id={k} name={k} onChange={handleDateChange} style={input} {...commonProps} />
                    </div>
                );
            }

            let onFieldChange = onChange;
            let extraProps = {};

            if (k.includes("nombre") || k.includes("pais") || k.includes("departamento")) {
                onFieldChange = handleTextOnlyChange;
            } else if (k.includes("edad") || k.includes("dpi")) {
                onFieldChange = handleNumberChange;
                if (k.includes("dpi")) {
                    extraProps.maxLength = 13;
                    extraProps.inputMode = "numeric";
                    extraProps.pattern = "\\d{13}";
                }
            } else if (k.includes("salario") || k.includes("sueldo") || k.includes("bonificacion")) {
                onFieldChange = handleCurrencyChange;
            } else if (k.includes("fecha")) {
                onFieldChange = handleDateChange;
            } else if (k.includes("direccion")) {
                onFieldChange = handleAddressChange;
            }

            const autoCompletado = esAutoCompletado(k);

            return (
                <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                    <label
                        htmlFor={k}
                        style={{
                            marginBottom: "4px",
                            fontWeight: "bold",
                            fontFamily: '"Inter", sans-serif',
                            color: autoCompletado ? "#1976d2" : "inherit"
                        }}
                    >
                        {label}:
                    </label>
                    {autoCompletado ? (
                        <div style={{
                            padding: "12px",
                            backgroundColor: "#e3f2fd",
                            border: "1px solid #2196f3",
                            borderRadius: "6px",
                            fontSize: "16px",
                            color: "#0d47a1"
                        }}>
                            {data[k]}
                        </div>
                    ) : (
                        <input
                            id={k}
                            name={k}
                            value={data[k]}
                            onChange={onFieldChange}
                            placeholder={placeholder}
                            style={input}
                            {...commonProps}
                            {...extraProps}
                        />
                    )}
                </div>
            );
        });

    const handleSubmit = e => {
        e.preventDefault();
        if (!validarPagina(pagina)) return;
        imprimirContrato();
    };

    const validarPagina = () => {
        const form = formRef.current;
        const pageInputs = Array.from(
            form.querySelectorAll(`.pagina-${pagina} input, .pagina-${pagina} select, .pagina-${pagina} textarea`)
        );

        for (let input of pageInputs) {
            if (!input.value) {
                input.setCustomValidity("Este campo es obligatorio");
                input.reportValidity();
                input.focus();
                return false;
            }

            if (input.name.includes("dpi") && input.value.length !== 13) {
                input.setCustomValidity("El DPI debe tener exactamente 13 dígitos");
                input.reportValidity();
                input.focus();
                return false;
            }

            if (input.type === "date" && !input.value) {
                input.setCustomValidity("Seleccione una fecha");
                input.reportValidity();
                input.focus();
                return false;
            }

            input.setCustomValidity("");
        }

        return true;
    };

    const paginasTotales = 4;

    return (
        <form
            ref={formRef}
            className="no-print"
            onSubmit={handleSubmit}
            style={{
                marginBottom: "40px",
                fontFamily: '"Inter", sans-serif'
            }}
        >
            <SEO title="Contratos" />
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: "600",
                    fontSize: "20px"
                }}
            >
                Editor de Contrato
            </h1>
            <div
                style={{
                    padding: "0",
                    fontFamily: '"Inter", sans-serif'
                }}
            >
                {pagina === 1 && (
                    <div className="pagina-1">
                        <h3
                            style={{
                                fontSize: "20px",
                                marginBottom: "10px",
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: "600"
                            }}
                        >
                            Datos del Empleador/a
                        </h3>
                        <div style={grid}>
                            {renderFields({
                                nombreEmpleadora: {
                                    label: "Nombre completo de la empleador/a",
                                    placeholder: "Ej. Ingrid López Castillo"
                                },
                                edadEmpleadora: { label: "Edad de la empleador/a", placeholder: "Ej. 53" },
                                sexoEmpleadora: { label: "Sexo de la empleador/a" },
                                estadoCivilEmpleadora: { label: "Estado civil de la empleador/a" },
                                direccionEmpleadora: {
                                    label: "Dirección completa de la empleador/a",
                                    placeholder: "Ej. 3a Avenida 10-45 Zona 2, Coatepeque"
                                },
                                dpiEmpleadora: {
                                    label: "Número de DPI de la empleador/a",
                                    placeholder: "Ej. 2598709940920"
                                }
                            })}
                        </div>
                    </div>
                )}

                {pagina === 2 && (
                    <div className="pagina-2">
                        {/* Selector de Empleado basado en Historial de Puestos */}
                        <div style={{ marginBottom: "15px" }}>

                            {historialPuestos.length > 0 ? (
                                // Usar historial de puestos (método correcto)
                                <div>
                                    <label
                                        htmlFor="empleadoHistorial"
                                        style={{
                                            marginBottom: "4px",
                                            fontWeight: "bold",
                                            fontFamily: '"Inter", sans-serif'
                                        }}
                                    >
                                        Seleccionar Colaborador:
                                    </label>
                                    <select
                                        id="empleadoHistorial"
                                        name="empleadoHistorial"
                                        value={data.idHistorialPuesto || ''}
                                        onChange={handleEmpleadoHistorialChange}
                                        style={input}
                                        required
                                    >
                                        <option value="">Seleccione un colaborador...</option>
                                        {(() => {
                                            // DEBUG: Mostrar datos en consola
                                            console.log('CONTRATOS:', contratos);
                                            console.log('HISTORIAL PUESTOS:', historialPuestos);
                                            // Obtener IDs de historial de puesto con contrato activo (estado: true y fechafin: null)
                                            const historialConContratoActivo = new Set();
                                            if (Array.isArray(contratos)) {
                                                contratos.forEach(contrato => {
                                                    if ((contrato.estado === true || contrato.estado === 1) && contrato.fechafin == null) {
                                                        if (contrato.idhistorialpuesto) historialConContratoActivo.add(contrato.idhistorialpuesto);
                                                    }
                                                });
                                            }

                                            // Filtrar para mostrar solo el puesto más reciente/actual de cada empleado que NO tenga contrato activo por historial
                                            const empleadosUnicos = new Map();
                                            historialPuestos.forEach(historial => {
                                                const empleadoId = historial.idempleado || historial.empleado_id || historial.empleado;
                                                const historialId = historial.idhistorialpuesto || historial.id;
                                                if (historialConContratoActivo.has(historialId)) return; // Excluir si su historial está en contrato activo

                                                const fechaCreacion = new Date(historial.createdat || historial.created_at || historial.fecha_creacion || '1900-01-01');
                                                const esActivo = historial.estado === true || historial.estado === 1 || historial.activo === true;

                                                if (!empleadosUnicos.has(empleadoId)) {
                                                    empleadosUnicos.set(empleadoId, historial);
                                                } else {
                                                    const historialExistente = empleadosUnicos.get(empleadoId);
                                                    const fechaExistente = new Date(historialExistente.createdat || historialExistente.created_at || historialExistente.fecha_creacion || '1900-01-01');
                                                    const existenteActivo = historialExistente.estado === true || historialExistente.estado === 1 || historialExistente.activo === true;
                                                    if ((!existenteActivo && esActivo) || (esActivo === existenteActivo && fechaCreacion > fechaExistente)) {
                                                        empleadosUnicos.set(empleadoId, historial);
                                                    }
                                                }
                                            });

                                            return Array.from(empleadosUnicos.values()).map(historial => {
                                                const empleadoId = historial.idempleado || historial.empleado_id || historial.empleado;
                                                const empleado = empleados.find(emp =>
                                                    emp.idempleado == empleadoId ||
                                                    emp.empleado_id == empleadoId ||
                                                    emp.id == empleadoId
                                                );
                                                const puestoId = historial.idpuesto || historial.puesto_id || historial.puesto;
                                                const puesto = puestos.find(p =>
                                                    p.idpuesto == puestoId ||
                                                    p.puesto_id == puestoId ||
                                                    p.id == puestoId
                                                );
                                                const nombreEmpleado = empleado
                                                    ? `${empleado.nombre || empleado.primernombre || ''} ${empleado.apellido || empleado.primerapellido || ''}`.trim()
                                                    : `Empleado ID: ${empleadoId}`;
                                                const nombrePuesto = puesto?.nombrepuesto || puesto?.nombrePuesto || puesto?.nombre_puesto || puesto?.nombre || `Puesto ID: ${puestoId}`;
                                                const historialId = historial.idhistorialpuesto || historial.id;
                                                return (
                                                    <option key={historialId} value={historialId}>
                                                        {nombreEmpleado} - {nombrePuesto}
                                                    </option>
                                                );
                                            });
                                        })()}
                                    </select>
                                </div>
                            ) : (
                                // Fallback: usar empleados directamente
                                <div>
                                    <label
                                        htmlFor="empleadoSeleccionado"
                                        style={{
                                            marginBottom: "4px",
                                            fontWeight: "bold",
                                            fontFamily: '"Inter", sans-serif'
                                        }}
                                    >
                                        Seleccionar Colaborador (Modo Temporal):
                                    </label>
                                    <div style={{ fontSize: "12px", color: "#ff6b35", marginBottom: "5px" }}>
                                        ⚠️ Historial de puestos no disponible - usando selección directa
                                    </div>
                                    <select
                                        id="empleadoSeleccionado"
                                        name="empleadoSeleccionado"
                                        value={data.empleadoSeleccionado || ''}
                                        onChange={handleEmpleadoDirectoChange}
                                        style={input}
                                        required
                                    >
                                        <option value="">Seleccione un colaborador...</option>
                                        {empleados.map(empleado => {
                                            const nombreCompleto = `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim();
                                            return (
                                                <option key={empleado.idempleado} value={empleado.idempleado}>
                                                    {nombreCompleto} (ID: {empleado.idempleado})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}
                        </div>

                        <h3
                            style={{
                                fontSize: "20px",
                                marginBottom: "10px",
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: "600"
                            }}
                        >
                            Datos de la Trabajador/a
                        </h3>
                        <div style={grid}>
                            {renderFields({
                                nombreTrabajadora: {
                                    label: "Nombre completo de la trabajador/a",
                                    placeholder: "Ej. María Fernanda Pérez Ramírez"
                                },
                                edadTrabajadora: { label: "Edad de la trabajador/a", placeholder: "Ej. 28" },
                                sexoTrabajadora: { label: "Sexo de la trabajador/a" },
                                estadoCivilTrabajadora: { label: "Estado civil de la trabajador/a" },
                                direccionTrabajadora: { label: "País en el que reside", placeholder: "Ej. Guatemala" },
                                dpiTrabajadora: {
                                    label: "Número de DPI de la trabajador/a",
                                    placeholder: "Ej. 3045127890101"
                                },
                                residenciaTrabajadora: {
                                    label: "Lugar de residencia actual",
                                    placeholder: "Ej. Colonia El Rosario, Quetzaltenango"
                                },
                                departamentoTrabajadora: { label: "Departamento", placeholder: "Ej. Quetzaltenango" }
                            })}
                        </div>
                    </div>
                )}

                {pagina === 3 && (
                    <div className="pagina-3">
                        <h3
                            style={{
                                fontSize: "20px",
                                marginBottom: "10px",
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: "600"
                            }}
                        >
                            Detalles del Contrato
                        </h3>
                        <div style={grid}>
                            {renderFields({
                                fechaInicio: { label: "Fecha de inicio del contrato" },
                                puesto: {
                                    label: "Puesto que ocupará la trabajador/a",
                                    placeholder: "Ej. Empleada doméstica"
                                },
                                lugarServicios: {
                                    label: "Lugar donde se prestarán los servicios",
                                    placeholder: "Ej. Residencia de la empleadora"
                                },
                                salario: { label: "Salario total mensual", placeholder: "Ej. Q 3,200" },
                                sueldoOrdinario: { label: "Monto de sueldo ordinario", placeholder: "Ej. Q 2,800" },
                                bonificacion: { label: "Monto de la bonificación", placeholder: "Ej. Q 400" },
                                banco: {
                                    label: "Banco donde se acreditará el salario",
                                    placeholder: "Ej. Banco G&T Continental"
                                },
                                fechaContrato: { label: "Fecha de firma del contrato" }
                            })}
                        </div>
                    </div>
                )}

                {pagina === 4 && (
                    <div className="pagina-4">

                        <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
                            <label
                                htmlFor="funciones"
                                style={{
                                    marginBottom: "4px",
                                    fontWeight: "bold",
                                    fontFamily: '"Inter", sans-serif'
                                }}
                            >
                                Describa las funciones principales:
                            </label>
                            <textarea
                                id="funciones"
                                name="funciones"
                                value={data.funciones}
                                onChange={onChange}
                                placeholder="Ej. Limpieza general, preparación de alimentos y atención del hogar"
                                style={{
                                    ...input,
                                    height: "120px",
                                    fontFamily: '"Inter", sans-serif'
                                }}
                                {...commonProps}
                            />
                        </div>

                        <div style={{ textAlign: "center", marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                            <button
                                type="submit"
                                disabled={generandoPDF}
                                style={{
                                    ...btnPrimary,
                                    background: generandoPDF ? "#cccccc" : "#023047",
                                    opacity: generandoPDF ? 0.6 : 1,
                                    cursor: generandoPDF ? "not-allowed" : "pointer"
                                }}
                            >
                                {generandoPDF ? "Generando Contrato..." : "Guardar e Imprimir"}
                            </button>


                        </div>
                    </div>
                )}

                <div style={{ textAlign: "center", marginTop: "30px" }}>
                    {pagina > 1 && (
                        <button type="button" style={btnNav} onClick={() => setPagina(pagina - 1)}>
                            ← Anterior
                        </button>
                    )}
                    {pagina < paginasTotales && (
                        <button
                            type="button"
                            style={btnNav}
                            onClick={() => {
                                if (validarPagina(pagina)) setPagina(pagina + 1);
                            }}
                        >
                            Siguiente →
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default ContratoForm;
