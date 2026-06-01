# Mô hình Nghiệp vụ (Domain Model)

Tài liệu này cung cấp các Entity và Aggregate Root cho Database Designer, tập trung vào nghiệp vụ chứ không đi sâu vào cấu trúc bảng chi tiết.

## 1. Domain: Identity & Access (Tổ chức & Người dùng)
- **Entity `User` (Aggregate Root):**
  - Chứa: Id, Username, PasswordHash, Role (Employee, Tech Lead, HR, Admin), DepartmentId.
  - Quan hệ: Thuộc 1 `Department`. Có 1 hoặc nhiều `CVProfile`.
- **Entity `Department`:**
  - Chứa: Id, Name, Code, ParentDepartmentId.
  - Thể hiện cấu trúc sơ đồ tổ chức phòng ban/dự án.

## 2. Domain: CV Management (Hồ sơ CV)
- **Entity `CVProfile` (Aggregate Root):**
  - Chứa: Id, UserId, LanguageCode (vi/en/jp), Status (Nháp, Chờ duyệt, Chưa cập nhật, Đã cập nhật, Hủy yêu cầu), VersionNumber, PublishedAt.
  - Ghi chú: Sử dụng kiểu dữ liệu JSONB (`SectionsData`) để lưu nội dung tự do do người dùng xây dựng từ trình tạo CV (CV Builder). Việc dùng JSONB giúp hệ thống không bị cứng nhắc về số lượng mục (education, experience, skill...).
  - Quan hệ: Thuộc về 1 `User`.
- **Entity `CVVersionHistory`:**
  - Chứa: Id, CVProfileId, VersionNumber, SnapshotData (JSONB), CreatedAt.
  - Mục đích: Lưu trữ bất biến (immutable) các phiên bản cũ để so sánh diff.

## 3. Domain: Batch Request & Workflow (Yêu cầu & Quy trình)
- **Entity `BatchRequest` (Aggregate Root):**
  - Chứa: Id, CreatedBy (HR User Id), Title, Description, Deadline, Status (Active, Cancelled).
  - Quan hệ: 1-N tới `BatchRequestTarget` (Danh sách user bị yêu cầu).
- **Entity `BatchRequestTarget`:**
  - Chứa: BatchRequestId, UserId, Status (Chưa cập nhật, Đã cập nhật).
- **Entity `ApprovalLog`:**
  - Chứa: Id, CVProfileId, ApproverId, Action (Approve, Reject), Level (1, 2), Reason.
  - Mục đích: Truy vết lý do từ chối và đo lường SLA của Tech Lead / HR.

## 4. Domain: System (Hệ thống)
- **Entity `AuditLog`:**
  - Chứa: Id, Action, UserId, ResourceId, Timestamp, IPAddress.
  - Mục đích: Ghi lại hành động quan trọng (Đăng nhập, duyệt, từ chối, v.v.).
