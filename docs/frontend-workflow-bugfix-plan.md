# Kế hoạch Sửa lỗi Frontend: Workflow & Approval (Dựa trên Bug Report)

Tài liệu này là hướng dẫn chi tiết dành cho **Frontend Agent** nhằm vá các lỗi giao diện và điều hướng được phát hiện trong báo cáo `workflow-bug-report.md`. Backend đã hoàn tất việc sửa API và Data Scope, phần còn lại thuộc về Frontend.

## Lỗi 1: Lỗ hổng truy cập màn hình Workflow (Role Guard)

**Mô tả:** Nhân viên (`Employee`) có thể truy cập `/workflow` nhưng chỉ thấy danh sách trống thay vì bị chặn.
**Yêu cầu tích hợp:**
1. **Cập nhật Router Guard:** Bổ sung cơ chế bảo vệ Route (Route Guard) trong tệp định nghĩa Router (VD: `App.tsx` hoặc `routes.tsx`). Ngăn chặn user có `role === 'Employee'` truy cập vào các đường dẫn bắt đầu bằng `/workflow`. Nếu cố tình truy cập, hãy điều hướng (redirect) về trang chủ `/` hoặc trang báo lỗi `403`.
2. **Cập nhật Xử lý Lỗi API (ApprovalRequestListPage.tsx):** 
   - Khi gọi `cv.service.searchCVs({ status: 'PendingApproval' })`, nếu Backend trả về mã lỗi `403 Forbidden`, Frontend không được catch lỗi âm thầm và gán `data = []`.
   - Bổ sung Toast/Alert thông báo lỗi: *"Bạn không có quyền truy cập vào danh sách này"*.

---

## Lỗi 3: Xóa Hardcode Level khi duyệt CV (ApprovalDetailPage.tsx)

**Mô tả:** Nút "Phê duyệt" đang gọi cứng (hardcode) `level: 1` cho hàm `approveCV`, làm phá vỡ cơ chế duyệt 2 cấp (TechLead -> HR).
**Yêu cầu tích hợp:**
1. **Lấy Role từ Context/State:** Trong file `code/frontend/src/pages/workflow/ApprovalDetailPage.tsx`, sử dụng Hook (ví dụ `useAuth()`) để trích xuất `role` của người dùng hiện tại đang đăng nhập.
2. **Truyền Level Động:** 
   Tại hàm `handleApprove`, thay thế dòng code:
   ```typescript
   // Code cũ:
   await workflowService.approveCV(id, 1);
   
   // Code mới đề xuất:
   const level = user.role === 'TechLead' ? 1 : 2;
   await workflowService.approveCV(id, level);
   ```
   *(Lưu ý: Logic máy trạng thái (State Machine) đã được Backend chặn đứng an toàn. Frontend chỉ cần truyền đúng Level theo Role là hệ thống sẽ hoạt động trơn tru).*

---

## Lưu ý thêm cho Frontend Agent
- File `ApprovalDetailPage.tsx` đã được thiết kế sẵn một Modal chứa `<textarea>` nhập lý do từ chối. Hãy đảm bảo API `rejectCV` được gọi với đúng chuỗi `rejectReason` từ ô input này.
- Hãy chạy thử bằng cách đăng nhập bằng tài khoản TechLead -> Duyệt CV -> Đăng nhập bằng HR -> Duyệt tiếp CV đó để đảm bảo UI phản hồi chính xác.
