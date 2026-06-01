# Kiến trúc Hệ thống (System Architecture)

## 1. Kiến trúc Tổng thể
Hệ thống sử dụng mô hình kiến trúc **Modular Monolith** ở giai đoạn Release 1. Đây là sự lựa chọn tối ưu theo hướng dẫn của kiến trúc phần mềm Backend để giảm thiểu độ phức tạp triển khai ban đầu, đồng thời vẫn giữ được ranh giới rõ ràng (bounded contexts) giữa các domain (Auth, CV, Workflow, v.v.), thuận tiện để tách microservices sau này.

## 2. Các Tầng (Layers) trong Ứng dụng (Clean Architecture / Layered)
Ứng dụng Backend được tổ chức theo kiến trúc Clean Architecture:
- **Presentation Layer (Controllers/Routers):** Xử lý HTTP request/response, validate input cơ bản, phân quyền API (Middleware RBAC). Không chứa logic nghiệp vụ.
- **Application Layer (Use Cases/Services):** Chứa các luồng logic nghiệp vụ ứng dụng (Ví dụ: Tạo Batch Request, Gửi duyệt CV). Gọi đến Domain Layer và Infrastructure Layer.
- **Domain Layer (Entities & Aggregates):** Chứa business rules cốt lõi không phụ thuộc vào framework. (Ví dụ: Luật chuyển trạng thái CV, Luật duyệt cấp 1/cấp 2).
- **Infrastructure Layer (Adapters):** Quản lý kết nối Database (PostgreSQL), Redis/BullMQ (Queue), gửi Email (SMTP).

## 3. Luồng Dữ liệu (Data Flow)
1. **Synchronous Flow (Frontend <-> Backend <-> Database):**
   - Frontend gửi Request (RESTful API) kèm JWT Access Token tới Backend.
   - Backend Router gọi Middleware kiểm tra JWT và RBAC (Tech Lead, HR...).
   - Service xử lý logic, đọc/ghi dữ liệu trên PostgreSQL qua ORM/Query Builder.
   - Trả về JSON Response.
2. **Asynchronous Flow (Frontend -> Backend -> Message Broker -> Worker):**
   - Vd: HR tạo Batch Request. Backend ghi nhận Batch Request vào CSDL, đổi trạng thái CV thành "Chưa cập nhật".
   - Backend (Producer) đẩy Job "Gửi Email Thông Báo" vào Redis Queue và trả response ngay cho HR.
   - Background Worker (Consumer) lấy Job từ Redis Queue, kết nối SMTP/Webhook, gửi email và ghi Audit Log.
3. **Scheduled Flow (Cronjob -> Worker):**
   - Cronjob chạy lúc 8:00 AM hằng ngày.
   - Truy vấn PostgreSQL tìm các CV `Chưa cập nhật` sát deadline.
   - Đẩy Notification Jobs vào Redis Queue để Worker xử lý.

## 4. Quyết định Công nghệ (Tech Stack)
- **Frontend:** React, Vite, TypeScript, TailwindCSS.
- **Backend:** Node.js, Express, TypeScript. RESTful API.
- **Database:** PostgreSQL (lưu trữ quan hệ và dữ liệu động qua JSONB).
- **Cache & Async Queue:** Redis & BullMQ.
- **Triển khai:** Docker & Docker-compose.
