import React, { useState } from "react";
import { X } from "lucide-react";

const PuestoForm = ({ puestoSeleccionado, handleSubmit, onClose }) => {
    const [descripcion, setDescripcion] = useState(puestoSeleccionado?.descripcion || "");
    const [salarioBase, setSalarioBase] = useState(() => {
        // Formatear valor inicial para mostrar siempre con .00
        const valorInicial = puestoSeleccionado?.salariobase || 0;
        return parseFloat(valorInicial).toFixed(2);
    });
    const [isEditing, setIsEditing] = useState(false);

    const formatearSalario = (valor) => {
        // Si está vacío, mostrar 0.00
        if (!valor || valor === '') return '0.00';

        // Remover todo excepto números
        const soloNumeros = valor.replace(/[^0-9]/g, '');

        if (soloNumeros === '') return '0.00';

        // Convertir a centavos y luego a formato decimal
        const centavos = parseInt(soloNumeros);
        const decimal = (centavos / 100).toFixed(2);

        return decimal;
    };

    const handleSalarioChange = e => {
        setIsEditing(true);
        const valor = e.target.value;

        // Si el usuario está borrando todo, permitir campo vacío momentáneamente
        if (valor === '') {
            setSalarioBase('');
            return;
        }

        const salarioFormateado = formatearSalario(valor);
        setSalarioBase(salarioFormateado);
    };

    const handleSalarioFocus = () => {
        setIsEditing(true);
        // Si es el valor por defecto, limpiar para empezar a escribir
        if (salarioBase === '0.00') {
            setSalarioBase('');
        }
    };

    const handleSalarioBlur = () => {
        setIsEditing(false);
        // Si queda vacío al salir del campo, volver a 0.00
        if (salarioBase === '') {
            setSalarioBase('0.00');
        }
    };

    const onSubmit = e => {
        e.preventDefault();
        const idUsuario = Number(sessionStorage.getItem("idUsuario"));
        const payload = {
            nombrepuesto: puestoSeleccionado.nombrepuesto,
            descripcion,
            salariobase: parseFloat(salarioBase),
            estado: puestoSeleccionado.estado,
            idusuario: idUsuario
        };
        handleSubmit(puestoSeleccionado.idpuesto, payload);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "380px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px"
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Asignar Salario</h3>

            <form onSubmit={onSubmit}>
                {/* Nombre del Puesto (solo lectura) */}
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="nombrepuesto" style={{ display: "block", marginBottom: "8px" }}>
                        Nombre del Puesto
                    </label>
                    <input
                        id="nombrepuesto"
                        type="text"
                        value={puestoSeleccionado.nombrepuesto}
                        disabled
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            backgroundColor: "#f8f9fa",
                            color: "#555"
                        }}
                    />
                </div>

                {/* Descripción */}
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="descripcion" style={{ display: "block", marginBottom: "8px" }}>
                        Descripción
                    </label>
                    <input
                        id="descripcion"
                        type="text"
                        value={descripcion}
                        onChange={e => setDescripcion(e.target.value)}
                        maxLength={150}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px"
                        }}
                    />
                </div>

                {/* Salario Base */}
                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="salariobase" style={{ display: "block", marginBottom: "8px" }}>
                        Salario Base (Q)
                    </label>
                    <input
                        id="salariobase"
                        type="text"
                        value={salarioBase}
                        onChange={handleSalarioChange}
                        onFocus={handleSalarioFocus}
                        onBlur={handleSalarioBlur}
                        placeholder="0.00"
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            textAlign: "right" // Alinear números a la derecha como en calculadoras
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    Asignar Salario
                </button>
            </form>

            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                }}
                title="Cerrar"
            >
                <X size={24} color="#555" />
            </button>
        </div>
    );
};

export default PuestoForm;
