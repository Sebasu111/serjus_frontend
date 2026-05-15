import React, { useState } from "react";
import axios from "axios";
import "./EncuestaMusculoesqueletica.css";
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/serjus/logo-serjus.png";
import { showToast, showPDFToasts } from "../../utils/toast";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const zonas = [
    "CUELLO",
    "HOMBRO",
    "DORSAL / LUMBAR",
    "CODO / ANTEBRAZO",
    "MUÑECA / BRAZO",
    "RODILLA"
];

const EncuestaMusculoesqueletica = ({ empleado, onNext }) => {
    const [puesto, setPuesto] = useState(null);
    const [bloqueado, setBloqueado] = useState(false);
    const [formulario, setFormulario] = useState(null);

    const handlePeso = (value) => {
        // solo números y opcional decimal con punto
        if (/^\d*\.?\d*$/.test(value)) {
            setForm({ ...form, peso: value });
        }
    };

    const handleEstatura = (value) => {
        // permite 1.70 o 1,70 pero solo un separador
        if (/^\d*[.,]?\d*$/.test(value)) {
            setForm({ ...form, estatura: value });
        }
    };

    const drawCheckbox = (doc, x, y, checked) => {
        doc.rect(x, y, 3, 3); // cuadrito
        if (checked) {
            doc.line(x, y, x + 3, y + 3);
            doc.line(x + 3, y, x, y + 3);
        }
    };

    const generarPDF = () => {
        const doc = new jsPDF();

        // 🔹 BARRA AZUL
        doc.setFillColor(0, 102, 153);
        doc.rect(0, 0, 210, 20, "F");

        // 🔹 LOGO (arriba derecha, dentro del header)
        doc.addImage(logo, "PNG", 10, 2, 30, 15);

        // 🔹 TÍTULO
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(
            "ENCUESTA ANUAL DE TRASTORNOS MUSCULOESQUELÉTICOS",
            110,
            12,
            { align: "center" }
        );

        // 🔹 RESET COLOR
        doc.setTextColor(0, 0, 0);

        let y = 30; // 👈 BAJAMOS TODO PARA NO CHOCAR CON HEADER

        // 🔹 DATOS (tipo formulario)
        doc.setDrawColor(200);
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y, 190, 35, "F");

        doc.setFontSize(9);

        let yData = y + 6;

        const datos = [
            ["Nombre", empleado?.nombre],
            ["Fecha nacimiento", formatearFecha(empleado?.fechanacimiento)],
            ["Edad", calcularEdad(empleado?.fechanacimiento)],
            ["Peso", form.peso],
            ["Talla", form.estatura],
            ["Tiempo", calcularTiempo(empleado?.inicioLaboral)],
            ["Cargo", puesto?.nombrepuesto],
        ];

        datos.forEach(([label, value]) => {
            doc.text(`${label}:`, 12, yData);
            doc.text(String(value || "-"), 50, yData);
            yData += 5;
        });

        y += 40;

        // 🔥 TABLA PRINCIPAL
        autoTable(doc, {
            startY: y,
            styles: {
                fontSize: 8,
                halign: "center",
                valign: "middle",
                cellPadding: 2
            },
            headStyles: {
                fillColor: [0, 102, 153],
                textColor: 255,
                fontStyle: "bold"
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { halign: "left", cellWidth: 40 }
            },
            head: [
                ["", ...zonas]
            ],
            body: [
                [
                    "Molestias",
                    ...form.molestias.map(v => v === "Sí" ? "SI" : v === "No" ? "NO" : "-")
                ],
                [
                    "Tiempo",
                    ...form.tiempo.map(v => v || "-")
                ],
                [
                    "Últimos 6 meses",
                    ...form.ultimos6.map(v => v === "Sí" ? "SI" : v === "No" ? "NO" : "-")
                ],
                [
                    "Duración",
                    ...form.duracion.map(v => v || "-")
                ],
                [
                    "Atención médica",
                    ...form.atencion.map(v => v === "Sí" ? "SI" : v === "No" ? "NO" : "-")
                ],
                [
                    "Tratamiento",
                    ...form.tratamiento.map(v => v === "Sí" ? "SI" : v === "No" ? "NO" : "-")
                ]
            ]
        });

        // 🔥 FINAL
        let finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(10);
        doc.text("Dolor de espalda en el año:", 10, finalY);

        finalY += 6;

        [
            "1 vez al año",
            "2 a 3 veces al año",
            "4 a 5 veces al año",
            "Más de 5 veces al año"
        ].forEach(op => {
            doc.text(
                `${form.espalda === op ? "[X]" : "[ ]"} ${op}`,
                12,
                finalY
            );
            finalY += 5;
        });

        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(
            `Generado el ${new Date().toLocaleDateString()}`,
            105,
            290,
            { align: "center" }
        );
        return doc;
    };

    const pdfToBase64 = (doc) => {
        return doc.output("datauristring").split(",")[1];
    };

    const normalizar = (txt) =>
        txt?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // quita acentos
            .replace(/[¿?]/g, "")
            .trim();

    useEffect(() => {
        const cargar = async () => {
            const form = await obtenerFormulario();
            setFormulario(form);
        };

        cargar();
    }, []);

    useEffect(() => {
        const init = async () => {
            if (!empleado?.idempleado || !formulario) return;

            try {
                const res = await axios.get(
                    `${API}/encuesta-completa/${empleado.idempleado}/${formulario.idformulario}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );


                const respuestas = Array.isArray(res.data) ? res.data : [];


                if (respuestas.length > 0) {
                    mapearRespuestas(respuestas);
                    setBloqueado(true);
                }

            } catch (e) {
                console.log("ERROR REAL:", e);
            }
        };

        init();
    }, [empleado, formulario]);

    const formatearFecha = (fecha) => {
        if (!fecha) return "";

        const [anio, mes, dia] = fecha.split("-");
        return `${dia}-${mes}-${anio}`;
    };

    useEffect(() => {
        if (empleado?.idpuesto) {
            axios.get(`${API}/puestos/${empleado.idpuesto}/`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setPuesto(res.data))
                .catch(() => setPuesto(null));
        }
    }, [empleado]);

    useEffect(() => {
        if (empleado?.idempleado) {
            cargarFicha();
        }
    }, [empleado]);

    const [form, setForm] = useState({
        molestias: Array(6).fill(""),
        tiempo: Array(6).fill(""),
        ultimos6: Array(6).fill(""),
        duracion: Array(6).fill(""),
        atencion: Array(6).fill(""),
        tratamiento: Array(6).fill(""),
        espalda: "",
        peso: "",
        estatura: ""
    });

    const calcularEdad = (fecha) => {
        if (!fecha) return "";
        const hoy = new Date();
        const nacimiento = new Date(fecha);

        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();

        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    };

    const calcularTiempo = (fecha) => {
        if (!fecha) return "";

        const hoy = new Date();
        const inicio = new Date(fecha);

        let años = hoy.getFullYear() - inicio.getFullYear();
        let meses = hoy.getMonth() - inicio.getMonth();

        if (meses < 0) {
            años--;
            meses += 12;
        }

        return `${años} años ${meses} meses`;
    };

    const cargarFicha = async () => {
        try {
            const res = await axios.get(
                `${API}/ficha-medica/${empleado.idempleado}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setForm(prev => ({
                ...prev,
                peso: res.data.peso || "",
                estatura: res.data.estatura || ""
            }));

        } catch (e) {
            showToast("Sin Datos Previos", "warning");
        }
    };

    const handle = (campo, i, val) => {
        const copy = [...form[campo]];
        copy[i] = val;
        setForm({ ...form, [campo]: copy });
    };

    // 🔥 1. Obtener formulario
    const obtenerFormulario = async () => {
        const res = await axios.get(`${API}/formularios/`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const lista = res.data.results || res.data;

        const form = lista.find(f => f.titulo === "Encuesta Musculoesquelética");

        return form;
    };

    // 🔥 2. Agrupar por dimensión
    const agruparPorDimension = (preguntas) => {
        const mapa = {};

        preguntas.forEach(p => {
            const dim = p.iddimension?.nombre || "GENERAL";

            if (!mapa[dim]) mapa[dim] = [];

            mapa[dim].push(p);
        });

        return mapa;
    };

    // 🔥 3. Construir respuestas
    const construirRespuestas = (form, preguntasAgrupadas) => {
        const respuestas = [];

        const campos = [
            "molestias",
            "tiempo",
            "ultimos6",
            "duracion",
            "atencion",
            "tratamiento"
        ];

        const zonasKeys = Object.keys(preguntasAgrupadas);

        zonasKeys.forEach((zona, i) => {
            const preguntas = preguntasAgrupadas[zona];

            preguntas.forEach((pregunta, j) => {
                let valor = null;

                if (j < campos.length) {
                    valor = form[campos[j]][i];
                }

                // 🔹 pregunta final (espalda)
                if (pregunta.texto.includes("espalda")) {
                    valor = form.espalda;
                }

                // 🔥 SIEMPRE ENVIAR, aunque esté vacío
                if (pregunta.tipo === "opcion_multiple") {

                    let opcion = pregunta.opciones?.find(
                        o => o.texto === valor
                    );

                    respuestas.push({
                        idpregunta: pregunta.idpregunta,
                        idopcion: opcion ? opcion.idopcion : null,
                        respuesta_texto: null
                    });

                } else {
                    respuestas.push({
                        idpregunta: pregunta.idpregunta,
                        respuesta_texto: valor || "",
                        idopcion: null
                    });
                }
            });
        });

        return respuestas;
    };

    const enviarEncuesta = async () => {
        try {

            if (!form.peso || !form.estatura) {
                showToast("Debe ingresar peso y estatura", "warning");
                return;
            }

            if (!formulario) {
                showToast("No se encontró el formulario de este año", "warning");
                return;
            }

            if (!/^\d+([.,]\d+)?$/.test(form.estatura)) {
                showToast("Estatura inválida (ej: 1.70)", "warning");
                return;
            }

            if (!/^\d+(\.\d+)?$/.test(form.peso)) {
                showToast("Peso inválido (ej: 150.5)", "warning");
                return;
            }

            const preguntasAgrupadas = agruparPorDimension(
                formulario.preguntas
            );

            const respuestas = construirRespuestas(
                form,
                preguntasAgrupadas
            );

            // 🔥 1. Guardar encuesta
            await axios.post(
                `${API}/encuesta-completa/`,
                {
                    idformulario: formulario.idformulario,
                    idempleado: empleado.idempleado,
                    peso: form.peso,
                    estatura: form.estatura,
                    respuestas
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // 🔥 2. Generar PDF
            const doc = generarPDF();
            const blob = doc.output("blob");
            const nombreArchivo = `EncuestaAnual_${empleado.nombre
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_")}.pdf`;

            // 🔥 3. Crear FormData AQUÍ (correcto)
            const formData = new FormData();
            formData.append("archivo", blob, nombreArchivo);
            formData.append("nombrearchivo", nombreArchivo);
            formData.append("mimearchivo", "pdf"); // ✅ corto
            formData.append("fechasubida", new Date().toISOString().split("T")[0]);
            formData.append("estado", true);
            formData.append("idusuario", 1); // ajusta
            formData.append("idtipodocumento", 1);
            formData.append("idempleado", empleado.idempleado);

            // 🔥 4. Enviar archivo REAL
            await axios.post(
                `${API}/documentos/`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            showToast("Datos Guardados", "success");

            if (onNext) onNext(respuestas);

        } catch (error) {
            showPDFToasts.error("Error al guardar los datos");
        }
    };

    const mapearRespuestas = (respuestasBackend) => {

        if (!formulario) return;

        const nuevoForm = {
            molestias: Array(6).fill(""),
            tiempo: Array(6).fill(""),
            ultimos6: Array(6).fill(""),
            duracion: Array(6).fill(""),
            atencion: Array(6).fill(""),
            tratamiento: Array(6).fill(""),
            espalda: "",
            peso: form.peso,
            estatura: form.estatura
        };

        const preguntas = formulario.preguntas;

        // 🔥 agrupar por idpregunta
        const agrupadas = {};

        respuestasBackend.forEach(r => {
            if (!agrupadas[r.idpregunta]) {
                agrupadas[r.idpregunta] = [];
            }
            agrupadas[r.idpregunta].push(r);
        });

        Object.keys(agrupadas).forEach(id => {

            const pregunta = preguntas.find(p => p.idpregunta == id);

            if (!pregunta) return; // 🔥 IMPORTANTE

            const lista = agrupadas[id];

            respuestasBackend.forEach(r => {

                const indexPregunta = preguntas.findIndex(p => p.idpregunta == r.idpregunta);

                if (indexPregunta === -1) return;

                const indexZona = Math.floor(indexPregunta / 6);
                const indexCampo = indexPregunta % 6;

                let valor = "";

                const pregunta = preguntas[indexPregunta];

                if (r.idopcion && pregunta.opciones?.length) {
                    const opcion = pregunta.opciones.find(o => o.idopcion === r.idopcion);
                    if (opcion) valor = opcion.texto;
                } else if (r.respuesta_texto) {
                    valor = r.respuesta_texto;
                }

                const campos = [
                    "molestias",
                    "tiempo",
                    "ultimos6",
                    "duracion",
                    "atencion",
                    "tratamiento"
                ];

                const campo = campos[indexCampo];

                if (campo) {
                    nuevoForm[campo][indexZona] = valor;
                }

                // espalda (pregunta final)
                if ((pregunta?.texto || "").toLowerCase().includes("espalda")) {
                    nuevoForm.espalda = valor;
                }

            });

        });

        setForm(nuevoForm);
    };

    return (
        <div className="encuesta-container">

            <div className="encuesta-titulo">
                Encuesta Anual de Trastornos Musculoesqueléticos
            </div>

            <div className="datos-grid">
                <div className="dato"><b>Nombre:</b> {empleado?.nombre}</div>
                <div className="dato"><b>Fecha de nacimiento:</b> {formatearFecha(empleado?.fechanacimiento)}</div>
                <div className="dato">
                    <b>Edad:</b> {calcularEdad(empleado?.fechanacimiento)}
                </div>
                <div className="dato">
                    <b>Peso (lb):</b>
                    <input
                        disabled={bloqueado}
                        type="text" // 👈 IMPORTANTE (no number)
                        inputMode="decimal" // 👈 teclado numérico en móvil
                        value={form.peso}
                        onChange={(e) => handlePeso(e.target.value)}
                    />
                </div>
                <div className="dato">
                    <b>Estatura(Ej. 1.70)Mts:</b>
                    <input
                        disabled={bloqueado}
                        type="text"
                        inputMode="decimal"
                        value={form.estatura}
                        onChange={(e) => handleEstatura(e.target.value)}
                    />
                </div>
                <div className="dato">
                    <b>Tiempo en el puesto:</b> {calcularTiempo(empleado?.inicioLaboral)}
                </div>
                <div className="dato">
                    <b>Cargo:</b> {puesto?.nombrepuesto}
                </div>
            </div>

            <div className="tabla-container">

                <div className="fila encabezado">
                    <div></div>
                    {zonas.map((z, i) => (
                        <div key={i}>{z}</div>
                    ))}
                </div>

                {/* BLOQUES */}
                {[
                    ["¿Ha tenido molestias en?", "molestias"],
                    ["Si las ha tenido ¿Desde hace cuánto tiempo?", "tiempo"],
                    ["¿Ha tenido molestias en los últimos 6 meses?", "ultimos6"],
                    ["Si tuvo molestias los últimos 6 meses ¿Cuánto tiempo duró dicha molestia?", "duracion"],
                    ["¿Necesitó atención médica para esta molestia?", "atencion"],
                    ["¿Recibió tratamiento médico para esta molestia?", "tratamiento"]
                ].map(([texto, campo], idx) => (
                    <div className="bloque" key={idx}>
                        <div className="fila">
                            <div className="pregunta">{texto}</div>

                            {zonas.map((_, i) => (
                                <div className="celda" key={i}>
                                    {campo === "tiempo" ? (
                                        <input
                                            disabled={bloqueado}
                                            value={form.tiempo[i] || ""}
                                            className="input-text"
                                            onChange={(e) =>
                                                handle(campo, i, e.target.value)
                                            }
                                        />
                                    ) : campo === "duracion" ? (
                                        <select
                                            className="select"
                                            disabled={bloqueado}
                                            value={form.duracion[i] || ""}
                                            onChange={(e) =>
                                                handle(campo, i, e.target.value)
                                            }
                                        >
                                            <option value="">-</option>
                                            <option>1 a 7 días</option>
                                            <option>8 a 30 días</option>
                                            <option>Más de 30 días</option>
                                            <option>Todos los días</option>
                                        </select>
                                    ) : (
                                        <div className="radio-group">
                                            <label>
                                                <input
                                                    type="radio"
                                                    disabled={bloqueado}
                                                    checked={normalizar(form[campo][i] || "") === "si"}
                                                    name={`${campo}${i}`}
                                                    onChange={() =>
                                                        handle(campo, i, "Sí")
                                                    }
                                                /> Sí
                                            </label>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={`${campo}${i}`}
                                                    disabled={bloqueado}
                                                    checked={(form[campo][i] || "") === "No"}
                                                    onChange={() =>
                                                        handle(campo, i, "No")
                                                    }
                                                /> No
                                            </label>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

            </div>

            {/* FINAL */}
            <div className="final">
                <label>
                    ¿Cuántas veces en este año, ha tenido dolor en la espalda específicamente?
                </label>
                <br />
                <select
                    className="select"
                    disabled={bloqueado}
                    value={form.espalda || ""}
                    onChange={(e) =>
                        setForm({ ...form, espalda: e.target.value })
                    }
                >
                    <option value="">Seleccione</option>
                    <option>1 vez al año</option>
                    <option>2 a 3 veces al año</option>
                    <option>4 a 5 veces al año</option>
                    <option>Más de 5 veces al año</option>
                </select>
            </div>

            <div className="boton-container">
                <button
                    className="boton"
                    onClick={() => {
                        if (!bloqueado) {
                            enviarEncuesta(); // guardar
                        } else {
                            onNext && onNext(form); // siguiente
                        }
                    }}
                >
                    {bloqueado ? "Siguiente" : "Guardar encuesta"}
                </button>
            </div>

        </div>
    );
};

export default EncuestaMusculoesqueletica;