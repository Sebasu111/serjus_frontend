import "./RegistroEnfermedades.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/serjus/logo-serjus.png";
import { showToast, showPDFToasts } from "../../utils/toast";
const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

export default function RegistroEnfermedades({ empleado, onNext, onBack }) {
    const [bloqueado, setBloqueado] = useState(false);
    //Documento
    const generarPDF = () => {
        const doc = new jsPDF();

        // 🔹 HEADER AZUL
        doc.setFillColor(0, 102, 153);
        doc.rect(0, 0, 210, 20, "F");

        // 🔹 LOGO IZQUIERDA
        doc.addImage(logo, "PNG", 10, 2, 30, 15);

        // 🔹 TÍTULO
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(
            "REGISTRO DE ENFERMEDADES CRÓNICO Y/O DEGENERATIVAS",
            110,
            12,
            { align: "center" }
        );

        // 🔹 RESET COLOR
        doc.setTextColor(0, 0, 0);

        let y = 25;

        // 🔹 CAJA DATOS
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y, 190, 20, "F");

        doc.setFontSize(10);

        doc.text("Nombre:", 12, y + 7);
        doc.text(empleado?.nombre || "-", 35, y + 7);

        doc.text("Fecha de llenado:", 12, y + 14);
        doc.text(new Date().toLocaleDateString(), 55, y + 14);

        y += 25;

        // 🔥 TABLA ENFERMEDADES
        const body = form.enfermedades.map(e => [
            e.tiene ? "X" : "",
            e.nombre,
            e.tiempo || "-",
            e.tratamiento || "-"
        ]);

        autoTable(doc, {
            startY: y,
            head: [["X", "Tipo de enfermedad", "Tiempo (años)", "Tratamiento"]],
            body,
            styles: {
                fontSize: 8
            },
            headStyles: {
                fillColor: [0, 102, 153],
                textColor: 255
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        y = doc.lastAutoTable.finalY + 10;

        // 🔹 FUNCIÓN CHECKBOX
        const drawCheck = (x, y, checked) => {
            doc.rect(x, y, 4, 4);
            if (checked) {
                doc.line(x, y, x + 4, y + 4);
                doc.line(x + 4, y, x, y + 4);
            }
        };

        // 🔹 FUNCIÓN SECCIÓN BONITA
        const seccion = (titulo, estado, detalle) => {

            // título
            doc.setFontSize(11);
            doc.setTextColor(0, 102, 153);
            doc.text(titulo, 10, y);

            y += 6;

            // checkboxes
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            drawCheck(12, y - 3, estado === true);
            doc.text("Sí", 18, y);

            drawCheck(30, y - 3, estado === false);
            doc.text("No", 36, y);

            y += 8;

            // caja detalle
            doc.setDrawColor(180);
            doc.rect(12, y, 186, 10);

            doc.text(detalle || "-", 14, y + 6);

            y += 15;
        };

        // 🔥 SECCIONES
        seccion("2. Alergias", form.alergias, form.alergias_detalle);
        seccion("3. Operaciones", form.operaciones, form.operaciones_detalle);
        seccion("4. Otras enfermedades", form.otras, form.otras_detalle);

        // 🔹 FOOTER
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

    const subirPDF = async () => {
        try {
            const doc = generarPDF();

            const blob = doc.output("blob");

            const nombreArchivo = `RegistroEnfermedades_${empleado.nombre
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "_")}.pdf`;

            const formData = new FormData();
            formData.append("archivo", blob, nombreArchivo);
            formData.append("nombrearchivo", nombreArchivo);
            formData.append("mimearchivo", "pdf");
            formData.append("fechasubida", new Date().toISOString().split("T")[0]);
            formData.append("estado", true);
            formData.append("idusuario", 1); // ⚠️ AJUSTA
            formData.append("idtipodocumento", 2); // 🔥 TU TIPO
            formData.append("idempleado", empleado.idempleado);

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

        } catch (error) {
            console.error("Error subiendo PDF:", error);
        }
    };

    //Funcionalidades
    const enfermedadesLista = [
        "Artritis",
        "Asma",
        "Cáncer (diferentes incidencias)",
        "Enfermedad pulmonar obstructiva crónica (EPOC)",
        "Enfermedad de Crohn",
        "Fibrosis quística",
        "Diabetes",
        "Epilepsia",
        "Enfermedades del corazón",
        "Presión arterial alta (hipertensión)",
        "VIH/SIDA",
        "Trastornos del humor (bipolar, ciclotímico o depresión)",
        "Esclerosis múltiple",
        "Mal de Parkinson",
        "Mal de Alzheimer y demencia",
        "Obesidad",
        "Hipertensión pulmonar",
        "Sarcopenia (degeneración muscular)",
        "Lupus eritematoso sistémico",
        "Psoriasis (afecciones de piel)",
        "Osteoporosis",
        "Hipotiroidismo",
        "Hipertiroidismo",
    ];

    // 🔥 ESTADO COMPLETO
    const [form, setForm] = useState({
        enfermedades: enfermedadesLista.map(e => ({
            nombre: e,
            tiene: false,
            tiempo: "",
            tratamiento: ""
        })),
        alergias: false,
        alergias_detalle: "",
        operaciones: false,
        operaciones_detalle: "",
        otras: false,
        otras_detalle: ""
    });

    useEffect(() => {
        if (!empleado?.idempleado) return;

        axios.get(`${API}/registro-enfermedades/${empleado.idempleado}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data.mensaje) {
                    setBloqueado(false); // 👈 no hay registro este año
                    return;
                }

                const data = res.data;

                setBloqueado(true); // 🔥 YA EXISTE → bloquear

                const enfermedadesMap = enfermedadesLista.map(nombre => {
                    const encontrada = data.enfermedades.find(e => e.nombre === nombre);

                    return encontrada || {
                        nombre,
                        tiene: false,
                        tiempo: "",
                        tratamiento: ""
                    };
                });

                setForm({
                    enfermedades: enfermedadesMap,
                    alergias: data.alergias,
                    alergias_detalle: data.alergias_detalle,
                    operaciones: data.operaciones,
                    operaciones_detalle: data.operaciones_detalle,
                    otras: data.otras,
                    otras_detalle: data.otras_detalle
                });
            })
            .catch(err => {
                console.error("Error cargando datos:", err);
            });

    }, [empleado]);


    // 🔹 HANDLERS ENFERMEDADES
    const handleCheck = (index) => {
        const copy = [...form.enfermedades];
        copy[index].tiene = !copy[index].tiene;
        setForm({ ...form, enfermedades: copy });
    };

    const handleTiempo = (index, value) => {
        const copy = [...form.enfermedades];
        copy[index].tiempo = value;
        setForm({ ...form, enfermedades: copy });
    };

    const handleTratamiento = (index, value) => {
        const copy = [...form.enfermedades];
        copy[index].tratamiento = value;
        setForm({ ...form, enfermedades: copy });
    };

    // 🔹 HANDLERS GENERALES
    const handleRadio = (campo, valor) => {
        setForm({ ...form, [campo]: valor });
    };

    const handleInput = (campo, valor) => {
        setForm({ ...form, [campo]: valor });
    };

    // 🔥 GUARDAR EN BACKEND
    const guardar = async () => {
        try {

            // 🔹 1. Guardar datos
            await axios.post(
                `${API}/registro-enfermedades/`,
                {
                    idempleado: empleado.idempleado,
                    ...form
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // 🔥 2. GENERAR Y SUBIR PDF
            await subirPDF();

            showToast("Datos guardados", "success");

            if (onNext) onNext(form);

        } catch (e) {
            showToast("Error al guardar los datos", "error");
        }
    };

    return (
        <div className="form-container">
            <h1>REGISTRO DE ENFERMEDADES CRÓNICO Y/O DEGENERATIVAS</h1>

            <div className="row">
                <label>Nombre:</label>
                <input
                    type="text"
                    className="input-line"
                    value={empleado?.nombre || ""}
                    disabled
                />
            </div>

            <div className="section">
                <h2>
                    1. Enfermedades
                </h2>

                <table>
                    <thead>
                        <tr>
                            <th>X</th>
                            <th>Tipo de enfermedad</th>
                            <th>Tiempo (años)</th>
                            <th>Tratamiento</th>
                        </tr>
                    </thead>

                    <tbody>
                        {form.enfermedades.map((e, index) => (
                            <tr key={index}>
                                <td className="center">
                                    <input
                                        type="checkbox"
                                        checked={e.tiene}
                                        disabled={bloqueado}
                                        onChange={() => handleCheck(index)}
                                    />
                                </td>

                                <td>{e.nombre}</td>

                                <td>
                                    <input
                                        type="text"
                                        value={e.tiempo}
                                        disabled={bloqueado}
                                        onChange={(ev) =>
                                            handleTiempo(index, ev.target.value)
                                        }
                                    />
                                </td>

                                <td>
                                    <input
                                        type="text"
                                        value={e.tratamiento}
                                        disabled={bloqueado}
                                        onChange={(ev) =>
                                            handleTratamiento(index, ev.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🔹 ALERGIAS */}
            <div className="section">
                <h2>2. Alergias</h2>

                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            checked={form.alergias === true}
                            disabled={bloqueado}
                            onChange={() => handleRadio("alergias", true)}
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={form.alergias === false}
                            onChange={() => handleRadio("alergias", false)}
                        />
                        No
                    </label>
                </div>

                <div className="row">
                    <label>Especificar:</label>
                    <input
                        type="text"
                        className="input-line"
                        value={form.alergias_detalle}
                        disabled={bloqueado || !form.alergias}
                        onChange={(e) =>
                            handleInput("alergias_detalle", e.target.value)
                        }
                    />
                </div>
            </div>

            {/* 🔹 OPERACIONES */}
            <div className="section">
                <h2>3. Operaciones</h2>

                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            checked={form.operaciones === true}
                            onChange={() => handleRadio("operaciones", true)}
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={form.operaciones === false}
                            onChange={() => handleRadio("operaciones", false)}
                        />
                        No
                    </label>
                </div>

                <div className="row">
                    <label>Especificar:</label>
                    <input
                        type="text"
                        className="input-line"
                        value={form.operaciones_detalle}
                        onChange={(e) =>
                            handleInput("operaciones_detalle", e.target.value)
                        }
                    />
                </div>
            </div>

            {/* 🔹 OTRAS */}
            <div className="section">
                <h2>4. Otras enfermedades</h2>

                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            checked={form.otras === true}
                            onChange={() => handleRadio("otras", true)}
                        />
                        Sí
                    </label>

                    <label>
                        <input
                            type="radio"
                            checked={form.otras === false}
                            onChange={() => handleRadio("otras", false)}
                        />
                        No
                    </label>
                </div>

                <div className="row">
                    <label>Especificar:</label>
                    <input
                        type="text"
                        className="input-line"
                        value={form.otras_detalle}
                        onChange={(e) =>
                            handleInput("otras_detalle", e.target.value)
                        }
                    />
                </div>
            </div>

            <div className="boton-container">
                <button className="boton boton-secundario" onClick={onBack}>
                    ← Regresar
                </button>

                {!bloqueado && (
                    <button className="boton" onClick={guardar}>
                        Guardar
                    </button>
                )}
            </div>
        </div>
    );
}