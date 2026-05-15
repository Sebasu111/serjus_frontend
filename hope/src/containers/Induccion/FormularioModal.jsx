import React, { useState, useEffect } from "react";
import styles from "./FormularioModal.styles";
import axios from "axios";
import { showToast } from "../../utils/toast";
const API2 = process.env.REACT_APP_API_URL;
const API = `${API2}/inducciones/`;
const token = sessionStorage.getItem("token");

const FormularioModal = ({ visible, onClose, formularios, induccion, formularioPrecargado }) => {
    const [formularioSeleccionado, setFormularioSeleccionado] = useState(null);
    const [titulo, setTitulo] = useState("");
    const [preguntas, setPreguntas] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [openSelect, setOpenSelect] = useState(false);

    const formulariosFiltrados = formularios
        .filter(f => f.tipo !== "medico") // 🔥 aquí
        .filter(f =>
            f.titulo.toLowerCase().includes(busqueda.toLowerCase())
        );

    useEffect(() => {
        if (formularioPrecargado) {
            setFormularioSeleccionado(formularioPrecargado);
            setBusqueda(formularioPrecargado.titulo);
        }
    }, [formularioPrecargado]);

    useEffect(() => {
        if (induccion?.formularioAsignado && formularios.length > 0) {
            const encontrado = formularios.find(
                f => f.idformulario === induccion.formularioAsignado
            );

            if (encontrado) {
                setFormularioSeleccionado(encontrado);
                setBusqueda(encontrado.titulo);
            }
        }
    }, [induccion, formularios]);

    const moverPregunta = (from, to) => {
        const nuevas = [...preguntas];
        const item = nuevas.splice(from, 1)[0];
        nuevas.splice(to, 0, item);
        setPreguntas(nuevas);
    };

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (index) => {
        if (dragIndex === null) return;
        moverPregunta(dragIndex, index);
        setDragIndex(null);
    };

    useEffect(() => {
        if (formularioSeleccionado) {
            setTitulo(formularioSeleccionado.titulo);
            setPreguntas(
                (formularioSeleccionado.preguntas || []).map(p => ({
                    texto: p.texto || "",
                    tipo: p.tipo || "abierta",
                    opciones:
                        p.tipo === "opcion_multiple"
                            ? (p.opciones || []).map(o => ({
                                texto: o.texto || ""
                            }))
                            : []
                }))
            );
        } else {
            setTitulo("");
            setPreguntas([]);
        }
    }, [formularioSeleccionado]);

    const agregarPregunta = (tipo = "abierta") => {
        setPreguntas([
            ...preguntas,
            tipo === "abierta"
                ? { texto: "", tipo: "abierta" }
                : { texto: "", tipo: "opcion_multiple", opciones: [{ texto: "" }, { texto: "" }] }
        ]);
    };

    const actualizarPregunta = (index, valor) => {
        const nuevas = [...preguntas];
        nuevas[index].texto = valor;
        setPreguntas(nuevas);
    };

    const eliminarPregunta = (index) => {
        const nuevas = preguntas.filter((_, i) => i !== index);
        setPreguntas(nuevas);
    };

    const agregarOpcion = (indexPregunta) => {
        const nuevas = [...preguntas];
        nuevas[indexPregunta].opciones.push({ texto: "" });
        setPreguntas(nuevas);
    };

    const eliminarOpcion = (indexPregunta, indexOpcion) => {
        const nuevas = [...preguntas];

        if (nuevas[indexPregunta].opciones.length <= 2) {
            showToast("Debe haber al menos 2 opciones", "warning");
            return;
        }

        nuevas[indexPregunta].opciones =
            nuevas[indexPregunta].opciones.filter((_, i) => i !== indexOpcion);

        setPreguntas(nuevas);
    };

    const preguntasLimpias = preguntas.map(p => ({
        texto: p.texto,
        tipo: p.tipo,
        opciones: p.tipo === "opcion_multiple"
            ? p.opciones.map(o => o.texto)
            : []
    }));

    const validarFormulario = () => {
        if (!titulo.trim()) {
            showToast("El formulario debe tener un título", "warning");
            return false;
        }

        for (let p of preguntas) {
            if (!p.texto.trim()) {
                showToast("Todas las preguntas deben tener texto", "warning");
                return false;
            }

            if (p.tipo === "opcion_multiple") {
                const validas = p.opciones.filter(o => o.texto.trim() !== "");

                if (validas.length < 2) {
                    showToast("Las preguntas deben tener al menos 2 opciones válidas", "warning");
                    return false;
                }
            }
        }

        return true;
    };

    const guardarYAsignar = async () => {
        if (!validarFormulario()) return;

        try {
            const idUsuario = Number(sessionStorage.getItem("idUsuario"));
            let idFormulario = null;

            // 🟢 SI YA EXISTE → NO CREAR
            if (formularioSeleccionado) {
                idFormulario = formularioSeleccionado.idformulario;

                const preguntasValidas = preguntas
                    .map((p, index) => ({
                        texto: (p.texto || "").trim(),
                        tipo: p.tipo || "abierta",
                        estado: true,
                        idusuario: idUsuario,
                        orden: index + 1,
                        opcion_set:
                            p.tipo === "opcion_multiple"
                                ? (p.opciones || [])
                                    .map((o, i) => ({
                                        texto: (o.texto || "").trim(),
                                        estado: true,
                                        orden: i + 1
                                    }))
                                    .filter(o => o.texto !== "")
                                : []
                    }))
                    .filter(p => p.texto !== "");

                // 🔥 ACTUALIZAR FORMULARIO
                await axios.put(
                    `${API2}/formularios/${idFormulario}/`,
                    {
                        titulo,
                        descripcion: "",
                        estado: true,
                        idusuario: idUsuario,
                        idinduccion: induccion.idinduccion,
                        preguntas: preguntasValidas
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            } else {
                // 🔵 CREAR NUEVO
                const preguntasValidas = preguntas
                    .map((p, index) => ({
                        texto: (p.texto || "").trim(),
                        tipo: p.tipo || "abierta",
                        estado: true,
                        idusuario: idUsuario,
                        orden: index + 1,
                        opcion_set:
                            p.tipo === "opcion_multiple"
                                ? (p.opciones || [])
                                    .map((o, i) => ({
                                        texto: (o.texto || "").trim(),
                                        estado: true,
                                        orden: i + 1
                                    }))
                                    .filter(o => o.texto !== "")
                                : []
                    }))
                    .filter(p => p.texto !== "");

                const resFormulario = await axios.post(
                    `${API2}/formularios/`,
                    {
                        titulo,
                        descripcion: "",
                        estado: true,
                        idusuario: idUsuario,
                        idinduccion: induccion.idinduccion,
                        preguntas: preguntasValidas
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                idFormulario = resFormulario.data.idformulario;
                console.log("FORMULARIO CREADO:", resFormulario.data);
            }

            // 🔥 VALIDAR SI YA EXISTE ASIGNACIÓN
            const resAsignados = await axios.get(`${API2}/induccion-formulario/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const asignados = Array.isArray(resAsignados.data)
                ? resAsignados.data
                : resAsignados.data.results || [];

            const existente = asignados.find(
                a =>
                    Number(a.idinduccion) === Number(induccion.idinduccion) &&
                    a.estado === true
            );

            if (existente) {
                // 🔄 ACTUALIZAR
                await axios.put(
                    `${API2}/induccion-formulario/${existente.id}/`,
                    {
                        idinduccion: induccion.idinduccion,
                        idformulario: idFormulario,
                        fechaasignado: new Date().toISOString().split("T")[0],
                        estado: true
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            } else {
                // 🆕 CREAR
                await axios.post(
                    `${API2}/induccion-formulario/`,
                    {
                        idinduccion: induccion.idinduccion,
                        idformulario: idFormulario,
                        fechaasignado: new Date().toISOString().split("T")[0],
                        estado: true
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            }

            showToast("Formulario asignado correctamente", "success");
            onClose();

        } catch (error) {
            showToast(
                error.response?.data?.detail || "Error al asignar formulario",
                "error"
            );
        }
    };


    if (!visible) return null;

    const renderPregunta = (pregunta, index) => {
        return (
            <div
                key={index}
                style={{
                    ...styles.card,
                    cursor: "grab",
                    opacity: dragIndex === index ? 0.5 : 1,
                    position: "relative" // 👈 importante
                }}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
            >

                {/* 🗑 BOTÓN ELIMINAR (NUEVO) */}
                <button
                    style={styles.deleteIcon}
                    onClick={() => eliminarPregunta(index)}
                >
                    ✕
                </button>

                {/* 🔹 TEXTO PREGUNTA */}
                <textarea
                    rows={3}
                    value={pregunta.texto}
                    placeholder="Ingrese pregunta"
                    onChange={(e) => actualizarPregunta(index, e.target.value)}
                    style={styles.textareaPregunta}
                    onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                    }}
                />

                {/* 🔹 OPCIÓN MÚLTIPLE */}
                {pregunta.tipo === "opcion_multiple" && (
                    <div>
                        {pregunta.opciones?.map((op, i) => (
                            <div key={i} style={styles.opcionRow}>
                                <input type="radio" disabled />

                                <textarea
                                    rows={2}
                                    value={op.texto}
                                    placeholder="Ingrese opción"
                                    onChange={(e) => {
                                        const nuevas = [...preguntas];
                                        nuevas[index].opciones[i].texto = e.target.value;
                                        setPreguntas(nuevas);
                                    }}
                                    style={styles.textareaOpcion}
                                />

                                <button
                                    style={styles.buttonDanger}
                                    onClick={() => eliminarOpcion(index, i)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            style={styles.buttonSecondary}
                            onClick={() => agregarOpcion(index)}
                        >
                            + Agregar opción
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* BOTÓN CERRAR */}
                <button
                    style={styles.closeIcon}
                    onClick={onClose}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#f0f0f0";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                    }}
                >
                    ✕
                </button>
                <h3>
                    {formularioPrecargado
                        ? "Ver Formulario Asignado"
                        : "Asignar Formulario"}
                </h3>

                <div style={styles.selectContainer}>
                    <label style={styles.label}>Formulario</label>

                    <div style={styles.customSelect}>

                        {/* INPUT BUSCADOR */}
                        <input
                            type="text"
                            placeholder="Buscar o crear formulario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onFocus={() => setOpenSelect(true)}
                            style={styles.selectInput}
                        />

                        {/* DROPDOWN */}
                        {openSelect && (
                            <div style={styles.dropdown}>

                                {/* OPCIÓN NUEVO */}
                                <div
                                    style={styles.optionNuevo}
                                    onClick={() => {
                                        setFormularioSeleccionado(null);
                                        setBusqueda("");
                                        setOpenSelect(false);
                                    }}
                                >
                                    Crear nuevo formulario ...
                                </div>

                                {/* LISTA */}
                                {formulariosFiltrados.length > 0 ? (
                                    formulariosFiltrados.map(f => (
                                        <div
                                            key={f.idformulario}
                                            style={styles.option}
                                            onClick={() => {
                                                setFormularioSeleccionado(f);
                                                setBusqueda(f.titulo);
                                                setOpenSelect(false);
                                            }}
                                        >
                                            {f.titulo}
                                        </div>
                                    ))
                                ) : (
                                    <div style={styles.noResults}>
                                        Sin resultados
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div style={styles.body}>
                    <div style={{ marginBottom: "15px" }}>
                        <label style={styles.label}>Título del formulario</label>

                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ingrese título del formulario"
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                marginTop: "5px"
                            }}
                        />
                    </div>

                    {/* 🔹 PREGUNTAS */}
                    <div>
                        <h4>Preguntas</h4>

                        {preguntas.length > 0 ? (
                            preguntas.map((p, i) => renderPregunta(p, i))
                        ) : (
                            <p>No hay preguntas</p>
                        )}

                        <div style={styles.buttonGroup}>
                            <button
                                style={styles.buttonPrimary}
                                onClick={() => agregarPregunta("abierta")}
                            >
                                + Pregunta abierta
                            </button>

                            <button
                                style={styles.buttonPrimary}
                                onClick={() => agregarPregunta("opcion_multiple")}
                            >
                                + Opción múltiple
                            </button>
                        </div>
                    </div>
                </div>

                {/* 🔹 ACCIONES */}
                <div style={styles.footer}>
                    <button style={styles.buttonSecondary} onClick={guardarYAsignar}>
                        Guardar y asignar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormularioModal;