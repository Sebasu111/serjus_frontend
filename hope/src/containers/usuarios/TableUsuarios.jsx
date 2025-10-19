// components/usuarios/TableUsuarios.jsx
import React, { useState } from "react";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ModalConfirmacion from "./ModalConfirmacion";

const TableUsuarios = ({
  usuariosPaginados,
  handleEdit,
  handleDelete,
  handleActivate,
  idUsuarioLogueado,
  paginaActual,
  totalPaginas,
  setPaginaActual,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modo, setModo] = useState("desactivar"); // "desactivar" o "activar"

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const abrirModal = (usuario, accion) => {
    setUsuarioSeleccionado(usuario);
    setModo(accion);
    setMostrarConfirmacion(true);
    setOpenMenuId(null); // cerrar menú
  };

  const confirmarAccion = () => {
    if (modo === "desactivar") {
      handleDelete(usuarioSeleccionado.idusuario);
    } else {
      handleActivate(usuarioSeleccionado.idusuario);
    }
    setMostrarConfirmacion(false);
  };

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
            {["Usuario", "Estado", "Acciones"].map((h) => (
              <th
                key={h}
                style={{
                  borderBottom: "2px solid #eee",
                  padding: "10px",
                  textAlign: "center",
                  fontWeight: "600",
                  background: "#f8f9fa",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usuariosPaginados.length > 0 ? (
            usuariosPaginados.map((u) => {
              const isActive = u.estado;

              return (
                <tr key={u.idusuario}>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {u.nombreusuario}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      width: "120px",
                      color: isActive ? "green" : "red",
                      fontWeight: "600",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {isActive ? "Activo" : "Inactivo"}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* ComboBox de acciones */}
                    <div style={comboBoxStyles.container}>
                      <button
                        onClick={() => toggleMenu(u.idusuario)}
                        style={{
                          ...comboBoxStyles.button.base,
                          background: isActive
                            ? comboBoxStyles.button.base.background
                            : "#e5e7eb",
                          cursor: "pointer",
                        }}
                      >
                        Opciones ▾
                      </button>

                      {openMenuId === u.idusuario && (
                        <div style={comboBoxStyles.menu.container}>
                          {/* Editar */}
                          <div
                            onClick={() => handleEdit(u)}
                            style={{
                              ...comboBoxStyles.menu.item.editar.base,
                              ...(!u.estado
                                ? comboBoxStyles.menu.item.editar.disabled
                                : {}),
                            }}
                            onMouseEnter={(e) =>
                              u.estado &&
                              (e.currentTarget.style.background =
                                comboBoxStyles.menu.item.editar.hover.background)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                comboBoxStyles.menu.item.editar.base.background)
                            }
                          >
                            Editar
                          </div>

                          {/* Activar o Desactivar */}
                          {isActive ? (
                            <div
                              onClick={() => abrirModal(u, "desactivar")}
                              style={{
                                ...comboBoxStyles.menu.item.desactivar.base,
                                cursor: "pointer",
                                opacity: 1,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  comboBoxStyles.menu.item.desactivar.hover.background)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  comboBoxStyles.menu.item.desactivar.base.background)
                              }
                            >
                              Desactivar
                            </div>
                          ) : (
                            <div
                              onClick={() => abrirModal(u, "activar")}
                              style={{
                                ...comboBoxStyles.menu.item.activar.base,
                                cursor: "pointer",
                                opacity: 1,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  comboBoxStyles.menu.item.activar.hover.background)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  comboBoxStyles.menu.item.activar.base.background)
                              }
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
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                No hay usuarios registrados
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

      {/* Modal de confirmación */}
      <ModalConfirmacion
        mostrarConfirmacion={mostrarConfirmacion}
        setMostrarConfirmacion={setMostrarConfirmacion}
        usuarioSeleccionado={usuarioSeleccionado}
        confirmarDesactivacion={confirmarAccion}
        modo={modo}
      />
    </div>
  );
};

export default TableUsuarios;
