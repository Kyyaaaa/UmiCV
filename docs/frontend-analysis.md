# Phân tích Nghiệp vụ (Business Analysis) - Workflow & Approval Module

## 1. Vai trò và Người dùng (Actors)
Hệ thống xoay quanh 3 nhóm người dùng chính tham gia vào luồng phê duyệt CV:
1. **Employee (Nhân sự)**: Người chủ động cập nhật CV và gửi yêu cầu phê duyệt để xuất bản bản nháp thành bản chính thức.
2. **Tech Lead (Quản lý chuyên môn)**: Người phụ trách kiểm duyệt nội dung chuyên môn (Dự án, Kỹ năng, Kinh nghiệm) của nhân sự thuộc phòng ban mình (Duyệt Cấp 1).
3. **HR (Nhân sự tổng hợp)**: Người phụ trách rà soát định dạng, văn phong, và tiêu chuẩn trình bày chung của công ty trước khi CV được đưa lên kho chung (Duyệt Cấp 2).

## 2. Mục tiêu Nghiệp vụ
- Đảm bảo tính chính xác và chất lượng của mọi CV nhân sự trước khi mang đi đấu thầu hoặc giới thiệu cho khách hàng.
- Quy trình minh bạch, ghi nhận rõ ràng lý do từ chối để nhân sự dễ dàng sửa đổi.
- Theo dõi SLA (thời gian cam kết xử lý) để tránh tình trạng CV bị "ngâm" quá lâu.

## 3. Các Luồng Nghiệp vụ (Workflows)

### 3.1. Luồng Chính (Happy Path)
1. **Employee** hoàn tất chỉnh sửa bản nháp trong CV Workspace và nhấn **Gửi duyệt (Publish CV)**. Trạng thái CV chuyển thành `PendingApproval`.
2. **Tech Lead** nhận được thông báo, truy cập vào trang *Danh sách Yêu cầu phê duyệt*, mở CV của Employee ra xem. Tech Lead kiểm tra khác biệt (Diff) và nhấn **Phê duyệt**. Hệ thống ghi nhận Level 1.
3. **HR** nhận được thông báo CV đã qua Level 1. Truy cập xem chi tiết, đối chiếu chuẩn form mẫu và nhấn **Phê duyệt**.
4. CV được xuất bản thành công, trạng thái chuyển thành `Published`. Bản nháp đè lên bản chính. Employee nhận được thông báo thành công.

### 3.2. Luồng Phụ (Từ chối / Reject)
1. Trong quá trình xét duyệt ở bất kỳ cấp nào (Tech Lead hoặc HR), nếu phát hiện sai sót, người duyệt nhấn **Từ chối**.
2. Người duyệt bắt buộc phải nhập **Lý do từ chối (Reject Reason)** và có thể chỉ định lỗi nằm ở phần nào (Section).
3. Hệ thống ghi nhận lịch sử (Timeline), CV chuyển về trạng thái `Rejected` hoặc quay lại `Draft`.
4. Employee nhận thông báo, vào CV Workspace để xem lý do, sửa đổi và tiếp tục Gửi duyệt lại (Bắt đầu lại luồng chính).

### 3.3. Luồng Ngoại lệ (Edge Cases & Errors)
- **Quá hạn SLA**: Nếu yêu cầu nằm ở trạng thái `PendingApproval` quá 48h mà không ai xử lý, hệ thống tự động gắn cờ "Quá hạn" và gửi cảnh báo đến cấp quản lý cao hơn.
- **Xung đột phiên bản**: Khi đang chờ duyệt, Employee cố tình vào Workspace để sửa tiếp. (Hệ thống cần khóa Workspace lại hoặc bắt buộc Employee phải "Thu hồi yêu cầu" trước khi sửa tiếp).
- **Hủy yêu cầu (Cancel)**: Employee tự nhận ra sai sót và chủ động thu hồi yêu cầu khi đang ở trạng thái `PendingApproval`.
- **Batch Request đóng băng**: Nếu HR đang tạo chiến dịch cập nhật hàng loạt, các CV chưa duyệt có thể bị đánh dấu quá hạn hoặc bị ép cập nhật lại.
