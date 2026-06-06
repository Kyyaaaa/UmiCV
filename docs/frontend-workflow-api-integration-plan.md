# Kế hoạch Tích hợp Frontend cho Workflow & Approval APIs

Tài liệu này là bản kế hoạch chi tiết dành cho Frontend Agent để thực hiện việc nối cáp (integrate) các tính năng phê duyệt CV với Backend API mới nhất.

## 1. Cập nhật Types & API Client

### [MODIFY] `code/frontend/src/types/index.ts` hoặc `cv.ts`
- Bổ sung trường tùy chọn `slaStatus` vào `CVProfile`:
  ```typescript
  export interface CVProfile {
    // ... các trường cũ
    slaStatus?: 'Safe' | 'Warning' | 'Overdue';
  }
  ```
- Định nghĩa type `ApprovalLog`:
  ```typescript
  export interface ApprovalLog {
    id: string;
    approverId: string;
    approverName: string;
    action: 'Approve' | 'Reject';
    level: number;
    reason: string | null;
    createdAt: string;
  }
  ```

### [MODIFY] `code/frontend/src/services/workflow.service.ts` (hoặc `cv.service.ts`)
- Thêm hàm `getApprovalLogs(cvId: string)`: `GET /api/cvs/${cvId}/approval-logs`.
- Thêm hàm `approveCV(cvId: string, level: number)`: `POST /api/cvs/${cvId}/approve`.
- Thêm hàm `rejectCV(cvId: string, reason: string, sectionId?: string)`: `POST /api/cvs/${cvId}/reject`.

---

## 2. Nâng cấp Danh sách Yêu cầu Phê duyệt

### [MODIFY] `code/frontend/src/pages/workflow/ApprovalRequestListPage.tsx`
- **Gỡ bỏ Mock Data**: Xóa import `mockCVs` và thay bằng việc gọi API `searchCVs` với param `status: 'PendingApproval'`.
- **Hiển thị cảnh báo SLA**:
  - Dựa vào trường `slaStatus` từ API trả về để hiển thị Tag cảnh báo trong giao diện danh sách.
  - Ví dụ: Thêm cột "Hạn xử lý" (SLA), hiển thị Badge Đỏ nếu `'Overdue'` (quá 48h), Vàng nếu `'Warning'` (quá 24h).
- **Bộ lọc SLA**: Liên kết logic Lọc (Filter) bằng dropdown SLA với mảng dữ liệu lấy từ API thay vì mock.

---

## 3. Nâng cấp Trang Chi tiết Phê duyệt

### [MODIFY] `code/frontend/src/pages/workflow/ApprovalDetailPage.tsx`
- **Gỡ bỏ Mock Data**: Thay thế `mockCVs` và `mockApprovalLogs` bằng việc sử dụng `useEffect` để fetch dữ liệu từ 2 API: `getCVById` và `getApprovalLogs`.
- **Luồng Approval Timeline**: Truyền mảng logs lấy từ API vào Component `<ApprovalTimeline logs={logs} />`. Component này hiện đã được code nhưng cần khớp cấu trúc biến (đặc biệt là tên approverName thay vì ID thô).
- **Luồng Phê duyệt (Approve)**:
  - Cập nhật hàm `handleApprove` để gọi API `approveCV`.
  - Cần lấy `level` từ User Context (nếu User Role là `HR` hoặc `Admin` -> `level: 2`; nếu `TechLead` -> `level: 1`). Sau khi gọi API thành công, điều hướng về danh sách.
- **Luồng Từ chối (Reject)**:
  - Hiện tại Modal từ chối chưa có ô Input để nhập lý do.
  - Cần bổ sung thêm một Textarea cho State `rejectReason` bên trong Modal.
  - Cập nhật `handleReject` gọi API `rejectCV(id, rejectReason)`. Nếu API báo lỗi `400` do thiếu `reason`, cần báo lỗi validation trên UI.
