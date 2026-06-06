# CV Workspace Manual Save Flow

Tài liệu này mô tả kiến trúc và luồng hoạt động của mô hình Manual Save (Lưu thủ công) trong module CV Workspace.

## 1. Manual Save Flow
Từ phiên bản này, CV Workspace đã loại bỏ hoàn toàn cơ chế Auto Save (tự động lưu sau 2.5s không gõ phím). Thay vào đó, người dùng hoàn toàn kiểm soát việc lưu dữ liệu bằng cách nhấn nút **Lưu nháp**.

- **Không tự động gọi API**: Bất kỳ thay đổi nào trên Form (gõ phím, chọn skill, thêm mục) đều chỉ được phản ánh vào state của Frontend (`cvData`). Không có API nào được gọi ngầm.
- **Save Draft**: Khi người dùng nhấn nút "Lưu nháp", hệ thống hiển thị trạng thái "Đang lưu..." trên DraftIndicator, khóa nút Lưu, và tiến hành gọi `PUT /api/cvs/:id/draft`.
- **Thành công**: Khi lưu thành công, trạng thái `isDirty` chuyển về `false`. Nút Lưu bị disabled cho tới khi có thay đổi mới.

## 2. Dirty State Flow
Trạng thái thay đổi của CV được quản lý bởi một biến duy nhất: `isDirty` (kiểu `boolean`). 

- **Khởi tạo**: `isDirty = false` khi Workspace vừa load xong hoặc khi người dùng đang ở chế độ Xem lịch sử (History View Mode).
- **Kích hoạt (Set Dirty)**: Bất kỳ thao tác nào làm biến đổi `cvData` (ví dụ: gõ phím, thêm/xóa/đổi tên mục tùy chỉnh, thay đổi thứ tự mục) đều gọi `setIsDirty(true)`. 
- **Giải trừ (Reset Dirty)**: Chỉ khi người dùng thực hiện Lưu nháp thành công, `isDirty` mới được reset về `false`.
- **UI Feedback**:
  - Khi `isDirty === false`: Hiển thị "✓ Đã lưu lúc [thời gian]".
  - Khi `isDirty === true`: Hiển thị "● Chưa lưu thay đổi" màu vàng cảnh báo.

## 3. Leave Protection Flow (Chặn điều hướng trong nội bộ SPA)
Bảo vệ thao tác của người dùng khi họ chưa lưu nhưng vô tình click vào một liên kết (route) khác.

- **useBlocker Hook**: Sử dụng tính năng `useBlocker` của React Router v6.4+ (Yêu cầu Data Router).
- **Điều kiện chặn**: Chặn điều hướng nếu `isDirty === true` VÀ `currentLocation.pathname !== nextLocation.pathname`.
- **Xử lý Hộp thoại**: 
  - Hệ thống bật `window.confirm`: *"Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát mà không lưu?"*
  - Nếu người dùng chọn **OK** (Rời đi): Gọi `blocker.proceed()`.
  - Nếu người dùng chọn **Cancel** (Ở lại): Gọi `blocker.reset()` để hủy điều hướng.
- **Button Quay lại (Back)**: Nút mũi tên Quay lại ở header cũng được tích hợp chung logic hỏi xác nhận này.

## 4. Browser Protection Flow (Chặn tải lại/đóng trang)
Bảo vệ thao tác khi người dùng dùng các tính năng Native của trình duyệt (Refresh, Close Tab, Close Browser).

- **beforeunload Event**: Đăng ký một event listener `window.addEventListener('beforeunload')`.
- **Điều kiện chặn**: Nếu `isDirty === true`, gọi `e.preventDefault()` và gán `e.returnValue = ''`.
- **Xử lý**: Trình duyệt sẽ hiển thị hộp thoại cảnh báo chuẩn của Native (ví dụ: "Leave site? Changes you made may not be saved.") để người dùng xác nhận.
