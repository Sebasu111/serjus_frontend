import { useEffect } from "react";
import axios from "axios";
import { showToast } from "../../utils/toast"; // tu función de toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CapacitacionesToast = () => {
    useEffect(() => {
        const revisarCapacitaciones = async () => {
            const idUsuario = sessionStorage.getItem("idUsuario");
            if (!idUsuario) return;

            try {
                // Traer asignaciones
                const resAsignaciones = await axios.get("http://127.0.0.1:8000/api/empleadocapacitacion/");
                const asignaciones = resAsignaciones.data.results || resAsignaciones.data;

                // Filtrar solo las asignaciones activas del usuario
                const asignacionesActivas = asignaciones.filter(
                    a => a.idusuario === Number(idUsuario) && a.estado === true
                );

                if (asignacionesActivas.length === 0) return;

                // Traer empleados
                const resEmpleados = await axios.get("http://127.0.0.1:8000/api/empleados/");
                const empleados = resEmpleados.data.results || resEmpleados.data;

                // Buscar el nombre del empleado relacionado con este usuario
                const empleado = empleados.find(e => e.idusuario === Number(idUsuario));

                const nombreEmpleado = empleado ? empleado.nombre : "Empleado";

                // Mostrar toast
                showToast(
                    `${nombreEmpleado}, tienes ${asignacionesActivas.length} capacitaciones activas. Revisa tu perfil.`,
                    "info"
                );
            } catch (error) {
                console.error("Error al revisar capacitaciones:", error);
            }
        };

        revisarCapacitaciones();
    }, []);

    return <ToastContainer position="top-right" autoClose={5000} />;
};

export default CapacitacionesToast;
