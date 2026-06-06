# Báo cáo Lỗi & Cải tiến: Module Workflow & Approval (RBAC & Logic)

Tài liệu này tổng hợp các lỗi do người dùng phát hiện trong quá trình tự test tính năng Workflow sau Phase 2. Cần sự phối hợp của cả Frontend Agent và Backend Agent để khắc phục trước khi đóng module.

## Lỗi 1: Lỗ hổng truy cập màn hình Workflow (Frontend / Role Guard)
* **Mô tả:** Tài khoản Employee truy cập URL `/workflow` vẫn hiển thị giao diện danh sách (kèm thông báo rỗng "Bạn đã xử lý hết các yêu cầu...") thay vì bị chặn quyền truy cập.
* **Nguyên nhân cốt lõi:**
  1. Frontend chưa cấu hình RBAC Guard ở cấp độ React Router (chặn `role === 'Employee'` vào nhánh route `/workflow`).
  2. Ở trang `ApprovalRequestListPage`, khi gọi `workflowService.searchCVs`, Backend có thể đã trả về `403 Forbidden` (do `authorize(['TechLead', 'HR', 'Admin'])` trong `cv.route.ts`), nhưng hàm `fetchCVs` ở Frontend lại catch lỗi âm thầm (`console.error`) và kết thúc bằng một danh sách rỗng, gây hiểu lầm trên UI.
* **Hành động đề xuất (Frontend Agent):** 
  - Thêm Role Guard vào Router chặn truy cập `/workflow` đối với Employee (redirect về `/` hoặc trang báo lỗi 403).
  - Bắt lỗi API 403 để hiển thị Toast lỗi "Bạn không có quyền truy cập" thay vì hiển thị Empty state.

## Lỗi 2: TechLead không nhìn thấy CV chờ duyệt (Backend / Data Scope)
* **Mô tả:** Mặc dù Employee đã nhấn Submit (và tạo ra CV có status `PendingApproval`), nhưng tài khoản TechLead vào xem danh sách phê duyệt lại trống trơn.
* **Nguyên nhân tiềm năng:**
  1. Có thể quá trình Submit của Employee ở Backend bị lỗi ngầm, trạng thái chưa thực sự chuyển sang `PendingApproval`.
  2. API `search` (`GET /api/cvs/search` trong `cv.service.ts`) chưa filter theo ngữ cảnh người gọi. Nếu người gọi là TechLead, họ chỉ nên nhìn thấy CV của những Employee thuộc team mình (dựa vào `ProjectMember`). Tuy nhiên, Backend hiện tại có thể trả về sai scope hoặc Frontend đang không lấy được data chuẩn.
* **Hành động đề xuất (Backend Agent):** 
  - Kiểm tra lại logic hàm `submitDraft` (chắc chắn CV được đổi sang `PendingApproval`).
  - Cập nhật hàm `searchCVs` trong `cv.service.ts`. Phải xử lý logic: TechLead chỉ được lấy danh sách CV của nhân viên dưới quyền; HR/Admin được lấy toàn bộ danh sách `PendingApproval`.

## Lỗi 3: Chưa có cơ chế phân tầng duyệt 2 Mức (TechLead -> HR)
* **Mô tả:** Quy trình kinh doanh yêu cầu 2 mức duyệt: TechLead (Cấp 1) duyệt xong mới tới HR (Cấp 2). Tuy nhiên, hiện tại Frontend đang bị hardcode `level: 1` khi gọi `approveCV`, và Backend cũng chưa có cơ chế state-machine để quản lý luồng này.
* **Phân tích cơ chế (Đề xuất):**
  - **Trạng thái:** Thêm trường `approvalLevel` (default 1) vào `CVProfile` hoặc theo dõi bằng số lượng `ApprovalLog`.
  - **Luồng TechLead (Level 1):** Bấm Approve -> Ghi log duyệt cấp 1 -> CV vẫn ở trạng thái `PendingApproval` (chờ level 2).
  - **Luồng HR (Level 2):** Bấm Approve -> Ghi log duyệt cấp 2 -> CV đổi trạng thái thành `Updated` (Bản chính thức mới).
  - **Từ chối (Bất cứ cấp nào):** Bấm Reject -> CV quay về trạng thái `Draft` để Employee làm lại.
* **Hành động đề xuất (Backend & Frontend Agents):**
  - **Backend:** Xây dựng logic State Machine này trong `workflow.service.ts`. Đảm bảo API `approve` chặn TechLead duyệt nếu CV đã ở Level 2, và chặn HR duyệt nếu CV chưa qua TechLead.
  - **Frontend:** Xóa hardcode `level: 1` ở `ApprovalDetailPage.tsx`. Tự động truyền tham số `level` lên dựa vào `role` của người dùng đang đăng nhập (ví dụ: `user.role === 'TechLead' ? 1 : 2`), hoặc dựa trên trạng thái trả về của CV.

---
**Yêu cầu Agent kế tiếp:** Đọc tài liệu này và lập Implementation Plan (`docs/implementation-plan.md`) để triển khai các bản vá.
