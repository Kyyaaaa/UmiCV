# Giao diện Lập trình (API Contract)

API tuân thủ tiêu chuẩn RESTful. Giao tiếp qua HTTP/HTTPS. Request/Response body sử dụng định dạng JSON.

## 1. Auth APIs
- `POST /api/auth/login`
  - **Mục đích:** Xác thực Local Auth.
  - **Request:** `{ "username": "...", "password": "..." }`
  - **Response:** `{ "accessToken": "...", "user": { "id", "role", ... } }` (Refresh Token trả qua Set-Cookie HttpOnly).
- `POST /api/auth/refresh`
  - **Mục đích:** Cấp mới Access Token.
  - **Request:** (Đính kèm Cookie)
  - **Response:** `{ "accessToken": "..." }`

## 2. CV Management APIs
- `GET /api/cvs/draft`
  - **Mục đích:** Lấy bản nháp CV của user đăng nhập.
  - **Quyền:** Employee
  - **Response:** `{ "id", "userId", "languageCode", "status", "sections": [{...}] }`
- `PUT /api/cvs/draft`
  - **Mục đích:** Cập nhật bản nháp (Upsert).
  - **Quyền:** Employee
  - **Request:** `{ "sections": [ ... ], "languageCode": "vi" }`
  - **Response:** `{ "success": true }`
- `GET /api/cvs/search`
  - **Mục đích:** Tìm kiếm CV nâng cao.
  - **Quyền:** Tech Lead, HR, Admin
  - **Query:** `?keyword=...&departmentId=...&status=...&skills=...`
  - **Response:** `{ "data": [{...}], "total", "page" }`
- `GET /api/cvs/{id}/diff`
  - **Mục đích:** So sánh chi tiết bản nháp với bản chính thức.
  - **Quyền:** Tech Lead, HR, Admin (Employee xem của chính mình).
  - **Response:** `{ "original": {...}, "draft": {...}, "diff": {...} }`

## 3. Workflow & Approval APIs
- `POST /api/cvs/draft/submit`
  - **Mục đích:** Gửi duyệt bản nháp (Nháp -> Chờ duyệt).
  - **Quyền:** Employee
- `POST /api/cvs/{id}/approve`
  - **Mục đích:** Phê duyệt CV.
  - **Quyền:** Tech Lead (Cấp 1), HR (Cấp 2).
  - **Request:** `{ "level": 1 | 2 }`
- `POST /api/cvs/{id}/reject`
  - **Mục đích:** Từ chối CV.
  - **Quyền:** Tech Lead, HR
  - **Request:** `{ "reason": "Chi tiết lỗi...", "sectionId": "..." }`

## 4. Batch Request APIs
- `POST /api/batch-requests`
  - **Mục đích:** Tạo yêu cầu cập nhật CV hàng loạt.
  - **Quyền:** HR
  - **Request:** `{ "title": "...", "description": "...", "deadline": "YYYY-MM-DD", "targetUserIds": [...] }`
- `POST /api/batch-requests/{id}/cancel`
  - **Mục đích:** Hủy Batch Request.
  - **Quyền:** HR
