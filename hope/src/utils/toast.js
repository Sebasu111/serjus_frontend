// src/utils/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Muestra un toast de notificación con distintos tipos predefinidos.
 * @param {string} mensaje - Texto que se mostrará en el toast.
 * @param {"success"|"error"|"info"|"warning"|"dark"|"default"} tipo - Tipo de notificación.
 */
export const showToast = (mensaje, tipo = "success") => {
    // Crear un ID único basado en el mensaje y tipo para prevenir duplicados
    const toastId = `${tipo}-${mensaje.slice(0, 20).replace(/\s/g, '-')}`;
    
    const options = {
        position: "top-right",
        autoClose: 3000, // 3 segundos
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: toastId // Previene duplicados
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
    // Crear un ID único para prevenir duplicados
    const toastId = `general-${mensaje.slice(0, 20).replace(/\s/g, '-')}`;
    
    toast(mensaje, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        toastId: toastId // Previene duplicados
    });
};

/**
 * Maneja la secuencia de toasts para proceso de PDF
 */
export const showPDFToasts = {
    generando: () => {
        toast.dismiss(); // Limpia toasts anteriores
        toast.info("Generando PDF, por favor espera...", {
            toastId: "pdf-generando",
            position: "top-right",
            autoClose: false, // No se cierra automáticamente
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true
        });
    },
    
    descargado: () => {
        toast.dismiss("pdf-generando"); // Cierra específicamente el toast de generando
        setTimeout(() => {
            toast.success("PDF descargado correctamente", {
                toastId: "pdf-descargado",
                position: "top-right", 
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }, 300); // Pequeño delay para transición suave
    },
    
    error: () => {
        toast.dismiss("pdf-generando");
        setTimeout(() => {
            toast.error("Error al generar el PDF", {
                toastId: "pdf-error",
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }, 300);
    }
};
