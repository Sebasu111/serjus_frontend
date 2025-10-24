# SERJUS Frontend - Sistema de Gestión de Recursos Humanos

Sistema frontend desarrollado en React para la gestión integral de recursos humanos de SERJUS, incluyendo módulos de empleados, capacitaciones, evaluaciones, contratos y más.

## 🚀 Características Principales

- **Gestión de Empleados**: Registro, edición y seguimiento completo de empleados
- **Sistema de Capacitaciones**: Asignación y seguimiento de capacitaciones del personal
- **Evaluaciones**: Módulo completo de evaluaciones de desempeño
- **Gestión Documental**: Manejo de documentos y contratos laborales
- **Módulo de Inducciones**: Sistema de inducción para nuevos empleados
- **Dashboard Interactivo**: Visualización de métricas y estadísticas
- **Sistema de Notificaciones**: Alertas y recordatorios automatizados

## 🛠️ Tecnologías Utilizadas

- **React 18.2.0** - Biblioteca principal de UI
- **React Router DOM 5.2.0** - Navegación y enrutamiento
- **React Hook Form 6.14.2** - Manejo de formularios
- **Axios 1.12.2** - Cliente HTTP para API calls
- **React Toastify 11.0.5** - Sistema de notificaciones
- **Sass 1.32.8** - Preprocesador CSS
- **AOS 2.3.4** - Animaciones on scroll
- **React Icons 5.5.0** - Iconografía
- **React Select 5.10.2** - Componentes de selección avanzados
- **Swiper 6.5.6** - Componentes de carrusel
- **Lucide React 0.544.0** - Iconos modernos

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 14 o superior)
- **Yarn** o **npm** como gestor de paquetes
- **Git** para control de versiones

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Sebasu111/serjus_frontend.git
cd serjus_frontend/hope
```

### 2. Instalar dependencias
```bash
yarn install
# o
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

### 4. Ejecutar en modo desarrollo
```bash
yarn start
# o
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponibles

### Desarrollo
```bash
yarn start          # Inicia el servidor de desarrollo
yarn test           # Ejecuta las pruebas
yarn lint           # Ejecuta ESLint para revisar el código
yarn lint:fix       # Ejecuta ESLint y corrige errores automáticamente
```

### Producción
```bash
yarn build          # Construye la aplicación para producción
yarn build:analyze  # Analiza el tamaño del bundle
```

## 🏗️ Estructura del Proyecto

```
src/
├── assets/             # Recursos estáticos (CSS, imágenes, fuentes)
│   ├── css/           # Archivos CSS externos
│   ├── scss/          # Archivos Sass/SCSS
│   └── fonts/         # Fuentes personalizadas
├── components/         # Componentes reutilizables
│   ├── menu/          # Componentes de navegación
│   ├── sidebar/       # Componentes de barra lateral
│   └── social-icon/   # Iconos sociales
├── containers/         # Contenedores principales de funcionalidad
│   ├── Empleados/     # Módulo de empleados
│   ├── capacitacion/  # Módulo de capacitaciones
│   ├── Evaluaciones/  # Módulo de evaluaciones
│   ├── contratos/     # Módulo de contratos
│   └── ...           # Otros módulos
├── layouts/           # Layouts principales
│   ├── header/        # Componente de header
│   └── footer/        # Componente de footer
├── pages/             # Páginas principales
├── utils/             # Utilidades y helpers
└── stylesGenerales/   # Estilos globales reutilizables
```

## 🔍 Características de Código

### ESLint Configuración
El proyecto incluye una configuración robusta de ESLint con:
- Reglas específicas para React
- Configuración para JSX
- Integración con Prettier
- Reglas de accesibilidad

### Responsive Design
- Diseño completamente responsive
- Mobile-first approach
- Breakpoints optimizados para diferentes dispositivos

### Optimizaciones de Performance
- Lazy loading de componentes
- Optimización de imágenes
- Code splitting automático
- Bundle analysis incluido

## 🧪 Testing

```bash
yarn test              # Ejecuta todas las pruebas
yarn test:coverage     # Ejecuta pruebas con reporte de cobertura
yarn test:watch        # Ejecuta pruebas en modo watch
```

## 🚀 Deployment

### Build para Producción
```bash
yarn build
```

Los archivos optimizados se generarán en la carpeta `build/`.

### Variables de Entorno para Producción
```env
REACT_APP_API_URL=https://api.serjus.com
REACT_APP_ENV=production
```

## 🔧 Resolución de Problemas Comunes

### Error de ESLint Plugin Conflictos
Este problema se resolvió actualizando las dependencias de ESLint:
- Actualización de ESLint a versión 8.57.0
- Compatibilidad mejorada entre plugins
- Configuración unificada en `.eslintrc.js`

### Problemas de Sass Deprecation
Las advertencias de Sass son conocidas y no afectan la funcionalidad. Para resolverlas:
```bash
yarn add sass@latest
```

## 📦 Dependencias Principales

### Producción
- React 18.2.0 & React DOM
- React Router DOM para navegación
- Axios para peticiones HTTP
- React Hook Form para formularios
- React Toastify para notificaciones

### Desarrollo
- ESLint 8.57.0 con plugins actualizados
- Prettier para formateo de código
- Babel ESLint Parser
- React Scripts 5.0.1

## 👥 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de SERJUS. Todos los derechos reservados.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

**Última actualización**: Octubre 2025  
**Versión**: 0.1.0  
**Estado**: ✅ Funcionando correctamente