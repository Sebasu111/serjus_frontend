import React, { useEffect, useState } from "react";
import "./ConvocatoriasCSS.css";
import PostularModal from "./PostularModal";

const ConvocatoriasPublicPage = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/convocatorias/")
      .then((res) => res.json())
      .then((data) => setConvocatorias(data.results || []));
  }, []);

  return (
    <div className="convocatorias-page">

      <header className="convocatorias-header text-center py-4">
          <h1 style={{ color: "#ffffff" }}>Bolsa de Empleo</h1>
        </header>

        <div className="container my-5 p-4 convocatorias-container shadow-lg rounded-4 bg-white">
          <h2 className="text-center mb-5 fw-bold container-title">Convocatorias Disponibles</h2>

          {convocatorias.length === 0 && (
            <p className="text-center text-muted no-convocatorias">
              No hay convocatorias disponibles en este momento.
            </p>
          )}

          <div className="list-group mx-auto">
            {convocatorias.map((conv) => (
              <div key={conv.idconvocatoria} className="list-group-item mb-4 shadow convocatoria-item">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">

                  <div className="convocatoria-info">
                    <h4 className="fw-bold mb-2">{conv.nombreconvocatoria}</h4>
                    <h6 className="text-primary mb-3">
                      <i className="icofont-briefcase"></i> {conv.nombrepuesto}
                    </h6>
                    <p className="text-muted mb-3">{conv.descripcion?.slice(0, 200)}...</p>
                    <div className="text-muted small">
                      <i className="icofont-calendar"></i> Inicia: {conv.fechainicio} — Finaliza: {conv.fechafin}
                    </div>
                  </div>

                  <div className="mt-4 mt-md-0">
                    <a
                      href="#!"
                      className="btn btn-success fw-bold px-4 py-2 rounded-pill"
                      onClick={() => {
                        setSelectedConvocatoria(conv.idconvocatoria);
                        setModalOpen(true);
                      }}
                    >
                      Aplicar
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <PostularModal
              show={modalOpen}
              onClose={() => setModalOpen(false)}
              convocatoriaId={selectedConvocatoria}
            />
        </div>

        <footer className="convocatorias-footer text-center py-3">
          © 2025 Mi Empresa - Todos los derechos reservados
        </footer>
    </div>
  );
};

export default ConvocatoriasPublicPage;
