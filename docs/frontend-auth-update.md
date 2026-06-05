# Cập nhật Luồng Xác Thực Frontend (Frontend Auth Update)

Tài liệu này ghi lại những thay đổi về việc gỡ bỏ tính năng Quên mật khẩu khỏi hệ thống Frontend.

## Removed Features
- Chức năng Quên mật khẩu (Forgot Password).
- Chức năng Đặt lại mật khẩu (Reset Password).

## Removed Routes
- `/forgot-password`
- `/reset-password`

## Removed Components
- `ForgotPasswordPage` (`src/pages/auth/ForgotPasswordPage.tsx`)
- `ResetPasswordPage` (`src/pages/auth/ResetPasswordPage.tsx`)

## Removed Services
- Không có Service / API Wrapper chuyên biệt nào cần xóa (chức năng trước đây hoàn toàn ở mức UI / Local state mock).

## Reason
Dự án không hỗ trợ quy trình quên mật khẩu thông qua email hay token tự phục vụ (Self-service password reset). Mật khẩu chỉ được quản trị viên cấp lại hoặc người dùng chủ động đổi trong hồ sơ cá nhân (Change Password) khi đã đăng nhập. Việc loại bỏ này nhằm đồng bộ hóa giới hạn nghiệp vụ giữa hệ thống Frontend và Backend.
