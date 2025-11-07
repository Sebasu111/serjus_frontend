import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./EmpleadoModal.css";

const DEPARTAMENTOS_GT = [
    "Alta Verapaz",
    "Baja Verapaz",
    "Chimaltenango",
    "Chiquimula",
    "El Progreso",
    "Escuintla",
    "Guatemala",
    "Huehuetenango",
    "Izabal",
    "Jalapa",
    "Jutiapa",
    "Petén",
    "Quetzaltenango",
    "Quiché",
    "Retalhuleu",
    "Sacatepéquez",
    "San Marcos",
    "Santa Rosa",
    "Sololá",
    "Suchitepéquez",
    "Totonicapán",
    "Zacapa"
];

const pick = (obj, ...keys) => {
    for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
};
const getId = o =>
    pick(
        o,
        "id",
        "ididioma",
        "idIdioma",
        "idequipo",
        "idEquipo",
        "idpueblocultura",
        "idPuebloCultura",
        "idpuesto",
        "idPuesto",
        "pk",
        "codigo"
    );
const getIdiomaLabel = o => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloLabel = o =>
    pick(o, "nombrePueblo", "nombrepueblo", "nombrepueblocultura", "pueblocultura", "pueblo", "descripcion", "label");
const getEquipoLabel = o => pick(o, "nombreequipo", "nombreEquipo", "nombre", "descripcion", "label");

