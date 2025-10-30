import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ConfirmModal from "./ConfirmModal";

const AusenciaTable = ({
  ausencias = [],
  empleados = [],
  onEdit,
  onActivate,
   onClickColaborador,
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

  
  const calcularDias = (inicio, fin) => {
    if (!inicio || !fin) return "-";
    const diff = Math.ceil(
      (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 ? diff + 1 : "-";
  };

  // Ordenar del más reciente al más antiguo
  const ausenciasOrdenadas = [...ausencias].sort(
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
            <th style={{ padding: "10px", textAlign: "left" }}>Colaborador/a</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Tipo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Cantidad de días</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Diagnóstico</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Estado</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ausenciasOrdenadas.length > 0 ? (
            ausenciasOrdenadas.map((row) => {
              const empleado = empleados.find(
                (e) => e.idempleado === row.idempleado
              ) || {};

              return (
                <tr key={row.idausencia}>
                  <td
  style={{
    padding: "10px",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: 700, // 🔹 negrita
    textDecoration: "none"
  }}
  onClick={() => onClickColaborador && onClickColaborador(row)}
>
  {empleado.nombre
    ? `${empleado.nombre} ${empleado.apellido || ""}`
    : "-"}
</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f0f0f0" }}>
                    {row.tipo || "-"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {row.cantidaddias || calcularDias(row.fechainicio, row.fechafin)}
                  </td>
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
                    {row.diagnostico || "-"}
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
                        onClick={() => toggleMenu(row.idausencia)}
                      >
                        Opciones ▾
                      </button>

                      {openMenuId === row.idausencia && (
  <div
    style={{
      ...comboBoxStyles.menu.container,
      zIndex: 1000, // 🔹 menor que el modal (modal zIndex 4000)
      position: "absolute", // aseguramos que se posicione sobre la tabla
    }}
  >
    <div
      style={{
        ...comboBoxStyles.menu.item.editar.base,
        ...(row.estado ? {} : comboBoxStyles.menu.item.editar.disabled),
      }}
      onClick={() => {
        if (row.estado) {
          onEdit && onEdit(row);
          setOpenMenuId(null); // cerrar menú al hacer clic
        }
      }}
    >
      Editar
    </div>

    {row.estado ? (
      <div
        style={{
          ...comboBoxStyles.menu.item.desactivar.base,
        }}
        onClick={() => abrirModal(row, "desactivar")}
      >
        Desactivar
      </div>
    ) : (
      <div
        style={{
          ...comboBoxStyles.menu.item.activar.base,
        }}
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
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No hay ausencias registradas
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
            onActivate && onActivate(registroSeleccionado.idausencia);
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

export default AusenciaTable;
