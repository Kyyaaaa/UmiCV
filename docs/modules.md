# Danh sách Modules Hệ thống (UmiCV)

Hệ thống UmiCV được phân chia thành các module chức năng nhằm đảm bảo tính độc lập, dễ bảo trì và khả năng mở rộng.

## 1. Auth & IAM Module (Quản lý Định danh & Phân quyền)
- **Trách nhiệm:** 
  - Xác thực người dùng (Local Auth).
  - Phân quyền theo vai trò (RBAC): Employee, Tech Lead, HR, Admin.
  - Quản lý phiên đăng nhập, cấp và làm mới Access Token / Refresh Token (cookie based).
  - Quản lý tài khoản, phòng ban, và sơ đồ tổ chức.

## 2. CV Management Module (Quản lý CV Cơ bản & Draft Space)
- **Trách nhiệm:** 
  - Lưu trữ thông tin cơ bản của CV, quản lý dữ liệu động của CV dưới dạng JSONB.
  - Quản lý "Không gian Nháp" (Draft Space): tách biệt giữa bản đang sửa và bản chính thức (Published).
  - Quản lý Phiên bản (Version Control): lưu lịch sử mỗi lần publish thành công.
  - Hỗ trợ đa ngôn ngữ (Localization): đồng bộ cấu trúc các ngôn ngữ.
  - So sánh khác biệt (Diff Viewer): đối chiếu giữa bản nháp và bản chính thức/các phiên bản cũ.

## 3. Workflow & Approval Module (Luồng Phê duyệt Đa cấp)
- **Trách nhiệm:** 
  - Quản lý trạng thái vòng đời của CV (`Nháp`, `Chờ duyệt`, `Chưa cập nhật`, `Đã cập nhật`, `Hủy yêu cầu`).
  - Xử lý logic phê duyệt 2 cấp: Chuyên môn (Tech Lead) và Định dạng (HR).
  - Quản lý lý do từ chối (Reject Reason) và thông báo lại cho Employee.
  - Giám sát thời gian xử lý duyệt và đánh dấu vi phạm SLA (quá 48h).

## 4. Batch Request Module (Yêu cầu Cập nhật Hàng loạt)
- **Trách nhiệm:** 
  - Cung cấp tính năng cho HR khởi tạo yêu cầu cập nhật CV hàng loạt.
  - Thay đổi trạng thái đồng loạt thành `Chưa cập nhật`.
  - Hủy bỏ yêu cầu đang xử lý, "đóng băng" (freeze) các luồng phê duyệt liên quan.

## 5. Notification & Cronjob Module (Nhắc nhở & Bất đồng bộ)
- **Trách nhiệm:** 
  - Quản lý hàng đợi (Message Queue) để gửi email hoặc tin nhắn nội bộ bất đồng bộ nhằm không block luồng xử lý (SLA < 5 phút).
  - Chạy tác vụ nền định kỳ (Cronjob) hàng ngày (8:00 AM) để rà quét và gửi thông báo cho những nhân viên chưa cập nhật hoặc sắp trễ deadline.

## 6. Search & Reporting Module (Tìm kiếm & Báo cáo)
- **Trách nhiệm:** 
  - Tìm kiếm nâng cao đa chiều (Tên, phòng ban, dự án, kỹ năng, trạng thái).
  - Cung cấp API trích xuất dữ liệu, tải báo cáo ra Excel/CSV.
