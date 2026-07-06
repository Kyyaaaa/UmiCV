# Phân tích Màn hình (Screen Specifications)

## 1. Màn hình Danh sách Phê duyệt (Approval Request List)
- **Đường dẫn:** `/workflow`
- **Mục đích:** Liệt kê các CV đang chờ người dùng hiện tại duyệt. Cung cấp góc nhìn tổng quan để quản lý mức độ ưu tiên.
- **Thành phần:**
  - **Page Header:** Tiêu đề "Yêu cầu phê duyệt" và Description.
  - **Filter & Search (Thiếu):** Hiện tại hệ thống chưa có công cụ tìm kiếm và lọc. Cần bổ sung SearchBox (theo tên nhân sự) và FilterPanel (theo cấp duyệt, phòng ban, trạng thái SLA).
  - **Data Table:** 
    - Cột 1: Người gửi (Avatar + Tên + Email)
    - Cột 2: Vị trí (Title)
    - Cột 3: Thời gian gửi (Submitted At)
    - Cột 4: SLA Status (Sắp hết hạn / Quá hạn / An toàn)
    - Cột 5: Hành động (Nút "Duyệt")
  - **Empty/Loading State:** "Không có yêu cầu duyệt" khi mảng rỗng.
- **API Sử dụng:** `GET /api/cvs/search?status=PendingApproval`

---

## 2. Màn hình Chi tiết Phê duyệt (Approval Detail)
- **Đường dẫn:** `/workflow/:id`
- **Mục đích:** Xem chi tiết nội dung CV, lịch sử luồng duyệt và thực hiện hành động Approve/Reject.
- **Thành phần:**
  - **Toolbar / Header:** Nút "Quay lại danh sách", Tiêu đề "Xét duyệt CV: Tên Nhân sự", Badge Phiên bản hiện tại. Nút "Từ chối" (Đỏ) và "Phê duyệt" (Xanh).
  - **Layout:** Chia làm 2 cột (Tỉ lệ 2:1 hoặc 3:1).
    - **Cột Trái (CV Preview / Diff Viewer):** Render giao diện CV thực tế để dễ đọc. Hiện tại đang render nội dung thô (mock). **Cần bổ sung Tab chuyển đổi giữa "Xem bản mới" và "Xem thay đổi (Diff)"** để người duyệt biết nhân viên vừa sửa gì so với bản trước.
    - **Cột Phải (Approval Timeline):** Component `Timeline` biểu diễn lịch sử gửi, duyệt cấp 1, từ chối (kèm lý do)...
  - **Reject Modal:** Component `<Modal>` nhập Textarea bắt buộc (Lý do từ chối).
  - **Approve Confirm Modal:** Component `<ConfirmModal>` xác nhận hành động.
- **API Sử dụng:** 
  - `GET /api/cvs/{id}` (Lấy chi tiết)
  - `GET /api/cvs/{id}/diff` (Lấy dữ liệu so sánh khác biệt)
  - `POST /api/cvs/{id}/approve` (Gọi khi click Phê duyệt)
  - `POST /api/cvs/{id}/reject` (Gọi khi click Xác nhận trong Reject Modal)

---

## 3. Màn hình Publish Review (Giao thoa với CV Module)
- **Đường dẫn:** `/cv/:id/publish`
- **Mục đích:** Để nhân viên rà soát lại lần cuối trước khi bấm nút Gửi yêu cầu. Nơi kích hoạt luồng Workflow.
- **Thành phần:**
  - **Checklist:** Các thông báo cảnh báo (VD: Thiếu kỹ năng, sai format ngày tháng).
  - **Nút Hành động:** "Gửi yêu cầu phê duyệt".
- **API Sử dụng:** `POST /api/cvs/draft/submit`
