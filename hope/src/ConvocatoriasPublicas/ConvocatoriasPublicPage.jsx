import React, { useEffect, useState } from "react";
import "./ConvocatoriasCSS.css";
import PostularModal from "./PostularModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ConvocatoriasPublicPage = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/convocatorias/")
      .then((res) => res.json())
      .then((data) => setConvocatorias(data.results || []));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const principios = [
    "El amor ilumina la vida y es base de la libertad, la convivencia y el servicio a los demás.",
    "Es primordial la defensa de la vida.",
    "Fundamentarse en la cosmovisión e identidad de los pueblos indígenas.",
    "Complementariedad y Colectividad según la Cosmovisión Maya.",
    "Reciprocidad o principio de Tz’onoj: El saber dar y recibir.",
    "Intercambio y solidaridad: principio del Kuchuj.",
    "Responder a lo inmediato y a lo estratégico: principio del Kab´awil.",
    "Reconstitución de los pueblos frente al colonialismo y la discriminación.",
    "Fortalecimiento de la existencia de comunidad como base social y política.",
    "Protagonismo de las mujeres en equidad de género.",
    "Construcción colectiva de conocimiento.",
    "Aprendizaje permanente mediante sistematización de experiencias.",
    "Integración y articulación hacia lo macro e internacional.",
    "Participación intergeneracional con equidad de género.",
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4500,
    arrows: true,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  return (
    <div className="page-container">
      <div className="main-layout">
        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <div className="sidebar-content">
            <h2>Trabajar juntos y juntas</h2>
            <p>
              Nos unimos para trabajar juntas y juntos y tratar de erradicar las
              causas de la desigualdad, la pobreza y la opresión en Guatemala,
              promoviendo la organización y acción conjunta de personas y comunidades
              especialmente indígenas y ladinas pobres, excluidas por el sistema en
              que vivimos desde lo local a lo nacional hacia la construcción de un
              Estado Plurinacional popular, justo y democrático y libre del neocolonialismo.
            </p>

            <div className="info-card">
              <h3>Misión y Principios</h3>

              <Slider {...sliderSettings} className="principios-carousel">
                {principios.map((texto, idx) => (
                  <div key={idx} className="principio-slide">
                    <div className="principio-card">
                      <p>{texto}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            <div className="info-card values">
              <h3>Valores Institucionales</h3>
              <ul>
                <li>Valoración de la persona y su espiritualidad.</li>
                <li>Honestidad y transparencia.</li>
                <li>Creatividad e innovación.</li>
                <li>Competencia y profesionalidad.</li>
                <li>Compromiso y coherencia.</li>
                <li>Esperanza por la justicia, igualdad y democracia.</li>
                <li>Unidad en la diversidad.</li>
                <li>Lealtad y humildad.</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* ===== CONTENIDO ===== */}
        <div className="content-layout">
          <header className="page-header">
            <img
              src="/img/logo.png"
              alt="Logo SERJUS"
              className="header-logo"
            />
            <h1>Bolsa de Empleo SERJUS</h1>
          </header>

          <main className="content">
            <div className="convocatorias-container">
              <h2 className="section-title">Convocatorias Disponibles</h2>

              {convocatorias.length === 0 ? (
                <p className="no-convocatorias">
                  No hay convocatorias disponibles en este momento.
                </p>
              ) : (
                <div className="convocatoria-list">
                  {convocatorias.map((conv) => (
                    <div key={conv.idconvocatoria} className="convocatoria-card">
                      <div className="convocatoria-info">
                        <h4>{conv.nombrepuesto}</h4>
                        <h6>{conv.nombreconvocatoria}</h6>
                        <p>{conv.descripcion?.slice(0, 250)}...</p>
                        <small>
                          <i className="icofont-calendar"></i> Inicia: {formatDate(conv.fechainicio)} — Finaliza: {formatDate(conv.fechafin)}
                        </small>
                      </div>
                      <button
                        className="btn-aplicar"
                        onClick={() => {
                          setSelectedConvocatoria(conv.idconvocatoria);
                          setModalOpen(true);
                        }}
                      >
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <PostularModal
              show={modalOpen}
              onClose={() => setModalOpen(false)}
              convocatoriaId={selectedConvocatoria}
            />
          </main>

          <footer className="page-footer">
            Derechos reservados © 2025 Serjus
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ConvocatoriasPublicPage;
