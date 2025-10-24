// src/utils/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Muestra un toast de notificación con distintos tipos predefinidos.
 * @param {string} mensaje - Texto que se mostrará en el toast.
 * @param {"success"|"error"|"info"|"warning"|"dark"|"default"} tipo - Tipo de notificación.
 */
export const showToast = (mensaje, tipo = "success") => {
    const options = {
        position: "top-right",
        autoClose: 3000, // 3 segundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    };

    switch (tipo) {
        case "success":
            toast.success(mensaje, options);
            break;
        case "error":
            toast.error(mensaje, options);
            break;
        case "info":
            toast.info(mensaje, options);
            break;
        case "warning":
            toast.warning(mensaje, options);
            break;
        case "dark":
            toast.dark(mensaje, { ...options, theme: "dark" });
            break;
        case "default":
        default:
            toast(mensaje, options);
            break;
    }
};

/**
 * Muestra un toast general (por ejemplo, para mensajes genéricos o notificaciones de sistema)
 * @param {string} mensaje - Texto a mostrar
 */
export const showGeneralToast = mensaje => {
    toast(mensaje, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light"
    });
};
