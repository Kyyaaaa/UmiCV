FROM node:20-alpine

# Cài đặt openssl cho Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Cài đặt dependencies (dùng ci cho chuẩn xác)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build ứng dụng (biên dịch TS sang JS trong thư mục dist)
RUN npm run build

# Khai báo port sẽ chạy
EXPOSE 3000

# Khởi chạy server
CMD ["npm", "start"]
