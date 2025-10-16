import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";

const InduccionDocumentosContainer = () => {
  const [form, setForm] = useState({
    idinduccion: "",
    iddocumento: "",
    idempleado: "",
    fechaasignado: "",
    fechacompletado: "",
    estado: true,
    idusuario: 1,
  });
  const [mensaje, setMensaje] = useState("");
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f)=>({ ...f, [name]: type==="checkbox" ? checked : value }));
  };

  useEffect(()=>{ fetchList(); },[]);
  const fetchList = async () => {
    try{
      const r = await axios.get(`${API}/inducciondocumentos/`);
      const data = Array.isArray(r.data) ? r.data :
                   Array.isArray(r.data?.results) ? r.data.results : [];
      setRows(data);
    }catch(e){
      console.error("Error ind-doc:", e);
      setRows([]); setMensaje("Error al cargar asignaciones");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const payload = { ...form };
      if (editingId) {
        await axios.put(`${API}/inducciondocumentos/${editingId}/`, payload);
        setMensaje("Asignación actualizada");
      } else {
        await axios.post(`${API}/inducciondocumentos/`, payload);
        setMensaje("Asignación creada");
      }
      setForm({ idinduccion:"", iddocumento:"", idempleado:"", fechaasignado:"", fechacompletado:"", estado:true, idusuario:1 });
      setEditingId(null); fetchList(); window.scrollTo({ top:0, behavior:"smooth" });
    }catch(e){
      console.error("Error guardar:", e.response?.data || e);
      setMensaje("Error al registrar/actualizar");
    }
  };

  const handleEdit = (row) => {
    setForm({
      idinduccion: row.idinduccion ?? "",
      iddocumento: row.iddocumento ?? "",
      idempleado: row.idempleado ?? "",
      fechaasignado: row.fechaasignado ?? "",
      fechacompletado: row.fechacompletado ?? "",
      estado: !!row.estado,
      idusuario: row.idusuario ?? 1,
    });
    setEditingId(row.idinducciondocumento);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const toggleEstado = async (row, nuevo) => {
    try{
      await axios.put(`${API}/inducciondocumentos/${row.idinducciondocumento}/`, { ...row, estado:nuevo, idusuario: row.idusuario ?? 1 });
      setMensaje(nuevo ? "Activado":"Desactivado"); fetchList();
    }catch(e){
      console.error("Error:", e.response?.data || e);
      setMensaje("No se pudo cambiar el estado");
    }
  };

  return (
    <Layout>
      <SEO title=" Inducción Documentos" />
      <div className="wrapper" style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Header />
        <main style={{ flex:1, padding:"60px 20px", background:"#f0f2f5" }}>
          <div style={{ maxWidth:1000, margin:"0 auto" }}>
            {/* FORM */}
            <div style={card}>
              <h2 style={h2}>{editingId ? "Editar asignación" : "Asignar documento a inducción"}</h2>
              {mensaje && <p style={msg(mensaje)}>{mensaje}</p>}
              <form onSubmit={handleSubmit}>
                <div style={grid2}>
                  <div>
                    <label>ID Inducción</label>
                    <input name="idinduccion" value={form.idinduccion} onChange={onChange} required style={input}/>
                    <label>ID Documento</label>
                    <input name="iddocumento" value={form.iddocumento} onChange={onChange} required style={input}/>
                    <label>ID Empleado</label>
                    <input name="idempleado" value={form.idempleado} onChange={onChange} required style={input}/>
                  </div>
                  <div>
                    <label>Fecha asignado</label>
                    <input type="date" name="fechaasignado" value={form.fechaasignado} onChange={onChange} required style={input}/>
                    <label>Fecha completado</label>
                    <input type="date" name="fechacompletado" value={form.fechacompletado} onChange={onChange} style={input}/>
                    <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:10 }}>
                      <input type="checkbox" name="estado" checked={form.estado} onChange={onChange}/>
                      <label>Activo</label>
                    </div>
                  </div>
                </div>
                <button type="submit" style={btnPrimary}>{editingId ? "Actualizar" : "Guardar"}</button>
              </form>
            </div>

            {/* TABLA */}
            <div style={tableWrap}>
              <h3 style={h3}>Asignaciones</h3>
              <table style={tbl}>
                <thead>
                  <tr>{["Inducción","Documento","Empleado","Asignado","Completado","Estado","Acciones"].map((h)=><th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows?.length ? rows.map((r)=>(
                    <tr key={r.idinducciondocumento}>
                      <td style={td}>{r.idinduccion}</td>
                      <td style={td}>{r.iddocumento}</td>
                      <td style={td}>{r.idempleado}</td>
                      <td style={td}>{r.fechaasignado}</td>
                      <td style={td}>{r.fechacompletado || "-"}</td>
                      <td style={{ ...td, textAlign:"center", color:r.estado?"green":"red", fontWeight:600 }}>
                        {r.estado ? "Activo" : "Inactivo"}
                      </td>
                      <td style={{ ...td, textAlign:"center" }}>
                        <button onClick={()=>handleEdit(r)} style={btnWarn}>Editar</button>
                        {r.estado
                          ? <button onClick={()=>toggleEstado(r,false)} style={btnDanger}>Desactivar</button>
                          : <button onClick={()=>toggleEstado(r,true)} style={btnSuccess}>Activar</button>}
                      </td>
                    </tr>
                  )):(
                    <tr><td colSpan="7" style={{ textAlign:"center", padding:20 }}>Sin registros</td></tr>
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

const card = { background:"#fff", padding:40, borderRadius:12, boxShadow:"0 4px 20px rgba(0,0,0,0.1)", marginBottom:40 };
const h2 = { textAlign:"center", marginBottom:30 };
const h3 = { marginBottom:20, textAlign:"center" };
const msg = (m)=>({ textAlign:"center", color: m.includes("Error")?"red":"green", marginBottom:20, fontWeight:"bold" });
const grid2 = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 };
const input = { width:"100%", padding:"12px 15px", borderRadius:8, border:"1px solid #ccc", fontSize:16, marginBottom:12 };
const btnPrimary = { width:"100%", marginTop:16, padding:"12px 0", background:"#007bff", color:"#fff", border:"none", borderRadius:8, fontSize:16, fontWeight:600, cursor:"pointer" };
const tableWrap = { background:"#fff", borderRadius:12, padding:"20px 30px", boxShadow:"0 4px 20px rgba(0,0,0,0.08)", maxHeight:600, overflowY:"auto" };
const tbl = { width:"100%", borderCollapse:"collapse" };
const th = { borderBottom:"2px solid #eee", padding:10, textAlign:"left" };
const td = { padding:10, borderBottom:"1px solid #f0f0f0" };

const btnWarn = { padding:"6px 14px", background:" #FED7AA", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14, marginRight:6 };
const btnDanger = { padding:"6px 14px", background:"#F87171", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14 };
const btnSuccess = { padding:"6px 14px", background:"#28a745", color:"#fff", border:"none", borderRadius:5, cursor:"pointer", fontSize:14 };

export default InduccionDocumentosContainer;
