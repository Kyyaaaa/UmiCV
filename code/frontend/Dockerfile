# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Khai báo biến môi trường cho build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build ứng dụng Vite
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Xóa default config của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình Nginx tùy chỉnh (có chứa proxy cho /api)
COPY nginx.conf /etc/nginx/conf.d

# Copy thư mục build từ stage 1 sang thư mục html của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
