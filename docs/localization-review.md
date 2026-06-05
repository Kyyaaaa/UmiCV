# Localization Review

Tài liệu này ghi nhận từ điển (Dictionary) chuẩn hóa Message từ Backend sang Tiếng Việt.
Frontend có thể tham khảo bảng này để hiểu các mã lỗi và câu thông báo trả về từ Backend.

## 1. Từ Điển Chuẩn Hóa (Dictionary)

| Phân Loại (Category) | Tiếng Anh (Cũ) | Tiếng Việt (Mới) | Ngữ Cảnh (Context) |
|----------------------|----------------|------------------|--------------------|
| **COMMON** | Validation failed | Dữ liệu không hợp lệ | Khi input không pass qua Zod validation |
| **COMMON** | Internal server error | Đã xảy ra lỗi hệ thống | Lỗi 500 không xác định |
| **AUTH** | Missing or invalid token | Bạn chưa cung cấp token hoặc token không hợp lệ | Bị middleware chặn do thiếu Token |
| **AUTH** | Invalid or expired token | Phiên đăng nhập không hợp lệ hoặc đã hết hạn | Token sai chữ ký hoặc hết hạn |
| **AUTH** | Not authenticated | Bạn chưa đăng nhập | User chưa được auth ở route bảo vệ |
| **AUTH** | Invalid username or password | Tài khoản hoặc mật khẩu không chính xác | Đăng nhập sai |
| **AUTH** | Account is locked | Tài khoản của bạn đã bị khóa | User bị khóa bởi admin |
| **AUTH** | Token has been revoked | Phiên đăng nhập đã bị thu hồi | Token nằm trong blacklist |
| **AUTH** | User not found or inactive | Tài khoản không tồn tại hoặc đã bị vô hiệu hóa | Lúc refresh token không tìm thấy user |
| **AUTH** | Invalid or missing refresh token | Refresh token không hợp lệ hoặc đã hết hạn | Lúc gọi API refresh token |
| **AUTH** | Logged out successfully | Đăng xuất thành công | Kết quả của API logout |
| **AUTH** | Too many login attempts... | Bạn đã đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút | Bị chặn bởi rate limiter do bruteforce |
| **RBAC** | You do not have permission to perform this action | Bạn không có quyền thực hiện thao tác này | Lỗi phân quyền 403 Forbidden |
| **CV** | CV Profile not found / CV not found | Không tìm thấy hồ sơ CV | Không tìm thấy CV trong DB |
| **CV** | Cannot edit CV while it is pending approval | Không thể chỉnh sửa hồ sơ khi đang trong trạng thái chờ phê duyệt | Nhân viên cố update CV đang chờ duyệt |
| **CV** | You do not have permission to view this CV diff | Bạn không có quyền xem lịch sử thay đổi của hồ sơ này | Nhân viên xem diff của người khác |
| **WORKFLOW** | No drafts to submit | Không có bản nháp nào để gửi | Khi submitDraft nhưng user không có bản nháp nào |
| **WORKFLOW** | Approver not found | Không tìm thấy người phê duyệt | Người duyệt không tồn tại trong hệ thống |
| **WORKFLOW** | Only TechLead can approve level 1 | Chỉ TechLead mới có thể phê duyệt Vòng 1 | Lỗi sai role người duyệt |
| **WORKFLOW** | TechLead can only approve CVs of their project members | TechLead chỉ có thể phê duyệt hồ sơ của thành viên trong dự án | TechLead duyệt cho phòng ban khác |
| **WORKFLOW** | Only HR/Admin can approve level 2 | Chỉ HR hoặc Admin mới có thể phê duyệt Vòng 2 | Lỗi sai role người duyệt vòng 2 |
| **WORKFLOW** | CV is not pending approval | Hồ sơ này không ở trạng thái chờ duyệt | Phê duyệt CV sai trạng thái |
| **WORKFLOW** | Drafts submitted successfully | Gửi hồ sơ thành công | Thành công của API submitDraft |
| **WORKFLOW** | CV approved successfully | Phê duyệt thành công | Thành công của API approve |
| **WORKFLOW** | CV rejected | Từ chối phê duyệt thành công | Thành công của API reject |
| **BATCH_REQUEST** | Batch Request not found | Không tìm thấy yêu cầu đồng bộ | Khi get/cancel batch request |
| **BATCH_REQUEST** | Batch request cancelled successfully | Hủy yêu cầu đồng bộ thành công | Khi cancel batch |
| **USER** | User not found | Không tìm thấy người dùng | GET / PUT user sai ID |
| **USER** | Username or email already exists | Tên đăng nhập hoặc email đã tồn tại | Lỗi Duplicate Email/Username |
| **USER** | User locked successfully | Khóa tài khoản thành công | Lỗi khi API Lock chạy |
| **USER** | User unlocked successfully | Mở khóa tài khoản thành công | Lỗi khi API Unlock chạy |
| **USER** | Password reset successfully | Đặt lại mật khẩu thành công | Lỗi khi API Reset PW chạy |
| **USER** | Role changed successfully | Thay đổi quyền hạn thành công | Lỗi khi API change role chạy |

## 2. Thông Báo Của Zod (Validation Zod)

Hệ thống Zod cũng đã được cấu hình với `customZodErrorMap` trả về tiếng Việt:
- `invalid_type` -> Dữ liệu không đúng định dạng / Trường này là bắt buộc
- `invalid_string` (email) -> Email không đúng định dạng
- `invalid_string` (uuid) -> Định dạng UUID không hợp lệ
- `too_small` -> Chuỗi phải chứa ít nhất {n} ký tự
- `too_big` -> Chuỗi chứa tối đa {n} ký tự
- `invalid_enum_value` -> Giá trị không hợp lệ. Vui lòng chọn một trong các giá trị sau: {options}
- `unrecognized_keys` -> Phát hiện các trường không hợp lệ: {keys}

## 3. Các File Đã Thay Đổi
- `src/constants/messages.ts` (Tạo mới)
- `src/config/zod.ts` (Tạo mới)
- `src/app.ts`
- `src/middleware/auth.middleware.ts`
- `src/middleware/error.middleware.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.route.ts`
- `src/modules/cv/cv.service.ts`
- `src/modules/workflow/workflow.service.ts`
- `src/modules/workflow/workflow.dto.ts`
- `src/modules/batch-request/batch-request.service.ts`
- `src/modules/user/user.service.ts`
- `src/modules/user/user.controller.ts`
- `src/modules/auth/__tests__/auth.service.test.ts`
- `src/modules/workflow/__tests__/workflow.service.test.ts`
