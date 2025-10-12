import React, { useMemo, useState } from "react";

const FichaDownloadModal = ({ empleados = [], onClose, onGenerate }) => {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(() => new Set());

    const filtered = useMemo(() => {
        if (!query) return empleados;
        const q = query.toLowerCase();
        return empleados.filter(e =>
            String(e?.nombre || "").toLowerCase().includes(q) ||
            String(e?.apellido || "").toLowerCase().includes(q) ||
            String(e?.dpi || "").toLowerCase().includes(q)
        );
    }, [empleados, query]);

    const toggle = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const allIds = filtered.map(e => e.id || e.idempleado || e.idEmpleado);
    const selectAll = () => { const n = new Set(selected); allIds.forEach(id => n.add(id)); setSelected(n); };
    const clearAll = () => setSelected(new Set());

    const handleGenerate = () => {
        const picked = empleados.filter(e => selected.has(e.id || e.idempleado || e.idEmpleado));
        onGenerate(picked);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, paddingLeft: 250 }}>
            <div style={{ background: "#fff", width: 720, maxWidth: "95%", borderRadius: 12, padding: 20, boxShadow: "0 10px 30px rgba(0,0,0,.2)" }}>
                <h3 style={{ marginTop: 0 }}>Selecciona empleados para descargar la ficha</h3>

                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, apellido o DPI" style={{ flex: 1, padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8 }} />
                    <button onClick={selectAll} style={btn}>Marcar todo</button>
                    <button onClick={clearAll} style={btn}>Limpiar</button>
                </div>

                <div style={{ border: "1px solid #eee", borderRadius: 10, maxHeight: 360, overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                <th style={th}>✓</th><th style={th}>Nombre</th><th style={th}>Apellido</th><th style={th}>DPI</th><th style={th}>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(e => {
                                const id = e.id || e.idempleado || e.idEmpleado;
                                const checked = selected.has(id);
                                return (
                                    <tr key={id}>
                                        <td style={td}><input type="checkbox" checked={checked} onChange={() => toggle(id)} /></td>
                                        <td style={td}>{e.nombre}</td>
                                        <td style={td}>{e.apellido}</td>
                                        <td style={td}>{e.dpi}</td>
                                        <td style={td}>{e.email}</td>
                                    </tr>
                                );
                            })}
                            {!filtered.length && <tr><td colSpan={5} style={{ padding: 16, textAlign: "center" }}>Sin resultados</td></tr>}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button onClick={onClose} style={{ ...btn, background: "#6c757d", color: "#fff" }}>Cerrar</button>
                    <button onClick={handleGenerate} style={{ ...btn, background: "#198754", color: "#fff" }}>Generar PDF</button>
                </div>
            </div>
        </div>
    );
};

const th = { textAlign: "left", padding: 10, borderBottom: "1px solid #eee", position: "sticky", top: 0, background: "#fafafa" };
const td = { padding: 10, borderBottom: "1px solid #f5f5f5" };
const btn = { padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#219ebc", color: "#fff" };

export default FichaDownloadModal;
