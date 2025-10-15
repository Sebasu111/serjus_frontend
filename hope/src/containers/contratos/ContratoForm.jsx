import React from "react";

const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const ContratoForm = ({ data, onChange, imprimirContrato }) => {
  const input = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    width: "100%",
    fontSize: "14px",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "10px",
  };

  const btnPrimary = {
    background: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const handleUpperCaseChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value: value.toUpperCase() } });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const onlyNumbers = value.replace(/\D/g, "");
    onChange({ target: { name, value: onlyNumbers } });
  };

  const commonProps = {
    autoComplete: "off",
    required: true,
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const number = value.replace(/[^\d]/g, "");
    const formatted = number ? `Q ${Number(number).toLocaleString()}` : "";
    onChange({ target: { name, value: formatted } });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = match[3];
      if (meses[month]) {
        newValue = `${day} de ${meses[month]} de ${year}`;
      }
    }

    onChange({ target: { name, value: newValue } });
  };

  const renderFields = (fields) =>
    Object.entries(fields).map(([k, label]) => {
      let onFieldChange = onChange;
      let placeholder = label;

      if (k.includes("nombre")) {
        onFieldChange = handleUpperCaseChange;
      } else if (k.includes("edad") || k.includes("dpi")) {
        onFieldChange = handleNumberChange;
      } else if (k.includes("salario") || k.includes("sueldo") || k.includes("bonificacion")) {
        onFieldChange = handleCurrencyChange;
      } else if (k.includes("fecha")) {
        onFieldChange = handleDateChange;
      }

      return (
        <div key={k} style={{ display: "flex", flexDirection: "column" }}>
          <label htmlFor={k} style={{ marginBottom: "4px", fontWeight: "bold" }}>
            {label}:
          </label>
          <input
            id={k}
            name={k}
            value={data[k]}
            onChange={onFieldChange}
            placeholder={placeholder}
            style={input}
            {...commonProps}
          />
        </div>
      );
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    imprimirContrato();
  };

  return (
    <form className="no-print" onSubmit={handleSubmit} style={{ marginBottom: "40px" }}>
      <h3>Datos del Empleador/a</h3>
      <div style={grid}>
        {renderFields({
          nombreEmpleadora: "Nombre completo de la empleador/a",
          edadEmpleadora: "Edad de la empleador/a",
          sexoEmpleadora: "Sexo de la empleador/a",
          estadoCivilEmpleadora: "Estado civil de la empleador/a",
          direccionEmpleadora: "Dirección completa de la empleador/a",
          dpiEmpleadora: "Número de DPI de la empleador/a",
        })}
      </div>

      <h3>Datos de la Trabajador/a</h3>
      <div style={grid}>
        {renderFields({
          nombreTrabajadora: "Nombre completo de la trabajador/a",
          edadTrabajadora: "Edad de la trabajador/a",
          sexoTrabajadora: "Sexo de la trabajador/a",
          estadoCivilTrabajadora: "Estado civil de la trabajador/a",
          direccionTrabajadora: "País en el que reside",
          dpiTrabajadora: "Número de DPI de la trabajador/a",
          residenciaTrabajadora: "Lugar de residencia actual",
          departamentoTrabajadora: "Departamento",
        })}
      </div>

      <h3>Detalles del Contrato</h3>
      <div style={grid}>
        {renderFields({
          fechaInicio: "Fecha de inicio del contrato",
          puesto: "Puesto que ocupará la trabajador/a",
          lugarServicios: "Lugar donde se prestarán los servicios",
          salario: "Salario total mensual",
          sueldoOrdinario: "Monto de sueldo ordinario",
          bonificacion: "Monto de la bonificación",
          banco: "Banco donde se acreditará el salario (ej. Cheques del Banco G&T Continental)",
          fechaContrato: "Fecha de firma del contrato",
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
        <label htmlFor="funciones" style={{ marginBottom: "4px", fontWeight: "bold" }}>
          Funciones principales a realizar:
        </label>
        <textarea
          id="funciones"
          name="funciones"
          value={data.funciones}
          onChange={onChange}
          placeholder="Describa las funciones principales del puesto"
          style={{ ...input, height: "120px" }}
          {...commonProps}
        />
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button type="submit" style={btnPrimary}>
          Imprimir Contrato
        </button>
      </div>
    </form>
  );
};

export default ContratoForm;
