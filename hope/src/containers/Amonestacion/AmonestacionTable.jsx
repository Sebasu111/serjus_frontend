import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal";
import AmonestacionModal from "./AmonestacionModal.jsx"; 

const AmonestacionTable = ({
  amonestaciones = [],
  empleados = [],
  onSubirCarta, 
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [amonestacionSeleccionada, setAmonestacionSeleccionada] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const amonestacionesOrdenadas = [...amonestaciones].sort(
    (a, b) => new Date(b.createdat) - new Date(a.createdat)
  );

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    const fechaLocal = new Date(
      fecha.getTime() + fecha.getTimezoneOffset() * 60000
    );
    const dia = fechaLocal.getDate();
    const mes = fechaLocal.getMonth() + 1;
    const anio = fechaLocal.getFullYear();
    return `${dia}-${mes}-${anio}`;
  };

  const abrirModal = (amonestacion, empleado) => {
    setAmonestacionSeleccionada(amonestacion);
    setEmpleadoSeleccionado(empleado);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setAmonestacionSeleccionada(null);
    setEmpleadoSeleccionado(null);
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px 30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#023047", color: "white" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Colaborador/a</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Tipo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Fecha</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Motivo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Estado</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {amonestacionesOrdenadas.length > 0 ? (
            amonestacionesOrdenadas.map((row) => {
              const empleado =
                empleados.find((e) => e.idempleado === row.idempleado) || {};
              const estadoTexto = row.estado ? "Activo" : "Inactivo";
              const colorEstado = row.estado ? "green" : "red";

              return (
                <tr key={row.idamonestacion}>
                  {/* Colaborador */}
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                    onClick={() => abrirModal(row, empleado)}
                  >
                    {empleado.nombre
                      ? `${empleado.nombre} ${empleado.apellido || ""}`
                      : "-"}
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                    {row.tipo || "-"}
                  </td>

                  {/* Fecha */}
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {formatFecha(row.fechaamonestacion)}
                  </td>

                  {/* Motivo */}
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      maxWidth: "250px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {row.motivo || "-"}
                  </td>

                  {/* Estado */}
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      color: colorEstado,
                      fontWeight: 600,
                    }}
                  >
                    {estadoTexto}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {row.estado && (
                      <div style={comboBoxStyles.container}>
                        <button
                          style={comboBoxStyles.button.base}
                          onClick={() => toggleMenu(row.idamonestacion)}
                        >
                          Opciones ▾
                        </button>

                        {openMenuId === row.idamonestacion && (
                          <div
                            style={{
                              ...comboBoxStyles.menu.container,
                              zIndex: 1000,
                              position: "absolute",
                            }}
                          >
                            <div
                              style={{
                                ...comboBoxStyles.menu.item.editar.base,
                              }}
                              onClick={() => {
                                setOpenMenuId(null);
                                onSubirCarta && onSubirCarta(row);
                              }}
                            >
                              Subir carta
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No hay amonestaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaActual(i + 1)}
              style={{
                margin: "0 5px",
                padding: "6px 12px",
                border: "1px solid #219ebc",
                background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/*Modal de Detalle de Amonestación */}
      {modalVisible && amonestacionSeleccionada && (
        <AmonestacionModal
          visible={modalVisible}
          onClose={cerrarModal}
          amonestacion={amonestacionSeleccionada}
          empleado={empleadoSeleccionado}
        />
      )}
    </div>
    
  );
};

export default AmonestacionTable;
