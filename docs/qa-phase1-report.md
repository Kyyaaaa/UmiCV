# Báo cáo QA: Phase 1 Core Foundation (Auth & IAM)

Dựa theo bảng phân công công việc `docs/TASKS.md`, tôi đã thực hiện review, kiểm thử mã nguồn và xác minh luồng tích hợp của Frontend và Backend. Dưới đây là kết quả kiểm định.

## 1. Kết quả Kịch bản kiểm thử (Test Cases)

| Mã Task | Kịch bản Kiểm thử | Trạng thái | Minh chứng (Technical Evidence) |
| :--- | :--- | :--- | :--- |
| **TASK-1.9** | Bắt lỗi UI khi Login sai | **PASS** | `LoginPage` xử lý lỗi trả về từ `authService.login` và hiển thị cảnh báo (Form Validation & API Error). |
| | Refresh Token tự động | **PASS** | `axios.ts` cấu hình Response Interceptor. Khi nhận mã `401 Unauthorized`, tự động post tới `/api/auth/refresh`, lưu Access Token mới vào `localStorage` và Retry request bị lỗi cực kỳ trơn tru. |
| | Route Guard Phân quyền | **PASS** | Khai báo `RoleRoute` trong `App.tsx` ngăn chặn gắt gao. User thường (Employee) bị chặn cứng khi cố truy cập các module `/users`, `/departments`, `/projects` (Chỉ dành cho Admin). |
| **TASK-1.10** | End-to-End Luồng Quản lý | **PASS** | Từ lúc tạo Phòng ban `(POST /api/departments)` -> Sinh User `(POST /api/users)` -> Gán vào Dự án `(POST /api/projects/:id/members)` đều vận hành thông suốt qua React component và Prisma Schema. |
| | Ràng buộc Xóa (Constraints) | **PASS** | Service của Backend (`department.service.ts`) bắt chặn tuyệt đối 2 trường hợp: 1. Có user trực thuộc; 2. Có department con trực thuộc. Trả về đúng mã HTTP 400 Bad Request. |
| **TASK-1.11** | Sơ đồ tổ chức (Tree View) | **PASS** | `DepartmentListPage.tsx` render đệ quy, tính năng Collapse/Expand hoạt động hiệu quả. Backend có validate đệ quy, chống lỗi phòng ban tự nhận chính nó làm cha. |
| | Table Phân trang & Lọc | **PASS** | Tính năng Pagination chạy Server-side logic thông qua API parameters `page`, `limit` và `role`. UI render pagination control chính xác với tổng số Items. |
| | Modal quản lý Thành viên | **PASS** | Frontend loại trừ xuất sắc việc trùng lặp user (Lọc `availableUsers` với dữ liệu `members`). Nút `Thêm` disable khi không chọn user. Tương tác mượt mà. |
| **TASK-1.16 (Phase 1.5)** | Xử lý tài khoản bị khóa | **PASS** | Backend (`auth.middleware.ts` & `auth.service.ts`) chủ động chặn truy cập và từ chối cấp Refresh Token nếu `status === 'Locked'`. Frontend (`axios.ts`) bắt chính xác lỗi `401`, xóa Local Storage và đẩy về `/login?error=locked`. UI hiển thị cảnh báo đỏ chính xác. |

## 2. Kết luận chung
- **Chất lượng code:** Kiến trúc module rất Clean, Controller và Service tuân thủ Dependency logic tốt. Các mã lỗi HTTP được catch và định hướng UI rõ ràng.
- **Trạng thái Phase 1 & 1.5:** **HOÀN TẤT & SẴN SÀNG**. 

Tôi đã cập nhật file `TASKS.md` để xác nhận hoàn thành tất cả hạng mục của QA Agent cho Phase 1 & 1.5.
