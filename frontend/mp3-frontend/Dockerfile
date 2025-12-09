# Builder stage (Node) — keep dev deps so Vite/Tailwind can build
FROM node:18-alpine AS builder
WORKDIR /app
# Ensure local node bin in PATH (useful if packages expose bin scripts)
ENV PATH /app/node_modules/.bin:$PATH

# Copy lock & package files first for layer caching
COPY package*.json ./

# Use npm ci if you have package-lock.json, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy source
COPY . .

# Build the app (Vite produces `dist` by default)
RUN npm run build

# Production image: nginx serves the static dist
FROM nginx:stable-alpine

# remove default content
RUN rm -rf /usr/share/nginx/html/*

# SPA nginx config + long cache for static assets
RUN mkdir -p /etc/nginx/conf.d && \
    printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location ~* \\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {\n    expires 1y;\n    add_header Cache-Control \"public, max-age=31536000, immutable\";\n  }\n}\n' > /etc/nginx/conf.d/default.conf

# Copy Vite's output dir
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
