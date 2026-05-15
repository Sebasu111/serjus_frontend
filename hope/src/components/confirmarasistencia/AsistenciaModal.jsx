import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { showToast } from "../../utils/toast";
import "./AsistenciaModal.css";

const API = process.env.REACT_APP_API_URL;
const token = sessionStorage.getItem("token");

const AsistenciaModal = ({ show, onClose, capacitacion, onGuardar, modoInicial = null }) => {
  const [archivo, setArchivo] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [modo, setModo] = useState(modoInicial);
  const [diplomas, setDiplomas] = useState([]);
  const [requiereInforme, setRequiereInforme] = useState(false);
  const [informe, setInforme] = useState(null);
  const [objetivos, setObjetivos] = useState("");
  const [tematicas, setTematicas] = useState("");
  const [metodologia, setMetodologia] = useState("");
  const [conclusiones, setConclusiones] = useState("");
  const [aciertos, setAciertos] = useState("");
  const [utilidad, setUtilidad] = useState("");
  const [resultadoInstitucion, setResultadoInstitucion] = useState("");
  const [resultadoParticipante, setResultadoParticipante] = useState("");
  const [compromiso, setCompromiso] = useState("");
  const [seguimiento, setSeguimiento] = useState("");
  const [anexos, setAnexos] = useState([]);

  const handleAnexos = (files) => {

    const valid = files.filter(
      (f) =>
        f.type.includes("pdf")
    );

    setAnexos((prev) => [...prev, ...valid]);
  };

  const subirAnexosInforme = async () => {

    if (!anexos.length || !informe) return;

    const idUsuario = Number(
      sessionStorage.getItem("idUsuario")
    );

    for (const file of anexos) {

      const formData = new FormData();

      formData.append("archivo", file);

      formData.append(
        "nombrearchivo",
        file.name
      );

      formData.append(
        "mimearchivo",
        "pdf"
      );

      formData.append(
        "fechasubida",
        new Date().toISOString().slice(0, 10)
      );

      formData.append("estado", true);

      formData.append("idusuario", idUsuario);

      formData.append("idtipodocumento", 4);

      formData.append(
        "idempleado",
        capacitacion.idempleado
      );

      const resDoc = await axios.post(
        `${API}/documentos/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const idDocumento =
        resDoc.data.iddocumento;

      await axios.post(
        `${API}/informecapacitaciondocumento/`,
        {
          idinformecapacitacion:
            informe.idinformecapacitacion,

          iddocumento: idDocumento,

          estado: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }
  };

  useEffect(() => {
    if (show && capacitacion?.idempleadocapacitacion) {
      cargarInforme();
    }
  }, [show, capacitacion]);

  const cargarInforme = async () => {
    try {

      const res = await axios.get(
        `${API}/informes-capacitacion/`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const informes = res.data.results || res.data;

      const informeEncontrado = informes.find(
        inf =>
          Number(inf.idempleadocapacitacion) ===
          Number(capacitacion.idempleadocapacitacion)
      );

      if (informeEncontrado) {

        setRequiereInforme(true);

        setInforme(informeEncontrado);

        setObjetivos(informeEncontrado.objetivos || "");
        setTematicas(informeEncontrado.tematicas_contenidos || "");
        setMetodologia(informeEncontrado.metodologia || "");
        setConclusiones(informeEncontrado.conclusiones || "");

        setAciertos(informeEncontrado.aciertos_dificultades || "");
        setUtilidad(informeEncontrado.utilidad_formacion || "");

        setResultadoInstitucion(
          informeEncontrado.resultados_institucion || ""
        );

        setResultadoParticipante(
          informeEncontrado.resultados_participante || ""
        );

        setCompromiso(
          informeEncontrado.compromiso_aplicacion || ""
        );

        setSeguimiento(
          informeEncontrado.propuesta_seguimiento || ""
        );
      }

    } catch (error) {
      console.error("Error cargando informe:", error);
    }
  };

  const handleDiplomas = (files) => {
    const valid = files.filter(
      (f) => f.type.includes("pdf") || f.type.includes("image")
    );
    setDiplomas((prev) => [...prev, ...valid]);
  };

  useEffect(() => {
    if (capacitacion && capacitacion.modo) {
      setModo(capacitacion.modo);
    } else {
      setModo(modoInicial || null);
    }
  }, [modoInicial, show, capacitacion]);

  if (!show || !capacitacion) return null;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const [year, month, day] = fecha.split("-");
    return `${day}-${month}-${year}`;
  };

  const subirDocumento = async () => {
    if (!archivo) {
      showToast("Debe adjuntar un archivo PDF", "warning");
      return null;
    }
    if (archivo.type !== "application/pdf") {
      showToast("Solo se permiten archivos PDF", "warning");
      return null;
    }

    const idUsuario = Number(sessionStorage.getItem("idUsuario"));
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombrearchivo", archivo.name);
    formData.append("mimearchivo", "pdf");
    formData.append("fechasubida", new Date().toISOString().slice(0, 10));
    formData.append("idusuario", idUsuario);
    formData.append("idtipodocumento", 4);
    formData.append("idempleado", capacitacion.idempleado);

    const resDoc = await axios.post(`${API}/documentos/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });

    return resDoc.data.iddocumento;
  };

  const subirDiplomas = async () => {
    if (!diplomas.length) return;

    const idUsuario = Number(sessionStorage.getItem("idUsuario"));

    for (const file of diplomas) {
      const formData = new FormData();
      const mime =
        file.type === "application/pdf"
          ? "pdf"
          : file.type.includes("image")
            ? "img"
            : "file";
      formData.append("archivo", file);
      formData.append("nombrearchivo", file.name);
      formData.append("mimearchivo", mime);
      formData.append("fechasubida", new Date().toISOString().slice(0, 10));
      formData.append("estado", true);
      formData.append("idusuario", idUsuario);
      formData.append("idtipodocumento", 12);
      formData.append("idempleado", capacitacion.idempleado);

      await axios.post(`${API}/documentos/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };

  const handleGuardar = async (asistio) => {
    setSubiendo(true);
    try {
      if (asistio && diplomas.length === 0) {
        showToast("Debe subir al menos un diploma", "warning");
        setSubiendo(false);
        return;
      }

      const idDocumento = await subirDocumento();
      if (!idDocumento) {
        setSubiendo(false);
        return;
      }

      if (requiereInforme && informe) {

        await axios.put(
          `${API}/informes-capacitacion/${informe.idinformecapacitacion}/`,
          {
            ...informe,

            objetivos,
            tematicas_contenidos: tematicas,
            metodologia,
            conclusiones,

            aciertos_dificultades: aciertos,
            utilidad_formacion: utilidad,

            resultados_institucion: resultadoInstitucion,
            resultados_participante: resultadoParticipante,

            compromiso_aplicacion: compromiso,
            propuesta_seguimiento: seguimiento,

            estado_informe: "ENTREGADO"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        await axios.post(
          `${API}/informecapacitaciondocumento/`,
          {
            idinformecapacitacion:
              informe.idinformecapacitacion,

            iddocumento: idDocumento,

            estado: true
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        await subirAnexosInforme();
      }

      const mensaje = asistio
        ? "Asistió y subió archivo"
        : observacion || "Inasistencia justificada";

      await onGuardar(
        capacitacion.idempleadocapacitacion,
        asistio,
        mensaje,
        idDocumento
      );

      await subirDiplomas();

      showToast(
        asistio
          ? "Asistencia registrada correctamente"
          : "Inasistencia justificada correctamente",
        "success"
      );

      setDiplomas([]);
      onClose();
    } catch (error) {
      console.error(error.response?.data);
      showToast("Error al registrar asistencia o subir archivo", "error");
    } finally {
      setSubiendo(false);
    }
  };

  const infoCardClass = `asistencia-modal__info-card asistencia-modal__info-card--${modo === "justifico" ? "justifico" : "asistio"}`;
  const btnDisabled = subiendo ? "asistencia-modal__btn--disabled" : "";

  return (
    <div className="asistencia-overlay">
      <div className="asistencia-modal">

        {/* Botón cerrar */}
        <div className="asistencia-modal__close-row">
          <button className="asistencia-modal__close-btn" onClick={onClose} title="Cerrar">
            <X size={24} color="#555" />
          </button>
        </div>

        {/* Título */}
        <h3 className={`asistencia-modal__title asistencia-modal__title--${modo === "justifico" ? "justifico" : "asistio"}`}>
          {modo === "justifico"
            ? "Justificar inasistencia"
            : modo === "asistio"
              ? "Confirmar asistencia"
              : "Registro de asistencia"}
        </h3>

        {/* Info de la capacitación */}
        <div className={infoCardClass}>
          <div className="asistencia-modal__info-grid">
            <div className="asistencia-modal__info-label">Capacitación:</div>
            <div className="asistencia-modal__info-value">{capacitacion.nombre}</div>

            <div className="asistencia-modal__info-label">Lugar:</div>
            <div className="asistencia-modal__info-value">{capacitacion.lugar}</div>

            <div className="asistencia-modal__info-label">Inicio:</div>
            <div className="asistencia-modal__info-value">{formatearFecha(capacitacion.fechaInicio)}</div>

            <div className="asistencia-modal__info-label">Fin:</div>
            <div className="asistencia-modal__info-value">{formatearFecha(capacitacion.fechaFin)}</div>

            <div className="asistencia-modal__info-label">Observaciones:</div>
            <div className="asistencia-modal__info-value asistencia-modal__observacion">
              {capacitacion.observacion || "Sin observaciones"}
            </div>
          </div>
        </div>
        {requiereInforme && (
          <div className="asistencia-modal__informe">

            <h4 className="asistencia-modal__section-title">
              Informe de capacitación
            </h4>

            <textarea
              placeholder="Objetivos"
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Temáticas y contenidos"
              value={tematicas}
              onChange={(e) => setTematicas(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Metodología"
              value={metodologia}
              onChange={(e) => setMetodologia(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Conclusiones"
              value={conclusiones}
              onChange={(e) => setConclusiones(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Aciertos y dificultades"
              value={aciertos}
              onChange={(e) => setAciertos(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Utilidad de la formación"
              value={utilidad}
              onChange={(e) => setUtilidad(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Resultados para la institución"
              value={resultadoInstitucion}
              onChange={(e) => setResultadoInstitucion(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Resultados para el participante"
              value={resultadoParticipante}
              onChange={(e) => setResultadoParticipante(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Compromiso de aplicación"
              value={compromiso}
              onChange={(e) => setCompromiso(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <textarea
              placeholder="Propuesta de seguimiento"
              value={seguimiento}
              onChange={(e) => setSeguimiento(e.target.value)}
              className="asistencia-modal__textarea"
            />

            <div style={{ marginTop: "10px" }}>

              <label className="asistencia-modal__field-label">
                Anexos / Material proporcionado
              </label>

              <div
                className="asistencia-modal__drop-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleAnexos(
                    Array.from(e.dataTransfer.files)
                  );
                }}
                onClick={() =>
                  document
                    .getElementById("inputAnexosInforme")
                    .click()
                }
              >
                <p className="asistencia-modal__drop-zone-title">
                  Arrastra archivos aquí o haz clic
                </p>

                <p className="asistencia-modal__drop-zone-subtitle">
                  Solo archivos PDF
                </p>
              </div>

              <input
                id="inputAnexosInforme"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
                style={{ display: "none" }}
                onChange={(e) => {

                  handleAnexos(
                    Array.from(e.target.files)
                  );

                  e.target.value = null;
                }}
              />

              {anexos.length > 0 && (
                <div className="asistencia-modal__diploma-list">

                  {anexos.map((f, i) => (
                    <div key={i}>
                      📎 {f.name}
                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>
        )}

        {/* Modo Asistió */}
        {modo === "asistio" && (
          <div className="asistencia-modal__section asistencia-modal__section--asistio">
            <h4 className="asistencia-modal__section-title asistencia-modal__section-title--asistio">
              Confirmar Asistencia
            </h4>

            <form
              className="asistencia-modal__form"
              onSubmit={(e) => { e.preventDefault(); handleGuardar(true); }}
            >
              <div>
                <label htmlFor="archivoAsistencia" className="asistencia-modal__field-label">
                  Adjuntar informe en PDF:
                </label>
                <input
                  id="archivoAsistencia"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="asistencia-modal__file-input asistencia-modal__file-input--asistio"
                />

                {/* Drop zone diplomas */}
                <div
                  className="asistencia-modal__drop-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleDiplomas(Array.from(e.dataTransfer.files)); }}
                  onClick={() => document.getElementById("inputDiplomasModal").click()}
                >
                  <p className="asistencia-modal__drop-zone-title">
                    Arrastra diplomas aquí o haz clic
                  </p>
                  <p className="asistencia-modal__drop-zone-subtitle">PDF</p>
                </div>

                <input
                  id="inputDiplomasModal"
                  type="file"
                  multiple
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => { handleDiplomas(Array.from(e.target.files)); e.target.value = null; }}
                />

                {diplomas.length > 0 && (
                  <div className="asistencia-modal__diploma-list">
                    {diplomas.map((f, i) => (
                      <div key={i}>📄 {f.name}</div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={subiendo}
                className={`asistencia-modal__btn asistencia-modal__btn--asistio ${btnDisabled}`}
              >
                {subiendo ? "Subiendo..." : "Confirmar asistencia"}
              </button>
            </form>
          </div>
        )}

        {/* Modo Justificar */}
        {modo === "justifico" && (
          <div className="asistencia-modal__section asistencia-modal__section--justifico">
            <h4 className="asistencia-modal__section-title asistencia-modal__section-title--justifico">
              Justificar Inasistencia
            </h4>

            <form
              className="asistencia-modal__form"
              onSubmit={(e) => { e.preventDefault(); handleGuardar(false); }}
            >
              <div>
                <label htmlFor="archivoJustificacion" className="asistencia-modal__field-label">
                  Adjuntar documento justificativo (PDF):
                </label>
                <input
                  id="archivoJustificacion"
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="asistencia-modal__file-input asistencia-modal__file-input--justifico"
                />
              </div>

              <button
                type="submit"
                disabled={subiendo}
                className={`asistencia-modal__btn asistencia-modal__btn--justifico ${btnDisabled}`}
              >
                {subiendo ? "Subiendo..." : "Confirmar justificación"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AsistenciaModal;