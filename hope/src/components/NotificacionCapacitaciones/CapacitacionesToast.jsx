import { useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast"; // tu función de toast
const API = process.env.REACT_APP_API_URL;

const CapacitacionesToast = () => {
    useEffect(() => {
        const revisarCapacitaciones = async () => {
            const idUsuario = sessionStorage.getItem("idUsuario");
            if (!idUsuario) return;

            try {
                // Traer asignaciones
                const resAsignaciones = await axios.get(`${API}/empleadocapacitacion/`);
                const asignaciones = resAsignaciones.data.results || resAsignaciones.data;

                // Filtrar solo las asignaciones activas del usuario
                const asignacionesActivas = asignaciones.filter(
                    a => a.idusuario === Number(idUsuario) && a.estado === true
                );

                if (asignacionesActivas.length === 0) return;

                // Traer empleados
                const resEmpleados = await axios.get(`${API}/empleados/`);;
                const empleados = resEmpleados.data.results || resEmpleados.data;

                // Buscar el nombre del empleado relacionado con este usuario
                const empleado = empleados.find(e => e.idusuario === Number(idUsuario));

                const nombreEmpleado = empleado ? empleado.nombre : "Empleado";

                // Mostrar toast
                showToast(
                    `${nombreEmpleado}, tiene ${asignacionesActivas.length} capacitaciones activas. Revise su perfil.`,
                    "info"
                );
            } catch (error) {
                console.error("Error al revisar capacitaciones:", error);
            }
        };

        revisarCapacitaciones();
    }, []);

    return null; // Este componente solo maneja la lógica, no renderiza UI
};

export default CapacitacionesToast;
