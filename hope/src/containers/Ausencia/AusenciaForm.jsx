import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast.js";

const API = "http://127.0.0.1:8000/api";

const displayName = (emp) => [emp?.nombre, emp?.apellido].filter(Boolean).join(" ");
const empId = (emp) => emp.idempleado ?? emp.idEmpleado;

const AusenciaForm = ({ usuario, editingAusencia, onSubmit, onClose, empleados }) => {
  const [idEmpleado, setIdEmpleado] = useState("");
  const [qEmpleado, setQEmpleado] = useState("");
  const [tipo, setTipo] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [esIGSS, setEsIGSS] = useState(false);
  const [otro, setOtro] = useState("");
  const [cantidadDias, setCantidadDias] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [archivoActual, setArchivoActual] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [errorFechaFin, setErrorFechaFin] = useState("");
  const [prevOtro, setPrevOtro] = useState("");

  const wrapperRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);

  // --- Inicialización ---
  useEffect(() => {
    if (editingAusencia) {
      setTipo(editingAusencia.tipo || "");
      setDiagnostico(editingAusencia.diagnostico || "");
      setEsIGSS(editingAusencia.es_iggs || false);
      setOtro(editingAusencia.otro || "");
      setPrevOtro(editingAusencia.otro || "");
      setFechaInicio(editingAusencia.fechainicio || "");
      setFechaFin(editingAusencia.fechafin || "");
      setCantidadDias(editingAusencia.cantidad_dias || 0);
      setIdEmpleado(editingAusencia.idempleado || "");

      if (editingAusencia.iddocumento) {
        axios
          .get(`${API}/documentos/${editingAusencia.iddocumento}/`)
          .then((res) => setArchivoActual(res.data.nombrearchivo || ""))
          .catch(() => setArchivoActual("Sin archivo"));
      }
    } else if (!editingAusencia && !idEmpleado && usuario && empleados?.length > 0) {
      const encontrado = empleados.find((e) => e.idusuario === usuario.idusuario);
      if (encontrado) {
        setIdEmpleado(encontrado.idempleado);
        setQEmpleado(displayName(encontrado));
      }
    }
  }, [editingAusencia, empleados, usuario]);

  // --- Calcular cantidad de días ---
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (fin >= inicio) {
        const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
        setCantidadDias(diff);
        setErrorFechaFin("");
      } else {
        setErrorFechaFin("La fecha fin no puede ser anterior a la fecha inicio.");
        setCantidadDias(0);
      }
    }
  }, [fechaInicio, fechaFin]);

  // --- Cerrar menú si se hace clic fuera ---
  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // --- Reset form ---
  const resetForm = () => {
    setIdEmpleado("");
    setQEmpleado("");
    setTipo("");
    setDiagnostico("");
    setEsIGSS(false);
    setOtro("");
    setCantidadDias(0);
    setFechaInicio("");
    setFechaFin("");
    setArchivo(null);
    setArchivoActual("");
    setErrorFechaFin("");
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idEmpleado || !tipo || !fechaInicio || !fechaFin) {
      showToast("Complete todos los campos obligatorios", "warning");
      return;
    }

    if (tipo !== "Personal" && !esIGSS && !otro.trim()) {
      showToast("Si no es IGSS, especifique la clínica u otro lugar", "warning");
      return;
    }

    setSubiendo(true);

    try {
      let idDocumento = editingAusencia?.iddocumento || null;

      if (archivo) {
        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("nombrearchivo", archivo.name);
        formData.append("mimearchivo", archivo.name.split(".").pop().toLowerCase());
        formData.append("fechasubida", new Date().toISOString().slice(0, 10));
        formData.append("idusuario", usuario.idusuario);
        formData.append("idtipodocumento", 3);
        formData.append("idempleado", idEmpleado);
        formData.append("estado", true);

        if (editingAusencia?.iddocumento) {
          const respDoc = await axios.put(`${API}/documentos/${editingAusencia.iddocumento}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          idDocumento = respDoc.data.iddocumento;
        } else {
          const respDoc = await axios.post(`${API}/documentos/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          idDocumento = respDoc.data.iddocumento;
        }
      }

      const dataAusencia = {
        idempleado: Number(idEmpleado),
        tipo,
        diagnostico,
        es_iggs: esIGSS,
        otro: !esIGSS && tipo !== "Personal" ? otro || null : null,
        cantidad_dias: cantidadDias,
        fechainicio: fechaInicio,
        fechafin: fechaFin,
        iddocumento: idDocumento,
        estado: true,
        idusuario: usuario.idusuario,
      };

      let guardadoExitoso = false;

      try {
        await onSubmit(dataAusencia, editingAusencia?.idausencia);
        guardadoExitoso = true;
      } catch (error) {
        // 👇 Ya no mostramos toast aquí, lo maneja el contenedor
        console.warn("onSubmit rechazó la operación (por conflicto o error):", error?.message || error);
      }

      if (guardadoExitoso) {
        resetForm();
        showToast(
          editingAusencia ? "Ausencia actualizada correctamente" : "Ausencia registrada correctamente",
          "success"
        );
      }
    } catch (error) {
      console.error("Error al registrar o actualizar la ausencia:", error);
      showToast("Error al registrar o actualizar la ausencia", "error");
    } finally {
      setSubiendo(false);
    }
  };


  // --- Filtrado de empleados ---
  const empleadosFiltrados = useMemo(() => {
    const t = qEmpleado.toLowerCase().trim();
    return empleados.filter((e) => displayName(e).toLowerCase().includes(t));
  }, [qEmpleado, empleados]);

  const seleccionarEmpleado = (emp) => {
    setIdEmpleado(empId(emp));
    setQEmpleado(displayName(emp));
    setOpenMenu(false);
  };

  // --- Render ---
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        maxWidth: "90%",
        background: "#fff",
        boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        padding: "30px",
        zIndex: 1000,
        borderRadius: "12px",
      }}
      ref={wrapperRef}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
        {editingAusencia ? "Editar Ausencia" : "Registrar Ausencia"}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* --- Colaborador --- */}
        <div style={{ marginBottom: "15px", position: "relative" }}>
          <label>Colaborador/a</label>
          <input
            type="text"
            placeholder="Buscar colaborador/a por nombre o apellido..."
            value={
              editingAusencia
                ? displayName(empleados.find((e) => empId(e) === editingAusencia.idempleado))
                : qEmpleado
            }
            onChange={(e) => {
              setQEmpleado(e.target.value);
              setOpenMenu(true);
            }}
            onFocus={() => setOpenMenu(true)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: editingAusencia ? "#f3f3f3" : "#fff",
            }}
            disabled={!!editingAusencia}
          />
          {openMenu && !editingAusencia && (
            <div
              style={{
                position: "absolute",
                zIndex: 10,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                marginTop: 4,
                width: "100%",
                maxHeight: 180,
                overflowY: "auto",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {empleadosFiltrados.length === 0 ? (
                <div style={{ padding: 10, color: "#6b7280" }}>Sin resultados</div>
              ) : (
                empleadosFiltrados.map((emp) => (
                  <button
                    key={empId(emp)}
                    type="button"
                    onClick={() => seleccionarEmpleado(emp)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: 10,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {displayName(emp)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- Tipo --- */}
        <div style={{ marginBottom: "15px" }}>
          <label>Tipo</label>
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              if (e.target.value === "Personal") {
                setEsIGSS(false);
                setOtro("");
              }
            }}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="" disabled>Seleccione tipo de ausencia</option>
            <option value="Enfermedad">Enfermedad</option>
            <option value="Examen">Exámenes</option>
            <option value="Personal">Asunto Personal</option>
          </select>
        </div>

        {/* --- IGSS / Otro --- */}
        {(tipo === "Enfermedad" || tipo === "Examen") && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
            <label style={{ flex: "0 0 60px" }}>IGSS:</label>
            <input
              type="checkbox"
              checked={esIGSS}
              onChange={(e) => {
                const checked = e.target.checked;
                setEsIGSS(checked);
                if (checked) {
                  setPrevOtro(otro);
                  setOtro("");
                } else {
                  setOtro(prevOtro);
                }
              }}
            />
            <input
              type="text"
              placeholder="Otro (nombre clínica)"
              value={otro}
              onChange={(e) => setOtro(e.target.value)}
              disabled={esIGSS}
              required={tipo !== "Personal" && !esIGSS}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: esIGSS ? "#f3f3f3" : "#fff",
              }}
            />
          </div>
        )}

        {/* --- Diagnóstico --- */}
        <div style={{ marginBottom: "15px" }}>
          <label>Diagnóstico</label>
          <input
            type="text"
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            placeholder="Ingrese diagnóstico o descripción"
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* --- Fechas --- */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <div style={{ flex: 1 }}>
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: `1px solid ${errorFechaFin ? "red" : "#ccc"}`,
              }}
            />
            {errorFechaFin && (
              <small style={{ color: "red", fontSize: "12px" }}>{errorFechaFin}</small>
            )}
          </div>
        </div>

        {/* --- Cantidad de días --- */}
        <div style={{ marginBottom: "15px" }}>
          <label>Cantidad de días</label>
          <input
            type="number"
            value={cantidadDias}
            readOnly
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f3f3f3",
            }}
          />
        </div>

        {/* --- Documento --- */}
        <div style={{ marginBottom: "20px" }}>
          <label>Documento (Comprobante)</label>
          {editingAusencia?.iddocumento && !archivo && (
            <div style={{ marginBottom: "6px", fontSize: "14px" }}>
              Archivo actual: <strong>{archivoActual || "Sin archivo"}</strong>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setArchivo(e.target.files[0])}
            required={!editingAusencia || !archivoActual}
            style={{
              width: "100%",
              padding: "5px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* --- Botón submit --- */}
        <button
          type="submit"
          disabled={subiendo}
          style={{
            width: "100%",
            padding: "12px",
            background: "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {subiendo ? "Guardando..." : editingAusencia ? "Actualizar" : "Guardar"}
        </button>
      </form>

      {/* --- Cerrar modal --- */}
      <button
        onClick={onClose}
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

export default AusenciaForm;
