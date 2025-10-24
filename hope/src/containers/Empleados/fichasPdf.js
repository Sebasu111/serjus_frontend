import jsPDF from "jspdf";

/* ========= helpers de catálogos ========= */
const pick = (o, ...keys) => {
    for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = o =>
    pick(
        o,
        "id",
        "ididioma",
        "idIdioma",
        "idequipo",
        "idEquipo",
        "idpueblocultura",
        "idPuebloCultura",
        "idpuesto",
        "idPuesto",
        "pk",
        "codigo"
    );

const getName = (o, type) => {
    if (type === "equipo")
        return (
            pick(
                o,
                "nombreequipo",
                "nombreEquipo", // <- Equipo
                "nombre",
                "descripcion",
                "label"
            ) || ""
        );

    if (type === "idioma") return pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label") || "";

    if (type === "pueblo") return pick(o, "nombrepueblo", "nombrePueblo", "nombre", "descripcion", "label") || "";

    if (type === "puesto") return pick(o, "nombrepuesto", "nombrePuesto", "nombre", "descripcion", "label") || "";

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
    } catch {
        return "";
    }
}

/* === formateadores === */
function pad2(n) {
    return String(n).padStart(2, "0");
}
function formatDMY(input) {
    // Acepta Date o string ISO/fecha común; devuelve DD-MM-YYYY
    if (!input) return "";
    const d = new Date(input);
    if (isNaN(d)) return "";
    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
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
    const L = 8,
        R = 202,
        T = 10,
        B = 287;
    pdf.setLineWidth(0.4);
    pdf.rect(L, T, R - L, B - T);

    if (logoDataUrl) {
        try {
            pdf.addImage(logoDataUrl, "PNG", L + 2, T + 2, 24, 20);
        } catch {}
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13.2);
    pdf.text("FICHA DEL TRABAJADOR / TRABAJADORA", (L + R) / 2, T + 12, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
}

/* ========= tabla dinámica ========= */
function measureRowHeights(pdf, labels, values, tableW, leftW) {
    const baseH = 11.2; // alto mínimo por fila
    const perLine = 4.4; // alto adicional por línea envuelta
    const maxW = tableW - leftW - 6;

    return labels.map((_, i) => {
        const txt = values[i] ? String(values[i]) : "";
        const lines = pdf.splitTextToSize(txt, maxW);
        const needed = Math.max(1, lines.length);
        const boost = i === 9 || i === 16 || i === 17 ? 1 : 0; // Dirección, Fecha inicio, Puesto
        return baseH + (needed - 1 + boost) * perLine;
    });
}

function drawDynamicTable(pdf, labels, values) {
    const L = 8,
        R = 202,
        T = 10;
    const tableX = L + 2;
    const tableY = T + 28;
    const tableW = R - L - 4;
    const leftW = 104; // columna de Nº + etiqueta (más angosta)
    const padX = 2,
        padY = 5;

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
        const maxW = tableW - leftW - padX * 2;
        const lines = values[i] ? pdf.splitTextToSize(String(values[i]), maxW) : [];
        if (lines.length) pdf.text(lines, tableX + leftW + padX, y + padY);

        y += h;
    });

    // línea inferior final
    pdf.line(tableX, y, tableX + tableW, y);

    // ===== Footer mejor distribuido (usa todo el ancho) =====
    const footY = y + 23;
    const leftMargin = 8;
    const rightMargin = 202;
    const label1 = "Lugar y fecha de actualización:";
    const sigLabel = "Firma:";
    const gap = 6; // separación mínima entre texto y línea
    const outerPad = 4; // margen derecho interno del marco

    // Texto izquierda
    pdf.setFont("helvetica", "normal");
    pdf.text(label1, leftMargin + 2, footY);
    const label1W = pdf.getTextWidth(label1);

    // Reservar espacio a la derecha para el bloque de firma
    const sigLabelW = pdf.getTextWidth(sigLabel);
    const sigLineTargetW = 70; // longitud objetivo de la línea de firma
    // x donde empieza el bloque de firma (etiqueta + línea)
    const sigBlockStartX = rightMargin - (sigLabelW + gap + sigLineTargetW + outerPad);

    // Línea de "Lugar y fecha de actualización" (usa todo lo disponible hasta el bloque de firma)
    const lugarFechaLineStart = leftMargin + 2 + label1W + gap;
    const lugarFechaLineEnd = sigBlockStartX - gap;
    if (lugarFechaLineEnd > lugarFechaLineStart) {
        pdf.line(lugarFechaLineStart, footY, lugarFechaLineEnd, footY);
    }

    // Bloque de firma a la derecha (etiqueta + línea larga hasta casi el borde)
    pdf.text(sigLabel, sigBlockStartX, footY);
    const sigLineStart = sigBlockStartX + sigLabelW + gap;
    const sigLineEnd = rightMargin - outerPad;
    pdf.line(sigLineStart, footY, sigLineEnd, footY);
}

/* ========= API principal ========= */
export async function generarFichasPDF(empleados, cat, logoSrc) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!Array.isArray(empleados) || empleados.length === 0) {
                reject(new Error("No hay empleados para generar el PDF"));
                return;
            }

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
                "17 PUESTO"
            ];

            const logoDataUrl = logoSrc ? await urlToDataURL(logoSrc) : null;

            for (let p = 0; p < empleados.length; p++) {
                if (p > 0) pdf.addPage();
                await drawHeader(pdf, logoDataUrl);

                const e = empleados[p];

                // NUEVO: composición de textos con formato requerido
                const nacimiento = [
                    e?.lugarnacimiento || "",
                    e?.fechanacimiento ? `, ${formatDMY(e.fechanacimiento)}` : ""
                ].join("");

                const inicioLaboral = e?.inicioLaboral ? `Guatemala, ${formatDMY(e.inicioLaboral)}` : "";

                const valores = [
                    [e?.nombre, e?.apellido].filter(Boolean).join(" "),
                    nacimiento, // 2) Lugar y fecha de nacimiento (DD-MM-YYYY)
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
                    inicioLaboral, // 16) "Guatemala, DD-MM-YYYY"
                    labelFrom(e?.idpuesto, cat?.puestos, "puesto")
                ];

                drawDynamicTable(pdf, labels, valores);
            }

            // Usar setTimeout para simular el tiempo que toma el procesamiento final y descarga
            setTimeout(() => {
                try {
                    pdf.save("fichas-empleados.pdf");
                    // Resolver la promesa después de un delay más largo para que se vea natural
                    setTimeout(() => {
                        resolve();
                    }, 1500); // 1.5 segundos para simular descarga real
                } catch (error) {
                    reject(error);
                }
            }, 800); // 800ms para permitir que el PDF se procese completamente

        } catch (error) {
            reject(error);
        }
    });
}
