import React, { useEffect, useState } from "react";
import Layout from "../../layouts";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { showToast } from "../../utils/toast.js";
import { FaMale, FaFemale, FaUser } from "react-icons/fa";
import { FaUsers, FaBullhorn } from "react-icons/fa";

import {
  fetchEmpleados,
  fetchAusencias,
  fetchCatalogos,
  getEmpleadosPorGenero,
  getEmpleadosPorRangoEdad,
  getEmpleadosPorPuesto,
  getEmpleadosPorIdioma,
  getEmpleadosPorPuebloCultura,
  fetchCapacitaciones,
  fetchEmpleadoCapacitacion,
  getDataCapacitaciones,
  fetchEquipos,
  fetchConvocatorias,
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

const COLORS = ["#5d88e4ff", "#ee853aff", "#3daf89ff", "#d6526fff", "#a662e6ff"];

const ChartDescription = ({ text }) => (
  <p
    style={{
      marginTop: "10px",
      fontSize: "0.85rem",
      color: "#6b7280",
      textAlign: "center",
      fontStyle: "italic",
    }}
  >
    {text}
  </p>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState([]);
  const [porGenero, setPorGenero] = useState([]);
  const [porEdad, setPorEdad] = useState([]);
  const [porPuesto, setPorPuesto] = useState([]);
  const [porIdioma, setPorIdioma] = useState([]);
  const [porPueblo, setPorPueblo] = useState([]);
  const [ausencias, setAusencias] = useState([]);

  const [totalActivos, setTotalActivos] = useState(0);
  const [totalHombres, setTotalHombres] = useState(0);
  const [totalMujeres, setTotalMujeres] = useState(0);
  const [dataCapacitaciones, setDataCapacitaciones] = useState([]);
  
  const [equiposActivos, setEquiposActivos] = useState(0);
  const [convocatoriasActivas, setConvocatoriasActivas] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [empleadosData, catalogos] = await Promise.all([
          fetchEmpleados(),
          fetchCatalogos(),
        ]);

        const { mapPuestos, mapIdiomas, mapPueblos } = catalogos;

        setEmpleados(empleadosData);
        setPorGenero(getEmpleadosPorGenero(empleadosData));
        setPorEdad(getEmpleadosPorRangoEdad(empleadosData));
        setPorPuesto(getEmpleadosPorPuesto(empleadosData, mapPuestos));
        setPorIdioma(getEmpleadosPorIdioma(empleadosData, mapIdiomas));
        setPorPueblo(getEmpleadosPorPuebloCultura(empleadosData, mapPueblos));

        const aus = await fetchAusencias();
        setAusencias(aus);
        // Equipos activos
const equipos = await fetchEquipos();
setEquiposActivos(equipos.length);

// Convocatorias activas
const convocatorias = await fetchConvocatorias();
setConvocatoriasActivas(convocatorias.length);

        // === CAPACITACIONES ACTIVAS Y EMPLEADOS ASIGNADOS ===
const caps = await fetchCapacitaciones();
const asignaciones = await fetchEmpleadoCapacitacion();
setDataCapacitaciones(getDataCapacitaciones(caps, asignaciones));


        const activos = empleadosData.filter((e) => e.estado === true);
        setTotalActivos(activos.length);
        setTotalHombres(
          activos.filter((e) => e.genero?.toLowerCase().startsWith("m")).length
        );
        setTotalMujeres(
          activos.filter((e) => e.genero?.toLowerCase().startsWith("f")).length
        );
      } catch (err) {
        showToast("Error al cargar los datos del Dashboard", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

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
                  {/* === SECCIÓN 1: KPIs === */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "26px",
    marginBottom: "40px",
  }}
>
  {/* Colaboradores activos */}
  <div
    style={{
      background: "#ffffff",
      padding: "26px 20px",
      borderRadius: "14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      textAlign: "center",
      transition: "0.2s ease",
    }}
  >
    <h4
      style={{
        color: "#3daf89ff", 
        fontSize: "1.15rem",
        fontWeight: "700",
        marginBottom: "10px",
      }}
    >
      Colaboradores Activos
    </h4>

    <FaUser
      size={48}
      color="#3daf89ff"
      style={{ marginBottom: "10px", opacity: 0.9 }}
    />

    <p style={{ fontSize: "2rem", fontWeight: "800", color: "#3daf89ff" }}>
      {totalActivos}
    </p>
  </div>

  {/* Equipos activos */}
  <div
    style={{
      background: "#ffffff",
      padding: "26px 20px",
      borderRadius: "14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      textAlign: "center",
      transition: "0.2s ease",
    }}
  >
    <h4
      style={{
        color: "#3daf89ff",
        fontSize: "1.15rem",
        fontWeight: "700",
        marginBottom: "10px",
      }}
    >
      Equipos Activos
    </h4>

    <FaUsers
      size={48}
      color="#3daf89ff"
      style={{ marginBottom: "10px", opacity: 0.9 }}
    />

    <p style={{ fontSize: "2rem", fontWeight: "800", color: "#3daf89ff" }}>
      {equiposActivos}
    </p>
  </div>

  {/* Convocatorias activas */}
  <div
    style={{
      background: "#ffffff",
      padding: "26px 20px",
      borderRadius: "14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      textAlign: "center",
      transition: "0.2s ease",
    }}
  >
    <h4
      style={{
        color: "#3daf89ff",
        fontSize: "1.15rem",
        fontWeight: "700",
        marginBottom: "10px",
      }}
    >
      Convocatorias Activas
    </h4>

    <FaBullhorn
      size={48}
      color="#3daf89ff"
      style={{ marginBottom: "10px", opacity: 0.9 }}
    />

    <p style={{ fontSize: "2rem", fontWeight: "800", color: "#3daf89ff" }}>
      {convocatoriasActivas}
    </p>
  </div>
</div>
{/* === SECCIÓN 2 === */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 2fr", 
    gap: "28px",
    marginBottom: "36px",
  }}
>

  {/* 🔹 Colaboradores por género (tabla) */}
  <Card title="Género" color="#5d88e4ff">
  {totalActivos === 0 ? (
    <p style={{ textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
      No hay datos registrados.
    </p>
  ) : (
    <>
      {/* TABLA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 0.7fr 0.7fr",
          gap: "8px",
          marginTop: "10px",
          fontSize: "0.95rem",
          color: "#1e293b",
        }}
      >
        {/* ENCABEZADOS */}
        <div style={{ fontWeight: "700" }}></div>
        <div style={{ fontWeight: "700", textAlign: "center" }}>Cantidad</div>
        <div style={{ fontWeight: "700", textAlign: "center" }}>Porcentaje</div>

        {/* --- HOMBRES --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
          }}
        >
          <FaMale size={22} color="#5080e7ff" />
          <span>Hombres</span>
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          {totalHombres}
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
            color: "#2563eb",
          }}
        >
          {((totalHombres / totalActivos) * 100).toFixed(1)}%
        </div>

        {/* --- MUJERES --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
          }}
        >
          <FaFemale size={22} color="#e04d6dff" />
          <span>Mujeres</span>
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          {totalMujeres}
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
            color: "#e11d48",
          }}
        >
          {((totalMujeres / totalActivos) * 100).toFixed(1)}%
        </div>

        {/* --- OTRO --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
          }}
        >
          <FaUser size={22} color="#6b7280" />
          <span>Otro</span>
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
          }}
        >
          {totalActivos - (totalHombres + totalMujeres)}
        </div>
        <div
          style={{
            background: "#f2f4f7",
            padding: "10px 12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
            color: "#6b7280",
          }}
        >
          {(
            ((totalActivos - (totalHombres + totalMujeres)) / totalActivos) *
            100
          ).toFixed(1)}
          %
        </div>
      </div>
      <ChartDescription text="Distribución del personal según género." />
    </>
  )}
</Card>


  {/*Distribución por Edad  */}
  <Card title="Distribución por Edad" color="#ee853aff">
    {renderDataOrEmpty(
      porEdad,
      <>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={porEdad}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#ee853aff" barSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <ChartDescription text="Cantidad de colaboradores agrupados por edad." />
      </>
    )}
  </Card>
</div>


{/* === SECCIÓN 3 === */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "28px",
    marginBottom: "36px",
  }}
>
{/*Puestos  */}
<Card title="Puestos" color="#10b981">
  {renderDataOrEmpty(
    porPuesto,
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ width: "55%", position: "relative", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={porPuesto}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                label={({ cx, cy, midAngle, outerRadius, value }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 25; 
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#1e293b"
                      fontSize="0.9rem"
                      fontWeight="700"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                    >
                      {value}
                    </text>
                  );
                }}
              >
                {porPuesto.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {(() => {
            const total = porPuesto.reduce((s, p) => s + p.value, 0);
            const mayor = Math.max(...porPuesto.map((p) => p.value));
            const porcentaje = ((mayor / total) * 100).toFixed(0);

            return (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "2.1rem",
                  fontWeight: "800",
                  color: "#1e293b",
                }}
              >
              </div>
            );
          })()}
        </div>

        <div style={{ width: "40%" }}>
          {porPuesto.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: COLORS[i % COLORS.length],
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              ></div>

              <span style={{ fontWeight: "600", color: "#1e293b" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ChartDescription text="Distribución del personal según su puesto." />
    </>
  )}
</Card>


  {/*Capacitaciones Activas */}
  <Card title="Capacitaciones Activas" color="#9333ea">
  {dataCapacitaciones.length === 0 ? (
    <p
      style={{
        textAlign: "center",
        color: "#6b7280",
        fontStyle: "italic",
      }}
    >
      No hay capacitaciones activas registradas.
    </p>
  ) : (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "10px",
          marginTop: "10px",
          fontSize: "0.95rem",
          color: "#1e293b",
        }}
      >
        {/* ENCABEZADOS */}
        <div style={{ fontWeight: "700" }}>Capacitación</div>
        <div style={{ fontWeight: "700", textAlign: "center" }}>Asignados</div>

        
        {dataCapacitaciones
          .slice(-5) 
          .map((cap, i) => (
            <React.Fragment key={i}>
              {/* COLUMNA NOMBRE */}
              <div
                style={{
                  background: "#f4f3ff",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "600",
                }}
              >
                {cap.name}
              </div>

              {/* COLUMNA CANTIDAD */}
              <div
                style={{
                  background: "#f4f3ff",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  textAlign: "center",
                  color: "#9333ea",
                }}
              >
                {cap.value}
              </div>
            </React.Fragment>
          ))}
      </div>

      <ChartDescription text="Últimas capacitaciones activas y cantidad de colaboradores asignados." />
    </>
  )}
</Card>
</div>

{/* === SECCIÓN 4 === */}
<Card title="Ausencias Activas" color="#9333ea">
  {ausencias.length === 0 ? (
    <p style={{ textAlign: "center", color: "#6b7280", fontStyle: "italic" }}>
      No hay ausencias activas registradas.
    </p>
  ) : (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr 1fr",
          gap: "10px",
          marginTop: "10px",
          fontSize: "0.95rem",
          color: "#1e293b",
        }}
      >
        {/* ENCABEZADOS */}
        <div style={{ fontWeight: "700" }}>Colaborador</div>
        <div style={{ fontWeight: "700", textAlign: "center" }}>Motivo</div>
        <div style={{ fontWeight: "700", textAlign: "center" }}>Fechas</div>

        {/* FILAS */}
        {ausencias.slice(0, 8).map((a, index) => (
          <React.Fragment key={index}>
            {/* Nombre */}
            <div
              style={{
                background: "#f4f3ff",
                padding: "10px 12px",
                borderRadius: "8px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
              }}
            >
              {a.empleado
                ? `${a.empleado.nombre || ""} ${a.empleado.apellido || ""}`.trim()
                : "Empleado"}
            </div>

            {/* Diagnóstico / Tipo */}
            <div
              style={{
                background: "#f4f3ff",
                padding: "10px 12px",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "600",
                color: "#9333ea",
              }}
            >
              {a.diagnostico || a.tipo || "Sin diagnóstico"}
            </div>

            {/* Fechas */}
            <div
              style={{
                background: "#f4f3ff",
                padding: "10px 12px",
                borderRadius: "8px",
                textAlign: "center",
                color: "#6b7280",
                fontWeight: "600",
              }}
            >
              {formatDate(a.fechainicio)} – {formatDate(a.fechafin)}
            </div>
          </React.Fragment>
        ))}
      </div>

      <ChartDescription text="Listado de ausencias activas más recientes." />
    </>
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
