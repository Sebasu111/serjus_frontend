import React from "react";
import { X } from "lucide-react";

const AmonestacionForm = ({
  editingAmonestacion,
  onSubmit,
  onClose,
  empleados = [],
}) => {
  const [idEmpleado, setIdEmpleado] = React.useState(editingAmonestacion?.idempleado || "");
  const [nombreEmpleado, setNombreEmpleado] = React.useState("");
  const [busquedaEmpleado, setBusquedaEmpleado] = React.useState("");
  const [mostrarLista, setMostrarLista] = React.useState(false);

  const [tipo, setTipo] = React.useState(editingAmonestacion?.tipo || "");
  const [fechaAmonestacion, setFechaAmonestacion] = React.useState(editingAmonestacion?.fechaamonestacion || "");
  const [motivo, setMotivo] = React.useState(editingAmonestacion?.motivo || "");
  const [idDocumento, setIdDocumento] = React.useState(editingAmonestacion?.iddocumento || "");
  const [subiendo, setSubiendo] = React.useState(false);

  // Mostrar nombre del empleado al editar
  React.useEffect(() => {
    if (idEmpleado && empleados.length > 0) {
      const emp = empleados.find((e) => e.idempleado === idEmpleado);
      if (emp) {
        setNombreEmpleado(`${emp.nombre} ${emp.apellido}`);
        setBusquedaEmpleado(`${emp.nombre} ${emp.apellido}`);
      }
    }
  }, [idEmpleado, empleados]);

  const handleSelectEmpleado = (empleado) => {
    setIdEmpleado(empleado.idempleado);
    setNombreEmpleado(`${empleado.nombre} ${empleado.apellido}`);
    setBusquedaEmpleado(`${empleado.nombre} ${empleado.apellido}`);
    setMostrarLista(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    try {
      const data = {
        idempleado: idEmpleado,
        tipo,
        fechaamonestacion: fechaAmonestacion,
        motivo,
        iddocumento: idDocumento,
        estado: true, // Siempre activo
        idusuario: 1,
      };
      await onSubmit(data, editingAmonestacion?.idamonestacion);
    } catch (error) {
      console.error(error);
    } finally {
      setSubiendo(false);
    }
  };

  // Filtrado de empleados por nombre o apellido
  const empleadosFiltrados = empleados.filter((e) => {
    const texto = busquedaEmpleado.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(texto) ||
      e.apellido.toLowerCase().includes(texto)
    );
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px",
        maxWidth: "90%",
        background: "#fff",
        boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        padding: "30px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        {editingAmonestacion ? "Editar Amonestación" : "Registrar Amonestación"}
      </h3>

      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        {/* Empleado con búsqueda */}
        <div style={{ marginBottom: "15px", position: "relative" }}>
          <label>Empleado</label>
          <input
            type="text"
            value={busquedaEmpleado}
            onChange={(e) => {
              setBusquedaEmpleado(e.target.value);
              setMostrarLista(true);
            }}
            onFocus={() => setMostrarLista(true)}
            placeholder="Buscar por nombre o apellido..."
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          {mostrarLista && empleadosFiltrados.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: "0",
                margin: "5px 0 0",
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "#fff",
                position: "absolute",
                width: "100%",
                zIndex: 10,
              }}
            >
              {empleadosFiltrados.map((emp) => (
                <li
                  key={emp.idempleado}
                  onClick={() => handleSelectEmpleado(emp)}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                    background:
                      emp.idempleado === idEmpleado ? "#e3f2fd" : "white",
                  }}
                >
                  {emp.nombre} {emp.apellido}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tipo de Amonestación como select */}
        <div style={{ marginBottom: "15px" }}>
          <label>Tipo de Amonestación</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">-- Seleccionar tipo --</option>
            <option value="Leve">Leve</option>
            <option value="Moderada">Moderada</option>
            <option value="Grave">Grave</option>
          </select>
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: "15px" }}>
          <label>Fecha de Amonestación</label>
          <input
            type="date"
            value={fechaAmonestacion}
            onChange={(e) => setFechaAmonestacion(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: "15px" }}>
          <label>Motivo</label>
          <textarea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              resize: "none",
            }}
          />
        </div>

        {/* Documento */}
        <div style={{ marginBottom: "20px" }}>
          <label>ID del Documento</label>
          <input
            type="text"
            value={idDocumento}
            onChange={(e) => setIdDocumento(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={subiendo}
          style={{
            width: "100%",
            padding: "12px",
            background: "#219ebc",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {subiendo ? "Guardando..." : editingAmonestacion ? "Actualizar" : "Guardar"}
        </button>
      </form>

      {/* Cerrar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "15px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        title="Cerrar"
      >
        <X size={24} color="#555" />
      </button>
    </div>
  );
};

export default AmonestacionForm;
