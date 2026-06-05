# Tài liệu API (Backend API)

Tất cả các API yêu cầu xác thực phải gửi kèm Header `Authorization: Bearer <token>`, ngoại trừ `/api/auth/login` và `/api/auth/refresh`.
(Refresh token được lấy tự động từ HttpOnly Cookie).

## 1. Auth Module
### POST `/api/auth/login`
- **Body:** `{ "username": "admin", "password": "password" }`
- **Response:** `{ "success": true, "data": { "user": { ... }, "accessToken": "..." } }`

### POST `/api/auth/refresh`
- **Cookie:** `refreshToken=...`
- **Response:** `{ "success": true, "data": { "accessToken": "..." } }`

## 2. CV Management Module
### GET `/api/cvs/draft`
- **Quyền:** Employee
- **Query:** `?languageCode=vi`
- **Response:** `{ "success": true, "data": { "id": "...", "status": "Draft", "sectionsData": {} } }`

### PUT `/api/cvs/draft`
- **Quyền:** Employee
- **Body:** `{ "languageCode": "vi", "sectionsData": { ... } }`
- **Response:** `{ "success": true, "data": { ... } }`

## 3. Workflow & Approval Module
### POST `/api/cvs/draft/submit`
- **Quyền:** Employee
- **Mô tả:** Gửi duyệt các bản Draft hoặc Outdated hiện tại của User.

### POST `/api/cvs/:id/approve`
- **Quyền:** TechLead, HR
- **Body:** `{ "level": 1 }` (1: TechLead, 2: HR)

### POST `/api/cvs/:id/reject`
- **Quyền:** TechLead, HR
- **Body:** `{ "reason": "Thiếu kinh nghiệm", "sectionId": "experience" }`

## 4. Search Module
### GET `/api/cvs/search`
- **Quyền:** TechLead, HR, Admin
- **Query:** `?keyword=...&departmentId=...&status=PendingApproval&page=1&limit=10`
- **Response:** `{ "success": true, "total": 10, "page": 1, "data": [...] }`

### GET `/api/cvs/:id/diff`
- **Mô tả:** Lấy ra `draft` (sectionsData hiện tại) và `original` (snapshotData phiên bản duyệt gần nhất).
- **Response:** `{ "success": true, "data": { "draft": {...}, "original": {...} } }`

## 5. Batch Request Module
### POST `/api/batch-requests`
- **Quyền:** HR
- **Body:**
```json
{
  "title": "Cập nhật CV tháng 6",
  "deadline": "2026-06-30T00:00:00.000Z",
  "targetUserIds": ["uuid-1", "uuid-2"]
}
```

### POST `/api/batch-requests/:id/cancel`
- **Quyền:** HR
- **Mô tả:** Hủy chiến dịch cập nhật CV.

## 6. User Management Module
### GET `/api/users`
- **Quyền:** Admin
- **Query:** `?page=1&limit=10&keyword=...&role=Employee&status=Active`
- **Response:** `{ "success": true, "total": 10, "page": 1, "data": [...] }`

### POST `/api/users`
- **Quyền:** Admin
- **Body:** `{ "username": "...", "email": "...", "fullName": "...", "password": "...", "role": "Employee", "departmentId": "..." }`

### GET `/api/users/:id`
- **Quyền:** Admin

### PUT `/api/users/:id`
- **Quyền:** Admin
- **Body:** `{ "fullName": "...", "role": "TechLead", "departmentId": "...", "status": "Active" }`

### PATCH `/api/users/:id/lock`
- **Quyền:** Admin
- **Mô tả:** Khóa tài khoản, không cho login/refresh token.

### PATCH `/api/users/:id/unlock`
- **Quyền:** Admin

### POST `/api/users/:id/reset-password`
- **Quyền:** Admin
- **Body:** `{ "newPassword": "..." }`

### PATCH `/api/users/:id/role`
- **Quyền:** Admin
- **Body:** `{ "role": "HR" }`
