import React, { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { showToast } from "../../utils/toast.js";
import ModalDeseleccion from "../Induccion/ModalDeseleccion.jsx"; 
const API = process.env.REACT_APP_API_URL;

const displayName = (emp) => {
  const candidates = [
    emp?.nombreCompleto,
    [emp?.nombres, emp?.apellidos].filter(Boolean).join(" "),
    [emp?.nombre, emp?.apellido].filter(Boolean).join(" "),
    [emp?.primerNombre, emp?.segundoNombre, emp?.apellidoPaterno, emp?.apellidoMaterno]
      .filter(Boolean)
      .join(" "),
    [emp?.first_name, emp?.last_name].filter(Boolean).join(" "),
    emp?.full_name,
    emp?.displayName,
    emp?.nombre_empleado,
    emp?.name,
  ]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
  if (candidates[0]) return candidates[0];
  const id =
    emp?.idEmpleado ??
    emp?.idempleado ??
    emp?.id ??
    emp?.pk ??
    emp?.uuid ??
    emp?.codigo ??
    "?";
  return `Empleado #${id}`;
};

const GestionarDocumentosModal = ({ induccion, onClose }) => {
  const [documentosPDF, setDocumentosPDF] = useState([]);
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
  const [fechaasignado, setFechaAsignado] = useState("");
  const [busquedaEmpleados, setBusquedaEmpleados] = useState("");
  const [empleados, setEmpleados] = useState([]);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const empleadosOrdenados = useMemo(
    () =>
      [...empleados].sort((a, b) =>
        displayName(a).localeCompare(displayName(b), "es", {
          sensitivity: "base",
        })
      ),
    [empleados]
  );
  // ✅ Fecha local correcta
const getFechaLocalISO = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};


  const empleadosFiltrados = useMemo(() => {
    const texto = busquedaEmpleados.toLowerCase().trim();
    return empleadosOrdenados.filter((emp) => {
      const nombre = displayName(emp).toLowerCase();
      const coincideNombre = nombre.includes(texto);
      const yaSeleccionado = empleadosSeleccionados.includes(emp.idempleado || emp.id);
      return coincideNombre && !yaSeleccionado && emp.estado !== false;
    });
  }, [empleadosOrdenados, busquedaEmpleados, empleadosSeleccionados]);

  const toggleEmpleado = async (idEmpleado) => {
    const empId = Number(idEmpleado);

    if (empleadosSeleccionados.includes(empId)) {
      const empleadoObj = empleados.find(
        (e) => Number(e.idempleado || e.id) === empId
      );
      setEmpleadoAEliminar(empleadoObj);
      setMostrarConfirmacion(true);
      return;
    } else {
      setEmpleadosSeleccionados((prev) => [...prev, empId]);
    }
  };

  const confirmarDeseleccion = async () => {
    if (!empleadoAEliminar) return;
    const empId = Number(empleadoAEliminar.idempleado || empleadoAEliminar.id);

    try {
      const res = await axios.get(`${API}/inducciondocumentos/`);
      const raw = Array.isArray(res.data) ? res.data : res.data.results || [];

      const registro = raw.find(
        (r) =>
          Number(r.idinduccion) === Number(induccion.idinduccion) &&
          Number(r.idempleado) === empId &&
          r.estado === true
      );

      if (registro) {
        await axios.put(
          `${API}/inducciondocumentos/${registro.idinducciondocumento}/`,
          { ...registro, estado: false }
        );
        showToast("Empleado desasignado de la inducción", "info");
      }

      setEmpleadosSeleccionados((prev) => prev.filter((id) => id !== empId));
    } catch (e) {
      console.error("Error al desasignar empleado:", e);
      showToast("Error al desasignar el empleado", "error");
    } finally {
      setMostrarConfirmacion(false);
      setEmpleadoAEliminar(null);
    }
  };

  const getEmpleadoNombre = (empId) => {
    const emp = empleadosOrdenados.find(
      (e) => Number(e.idempleado || e.id) === Number(empId)
    );
    return emp ? displayName(emp) : `Empleado #${empId}`;
  };

  useEffect(() => {
    if (induccion) {
      setDocumentosPDF([]);
      setEmpleadosSeleccionados([]);
      fetchEmpleados();
      cargarDocumentosExistentes();
      const fechaActual = getFechaLocalISO();
      setFechaAsignado(fechaActual);
    }
  }, [induccion]);

  const cargarDocumentosExistentes = async () => {
    try {
      const resInduccionDocs = await axios.get(
        `${API}/inducciondocumentos/`
      );
      const induccionDocsRaw = Array.isArray(resInduccionDocs.data)
        ? resInduccionDocs.data
        : resInduccionDocs.data.results || [];

      const induccionDocs = induccionDocsRaw.filter(
        (d) =>
          Number(d.idinduccion) === Number(induccion.idinduccion) &&
          d.estado === true
      );

      if (induccionDocs.length > 0) {
        const empleadosAsignados = [
          ...new Set(induccionDocs.map((d) => d.idempleado).filter(Boolean)),
        ];
        setEmpleadosSeleccionados(empleadosAsignados);

        const documentosIds = [
          ...new Set(induccionDocs.map((d) => d.iddocumento).filter(Boolean)),
        ];

        if (documentosIds.length > 0) {
          const resDocumentos = await axios.get(`${API}/documentos/`);
          const todosDocumentos = Array.isArray(resDocumentos.data)
            ? resDocumentos.data
            : resDocumentos.data.results || [];

          const documentosAsignados = todosDocumentos.filter((doc) =>
            documentosIds.includes(doc.iddocumento || doc.id)
          );

          const archivosSimulados = documentosAsignados.map((doc) => ({
            name: `${doc.nombrearchivo}.pdf`,
            size: 0,
            type: "application/pdf",
            isExisting: true,
            iddocumento: doc.iddocumento || doc.id,
          }));

          setDocumentosPDF(archivosSimulados);
        }
      }
    } catch (error) {
      console.error("Error al cargar documentos existentes:", error);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setEmpleados(data.filter((item) => item.estado));
    } catch (e) {
      console.error("Error al cargar colaboradores:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Si no hay documentos ni empleados, desactiva todos los registros existentes
if (documentosPDF.length === 0 || empleadosSeleccionados.length === 0) {
  try {
    const res = await axios.get(`${API}/inducciondocumentos/`);
    const todos = Array.isArray(res.data) ? res.data : res.data.results || [];
    const activos = todos.filter(
      (r) =>
        Number(r.idinduccion) === Number(induccion.idinduccion) &&
        r.estado === true
    );

    for (const reg of activos) {
      await axios.put(
        `${API}/inducciondocumentos/${reg.idinducciondocumento}/`,
        { ...reg, estado: false }
      );
    }

    showToast("Inducción sin asignaciones, registros desactivados", "info");
    onClose(); // ✅ Cierra modal
    return;
  } catch (e) {
    console.error("Error desactivando registros vacíos:", e);
    showToast("Error al limpiar asignaciones", "error");
    return;
  }
}


      const idUsuario = Number(sessionStorage.getItem("idUsuario"));
      const documentosNuevos = documentosPDF.filter((doc) => !doc.isExisting);
      const documentosExistentes = documentosPDF.filter((doc) => doc.isExisting);

      for (const documentoPDF of documentosNuevos) {
        const formDataDocumento = new FormData();
        formDataDocumento.append("archivo", documentoPDF);
        const nombreSinExtension = documentoPDF.name.replace(/\.pdf$/i, "");
        formDataDocumento.append("nombrearchivo", nombreSinExtension);
        formDataDocumento.append("mimearchivo", "pdf");
        formDataDocumento.append("fechasubida", fechaasignado);
        formDataDocumento.append("estado", true);
        formDataDocumento.append("idusuario", idUsuario);
        formDataDocumento.append("idtipodocumento", 5);

        const responseDocumento = await axios.post(
          `${API}/documentos/`,
          formDataDocumento,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        const idDocumento =
          responseDocumento.data.iddocumento || responseDocumento.data.id;

        const promesasAsignacion = empleadosSeleccionados.map((empleadoId) => {
          const asignacionData = {
            idinduccion: Number(induccion.idinduccion),
            iddocumento: idDocumento,
            idempleado: empleadoId,
            fechaasignado: fechaasignado,
            estado: true,
            idusuario: idUsuario,
          };
          return axios.post(
            `${API}/inducciondocumentos/`,
            asignacionData
          );
        });

        await Promise.all(promesasAsignacion);
      }

      if (documentosExistentes.length > 0) {
        for (const doc of documentosExistentes) {
          const idDocumento = doc.iddocumento || doc.id;

          const resAsignaciones = await axios.get(
            `${API}/inducciondocumentos/?idinduccion=${induccion.idinduccion}`
          );
          const existentes = Array.isArray(resAsignaciones.data)
            ? resAsignaciones.data
            : resAsignaciones.data.results || [];

          const empleadosAsignadosActivos = existentes
            .filter((r) => r.iddocumento === idDocumento && r.estado === true)
            .map((r) => r.idempleado);

          const nuevos = empleadosSeleccionados.filter(
            (id) => !empleadosAsignadosActivos.includes(id)
          );

          for (const empleadoId of nuevos) {
            const asignacionData = {
              idinduccion: Number(induccion.idinduccion),
              iddocumento: idDocumento,
              idempleado: empleadoId,
              fechaasignado: fechaasignado,
              estado: true,
              idusuario: idUsuario,
            };
            await axios.post(
              `${API}/inducciondocumentos/`,
              asignacionData
            );
          }
        }
      }

      showToast("Cambios guardados correctamente", "success");
      await cargarDocumentosExistentes();
    } catch (error) {
      console.error("Error al asignar documentos:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        (error.response?.data && JSON.stringify(error.response.data)) ||
        "Error al asignar documentos de inducción";
      showToast(errorMessage, "error");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (documentosPDF.length + files.length > 20) {
      showToast("Máximo 20 documentos permitidos", "warning");
      return;
    }
    for (const file of files) {
      if (file.type !== "application/pdf") {
        showToast("Solo se permiten archivos PDF", "warning");
        e.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`El archivo ${file.name} no puede ser mayor a 10MB`, "warning");
        e.target.value = "";
        return;
      }
    }
    setDocumentosPDF((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeDocument = (index) => {
    const documento = documentosPDF[index];
    setDocumentosPDF((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "30px",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={24} color="#555" />
        </button>

        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
          Asignar Documentos - {induccion?.nombre}
        </h2>

        {/* Formulario principal */}
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>
            Asignar Documentos a Colaboradores
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Carga de documentos */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                Documentos PDF * (Máximo 20)
              </label>

              {documentosPDF.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>
                    Documentos seleccionados ({documentosPDF.length}/20):
                  </strong>
                  <div style={{ marginTop: "8px" }}>
                    {documentosPDF.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          marginBottom: "4px",
                          backgroundColor: "#e3f2fd",
                          border: "1px solid #2196f3",
                          borderRadius: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "bold",
                            }}
                          >
                            PDF
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "14px" }}>
                              {file.name}
                              {file.isExisting && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    color: "#28a745",
                                    marginLeft: "8px",
                                  }}
                                >
                                  (Ya asignado)
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                              }}
                            >
                              {file.isExisting
                                ? "Documento existente"
                                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 8px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✕ Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                Seleccione uno o más archivos PDF (máx. 10MB cada uno, 20
                documentos total)
              </small>
            </div>

            {/* Fecha */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "600",
                  }}
                >
                  Fecha de Asignado
                </label>
                <input
                  type="date"
                  value={fechaasignado}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #2196f3",
                    borderRadius: "4px",
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2",
                    fontWeight: "600",
                  }}
                />
              </div>
            </div>

            {/* Colaboradores */}
            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "600",
                }}
              >
                Colaboradores *
              </label>

              {empleadosSeleccionados.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <strong>
                    Seleccionados ({empleadosSeleccionados.length}):
                  </strong>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "5px",
                      marginTop: "5px",
                    }}
                  >
                    {empleadosSeleccionados.map((idEmpleado) => (
                      <span
                        key={idEmpleado}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#e3f2fd",
                          border: "1px solid #2196f3",
                          borderRadius: "12px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {getEmpleadoNombre(idEmpleado)}
                        <button
                          type="button"
                          onClick={() => toggleEmpleado(idEmpleado)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#666",
                            fontSize: "10px",
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar colaboradores por nombre..."
                  value={busquedaEmpleados}
                  onChange={(e) => setBusquedaEmpleados(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "none",
                    borderBottom: "1px solid #e5e5e5",
                    borderRadius: "6px 6px 0 0",
                    outline: "none",
                    backgroundColor: "#fff",
                  }}
                />

                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    padding: "8px",
                  }}
                >
                  {empleadosFiltrados.length > 0 ? (
                    empleadosFiltrados.map((emp) => (
                      <label
                        key={emp.idempleado || emp.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 6px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          transition: "background-color 0.2s",
                          backgroundColor: empleadosSeleccionados.includes(
                            emp.idempleado || emp.id
                          )
                            ? "#e3f2fd"
                            : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={empleadosSeleccionados.includes(
                            emp.idempleado || emp.id
                          )}
                          onChange={() =>
                            toggleEmpleado(emp.idempleado || emp.id)
                          }
                          style={{ margin: 0 }}
                        />
                        <span>{displayName(emp)}</span>
                      </label>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      {busquedaEmpleados
                        ? "No se encontraron colaboradores disponibles con ese nombre"
                        : "No hay colaboradores disponibles"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#219ebc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Guardar
            </button>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de desasignación */}
      {mostrarConfirmacion && (
        <ModalDeseleccion
          empleado={empleadoAEliminar}
          onConfirm={confirmarDeseleccion}
          onCancel={() => {
            setMostrarConfirmacion(false);
            setEmpleadoAEliminar(null);
          }}
        />
      )}
    </div>
  );
};

export default GestionarDocumentosModal;
