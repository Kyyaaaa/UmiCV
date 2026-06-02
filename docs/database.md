# Database Design (Schema)

Tài liệu này mô tả chi tiết thiết kế schema cơ sở dữ liệu cho hệ thống UmiCV, tối ưu cho PostgreSQL/Supabase.

## Danh sách các bảng (Tables)

### 1. Bảng `departments` (Phòng ban)
Lưu trữ sơ đồ tổ chức của công ty.
- `id` (UUID, PK): Định danh duy nhất, Default: `gen_random_uuid()`
- `name` (VARCHAR 255, NOT NULL): Tên phòng ban
- `code` (VARCHAR 50, NOT NULL, UNIQUE): Mã phòng ban
- `parent_department_id` (UUID, NULL): FK tham chiếu đến `departments(id)`. Null nếu là cấp cao nhất (Root).
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)

### 2. Bảng `users` (Người dùng)
Lưu trữ thông tin định danh và phân quyền.
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `username` (VARCHAR 100, NOT NULL, UNIQUE): Tên đăng nhập
- `password_hash` (VARCHAR 255, NOT NULL): Mật khẩu đã mã hóa
- `role` (VARCHAR 50, NOT NULL): Vai trò (`Employee`, `TechLead`, `HR`, `Admin`)
- `department_id` (UUID, NOT NULL): FK tham chiếu đến `departments(id)`
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `deleted_at` (TIMESTAMP, NULL): Dùng cho Soft Delete.

### 3. Bảng `projects` (Dự án)
Quản lý dự án để hỗ trợ phân quyền duyệt chéo.
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `name` (VARCHAR 255, NOT NULL): Tên dự án
- `code` (VARCHAR 50, NOT NULL, UNIQUE): Mã dự án
- `tech_lead_id` (UUID, NOT NULL): FK tham chiếu `users(id)`, người chịu trách nhiệm duyệt CV dự án.
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)

### 4. Bảng `project_members` (Thành viên Dự án)
Bảng trung gian (Many-to-Many) liên kết nhân sự vào dự án.
- `project_id` (UUID, NOT NULL): FK tham chiếu `projects(id)`
- `user_id` (UUID, NOT NULL): FK tham chiếu `users(id)`
- `joined_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- **Primary Key:** `(project_id, user_id)`

### 5. Bảng `cv_profiles` (Hồ sơ CV)
Lưu trữ phiên bản hiện tại (bản nháp đang chỉnh sửa hoặc bản mới nhất đang chờ duyệt).
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `user_id` (UUID, NOT NULL): FK tham chiếu `users(id)`
- `language_code` (VARCHAR 10, NOT NULL): Ngôn ngữ (`vi`, `en`, `jp`)
- `status` (VARCHAR 50, NOT NULL): Trạng thái (`Draft`, `PendingApproval`, `Outdated`, `Updated`, `Cancelled`)
- `version_number` (INT, NOT NULL, DEFAULT: 0): Số phiên bản đã publish.
- `sections_data` (JSONB, NOT NULL, DEFAULT: `{}`): Dữ liệu động của CV (học vấn, kinh nghiệm, kỹ năng...).
- `submitted_at` (TIMESTAMP, NULL): Thời điểm gửi duyệt, dùng để tính toán SLA.
- `published_at` (TIMESTAMP, NULL): Thời điểm publish thành công gần nhất.
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- **Unique Constraint:** `(user_id, language_code)`

### 6. Bảng `cv_version_histories` (Lịch sử Phiên bản CV)
Lưu trữ bất biến các phiên bản đã được duyệt (Publish) để so sánh (Diff).
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `cv_profile_id` (UUID, NOT NULL): FK tham chiếu `cv_profiles(id)`
- `version_number` (INT, NOT NULL): Phiên bản (1, 2, 3...)
- `snapshot_data` (JSONB, NOT NULL): Chụp lại (snapshot) toàn bộ nội dung của `sections_data` tại thời điểm publish.
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- **Unique Constraint:** `(cv_profile_id, version_number)`

### 7. Bảng `batch_requests` (Yêu cầu Cập nhật)
Lưu trữ chiến dịch yêu cầu cập nhật CV hàng loạt từ HR.
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `created_by` (UUID, NOT NULL): FK tham chiếu `users(id)` (người tạo - HR)
- `title` (VARCHAR 255, NOT NULL): Tiêu đề đợt cập nhật
- `description` (TEXT, NULL): Mô tả, lý do yêu cầu cập nhật
- `deadline` (TIMESTAMP, NOT NULL): Hạn chót
- `status` (VARCHAR 50, NOT NULL, DEFAULT: 'Active'): Trạng thái (`Active`, `Cancelled`)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)

### 8. Bảng `batch_request_targets` (Mục tiêu Yêu cầu)
Danh sách nhân sự cần cập nhật CV trong một đợt Batch Request.
- `batch_request_id` (UUID, NOT NULL): FK tham chiếu `batch_requests(id)`
- `user_id` (UUID, NOT NULL): FK tham chiếu `users(id)`
- `status` (VARCHAR 50, NOT NULL, DEFAULT: 'Outdated'): Trạng thái (`Outdated` - Chưa cập nhật, `Updated` - Đã cập nhật)
- `notified_at` (TIMESTAMP, NULL): Thời điểm gửi thông báo gần nhất
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- `updated_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
- **Primary Key:** `(batch_request_id, user_id)`

### 9. Bảng `approval_logs` (Nhật ký Phê duyệt)
Lưu trữ lịch sử xét duyệt CV, lý do từ chối để truy vết và đo lường SLA.
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `cv_profile_id` (UUID, NOT NULL): FK tham chiếu `cv_profiles(id)`
- `approver_id` (UUID, NOT NULL): FK tham chiếu `users(id)`
- `action` (VARCHAR 50, NOT NULL): Hành động (`Approve`, `Reject`)
- `level` (INT, NOT NULL): Cấp duyệt (1: Tech Lead, 2: HR)
- `reason` (TEXT, NULL): Lý do từ chối (bắt buộc nếu Reject)
- `section_id` (VARCHAR 100, NULL): Trỏ tới section bị lỗi (hỗ trợ hiển thị UI)
- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)

### 10. Bảng `audit_logs` (Nhật ký Hệ thống)
Ghi nhận các hành động quan trọng (đăng nhập, duyệt, từ chối, hủy batch request...).
- `id` (UUID, PK): Định danh, Default: `gen_random_uuid()`
- `action` (VARCHAR 100, NOT NULL): Tên hành động (vd: `USER_LOGIN`, `CANCEL_BATCH_REQUEST`)
- `user_id` (UUID, NULL): FK tham chiếu `users(id)` (có thể null nếu là hệ thống cronjob thực hiện)
- `resource_id` (VARCHAR 255, NULL): ID của tài nguyên bị tác động
- `ip_address` (VARCHAR 50, NULL): Địa chỉ IP thực hiện
- `timestamp` (TIMESTAMP, NOT NULL, DEFAULT: `now()`)
