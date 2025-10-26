import React, { useState, useRef, useEffect } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import { showToast } from "../../utils/toast";
import ConfirmModal from "./ConfirmModal";

const ConvocatoriasTable = ({
  mensaje,
  paginadas,
  busqueda,
  setBusqueda,
  paginaActual,
  setPaginaActual,
  elementosPorPagina,
  setElementosPorPagina,
  totalPaginas,
  handleEdit,
  toggleEstado,
  setMostrarFormulario
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const containerRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [descripcionSeleccionada, setDescripcionSeleccionada] = useState("");
  const [confirmModal, setConfirmModal] = useState({ open: false, row: null, modo: "" });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const openModal = (descripcion) => {
    setDescripcionSeleccionada(descripcion);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDescripcionSeleccionada("");
  };

  const tdCenter = { padding: 10, borderBottom: "1px solid #f0f0f0", textAlign: "center", whiteSpace: "nowrap" };
  const tdCenterLongText = {
    padding: 10,
    borderBottom: "1px solid #f0f0f0",
    textAlign: "center",
    maxWidth: 250,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    color: "#007bff"
  };

  const btnPrimary = {
    padding: 10,
    background: "#219ebc",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }} ref={containerRef}>
      {mensaje && (
        <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", fontWeight: "bold" }}>
          {mensaje}
        </p>
      )}

      {/* Buscador + Nueva Convocatoria */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <input
          placeholder="Buscar convocatoria..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button onClick={() => setMostrarFormulario(true)} style={btnPrimary}>
          Nueva Convocatoria
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "20px 30px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead>
            <tr>
              {["Nombre", "Puesto", "Descripción", "Inicio", "Fin", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ borderBottom: "2px solid #eee", padding: 10, textAlign: "center" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginadas.length ? (
              paginadas.map((r) => (
                <tr key={r.idconvocatoria}>
                  <td style={{ ...tdCenter, whiteSpace: "normal", wordBreak: "break-word" }}>{r.nombreconvocatoria}</td>
                  <td style={{ ...tdCenter, whiteSpace: "normal", wordBreak: "break-word" }}>{r.nombrepuesto || "-"}</td>
                  <td
                    style={{ ...tdCenterLongText, whiteSpace: "normal", wordBreak: "break-word", maxWidth: "100px" }}
                    onClick={() => openModal(r.descripcion)}
                  >
                    {r.descripcion.length > 50 ? r.descripcion.substring(0, 50) + "..." : r.descripcion}
                  </td>
                  <td style={tdCenter}>{new Date(r.fechainicio).toLocaleDateString("es-ES")}</td>
                  <td style={tdCenter}>{r.fechafin ? new Date(r.fechafin).toLocaleDateString("es-ES") : "-"}</td>
                  <td style={{ ...tdCenter, color: r.estado ? "green" : "red" }}>{r.estado ? "Activo" : "Inactivo"}</td>
                  <td style={tdCenter}>
                    <div style={comboBoxStyles.container}>
                      <button onClick={() => toggleMenu(r.idconvocatoria)} style={comboBoxStyles.button.base}>
                        Opciones ▾
                      </button>
                      {openMenuId === r.idconvocatoria && (
                        <div style={comboBoxStyles.menu.container}>
                          <div
                            onClick={() => r.estado && handleEdit(r)}
                            disabled={!r.estado}
                            style={{
                              ...comboBoxStyles.menu.item.editar.base,
                              ...(r.estado ? {} : comboBoxStyles.menu.item.editar.disabled)
                            }}
                            onMouseEnter={e => { if (r.estado) e.currentTarget.style.background = comboBoxStyles.menu.item.editar.hover.background; }}
                            onMouseLeave={e => { if (r.estado) e.currentTarget.style.background = comboBoxStyles.menu.item.editar.base.background; }}
                            title={r.estado ? "Editar convocatoria" : "No se puede editar una convocatoria inactiva"}
                          >
                            Editar
                          </div>
                          <div
                            onClick={() => {
                              setConfirmModal({ open: true, row: r, modo: r.estado ? "desactivar" : "activar" });
                              setOpenMenuId(null);
                            }}
                            style={r.estado ? comboBoxStyles.menu.item.desactivar.base : comboBoxStyles.menu.item.activar.base}
                          >
                            {r.estado ? "Desactivar" : "Activar"}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                  Sin registros
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación centrada */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 15, gap: 5 }}>
          {totalPaginas > 1 &&
            Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  border: "1px solid #219ebc",
                  background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                  color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                  cursor: "pointer"
                }}
              >
                {i + 1}
              </button>
            ))}
        </div>
      </div>

      {/* Selector “Mostrar X elementos” */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, gap: 5 }}>
        <span>Mostrar: </span>
        <input
          type="number"
          min="1"
          value={elementosPorPagina}
          onChange={(e) => setElementosPorPagina(Math.max(Number(e.target.value), 1))}
          style={{ width: 80, padding: 6, borderRadius: 6, border: "1px solid #ccc", textAlign: "center" }}
        />
      </div>

      {/* Modal descripción */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
              position: "relative"
            }}
          >
            <h3>Descripción completa</h3>
            <p>{descripcionSeleccionada}</p>
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "red",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "4px 8px",
                cursor: "pointer"
              }}
            >
              X
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      {confirmModal.open && (
        <ConfirmModal
          convocatoria={confirmModal.row}
          modo={confirmModal.modo}
          onConfirm={() => {
            const nuevoEstado = !confirmModal.row.estado;
            toggleEstado(confirmModal.row, nuevoEstado);

            showToast(
              nuevoEstado ? "Convocatoria activada" : "Convocatoria desactivada",
              "success"
            );

            setConfirmModal({ open: false, row: null, modo: "" });
          }}
          onCancel={() => setConfirmModal({ open: false, row: null, modo: "" })}
        />
      )}
    </div>
  );
};

export default ConvocatoriasTable;
