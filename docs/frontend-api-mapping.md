# Mapping API (Workflow & Approval Module)

Tài liệu này liệt kê các API được mapping trực tiếp tới từng Action trên giao diện Workflow.

| Screen / Component | User Action | HTTP Method | API Endpoint | Payload (Request) |
| :--- | :--- | :--- | :--- | :--- |
| **Publish Review Page** | Gửi yêu cầu phê duyệt CV | `POST` | `/api/cvs/draft/submit` | `{ "languageCode": "vi" }` |
| **Approval Request List** | Load danh sách yêu cầu chờ duyệt | `GET` | `/api/cvs/search` | `Query: ?status=PendingApproval&page=1` |
| **Approval Detail** | Load chi tiết CV hiện tại | `GET` | `/api/cvs/{id}` | N/A |
| **Approval Detail** | Load lịch sử duyệt (Timeline) | `GET` | `/api/cvs/{id}/approval-logs` | N/A (Thiếu trong Backend Contract) |
| **Approval Detail** | Tải dữ liệu View Diff | `GET` | `/api/cvs/{id}/diff` | N/A |
| **Approve Modal** | Bấm nút "Đồng ý Phê duyệt" | `POST` | `/api/cvs/{id}/approve` | `{ "level": 1 }` (Phụ thuộc Role người duyệt) |
| **Reject Modal** | Nhập lý do và "Xác nhận Từ chối" | `POST` | `/api/cvs/{id}/reject` | `{ "reason": "Sai format...", "sectionId": null }` |

> *Ghi chú:* Các API POST cần cập nhật UI (Optimistic UI Update hoặc Invalidations Cache) ngay sau khi nhận phản hồi HTTP 200.
