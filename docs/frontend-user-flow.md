# Thiết kế User Flow - Workflow & Approval Module

## 1. Flow của Nhân sự (Employee Flow)

**Entry Point:** Màn hình `CV Workspace` hoặc `CVDashboard`.

1. **Bắt đầu chỉnh sửa:** Người dùng cập nhật dữ liệu trong CV Workspace.
2. **Lưu nháp:** Bấm "Lưu nháp" (hoặc hệ thống lưu tự động tùy cấu hình).
3. **Mở luồng Publish:** Bấm nút **"Publish CV"**.
4. **Trang Publish Review (`/cv/:id/publish`):**
   - Xem lại tổng quan các thông tin cơ bản.
   - Bấm nút "Gửi yêu cầu phê duyệt".
5. **Trạng thái Khóa (Locked State):**
   - Trở về Dashboard, trạng thái CV chuyển thành `Đang chờ duyệt`.
   - Nếu Employee cố gắng vào lại Workspace, hệ thống hiện cảnh báo "CV đang được duyệt, bạn không thể chỉnh sửa" (Read-only mode) kèm nút "Thu hồi yêu cầu".
6. **Kết quả:**
   - *Nếu được duyệt:* Nhận thông báo thành công. CV chuyển thành bản chính thức (`Published`).
   - *Nếu bị từ chối:* Nhận thông báo kèm lý do. Trạng thái chuyển về `Bị từ chối`. Bấm vào thông báo để vào thẳng Workspace sửa lỗi.
**Exit Point:** CV được xuất bản thành công.

---

## 2. Flow của Người duyệt (Tech Lead / HR Flow)

**Entry Point:** Thông báo hệ thống hoặc Màn hình `Approval Request List`.

1. **Tiếp nhận:** Người duyệt truy cập `/workflow` (Danh sách yêu cầu phê duyệt).
   - Hệ thống hiển thị danh sách CV đang chờ (lọc theo phòng ban nếu là Tech Lead, hoặc hiển thị tất cả nếu là HR).
2. **Chọn CV:** Click vào một dòng trong bảng để vào màn hình **Approval Detail (`/workflow/:id`)**.
3. **Đối chiếu (Reviewing):**
   - Tại cột bên trái: Xem CV đầy đủ dưới dạng Preview. 
   - (Tính năng nâng cao): Bấm vào tab "View Diff" để xem highlight xanh/đỏ các phần nhân sự vừa thay đổi so với bản cũ.
   - Tại cột bên phải: Xem "Lịch sử phê duyệt" (Timeline).
4. **Ra quyết định (Decision):**
   - **Trường hợp A (Từ chối):**
     1. Bấm nút "Từ chối".
     2. Popup `RejectModal` xuất hiện.
     3. Nhập lý do từ chối chi tiết.
     4. Bấm "Xác nhận từ chối".
     5. Điều hướng về lại `/workflow`.
   - **Trường hợp B (Phê duyệt):**
     1. Bấm nút "Phê duyệt".
     2. Popup `ApproveModal` xuất hiện xác nhận.
     3. Bấm "Đồng ý".
     4. Điều hướng về lại `/workflow`.
**Exit Point:** Yêu cầu đã được xử lý xong và biến mất khỏi danh sách chờ.
