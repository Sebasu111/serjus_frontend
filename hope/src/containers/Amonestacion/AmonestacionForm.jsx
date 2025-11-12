import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const AmonestacionForm = ({
  data,
  onChange,
  onPrint,
  generandoPDF,
  responsables = [], // lista de empleados que pueden ser responsables
}) => {
  const [empleados, setEmpleados] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [qEmpleado, setQEmpleado] = useState("");
  const [qResponsable, setQResponsable] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openMenuResp, setOpenMenuResp] = useState(false);
  const wrapperRef = useRef(null);

  const nombreCamposPersonalizados = {
    articuloReglamento: "Artículo del Reglamento Interno",
    descripcionArticuloReglamento: "Descripción del Artículo del Reglamento",
    articuloCodigoTrabajo: "Artículo del Código de Trabajo",
    descripcionArticuloCodigoTrabajo: "Descripción del Artículo del Código de Trabajo",
    plazoDias: "Plazo en Días",
    nombreResponsable: "Nombre del Responsable",
    cargoResponsable: "Cargo del Responsable",
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`);
      const empleadosData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setEmpleados(empleadosData);
    } catch (error) {
      showToast("Error al cargar colaboradores", "error");
    }
  };

  const fetchPuestos = async () => {
    try {
      const res = await axios.get(`${API}/puestos/`);
      const puestosData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];
      setPuestos(puestosData);
    } catch (error) {
      showToast("Error al cargar puestos", "error");
    }
  };

  const setFechaActual = () => {
    const fecha = new Date();
    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];
    onChange({ target: { name: "dia", value: fecha.getDate() } });
    onChange({ target: { name: "mes", value: meses[fecha.getMonth()] } });
    onChange({ target: { name: "anio", value: fecha.getFullYear() } });
  };

  useEffect(() => {
    fetchEmpleados();
    fetchPuestos();
    setFechaActual();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenMenu(false);
        setOpenMenuResp(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtrado de empleados
  const empleadosFiltrados = useMemo(() => {
  const term = qEmpleado.toLowerCase().trim();
  return empleados
    .filter((emp) => emp.estado === true || emp.estado === 1) 
    .filter((emp) => {
      const nombre = `${emp.nombre || emp.primernombre || ""} ${
        emp.apellido || emp.primerapellido || ""
      }`.toLowerCase();
      return nombre.includes(term);
    });
}, [qEmpleado, empleados]);

const responsablesFiltrados = useMemo(() => {
  const term = qResponsable.toLowerCase().trim();

  return responsables
    .filter((emp) => emp.estado === true || emp.estado === 1) 
    .filter((emp) => {
      const nombre = `${emp.nombre || emp.primernombre || ""} ${
        emp.apellido || emp.primerapellido || ""
      }`.toLowerCase();
      const idEmp = emp.idempleado || emp.id;

      if (data.idEmpleado && Number(idEmp) === Number(data.idEmpleado)) {
        return false;
      }

      return nombre.includes(term);
    });
}, [qResponsable, responsables, data.idEmpleado]);

  const seleccionarEmpleado = (emp) => {
    const nombreCompleto = `${emp.nombre || emp.primernombre || ""} ${emp.apellido || emp.primerapellido || ""}`.trim();
    const puestoEncontrado = puestos.find(
      (p) => p.idpuesto === emp.idpuesto || p.id === emp.idpuesto || p.id_puesto === emp.idpuesto
    );
    const nombrePuesto = puestoEncontrado?.nombre || puestoEncontrado?.nombrepuesto || "Sin puesto";

    onChange({ target: { name: "idEmpleado", value: emp.idempleado || emp.id } });
    onChange({ target: { name: "nombreTrabajador", value: nombreCompleto } });
    onChange({ target: { name: "puesto", value: nombrePuesto } });
    setQEmpleado(nombreCompleto);
    setOpenMenu(false);
  };

  const seleccionarResponsable = (emp) => {
    const nombreCompleto = `${emp.nombre || emp.primernombre || ""} ${emp.apellido || emp.primerapellido || ""}`.trim();
    const puestoEncontrado = puestos.find(
      (p) => p.idpuesto === emp.idpuesto || p.id === emp.idpuesto || p.id_puesto === emp.idpuesto
    );
    const nombrePuesto = puestoEncontrado?.nombre || puestoEncontrado?.nombrepuesto || "Sin puesto";

    onChange({ target: { name: "nombreResponsable", value: nombreCompleto } });
    onChange({ target: { name: "cargoResponsable", value: nombrePuesto } });
    setQResponsable(nombreCompleto);
    setOpenMenuResp(false);
  };

  return (
    <form
      ref={wrapperRef}
      style={{
        flex: "0 0 30%",
        backgroundColor: "#f8f9fa",
        padding: "15px",
        overflow: "auto",
        borderLeft: "1px solid #e0e0e0",
      }}
    >
      <h2 style={{ marginBottom: "10px", color: "#000000ff" }}>Datos de la Amonestación</h2>

      {/* Tipo de carta */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Tipo de Carta</label>
        <select
          name="tipoCarta"
          value={data.tipoCarta || ""}
          onChange={onChange}
          style={selectStyle}
          required
        >
          <option value="">Seleccione...</option>
          <option value="escrita">Llamada de Atención Escrita</option>
          <option value="verbal_escrita">Llamada de Atención Verbal y Escrita</option>
        </select>
      </div>

      {/* Buscador de empleado */}
      <div style={{ marginBottom: "12px", position: "relative" }}>
        <label style={labelStyle}>Nombre del Colaborador</label>
        <input
          type="text"
          name="nombreTrabajador"
          placeholder="Buscar colaborador..."
          value={qEmpleado || data.nombreTrabajador || ""}
          onChange={(e) => {
            setQEmpleado(e.target.value);
            onChange(e);
            setOpenMenu(true);
          }}
          onFocus={() => setOpenMenu(true)}
          autoComplete="off"
          required
          style={inputStyle}
        />
        {openMenu && empleadosFiltrados.length > 0 && (
          <div style={menuStyle}>
            {empleadosFiltrados.map((emp) => {
              const nombreCompleto = `${emp.nombre || emp.primernombre || ""} ${emp.apellido || emp.primerapellido || ""}`.trim();
              return (
                <div
                  key={emp.idempleado || emp.id}
                  onClick={() => seleccionarEmpleado(emp)}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {nombreCompleto}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Puesto del colaborador */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Puesto</label>
        <input
          type="text"
          name="puesto"
          value={data.puesto || ""}
          readOnly
          required
          style={{ ...inputStyle, backgroundColor: "#e9ecef", cursor: "not-allowed" }}
        />
      </div>

      {/* Descripción del hecho */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Descripción del Hecho</label>
        <textarea
          name="descripcionHecho"
          value={data.descripcionHecho || ""}
          onChange={onChange}
          rows={4}
          placeholder="Describa el hecho ocurrido..."
          required
          style={textareaStyle}
        />
      </div>

      {/* Tipo de falta */}
      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Tipo de Falta</label>
        <select
          name="tipoFalta"
          value={data.tipoFalta || ""}
          onChange={onChange}
          required
          style={selectStyle}
        >
          <option value="">Seleccione tipo...</option>
          <option value="leve">Leve</option>
          <option value="grave">Grave</option>
          <option value="gravísima">Gravísima</option>
        </select>
      </div>

      {/* Campos dinámicos */}
      {Object.keys(data)
        .filter(
          (campo) =>
            ![
              "idEmpleado",
              "tipoCarta",
              "tipoFalta",
              "nombreTrabajador",
              "puesto",
              "nombreResponsable",
              "cargoResponsable",
              "dia",
              "mes",
              "anio",
              "descripcionHecho",
            ].includes(campo)
        )
        .map((campo) => (
          <div key={campo} style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>
              {nombreCamposPersonalizados[campo] || campo.replace(/([A-Z])/g, " $1")}
            </label>

            {["descripcionArticuloReglamento", "descripcionArticuloCodigoTrabajo"].includes(campo) ? (
              <textarea
                name={campo}
                value={data[campo]}
                onChange={onChange}
                rows={4}
                required
                style={textareaStyle}
              />
            ) : (
              <input
                type="text"
                name={campo}
                value={data[campo]}
                onChange={onChange}
                required
                style={inputStyle}
              />
            )}
          </div>
        ))}

      {/* RESPONSABLES AL FINAL */}
      <div style={{ marginBottom: "12px", position: "relative" }}>
        <label style={labelStyle}>Responsable</label>
        <input
          type="text"
          placeholder="Buscar responsable..."
          value={qResponsable || data.nombreResponsable || ""}
          onChange={(e) => {
            setQResponsable(e.target.value);
            onChange({ target: { name: "nombreResponsable", value: e.target.value } });
            setOpenMenuResp(true);
          }}
          onFocus={() => setOpenMenuResp(true)}
          autoComplete="off"
          required
          style={inputStyle}
        />
        {openMenuResp && responsablesFiltrados.length > 0 && (
          <div style={menuStyle}>
            {responsablesFiltrados.map((emp) => {
              const nombreCompleto = `${emp.nombre || emp.primernombre || ""} ${emp.apellido || emp.primerapellido || ""}`.trim();
              return (
                <div
                  key={emp.idempleado || emp.id}
                  onClick={() => seleccionarResponsable(emp)}
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {nombreCompleto}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginBottom: "12px" }}>
        <label style={labelStyle}>Puesto Responsable</label>
        <input
          type="text"
          name="cargoResponsable"
          value={data.cargoResponsable || ""}
          readOnly
          style={{ ...inputStyle, backgroundColor: "#e9ecef", cursor: "not-allowed" }}
        />
      </div>

      {/* Botón imprimir */}
<button
  type="button"
  disabled={generandoPDF}
  onClick={(e) => {
    e.preventDefault();
    const form = e.target.closest("form");

    
    if (!form.checkValidity()) {
      form.reportValidity();
      showToast(
        "Por favor, complete todos los campos requeridos antes de continuar.",
        "warning"
      );
      return;
    }

    
    const nombreEmpleado = (data.nombreTrabajador || "").trim().toLowerCase();
    const nombreResponsable = (data.nombreResponsable || "").trim().toLowerCase();

    if (
      nombreEmpleado &&
      nombreResponsable &&
      nombreEmpleado === nombreResponsable
    ) {
      showToast(
        "El responsable no puede ser la misma persona que el colaborador.",
        "error"
      );
      return; 
    }

    onPrint(); 
  }}
  style={buttonPrimary}
>
  {generandoPDF ? "Generando PDF..." : "Imprimir Carta"}
</button>

    </form>
  );
};

// Estilos
const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#555", display: "block", marginBottom: "4px" };
const inputStyle = { width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "13px", backgroundColor: "#fff" };
const selectStyle = { ...inputStyle, backgroundColor: "#fff" };
const textareaStyle = { ...inputStyle, resize: "none" };
const menuStyle = { position: "absolute", top: "100%", left: 0, width: "100%", background: "#fff", border: "1px solid #ddd", borderRadius: "6px", marginTop: "4px", maxHeight: "180px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 20 };
const menuItemStyle = { padding: "8px", cursor: "pointer", fontSize: "13px" };
const buttonPrimary = { backgroundColor: "#023047", color: "#fff", width: "100%", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", marginTop: "10px" };

export default AmonestacionForm;
