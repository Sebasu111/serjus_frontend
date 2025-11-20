FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copia los archivos construidos
COPY build .  

# Copia la configuración correcta de SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
