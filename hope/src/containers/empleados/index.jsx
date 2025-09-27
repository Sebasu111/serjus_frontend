import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";

const EmpleadosContainer = () => {
  const [form, setForm] = useState({
    dpi: "", nit: "",
    nombre: "", apellido: "",
    genero: "", lugarnacimiento: "",
    fechanacimiento: "", // yyyy-mm-dd
    telefono: "", email: "",
    direccion: "", estadocivil: "",
    numerohijos: 0,
    estado: true,
    idusuario: 1,
    // opcionales:
    ididioma: "", idpueblocultura: "", idequipo: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => { fetchList(); }, []);
  const fetchList = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`);
      const rows = Array.isArray(res.data) ? res.data :
                   Array.isArray(res.data?.results) ? res.data.results : [];
      setData(rows);
    } catch (e) {
      console.error("Error al cargar empleados:", e);
      setData([]);
      setMensaje("Error al cargar los empleados");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingId) {
        await axios.put(`${API}/empleados/${editingId}/`, payload);
        setMensaje("Empleado actualizado correctamente");
      } else {
        await axios.post(`${API}/empleados/`, payload);
        setMensaje("Empleado registrado correctamente");
      }
      setForm({
        dpi: "", nit: "", nombre: "", apellido: "", genero: "",
        lugarnacimiento: "", fechanacimiento: "", telefono: "",
        email: "", direccion: "", estadocivil: "", numerohijos: 0,
        estado: true, idusuario: 1, ididioma: "", idpueblocultura: "", idequipo: ""
      });
      setEditingId(null);
      fetchList();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Error al guardar empleado:", e.response?.data || e);
      setMensaje("Error al registrar/actualizar el empleado");
    }
  };

  const handleEdit = (row) => {
    setForm({
      dpi: row.dpi ?? "", nit: row.nit ?? "",
      nombre: row.nombre ?? "", apellido: row.apellido ?? "",
      genero: row.genero ?? "", lugarnacimiento: row.lugarnacimiento ?? "",
      fechanacimiento: row.fechanacimiento ?? "",
      telefono: row.telefono ?? "", email: row.email ?? "",
      direccion: row.direccion ?? "", estadocivil: row.estadocivil ?? "",
      numerohijos: row.numerohijos ?? 0,
      estado: !!row.estado, idusuario: row.idusuario ?? 1,
      ididioma: row.ididioma ?? "", idpueblocultura: row.idpueblocultura ?? "", idequipo: row.idequipo ?? ""
    });
    setEditingId(row.idempleado);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleEstado = async (row, nuevo) => {
    try {
      await axios.put(`${API}/empleados/${row.idempleado}/`, {
        ...row,
        estado: nuevo,
        idusuario: row.idusuario ?? 1,
      });
      setMensaje(nuevo ? "Empleado activado" : "Empleado desactivado");
      fetchList();
    } catch (e) {
      console.error("Error al cambiar estado:", e.response?.data || e);
      setMensaje("Error al cambiar el estado");
    }
  };

  return (
    <Layout>
      <SEO title="Hope – Empleados" />
      <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, padding: "60px 20px", background: "#f0f2f5" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>

            {/* FORM */}
            <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: "40px" }}>
              <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
                {editingId ? "Editar empleado" : "Registrar un nuevo empleado"}
              </h2>
              {mensaje && (
                <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", marginBottom: "20px", fontWeight: "bold" }}>
                  {mensaje}
                </p>
              )}
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Columna izquierda */}
                  <div>
                    <label>Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={onChange} required style={inputStyle} />
                    <label>Apellido</label>
                    <input name="apellido" value={form.apellido} onChange={onChange} required style={inputStyle} />
                    <label>DPI</label>
                    <input name="dpi" value={form.dpi} onChange={onChange} required style={inputStyle} />
                    <label>NIT</label>
                    <input name="nit" value={form.nit} onChange={onChange} required style={inputStyle} />
                    <label>Género</label>
                    <input name="genero" value={form.genero} onChange={onChange} required style={inputStyle} />
                    <label>Lugar de nacimiento</label>
                    <input name="lugarnacimiento" value={form.lugarnacimiento} onChange={onChange} required style={inputStyle} />
                    <label>Fecha de nacimiento</label>
                    <input type="date" name="fechanacimiento" value={form.fechanacimiento} onChange={onChange} required style={inputStyle} />
                  </div>

                  {/* Columna derecha */}
                  <div>
                    <label>Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={onChange} required style={inputStyle} />
                    <label>Email</label>
                    <input name="email" value={form.email} onChange={onChange} required style={inputStyle} />
                    <label>Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={onChange} required style={inputStyle} />
                    <label>Estado civil</label>
                    <input name="estadocivil" value={form.estadocivil} onChange={onChange} required style={inputStyle} />
                    <label>Número de hijos</label>
                    <input type="number" name="numerohijos" value={form.numerohijos} onChange={onChange} required style={inputStyle} />
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" name="estado" checked={form.estado} onChange={onChange} />
                      <label>Activo</label>
                    </div>
                  </div>
                </div>

                <button type="submit" style={btnPrimary}>
                  {editingId ? "Actualizar Empleado" : "Guardar Empleado"}
                </button>
              </form>
            </div>

            {/* TABLA */}
            <div style={tableWrapper}>
              <h3 style={{ marginBottom: 20, textAlign: "center" }}>Empleados Registrados</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Nombre","Apellido","DPI","Teléfono","Email","Estado","Acciones"].map((h)=>(
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(data) && data.length ? data.map((r)=>(
                    <tr key={r.idempleado}>
                      <td style={tdStyle}>{r.nombre}</td>
                      <td style={tdStyle}>{r.apellido}</td>
                      <td style={tdStyle}>{r.dpi}</td>
                      <td style={tdStyle}>{r.telefono}</td>
                      <td style={tdStyle}>{r.email}</td>
                      <td style={{ ...tdStyle, textAlign:"center", color: r.estado ? "green" : "red", fontWeight: 600 }}>
                        {r.estado ? "Activo" : "Inactivo"}
                      </td>
                      <td style={{ ...tdStyle, textAlign:"center" }}>
                        <button onClick={()=>handleEdit(r)} style={btnWarn}>Editar</button>
                        {r.estado
                          ? <button onClick={()=>toggleEstado(r,false)} style={btnDanger}>Desactivar</button>
                          : <button onClick={()=>toggleEstado(r,true)} style={btnSuccess}>Activar</button>
                        }
                      </td>
                    </tr>
                  )):(
                    <tr><td colSpan="7" style={{ textAlign:"center", padding: 20 }}>No hay empleados</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

const inputStyle = { width:"100%", padding:"12px 15px", borderRadius:8, border:"1px solid #ccc", fontSize:16, marginBottom:12 };
const btnPrimary = { width:"100%", marginTop:16, padding:"12px 0", background:"#007bff", color:"#fff", border:"none", borderRadius:8, fontSize:16, fontWeight:600, cursor:"pointer" };
const tableWrapper = { background:"#fff", borderRadius:12, padding:"20px 30px", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", maxHeight:600, overflowY:"auto" };
const thStyle = { borderBottom:"2px solid #eee", padding:10, textAlign:"left" };
const tdStyle = { padding:10, borderBottom:"1px solid #f0f0f0" };
const btnWarn = { padding:"6px 14px", background:"#ffc107", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14, marginRight:6 };
const btnDanger = { padding:"6px 14px", background:"#dc3545", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14 };
const btnSuccess = { padding:"6px 14px", background:"#28a745", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14 };

export default EmpleadosContainer;
