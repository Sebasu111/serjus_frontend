import { showToast } from "../../utils/toast";
import React, { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import serjusHeader from "../../assets/header-contrato/header-contrato.png";

const ReporteAusenciasPDF = ({ ausencias, onClose, fechaDesde, fechaHasta, tipo }) => {
  useEffect(() => generarPDF(), []);

  const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const partes = fecha.split("-"); // yyyy-mm-dd
  return `${partes[2]}-${partes[1]}-${partes[0]}`; // dd-mm-yyyy
  };

  const generarPDF = () => {
    // 🔔 Notificación de inicio
    showToast("Generando archivo PDF...", "info");

    const doc = new jsPDF("landscape");
    const fechaGen = new Date().toLocaleDateString();
    const total = ausencias.length;

    /* ─────────── ENCABEZADO ─────────── */
    try {
      doc.addImage(serjusHeader, "PNG", 0, 0, 297, 45);
    } catch {}

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor("#000");
    doc.text("REPORTE OFICIAL DE AUSENTISMO LABORAL", 148, 60, { align: "center" });

    /* ─────────── CONTEXTO ─────────── */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#333");

    let contexto = "";
    if (fechaDesde || fechaHasta || tipo) {
      contexto = "Cobertura:";
      if (fechaDesde) contexto += ` desde ${formatearFecha(fechaDesde)}`;
      if (fechaHasta) contexto += ` hasta ${formatearFecha(fechaHasta)}`;

      if (tipo) contexto += ` | Tipo: ${tipo}`;
    }
    if (contexto) doc.text(contexto, 14, 72);

    doc.text(`Total de casos incluidos: ${total}`, 14, 80);

    /* ─────────── MINI TABLA — POR TIPO ─────────── */
    const count = {
      Enfermedad: ausencias.filter(a => a.tipo === "Enfermedad").length,
      Exámenes: ausencias.filter(a => a.tipo === "Exámenes").length,
      Personal: ausencias.filter(a => a.tipo === "Personal" || a.tipo === "Asunto Personal").length,
    };

    const porcentaje = v => total > 0 ? ((v / total) * 100).toFixed(1) + "%" : "0%";

    autoTable(doc, {
      startY: 88,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [35, 55, 90], textColor: "#fff" },
      margin: { left: 10, right: 10 },
      head: [["Tipo de ausencia", "Casos", "Porcentaje"]],
      body: [
        ["Enfermedad", count.Enfermedad, porcentaje(count.Enfermedad)],
        ["Exámenes", count.Exámenes, porcentaje(count.Exámenes)],
        ["Asunto personal", count.Personal, porcentaje(count.Personal)],
      ],
    });

    let y = doc.lastAutoTable.finalY + 12;

    /* ─────────── TABLA DETALLADA ─────────── */
    const columnas = [
      { header: "Colaborador", dataKey: "empleado" },
      { header: "Tipo", dataKey: "tipo" },
      { header: "Diagnóstico", dataKey: "diagnostico" },
      { header: "Días", dataKey: "dias" },
      { header: "Lugar", dataKey: "lugar" },
      { header: "Inicio", dataKey: "inicio" },
      { header: "Fin", dataKey: "fin" },
    ];

    const filas = ausencias.map(a => ({
      empleado: `${a?.empleado?.nombre ?? ""} ${a?.empleado?.apellido ?? ""}`,
      tipo: a.tipo,
      diagnostico: a.diagnostico,
      dias: a.cantidad_dias,
      lugar: a.es_iggs ? "IGGS" : a.otro ?? "No registrado",
      inicio: formatearFecha(a.fechainicio),
      fin: formatearFecha(a.fechafin),

    }));

    autoTable(doc, {
      startY: y,
      columns: columnas,
      body: filas,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 50, 90], textColor: "#fff" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 10, right: 10 },
    });

    /* ─────────── PIE DE PÁGINA ─────────── */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${pages}`, 283, 205, { align: "right" });
      doc.text(`Generado el ${fechaGen}`, 14, 205);
    }

    /* 💾 Guardar archivo */
    doc.save(`Reporte_Ausencias_${fechaGen}.pdf`);

    // ✔ Mostrar success después de guardar
    setTimeout(() => {
      showToast("PDF generado correctamente.", "success");
      onClose();
    }, 300);
  };

  return null; // 👈 Ocultamos overlay completamente
};

export default ReporteAusenciasPDF;
