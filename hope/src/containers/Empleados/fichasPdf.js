import jsPDF from "jspdf";

/* ========= helpers de catálogos ========= */
const pick = (o, ...keys) => { for (const k of keys) if (o && o[k] != null) return o[k]; };
const getId = (o) =>
    pick(
        o,
        "id",
        "ididioma", "idIdioma",
        "idequipo", "idEquipo",
        "idpueblocultura", "idPuebloCultura",
        "pk", "codigo"
    );

const getName = (o, type) => {
    if (type === "equipo")
        return pick(
            o,
            "nombreequipo", "nombreEquipo",   // <- Equipo
            "nombre", "descripcion", "label"
        ) || "";

    if (type === "idioma")
        return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label") || "";

    if (type === "pueblo")
        return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label") || "";

    return pick(o, "nombre", "descripcion", "label") || "";
};

function labelFrom(id, list, type) {
    if (!id) return "";
    const f = (list || []).find(x => String(getId(x)) === String(id));
    return getName(f, type) || "";
}
function edadDesde(fecha) {
    try {
        if (!fecha) return "";
        const hoy = new Date();
        const nac = new Date(fecha);
        if (isNaN(nac)) return "";
        let edad = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
        return String(edad);
    } catch { return ""; }
}

/* ========= utils ========= */
async function urlToDataURL(urlOrImport) {
    const res = await fetch(urlOrImport);
    if (!res.ok) throw new Error(`No se pudo cargar la imagen (${res.status})`);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/* ========= header (marco, logo, título) ========= */
async function drawHeader(pdf, logoDataUrl) {
    const L = 8, R = 202, T = 10, B = 287;
    pdf.setLineWidth(0.4);
    pdf.rect(L, T, R - L, B - T);

    if (logoDataUrl) {
        try { pdf.addImage(logoDataUrl, "PNG", L + 2, T + 2, 24, 20); } catch { }
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13.2);
    pdf.text("FICHA DEL TRABAJADOR / TRABAJADORA", (L + R) / 2, T + 12, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
}

/* ========= tabla dinámica ========= */
function measureRowHeights(pdf, labels, values, tableW, leftW) {
    const baseH = 11.2;   // alto mínimo por fila
    const perLine = 4.4;  // alto adicional por línea envuelta
    const maxW = tableW - leftW - 6;

    return labels.map((_, i) => {
        const txt = values[i] ? String(values[i]) : "";
        const lines = pdf.splitTextToSize(txt, maxW);
        const needed = Math.max(1, lines.length);
        const boost = (i === 9 || i === 16 || i === 17) ? 1 : 0; // Dirección, Fecha inicio, Puesto
        return baseH + (needed - 1 + boost) * perLine;
    });
}

function drawDynamicTable(pdf, labels, values) {
    const L = 8, R = 202, T = 10;
    const tableX = L + 2;
    const tableY = T + 28;
    const tableW = R - L - 4;
    const leftW = 104;          // columna de Nº + etiqueta (más angosta)
    const padX = 2, padY = 5;

    const heights = measureRowHeights(pdf, labels, values, tableW, leftW);
    const totalH = heights.reduce((a, b) => a + b, 0);

    // Marco
    pdf.rect(tableX, tableY, tableW, totalH);
    // Separador vertical
    pdf.line(tableX + leftW, tableY, tableX + leftW, tableY + totalH);

    // Filas
    let y = tableY;
    labels.forEach((lab, i) => {
        const h = heights[i];

        // línea superior de la fila
        pdf.line(tableX, y, tableX + tableW, y);

        // etiqueta
        pdf.setFont("helvetica", "bold");
        pdf.text(lab, tableX + padX, y + padY + 2.8);

        // valor
        pdf.setFont("helvetica", "normal");
        const maxW = tableW - leftW - (padX * 2);
        const lines = values[i] ? pdf.splitTextToSize(String(values[i]), maxW) : [];
        if (lines.length) pdf.text(lines, tableX + leftW + padX, y + padY);

        y += h;
    });

    // línea inferior final
    pdf.line(tableX, y, tableX + tableW, y);

    // Footer
    const footY = y + 23;
    pdf.text("Lugar y fecha de actualización:", 10, footY);
    pdf.line(10 + 62, footY, 100, footY);
    pdf.text("Firma:", 112, footY);
    pdf.line(122, footY, 170, footY);
}

/* ========= API principal ========= */
export async function generarFichasPDF(empleados, cat, logoSrc) {
    if (!Array.isArray(empleados) || empleados.length === 0) return;

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const labels = [
        "1 NOMBRES Y APELLIDOS (COMPLETOS)",
        "2 LUGAR Y FECHA DE NACIMIENTO",
        "3 EDAD",
        "4 ESTADO CIVIL",
        "5 NUMERO DE HIJOS",
        "6 TITULO DE NIVEL MEDIO",
        "6 ESTUDIOS/TITULO UNIVERSITARIO",
        "7 IDIOMA (S)",
        "8 PUEBLO / CULTURA / IDENTIDAD",
        "9 DIRECCION DE RESIDENCIA",
        "10 NUMERO DE TELEFONO RESIDENCIAL",
        "11 NÚMERO DE TELEFONO CELULAR",
        "12 NÚMERO DE TELEFONO EN CASO DE EMERGENCIA",
        "13 NUMERO DE CÓDIGO UNICO DE IDENTIFICACIÓN (CUI)",
        "14 NUMERO DE NIT",
        "15 NUMERO DE AFILIACIÓN IGSS",
        "16 FECHA INICIO DE LA RELACIÓN LABORAL",
        "17 PUESTO",
    ];

    const logoDataUrl = logoSrc ? await urlToDataURL(logoSrc) : null;

    for (let p = 0; p < empleados.length; p++) {
        if (p > 0) pdf.addPage();
        await drawHeader(pdf, logoDataUrl);

        const e = empleados[p];
        const valores = [
            [e?.nombre, e?.apellido].filter(Boolean).join(" "),
            [e?.lugarnacimiento || "", e?.fechanacimiento ? `, ${e.fechanacimiento}` : ""].join(""),
            edadDesde(e?.fechanacimiento),
            e?.estadocivil || "",
            String(e?.numerohijos ?? ""),
            e?.titulonivelmedio || e?.tituloNivelMedio || "",
            e?.estudiosuniversitarios || e?.estudiosUniversitarios || "",
            labelFrom(e?.ididioma, cat?.idiomas, "idioma"),
            labelFrom(e?.idpueblocultura, cat?.pueblos, "pueblo"),
            e?.direccion || "",
            e?.telefonoresidencial || e?.telefonoResidencial || "",
            e?.telefonocelular || e?.telefonoCelular || "",
            e?.telefonoemergencia || e?.telefonoEmergencia || "",
            String(e?.dpi || ""),
            String(e?.nit || ""),
            String(e?.numeroiggs || ""),
            (e?.inicioLaboral ? String(e.inicioLaboral).slice(0, 10) : ""),
            labelFrom(e?.idequipo, cat?.equipos, "equipo"),
        ];

        drawDynamicTable(pdf, labels, valores);
    }

    pdf.save("fichas-empleados.pdf");
}
