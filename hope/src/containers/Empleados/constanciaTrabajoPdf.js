import jsPDF from "jspdf";

// 👇 Ajusta estas rutas según tu estructura de carpetas
import lineaSerjus from "../../assets/serjus/linea-serjus.png";
import logoSerjus from "../../assets/serjus/logo-serjus.png";
import tituloSerjus from "../../assets/serjus/titulo-serjus.png";

import articulacion from "../../assets/serjus/articulacion.png";
import asesoria from "../../assets/serjus/asesoria.png";
import cooperacion from "../../assets/serjus/cooperacion.png";
import encuentro from "../../assets/serjus/encuentro.png";
import enlace from "../../assets/serjus/enlace.png";
import formacion from "../../assets/serjus/formacion.png";
import organizacion from "../../assets/serjus/oganizacion.png";

export const generarConstanciaTrabajo = async (
    empleado,
    terminacionData,
    fechaTerminacion
) => {
    try {
        const doc = new jsPDF(); // A4 210 x 297 mm

        // ========= HELPERS =========
        const centerText = (text, y, fontSize = 11) => {
            doc.setFontSize(fontSize);
            const textWidth =
                (doc.getStringUnitWidth(text) * fontSize) / doc.internal.scaleFactor;
            const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
            doc.text(text, textOffset, y);
        };

        const justifyText = (text, x, y, maxWidth, lineHeight = 6) => {
            const lines = doc.splitTextToSize(text, maxWidth);
            lines.forEach((line, index) => {
                doc.text(line, x, y + index * lineHeight);
            });
            return y + lines.length * lineHeight;
        };

        const formatoFechaLarga = (fecha) => {
            if (!fecha) return "";
            return new Date(fecha).toLocaleDateString("es-GT", {
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        };

        // ========= ENCABEZADO GRÁFICO SUPERIOR =========
        try {
            // Logo pequeño a la izquierda
            doc.addImage(logoSerjus, "PNG", 15, 10, 35, 35);

            // Título grande SERJUS en el centro
            doc.addImage(tituloSerjus, "PNG", 65, 12, 120, 30);
        } catch (e) {
            console.warn("No se pudieron cargar algunas imágenes del encabezado:", e);
        }

        // ========= PALABRAS EN LA COLUMNA IZQUIERDA =========
        try {
            const sideX = 18;
            let sideY = 80; // altura inicial

            const sideWidth = 32;
            const sideHeight = 8;
            const gap = 18;

            doc.addImage(enlace, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(organizacion, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(asesoria, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(formacion, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(articulacion, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(cooperacion, "PNG", sideX, sideY, sideWidth, sideHeight);
            sideY += gap;

            doc.addImage(encuentro, "PNG", sideX, sideY, sideWidth, sideHeight);
        } catch (e) {
            console.warn("No se pudieron cargar los iconos de la columna izquierda:", e);
        }

        // ========= TÍTULO "A QUIEN INTERESE" =========
        doc.setFont("helvetica", "bold");
        centerText("A QUIEN INTERESE", 70, 13);

        // ========= CUERPO DEL DOCUMENTO =========
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Dejamos margen izquierdo amplio para no chocar con los iconos
        let currentY = 90;
        const leftMargin = 60;
        const maxWidth = 130;


        // ===== DATOS DEL EMPLEADO USANDO HISTORIAL DE PUESTO SI EXISTE =====
        let historial = null;
        // Buscar el historial que tiene el salario mostrado
        if (Array.isArray(empleado?.historialPuesto) && empleado.historialPuesto.length > 0) {
            const salarioMostrado = empleado?.historialPuesto[empleado.historialPuesto.length - 1]?.salario || empleado?.salario || empleado?.salario_base || empleado?.sueldo;
            historial = empleado.historialPuesto.find(h => String(h.salario) === String(salarioMostrado)) || empleado.historialPuesto[empleado.historialPuesto.length - 1];
        }

        const nombreCompleto =
            `${empleado?.nombre || ""} ${empleado?.apellido || ""}`.trim() ||
            "…………………";

        const dpi = empleado?.dpi || "…………………";

        // Ciudad de expedición SIEMPRE Guatemala
        const ciudadDocumento = "Guatemala";

        // Período laboral: inicio y fin del historial del puesto del salario
        let periodoTexto = "…………………";
        // Buscar variantes de campo para fecha de inicio y fin
        const inicioLaboral = historial?.fechaInicio || historial?.fechainicio || historial?.fecha_ingreso || historial?.fecha_inicio || empleado?.iniciolaboral || empleado?.fecha_ingreso || empleado?.fecha_inicio;
        const finLaboral = fechaTerminacion || historial?.fechaFin || historial?.fechafin || historial?.fecha_baja || empleado?.fechaterminacion || empleado?.fecha_baja;

        if (inicioLaboral && finLaboral) {
            const inicio = formatoFechaLarga(inicioLaboral);
            const fin = formatoFechaLarga(finLaboral);
            periodoTexto = `del ${inicio} al ${fin}`;
        }

        // Nombre del puesto del historial del salario, buscando variantes
        const cargo = historial?.nombrePuesto || historial?.nombre_puesto || historial?.puesto || historial?.cargo || empleado?.puesto || empleado?.cargo || empleado?.puesto_actual?.nombre || "…………………";

        // Salario
        const salario = historial?.salario || empleado?.salario || empleado?.salario_base || empleado?.sueldo || "…………………";

        // ===== PÁRRAFO PRINCIPAL =====
        const parrafo1 =
            `Por este medio se hace CONSTAR que ${nombreCompleto}, ` +
            `quien se identifica con el documento de Identificación Personal número ${dpi}, ` +
            `extendido en la ciudad de ${ciudadDocumento}, por el Registro Nacional de Personas (RENAP), ` +
            `laboró en la Asociación Comunitaria para el desarrollo SERJUS, durante el período ${periodoTexto}, ` +
            `ocupando el cargo de ${cargo}, con un salario mensual de Q ${salario}.`;

        currentY = justifyText(parrafo1, leftMargin, currentY, maxWidth) + 15;

        // ===== PÁRRAFO FINAL (CIUDAD Y FECHA) =====
        const fechaRefObj = fechaTerminacion
            ? new Date(fechaTerminacion)
            : new Date();

        const dia = fechaRefObj.getDate();
        const mesLargo = fechaRefObj.toLocaleDateString("es-GT", { month: "long" });
        const anio = fechaRefObj.getFullYear();

        const ciudadConstancia = "Guatemala";

        const parrafo2 =
            `Y para los usos legales que correspondan, se extiende la presente, ` +
            `en la ciudad de ${ciudadConstancia}, el día ${dia}, mes ${mesLargo}, año ${anio}.`;

        currentY = justifyText(parrafo2, leftMargin, currentY, maxWidth) + 30;

        // ========= FIRMA =========
        const firmaY = currentY + 5;
        doc.setLineWidth(0.3);
        doc.line(70, firmaY, 150, firmaY);

        doc.setFont("helvetica", "normal");
        centerText("Contadora General", firmaY + 8, 11);
        centerText(
            "Asociación Comunitaria para el Desarrollo SERJUS",
            firmaY + 16,
            11
        );

        // ========= DATOS DE OFICINAS ABAJO =========
        doc.setFontSize(8);

        // Columna izquierda: Oficina Central
        let baseY = 250;
        let colLeftX = 18;
        let colRightX = 120;

        doc.setFont("helvetica", "bold");
        doc.text("OFICINA CENTRAL", colLeftX, baseY);
        doc.setFont("helvetica", "normal");
        doc.text("11 avenida 12-62 Zona 2, Ciudad Nueva", colLeftX, baseY + 5);
        doc.text("Guatemala, Guatemala", colLeftX, baseY + 10);
        doc.text(
            "Teléfonos: (502) 22.54.73.57 / (502) 22.11.36.20",
            colLeftX,
            baseY + 15
        );
        doc.text(
            "Correo electrónico: serjus@serjus.org.gt",
            colLeftX,
            baseY + 20
        );

        // Columna derecha: Oficina Quetzaltenango
        doc.setFont("helvetica", "bold");
        doc.text("OFICINA QUETZALTENANGO", colRightX, baseY);
        doc.setFont("helvetica", "normal");
        doc.text("9ª. calle 19-47 Zona 3", colRightX, baseY + 5);
        doc.text("Quetzaltenango, Guatemala", colRightX, baseY + 10);
        doc.text(
            "Teléfonos: (502)77.36.89.86 / (502) 77.67.00.57",
            colRightX,
            baseY + 15
        );
        doc.text(
            "Correo electrónico: secretariaxela@serjus.org.gt",
            colRightX,
            baseY + 20
        );

        centerText("Página web: www.serjus.org.gt", baseY + 30, 8);

        // ========= FRANJA DE COLORES INFERIOR =========
        try {
            // Franja de colores en el pie de página
            doc.addImage(lineaSerjus, "PNG", 0, 287, 210, 10);
        } catch (e) {
            console.warn("No se pudo cargar la franja inferior:", e);
        }

        // ========= NOMBRE DEL ARCHIVO =========
        const nombreParaArchivo =
            nombreCompleto && nombreCompleto !== "…………………"
                ? nombreCompleto.replace(/\s+/g, "_")
                : "Empleado";

        const fechaISO = fechaRefObj.toISOString().split("T")[0];
        const fileName = `Constancia_Trabajo_${nombreParaArchivo}_${fechaISO}.pdf`;

        doc.save(fileName);
        return true;
    } catch (error) {
        console.error("Error al generar PDF:", error);
        throw error;
    }
};
