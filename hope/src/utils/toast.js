// src/utils/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showToast = (mensaje, tipo = "success") => {
  const options = {
    position: "top-right",
    autoClose: 3000, // 3 segundos
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  if (tipo === "success") {
    toast.success(mensaje, options);
  } else if (tipo === "error") {
    toast.error(mensaje, options);
  } else {
    toast(mensaje, options);
  }
};
