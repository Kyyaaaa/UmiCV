# Chiến lược Đánh chỉ mục (Index Strategy)

Tài liệu thiết kế cấu trúc Index cho PostgreSQL nhằm tối ưu hiệu năng truy vấn, phục vụ cho các module Search & Reporting và Cronjob.

## 1. Primary Indexes
Mặc định PostgreSQL tự động tạo index dạng B-Tree cho tất cả các cột `PRIMARY KEY`.
- `departments(id)`
- `users(id)`
- `projects(id)`
- `project_members(project_id, user_id)`
- `cv_profiles(id)`
- `cv_version_histories(id)`
- `batch_requests(id)`
- `batch_request_targets(batch_request_id, user_id)`
- `approval_logs(id)`
- `audit_logs(id)`

## 2. Foreign Key Indexes
PostgreSQL KHÔNG tự động index các khóa ngoại (Foreign Key). Để tối ưu các lệnh `JOIN` và tránh Table Scan khi thực hiện `ON DELETE CASCADE / SET NULL`, cần tạo các B-Tree index:
- `idx_users_department_id` trên `users(department_id)`
- `idx_projects_tech_lead_id` trên `projects(tech_lead_id)`
- `idx_cv_profiles_user_id` trên `cv_profiles(user_id)`
- `idx_version_history_profile_id` trên `cv_version_histories(cv_profile_id)`
- `idx_batch_requests_created_by` trên `batch_requests(created_by)`
- `idx_batch_targets_user_id` trên `batch_request_targets(user_id)`
- `idx_approval_logs_profile_id` trên `approval_logs(cv_profile_id)`
- `idx_approval_logs_approver_id` trên `approval_logs(approver_id)`

## 3. Unique & Constraints Indexes
Đảm bảo tính toàn vẹn dữ liệu nghiệp vụ:
- `idx_users_username_unique` (UNIQUE) trên `users(username)`: Phục vụ Auth Login siêu tốc.
- `idx_departments_code_unique` (UNIQUE) trên `departments(code)`
- `idx_projects_code_unique` (UNIQUE) trên `projects(code)`
- `idx_cv_profiles_user_lang_unique` (UNIQUE) trên `cv_profiles(user_id, language_code)`: Ngăn việc 1 user tạo 2 profile cùng ngôn ngữ.
- `idx_cv_histories_profile_version_unique` (UNIQUE) trên `cv_version_histories(cv_profile_id, version_number)`

## 4. Search & Filtering Indexes (Tối ưu Query)

### Index cho việc Search CV (Tìm kiếm nâng cao)
API `/api/cvs/search` hỗ trợ lọc theo phòng ban, trạng thái và kỹ năng.
- **Tên Index:** `idx_cv_profiles_status` 
  - **Loại:** B-Tree trên `cv_profiles(status)`
  - **Mục đích:** Hỗ trợ query nhanh các CV đang `PendingApproval` (Cho Tech Lead / HR) hoặc `Outdated`.
- **Tên Index:** `idx_cv_profiles_sections_data_gin`
  - **Loại:** GIN (Generalized Inverted Index) trên `cv_profiles(sections_data)`
  - **Mục đích:** Cực kỳ quan trọng để truy vấn sâu vào dữ liệu JSONB. Khi User/HR tìm kiếm keyword như "React" hay "Java" nằm bên trong danh sách Skills của JSON. PostgreSQL GIN index giúp tránh Full Table Scan trên dữ liệu text lớn.

### Index cho Cronjob & Worker
- **Tên Index:** `idx_batch_request_targets_status`
  - **Loại:** Partial B-Tree trên `batch_request_targets(status)` với điều kiện `WHERE status = 'Outdated'`
  - **Mục đích:** Cronjob lúc 8:00 AM hằng ngày chỉ cần quét các target chưa cập nhật (Outdated) để gửi email nhắc nhở, Index dạng Partial giúp kích thước index siêu nhỏ và cực kỳ nhanh.
- **Tên Index:** `idx_batch_requests_status_deadline`
  - **Loại:** Composite B-Tree trên `batch_requests(status, deadline)`
  - **Mục đích:** Giúp Cronjob dễ dàng tìm các chiến dịch còn hạn (`Active`) và sắp đến `deadline`.
