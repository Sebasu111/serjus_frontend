// RegistroEnfermedades.jsx
import "./RegistroEnfermedades.css";
import React, { useState } from "react";

export default function RegistroEnfermedades({ empleado, onNext, onBack }) {
    const enfermedades = [
        "Artritis",
        "Asma",
        "Cáncer (diferentes incidencias)",
        "Enfermedad pulmonar obstructiva crónica (EPOC)",
        "Enfermedad de Crohn",
        "Fibrosis quística",
        "Diabetes",
        "Epilepsia",
        "Enfermedades del corazón",
        "Presión arterial alta (hipertensión)",
        "VIH/SIDA",
        "Trastornos del humor (bipolar, ciclotímico o depresión)",
        "Esclerosis múltiple",
        "Mal de Parkinson",
        "Mal de Alzheimer y demencia",
        "Obesidad",
        "Hipertensión pulmonar",
        "Sarcopenia (degeneración muscular)",
        "Lupus eritematoso sistémico",
        "Psoriasis (afecciones de piel)",
        "Osteoporosis",
        "Hipotiroidismo",
        "Hipertiroidismo",
    ];

    const [form, setForm] = useState({});

    return (
        <div className="form-container">
            <h1>REGISTRO DE ENFERMEDADES CRÓNICO Y/O DEGENERATIVAS</h1>

            <div className="row">
                <label>Nombre:</label>
                <input type="text" className="input-line" />
            </div>

            <div className="row multiple">
                <div>
                    <label>Fecha de nacimiento:</label>
                    <input type="date" />
                </div>

                <div>
                    <label>Edad:</label>
                    <input type="number" className="small-input" />
                </div>

                <div className="sexo">
                    <label>Sexo:</label>

                    <label>
                        <input type="checkbox" />
                        Hombre
                    </label>

                    <label>
                        <input type="checkbox" />
                        Mujer
                    </label>
                </div>
            </div>

            <div className="row">
                <label>Fecha de llenado de ficha:</label>
                <input type="date" />
            </div>

            <div className="section">
                <h2>
                    1. Enfermedades: Marque con una X en el cuadro a la izquierda si
                    padece alguna de estas enfermedades
                </h2>

                <table>
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>Tipo de enfermedad</th>
                            <th>Tiempo de padecerla (años)</th>
                            <th>Tratamiento que sigue</th>
                        </tr>
                    </thead>

                    <tbody>
                        {enfermedades.map((enfermedad, index) => (
                            <tr key={index}>
                                <td className="center">
                                    <input type="checkbox" />
                                </td>

                                <td>{enfermedad}</td>

                                <td>
                                    <input type="text" />
                                </td>

                                <td>
                                    <input type="text" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="section">
                <h2>2. Alergias</h2>

                <div className="radio-group">
                    <label>
                        <input type="radio" name="alergias" />
                        Sí
                    </label>

                    <label>
                        <input type="radio" name="alergias" />
                        No
                    </label>
                </div>

                <div className="row">
                    <label>Especificar a qué:</label>
                    <input type="text" className="input-line" />
                </div>
            </div>

            <div className="section">
                <h2>3. Operaciones</h2>

                <div className="radio-group">
                    <label>
                        <input type="radio" name="operaciones" />
                        Sí
                    </label>

                    <label>
                        <input type="radio" name="operaciones" />
                        No
                    </label>
                </div>

                <div className="row">
                    <label>Especificar cuáles:</label>
                    <input type="text" className="input-line" />
                </div>
            </div>

            <div className="section">
                <h2>4. Otras enfermedades</h2>

                <div className="row">
                    <label>Especificar cuáles:</label>
                    <input type="text" className="input-line" />
                </div>

                <div className="radio-group">
                    <label>
                        <input type="radio" name="otras" />
                        Sí
                    </label>

                    <label>
                        <input type="radio" name="otras" />
                        No
                    </label>
                </div>
            </div>

            <div className="boton-container">
                <button
                    className="boton boton-secundario"
                    onClick={onBack}
                >
                    ← Regresar
                </button>

                <button
                    className="boton"
                    onClick={() => onNext(form)}
                >
                    Finalizar
                </button>

            </div>
        </div>
    );
}