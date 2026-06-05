# Tài liệu dọn dẹp hệ thống Xác thực Frontend (Frontend Auth Cleanup)

Tài liệu này ghi chú lại quá trình dọn dẹp và gỡ bỏ các tính năng không được hỗ trợ trong hệ thống Frontend để đảm bảo tính đồng bộ với quy trình quản lý phiên từ Backend.

## Removed Features
- **Remember Me / Ghi nhớ đăng nhập**: Tính năng cho phép người dùng duy trì phiên đăng nhập lâu dài thông qua checkbox ở màn hình Login đã bị gỡ bỏ.
- **Keep Me Logged In / Stay Signed In**: Không còn tồn tại dưới bất kỳ hình thức nào ở giao diện hay logic nội bộ.

## Updated Files
- `code/frontend/src/pages/auth/LoginPage.tsx`: 
  - Đã xóa thẻ Checkbox "Ghi nhớ đăng nhập".
  - Giữ nguyên cấu trúc Form Layout.
  - Không có file hay state (`rememberMe`) nào khác bị ảnh hưởng do tính năng này chưa từng được cài đặt logic thực sự trước đó.

## Auth Strategy
Chiến lược quản lý phiên xác thực (Session Management) hiện tại:
- **Thời lượng phiên đăng nhập**: Mặc định được cấu hình và điều khiển hoàn toàn bởi Backend API thông qua thời gian sống của JWT Access Token và Refresh Token. 
- **Lưu trữ Frontend**: Frontend lưu trữ các Token này một cách thụ động dựa trên Payload trả về từ Backend (khi gọi `authService.login`) thông qua Auth Context và duy trì cho đến khi hết hạn hoặc người dùng chủ động Logout.
- **Tùy chỉnh thời gian**: Người dùng cuối (End-user) không có quyền tự điều chỉnh thời lượng sống của Session (không có chức năng Remember Me theo yêu cầu nghiệp vụ hiện hành).
