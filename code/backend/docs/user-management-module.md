# User Management Module

## Features
Module `User Management` được xây dựng để cung cấp các API độc quyền cho Administrator nhằm quản lý toàn bộ tài khoản trong hệ thống UmiCV.
Các tính năng bao gồm:
1. Xem danh sách tài khoản với hỗ trợ phân trang (pagination) và lọc (filter theo keyword, role, status).
2. Xem chi tiết thông tin của một tài khoản cụ thể.
3. Tạo tài khoản mới, hỗ trợ gán phòng ban và phân quyền (Role).
4. Cập nhật thông tin cơ bản của tài khoản.
5. Khóa (Lock) và Mở khóa (Unlock) tài khoản khẩn cấp.
6. Đổi quyền (Role) cho tài khoản.
7. Đặt lại mật khẩu (Reset Password) cho tài khoản (chỉ Admin).

## API Endpoints
Tất cả các endpoint thuộc nhóm `/api/users` đều yêu cầu xác thực (`Bearer Token`) và phải là `Admin`.

- `GET /api/users` - Lấy danh sách users.
- `POST /api/users` - Tạo user mới.
- `GET /api/users/:id` - Lấy chi tiết user.
- `PUT /api/users/:id` - Cập nhật thông tin user.
- `PATCH /api/users/:id/lock` - Khóa user.
- `PATCH /api/users/:id/unlock` - Mở khóa user.
- `PATCH /api/users/:id/role` - Đổi role.
- `POST /api/users/:id/reset-password` - Đặt lại mật khẩu.

*(Chi tiết xem trên giao diện Swagger UI tại `/api-docs`)*

## Security Rules
- **Authentication**: Bắt buộc JWT.
- **Authorization**: Middleware `authorize(['Admin'])` ngăn chặn truy cập trái phép.
- **Password Security**: Không bao giờ trả về `passwordHash` trong response. Mật khẩu được mã hóa bcrypt trước khi lưu.
- **Account Locking**: Khi bị khóa (`status = 'Locked'`), tài khoản không thể `login` hoặc gọi `refresh` token mới. Middleware Auth sẽ kiểm tra trường `status` liên tục.

## Validation Rules
Sử dụng `Zod` để validate nghiêm ngặt:
- `email`: Phải đúng định dạng email và tối đa 255 ký tự.
- `password`: Ít nhất 6 ký tự.
- `role`: Giới hạn trong Enum `[Employee, TechLead, HR, Admin]`.
- `departmentId`: UUID hợp lệ.
- `id`: Bắt buộc là UUID.

## Testing Strategy
- **Unit Tests**: File `src/modules/user/__tests__/user.service.test.ts` mock toàn bộ Prisma calls bằng `jest-mock-extended` để đảm bảo logic `lockUser`, `changeRole`, `resetPassword`, ... chạy đúng như kỳ vọng mà không cần DB thực.
- **Integration Tests**: Kiểm thử việc gọi API qua `supertest` kết hợp xác thực Admin.
