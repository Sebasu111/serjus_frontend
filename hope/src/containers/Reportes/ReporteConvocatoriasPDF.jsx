import { showToast } from "../../utils/toast";
import React, { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const ReporteConvocatoriasPDF = ({
  convocatorias,
  postulaciones,
  aspirantes,
  fechaDesde,
  fechaHasta,
  estado,
  onClose,
}) => {
  useEffect(() => generarPDF(), []);

  const generarPDF = () => {
    // 🔔 Notificación de inicio
    showToast("Generando archivo PDF...", "info");

    const doc = new jsPDF("portrait");
    const fechaGen = new Date().toLocaleDateString();

    /* ─────────── ENCABEZADO ─────────── */
    try {
      doc.addImage(serjusHeader, "PNG", 0, 0, 210, 32);
    } catch {}

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(
      "REPORTE OFICIAL DE CONVOCATORIAS LABORALES",
      105,
      46,
      { align: "center" }
    );

    /* ─────────── CONTEXTO ─────────── */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let contexto = "";
    if (fechaDesde) contexto += `Desde ${fechaDesde} `;
    if (fechaHasta) contexto += `Hasta ${fechaHasta} `;
    if (estado) contexto += `| Estado: ${estado === "true" ? "Activas" : "Cerradas"}`;

    if (contexto.trim() !== "") {
      doc.text(`Cobertura: ${contexto.trim()}`, 14, 56);
    }

    let y = 66;

    /* ─────────── BLOQUES POR CONVOCATORIA ─────────── */
    convocatorias.forEach((convocatoria, index) => {
      if (index > 0) {
        doc.addPage();
        y = 30;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor("#021826");
      doc.text(`Convocatoria: ${convocatoria.nombreconvocatoria}`, 14, y);
      y += 6;

      const totalPostulacionesConv = postulaciones.filter(
        (p) => p.idconvocatoria === convocatoria.idconvocatoria
      ).length;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [35, 55, 90], textColor: "#fff" },
        bodyStyles: { fillColor: [248, 248, 248] },
        margin: { left: 10, right: 10 },
        head: [["Campo", "Detalle"]],
        body: [
          ["Puesto", convocatoria.nombrepuesto],
          ["Fecha de inicio", convocatoria.fechainicio],
          ["Fecha de finalización", convocatoria.fechafin],
          ["Descripción", convocatoria.descripcion || "No registrada"],
          ["Total de postulaciones recibidas", totalPostulacionesConv],
        ],
      });

      y = doc.lastAutoTable.finalY + 12;

      /* ─────────── LISTADO DE ASPIRANTES ─────────── */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#021826");
      doc.text("Aspirantes correspondientes a esta convocatoria", 14, y);
      y += 6;

      const postulacionesConv = postulaciones.filter(
        (p) => p.idconvocatoria === convocatoria.idconvocatoria
      );

      const filasAspirantes = postulacionesConv.map((p) => {
        const aspirante = aspirantes.find((a) => a.idaspirante === p.idaspirante);
        return [
          `${aspirante?.nombreaspirante ?? ""} ${aspirante?.apellidoaspirante ?? ""}`,
          aspirante?.email ?? "N/D",
          aspirante?.telefono ?? "N/D",
        ];
      });

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [55, 75, 120], textColor: "#fff" },
        margin: { left: 10, right: 10 },
        head: [["Nombre completo", "Correo electrónico", "Teléfono"]],
        body: filasAspirantes.length > 0
          ? filasAspirantes
          : [["Sin aspirantes registrados", "", ""]],
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    /* ─────────── PIE DE PÁGINA ─────────── */
    const totalPaginas = doc.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${totalPaginas}`, 200, 290, { align: "right" });
      doc.text(`Generado el ${fechaGen}`, 14, 290);
    }

    /* 💾 Guardar PDF */
    doc.save(`Reporte_Convocatorias_${fechaGen}.pdf`);

    /* ✔ Notificación de éxito */
    setTimeout(() => {
      showToast("PDF generado correctamente.", "success");
      onClose();
    }, 300);
  };

  return null;
};

export default ReporteConvocatoriasPDF;
