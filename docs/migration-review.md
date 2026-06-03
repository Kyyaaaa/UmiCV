# Báo cáo Kiểm tra Migration (Migration Review)

## 1. Migration Summary

Dựa trên thiết kế Prisma Schema và file SQL Migration đầu tiên (`init`), các thành phần sau đã được khởi tạo thành công:

* **Số lượng bảng:** 10 bảng (`departments`, `users`, `projects`, `project_members`, `cv_profiles`, `cv_version_histories`, `batch_requests`, `batch_request_targets`, `approval_logs`, `audit_logs`).
* **Số lượng Foreign Key:** Đầy đủ các khóa ngoại theo đúng thiết kế ERD. Hành vi xóa tuân thủ quy định (CASCADE cho các bảng mapping và history logs, RESTRICT/SET NULL cho các bảng gốc).
* **Số lượng Index:** Tổng cộng 14 index đã được định nghĩa trong schema (B-Tree cho Khóa ngoại, Unique, Trạng thái truy vấn). Thêm 2 index đặc thù (GIN và Partial).
* **Enum được tạo:** 5 Enum custom type bao gồm: `UserRole`, `CVStatus`, `ApprovalAction`, `TargetStatus`, `BatchRequestStatus`.

## 2. Validation Results

* **Prisma Validate:** ✅ PASS (Schema hoàn toàn hợp lệ).
* **Prisma Migrate:** ✅ PASS (Đã apply migration đầu tiên `init` vào database thật `UmiCV` tại `localhost:5432`).
* **Prisma Generate:** ✅ PASS (Prisma Client đã được sinh thành công tại thư mục `node_modules/@prisma/client`).

## 3. Manual Migration Required (Các Index đặc biệt)

Do Prisma Schema không trực tiếp hỗ trợ GIN Index native và Partial Index trên PostgreSQL, các câu lệnh SQL sau đã được tôi **thêm thủ công** vào cuối file `migration.sql` của lần chạy `init` để đảm bảo tối ưu query như trong `index-strategy.md`:

```sql
-- GIN Index (Tối ưu tìm kiếm JSONB cho tính năng Search Skills)
CREATE INDEX "idx_cv_profiles_sections_data_gin" ON "cv_profiles" USING GIN ("sections_data");

-- Partial Index (Tối ưu truy vấn cho Cronjob nhắc nhở người chưa cập nhật)
CREATE INDEX "idx_batch_request_targets_status" ON "batch_request_targets"("status") WHERE "status" = 'Outdated';
```

## 4. Issues Found & Cách Xử lý

* **Vấn đề 1:** Missing Package.json & Configuration cho Prisma 7.
  * Lệnh `npx prisma migrate` thất bại do thiếu module và `prisma.config.ts`.
  * **Cách xử lý:** Đã chạy `npm init` và install các thư viện lõi của Prisma (`prisma`, `@prisma/client`, `@prisma/config`). Cấu hình `prisma.config.ts` đã được thiết lập để liên kết đúng chuỗi `DATABASE_URL` từ file `.env` theo chuẩn Prisma 7.
* **Vấn đề 2:** Prisma Schema Drift (Do Manual Indexes).
  * Do Prisma không tự định nghĩa được Partial và GIN (một số tùy chỉnh sâu) trong schema, quá trình apply migration `init` khiến Database chứa 2 Index này, nhưng schema thì không. Điều này khiến quá trình chạy lại `migrate dev` hiểu lầm là có drift và muốn tự sinh `DROP INDEX`.
  * **Cách xử lý:** Đã hủy (kill) tiến trình tự động DROP này. Backend Agent sau này khi chỉnh sửa schema và chạy lại `migrate dev` cần hết sức lưu ý: hãy xóa thủ công các lệnh `DROP INDEX` liên quan đến `idx_cv_profiles_sections_data_gin` và `idx_batch_request_targets_status` trong file migration sinh tự động trước khi xác nhận.
