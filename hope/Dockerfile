FROM nginx:alpine

# Carpeta donde NGINX sirve los archivos
WORKDIR /usr/share/nginx/html

# Limpia contenido por defecto
RUN rm -rf ./*

# Copia la compilación del React
COPY build/ .

# Copia configuración de NGINX especial para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
