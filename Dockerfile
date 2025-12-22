FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_SUPABASE_URL=https://khsuxyotlgbstdybxgbw.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtoc3V4eW90bGdic3RkeWJ4Z2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDA0MzcsImV4cCI6MjA4MTkxNjQzN30.II5VGiLa4wO6O8ysI0AjGdvPbz2Cglj6eNLULyyf5Sw
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
