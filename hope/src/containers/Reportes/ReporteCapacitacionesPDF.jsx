import { showToast } from "../../utils/toast";
import React, { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const ReporteCapacitacionesPDF = ({
  capacitaciones,
  asistencias,
  empleados,
  fechaDesde,
  fechaHasta,
  estado,
  onClose,
}) => {
  useEffect(() => generarPDF(), []);

  const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const partes = fecha.split("-"); // yyyy-mm-dd
  return `${partes[2]}-${partes[1]}-${partes[0]}`; // dd-mm-yyyy
  };

  const generarPDF = () => {
    // 🔔 Notificación al iniciar
    showToast("Generando archivo PDF...", "info");

    const doc = new jsPDF("portrait");
    const fechaGen = new Date().toLocaleDateString();

    /* ─────────── ENCABEZADO ─────────── */
    try {
      doc.addImage(serjusHeader, "PNG", 0, 0, 210, 32);
    } catch {}

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("REPORTE OFICIAL DE CAPACITACIONES", 105, 46, { align: "center" });

    /* ─────────── CONTEXTO ─────────── */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    let contexto = "";
    if (fechaDesde || fechaHasta || estado) {
      contexto = "Cobertura:";
      if (fechaDesde) contexto += ` desde ${formatearFecha(fechaDesde)}`;
      if (fechaHasta) contexto += ` hasta ${formatearFecha(fechaHasta)}`;
      if (estado) contexto += ` | Estado: ${estado === "true" ? "Activas" : "Finalizado"}`;
    }
    if (contexto) doc.text(contexto, 14, 56);

    let y = 66;

    /* ─────────── POR CADA CAPACITACIÓN ─────────── */
    capacitaciones.forEach((c, index) => {
      if (index > 0) {
        doc.addPage();
        y = 30;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor("#021826");
      doc.text(`Capacitación: ${c.nombreevento}`, 14, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [35, 55, 90], textColor: "#fff" },
        margin: { left: 10, right: 10 },
        head: [["Detalle", "Datos"]],
        body: [
          ["Institución facilitadora", c.institucionfacilitadora],
          ["Lugar", c.lugar],
          ["Fecha de inicio", formatearFecha(c.fechainicio)],
          ["Fecha de fin", formatearFecha(c.fechafin)],
          ["Monto ejecutado", `Q. ${c.montoejecutado}`],
          ["Observación", c.observacion || "No registrada"],
        ],
      });

      y = doc.lastAutoTable.finalY + 6;

      /* ─────────── RESUMEN ASISTENCIA ─────────── */
      const asignados = asistencias.filter(a => a.idcapacitacion === c.idcapacitacion);
      const asistieron = asignados.filter(a => a.asistencia === "si").length;
      const porcentaje = asignados.length > 0 ? ((asistieron / asignados.length) * 100).toFixed(1) : 0;

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [55, 75, 120], textColor: "#fff" },
        margin: { left: 10, right: 10 },
        head: [["Participantes asignados", "Sí asistieron", "% asistencia"]],
        body: [[asignados.length, asistieron, `${porcentaje}%`]],
      });

      y = doc.lastAutoTable.finalY + 10;

      /* ─────────── LISTADO DE PARTICIPANTES ─────────── */
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor("#021826");
      doc.text("Listado de participantes", 14, y);
      y += 4;

      const filas = asignados.map((a) => {
        const emp = empleados.find((e) => e.idempleado === a.idempleado);
        return [
          `${emp?.nombre ?? ""} ${emp?.apellido ?? ""}`,
          emp?.email ?? "N/D",
          emp?.telefonocelular ?? "N/D",
          a.asistencia === "si" ? "Asistió" : "No asistió",
        ];
      });

      autoTable(doc, {
        startY: y,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [35, 55, 90], textColor: "#fff" },
        margin: { left: 10, right: 10 },
        head: [["Nombre", "Correo", "Teléfono", "Asistencia"]],
        body: filas.length > 0 ? filas : [["Sin participantes registrados", "", "", ""]],
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            if (data.cell.text[0] === "Asistió") data.cell.styles.textColor = [5, 115, 27];
            if (data.cell.text[0] === "No asistió") data.cell.styles.textColor = [185, 0, 0];
          }
        },
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    /* ─────────── PIE DE PÁGINA ─────────── */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pages}`, 200, 290, { align: "right" });
      doc.text(`Generado el ${fechaGen}`, 14, 290);
    }

    /* 💾 Guardar PDF */
    doc.save(`Reporte_Capacitaciones_${fechaGen}.pdf`);

    /* ✔ Notificación de éxito */
    setTimeout(() => {
      showToast("PDF generado correctamente.", "success");
      onClose();
    }, 300);
  };

  // ❗ Quitar overlay y texto de "Generando PDF"
  return null;
};

export default ReporteCapacitacionesPDF;
