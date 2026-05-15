import React from "react";
import { useState, useEffect } from "react";
import "./EvaluacionPeriodoPruebaAcompañante.css";
import { useEvaluacionPeriodoPruebaAcompañante } from "./useEvaluacionPeriodoPruebaAcompañante";
import { showToast } from "../../utils/toast";

const EvaluacionPeriodoPruebaAcompañante = ({
    evaluacionExistente = null,
}) => {

    const [modo, setModo] = useState("auto");
    const rol = sessionStorage.getItem("idRol");

    useEffect(() => {

        // 🔥 Si viene desde VerEvaluaciones → siempre coord
        if (evaluacionExistente) {
            setModo("coord");
            return;
        }

        // 🔥 Usuario normal
        if (rol === "2") {
            setModo("auto");
        } else {
            setModo("coord");
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
    } = useEvaluacionPeriodoPruebaAcompañante(
        evaluacionExistente
    );

    // 🔥 PAGINACION
    const [paginaActual, setPaginaActual] =
        useState(0);

    // 🔥 paginas = variables + resumen final
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
                    Evaluación de Período de Prueba – Acompañantes
                </h2>

                {/* 🔥 SOLO COORDINADOR */}
                {modo === "coord" && (
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

                                {modo === "auto" && (
                                    <th>Autoevaluación</th>
                                )}

                                {modo === "coord" && (
                                    <th>Coordinador</th>
                                )}

                                <th>Observaciones</th>

                            </tr>
                        </thead>

                        <tbody>

                            <tr className="grupo-row">
                                <td colSpan="5">
                                    {pagina.nombrevariable}
                                </td>
                            </tr>

                            {(pagina.criterios || []).map((criterio) => {

                                const key = criterio.idcriterio;

                                return (
                                    <tr key={key}>

                                        <td>
                                            {criterio.nombrecriterio}
                                        </td>

                                        {/* AUTO */}
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

                                        {/* COORD */}
                                        {modo === "coord" && (
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

                                        {/* OBS */}
                                        <td>
                                            <input
                                                type="text"
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

                {/* RESUMEN FINAL */}
                {esResumen && (
                    <>
                        {/* VALORACIÓN GLOBAL */}
                        <div className="valoracion-box">

                            <h3>5. VALORACIÓN GLOBAL</h3>

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

                            {/* SOLO COORDINADOR */}
                            {modo === "coord" && (
                                <textarea
                                    placeholder="Recomendaciones"
                                    value={empleado.recomendaciones}
                                    onChange={(e) =>
                                        setEmpleado({
                                            ...empleado,
                                            recomendaciones: e.target.value,
                                        })
                                    }
                                />
                            )}

                        </div>

                        {/* DECISION FINAL */}
                        {modo === "coord" && (
                            <div className="decision-box">

                                <h3>Decisión Final</h3>

                                <p>{decisionFinal()}</p>

                                <textarea
                                    placeholder="Justificación..."
                                    value={empleado.justificacion}
                                    onChange={(e) =>
                                        setEmpleado({
                                            ...empleado,
                                            justificacion: e.target.value,
                                        })
                                    }
                                />

                            </div>
                        )}
                    </>
                )}

                {/* PAGINACION */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "15px",
                        marginTop: "25px",
                    }}
                >

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

export default EvaluacionPeriodoPruebaAcompañante;