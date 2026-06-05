# Cập nhật Database: Module User Management

## Chi tiết thay đổi
Trong quá trình triển khai User Management, các trường (fields) dưới đây đã được thêm vào model `User` nhằm hỗ trợ quản lý danh tính, định danh liên lạc, và chức năng khóa tài khoản an toàn:

### Thay đổi Prisma Schema:
1. **Thêm enum `UserStatus`**: `Active`, `Locked`.
2. **Thêm các field vào model `User`**:
   - `email`: `String @unique @db.VarChar(255)` (Yêu cầu để phục vụ liên lạc, quản trị và unique check).
   - `fullName`: `String @map("full_name") @db.VarChar(255)` (Tên hiển thị đầy đủ của nhân sự).
   - `status`: `UserStatus @default(Active)` (Lưu trữ trạng thái tài khoản: Hoạt động hay Bị khóa).
   - `lockedAt`: `DateTime? @map("locked_at")` (Theo dõi mốc thời gian khóa để phục vụ audit/log).

## Lệnh Migration
```bash
npx prisma migrate dev --name add_user_management_fields
```

## Lưu ý đối với môi trường Production
Nếu database đang có dữ liệu, cột `email` và `fullName` được gán kiểu Not Null (`String` thay vì `String?`) nên quá trình migrate có thể yêu cầu xóa dữ liệu cũ (reset) trong môi trường Development, hoặc trong môi trường Production cần chạy một step migration custom để điền dữ liệu (ví dụ sinh email ngẫu nhiên dựa trên username).
Trong dự án hiện tại, database dev được sử dụng lại thông qua migrate dev nên có thể Prisma sẽ yêu cầu reset hoặc tự xử lý nếu dữ liệu đang rỗng.
