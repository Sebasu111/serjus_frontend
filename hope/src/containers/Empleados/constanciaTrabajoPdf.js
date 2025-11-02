import jsPDF from "jspdf";
import 'jspdf/dist/jspdf.es.min.js';

export const generarConstanciaTrabajo = async (empleado, terminacionData, fechaTerminacion) => {
    try {
        const doc = new jsPDF();

        // Configuración de fuentes y colores
        const primaryColor = [33, 47, 71]; // #023047
        const secondaryColor = [33, 158, 188]; // #219ebc
        const textColor = [74, 74, 74];

        // Función auxiliar para centrar texto
        const centerText = (text, y, fontSize = 12) => {
            doc.setFontSize(fontSize);
            const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
            const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
            doc.text(text, textOffset, y);
        };

        // Función auxiliar para texto justificado
        const justifyText = (text, x, y, maxWidth, lineHeight = 6) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line, index) => {
                doc.text(line, x, y + (index * lineHeight));
            });
            return y + (lines.length * lineHeight);
        };

        // Header con logo y título
        doc.setTextColor(...primaryColor);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        centerText("ASOCIACIÓN SERVICIOS JURÍDICOS Y SOCIALES", 30, 20);

        doc.setFontSize(16);
        doc.setFont("helvetica", "normal");
        centerText("ASJERJUS", 40, 16);

        // Línea divisoria
        doc.setDrawColor(...secondaryColor);
        doc.setLineWidth(1);
        doc.line(20, 50, 190, 50);

        // Título del documento
        doc.setTextColor(...primaryColor);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        centerText("CONSTANCIA DE TRABAJO", 70, 18);

        // Contenido principal
        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        let currentY = 90;
        const leftMargin = 25;
        const maxWidth = 160;

        // Párrafo 1
        const parrafo1 = `La infrascrita Coordinadora de Recursos Humanos de la Asociación Servicios Jurídicos y Sociales ASJERJUS, hace constar que:`;
        currentY = justifyText(parrafo1, leftMargin, currentY, maxWidth) + 10;

        // Información del empleado
        doc.setFont("helvetica", "bold");
        doc.text(`${empleado.nombre} ${empleado.apellido}`, leftMargin, currentY);
        doc.setFont("helvetica", "normal");
        currentY += 8;

        doc.text(`DPI: ${empleado.dpi}`, leftMargin, currentY);
        currentY += 15;

        // Párrafo principal
        const parrafoPrincipal = `Trabajó en esta institución desde el ${empleado.iniciolaboral ? new Date(empleado.iniciolaboral).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '[fecha de inicio]'} hasta el ${fechaTerminacion.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}, desempeñando el cargo de [CARGO], con responsabilidad, honradez y eficiencia.`;

        currentY = justifyText(parrafoPrincipal, leftMargin, currentY, maxWidth) + 15;

        // Motivo de terminación
        let motivoTexto = "";
        switch (terminacionData.tipoterminacion) {
            case "Renuncia":
                motivoTexto = "Su relación laboral finalizó por renuncia voluntaria presentada por el trabajador.";
                break;
            case "Despido":
                motivoTexto = "Su relación laboral finalizó por decisión de la institución.";
                break;
            case "Despido Justificado":
                motivoTexto = "Su relación laboral finalizó por despido justificado según las causales establecidas en el Código de Trabajo.";
                break;
            default:
                motivoTexto = "Su relación laboral finalizó según las condiciones establecidas.";
        }

        currentY = justifyText(motivoTexto, leftMargin, currentY, maxWidth) + 15;

        // Párrafo final
        const parrafoFinal = `Se extiende la presente constancia a solicitud del interesado para los usos que estime conveniente.`;
        currentY = justifyText(parrafoFinal, leftMargin, currentY, maxWidth) + 20;

        // Lugar y fecha
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        doc.text(`Guatemala, ${fechaActual}`, leftMargin, currentY + 20);

        // Espacio para firma
        currentY += 50;
        doc.setDrawColor(...textColor);
        doc.line(leftMargin, currentY, leftMargin + 80, currentY);
        doc.setFontSize(10);
        doc.text("Coordinadora de Recursos Humanos", leftMargin, currentY + 8);
        doc.text("ASJERJUS", leftMargin, currentY + 16);

        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        centerText("ASOCIACIÓN SERVICIOS JURÍDICOS Y SOCIALES -ASJERJUS-", 280, 8);
        centerText("Guatemala, Guatemala", 288, 8);

        // Generar nombre del archivo
        const fileName = `Constancia_Trabajo_${empleado.nombre}_${empleado.apellido}_${fechaTerminacion.toISOString().split('T')[0]}.pdf`;

        // Descargar el PDF
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error("Error al generar PDF:", error);
        throw error;
    }
};