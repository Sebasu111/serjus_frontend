import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, rolesPermitidos = [], ...rest }) => {

    const usuarioGuardado = localStorage.getItem("usuarioLogueado");
    let usuario = null;
    try { usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null; } catch { usuario = null; }

    const idRol = usuario?.idrol ? Number(usuario.idrol) : null;

    return (
        <Route
            {...rest}
            render={(props) => {

                // ❌ Si no hay login
                if (!idRol) return <Redirect to="/" />;  // redirige al login real

                // ❌ Si el rol no coincide
                if (!rolesPermitidos.map(Number).includes(idRol)) {
                    return <Redirect to="/home" />;
                }

                // ✔ Acceso permitido
                return <Component {...props} />;
            }}
        />
    );
};

export default ProtectedRoute;
