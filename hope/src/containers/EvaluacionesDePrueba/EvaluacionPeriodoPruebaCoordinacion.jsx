import React, { useState, useEffect } from "react";
import "./EvaluacionPeriodoPruebaCoordinacion.css";
import { useEvaluacionPeriodoPruebaCoordinacion } from "./useEvaluacionPeriodoPruebaCoordinacion";

const EvaluacionPeriodoPruebaCoordinacion = ({
    evaluacionExistente = null,
}) => {

    const [modo, setModo] = useState("auto");
    const rol = sessionStorage.getItem("idRol");

    useEffect(() => {

        // 🔥 Si viene desde evaluaciones pendientes
        if (evaluacionExistente) {
            setModo("admin");
            return;
        }

        // 🔥 Coordinador = autoevaluación
        if (rol === "1") {
            setModo("auto");
        } else {
            setModo("admin");
        }

    }, [rol, evaluacionExistente]);

    const {
        empleado,
        setEmpleado,
        evaluacion,
        handleChange,
        calcularTotal,
        decisionFinal,
        guardarEvaluacion,
        variables
    } = useEvaluacionPeriodoPruebaCoordinacion(
        evaluacionExistente
    );

    // 🔥 PAGINACIÓN
    const [paginaActual, setPaginaActual] =
        useState(0);

    // 🔥 Variables + resumen
    const paginas = [
        ...(variables || []),
        { tipo: "resumen" }
    ];

    const pagina = paginas[paginaActual];

    const esResumen =
        pagina?.tipo === "resumen";

    return (
        <div className="page-container">
            <div className="card-container">

                <h2 className="title">
                    Evaluación de Período de Prueba – Coordinaciones
                </h2>

                {/* 🔥 SOLO ADMIN */}
                {modo === "admin" && (
                    <div className="info-grid">

                        <input
                            type="text"
                            placeholder="Nombre"
                            value={empleado.nombre}
                            onChange={(e) =>
                                setEmpleado({
                                    ...empleado,
                                    nombre: e.target.value
                                })
                            }
                        />

                    </div>
                )}

                {/* ESCALA */}
                {!esResumen && (
                    <div className="escala-box">

                        <p>
                            <strong>Escala de Calificación:</strong>
                        </p>

                        <div className="escala-row">
                            <span>1 = Deficiente</span>
                            <span>2 = En proceso</span>
                            <span>3 = Adecuado</span>
                            <span>4 = Sobresaliente</span>
                        </div>

                    </div>
                )}

                {/* TABLA */}
                {!esResumen && (
                    <table className="tabla-evaluacion">

                        <thead>
                            <tr>

                                <th>Variable</th>

                                {/* AUTO */}
                                {modo === "auto" && (
                                    <th>Autoevaluación</th>
                                )}

                                {/* ADMIN */}
                                {modo === "admin" && (
                                    <th>Evaluación Admin</th>
                                )}

                                <th>Observaciones</th>

                            </tr>
                        </thead>

                        <tbody>

                            {/* VARIABLE */}
                            <tr className="grupo-row">
                                <td colSpan="5">
                                    {pagina.nombrevariable}
                                </td>
                            </tr>

                            {/* CRITERIOS */}
                            {(pagina.criterios || []).map((criterio) => {

                                const key =
                                    criterio.idcriterio;

                                return (
                                    <tr key={key}>

                                        <td>
                                            {criterio.nombrecriterio}
                                        </td>

                                        {/* AUTOEVALUACIÓN */}
                                        {modo === "auto" && (
                                            <td>
                                                <select
                                                    value={
                                                        evaluacion[key]?.auto || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            key,
                                                            "auto",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        -
                                                    </option>

                                                    {[1, 2, 3, 4].map((n) => (
                                                        <option
                                                            key={n}
                                                            value={n}
                                                        >
                                                            {n}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}

                                        {/* ADMIN */}
                                        {modo === "admin" && (
                                            <td>
                                                <select
                                                    value={
                                                        evaluacion[key]?.coord || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleChange(
                                                            key,
                                                            "coord",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        -
                                                    </option>

                                                    {[1, 2, 3, 4].map((n) => (
                                                        <option
                                                            key={n}
                                                            value={n}
                                                        >
                                                            {n}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}

                                        {/* OBSERVACIONES */}
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Observaciones..."
                                                value={
                                                    evaluacion[key]?.obs || ""
                                                }
                                                onChange={(e) =>
                                                    handleChange(
                                                        key,
                                                        "obs",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>
                    </table>
                )}

                {/* RESUMEN */}
                {esResumen && (
                    <>
                        {/* VALORACIÓN GLOBAL */}
                        <div className="valoracion-box">

                            <h3>
                                6. VALORACIÓN GLOBAL
                            </h3>

                            <textarea
                                placeholder="Fortalezas"
                                value={empleado.fortalezas}
                                onChange={(e) =>
                                    setEmpleado({
                                        ...empleado,
                                        fortalezas: e.target.value,
                                    })
                                }
                            />

                            <textarea
                                placeholder="Aspectos a mejorar"
                                value={empleado.mejoras}
                                onChange={(e) =>
                                    setEmpleado({
                                        ...empleado,
                                        mejoras: e.target.value,
                                    })
                                }
                            />

                            {/* SOLO ADMIN */}
                            {modo === "admin" && (
                                <textarea
                                    placeholder="Recomendaciones"
                                    value={empleado.recomendaciones}
                                    onChange={(e) =>
                                        setEmpleado({
                                            ...empleado,
                                            recomendaciones:
                                                e.target.value,
                                        })
                                    }
                                />
                            )}

                        </div>

                        {/* DECISIÓN FINAL */}
                        {modo === "admin" && (
                            <div className="decision-box">

                                <h3>
                                    Decisión Final
                                </h3>

                                <p>
                                    {decisionFinal()}
                                </p>

                                <textarea
                                    placeholder="Justificación..."
                                    value={empleado.justificacion}
                                    onChange={(e) =>
                                        setEmpleado({
                                            ...empleado,
                                            justificacion:
                                                e.target.value,
                                        })
                                    }
                                />

                            </div>
                        )}
                    </>
                )}

                {/* PAGINACIÓN */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        marginTop: "25px",
                    }}
                >

                    {/* ANTERIOR */}
                    <button
                        disabled={paginaActual === 0}
                        onClick={() =>
                            setPaginaActual(
                                paginaActual - 1
                            )
                        }
                        style={btnPager}
                    >
                        ⬅ Anterior
                    </button>

                    <span>
                        Página {paginaActual + 1} de{" "}
                        {paginas.length}
                    </span>

                    {/* GUARDAR */}
                    {paginaActual === paginas.length - 1 ? (

                        <button
                            onClick={guardarEvaluacion}
                            style={{
                                background: "#023047",
                                color: "white",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: "pointer"
                            }}
                        >
                            Guardar Evaluación
                        </button>

                    ) : (

                        <button
                            onClick={() =>
                                setPaginaActual(
                                    paginaActual + 1
                                )
                            }
                            style={btnPager}
                        >
                            Siguiente ➡
                        </button>

                    )}

                </div>

                {/* TOTAL */}
                <div
                    style={{
                        marginTop: "20px",
                        fontWeight: "700",
                        fontSize: "18px",
                    }}
                >
                    Total: {calcularTotal()}
                </div>

            </div>
        </div>
    );
};

const btnPager = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#023047",
    color: "white",
    cursor: "pointer",
};

export default EvaluacionPeriodoPruebaCoordinacion;