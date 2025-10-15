import React, { useState } from "react";
import Layout from "../../layouts";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { ToastContainer } from "react-toastify";
import { showToast } from "../../utils/toast.js";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const ContratoEditor = () => {
  const [data, setData] = useState({
    nombreEmpleadora: "Ingrid Fabiola López Castillo",
    edadEmpleadora: "53",
    sexoEmpleadora: "Femenino",
    estadoCivilEmpleadora: "Casada",
    direccionEmpleadora: "Municipio de Coatepeque, Quetzaltenango",
    dpiEmpleadora: "2598 70994 0920",
    nombreEntidad: "Asociación Comunitaria para el Desarrollo, SERJUS (ASERJUS)",
    direccionEntidad: "11 Avenida 12-62 Zona 2, Ciudad Nueva, Guatemala",
    nombreTrabajadora: "MIRIAM",
    edadTrabajadora: "",
    sexoTrabajadora: "",
    estadoCivilTrabajadora: "Soltera",
    direccionTrabajadora: "",
    dpiTrabajadora: "",
    residenciaTrabajadora: "",
    fechaInicio: "……..del….año……",
    puesto: "",
    funciones: "",
    lugarServicios: "",
    salario: "Q……..",
    sueldoOrdinario: "Q……..",
    bonificacion: "Q. 250.00",
    fechaContrato: "………..",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const imprimirContrato = () => {
    showToast("Generando vista de impresión...", "info");
    window.print();
  };

  return (
    <Layout>
      <SEO title="Contrato Individual de Trabajo" />
      <main style={{ background: "#f0f2f5", padding: "40px 20px" }}>
        <style>{`
          @page { margin: 2cm; }

          body, p {
            font-family: 'Arial Narrow', Arial, sans-serif !important;
            font-size: 11.5pt !important;
            line-height: 1 !important;
            margin: 0;
            padding: 0;
          }

          @media print {
            body { 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
            .no-print { display: none !important; }
            #printable {
              font-family: 'Arial Narrow', Arial, sans-serif !important;
              font-size: 11.5pt !important;
              line-height: 1 !important;
              text-align: justify;
              text-justify: inter-word;
            }
            #printable h1 {
              font-family: NimbusRomanNo9L-Regu, 'Times New Roman', serif !important;
              font-size: 14pt !important;
              font-weight: bold !important;
              text-align: center !important;
              margin: 0 0 20px 0 !important;
            }
            #printable p {
              margin: 0 0 8px 0 !important;
            }
            #printable p strong {
              text-decoration: underline !important;
            }
            #printable .no-underline strong {
              text-decoration: none !important;
            }
          }

          #printable {
            font-family: 'Arial Narrow', Arial, sans-serif;
            font-size: 11.5pt;
            line-height: 1;
            color: #000;
            text-align: justify;
            text-justify: inter-word;
          }

          #printable h1 {
            font-family: NimbusRomanNo9L-Regu, 'Times New Roman', serif;
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }

          #printable p {
            margin: 0 0 8px 0;
          }

          #printable p strong {
            text-decoration: underline;
          }

          #printable .no-underline strong {
            text-decoration: none;
          }
        `}</style>

        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "#fff",
            padding: "40px 60px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
            Editor de Contrato Individual de Trabajo
          </h2>

          {/* FORMULARIO */}
          <form className="no-print" style={{ marginBottom: "40px" }}>
            <h3>Datos del Empleador/a</h3>
            <div style={grid}>
              {Object.entries({
                nombreEmpleadora: "Nombre completo de la empleadora",
                edadEmpleadora: "Edad de la empleadora",
                sexoEmpleadora: "Sexo de la empleadora",
                estadoCivilEmpleadora: "Estado civil de la empleadora",
                direccionEmpleadora: "Dirección completa de la empleadora",
                dpiEmpleadora: "Número de DPI de la empleadora",
                nombreEntidad: "Nombre de la entidad empleadora",
                direccionEntidad: "Dirección de la entidad",
              }).map(([k, ph]) => (
                <input
                  key={k}
                  name={k}
                  value={data[k]}
                  onChange={onChange}
                  placeholder={ph}
                  style={input}
                />
              ))}
            </div>

            <h3>Datos de la Trabajador/a</h3>
            <div style={grid}>
              {Object.entries({
                nombreTrabajadora: "Nombre completo de la trabajador/a",
                edadTrabajadora: "Edad de la trabajador/a",
                sexoTrabajadora: "Sexo de la trabajador/a",
                estadoCivilTrabajadora: "Estado civil de la trabajador/a",
                direccionTrabajadora: "Dirección completa de la trabajador/a",
                dpiTrabajadora: "Número de DPI de la trabajador/a",
                residenciaTrabajadora: "Lugar de residencia actual",
              }).map(([k, ph]) => (
                <input
                  key={k}
                  name={k}
                  value={data[k]}
                  onChange={onChange}
                  placeholder={ph}
                  style={input}
                />
              ))}
            </div>

            <h3>Detalles del Contrato</h3>
            <div style={grid}>
              {Object.entries({
                fechaInicio: "Fecha de inicio del contrato (ej. 14 de junio del 2025)",
                puesto: "Puesto que ocupará la trabajadora",
                lugarServicios: "Lugar donde se prestarán los servicios",
                salario: "Salario total mensual",
                sueldoOrdinario: "Monto de sueldo ordinario",
                bonificacion: "Monto de la bonificación",
                fechaContrato: "Fecha de firma del contrato",
              }).map(([k, ph]) => (
                <input
                  key={k}
                  name={k}
                  value={data[k]}
                  onChange={onChange}
                  placeholder={ph}
                  style={input}
                />
              ))}
            </div>

            <textarea
              name="funciones"
              value={data.funciones}
              onChange={onChange}
              placeholder="Funciones principales a realizar"
              style={{ ...input, height: "120px" }}
            />

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button type="button" onClick={imprimirContrato} style={btnPrimary}>
                Imprimir Contrato
              </button>
            </div>
          </form>

          {/* CONTRATO */}
          <div id="printable">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img
                src={serjusHeader}
                alt="SERJUS Asociación Comunitaria para el Desarrollo"
                style={{ maxWidth: "750px" }}
              />
            </div>

            <h1>CONTRATO INDIVIDUAL DE TRABAJO</h1>

            <p className="no-underline">
              <strong>{data.nombreEmpleadora}</strong>, de {data.edadEmpleadora} años de edad, de
              sexo {data.sexoEmpleadora}, {data.estadoCivilEmpleadora}, guatemalteco/a, vecino/a del{" "}
              {data.direccionEmpleadora}, quien se identifica con el Documento Personal de
              Identificación –DPI-, con Código Único de Identificación No. {data.dpiEmpleadora},
              extendido por el Registro Nacional de Personas –RENAP- de la ciudad de Quetzaltenango,
              República de Guatemala, actuando en representación de la entidad{" "}
              <strong>{data.nombreEntidad}</strong>, localizado/a en {data.direccionEntidad} y,{" "}
              <strong>{data.nombreTrabajadora}</strong>, de {data.edadTrabajadora || "……"} años de
              edad, de sexo {data.sexoTrabajadora || "……"}, {data.estadoCivilTrabajadora},
              guatemalteco/a, vecino/a de {data.direccionTrabajadora || "……"}, departamento de …, quien
              se identifica con el Documento Personal de Identificación –DPI-, con Código Único de
              Identificación No. {data.dpiTrabajadora || "……"}, con residencia en{" "}
              {data.residenciaTrabajadora || "……"}, Guatemala. Quienes en lo sucesivo nos
              denominamos EMPLEADOR/A y TRABAJADOR/A respectivamente, consentimos en celebrar el{" "}
              <strong>CONTRATO INDIVIDUAL DE TRABAJO</strong>, contenido en las siguientes cláusulas:
            </p>

            <p><strong>PRIMERA:</strong> La relación de trabajo se desarrollará en el periodo comprendido del {data.fechaInicio}.</p>
            <p><strong>SEGUNDA:</strong> La trabajadora o trabajador ocupará el puesto de {data.puesto}, prestando los servicios siguientes: {data.funciones}</p>
            <p><strong>TERCERA:</strong> Los servicios serán prestados en {data.lugarServicios}.</p>
            <p><strong>CUARTA:</strong> La duración del presente contrato es por tiempo indefinido.</p>
            <p><strong>QUINTA:</strong> La jornada ordinaria de trabajo será Diurna; de 8 horas diarias y de 40 horas a la semana, de lunes a viernes, de 08:00 a 13:00 horas y de 14:00 a 17:00 horas, gozando la trabajadora o trabajador de 1 hora para almorzar.</p>
            <p><strong>SEXTA:</strong> El salario será de {data.salario} mensuales, distribuidos de la siguiente manera: {data.sueldoOrdinario} sueldo ordinario, más {data.bonificacion} de bonificación, el cual será acreditado cada mes en su cuenta personal de Cheques del Banco G&T Continental.</p>
            <p><strong>SÉPTIMA:</strong> En la institución no se trabaja horas extras. Los descansos semanales, días de asueto y, en su caso las normas protectoras de la mujer trabajadora, se otorgarán como lo establecen las leyes laborales de la República de Guatemala.</p>
            <p><strong>OCTAVA:</strong> El Patrono sin responsabilidad alguna de su parte podrá dar por terminado el contrato en caso de evidente negligencia del trabajador o la trabajadora en la prestación de los servicios para los que es contratada o negativa infundada de cumplir con sus obligaciones o por cualquiera de las causas que se indican en el Art. 77 del Código de Trabajo. Si el trabajador o la trabajadora desea dar por terminado el contrato deberá dar aviso por escrito al patrono con quince días de anticipación y presentar un informe del estado en que se encuentran sus obligaciones de acuerdo a la planificación, entregar los materiales, documentos y equipo de oficina asignados, así como dejar liquidados todos los fondos que le fueron facilitados para el desarrollo de sus actividades.</p>

            <p className="no-underline">
              El presente contrato se suscribe en Quetzaltenango, el día {data.fechaContrato}, en dos ejemplares 1 para cada una de las partes. El Registro del Contrato se realizará a través de la plataforma electrónica RECIT dentro de los 15 días siguientes a la suscripción
            </p>

            <div style={{ display: "flex", justifyContent: "space-around", marginTop: "60px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid black", width: "220px", margin: "0 auto" }}></div>
                <p>Firma de la Trabajador/a</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid black", width: "220px", margin: "0 auto" }}></div>
                <p>Firma de la Empleador/a</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ScrollToTop />
      <ToastContainer />
    </Layout>
  );
};

// estilos base
const input = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  width: "100%",
  fontSize: "14px",
};
const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginBottom: "10px",
};
const btnPrimary = {
  background: "#007bff",
  color: "#fff",
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
};

export default ContratoEditor;
