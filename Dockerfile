# ---- Build ----
FROM node:22-alpine AS build
WORKDIR /app

# Copiar solo el manifiesto primero para que "npm ci" quede cacheado entre builds
# mientras no cambien las dependencias.
COPY package*.json ./
RUN npm ci

COPY . .

# Vite "hornea" sus variables de entorno (import.meta.env) en el bundle en tiempo de BUILD,
# no de ejecución — por eso viajan como build args, no como variables normales del contenedor.
# En Railway: Settings > Variables del servicio del frontend, con estos mismos nombres —
# Railway los pasa automáticamente como build args si coinciden con los ARG de abajo.
ARG VITE_API_URL
ARG VITE_NOMBRE_APP
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_NOMBRE_APP=$VITE_NOMBRE_APP

RUN npm run build

# ---- Runtime ----
FROM nginx:1.27-alpine AS runtime

# Plantilla en vez de nginx.conf fijo: el entrypoint oficial de la imagen corre envsubst
# sobre /etc/nginx/templates/*.template al arrancar, sustituyendo ${PORT} por el puerto real
# que Railway asigna en cada deploy (nunca es el mismo dos veces).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
