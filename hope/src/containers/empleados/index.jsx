import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";

const API = "http://127.0.0.1:8000/api";

const PAGE_SIZE = 5; // registros por página

const EmpleadosContainer = () => {
  const [form, setForm] = useState({
    dpi: "",
    nit: "",
    nombre: "",
    apellido: "",
    genero: "",
    lugarnacimiento: "",
    fechanacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    estadocivil: "",
    numerohijos: 0,
    estado: true, // siempre activo al crear
    idusuario: 1,
    ididioma: "",
    idpueblocultura: "",
    idequipo: "",
  });

  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Paginación y búsqueda (frontend)
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await axios.get(`${API}/empleados/`);
      const rows = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : [];
      setData(rows);
    } catch (e) {
      console.error("Error al cargar empleados:", e);
      setData([]);
      setMensaje("Error al cargar los empleados");
    }
  };

  const emailRegex = /^\S+@\S+\.\S+$/;

  const validateField = (name, value) => {
    let msg = "";

    if (name === "dpi") {
      if (!/^\d*$/.test(value)) msg = "El DPI solo puede contener números.";
      else if (value.length !== 13 && value.length > 0) msg = "El DPI debe tener exactamente 13 dígitos.";
    }

    if (name === "nit") {
      if (!/^\d*$/.test(value)) msg = "El NIT solo puede contener números.";
      else if (value.length > 8) msg = "El NIT no puede tener más de 8 dígitos.";
      else if (value.length === 0) msg = "El NIT no puede estar vacío.";
    }

    if (name === "telefono") {
      if (!/^\d*$/.test(value)) msg = "El teléfono solo puede contener números.";
    }

    if (name === "email") {
      if (value && !emailRegex.test(value)) msg = "Correo electrónico inválido.";
    }

    if (name === "numerohijos") {
      const n = Number(value);
      if (Number.isNaN(n) || !Number.isFinite(n)) msg = "Número de hijos inválido.";
      else if (n < 0) msg = "El número de hijos no puede ser negativo.";
    }

    if (name === "estadocivil") {
      const allowed = ["Soltero", "Casado", "Divorciado", "Viudo", "Union de hecho", ""];
      if (!allowed.includes(value)) msg = "Estado civil inválido.";
    }

    return msg;
  };

  const onChange = (e) => {
    const { name, value: rawValue, type, checked } = e.target;
    const value = type === "checkbox" ? checked : rawValue;

    // Reglas en escritura:
    if (name === "dpi") {
      // Solo números, límite 13
      if (!/^\d*$/.test(value)) return;
      if (value.length > 13) return;
    }

    if (name === "nit") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 8) return;
    }

    if (name === "telefono") {
      if (!/^\d*$/.test(value)) return;
    }

    if (name === "numerohijos") {
      // permitir vacío o número >= 0
      if (rawValue === "") {
        setForm((f) => ({ ...f, [name]: "" }));
        setErrors((errs) => ({ ...errs, [name]: validateField(name, "") }));
        return;
      }
      if (!/^-?\d*$/.test(rawValue)) return;
      const numeric = Number(rawValue);
      if (numeric < 0) return;
      setForm((f) => ({ ...f, [name]: numeric }));
      setErrors((errs) => ({ ...errs, [name]: validateField(name, numeric) }));
      return;
    }

    // Actualizar form y validar campo
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((errs) => ({ ...errs, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const newErrors = {};
    const requiredFields = ["dpi", "nit", "nombre", "apellido", "fechanacimiento", "telefono", "email", "direccion", "estadocivil"];

    requiredFields.forEach((k) => {
      if (form[k] === "" || form[k] === null || form[k] === undefined) {
        newErrors[k] = "Este campo es obligatorio.";
      }
    });

    // Validaciones específicas:
    newErrors.dpi = newErrors.dpi || validateField("dpi", form.dpi);
    newErrors.nit = newErrors.nit || validateField("nit", form.nit);
    newErrors.telefono = newErrors.telefono || validateField("telefono", form.telefono);
    newErrors.email = newErrors.email || validateField("email", form.email);
    newErrors.numerohijos = newErrors.numerohijos || validateField("numerohijos", form.numerohijos);
    newErrors.estadocivil = newErrors.estadocivil || validateField("estadocivil", form.estadocivil);

    // Remover claves vacías (sin error)
    Object.keys(newErrors).forEach((k) => { if (!newErrors[k]) delete newErrors[k]; });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!validateAll()) {
      setMensaje("Corrige los errores antes de enviar.");
      return;
    }

    try {
      const payload = { ...form, estado: true }; // Siempre activo en creación/actualización desde el formulario
      if (editingId) {
        await axios.put(`${API}/empleados/${editingId}/`, payload);
        setMensaje("Empleado actualizado correctamente");
      } else {
        await axios.post(`${API}/empleados/`, payload);
        setMensaje("Empleado registrado correctamente");
      }

      // reset form
      setForm({
        dpi: "",
        nit: "",
        nombre: "",
        apellido: "",
        genero: "",
        lugarnacimiento: "",
        fechanacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
        estadocivil: "",
        numerohijos: 0,
        estado: true,
        idusuario: 1,
        ididioma: "",
        idpueblocultura: "",
        idequipo: "",
      });
      setErrors({});
      setEditingId(null);
      fetchList();
      setPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error al guardar empleado:", err.response?.data || err);
      setMensaje("Error al registrar/actualizar el empleado");
    }
  };

  const handleEdit = (row) => {
    setForm({
      dpi: row.dpi ?? "",
      nit: row.nit ?? "",
      nombre: row.nombre ?? "",
      apellido: row.apellido ?? "",
      genero: row.genero ?? "",
      lugarnacimiento: row.lugarnacimiento ?? "",
      fechanacimiento: row.fechanacimiento ?? "",
      telefono: row.telefono ?? "",
      email: row.email ?? "",
      direccion: row.direccion ?? "",
      estadocivil: row.estadocivil ?? "",
      numerohijos: row.numerohijos ?? 0,
      estado: !!row.estado,
      idusuario: row.idusuario ?? 1,
      ididioma: row.ididioma ?? "",
      idpueblocultura: row.idpueblocultura ?? "",
      idequipo: row.idequipo ?? "",
    });
    setErrors({});
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

  // --- Filtrado y paginación frontend ---
  const filtered = data.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(r.nombre ?? "").toLowerCase().includes(s) ||
      String(r.apellido ?? "").toLowerCase().includes(s) ||
      String(r.dpi ?? "").toLowerCase().includes(s)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (p) => {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  };

  // Estilos (los mismos que tenías, mantenidos)
  return (
    <Layout>
      <SEO title="Hope – Empleados" />
      <div className="wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, padding: "40px 20px", background: "#f0f2f5" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* --- CONTROLES DE TABLA (arriba) --- */}
            <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Empleados Registrados</h3>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  placeholder="Buscar por nombre, apellido o DPI"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", width: 320 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => { setSearch(""); setPage(1); }} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>Limpiar</button>
                </div>
              </div>
            </div>

            {/* --- TABLA --- */}
            <div style={tableWrapper}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Nombre", "Apellido", "DPI", "Teléfono", "Email", "Estado", "Acciones"].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(displayed) && displayed.length ? (
                    displayed.map((r) => (
                      <tr key={r.idempleado}>
                        <td style={tdStyle}>{r.nombre}</td>
                        <td style={tdStyle}>{r.apellido}</td>
                        <td style={tdStyle}>{r.dpi}</td>
                        <td style={tdStyle}>{r.telefono}</td>
                        <td style={tdStyle}>{r.email}</td>
                        <td style={{ ...tdStyle, textAlign: "center", color: r.estado ? "green" : "red", fontWeight: 600 }}>
                          {r.estado ? "Activo" : "Inactivo"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <button onClick={() => handleEdit(r)} style={btnWarn}>Editar</button>
                          {r.estado
                            ? <button onClick={() => toggleEstado(r, false)} style={btnDanger}>Desactivar</button>
                            : <button onClick={() => toggleEstado(r, true)} style={btnSuccess}>Activar</button>
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: 20 }}>No hay empleados</td></tr>
                  )}
                </tbody>
              </table>

              {/* paginación */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div>
                  Mostrando {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={() => goToPage(1)} disabled={page === 1} style={paginationBtn}>« Primero</button>
                  <button onClick={() => goToPage(page - 1)} disabled={page === 1} style={paginationBtn}>‹</button>
                  <span> Página {page} / {totalPages} </span>
                  <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} style={paginationBtn}>›</button>
                  <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} style={paginationBtn}>Último »</button>
                </div>
              </div>
            </div>

            {/* --- FORMULARIO (debajo de la tabla) --- */}
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", marginTop: 24 }}>
              <h2 style={{ textAlign: "center", marginBottom: 18 }}>{editingId ? "Editar empleado" : "Registrar un nuevo empleado"}</h2>

              {mensaje && (
                <p style={{ textAlign: "center", color: mensaje.includes("Error") ? "red" : "green", marginBottom: 12, fontWeight: "600" }}>
                  {mensaje}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label>Nombre</label>
                    <input name="nombre" value={form.nombre} onChange={onChange} required style={inputStyle} />
                    {errors.nombre && <div style={errStyle}>{errors.nombre}</div>}

                    <label>Apellido</label>
                    <input name="apellido" value={form.apellido} onChange={onChange} required style={inputStyle} />
                    {errors.apellido && <div style={errStyle}>{errors.apellido}</div>}

                    <label>DPI</label>
                    <input
                      name="dpi"
                      value={form.dpi}
                      onChange={onChange}
                      required
                      style={inputStyle}
                      //placeholder="13 dígitos numéricos"
                      maxLength="13"
                      pattern="\d{13}"
                    />
                    {errors.dpi && <div style={errStyle}>{errors.dpi}</div>}

                    <label>NIT</label>
                    <input
                      name="nit"
                      value={form.nit}
                      onChange={onChange}
                      required
                      style={inputStyle}
                      //placeholder="Hasta 8 dígitos numéricos"
                      maxLength="8"
                      pattern="\d{1,8}"
                    />
                    {errors.nit && <div style={errStyle}>{errors.nit}</div>}

                    <label>Género</label>
                    <input name="genero" value={form.genero} onChange={onChange} style={inputStyle} />
                    {errors.genero && <div style={errStyle}>{errors.genero}</div>}

                    <label>Lugar de nacimiento</label>
                    <input name="lugarnacimiento" value={form.lugarnacimiento} onChange={onChange} style={inputStyle} />
                    {errors.lugarnacimiento && <div style={errStyle}>{errors.lugarnacimiento}</div>}

                    <label>Fecha de nacimiento</label>
                    <input type="date" name="fechanacimiento" value={form.fechanacimiento} onChange={onChange} required style={inputStyle} />
                    {errors.fechanacimiento && <div style={errStyle}>{errors.fechanacimiento}</div>}
                  </div>

                  <div>
                    <label>Teléfono</label>
                    <input name="telefono" value={form.telefono} onChange={onChange} required style={inputStyle} />
                    {errors.telefono && <div style={errStyle}>{errors.telefono}</div>}

                    <label>Email</label>
                    <input type="email" name="email" value={form.email} onChange={onChange} required style={inputStyle} placeholder="usuario@ejemplo.com" />
                    {errors.email && <div style={errStyle}>{errors.email}</div>}

                    <label>Dirección</label>
                    <input name="direccion" value={form.direccion} onChange={onChange} required style={inputStyle} />
                    {errors.direccion && <div style={errStyle}>{errors.direccion}</div>}

                    <label>Estado civil</label>
                    <select name="estadocivil" value={form.estadocivil} onChange={onChange} required style={inputStyle}>
                      <option value="">Seleccione una opción</option>
                      <option value="Soltero">Soltero</option>
                      <option value="Casado">Casado</option>
                      <option value="Divorciado">Divorciado</option>
                      <option value="Viudo">Viudo</option>
                      <option value="Union de hecho">Union de hecho</option>
                    </select>
                    {errors.estadocivil && <div style={errStyle}>{errors.estadocivil}</div>}

                    <label>Número de hijos</label>
                    <input type="number" name="numerohijos" value={form.numerohijos} onChange={onChange} required min="0" style={inputStyle} />
                    {errors.numerohijos && <div style={errStyle}>{errors.numerohijos}</div>}

                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" name="estado" checked={form.estado} readOnly />
                      <label>Activo</label>
                    </div>
                  </div>
                </div>

                <button type="submit" style={btnPrimary}>
                  {editingId ? "Actualizar Empleado" : "Guardar Empleado"}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Layout>
  );
};

// estilos reutilizables
const inputStyle = { width: "100%", padding: "12px 15px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16, marginBottom: 8 };
const btnPrimary = { width: "100%", marginTop: 16, padding: "12px 0", background: "#007bff", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer" };
const tableWrapper = { background: "#fff", borderRadius: 12, padding: "14px 18px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", maxHeight: 420, overflow: "auto" };
const thStyle = { borderBottom: "2px solid #eee", padding: 10, textAlign: "left", position: "sticky", top: 0, background: "#fff", zIndex: 1 };
const tdStyle = { padding: 10, borderBottom: "1px solid #f0f0f0" };
const btnWarn = { padding: "6px 10px", background: "#ffc107", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13, marginRight: 6 };
const btnDanger = { padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const btnSuccess = { padding: "6px 10px", background: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 13 };
const errStyle = { color: "#b00020", fontSize: 13, marginTop: 6, marginBottom: 6 };
const paginationBtn = { padding: "6px 8px", borderRadius: 6, cursor: "pointer" };

export default EmpleadosContainer;
