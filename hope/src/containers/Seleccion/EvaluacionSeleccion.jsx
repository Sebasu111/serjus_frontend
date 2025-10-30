import React, { useState, forwardRef } from "react";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const criterios = [
  {
    id: 1,
    nombre: "Experiencia laboral en el ámbito del puesto",
    descripcion:
      "Años y tipo de experiencia en funciones similares; vinculación con organizaciones sociales o comunitarias.",
  },
  {
    id: 2,
    nombre: "Formación académica y técnica",
    descripcion:
      "Nivel de estudios, especialización o formación complementaria relacionada con el cargo y los enfoques institucionales.",
  },
  {
    id: 3,
    nombre: "Conocimiento y práctica en enfoque de género",
    descripcion:
      "Manejo de conceptos, metodologías y estrategias de equidad de género; capacidad para aplicarlos en contextos rurales o comunitarios.",
  },
  {
    id: 4,
    nombre: "Discurso incluyente y compromiso con la igualdad",
    descripcion:
      "Su discurso y actitudes reflejan respeto, apertura, lenguaje inclusivo y promoción de la equidad.",
  },
  {
    id: 5,
    nombre: "Experiencia en promover alianzas o trabajo coordinado con otras instituciones",
    descripcion:
      "Participación o promoción en redes, espacios interinstitucionales o alianzas estratégicas.",
  },
  {
    id: 6,
    nombre: "Habilidad para trabajar en equipos diversos",
    descripcion:
      "Capacidad para integrarse, cooperar, respetar diferencias culturales, generacionales, de género y resolución pacífica de conflictos.",
  },
  {
    id: 7,
    nombre: "Competencias técnicas específicas",
    descripcion:
      "Dominio de herramientas, metodologías o áreas propias del cargo (planificación, incidencia, educación popular, etc.).",
  },
  {
    id: 8,
    nombre: "Conocimiento del contexto social y político",
    descripcion:
      "Comprensión de las realidades rurales, indígenas, de mujeres y juventudes, así como de los procesos de desarrollo local.",
  },
  {
    id: 9,
    nombre: "Coherencia con los valores institucionales",
    descripcion:
      "Expresa compromiso con los principios de solidaridad, justicia social, respeto y servicio.",
  },
  {
    id: 10,
    nombre: "Comunicación efectiva",
    descripcion:
      "Capacidad de expresión oral y escrita clara, empática y coherente con el enfoque institucional.",
  },
  {
    id: 11,
    nombre: "Disponibilidad y compromiso",
    descripcion:
      "Disposición para desplazarse al territorio, cumplimiento de horarios y acompañamiento a procesos comunitarios.",
  },
  {
    id: 12,
    nombre: "Adecuación al salario propuesto",
    descripcion:
      "Acepta las condiciones salariales y demuestra motivación no solo económica.",
  },
];

const EvaluacionSeleccion = forwardRef((props, ref) => {
  const [evaluaciones, setEvaluaciones] = useState(
    criterios.map((c) => ({
      criterio: c.nombre,
      puntajes: { p1: "", p2: "", p3: "" },
      observaciones: "",
    }))
  );

  const handleChange = (index, field, value, persona) => {
    const newEval = [...evaluaciones];
    if (field === "observaciones") newEval[index].observaciones = value;
    else newEval[index].puntajes[persona] = Number(value);
    setEvaluaciones(newEval);
  };

  const totalPorPersona = (persona) =>
    evaluaciones.reduce((acc, e) => acc + (Number(e.puntajes[persona]) || 0), 0);

  return (
    <>
      <style>{`
        @page { margin: 2cm; }
        body, p, table, td, th {
          font-family: 'Arial Narrow', Arial, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.2;
          color: #000;
        }
        #printable h1 {
          font-family: NimbusRomanNo9L-Regu, 'Times New Roman', serif;
          font-size: 14pt;
          text-align: center;
          margin: 16px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
          text-align: center;
        }
        input, textarea, select {
          width: 100%;
          font-family: 'Arial Narrow';
          font-size: 10.5pt;
          border: none;
          background-color: rgba(255, 215, 0, 0.3);
          outline: none;
        }
        textarea {
          resize: vertical;
          min-height: 40px;
        }
        @media print {
          input, textarea, select {
            background: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div id="printable" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <img
            src={serjusHeader}
            alt="SERJUS Header"
            style={{ width: "100%", maxWidth: "600px", height: "auto" }}
          />
        </div>

        <h1>Evaluación de Candidatos - Selección de 3 Personas</h1>

        <table>
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Criterio</th>
              <th style={{ width: "35%" }}>Indicadores de Evaluación</th>
              <th>Entrevistado/a Nº 1</th>
              <th>Entrevistado/a Nº 2</th>
              <th>Entrevistado/a Nº 3</th>
              <th>Observaciones / Comentarios</th>
            </tr>
          </thead>
          <tbody>
            {criterios.map((c, index) => (
              <tr key={c.id}>
                <td><strong>{c.nombre}</strong></td>
                <td>{c.descripcion}</td>
                {["p1", "p2", "p3"].map((persona) => (
                  <td key={persona} style={{ textAlign: "center" }}>
                    <select
                      value={evaluaciones[index].puntajes[persona]}
                      onChange={(e) =>
                        handleChange(index, "puntaje", e.target.value, persona)
                      }
                    >
                      <option value="">–</option>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                ))}
                <td>
                  <textarea
                    value={evaluaciones[index].observaciones}
                    onChange={(e) =>
                      handleChange(index, "observaciones", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
            <tr style={{ background: "#f2f2f2", fontWeight: "bold" }}>
              <td colSpan="2" style={{ textAlign: "right" }}>PUNTEO TOTAL:</td>
              <td style={{ textAlign: "center" }}>{totalPorPersona("p1")}</td>
              <td style={{ textAlign: "center" }}>{totalPorPersona("p2")}</td>
              <td style={{ textAlign: "center" }}>{totalPorPersona("p3")}</td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <p><strong>Escala de Evaluación:</strong></p>
        <ul style={{ margin: "4px 0 0 20px", lineHeight: 1.1 }}>
          <li>1 = No cumple el criterio.</li>
          <li>2 = Cumple parcialmente, requiere fortalecimiento.</li>
          <li>3 = Cumple adecuadamente lo básico.</li>
          <li>4 = Cumple satisfactoriamente y con evidencia.</li>
          <li>5 = Cumple plenamente y demuestra compromiso.</li>
        </ul>
      </div>
    </>
  );
});

export default EvaluacionSeleccion;
