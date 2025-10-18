import React, { useRef, forwardRef   } from "react";
import Layout from "../../layouts";
import ScrollToTop from "../../components/scroll-to-top";
import { ToastContainer } from "react-toastify";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";


const ContratoEditor = forwardRef(({ data }, ref) => {
  return (
    <Layout>
      <main style={{ background: "#f0f2f5", padding: "40px 20px" }}>
        {/* Estilos para impresión */}
        <style>{`
          @page { margin: 2cm; }
          body, p { font-family: 'Arial Narrow', Arial, sans-serif !important; font-size: 11.5pt !important; line-height: 1 !important; margin: 0; padding: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            #printable { font-family: 'Arial Narrow', Arial, sans-serif !important; font-size: 11.5pt !important; line-height: 1 !important; text-align: justify; text-justify: inter-word; }
            #printable h1 { font-family: NimbusRomanNo9L-Regu, 'Times New Roman', serif !important; font-size: 14pt !important; font-weight: bold !important; text-align: center !important; margin: 0 0 20px 0 !important; }
            #printable p { margin: 0 0 8px 0 !important; }
            #printable p strong { text-decoration: underline !important; }
            #printable .no-underline strong { text-decoration: none !important; }
            .input-field { background: transparent !important; }
          }
          #printable { font-family: 'Arial Narrow', Arial, sans-serif; font-size: 11.5pt; line-height: 1; color: #000; text-align: justify; text-justify: inter-word; }
          #printable h1 { font-family: NimbusRomanNo9L-Regu, 'Times New Roman', serif; font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
          #printable p { margin: 0 0 8px 0; }
          #printable p strong { text-decoration: underline; }
          #printable .no-underline strong { text-decoration: none; }

           .input-field {
              background-color: rgba(200,200,200,0.3);
              border-bottom: 1px solid #999;
              padding: 0 2px;
            }
        `}</style>

        <div style={{ maxWidth: "1000px", margin: "0 auto", background: "#fff", padding: "40px 60px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Vista</h2>

          {/* Contrato */}
          <div id="printable" ref={ref}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <img src={serjusHeader} alt="SERJUS Asociación Comunitaria para el Desarrollo" style={{ maxWidth: "750px" }} />
            </div>

            <h1>CONTRATO INDIVIDUAL DE TRABAJO</h1>
            <p className="no-underline">
              <strong><span className="input-field">{data.nombreEmpleadora}</span></strong>, de <span className="input-field"> {data.edadEmpleadora} </span> años de edad, de sexo <span className="input-field"> {data.sexoEmpleadora} </span>, <span className="input-field"> {data.estadoCivilEmpleadora}</span>, guatemalteco/a, vecino/a del <span className="input-field"> {data.direccionEmpleadora}</span>, quien se identifica con el Documento Personal de Identificación –DPI-, con Código Único de Identificación No. <span className="input-field"> {data.dpiEmpleadora}</span>, extendido por el Registro Nacional de Personas –RENAP- de la ciudad de Quetzaltenango, República de Guatemala, actuando en representación de la entidad  Asociación Comunitaria para el Desarrollo, SERJUS, de siglas ASERJUS, localizado en localizada en 11 Avenida 12-62 Zona 2, Ciudad Nueva, Guatemala y, <strong><span className="input-field"> {data.nombreTrabajadora}</span></strong>, de <span className="input-field">{data.edadTrabajadora || "……"}</span> años de edad, de sexo <span className="input-field">{data.sexoTrabajadora || "……"}</span>, <span className="input-field">{data.estadoCivilTrabajadora}</span>, guatemalteco/a, vecino/a de <span className="input-field">{data.direccionTrabajadora || "……"}</span>, departamento de <span className="input-field">{data.departamentoTrabajadora || "……"}</span>, quien se identifica con el Documento Personal de Identificación –DPI-, con Código Único de Identificación No. <span className="input-field">{data.dpiTrabajadora || "……"}</span>, con residencia en <span className="input-field">{data.residenciaTrabajadora || "……"}</span>, Guatemala. Quienes en lo sucesivo nos denominamos EMPLEADOR/A y TRABAJADOR/A respectivamente, consentimos en celebrar el <strong>CONTRATO INDIVIDUAL DE TRABAJO</strong>, contenido en las siguientes cláusulas:
            </p>

            <p><strong>PRIMERA:</strong> La relación de trabajo se desarrollará en el periodo comprendido del <span className="input-field">{data.fechaInicio}</span>.</p>
            <p><strong>SEGUNDA:</strong> La trabajadora o trabajador ocupará el puesto de <span className="input-field">{data.puesto}</span>, prestando los servicios siguientes: <span className="input-field">{data.funciones}</span></p>
            <p><strong>TERCERA:</strong> Los servicios serán prestados en <span className="input-field">{data.lugarServicios}</span>.</p>
            <p><strong>CUARTA:</strong> La duración del presente contrato es por tiempo indefinido.</p>
            <p><strong>QUINTA:</strong> La jornada ordinaria de trabajo será Diurna; de 8 horas diarias y de 40 horas a la semana, de lunes a viernes, de 08:00 a 13:00 horas y de 14:00 a 17:00 horas, gozando la trabajadora o trabajador de 1 hora para almorzar.</p>
            <p><strong>SEXTA:</strong> El salario será de <span className="input-field">{data.salario}</span> mensuales, distribuidos de la siguiente manera: <span className="input-field">{data.sueldoOrdinario}</span> sueldo ordinario, más <span className="input-field">{data.bonificacion}</span> de bonificación, el cual será acreditado cada mes en su cuenta personal de <span className="input-field">{data.banco}</span>.</p>
            <p><strong>SÉPTIMA:</strong> En la institución no se trabaja horas extras. Los descansos semanales, días de asueto y, en su caso las normas protectoras de la mujer trabajadora, se otorgarán como lo establecen las leyes laborales de la República de Guatemala.</p>
            <p><strong>OCTAVA:</strong> El Patrono sin responsabilidad alguna de su parte podrá dar por terminado el contrato en caso de evidente negligencia del trabajador o la trabajadora en la prestación de los servicios para los que es contratada o negativa infundada de cumplir con sus obligaciones o por cualquiera de las causas que se indican en el Art. 77 del Código de Trabajo. Si el trabajador o la trabajadora desea dar por terminado el contrato deberá dar aviso por escrito al patrono con quince días de anticipación y presentar un informe del estado en que se encuentran sus obligaciones de acuerdo a la planificación, entregar los materiales, documentos y equipo de oficina asignados, así como dejar liquidados todos los fondos que le fueron facilitados para el desarrollo de sus actividades.</p>

            <p className="no-underline">
              El presente contrato se suscribe en Quetzaltenango, el día <span className="input-field">{data.fechaContrato}</span>, en dos ejemplares 1 para cada una de las partes. El Registro del Contrato se realizará a través de la plataforma electrónica RECIT dentro de los 15 días siguientes a la suscripción
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
});

export default ContratoEditor;
