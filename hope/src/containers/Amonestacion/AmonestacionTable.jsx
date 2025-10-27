import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal";

const AmonestacionTable = ({
  amonestaciones = [],
  empleados = [],
  handleEdit,
  handleActivate,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [modoModal, setModoModal] = useState("desactivar");

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const abrirModal = (row, modo) => {
    setRegistroSeleccionado(row);
    setModoModal(modo);
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const amonestacionesOrdenadas = [...amonestaciones].sort(
    (a, b) => new Date(b.createdat) - new Date(a.createdat)
  );

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px 30px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>Empleado</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Tipo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Fecha</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Motivo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Documento</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Estado</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {amonestacionesOrdenadas.length > 0 ? (
            amonestacionesOrdenadas.map((row) => {
              const empleado = empleados.find((e) => e.idempleado === row.idempleado) || {};
              return (
                <tr key={row.idamonestacion}>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                    {empleado.nombre && empleado.apellido
                      ? `${empleado.nombre} ${empleado.apellido}`
                      : row.idempleado || "-"}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                    {row.tipo}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "center",
                    }}
                  >
                    {formatDate(row.fechaamonestacion)}
                  </td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                    {row.motivo}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                      textAlign: "center",
                    }}
                  >
                    {row.iddocumento || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      color: row.estado ? "green" : "red",
                      fontWeight: 600,
                    }}
                  >
                    {row.estado ? "Activo" : "Inactivo"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <div style={comboBoxStyles.container}>
                      <button
                        style={comboBoxStyles.button.base}
                        onClick={() => toggleMenu(row.idamonestacion)}
                      >
                        Opciones ▾
                      </button>

                      {openMenuId === row.idamonestacion && (
                        <div style={comboBoxStyles.menu.container}>
                          <div
                            style={{
                              ...comboBoxStyles.menu.item.editar.base,
                              ...(row.estado
                                ? {}
                                : comboBoxStyles.menu.item.editar.disabled),
                            }}
                            onClick={() => {
                              if (row.estado) {
                                handleEdit && handleEdit(row);
                                setOpenMenuId(null);
                              }
                            }}
                          >
                            Editar
                          </div>

                          {row.estado ? (
                            <div
                              style={comboBoxStyles.menu.item.desactivar.base}
                              onClick={() => abrirModal(row, "desactivar")}
                            >
                              Desactivar
                            </div>
                          ) : (
                            <div
                              style={comboBoxStyles.menu.item.activar.base}
                              onClick={() => abrirModal(row, "activar")}
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
                No hay amonestaciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔢 Paginación */}
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

      {modalOpen && (
        <ConfirmModal
          registro={registroSeleccionado}
          modo={modoModal}
          onConfirm={() => {
            const activar = modoModal === "activar";
            handleActivate &&
              handleActivate(registroSeleccionado.idamonestacion, activar);
            setModalOpen(false);
            setRegistroSeleccionado(null);
          }}
          onCancel={() => {
            setModalOpen(false);
            setRegistroSeleccionado(null);
          }}
        />
      )}
    </div>
  );
};

export default AmonestacionTable;
