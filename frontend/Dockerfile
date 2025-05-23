# frontend/Dockerfile

# --- 1) Build aşaması: React app’i derle ---
FROM node:18-alpine AS build
WORKDIR /app

# package dosyalarını kopyala ve bağımlılıkları yükle
COPY package.json package-lock.json ./
RUN npm ci

# Kaynak kodu kopyala ve production build oluştur
COPY . .
RUN npm run build

# --- 2) Serve aşaması: Nginx ile statik dosya servisi ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# React’in ayıklanmış build çıktısını al
COPY --from=build /app/build .

# Proxy tanımlı özel Nginx konfigürasyon dosyasını ekle
# (frontend/default.conf içinde /api/* proxy_pass http://backend:8080/api/; tanımlı olmalı)
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
