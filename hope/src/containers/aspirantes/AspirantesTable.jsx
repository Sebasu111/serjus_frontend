import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalDetalle from "./ModalDetalle";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import Swal from "sweetalert2";
import ModalEliminarAspirante from "./ModalEliminar";

const API = "http://127.0.0.1:8000/api";

const pick = (o, ...keys) => {
  for (const k of keys) if (o && o[k] != null) return o[k];
};
const getId = (o) => pick(o, "id", "ididioma", "idIdioma", "idpueblocultura", "idPuebloCultura");
const getIdiomaName = (o) => pick(o, "nombreidioma", "nombreIdioma", "nombre", "descripcion", "label");
const getPuebloName = (o) => pick(o, "nombrepueblo", "nombrePueblo", "pueblocultura", "descripcion", "label");

const labelFrom = (id, list, type) => {
  if (!id) return "";
  const found = list.find((x) => String(getId(x)) === String(id));
  if (!found) return `#${id}`;
  return type === "idioma" ? getIdiomaName(found) : getPuebloName(found);
};

const thStyle = { borderBottom: "2px solid #eee", padding: 12, textAlign: "left", fontSize: 15 };
const tdStyle = { padding: 12, borderBottom: "1px solid #f0f0f0", fontSize: 15 };

const AspirantesTable = ({
  aspirantes,
  setAspirantes,
  paginaActual,
  totalPaginas,
  setPaginaActual,
  idiomas = [],
  pueblos = [],
  ocultarEstado = false,
}) => {
  const [modalAspirante, setModalAspirante] = useState(null);
  const [convocatorias, setConvocatorias] = useState([]);
  const [openCombo, setOpenCombo] = useState(null); // ID del combo abierto
  const [aspiranteSeleccionado, setAspiranteSeleccionado] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  

  useEffect(() => {
    fetchConvocatorias();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      const res = await axios.get(`${API}/convocatorias/`);
      const all = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setConvocatorias(all);
    } catch (err) {
      console.error("Error al cargar convocatorias:", err);
    }
  };

  const toggleMenu = (id) => {
    setOpenCombo((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "20px 30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ width: "100%" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Nombre",
                  "Género",
                  "Teléfono",
                  "Idioma",
                  "Pueblo/Cultura",
                  ...(ocultarEstado ? [] : ["Estado"]),
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      ...thStyle,
                      textAlign: h === "Estado" ? "center" : "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(aspirantes) && aspirantes.length ? (
                aspirantes.map((r) => {
                  const idioma = labelFrom(r.ididioma ?? r.idIdioma, idiomas, "idioma");
                  const pueblo = labelFrom(r.idpueblocultura ?? r.idPuebloCultura, pueblos, "pueblo");
                  const estado = !!r.estado;
                  const idAspirante = r.idaspirante ?? r.idAspirante ?? r.id;

                  return (
                    <tr key={idAspirante}>
                      <td
                        style={{
                          ...tdStyle,
                          color: "#0077cc",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() => setModalAspirante(r)}
                      >
                        {r.nombreaspirante} {r.apellidoaspirante}
                      </td>
                      <td style={tdStyle}>{r.genero}</td>
                      <td style={tdStyle}>{r.telefono}</td>
                      <td style={tdStyle}>{idioma}</td>
                      <td style={tdStyle}>{pueblo}</td>

                      {!ocultarEstado && (
                        <td
                          style={{
                            ...tdStyle,
                            textAlign: "center",
                            fontWeight: 600,
                            color: estado ? "green" : "red",
                          }}
                        >
                          {estado ? "Activo" : "Inactivo"}
                        </td>
                      )}

                      {/* 🔹 ComboBox Acciones */}
                      <td style={{ ...tdStyle, position: "relative" }}>
                        <div style={comboBoxStyles.container}>
                          <button
                            style={comboBoxStyles.button.base}
                            onClick={() => toggleMenu(idAspirante)}
                          >
                            Acciones ▾
                          </button>

                          {openCombo === idAspirante && (
                            <div style={comboBoxStyles.menu.container}>
                              {/* Ver detalle */}
                              <div
                                style={comboBoxStyles.menu.item.editar.base}
                                onClick={() => {
                                  setModalAspirante(r);
                                  setOpenCombo(null);
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    comboBoxStyles.menu.item.editar.hover.background)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    comboBoxStyles.menu.item.editar.base.background)
                                }
                              >
                                Ver detalle
                              </div>

                              {/* Ver CV */}
                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  if (r.cvs && r.cvs.length > 0) {
                                    window.open(r.cvs[0].archivo, "_blank");
                                  } else {
                                    alert("⚠ Este aspirante no tiene CV cargado.");
                                  }
                                  setOpenCombo(null);
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
                                Ver CV
                              </div>

                              {/* Eliminar */}
                                <div
                                  style={comboBoxStyles.menu.item.desactivar.base}
                                  onClick={() => {
                                    setAspiranteSeleccionado(r);
                                    setMostrarModalEliminar(true);
                                    setOpenCombo(null);
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
                                  Eliminar
                                </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={ocultarEstado ? 6 : 7} style={{ textAlign: "center", padding: 20 }}>
                    No hay aspirantes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*  Paginación */}
        {totalPaginas > 1 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPaginaActual(i + 1)}
                style={{
                  padding: "6px 12px",
                  margin: "0 5px",
                  borderRadius: 5,
                  cursor: "pointer",
                  background: paginaActual === i + 1 ? "#219ebc" : "#fff",
                  color: paginaActual === i + 1 ? "#fff" : "#219ebc",
                  border: "1px solid #219ebc",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {modalAspirante && (
        <ModalDetalle
          aspirante={modalAspirante}
          onClose={() => setModalAspirante(null)}
          idiomas={idiomas}
          pueblos={pueblos}
          convocatorias={convocatorias}
        />
      )}

      {mostrarModalEliminar && (
        <ModalEliminarAspirante
          aspiranteSeleccionado={aspiranteSeleccionado}
          mostrarModal={mostrarModalEliminar}
          setMostrarModal={(mostrar) => {
            setMostrarModalEliminar(mostrar);
            if (!mostrar) recargarAspirantes();
          }}
          setAspirantes={setAspirantes} 
          recargarAspirantes={recargarAspirantes} 
        />
      )}
    </>
  );
};

export default AspirantesTable;
