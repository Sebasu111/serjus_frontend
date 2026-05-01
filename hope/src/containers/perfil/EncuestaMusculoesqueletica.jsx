import React, { useState } from "react";
import "./EncuestaMusculoesqueletica.css";

const zonas = [
    "CUELLO",
    "HOMBRO",
    "DORSAL / LUMBAR",
    "CODO / ANTEBRAZO",
    "MUÑECA / BRAZO",
    "RODILLA"
];

const EncuestaMusculoesqueletica = ({ empleado, onNext }) => {

    const [form, setForm] = useState({
        molestias: Array(6).fill(""),
        tiempo: Array(6).fill(""),
        ultimos6: Array(6).fill(""),
        duracion: Array(6).fill(""),
        atencion: Array(6).fill(""),
        tratamiento: Array(6).fill(""),
        espalda: ""
    });

    const handle = (campo, i, val) => {
        const copy = [...form[campo]];
        copy[i] = val;
        setForm({ ...form, [campo]: copy });
    };

    return (
        <div className="encuesta-container">

            <div className="encuesta-titulo">
                Encuesta Anual de Trastornos Musculoesqueléticos
            </div>

            {/* 📌 DATOS */}
            <div className="datos-grid">
                <div className="dato"><b>Nombre:</b> {empleado?.nombre}</div>
                <div className="dato"><b>Fecha de nacimiento:</b> {empleado?.fechanacimiento}</div>
                <div className="dato"><b>Edad:</b> {empleado?.edad}</div>
                <div className="dato"><b>Peso:</b> {empleado?.peso}</div>
                <div className="dato"><b>Talla:</b> {empleado?.talla}</div>
                <div className="dato"><b>Tiempo en el puesto:</b> {empleado?.tiempo}</div>
                <div className="dato"><b>Cargo:</b> {empleado?.cargo}</div>
            </div>

            <div className="tabla-container">

                {/* 🔹 ENCABEZADO */}
                <div className="fila encabezado">
                    <div></div>
                    {zonas.map((z, i) => (
                        <div key={i}>{z}</div>
                    ))}
                </div>

                {/* 🔹 BLOQUE 1 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">¿Ha tenido molestias en?</div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`m${i}`}
                                            onChange={() => handle("molestias", i, "Si")}
                                        /> Sí
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`m${i}`}
                                            onChange={() => handle("molestias", i, "No")}
                                        /> No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 BLOQUE 2 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">
                            Si las ha tenido ¿Desde hace cuánto tiempo?
                        </div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <input
                                    className="input-text"
                                    type="text"
                                    onChange={(e) =>
                                        handle("tiempo", i, e.target.value)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 BLOQUE 3 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">
                            ¿Ha tenido molestias en los últimos 6 meses?
                        </div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`u${i}`}
                                            onChange={() => handle("ultimos6", i, "Si")}
                                        /> Sí
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`u${i}`}
                                            onChange={() => handle("ultimos6", i, "No")}
                                        /> No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 BLOQUE 4 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">
                            Si tuvo molestias los últimos 6 meses ¿Cuánto tiempo duró dicha molestia?
                        </div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <select
                                    className="select"
                                    onChange={(e) =>
                                        handle("duracion", i, e.target.value)
                                    }
                                >
                                    <option value="">-</option>
                                    <option>1 a 7 días</option>
                                    <option>8 a 30 días</option>
                                    <option>Más de 30 días</option>
                                    <option>Todos los días</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 BLOQUE 5 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">
                            ¿Necesitó atención médica para esta molestia?
                        </div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`a${i}`}
                                            onChange={() => handle("atencion", i, "Si")}
                                        /> Sí
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`a${i}`}
                                            onChange={() => handle("atencion", i, "No")}
                                        /> No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 🔹 BLOQUE 6 */}
                <div className="bloque">
                    <div className="fila">
                        <div className="pregunta">
                            ¿Recibió tratamiento médico para esta molestia?
                        </div>
                        {zonas.map((_, i) => (
                            <div className="celda" key={i}>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`t${i}`}
                                            onChange={() => handle("tratamiento", i, "Si")}
                                        /> Sí
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`t${i}`}
                                            onChange={() => handle("tratamiento", i, "No")}
                                        /> No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 🔹 FINAL */}
            <div className="final">
                <label>
                    ¿Cuántas veces en este año, ha tenido dolor en la espalda específicamente?
                </label>
                <br />
                <select
                    className="select"
                    onChange={(e) =>
                        setForm({ ...form, espalda: e.target.value })
                    }
                >
                    <option value="">Seleccione</option>
                    <option>1 vez al año</option>
                    <option>2 a 3 veces al año</option>
                    <option>4 a 5 veces al año</option>
                    <option>Más de 5 veces al año</option>
                </select>
            </div>

            {/* 🔥 BOTÓN */}
            <div className="boton-container">
                <button className="boton" onClick={() => onNext(form)}>
                    Siguiente
                </button>
            </div>

        </div>
    );
};

export default EncuestaMusculoesqueletica;