import React from "react";
import Select from "react-select";
import { X } from "lucide-react";

const DocumentosForm = ({
    form,
    setForm,
    tiposDocumento,
    empleados,
    onChange,
    handleSubmit,
    editingId,
    setMostrarFormulario,
    setMostrarModalEliminar,
    setDocumentoAEliminar,
}) => {
    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-15%, -50%)",
                width: "420px",
                maxWidth: "90%",
                background: "#fff",
                boxShadow: "0 0 20px rgba(0,0,0,0.2)",
                padding: "30px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
            }}
        >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                {editingId ? "Editar documento" : "Registrar documento"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                {/* 1. Nombre del archivo */}
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Nombre del archivo
                    </label>
                    <input
                        name="nombrearchivo"
                        value={form.nombrearchivo}
                        onChange={onChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }}
                    />
                </div>

                {/* 2. Tipo de documento */}
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Tipo de documento
                    </label>
                    <select
                        name="idtipodocumento"
                        value={form.idtipodocumento}
                        onChange={onChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }}
                    >
                        <option value="">Seleccione...</option>
                        {tiposDocumento.map((t) => (
                            <option key={t.idtipodocumento} value={t.idtipodocumento}>
                                {t.nombretipo}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Empleado */}
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Empleado
                    </label>
                    <Select
                        options={empleados.map((e) => ({
                            value: e.idempleado,
                            label: `${e.nombre} ${e.apellido}`,
                        }))}
                        value={
                            form.idempleado
                                ? {
                                    value: form.idempleado,
                                    label: `${empleados.find(
                                        (emp) => emp.idempleado === form.idempleado
                                    )?.nombre} ${empleados.find(
                                        (emp) => emp.idempleado === form.idempleado
                                    )?.apellido
                                        }`,
                                }
                                : null
                        }
                        onChange={(selected) =>
                            setForm((f) => ({ ...f, idempleado: selected?.value }))
                        }
                        placeholder="Busca y selecciona un empleado..."
                        isClearable
                    />
                </div>

                {/* 4. Archivo */}
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>Archivo</label>
                    <input
                        type="file"
                        name="archivo"
                        onChange={onChange}
                        accept="*/*"
                        required={!editingId}
                        style={{ marginBottom: "6px" }}
                    />
                    <small style={{ color: "#666" }}>
                        {editingId
                            ? "Sube un archivo solo si   desea reemplazar el existente."
                            : ""}
                    </small>
                </div>

                {/* 5. Fecha de subida */}
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                        Fecha de subida
                    </label>
                    <input
                        type="date"
                        name="fechasubida"
                        value={form.fechasubida}
                        onChange={onChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#219ebc",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    {editingId ? "Actualizar" : "Guardar"}
                </button>

                {editingId && form.nombrearchivo && (
                    <button
                        type="button"
                        onClick={() => {
                            setDocumentoAEliminar(editingId);
                            setMostrarModalEliminar(true);
                        }}
                        style={{
                            marginTop: "10px",
                            background: "#FCA5A5",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            width: "100%",
                        }}
                    >
                        Eliminar archivo actual
                    </button>
                )}
            </form>

            <button
                onClick={() => {
                    setMostrarFormulario(false);
                }}
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "15px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
                title="Cerrar"
            >
                <X size={24} color="#555" />
            </button>
        </div>
    );
};

export default DocumentosForm;