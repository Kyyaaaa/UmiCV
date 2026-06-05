# Quyết định Kiến trúc & Cài đặt Backend (Backend Decisions)

Tài liệu này lưu lại các quyết định trong quá trình triển khai Backend Node.js cho dự án UmiCV.

## 1. Công nghệ sử dụng
- **Ngôn ngữ & Framework:** TypeScript, Node.js, Express.
- **ORM & Database:** Prisma ORM và PostgreSQL. Việc sử dụng Prisma mang lại trải nghiệm Type Safety rất tốt. Dù Prisma chưa hỗ trợ native GIN Index và Partial Index trên schema, chúng tôi đã thêm các index này thông qua Raw SQL Migration (`migration.sql` sinh tự động của Prisma).
- **Validation:** Zod. Hỗ trợ validate dữ liệu chặt chẽ từ Request Body/Query và tạo ra type inference thẳng vào DTO của TypeScript.
- **Background Jobs:** BullMQ trên nền Redis. Được sử dụng để gửi Email thông báo mà không làm block luồng Request/Response.

## 2. Kiến trúc thư mục (Modular Monolith)
Thay vì tổ chức theo kiểu Layered (Controllers, Services riêng biệt ở cấp cao nhất), mã nguồn được gom nhóm theo tính năng (Domain Modules) nằm trong `src/modules/`.
Ví dụ: Toàn bộ Controller, Service, DTO, Route của Workflow nằm trong `src/modules/workflow/`.
Điều này giúp dễ dàng bóc tách thành Microservices trong tương lai.

## 3. Các Giả định (Assumptions)
- Mặc định các thông tin phòng ban, dự án và user (nhân sự) đã được đồng bộ thông qua script Seed (`seed.ts`) hoặc một tiến trình đồng bộ khác. Hệ thống Backend không mở API tạo User/Department ra public.
- Workflow chỉ hỗ trợ một bản Draft duy nhất trên mỗi ngôn ngữ tại một thời điểm cho một User. Khi Reject, bản đó quay về trạng thái Draft để sửa. Khi Approve hoàn tất (Level 2), bản đó trở thành Updated, ghi vào lịch sử và bản cũ vẫn giữ để tạo phiên bản Diff.

## 4. Các vấn đề cần lưu ý cho quá trình bảo trì
- **Prisma Schema Drift:** Do có 2 Index tạo tay bằng Raw SQL (GIN cho JSONB và Partial cho Target Status), mỗi lần chạy `prisma migrate dev` trong tương lai có thể Prisma sẽ hỏi lại hoặc sinh lệnh DROP 2 index này. Developer cần chủ động xóa lệnh DROP trong file migration tự sinh trước khi commit lên Git.
- **JSONB Search:** Việc tìm kiếm Text Search trên JSONB đang dùng cách ghép chuỗi hoặc fallback về raw SQL, tuỳ mức độ phức tạp của dữ liệu. Nếu cần search chi tiết từng Key, có thể bổ sung raw query trong `search.service.ts`.
