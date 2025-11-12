import React, { useEffect, useState } from "react";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";

import {
  fetchEmpleados,
  fetchAusencias,
  fetchCatalogos, // ✅ NUEVO IMPORT
  getEmpleadosPorGenero,
  getEmpleadosPorRangoEdad,
  getEmpleadosPorPuesto,
  getEmpleadosPorIdioma,
  getEmpleadosPorPuebloCultura,
} from "./DashboardData";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = ["#2563eb", "#f97316", "#10b981", "#e11d48", "#9333ea"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState([]);
  const [porGenero, setPorGenero] = useState([]);
  const [porEdad, setPorEdad] = useState([]);
  const [porPuesto, setPorPuesto] = useState([]);
  const [porIdioma, setPorIdioma] = useState([]);
  const [porPueblo, setPorPueblo] = useState([]);
  const [ausencias, setAusencias] = useState([]);

  // KPIs principales
  const [totalActivos, setTotalActivos] = useState(0);
  const [totalHombres, setTotalHombres] = useState(0);
  const [totalMujeres, setTotalMujeres] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("📡 Cargando datos del dashboard...");

        // 🔹 Cargamos empleados y catálogos en paralelo
        const [empleadosData, catalogos] = await Promise.all([
          fetchEmpleados(),
          fetchCatalogos(),
        ]);

        const { mapPuestos, mapIdiomas, mapPueblos } = catalogos;

        console.log("🧩 Empleados obtenidos:", empleadosData);
        console.log("🗂️ Catálogos:", catalogos);

        // 🔹 Agrupar empleados
        setEmpleados(empleadosData);
        setPorGenero(getEmpleadosPorGenero(empleadosData));
        setPorEdad(getEmpleadosPorRangoEdad(empleadosData));
        setPorPuesto(getEmpleadosPorPuesto(empleadosData, mapPuestos));
        setPorIdioma(getEmpleadosPorIdioma(empleadosData, mapIdiomas));
        setPorPueblo(getEmpleadosPorPuebloCultura(empleadosData, mapPueblos));

        // 🔹 Cargar ausencias
        const aus = await fetchAusencias();
        console.log("📋 Ausencias obtenidas:", aus);
        setAusencias(aus);

        // 🔹 KPIs
        const activos = empleadosData.filter((e) => e.estado === true);
        setTotalActivos(activos.length);
        setTotalHombres(
          activos.filter((e) => e.genero?.toLowerCase().startsWith("m")).length
        );
        setTotalMujeres(
          activos.filter((e) => e.genero?.toLowerCase().startsWith("f")).length
        );
      } catch (err) {
        console.error("❌ Error cargando Dashboard:", err);
        showToast("Error al cargar los datos del Dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  // 🔹 Formatear fecha al estilo DD-MM-YYYY sin desfase horario
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

  /* =====================================================
     🔸 COMPONENTES VISUALES
     ===================================================== */

  const Card = ({ title, color, children }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "24px 28px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
      }}
    >
      <h4
        style={{
          textAlign: "left",
          marginBottom: "14px",
          color,
          fontSize: "1.1rem",
          fontWeight: "700",
          borderLeft: `4px solid ${color}`,
          paddingLeft: "10px",
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );

  const renderDataOrEmpty = (dataArray, chart) =>
    !dataArray || dataArray.length === 0 ? (
      <p
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontStyle: "italic",
          marginTop: "20px",
        }}
      >
        No hay datos registrados.
      </p>
    ) : (
      chart
    );

  /* =====================================================
     🔸 RENDER PRINCIPAL
     ===================================================== */

  return (
    <Layout>
      <SEO title="Dashboard" />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Header />
          <main
            className="main-content site-wrapper-reveal"
            style={{
              flex: 1,
              backgroundColor: "#F4F6FA",
              padding: "48px 20px 8rem",
              transition: "margin-left 0.3s ease",
            }}
          >
            <div style={{ width: "min(1300px, 96vw)", margin: "0 auto" }}>
              <h2
                style={{
                  marginBottom: "40px",
                  textAlign: "center",
                  color: "#1e293b",
                  fontWeight: "800",
                  letterSpacing: "0.5px",
                  fontSize: "2rem",
                }}
              >
                Panel de Recursos Humanos
              </h2>

              {loading ? (
                <p style={{ textAlign: "center" }}>Cargando datos...</p>
              ) : (
                <>
                  {/* === SECCIÓN SUPERIOR === */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "28px",
                      marginBottom: "36px",
                    }}
                  >
                    {/* 🔹 Pueblo Cultura */}
                    <Card title="Pueblo / Cultura" color="#e11d48">
                      {renderDataOrEmpty(
                        porPueblo,
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart layout="vertical" data={porPueblo}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Bar dataKey="value" fill="#e11d48" barSize={22} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Card>

                    {/* 🔹 KPIs + Edades */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                      <Card title="Colaboradores" color="#1e293b">
                        {totalActivos === 0 ? (
                          <p
                            style={{
                              textAlign: "center",
                              color: "#6b7280",
                              fontStyle: "italic",
                            }}
                          >
                            No hay datos registrados.
                          </p>
                        ) : (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              rowGap: "10px",
                              fontSize: "0.95rem",
                              color: "#374151",
                            }}
                          >
                            <p>
                              <strong>Total:</strong> {totalActivos}
                            </p>
                            <p>
                              <strong>Hombres:</strong> {totalHombres}
                            </p>
                            <p>
                              <strong>Mujeres:</strong> {totalMujeres}
                            </p>
                            <p>
                              <strong>Otro:</strong>{" "}
                              {totalActivos - (totalHombres + totalMujeres)}
                            </p>
                          </div>
                        )}
                      </Card>

                      <Card title="Distribución por Edad" color="#f97316">
                        {renderDataOrEmpty(
                          porEdad,
                          <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={porEdad}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#f97316" barSize={28} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Card>
                    </div>
                  </div>

                  {/* === FILA 2 === */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr",
                      gap: "28px",
                      marginBottom: "36px",
                    }}
                  >
                    {/* 🔹 Idioma */}
                    <Card title="Idiomas" color="#2563eb">
                      {renderDataOrEmpty(
                        porIdioma,
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={porIdioma}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2563eb" barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </Card>

                    {/* 🔹 Puestos */}
                    <Card title="Puestos" color="#10b981">
                      {renderDataOrEmpty(
                        porPuesto,
                        <ResponsiveContainer width="100%" height={250}>
  <PieChart>
    <Pie
      data={porPuesto}
      dataKey="value"
      nameKey="name"
      innerRadius={60}
      outerRadius={90}
      // 🔸 Quitar etiquetas alrededor del círculo
      label={false}
      labelLine={false}
    >
      {porPuesto.map((_, i) => (
        <Cell key={`puesto-${i}`} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    {/* 🔸 Mantener leyenda abajo */}
    <Legend
      layout="horizontal"
      verticalAlign="bottom"
      align="center"
      wrapperStyle={{
        fontSize: "0.85rem",
        marginTop: "10px",
      }}
    />
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

                      )}
                    </Card>
                  </div>

                  {/* === FILA 3: AUSENCIAS === */}
                  <Card title="Ausencias Activas" color="#9333ea">
                    {ausencias.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        No hay ausencias activas registradas.
                      </p>
                    ) : (
                      <ul
                        style={{
                          listStyle: "none",
                          paddingLeft: 0,
                          marginTop: 10,
                        }}
                      >
                        {ausencias.slice(0, 6).map((a, index) => (
  <li
    key={a.idausencia || index}
    style={{
      background: "#f9fafb",
      borderRadius: "8px",
      padding: "10px 14px",
      marginBottom: "8px",
      boxShadow: "inset 0 0 0 1px #e5e7eb",
    }}
  >
    <strong style={{ color: "#1e293b" }}>
      {a.empleado?.nombreempleado || "Empleado"}
    </strong>{" "}
    — {a.diagnostico || a.tipo || "Sin diagnóstico"}{" "}
    <span style={{ color: "#6b7280" }}>
      ({formatDate(a.fechainicio)} a {formatDate(a.fechafin)})
    </span>
  </li>
))}

                      </ul>
                    )}
                  </Card>
                </>
              )}
            </div>
          </main>
          <Footer />
        </div>
        <ScrollToTop />
      </div>
    </Layout>
  );
};

export default Dashboard;
