# Patrón Estándar para Containers

Este documento define la estructura estándar que todos los containers de la aplicación deben seguir para mantener consistencia en el diseño y funcionalidad del sidebar.

## Estructura Estándar

Todos los containers deben seguir esta estructura exacta:

```jsx
import React, { useState, useEffect } from "react";
import Layout from "../../layouts/index.jsx";
import Header from "../../layouts/header";
import Footer from "../../layouts/footer";
import ScrollToTop from "../../components/scroll-to-top";
import SEO from "../../components/seo";
import { ToastContainer } from "react-toastify";
// ... otros imports específicos del container

const MyContainer = () => {
    // ... lógica del componente

    return (
        <Layout>
            <SEO title="Título de la Página" />
            <div className="wrapper" style={{ display: "flex", minHeight: "100vh" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Header />
                    <main
                        className="main-content site-wrapper-reveal"
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#EEF2F7",
                            padding: "48px 20px 8rem"
                        }}
                    >
                        <div style={{ width: "min(1100px, 96vw)" }}>{/* Contenido principal aquí */}</div>
                    </main>
                    <Footer />
                    <ScrollToTop />
                </div>

                {/* Modales y otros componentes flotantes aquí */}

                <ToastContainer />
            </div>
        </Layout>
    );
};

export default MyContainer;
```

## Puntos Clave

1. **Layout**: Siempre usar el componente `<Layout>` que incluye automáticamente el sidebar
2. **Estructura div wrapper**: Usar `className="wrapper"` y el estilo flex
3. **Main content**: Usar las clases `main-content site-wrapper-reveal` y los estilos específicos
4. **Contenedor de contenido**: Usar `width: "min(1100px, 96vw)"` para responsividad
5. **Footer y ScrollToTop**: Siempre dentro del div principal
6. **Modales**: Fuera del div principal pero dentro del wrapper
7. **ToastContainer**: Al final, dentro del wrapper

## ❌ Errores Comunes a Evitar

-   **NO usar `paddingLeft: "250px"`** - El sidebar se maneja automáticamente
-   **NO usar layouts personalizados** para el main content
-   **NO poner Footer fuera** del div principal
-   **NO usar estilos inconsistentes** para el background o padding

## Containers Ya Corregidos

-   ContratosContainer
-   CapacitacionContainer
-   EmpleadosContainer
-   UsuariosContainer
-   PuestoContainer
-   ConvocatoriasContainer
-   AmonestacionContainer
-   EvaluacionesContainer
-   PerfilContainer

## 🔧 Containers Pendientes de Corrección

Todos los containers principales han sido corregidos. Quedan algunos componentes menores:

-   Modales y tablas específicas (no requieren cambio global)

## Verificación Final

Ejecuta esta búsqueda para verificar que no hay más containers con problemas:

```bash
grep -r "paddingLeft.*250" src/containers/
```

Los únicos resultados deberían ser componentes específicos como modales o tablas, no containers principales.

## Cómo Aplicar la Corrección

1. Reemplazar la estructura del return principal
2. Usar los estilos estándar definidos arriba
3. Mover modales y ToastContainer a la posición correcta
4. Eliminar cualquier `paddingLeft: "250px"` manual
5. Verificar que el sidebar funcione correctamente
