import React from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";

const InduccionDocumentosForm = ({
    idInduccion,
    setIdInduccion,
    documentoPDF,
    handleFileChange,
    empleadosSeleccionados,
    handleEmpleadoChange,
    handleEquipoChange,
    fechaAsignado,
    activoEditando,
    editingId,
    handleSubmit,
    onClose,
    inducciones,
    empleados,
    equipos
}) => {
    const getNombreCompleto = (empleado) => {
        return `${empleado.primernombre} ${empleado.primerapellido}`;
    };

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            role="dialog"
            style={{
                display: "block",
                backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
        >
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {editingId ? "Editar" : "Registrar"} Asignación de Documento
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                {/* Selección de Inducción */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Inducción <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        value={idInduccion}
                                        onChange={(e) => setIdInduccion(e.target.value)}
                                        style={comboBoxStyles}
                                        required
                                    >
                                        <option value="">Seleccione una inducción</option>
                                        {inducciones.map((induccion) => (
                                            <option
                                                key={induccion.idinduccion}
                                                value={induccion.idinduccion}
                                            >
                                                {induccion.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha de Asignado (solo lectura) */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Fecha de Asignado
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaAsignado}
                                        readOnly
                                        style={{ backgroundColor: "#f8f9fa" }}
                                    />
                                </div>
                            </div>

                            {/* Subida de Documento PDF */}
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label className="form-label">
                                        Documento PDF <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        required={!editingId}
                                    />
                                    {documentoPDF && (
                                        <small className="text-success">
                                            Archivo seleccionado: {documentoPDF.name}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Selección por Equipos */}
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label className="form-label">
                                        Seleccionar por Equipos
                                    </label>
                                    <div className="row">
                                        {equipos.map((equipo) => (
                                            <div key={equipo.idequipo} className="col-md-4 mb-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm w-100"
                                                    onClick={() => handleEquipoChange(equipo.idequipo)}
                                                >
                                                    Seleccionar {equipo.nombre}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Selección Individual de Empleados */}
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <label className="form-label">
                                        Empleados <span className="text-danger">*</span>
                                    </label>
                                    <div
                                        style={{
                                            maxHeight: "300px",
                                            overflowY: "auto",
                                            border: "1px solid #dee2e6",
                                            borderRadius: "0.375rem",
                                            padding: "10px"
                                        }}
                                    >
                                        <div className="row">
                                            {empleados.map((empleado) => (
                                                <div key={empleado.idempleado} className="col-md-6 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`empleado-${empleado.idempleado}`}
                                                            checked={empleadosSeleccionados.includes(empleado.idempleado)}
                                                            onChange={() => handleEmpleadoChange(empleado.idempleado)}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`empleado-${empleado.idempleado}`}
                                                        >
                                                            {getNombreCompleto(empleado)}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {empleadosSeleccionados.length > 0 && (
                                        <small className="text-info">
                                            {empleadosSeleccionados.length} empleado(s) seleccionado(s)
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="row">
                                <div className="col-12">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="estado"
                                            checked={activoEditando}
                                            readOnly
                                        />
                                        <label className="form-check-label" htmlFor="estado">
                                            Activo
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                {editingId ? "Actualizar" : "Registrar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InduccionDocumentosForm;