# Kế hoạch Triển khai API cho Module Workflow & Approval (Dành cho Backend Agent)

Dựa trên phân tích Gap Analysis của Frontend, hệ thống cần hoàn thiện các API sau để phục vụ Luồng Phê duyệt CV đa cấp.

## 1. Yêu cầu Phát triển API Mới (Missing APIs)

### 1.1 API Lấy Lịch sử Phê duyệt (Approval Logs)
- **Endpoint:** `GET /api/cvs/{id}/approval-logs`
- **Mục đích:** Frontend cần hiển thị Component Timeline, cho biết ai đã duyệt, duyệt lúc nào, và lý do từ chối (nếu có) trong quá khứ.
- **Quyền (Authorization):** Employee (chỉ xem CV của mình), Tech Lead, HR, Admin.
- **Response Format (Gợi ý):**
  ```json
  [
    {
      "id": "uuid",
      "approverId": "uuid",
      "approverName": "Nguyễn Văn A",
      "action": "Approve | Reject",
      "level": 1,
      "reason": "Thiếu kinh nghiệm React",
      "createdAt": "2026-06-06T10:00:00Z"
    }
  ]
  ```

### 1.2 Bổ sung Metadata cho API Search
- **Endpoint:** `GET /api/cvs/search`
- **Mục đích:** Frontend cần hiển thị thẻ cảnh báo (Warning Badge) nếu CV bị ngâm quá 48h.
- **Yêu cầu sửa đổi:** Trong Response của mỗi `CVProfile`, hãy bổ sung trường `slaStatus: 'Safe' | 'Warning' | 'Overdue'` hoặc trả về `timeRemaining` dựa trên `submittedAt`.

## 2. Triển khai Logic Core (Workflow APIs)
Các API này đã có trong tài liệu `api-contract.md` nhưng cần được lập trình logic thực tế:

### 2.1 API Gửi Yêu cầu Phê duyệt
- **Endpoint:** `POST /api/cvs/draft/submit`
- **Logic:** 
  - Kiểm tra CV có ở trạng thái `Draft` hoặc `Rejected` không.
  - Chuyển `status` thành `PendingApproval`.
  - Ghi nhận `submittedAt` bằng thời gian hiện tại.

### 2.2 API Phê duyệt (2 Cấp)
- **Endpoint:** `POST /api/cvs/{id}/approve`
- **Payload:** `{ "level": 1 | 2 }`
- **Logic Level 1 (Tech Lead):**
  - Ghi Log vào bảng `ApprovalLog` với action `Approve`, level 1.
  - Trạng thái CV vẫn giữ `PendingApproval` (chờ HR duyệt cấp 2).
- **Logic Level 2 (HR):**
  - Ghi Log vào bảng `ApprovalLog`.
  - Tăng `versionNumber` lên 1.
  - Chuyển `status` thành `Updated` (hoặc `Published`).
  - Đẩy dữ liệu `sectionsData` (bản nháp) đè lên bản chính.
  - Tạo Snapshot lưu vào bảng `CVVersionHistory`.

### 2.3 API Từ chối (Reject)
- **Endpoint:** `POST /api/cvs/{id}/reject`
- **Payload:** `{ "reason": "Lý do bắt buộc", "sectionId": "..." }`
- **Logic:**
  - Ghi Log vào `ApprovalLog` với action `Reject` kèm `reason`.
  - Chuyển trạng thái CV về `Draft` (hoặc `Rejected`).
  - Xóa `submittedAt`.

## 3. Các bước hành động cho Backend Agent
1. **Kiểm tra Schema:** Xác minh bảng `ApprovalLog` và `CVVersionHistory` trong `prisma/schema.prisma`.
2. **Code Controllers & Services:** Viết logic tương ứng trong thư mục backend.
3. **Viết Test:** Bổ sung unit test cho logic 2 cấp duyệt.
4. **Cập nhật Swagger/Postman:** Đảm bảo tài liệu API được đồng bộ.
