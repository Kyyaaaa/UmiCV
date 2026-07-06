# KẾ HOẠCH VÀ HƯỚNG DẪN CHI TIẾT TRIỂN KHAI HỆ THỐNG UMICV LÊN VPS PRODUCTION

Tài liệu này cung cấp bản quy hoạch kiến trúc hạ tầng và các bước thao tác chi tiết từ A-Z để đưa toàn bộ hệ thống **UmiCV** (Backend Node.js, Frontend React/Nginx, PostgreSQL, Redis, BullMQ) chạy ổn định, bảo mật và hiệu năng cao trên máy chủ riêng ảo (VPS).

---

## PHẦN 1: LỰA CHỌN HỆ ĐIỀU HÀNH & CẤU HÌNH VPS

### 1. Hệ điều hành khuyến nghị (OS Selection)
* 🏆 **Lựa chọn tối ưu nhất:** **Ubuntu 22.04 LTS** hoặc **Ubuntu 24.04 LTS** (Long Term Support).
* **Lý do lựa chọn:**
  * **Tối ưu cho Container:** Linux kernel của Ubuntu LTS tương thích tuyệt đối và đạt hiệu năng cao nhất với Docker & Docker Compose.
  * **Cộng đồng & Hỗ trợ:** Là hệ điều hành máy chủ phổ biến nhất thế giới, tài liệu khắc phục sự cố rất phong phú.
  * **Ổn định & Bảo mật:** Được duy trì bản vá bảo mật liên tục trong 5 năm mà không cần nâng cấp major version gây rủi ro gãy đổ hệ thống.
* *(Lựa chọn thay thế tương đương: Debian 12 Bookworm hoặc Rocky Linux 9).*

### 2. Cấu hình phần cứng tối thiểu và đề xuất (Hardware Specifications)
Do hệ thống UmiCV triển khai theo mô hình cụm vi dịch vụ trong container (**Multi-stage Docker Compose** gồm 5 dịch vụ: PostgreSQL, Redis, Backend API, Frontend Nginx Proxy và pgAdmin), yêu cầu về bộ nhớ RAM rất quan trọng, đặc biệt là trong giai đoạn biên dịch (`npm run build` TypeScript và Vite).

| Tiêu chí | 🔹 Cấu hình Tối thiểu (Demo / Dev / Test) | 🚀 Cấu hình Đề xuất (Production thực tế) |
| :--- | :--- | :--- |
| **CPU** | **2 vCPU** | **2 - 4 vCPU** (Tối ưu xử lý queue & cronjob) |
| **RAM** | **2 GB RAM** *(Bắt buộc phải tạo thêm 4GB Swap)* | **4 GB RAM** *(Hoạt động cực kỳ mượt mà, không lo OOM)* |
| **Ổ cứng** | **30 GB SSD NVMe** | **50 GB - 80 GB SSD NVMe** *(Dành cho Log và Lịch sử CV)* |
| **Băng thông** | Không giới hạn / 1TB | Không giới hạn / 3TB+ |
| **Nhà cung cấp** | DigitalOcean, Vultr, Linode, Hetzner (CAX11/CPX11) | Viettel IDC, FPT Cloud, BizFly Cloud, AWS EC2 |

> [!WARNING]
> **Tại sao không nên dùng VPS 1GB RAM?**
> Khi chạy lệnh `docker compose up --build`, quá trình dịch TypeScript (`tsc`) và đóng gói Vite (`rollup`) tiêu tốn khoảng 1.2GB - 1.5GB RAM nháy mắt. Nếu VPS chỉ có 1GB RAM, tiến trình build sẽ bị Linux Kernel tiêu diệt ngay lập tức với lỗi **`Out of Memory (OOM Killed)`**.

---

## PHẦN 2: LỘ TRÌNH TRIỂN KHAI CHI TIẾT TỪNG BƯỚC (STEP-BY-STEP SETUP)

### BƯỚC 1: Khởi tạo, Thiết lập Swap & Bảo mật cơ bản cho VPS
Sau khi mua VPS và nhận IP cùng mật khẩu root, SSH vào máy chủ và thực hiện ngay các lệnh sau:

#### 1.1. Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2. Tạo bộ nhớ đệm ảo (Swap File 4GB) - *Cực kỳ quan trọng để chống tràn RAM*
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Ghi vĩnh viễn vào fstab để không mất khi reboot VPS
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 1.3. Cấu hình Tường lửa (UFW Firewall)
Chỉ mở các cổng cần thiết để chống tấn công rà quét từ bên ngoài:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 8080/tcp # Cổng Frontend UmiCV (nếu chưa dùng Nginx tổng ngoài host)
sudo ufw --force enable
```

---

### BƯỚC 2: Cài đặt Docker & Docker Compose mới nhất
Sử dụng script cài đặt tự động chính thức từ Docker:
```bash
# Tải và chạy script cài đặt chuẩn từ docker.com
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Kiểm tra phiên bản
docker --version
docker compose version
```

---

### BƯỚC 3: Đưa mã nguồn lên VPS & Cấu hình Môi trường Production
#### 3.1. Tải mã nguồn về máy chủ (Clone Repository)
```bash
# Clone git repo của bạn về VPS
git clone https://github.com/your-username/UmiCV.git
cd UmiCV
```

#### 3.2. Cấu hình biến môi trường bảo mật (`.env` & `docker-compose.yml`)
Tại môi trường Production, **Tuyệt đối không sử dụng mật khẩu mặc định hay để Rate Limit cực đại**.
1. Tạo file `.env` trong thư mục `code/backend/.env`:
```env
NODE_ENV=production
PORT=3000

