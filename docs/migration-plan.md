# Chiến lược Di chuyển & Cập nhật dữ liệu (Migration Strategy)

Tài liệu này cung cấp hướng dẫn cho Backend Agent để thiết lập CI/CD database migrations và quản lý seed data.

## 1. Chiến lược Nâng cấp Schema (Migration Tool)
- **Công cụ khuyến nghị:** Flyway, Prisma Migrate, TypeORM Migrations hoặc Knex. (Tùy thuộc vào ORM được chọn).
- **Nguyên tắc:** 
  - Không sửa trực tiếp file migration cũ đã run. Phải tạo file mới để alter/drop table.
  - Phải có logic Rollback (Down migration) đối với các DDL (Data Definition Language) có thể revert.

## 2. Thứ tự Tạo Bảng (Migration Order)
Tuân thủ strict referential integrity (khóa ngoại):

1. **`001_create_enums`**: 
   - `UserRole`: `Employee`, `TechLead`, `HR`, `Admin`
   - `CVStatus`: `Draft`, `PendingApproval`, `Outdated`, `Updated`, `Cancelled`
   - `ApprovalLevel`: `1`, `2`
   - `ApprovalAction`: `Approve`, `Reject`
2. **`002_create_departments`**: Bảng gốc độc lập.
3. **`003_create_users`**: Phụ thuộc `departments`.
4. **`004_create_projects`**: Phụ thuộc `users`.
5. **`005_create_project_members`**: Phụ thuộc `projects` và `users`.
6. **`006_create_cv_profiles`**: Phụ thuộc `users`.
7. **`007_create_cv_version_histories`**: Phụ thuộc `cv_profiles`.
8. **`008_create_batch_requests`**: Phụ thuộc `users`.
9. **`009_create_batch_request_targets`**: Phụ thuộc `batch_requests` và `users`.
10. **`010_create_approval_logs`**: Phụ thuộc `cv_profiles` và `users`.
11. **`011_create_audit_logs`**: Phụ thuộc `users`.
12. **`012_create_indexes`**: Chạy tập lệnh tạo GIN Index, Partial Index.

## 3. Business Rules tại mức Database
- **Soft Delete:** Bảng `users` dùng `deleted_at`. View hệ thống chỉ query `WHERE deleted_at IS NULL`.
- **Cascade Rules:**
  - Xóa `users` -> Dùng **Soft Delete**. Không dùng Cascade, nếu dùng Cascade sẽ mất `cv_profiles` (vi phạm quy tắc lưu trữ hồ sơ).
  - Khóa/Soft-Delete `users` -> Update Foreign Keys (như `projects.tech_lead_id`) thành `NULL` (RESTRICT hoặc SET NULL) nếu tech lead nghỉ việc.
  - Xóa `batch_requests` -> **CASCADE** tự động xóa `batch_request_targets`.

## 4. Dữ liệu Mẫu (Seed Data)
Để hệ thống khởi chạy ở môi trường Local/Dev, cần bộ Seeder tự động:
1. **Department Seed:** Tạo 1 `Root Department` và 3 phòng ban con (`IT`, `HR`, `BOD`).
2. **User Seed:** 
   - `admin` (Role: Admin)
   - `hr_lead` (Role: HR)
   - `tech_lead_1` (Role: TechLead, Phòng IT)
   - `emp_1`, `emp_2` (Role: Employee, Phòng IT)
3. **Project Seed:**
   - Dự án `UMICV-Backend`, Tech Lead: `tech_lead_1`.
4. **Project_Members Seed:**
   - Gán `emp_1` và `emp_2` vào `UMICV-Backend`.
