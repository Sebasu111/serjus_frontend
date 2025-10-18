import React, { useState, useRef } from "react";
import SEO from "../../components/seo";


const meses = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const ContratoForm = ({ data, onChange, imprimirContrato }) => {
  const [pagina, setPagina] = useState(1);
  const formRef = useRef(null); 

  const input = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "100%",
    fontSize: "14px",
    transition: "all 0.2s",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "15px",
  };

  const btnPrimary = {
    background: "#023047",
    color: "#fff",
    padding: "12px 25px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.2s",
  };

  const btnNav = {
    background: "#e5e7eb",
    color: "#0A0A0A",
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    margin: "10px 5px",
    transition: "all 0.2s",
  };

  const commonProps = { autoComplete: "off", required: true };

  const handleTextOnlyChange = (e) => {
    const { name, value } = e.target;
    const soloTexto = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
    onChange({ target: { name, value: soloTexto } });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const texto = value.replace(/[^a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ#\-\s.,]/g, "");
    onChange({ target: { name, value: texto } });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    let onlyNumbers = value.replace(/\D/g, "");
    if (name.includes("dpi")) onlyNumbers = onlyNumbers.slice(0, 13);
    onChange({ target: { name, value: onlyNumbers } });
  };

  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const number = value.replace(/[^\d]/g, "");
    const formatted = number ? `Q ${Number(number).toLocaleString()}` : "";
    onChange({ target: { name, value: formatted } });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    onChange({ target: { name, value } });
    if (value) {
      const [year, month, day] = value.split("-");
      const mesNombre = meses[parseInt(month, 10) - 1];
      const formateada = `${parseInt(day)} de ${mesNombre} de ${year}`;
      onChange({ target: { name: `${name}Formateada`, value: formateada } });
    } else {
      onChange({ target: { name: `${name}Formateada`, value: "" } });
    }
  };

  const renderFields = (fields) =>
    Object.entries(fields).map(([k, { label, placeholder }]) => {
      if (k.includes("sexo")) {
        return (
          <div key={k} style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor={k} style={{ marginBottom: "4px", fontWeight: "bold" }}>
              {label}:
            </label>
            <select
              id={k}
              name={k}
              value={data[k]}
              onChange={onChange}
              style={input}
              {...commonProps}
            >
              <option value="">Seleccione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        );
      }

      if (k.includes("estadoCivil")) {
        return (
          <div key={k} style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor={k} style={{ marginBottom: "4px", fontWeight: "bold" }}>
              {label}:
            </label>
            <select
              id={k}
              name={k}
              value={data[k]}
              onChange={onChange}
              style={input}
              {...commonProps}
            >
              <option value="">Seleccione...</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Unión de hecho">Unión de hecho</option>
            </select>
          </div>
        );
      }

      if (k === "fechaInicio" || k === "fechaContrato") {
        return (
          <div key={k} style={{ display: "flex", flexDirection: "column" }}>
            <label htmlFor={k} style={{ marginBottom: "4px", fontWeight: "bold" }}>
              {label}:
            </label>
            <input type="date" id={k} name={k} onChange={handleDateChange} style={input} {...commonProps} />
          </div>
        );
      }

      let onFieldChange = onChange;
      let extraProps = {};

      if (k.includes("nombre") || k.includes("pais") || k.includes("departamento")) {
        onFieldChange = handleTextOnlyChange;
      } else if (k.includes("edad") || k.includes("dpi")) {
        onFieldChange = handleNumberChange;
        if (k.includes("dpi")) {
          extraProps.maxLength = 13;
          extraProps.inputMode = "numeric";
          extraProps.pattern = "\\d{13}";
        }
      } else if (k.includes("salario") || k.includes("sueldo") || k.includes("bonificacion")) {
        onFieldChange = handleCurrencyChange;
      } else if (k.includes("fecha")) {
        onFieldChange = handleDateChange;
      } else if (k.includes("direccion")) {
        onFieldChange = handleAddressChange;
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
            {...extraProps}
          />
        </div>
      );
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarPagina(pagina)) return; 
    imprimirContrato();
  };

  const validarPagina = () => {
  const form = formRef.current;
  const pageInputs = Array.from(
    form.querySelectorAll(
      `.pagina-${pagina} input, .pagina-${pagina} select, .pagina-${pagina} textarea`
    )
  );

  for (let input of pageInputs) {
      if (!input.value) {
        input.setCustomValidity("Este campo es obligatorio");
        input.reportValidity();
        input.focus();
        return false;
      }

      if (input.name.includes("dpi") && input.value.length !== 13) {
        input.setCustomValidity("El DPI debe tener exactamente 13 dígitos");
        input.reportValidity();
        input.focus();
        return false;
      }

      if (input.type === "date" && !input.value) {
        input.setCustomValidity("Seleccione una fecha");
        input.reportValidity();
        input.focus();
        return false;
      }

      input.setCustomValidity("");
    }

    return true;
  };

  const paginasTotales = 4;

  return (
    <form
      ref={formRef}
      className="no-print"
      onSubmit={handleSubmit}
      style={{ marginBottom: "40px" }}
    >
      <SEO title="Contratos" />
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Editor de Contrato Individual de Trabajo</h1>
      <div style={{
        margin: "40px auto",
        padding: "30px",
        maxWidth: "900px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}>
      {pagina === 1 && (
        <div className="pagina-1">
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Datos del Empleador/a</h3>
          <div style={grid}>
            {renderFields({
              nombreEmpleadora: { label: "Nombre completo de la empleador/a", placeholder: "Ej. Ingrid López Castillo" },
              edadEmpleadora: { label: "Edad de la empleador/a", placeholder: "Ej. 53" },
              sexoEmpleadora: { label: "Sexo de la empleador/a" },
              estadoCivilEmpleadora: { label: "Estado civil de la empleador/a" },
              direccionEmpleadora: { label: "Dirección completa de la empleador/a", placeholder: "Ej. 3a Avenida 10-45 Zona 2, Coatepeque" },
              dpiEmpleadora: { label: "Número de DPI de la empleador/a", placeholder: "Ej. 2598709940920" },
            })}
          </div>
        </div>
      )}

      {pagina === 2 && (
        <div className="pagina-2">
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Datos de la Trabajador/a</h3>
          <div style={grid}>
            {renderFields({
              nombreTrabajadora: { label: "Nombre completo de la trabajador/a", placeholder: "Ej. María Fernanda Pérez Ramírez" },
              edadTrabajadora: { label: "Edad de la trabajador/a", placeholder: "Ej. 28" },
              sexoTrabajadora: { label: "Sexo de la trabajador/a" },
              estadoCivilTrabajadora: { label: "Estado civil de la trabajador/a" },
              direccionTrabajadora: { label: "País en el que reside", placeholder: "Ej. Guatemala" },
              dpiTrabajadora: { label: "Número de DPI de la trabajador/a", placeholder: "Ej. 3045127890101" },
              residenciaTrabajadora: { label: "Lugar de residencia actual", placeholder: "Ej. Colonia El Rosario, Quetzaltenango" },
              departamentoTrabajadora: { label: "Departamento", placeholder: "Ej. Quetzaltenango" },
            })}
          </div>
        </div>
      )}

      {pagina === 3 && (
        <div className="pagina-3">
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Detalles del Contrato</h3>
          <div style={grid}>
            {renderFields({
              fechaInicio: { label: "Fecha de inicio del contrato" },
              puesto: { label: "Puesto que ocupará la trabajador/a", placeholder: "Ej. Empleada doméstica" },
              lugarServicios: { label: "Lugar donde se prestarán los servicios", placeholder: "Ej. Residencia de la empleadora" },
              salario: { label: "Salario total mensual", placeholder: "Ej. Q 3,200" },
              sueldoOrdinario: { label: "Monto de sueldo ordinario", placeholder: "Ej. Q 2,800" },
              bonificacion: { label: "Monto de la bonificación", placeholder: "Ej. Q 400" },
              banco: { label: "Banco donde se acreditará el salario", placeholder: "Ej. Banco G&T Continental" },
              fechaContrato: { label: "Fecha de firma del contrato" },
            })}
          </div>
        </div>
      )}

      {pagina === 4 && (
        <div className="pagina-4">
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Funciones principales a realizar</h3>
          <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px" }}>
            <label htmlFor="funciones" style={{ marginBottom: "4px", fontWeight: "bold" }}>
              Describa las funciones principales:
            </label>
            <textarea
              id="funciones"
              name="funciones"
              value={data.funciones}
              onChange={onChange}
              placeholder="Ej. Limpieza general, preparación de alimentos y atención del hogar"
              style={{ ...input, height: "120px" }}
              {...commonProps}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button type="submit" style={btnPrimary}>
              Imprimir Contrato
            </button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "30px" }}>
          {pagina > 1 && (
            <button
              type="button"
              style={btnNav}
              onClick={() => setPagina(pagina - 1)}
            >
              ← Anterior
            </button>
          )}
          {pagina < paginasTotales && (
            <button
              type="button"
              style={btnNav}
              onClick={() => {
                if (validarPagina(pagina)) setPagina(pagina + 1);
              }}
            >
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ContratoForm;