# Database & Redis (Trùng khớp với cấu hình trong docker-compose.yml)
DATABASE_URL="postgresql://umicv_prod_user:StrongSecretPass2026!@db:5432/umicv_db?schema=public"
REDIS_HOST="redis"
REDIS_PORT="6379"

# Khóa bảo mật JWT (Sử dụng chuỗi ngẫu nhiên dài trên 32 ký tự)
JWT_SECRET="P9k2vX8zQ1wY7rT4nM6bJ3cL5hF0dG8sA2mK4vN6xZ"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_EXPIRES_IN="7d"

# Thông tin gửi Email thật (Sử dụng Gmail App Password hoặc AWS SES / Mailtrap PROD)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="hr-notify@yourcompany.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"

# Cấu hình đường dẫn Frontend thật (IP VPS hoặc Tên miền)
FRONTEND_URL="http://<IP_CUA_VPS>:8080"
# Nếu đã lắp tên miền HTTPS: FRONTEND_URL="https://umicv.yourdomain.com"

# Kích hoạt lại bảo mật Rate Limit tiêu chuẩn
RATE_LIMIT_GLOBAL_MAX=100
RATE_LIMIT_AUTH_MAX=5
```

2. Cập nhật lại mật khẩu PostgreSQL trong `docker-compose.yml` (ở service `db` và `POSTGRES_PASSWORD`).

---

### BƯỚC 4: Build & Khởi chạy Toàn bộ Hệ thống
Thực hiện lệnh đóng gói và khởi chạy cụm dịch vụ dưới chế độ ngầm (Background):
```bash
# Build image và chạy container
docker compose up --build -d

# Kiểm tra danh sách container đang chạy
docker compose ps
```
*Kết quả mong đợi:* Cả 5 container (`umicv-db`, `umicv-redis`, `umicv-backend`, `umicv-frontend`, `umicv-pgadmin`) đều ở trạng thái **`Up (healthy)`** hoặc **`Up`**.

---

### BƯỚC 5: Khởi tạo Cơ sở dữ liệu & Nạp dữ liệu mẫu (Seeding)
Sau khi container backend đã lên, thực hiện đồng bộ cấu trúc DB và nạp tài khoản Quản trị viên:
```bash
# 1. Đẩy cấu trúc bảng từ Prisma vào PostgreSQL
docker exec -it umicv-backend npx prisma db push

# 2. Chạy script tạo tài khoản Admin mặc định (nếu có) hoặc nạp Seeding
# Bạn có thể copy script SQL demo vào container db để nạp
docker exec -i umicv-db psql -U admin -d umicv_db < ./docs/seeding.sql
```

---

### BƯỚC 6: Cấu hình Tên miền & Chứng chỉ Bảo mật SSL/HTTPS (Tuỳ chọn Nâng cao - Khuyến nghị cho PROD)
Để hệ thống chuyên nghiệp và không bị trình duyệt cảnh báo "Not Secure", bạn nên gắn tên miền (Domain) và bật HTTPS:

1. **Trỏ tên miền (DNS A-Record):** Vào trang quản trị tên miền (Cloudflare / TenTen / PA Vietnam), tạo bản ghi `A` trỏ tên miền `umicv.yourdomain.com` về địa chỉ IP của VPS.
2. **Cài đặt Nginx Proxy Manager hoặc Cloudflare Tunnel / Caddy / Certbot:**
   * **Cách nhanh nhất (Cloudflare Free SSL):** Bật cờ "Proxied" (Đám mây màu cam) trên Cloudflare. Chuyển chế độ SSL/TLS trên Cloudflare sang **Full**. Người dùng truy cập `https://umicv.yourdomain.com` sẽ được Cloudflare bảo vệ DDoS và tự động mã hóa SSL.

---

## PHẦN 3: KẾ HOẠCH GIÁM SÁT & BẢO TRÌ ĐỊNH KỲ (MAINTENANCE & BACKUP)

### 3.1. Lệnh kiểm tra nhật ký lỗi (Log Monitoring)
Khi có sự cố gửi mail hoặc lỗi API, tra cứu log trực tiếp bằng lệnh:
```bash
# Xem log thời gian thực của Backend (để theo dõi BullMQ worker, Cronjob)
docker compose logs -f backend

# Xem log của Nginx Frontend
docker compose logs -f frontend
```

### 3.2. Sao lưu Cơ sở dữ liệu tự động hàng ngày (Automated Backup)
Tạo một script bash `/root/backup_db.sh` để xuất file `.sql` định kỳ:
```bash
#!/bin/bash
BACKUP_DIR="/root/db_backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec umicv-db pg_dump -U admin umicv_db > "$BACKUP_DIR/umicv_backup_$TIMESTAMP.sql"
# Xóa các bản backup cũ hơn 7 ngày để tránh đầy ổ cứng
find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -exec rm {} \;
```
Cài đặt vào Cron của VPS (`crontab -e`) để tự động chạy vào 3:00 sáng mỗi ngày:
```cron
0 3 * * * /bin/bash /root/backup_db.sh >/dev/null 2>&1
```

---

## TỔNG KẾT
Với lộ trình 6 bước chuẩn mực trên, hệ thống UmiCV của bạn sẽ vận hành trên VPS với hiệu năng tối đa, an toàn tuyệt đối trước các thảm họa mất dữ liệu hay tấn công mạng, sẵn sàng đáp ứng lưu lượng truy cập lớn trong thực tế!
