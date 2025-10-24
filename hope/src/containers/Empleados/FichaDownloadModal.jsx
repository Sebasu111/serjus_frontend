// src/pages/empleados/FichaDownloadModal.jsx
import React, { useMemo, useState } from "react";

const FichaDownloadModal = ({ empleados = [], onClose, onGenerate, generandoPDF = false }) => {
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(() => new Set());

    // Filtrado por nombre, apellido o DPI
    const filtered = useMemo(() => {
        if (!query) return empleados;
        const q = query.toLowerCase();
        return empleados.filter(
            e =>
                String(e?.nombre || "")
                    .toLowerCase()
                    .includes(q) ||
                String(e?.apellido || "")
                    .toLowerCase()
                    .includes(q) ||
                String(e?.dpi || "")
                    .toLowerCase()
                    .includes(q)
        );
    }, [empleados, query]);

    // Helpers de selección
    const idOf = e => e.id || e.idempleado || e.idEmpleado;
    const allFilteredIds = useMemo(() => filtered.map(idOf), [filtered]);

    const areAllFilteredSelected = filtered.length > 0 && allFilteredIds.every(id => selected.has(id));

    const toggleRow = id => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const toggleAllFiltered = () => {
        // Si todos los filtrados están seleccionados -> limpiar solo los filtrados
        // Si falta alguno -> marcar todos los filtrados
        const next = new Set(selected);
        if (areAllFilteredSelected) {
            allFilteredIds.forEach(id => next.delete(id));
        } else {
            allFilteredIds.forEach(id => next.add(id));
        }
        setSelected(next);
    };

    const handleGenerate = () => {
        const picked = empleados.filter(e => selected.has(idOf(e)));
        onGenerate(picked);
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3000,
                paddingLeft: 250
            }}
        >
            <div
                style={{
                    background: "#fff",
                    width: 720,
                    maxWidth: "95%",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 10px 30px rgba(0,0,0,.2)"
                }}
            >
                <h3 style={{ marginTop: 0 }}>Selecciona empleados para descargar la ficha</h3>

                {/* Barra de búsqueda (se quitaron los botones "Marcar todo" y "Limpiar") */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar por nombre, apellido o DPI"
                        style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: "1px solid #ddd",
                            borderRadius: 8
                        }}
                    />
                </div>

                <div
                    style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        maxHeight: 360,
                        overflow: "auto"
                    }}
                >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {/* Celda de checkbox maestro */}
                                <th style={thDark}>
                                    <button
                                        onClick={toggleAllFiltered}
                                        title={
                                            areAllFilteredSelected
                                                ? "Limpiar selección (solo la vista filtrada)"
                                                : "Marcar todo (solo la vista filtrada)"
                                        }
                                        aria-label={areAllFilteredSelected ? "Limpiar todo" : "Marcar todo"}
                                        style={masterBtn}
                                    >
                                        <input
                                            type="checkbox"
                                            readOnly
                                            checked={areAllFilteredSelected}
                                            style={{ width: 16, height: 16, pointerEvents: "none" }}
                                        />
                                    </button>
                                </th>
                                <th style={thDark}>Nombre</th>
                                <th style={thDark}>Apellido</th>
                                <th style={thDark}>DPI</th>
                                <th style={thDark}>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(e => {
                                const id = idOf(e);
                                const checked = selected.has(id);
                                return (
                                    <tr
                                        key={id}
                                        style={{
                                            background: checked ? "rgba(33, 158, 188, .06)" : "#fff"
                                        }}
                                    >
                                        <td style={td}>
                                            <input type="checkbox" checked={checked} onChange={() => toggleRow(id)} />
                                        </td>
                                        <td style={td}>{e.nombre}</td>
                                        <td style={td}>{e.apellido}</td>
                                        <td style={{ ...td, whiteSpace: "nowrap" }}>{e.dpi}</td>
                                        <td style={td}>{e.email}</td>
                                    </tr>
                                );
                            })}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={5} style={{ padding: 16, textAlign: "center" }}>
                                        Sin resultados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Acciones */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: 12,
                        alignItems: "center",
                        flexWrap: "wrap"
                    }}
                >
                    <div style={{ fontSize: 13, color: "#6b7280" }}>
                        Seleccionados: <strong>{selected.size}</strong>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={onClose} style={{ ...btn, background: "#6c757d", color: "#fff" }}>
                            Cerrar
                        </button>
                        <button
                            onClick={handleGenerate}
                            style={{ 
                                ...btn, 
                                background: generandoPDF ? "#cccccc" : "#198754", 
                                color: "#fff",
                                opacity: generandoPDF || selected.size === 0 ? 0.6 : 1,
                                cursor: generandoPDF || selected.size === 0 ? "not-allowed" : "pointer"
                            }}
                            disabled={selected.size === 0 || generandoPDF}
                            title={
                                generandoPDF ? "Generando PDF..." : 
                                selected.size === 0 ? "Selecciona al menos uno" : "Generar PDF"
                            }
                        >
                            {generandoPDF ? "Generando PDF..." : "Generar PDF"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== estilos =====
const thDark = {
    textAlign: "left",
    padding: 10,
    borderBottom: "1px solid #111827",
    position: "sticky",
    top: 0,
    background: "#111827", // más oscuro
    color: "#fff",
    zIndex: 1,
    boxShadow: "0 1px 0 0 #0b1220"
};

const td = { padding: 10, borderBottom: "1px solid #f5f5f5" };

const btn = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    background: "#219ebc",
    color: "#fff"
};

const masterBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,.25)",
    background: "rgba(255,255,255,.08)",
    cursor: "pointer"
};

export default FichaDownloadModal;
