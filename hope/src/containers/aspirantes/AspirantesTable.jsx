import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalDetalle from "./ModalDetalle";
import { comboBoxStyles } from "../../stylesGenerales/combobox";
import ModalEliminarAspirante from "./ModalEliminar";
import { showToast } from "../../utils/toast"; // si ya usás showToast en otros lados

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
  const [postulaciones, setPostulaciones] = useState([]);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState(""); // 🧩 NUEVO
  const [openCombo, setOpenCombo] = useState(null);
  const [aspiranteSeleccionado, setAspiranteSeleccionado] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  const recargarAspirantes = async () => {
    try {
      const res = await axios.get(`${API}/aspirantes/`);
      const all = Array.isArray(res.data) ? res.data : res.data.results || [];
      setAspirantes(all);
    } catch (err) {
      console.error("Error al recargar aspirantes:", err);
    }
  };

  useEffect(() => {
    fetchConvocatorias();
    fetchPostulaciones();
  }, []);

  const fetchConvocatorias = async () => {
    try {
      const res = await axios.get(`${API}/convocatorias/`);
      const all = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setConvocatorias(all.filter((c) => c.estado)); // Solo activas
    } catch (err) {
      console.error("Error al cargar convocatorias:", err);
    }
  };

  const fetchPostulaciones = async () => {
    try {
      const res = await axios.get(`${API}/postulaciones/`);
      const all = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
        ? res.data.results
        : [];
      setPostulaciones(all);
    } catch (err) {
      console.error("Error al cargar postulaciones:", err);
    }
  };

  const toggleMenu = (id) => {
    setOpenCombo((prev) => (prev === id ? null : id));
  };

  // 🔹 Filtrar aspirantes por convocatoria seleccionada
  const aspirantesFiltrados = React.useMemo(() => {
    if (!convocatoriaSeleccionada) return aspirantes;
    const postulados = postulaciones
      .filter((p) => String(p.idconvocatoria) === String(convocatoriaSeleccionada))
      .map((p) => p.idaspirante);

    return aspirantes.filter((a) => postulados.includes(a.idaspirante));
  }, [aspirantes, postulaciones, convocatoriaSeleccionada]);

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
        {/* 🔹 Filtro por convocatoria */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontWeight: 600 }}>Filtrar por convocatoria:</label>
          <select
            value={convocatoriaSeleccionada}
            onChange={(e) => setConvocatoriaSeleccionada(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              minWidth: 250,
            }}
          >
            <option value="">— Todas las convocatorias —</option>
            {convocatorias.map((c) => (
              <option key={c.idconvocatoria} value={c.idconvocatoria}>
                {c.nombreconvocatoria}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "100%" }}>
          <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Nombre", "Género", "Teléfono", "Idioma", "Pueblo/Cultura", ...(ocultarEstado ? [] : ["Estado"]), "Acciones"].map((h) => (
                  <th key={h} style={{ ...thStyle, textAlign: h === "Estado" ? "center" : "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(aspirantesFiltrados) && aspirantesFiltrados.length ? (
                aspirantesFiltrados.map((r) => {
                  const idioma = labelFrom(r.ididioma ?? r.idIdioma, idiomas, "idioma");
                  const pueblo = labelFrom(r.idpueblocultura ?? r.idPuebloCultura, pueblos, "pueblo");
                  const estado = !!r.estado;
                  const idAspirante = r.idaspirante ?? r.idAspirante ?? r.id;

                  return (
                    <tr key={idAspirante}>
                      <td
                        style={{ ...tdStyle, color: "#0077cc", cursor: "pointer", fontWeight: 600 }}
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
                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  if (r.cvs && r.cvs.length > 0) {
                                    window.open(r.cvs[0].archivo, "_blank");
                                  } else {
                                    showToast("Este aspirante no tiene CV cargado.", "warning");
                                  }
                                  setOpenCombo(null);
                                }}
                              >
                                Ver CV
                              </div>

                              <div
                                style={comboBoxStyles.menu.item.activar.base}
                                onClick={() => {
                                  const seleccionados = JSON.parse(localStorage.getItem("aspirantesSeleccionados") || "[]");
                                  const existe = seleccionados.some((a) => a.id === r.idaspirante);
                                  let nuevos;
                                  if (existe) {
                                    nuevos = seleccionados.filter((a) => a.id !== r.idaspirante);
                                  } else {
                                    if (seleccionados.length >= 3) {
                                      showToast("Solo puedes seleccionar hasta 3 aspirantes para la evaluación.", "error");
                                      setOpenCombo(null);
                                      return;
                                    }
                                    nuevos = [...seleccionados, { id: r.idaspirante, nombre: `${r.nombreaspirante} ${r.apellidoaspirante}` }];
                                  }
                                  localStorage.setItem("aspirantesSeleccionados", JSON.stringify(nuevos));
                                  showToast(
                                    existe
                                      ? "Aspirante removido de la evaluación."
                                      : "Aspirante seleccionado para la evaluación.",
                                    "success"
                                  );
                                  setOpenCombo(null);
                                }}
                              >
                                Seleccionar para Evaluación
                              </div>

                              <div
                                style={comboBoxStyles.menu.item.desactivar.base}
                                onClick={() => {
                                  setAspiranteSeleccionado(r);
                                  setMostrarModalEliminar(true);
                                  setOpenCombo(null);
                                }}
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
                    No hay aspirantes {convocatoriaSeleccionada ? "para esta convocatoria" : ""}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
