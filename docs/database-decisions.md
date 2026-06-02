# Các Quyết định Thiết kế Database (Database Decisions)

Tài liệu này ghi nhận lại các thiết kế đã được phân tích, giải quyết mâu thuẫn từ tài liệu, các giả định và thống nhất rủi ro.

## 1. Quyết định Thiết kế (Database Decisions)

- **DBD-01: Sử dụng UUID cho Primary Keys thay vì Serial (Auto Increment).**
  - **Lý do:** 
    1. Tránh đoán định được số lượng dữ liệu nội bộ (số lượng nhân sự, số lượng CV).
    2. An toàn hơn trong môi trường phân tán nếu dự án scale lên microservices.
    3. Hạn chế xung đột khi import dữ liệu (batch import từ hệ thống HRM khác của nội bộ).
  - **Trade-off:** Tốn không gian lưu trữ và hiệu năng index giảm nhẹ. Do hệ thống là nội bộ (lượng user giới hạn, khoảng vài nghìn), trade-off này hoàn toàn chấp nhận được.

- **DBD-02: Kiểu dữ liệu JSONB cho CV Schema.**
  - **Lý do:** Đáp ứng ADR-02 (linh hoạt tối đa khi thêm bớt mục CV). JSONB hỗ trợ tạo GIN index, cho phép tìm kiếm trong văn bản động cực nhanh, không cần dùng Search Engine bên thứ 3.
  - **Kiểm soát tính đúng đắn của dữ liệu:** Xác thực Schema (Zod) sẽ được thực hiện ở tầng Application thay vì cố gắng build Check Constraint dưới Database.

- **DBD-03: Giải quyết mâu thuẫn trạng thái (Status) giữa `CVProfile` và `BatchRequestTarget`.**
  - **Phát hiện (Missing Rule):** Tài liệu Domain Model mô tả `BatchRequestTarget` có trạng thái (`Outdated`, `Updated`), và `CVProfile` cũng có (`Outdated`, `Updated`).
  - **Quyết định Backend Mapping:** 
    - Khi HR tạo đợt yêu cầu hàng loạt (BatchRequest), backend tạo các bản ghi `BatchRequestTarget` (status=`Outdated`), **đồng thời** cập nhật `cv_profiles.status = 'Outdated'` của user.
    - Tại sao giữ cả hai?: `BatchRequestTarget` cần trạng thái riêng để biết user nào đã đáp ứng "đợt yêu cầu này", trong khi `CVProfile` là trạng thái toàn cục của hồ sơ đó.
    - Cả 2 sẽ được đồng bộ từ Backend App.

- **DBD-04: Đo lường SLA phê duyệt.**
  - **Vấn đề:** Domain Model (3) yêu cầu truy vết và đo lường SLA < 48h.
  - **Giải pháp thiết kế:** Bổ sung trường `submitted_at` vào `cv_profiles` để tính mốc bắt đầu chờ duyệt. Thời gian hoàn tất được tính bằng `approval_logs.created_at - cv_profiles.submitted_at`.

## 2. Các Giả định (Assumptions)
- Hệ thống PostgreSQL sử dụng là version 13 trở lên, hỗ trợ `gen_random_uuid()` gốc và tính năng JSONB index tốt.
- Môi trường chạy (hoặc Supabase) sẽ cho phép truy cập đầy đủ vào các tính năng Index đặc thù như GIN và Partial Index.

## 3. Các vấn đề còn mở & Rủi ro (Open Questions & Risks)
- **JSONB Bloat Risk:** Cập nhật liên tục vào một cột JSONB lớn trong PostgreSQL dễ gây ra TOAST bloat, làm phình to database và giảm hiệu năng.
  - **Giải pháp giảm thiểu (Mitigation):** Nhờ cơ chế Draft Space (ADR-04), bản CV nháp có thể được ghi đè bằng PUT nhưng tần suất không quá cao so với insert dạng logs. Khi publish, hệ thống chỉ INSERT bản lưu mới vào bảng History. Điều này hạn chế phần lớn các update heavy trên hệ thống và tránh bloat.

## 4. Prisma Mapping Issue

- **Mô tả vấn đề**: Yêu cầu cấu hình `url = env("DATABASE_URL")` trong `datasource db` không còn được hỗ trợ từ Prisma phiên bản 7.0 trở đi. Việc giữ lại cấu hình này sẽ gây lỗi validation (Mã lỗi: P1012).
- **File liên quan**: `code/backend/prisma/schema.prisma`
- **Đề xuất xử lý**: Đã loại bỏ thuộc tính `url` khỏi file `schema.prisma` để vượt qua `npx prisma validate`. Backend Agent sau này cần tạo thêm file `prisma.config.ts` tại thư mục gốc của backend để cấu hình `DATABASE_URL` cho Prisma Migrate và Client theo chuẩn mới của Prisma 7.
