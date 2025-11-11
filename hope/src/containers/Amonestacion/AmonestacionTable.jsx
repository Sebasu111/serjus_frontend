import React, { useState, useMemo } from "react";
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
  const [busqueda, setBusqueda] = useState("");

  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const formatFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    const fechaLocal = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);
    const dia = fechaLocal.getDate().toString().padStart(2, "0");
    const mes = (fechaLocal.getMonth() + 1).toString().padStart(2, "0");
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

 // 🔍 Filtrado de búsqueda global
const amonestacionesFiltradas = useMemo(() => {
  // 🔸 Normaliza el término (quita tildes y espacios dobles)
  const term = busqueda
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!term)
    return [...amonestaciones].sort(
      (a, b) => new Date(b.createdat) - new Date(a.createdat)
    );

  return [...amonestaciones]
    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
    .filter((row) => {
      const empleado =
        empleados.find((e) => e.idempleado === row.idempleado) || {};
      const colaborador = `${empleado.nombre || ""} ${empleado.apellido || ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const tipo = (row.tipo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const fecha = formatFecha(row.fechaamonestacion)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const motivo = (row.motivo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const estadoTexto = (row.estado ? "activo" : "inactivo")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const idDoc = row.iddocumento || row.idDocumento;
      const tieneCarta = Number(idDoc) > 0;

      // 🟩 Texto base de carta
      const cartaTexto = tieneCarta ? "subida" : "aun no subida";

      // 🧠 Reglas para buscar cartas
      const buscaSubida =
        term === "sub" ||
        term === "subi" ||
        term === "subid" ||
        term === "subida" ||
        term.startsWith("sub");

      // "no subida", "aun no subida", "aún no subida", "aun subida"
      const buscaNoSubida =
        term.includes("no subida") ||
        term.includes("aun no subida") ||
        term.includes("aun subida") ||
        term.includes("aun") && term.includes("subida");

      // 🧩 Coincidencia general
      const coincideGeneral =
        colaborador.includes(term) ||
        tipo.includes(term) ||
        fecha.includes(term) ||
        motivo.includes(term) ||
        estadoTexto.includes(term);

      // 🧩 Coincidencia específica por carta
      let coincideCarta = false;
      if (buscaSubida) {
        coincideCarta = tieneCarta; // solo las subidas
      } else if (buscaNoSubida) {
        coincideCarta = !tieneCarta; // solo las no subidas
      } else {
        coincideCarta = cartaTexto.includes(term); // búsqueda general
      }

      return coincideGeneral || coincideCarta;
    });
}, [busqueda, amonestaciones, empleados]);




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
      {/* 🔍 Campo de búsqueda */}
      <div style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Buscar por colaborador, tipo, fecha, motivo, carta o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%", // 🔸 ocupa todo el ancho de la tabla
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "15px",
            boxSizing: "border-box",
          }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#023047", color: "white" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Colaborador/a</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Tipo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Fecha</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Motivo</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Carta</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Estado</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {amonestacionesFiltradas.length > 0 ? (
            amonestacionesFiltradas.map((row) => {
              const empleado = empleados.find((e) => e.idempleado === row.idempleado) || {};
              const estadoTexto = row.estado ? "Activo" : "Inactivo";
              const colorEstado = row.estado ? "green" : "red";
              const idDoc = row.iddocumento || row.idDocumento;
              const tieneCarta = Number(idDoc) > 0;

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

                  {/* Carta */}
                  <td
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #f0f0f0",
                      fontWeight: 600,
                    }}
                  >
                    {tieneCarta ? (
                      <span style={{ color: "green" }}>Subida</span>
                    ) : (
                      <span style={{ color: "red" }}>Aún no subida</span>
                    )}
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
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No se encontraron resultados para "{busqueda}"
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal de detalle */}
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
