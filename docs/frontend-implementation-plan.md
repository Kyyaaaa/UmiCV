# Kế hoạch Triển khai & Kiến trúc Frontend - Workflow Module

## 1. Gap Analysis (So sánh UI cần vs Backend đang có)

### API Available (Đã có sẵn)
- `POST /api/cvs/draft/submit`
- `GET /api/cvs/search` (Hỗ trợ query `status`)
- `POST /api/cvs/{id}/approve`
- `POST /api/cvs/{id}/reject`
- `GET /api/cvs/{id}/diff`

### API Missing (Đang thiếu cần báo Backend)
1. **API Lấy Lịch sử Duyệt (Approval Logs):**
   - *Vấn đề:* Hiện tại giao diện `Approval Detail` cần render Component `Timeline` để xem luồng duyệt (Tech Lead đã duyệt ngày nào, từng bị Reject với lý do gì trước đó). Tuy nhiên `api-contract.md` chưa định nghĩa endpoint để lấy thông tin này.
   - *Đề xuất Backend:* Cung cấp API `GET /api/cvs/{id}/approval-logs`.
2. **Thiếu Metadata trong API Search:**
   - *Vấn đề:* Trang danh sách yêu cầu hiển thị Badge Cảnh báo SLA (Sắp hết hạn/Quá hạn).
   - *Đề xuất Backend:* Trả thêm trường `slaStatus` hoặc `timeRemaining` trong mỗi item của API `/search`.

## 2. Frontend Architecture (Kiến trúc đề xuất)

### 2.1 Cấu trúc thư mục (Folder Structure)
Duy trì kiến trúc hiện tại, gom nhóm theo Domain (Workflow):
```
src/
  ├── pages/
  │   └── workflow/
  │       ├── ApprovalRequestListPage.tsx  (Container)
  │       └── ApprovalDetailPage.tsx       (Container)
  ├── components/
  │   └── workflow/
  │       ├── ApprovalTimeline.tsx         (Presentational)
  │       ├── RejectReasonModal.tsx        (Presentational + Form)
  │       ├── DiffViewerEmbed.tsx          (Tái sử dụng Component từ Diff module)
  ├── services/
  │   └── workflowService.ts               (Axios Fetchers)
  └── hooks/
      └── useApproval.ts                   (Custom Hook quản lý trạng thái API)
```

### 2.2 Các Layer Kiến trúc
- **Pages (Container Component):** Gọi `useApproval` hook để lấy dữ liệu (Logs, CV Detail) và truyền xuống các component con.
- **Components (Presentational):** Đảm nhiệm việc hiển thị UI thuần túy. `<RejectReasonModal>` sử dụng `<Modal>` dùng chung của hệ thống, xử lý form control text. `<DiffViewerEmbed>` sử dụng chung lõi logic so sánh với `DiffViewerPage`.
- **Services & Hooks:** Sử dụng Axios interceptor đã cấu hình sẵn trong `api.ts`. Đóng gói logic gọi API Approve/Reject vào Hook (ví dụ `const { approveCV, isLoading } = useApproval()`) để quản lý Loading State tự động trên UI.

## 3. Kế hoạch triển khai (Implementation Plan)

### Phase 1: Hoàn thiện Component & UI Tĩnh
- **Mục tiêu:** Xây dựng xong UI chuẩn xác theo thiết kế cho màn hình Danh sách và Chi tiết.
- **Màn hình:** `/workflow` và `/workflow/:id`.
- **Hành động:** 
  - Tạo Component `<FilterPanel>` và `<SearchBox>` trên trang danh sách.
  - Tách Component `<ApprovalTimeline>`.
  - Refactor lại Layout trang Chi tiết (Thay vì render mock thô, cho phép lồng `<CVPreviewPanel>` vào cột trái).
- **Deliverables:** Các Component tĩnh hoạt động hoàn hảo với Mock Data (chưa gọi mạng).

### Phase 2: Tích hợp API Luồng Phê Duyệt & State Management
- **Mục tiêu:** Nối API Approve/Reject và Xử lý Form.
- **API:** 
  - `POST /api/cvs/{id}/approve`
  - `POST /api/cvs/{id}/reject`
- **Hành động:** 
  - Code `workflowService.ts`.
  - Code Hook `useApproval`.
  - Tích hợp Toast Notification hiển thị thành công/thất bại. Cập nhật lại UI sau khi bấm Duyệt.
- **Deliverables:** Nút Duyệt/Từ chối hoạt động thật, gọi thành công network và văng Toast.

### Phase 3: Tích hợp Tính năng So sánh (Diff Viewer)
- **Mục tiêu:** Giúp người duyệt dễ dàng nhận diện ứng viên đã sửa chữ gì so với bản cũ.
- **API:** `GET /api/cvs/{id}/diff`
- **Hành động:** 
  - Tích hợp `<DiffViewerEmbed>` lồng vào trong trang Chi tiết. 
  - Thêm Toggle Button trên Toolbar: "Xem bản mới" / "Xem thay đổi".
- **Deliverables:** Tech Lead có thể nhấn nút để xem Hightlight Xanh (Thêm) / Đỏ (Xóa) ngay trong màn hình duyệt.

### Khuyến nghị (Giai đoạn tiếp theo)
- Phối hợp với Backend Agent để bổ sung API `approval-logs` trước khi bước vào Phase 2. Mọi code trong Phase 1 sẽ dùng mảng `mockApprovalLogs` để giữ nhịp phát triển.
