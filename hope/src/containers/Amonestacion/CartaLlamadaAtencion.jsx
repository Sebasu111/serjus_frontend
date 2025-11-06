import React, { forwardRef } from "react";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const CartaLlamadaAtencion = forwardRef(({ data }, ref) => {
  return (
    <>
      <style>{`
        @page { margin: 2cm; }

        body, p {
          font-family: 'Arial Narrow', Arial, sans-serif !important;
          font-size: 11.5pt !important;
          line-height: 1.2 !important;
          margin: 0;
          padding: 0;
        }

        #printable {
          font-family: 'Arial Narrow', Arial, sans-serif;
          font-size: 11.5pt;
          line-height: 1.2;
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
          text-transform: uppercase;
        }

        #printable p { margin: 0 0 8px 0; }

        .input-field {
          background-color: rgba(255, 215, 0, 0.6);
          border-bottom: 1px solid #FFD700;
          padding: 0 2px;
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
            line-height: 1.2 !important;
            padding: 0 !important;
          }

          #printable h1 {
            font-size: 14pt !important;
            margin-bottom: 20px !important;
          }

          #printable p { margin: 0 0 8px 0 !important; }

          .input-field {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }

        @media (max-width: 768px) {
          #printable {
            font-size: 10pt !important;
            padding: 0 10px !important;
          }
        }

        @media (max-width: 480px) {
          #printable {
            font-size: 9pt !important;
            padding: 0 5px !important;
          }
        }
      `}</style>

      <div style={{ width: "100%", background: "#fff", padding: "0" }}>
        <div id="printable" ref={ref} style={{ padding: "0 8px" }}>
          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <img
              src={serjusHeader}
              alt="SERJUS Asociación Comunitaria para el Desarrollo"
              style={{ maxWidth: "100%", width: "100%", height: "auto" }}
            />
          </div>

          <h1>
            CARTA DE LLAMADA DE ATENCIÓN{" "}
            {data.tipoCarta === "escrita" ? "ESCRITA" : "VERBAL ESCRITA"} 
            </h1>

          <p style={{ textAlign: "right" }}>
            {data.lugar || "Quetzaltenango"},{" "}
            <span className="input-field">{data.dia || "____"}</span> de{" "}
            <span className="input-field">{data.mes || "_________"}</span> de{" "}
            <span className="input-field">{data.anio || "_____"}</span>
          </p>

          <p>
            Señor(a): <span className="input-field">{data.nombreTrabajador || "________________________"}</span><br />
            Cargo o puesto: <span className="input-field">{data.puesto || "____________________"}</span><br />
            <strong>Presente.</strong>
          </p>

          <p>Reciba un atento y cordial saludo.</p>

          <p>
            Por este medio, se le comunica que, tras la revisión y verificación de sus
            responsabilidades laborales, se ha identificado la siguiente situación:{" "}
            <span className="input-field">{data.descripcionHecho || "_________________________________________"}</span>.
          </p>

          <p>
            Esta situación constituye una falta{" "}
            <span className="input-field">{data.tipoFalta || "__________"}</span>, conforme lo establecido en el
            Reglamento Interior de Trabajo, específicamente en el Artículo número{" "}
            <span className="input-field">{data.articuloReglamento || "___"}</span>, que señala{" "}
            <span className="input-field">{data.descripcionArticuloReglamento || "________________________________"}</span>.
          </p>

          <p>
            Asimismo, el Artículo número{" "}
            <span className="input-field">{data.articuloCodigoTrabajo || "___"}</span> del Código de Trabajo
            establece{" "}
            <span className="input-field">{data.descripcionArticuloCodigoTrabajo || "________________________________"}</span>.
          </p>

          <p>
            Ante ello, se le otorga un plazo de{" "}
            <span className="input-field">{data.plazoDias || "___"}</span> días hábiles a partir de la
            recepción de esta carta, para enmendar la situación descrita, tomando las acciones
            correctivas necesarias. De no observarse mejoras o reincidencias, la institución podrá
            aplicar medidas disciplinarias conforme a la normativa vigente.
          </p>

          <p>
  La presente carta tiene carácter preventivo y correctivo, orientado a fomentar el
  cumplimiento laboral responsable dentro de la institución. Por lo que muy
  respetuosamente se le insta y motiva a mejorar en los aspectos señalados. Esta carta se
  registrará en su expediente como llamada de atención formal,{" "}
  {data.tipoCarta === "verbal_escrita"
    ? "y se enviará copia al Ministerio de Trabajo, sin perjuicio de que se adopten otras medidas en caso de reincidencia."
    : "sin perjuicio de que se adopten otras medidas en caso de reincidencia."}
</p>

          <p style={{ marginTop: "25px" }}>Atentamente,</p>

          {/* Firma del responsable */}
          <div style={{ marginTop: "50px", textAlign: "center" }}>
            <div style={{ borderTop: "1px solid black", width: "220px", margin: "0 auto" }}></div>
            <p>
              <span className="input-field">{data.nombreResponsable || "____________________"}</span>
              <br />
              Cargo: <span className="input-field">{data.cargoResponsable || "____________________"}</span>
              <br />
              Firma:
            </p>
          </div>

          {/* Sección de recibido */}
          <div style={{ marginTop: "60px" }}>
            <p><strong>Recibí copia</strong></p>
            <p>
              Nombre del trabajador(a):{" "}
              <span className="input-field">{data.nombreTrabajador || "____________________"}</span>
              <br />
              Firma: _______________________<br />
              Fecha de recepción: _______________________
            </p>
          </div>
        </div>
      </div>
    </>
  );
});

export default CartaLlamadaAtencion;