const EmpleadoForm = ({
    form,
    errors,
    onChange,
    handleSubmit,
    onClose,
    editingId,
    idiomas = [],
    pueblos = [],
    equipos = [],
    puestos = [],
    lockEquipo = false,
    onCvUpload,
    cvExistente = null,
    onEliminarCv
}) => {
    const [step, setStep] = useState(1);
    const [sidebarWidth, setSidebarWidth] = useState(0);

    // Función para calcular el ancho del sidebar dinámicamente
    const updateSidebarWidth = () => {
        // Verificar si estamos en móvil
        if (window.innerWidth <= 991) {
            setSidebarWidth(0);
            return;
        }

        // Verificar si el sidebar está colapsado
        const body = document.body;
        const isCollapsed = body.classList.contains("sidebar-collapsed");
        setSidebarWidth(isCollapsed ? 90 : 300);
    };

    // Escuchar cambios en el sidebar y redimensionamiento de ventana
    useEffect(() => {
        updateSidebarWidth();

        // Observer para cambios en las clases del body
        const observer = new MutationObserver(() => {
            updateSidebarWidth();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Listener para redimensionamiento de ventana
        const handleResize = () => {
            updateSidebarWidth();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Campos por paso
    const STEP1_FIELDS = [
        "nombre",
        "apellido",
        "genero",
        "lugarnacimiento",
        "fechanacimiento",
        "estadocivil",
        "dpi",
        "nit"
        // numeroiggs removido - ahora es opcional
    ];
    const STEP2_FIELDS = [
        // telefonoresidencial removido - ahora es opcional
        "telefonocelular",
        "telefonoemergencia",
        "email",
        "direccion",
        "ididioma",
        "idpueblocultura",
        "idpuesto",
        "idequipo"
    ];
    const STEP3_FIELDS = ["numerohijos", "titulonivelmedio", "estudiosuniversitarios", "iniciolaboral", "cvFile"];

    // goToStep desde el Container
    useEffect(() => {
        const handler = e => {
            const n = Number(e.detail);
            if (n >= 1 && n <= 3) setStep(n);
            setTimeout(() => {
                const el = document.querySelector("#empleadoFormTop");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 60);
        };
        window.addEventListener("empleadoForm:goToStep", handler);
        return () => window.removeEventListener("empleadoForm:goToStep", handler);
    }, []);

    // Limpia mensaje nativo al escribir
    const handleFieldChange = e => {
        if (e?.target?.setCustomValidity) e.target.setCustomValidity("");
        onChange(e);
    };

    // NUEVO: Forzamos que cualquier invalidación use nuestro texto
    const handleInvalid = e => {
        // Evita que el navegador muestre su string por defecto
        e.preventDefault();
        const input = e.target;
        // Si está vacío (u otro caso inválido), ponemos nuestro mensaje
        if (input && input.setCustomValidity) {
            input.setCustomValidity("Este campo es obligatorio");
            // Mostrar inmediatamente el tooltip con nuestro texto
            if (input.reportValidity) input.reportValidity();
            if (input.focus) input.focus();
        }
    };

    // Validación LITERAL por paso (para el botón Siguiente)
    const validateCurrentStepNative = () => {
        const box = document.querySelector(`[data-step="${step}"]`);
        if (!box) return true;

        const requiredNames =
            step === 1 ? new Set(STEP1_FIELDS) : step === 2 ? new Set(STEP2_FIELDS) : new Set(STEP3_FIELDS);

        const pageInputs = box.querySelectorAll("input, select, textarea");

        for (let input of pageInputs) {
            const name = input.name;
            // Si el input está deshabilitado (por ejemplo equipo bloqueado), ignorarlo
            if (input.disabled) continue;
            if (!requiredNames.has(name)) continue;
            if (name === "nit" && Boolean(form.isCF)) continue;

            if (!String(input.value || "").trim()) {
                input.setCustomValidity("Este campo es obligatorio");
                input.reportValidity();
                input.focus();
                return false;
            } else {
                input.setCustomValidity("");
            }
        }
        return true;
    };

    const next = e => {
        e.preventDefault();
        if (!validateCurrentStepNative()) return;
        setStep(s => Math.min(3, s + 1));
        setTimeout(() => {
            const el = document.querySelector("#empleadoFormTop");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    };

    const back = e => {
        e.preventDefault();
        setStep(s => Math.max(1, s - 1));
        setTimeout(() => {
            const el = document.querySelector("#empleadoFormTop");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
    };

    // Estilos
    const labelStyle = { display: "block", fontWeight: 600, marginBottom: 6 };
    const inputStyle = {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontSize: 15,
        marginTop: 2,
        background: "#fff"
    };
    const field = { display: "flex", flexDirection: "column", marginBottom: 20 };
    const fs = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, marginBottom: 18, background: "#fafafa" };
    const lg = { padding: "0 8px", fontWeight: 700 };
    const grid3 = {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        columnGap: 18,
        rowGap: 16,
        alignItems: "start"
    };
    const warn = {
        display: "inline-block",
        marginTop: 8,
        background: "#FEF3C7",
        color: "#92400E",
        border: "1px solid #FDE68A",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 13,
        fontWeight: 700
    };

    const btnPrimary = {
        width: "100%",
        marginTop: 16,
        padding: "12px 0",
        background: "#219ebc",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer"
    };
    const btnGhost = {
        padding: "10px 16px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer"
    };
    const btnNext = {
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        background: "#219ebc",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer"
    };

    const hasCustomLugar = form.lugarnacimiento && !DEPARTAMENTOS_GT.includes(form.lugarnacimiento);

    const availableWidth = window.innerWidth - sidebarWidth;
    const isMobile = window.innerWidth <= 991;

    // Calcular la posición left para centrar en el área disponible
    const modalLeft = isMobile ? "50%" : `${sidebarWidth + (availableWidth / 2)}px`;
    const modalWidth = isMobile
        ? Math.min(600, window.innerWidth * 0.95)
        : Math.min(1100, availableWidth * 0.9);

    return (
        <>
            {/* Overlay para cerrar el modal al hacer click fuera */}
            <div
                className="empleado-modal-overlay"
                onClick={onClose}
            />

            <div
                id="empleadoFormTop"
                className={`empleado-modal ${isMobile ? 'mobile' : 'desktop'}`}
                style={{
                    left: modalLeft,
                    width: modalWidth
                }}
            >
                <div className="empleado-form-container">
                    <h3 style={{ marginBottom: 4, textAlign: "center", letterSpacing: 0.2 }}>
                        {editingId ? "Editar colaborador" : "Registrar colaborador"}
                    </h3>
                    <div style={{ textAlign: "center", marginBottom: 18, color: "#374151", fontWeight: 700 }}>
                        Paso {step} de 3
                    </div>

                    {/* onInvalid a nivel de form para forzar el mensaje */}
                    <form onSubmit={handleSubmit} onInvalid={handleInvalid}>
                        {/* ===== PASO 1 ===== */}
                        {step === 1 && (
                            <div data-step="1">
                                <fieldset style={fs}>
                                    <legend style={lg}>Datos personales</legend>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Nombre</label>
                                            <input
                                                name="nombre"
                                                value={form.nombre}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.nombre && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Apellido</label>
                                            <input
                                                name="apellido"
                                                value={form.apellido}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.apellido && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Género</label>
                                            <select
                                                name="genero"
                                                value={form.genero}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione género</option>
                                                <option>Masculino</option>
                                                <option>Femenino</option>
                                                <option>Otros</option>
                                            </select>
                                            {errors.genero && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                    </div>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Lugar de nacimiento</label>
                                            <select
                                                name="lugarnacimiento"
                                                value={form.lugarnacimiento}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione departamento</option>
                                                {DEPARTAMENTOS_GT.map(d => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                                {hasCustomLugar && (
                                                    <option value={form.lugarnacimiento}>{form.lugarnacimiento}</option>
                                                )}
                                            </select>
                                            {errors.lugarnacimiento && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Fecha de nacimiento</label>
                                            <input
                                                type="date"
                                                name="fechanacimiento"
                                                value={form.fechanacimiento}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.fechanacimiento && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Estado civil</label>
                                            <select
                                                name="estadocivil"
                                                value={form.estadocivil}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione estado civil</option>
                                                <option>Soltero</option>
                                                <option>Casado</option>
                                                <option>Divorciado</option>
                                                <option>Viudo</option>
                                                <option>Union de hecho</option>
                                            </select>
                                            {errors.estadocivil && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset style={fs}>
                                    <legend style={lg}>Identificación</legend>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>DPI</label>
                                            <input
                                                name="dpi"
                                                value={form.dpi}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.dpi && <span style={warn}>{String(errors.dpi)}</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>NIT</label>
                                            <input
                                                name="nit"
                                                value={form.nit}
                                                onChange={handleFieldChange}
                                                disabled={form.isCF}
                                                required={!form.isCF}
                                                style={inputStyle}
                                            />
                                            {errors.nit && <span style={warn}>{String(errors.nit)}</span>}
                                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                                <input
                                                    type="checkbox"
                                                    name="isCF"
                                                    checked={!!form.isCF}
                                                    onChange={handleFieldChange}
                                                />
                                                <span>Consumidor Final (C/F)</span>
                                            </div>
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Número IGSS (opcional)</label>
                                            <input
                                                name="numeroiggs"
                                                value={form.numeroiggs}
                                                onChange={handleFieldChange}
                                                style={inputStyle}
                                            />
                                            {errors.numeroiggs && <span style={warn}>{String(errors.numeroiggs)}</span>}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {/* ===== PASO 2 ===== */}
                        {step === 2 && (
                            <div data-step="2">
                                <fieldset style={fs}>
                                    <legend style={lg}>Contacto</legend>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Tel. residencial (opcional)</label>
                                            <input
                                                name="telefonoresidencial"
                                                value={form.telefonoresidencial}
                                                onChange={handleFieldChange}
                                                style={inputStyle}
                                            />
                                            {errors.telefonoresidencial && (
                                                <span style={warn}>
                                                    {errors.telefonoresidencial === "Debe tener 8 dígitos"
                                                        ? errors.telefonoresidencial
                                                        : "Este campo es obligatorio"}
                                                </span>
                                            )}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Tel. celular</label>
                                            <input
                                                name="telefonocelular"
                                                value={form.telefonocelular}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.telefonocelular && (
                                                <span style={warn}>
                                                    {errors.telefonocelular === "Debe tener 8 dígitos"
                                                        ? errors.telefonocelular
                                                        : "Este campo es obligatorio"}
                                                </span>
                                            )}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Tel. emergencia</label>
                                            <input
                                                name="telefonoemergencia"
                                                value={form.telefonoemergencia}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.telefonoemergencia && (
                                                <span style={warn}>
                                                    {errors.telefonoemergencia === "Debe tener 8 dígitos"
                                                        ? errors.telefonoemergencia
                                                        : "Este campo es obligatorio"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.email && (
                                                <span style={warn}>
                                                    {errors.email === "Correo inválido"
                                                        ? errors.email
                                                        : "Este campo es obligatorio"}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ ...field, gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>Dirección</label>
                                            <input
                                                name="direccion"
                                                value={form.direccion}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.direccion && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset style={fs}>
                                    <legend style={lg}>Cultura & Organización</legend>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Idioma</label>
                                            <select
                                                name="ididioma"
                                                value={form.ididioma}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione idioma</option>
                                                {idiomas.map(it => (
                                                    <option key={getId(it)} value={getId(it)}>
                                                        {getIdiomaLabel(it) ?? `ID ${getId(it)}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.ididioma && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Pueblo / Cultura</label>
                                            <select
                                                name="idpueblocultura"
                                                value={form.idpueblocultura}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione pueblo/cultura</option>
                                                {pueblos.map(p => (
                                                    <option key={getId(p)} value={getId(p)}>
                                                        {getPuebloLabel(p) ?? `ID ${getId(p)}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.idpueblocultura && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Puesto</label>
                                            <select
                                                name="idpuesto"
                                                value={form.idpuesto}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            >
                                                <option value="">Seleccione puesto</option>
                                                {puestos.map(p => (
                                                    <option key={getId(p)} value={getId(p)}>
                                                        {p.nombrepuesto ?? p.nombrePuesto ?? (p.nombre || `ID ${getId(p)}`)}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.idpuesto && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={{ ...field, gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>Equipo</label>
                                            <select
                                                name="idequipo"
                                                value={form.idequipo}
                                                onChange={handleFieldChange}
                                                required
                                                disabled={lockEquipo}
                                                style={{ ...inputStyle, backgroundColor: lockEquipo ? "#f3f4f6" : "#fff" }}
                                                title={
                                                    lockEquipo
                                                        ? "El equipo se determina desde la pestaña de equipos"
                                                        : "Seleccione un equipo"
                                                }
                                            >
                                                <option value="">Seleccione equipo</option>
                                                {equipos.map(e => (
                                                    <option key={getId(e)} value={getId(e)}>
                                                        {getEquipoLabel(e) ?? `ID ${getId(e)}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.idequipo && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        {/* ===== PASO 3 ===== */}
                        {step === 3 && (
                            <div data-step="3">
                                <fieldset style={fs}>
                                    <legend style={lg}>Estado & Formación</legend>
                                    <div style={grid3}>
                                        <div style={field}>
                                            <label style={labelStyle}>Número de hijos</label>
                                            <input
                                                type="number"
                                                name="numerohijos"
                                                value={form.numerohijos}
                                                onChange={handleFieldChange}
                                                min={0}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.numerohijos && (
                                                <span style={warn}>
                                                    {errors.numerohijos === "Valor inválido"
                                                        ? errors.numerohijos
                                                        : "Este campo es obligatorio"}
                                                </span>
                                            )}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Título de nivel medio</label>
                                            <input
                                                name="titulonivelmedio"
                                                value={form.titulonivelmedio}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.titulonivelmedio && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Estudios / Título universitario</label>
                                            <input
                                                name="estudiosuniversitarios"
                                                value={form.estudiosuniversitarios}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.estudiosuniversitarios && (
                                                <span style={warn}>Este campo es obligatorio</span>
                                            )}
                                        </div>
                                        <div style={field}>
                                            <label style={labelStyle}>Fecha de inicio laboral</label>
                                            <input
                                                type="date"
                                                name="iniciolaboral"
                                                value={form.iniciolaboral}
                                                onChange={handleFieldChange}
                                                required
                                                style={inputStyle}
                                            />
                                            {errors.iniciolaboral && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                        <div style={{ ...field, gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>
                                                CV del Colaborador
                                                {!editingId && <span style={{ color: '#dc3545' }}>*</span>}
                                                {editingId && <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'normal' }}> (opcional - para actualizar)</span>}
                                            </label>

                                            {/* Mostrar CV existente si está editando */}
                                            {editingId && cvExistente && (
                                                <div style={{
                                                    marginBottom: "12px",
                                                    padding: "12px",
                                                    backgroundColor: "#f8f9fa",
                                                    border: "1px solid #dee2e6",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between"
                                                }}>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px"
                                                    }}>
                                                        <div style={{
                                                            width: "20px",
                                                            height: "20px",
                                                            backgroundColor: "#dc3545",
                                                            borderRadius: "3px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "white",
                                                            fontSize: "12px",
                                                            fontWeight: "bold"
                                                        }}>
                                                            PDF
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: "600", fontSize: "14px" }}>
                                                                {cvExistente.nombrearchivo || 'CV Actual'}
                                                            </div>
                                                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                                                Subido el {new Date(cvExistente.fechasubida).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={onEliminarCv}
                                                        style={{
                                                            background: "#dc3545",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            padding: "6px 8px",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "4px"
                                                        }}
                                                        title="Eliminar CV actual"
                                                    >
                                                        ✕ Eliminar
                                                    </button>
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                name="cvFile"
                                                accept=".pdf"
                                                onChange={onCvUpload}
                                                required={!editingId && !cvExistente}
                                                style={{
                                                    ...inputStyle,
                                                    padding: "8px 12px"
                                                }}
                                            />
                                            <small style={{
                                                color: "#666",
                                                fontSize: "13px",
                                                display: "block",
                                                marginTop: "4px"
                                            }}>
                                                {editingId
                                                    ? cvExistente
                                                        ? "Selecciona un nuevo CV para reemplazar el actual (Solo PDF, máx. 5MB)"
                                                        : "Sube un CV para este colaborador (Solo PDF, máx. 5MB)"
                                                    : "Sube el CV del colaborador (Solo PDF, máx. 5MB)"
                                                }
                                            </small>
                                            {form.cvFile && (
                                                <div style={{
                                                    marginTop: "8px",
                                                    fontSize: "14px",
                                                    color: "#28a745",
                                                    fontWeight: "600"
                                                }}>
                                                    ✓ Nuevo archivo seleccionado: {form.cvFile.name}
                                                </div>
                                            )}
                                            {errors.cvFile && <span style={warn}>Este campo es obligatorio</span>}
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
                            <button
                                onClick={back}
                                disabled={step === 1}
                                style={{
                                    ...btnGhost,
                                    cursor: step === 1 ? "not-allowed" : "pointer",
                                    opacity: step === 1 ? 0.6 : 1
                                }}
                                type="button"
                            >
                                Atrás
                            </button>
                            {step < 3 ? (
                                <button onClick={next} style={btnNext} type="button">
                                    Siguiente
                                </button>
                            ) : (
                                <button type="submit" style={btnPrimary}>
                                    {editingId ? "Actualizar Colaborador" : "Guardar Colaborador"}
                                </button>
                            )}
                        </div>
                    </form>

                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 15,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer"
                        }}
                        title="Cerrar"
                    >
                        <X size={24} color="#555" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default EmpleadoForm;
