import React, { useState } from "react";
import axios from "axios";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ModalEmpleadosAsignados from "./ModalEmpleadosAsignados";

const CapacitacionesTable = ({
  capacitaciones,
  handleEdit,
  handleDelete,
  handleActivate,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const handleVerEmpleados = async (capacitacion) => {
    try {
      setEventoSeleccionado(capacitacion);
      setLoadingEmpleados(true);
      setModalVisible(true);

      const res = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
      const data = res.data.results || res.data;

      const asignados = data.filter(
        (item) => Number(item.idcapacitacion) === Number(capacitacion.idcapacitacion || capacitacion.id)
      );

      const empleadosRes = await axios.get("http://127.0.0.1:8000/api/empleados/");
      const empleados = empleadosRes.data.results || empleadosRes.data;

      const listaFinal = asignados
        .map((asig) => {
          const emp = empleados.find((e) => Number(e.idempleado) === Number(asig.idempleado));
          return emp
            ? {
                nombre: emp.nombre,
                apellido: emp.apellido,
                asistencia: asig.asistencia,
                observacion: asig.observacion,
                fechaenvio: asig.fechaenvio,
              }
            : null;
        })
        .filter(Boolean);


      setEmpleadosAsignados(listaFinal);
    } catch (error) {
      console.error("Error al obtener empleados asignados:", error);
      setEmpleadosAsignados([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setEventoSeleccionado(null);
    setEmpleadosAsignados([]);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "30px 40px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Evento</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Lugar</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Fechas</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "left" }}>Institución</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "right" }}>Monto</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Estado</th>
            <th style={{ borderBottom: "2px solid #eee", padding: "10px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {capacitaciones.length > 0 ? (
            capacitaciones.map((c) => {
              const id = c.idcapacitacion || c.id;
              return (
                <tr key={id}>
                  {/* 🔹 Nombre del evento sin subrayado */}
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#007bff",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                    onClick={() => handleVerEmpleados(c)}
                  >
                    {c.nombreevento}
                  </td>

                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.lugar}</td>
                  <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                    {formatDate(c.fechainicio)} a {formatDate(c.fechafin)}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>{c.institucionfacilitadora}</td>
                  <td style={{ padding: "10px", textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>
                    {c.montoejecutado || 0}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: "600",
                      color: c.estado ? "#28a745" : "#F87171",
                    }}
                  >
                    {c.estado ? "Activo" : "Inactivo"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={comboBoxStyles.container}>
                      <button
                        style={comboBoxStyles.button.base}
                        onClick={() => toggleMenu(id)}
                      >
                        Opciones ▾
                      </button>
                      {openMenuId === id && (
                        <div style={comboBoxStyles.menu.container}>
                          <div
                            style={{
                              ...comboBoxStyles.menu.item.editar.base,
                              ...(c.estado ? {} : comboBoxStyles.menu.item.editar.disabled),
                            }}
                            onClick={() => c.estado && handleEdit(c)}
                          >
                            Editar
                          </div>
                          {c.estado && (
                            <div
                              style={comboBoxStyles.menu.item.desactivar.base}
                              onClick={() => handleDelete(c)}
                            >
                              Desactivar
                            </div>
                          )}
                          {!c.estado && (
                            <div
                              style={comboBoxStyles.menu.item.activar.base}
                              onClick={() => handleActivate(id)}
                            >
                              Activar
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No hay capacitaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaActual(i + 1)}
              style={{
                margin: "0 5px",
                padding: "6px 12px",
                border: "1px solid #007bff",
                background: paginaActual === i + 1 ? "#007bff" : "#fff",
                color: paginaActual === i + 1 ? "#fff" : "#007bff",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal separado */}
      {modalVisible && (
        <ModalEmpleadosAsignados
          visible={modalVisible}
          onClose={closeModal}
          empleados={empleadosAsignados}
          evento={eventoSeleccionado}
          loading={loadingEmpleados}
        />
      )}
    </div>
  );
};

export default CapacitacionesTable;
