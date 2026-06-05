# Báo cáo Đánh giá và Thiết kế API (CV Module Redesign)

Tài liệu này đánh giá khả năng hỗ trợ của hệ thống Backend hiện tại đối với giao diện UI/UX mới của CV Management Module (Mô hình Workspace) và đề xuất bộ API Contract hoàn chỉnh để hỗ trợ mô hình mới này.

## 1. Khảo sát API hiện tại (Phase 1 - Audit Existing APIs)

| Method | Route | Purpose | Module | Đánh giá |
|--------|-------|---------|--------|----------|
| GET | `/api/cvs/draft` | Lấy bản nháp của user | CV | **Đáp ứng một phần** (Chỉ truy xuất dựa trên Query Params `languageCode`, không thân thiện cho URL dạng `/cv/:id/workspace`) |
| PUT | `/api/cvs/draft` | Cập nhật nháp (Upsert) | CV | **Đáp ứng một phần** (Không hỗ trợ auto-save cục bộ tốt vì bắt buộc truyền toàn bộ object) |
| GET | `/api/cvs/search` | Tìm kiếm CV | CV | **Không đáp ứng** (Chỉ dùng cho Admin/HR/TechLead tìm kiếm, không phục vụ nhu cầu liệt kê danh sách CV của chính User) |
| GET | `/api/cvs/:id/diff` | So sánh thay đổi | CV | **Đáp ứng hoàn toàn** |
| POST | `/api/cvs/draft/submit` | Gửi duyệt nháp | Workflow | **Đáp ứng hoàn toàn** |
| POST | `/api/cvs/:id/approve` | Phê duyệt | Workflow | **Đáp ứng hoàn toàn** |
| POST | `/api/cvs/:id/reject` | Từ chối | Workflow | **Đáp ứng hoàn toàn** |

## 2. Khảo sát Khả năng Hỗ trợ của Database (Phase 2 - Audit DB)

Dựa trên Prisma schema của các bảng `CVProfile` và `CVVersionHistory`:

- **Draft Space (ĐỦ)**: Bảng `CVProfile` có sẵn field `status = Draft` và `sectionsData` (chứa nội dung JSON). Tính năng lưu nháp không ảnh hưởng đến bản chính thức.
- **Versioning (ĐỦ)**: Bảng `CVVersionHistory` lưu trữ mọi bản snapshot cũ với `versionNumber`.
- **Localization (ĐỦ)**: Cột `languageCode` trên `CVProfile` kết hợp với `userId` tạo thành Unique Constraint. User có thể tạo nhiều CV với nhiều ngôn ngữ độc lập.
- **Diff Viewer (ĐỦ)**: Có thể kết xuất JSON từ `sectionsData` (Draft) và `snapshotData` (History) để so sánh.

**Kết luận**: Database hiện tại được thiết kế cực kỳ linh hoạt và có khả năng đáp ứng 100% nghiệp vụ mới. **KHÔNG** yêu cầu viết thêm migration.

## 3. Phân tích Khoảng trống (Phase 3 - Gap Analysis)

| Feature | UI Requirement | Existing API | Gap |
|---------|----------------|--------------|-----|
| **Dashboard** | Danh sách tất cả CV (các ngôn ngữ) của User | N/A (chỉ có API tìm kiếm dành cho quản lý) | Thiếu API GET `/api/cvs/me` |
| **Workspace** | Tải thông tin Draft CV theo ID | `GET /api/cvs/draft` | Endpoint hiện tại không dùng ID, UI mới bắt buộc có route ID để định tuyến dễ dàng hơn. |
| **Draft Space** | Lưu nháp định kỳ (Auto-save) | `PUT /api/cvs/draft` | Cần đổi thành PUT theo ID. |
| **Version History**| Liệt kê các phiên bản cũ | N/A | Thiếu API GET `/api/cvs/:id/versions` |
| **Version History**| Xem lại phiên bản cũ | N/A | Thiếu API GET `/api/cvs/:id/versions/:vId` |
| **Version History**| Phục hồi dữ liệu từ phiên bản cũ | N/A | Thiếu API POST `/api/cvs/:id/versions/:vId/restore` |
| **Localization** | Đồng bộ cấu trúc/Dịch tự động sang ngôn ngữ khác | N/A | Thiếu API POST `/api/cvs/:id/localizations/copy` |

## 4. Đề xuất API Mới (Phase 4 & 5 - API & DTO Design)

Bộ API này nhằm mục đích xây dựng lại chuẩn mực RESTful xoay quanh thực thể CV (`:id`), thay vì chỉ một endpoint `/draft` chung chung.

### A. Dashboard Management

**1. GET /api/cvs/me**
- *Mục đích*: Lấy danh sách CV của User hiện tại (Dashboard).
- *Response*:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "languageCode": "vi",
      "status": "Draft",
      "versionNumber": 2,
      "updatedAt": "2026-06-05T00:00:00Z"
    }
  ]
}
```

### B. Draft Space (Workspace)

**2. GET /api/cvs/:id**
- *Mục đích*: Lấy chi tiết CV theo ID để nạp vào giao diện Workspace. (Có thể trả về bản Draft, Updated hoặc Outdated tùy status hiện tại).

**3. PUT /api/cvs/:id/draft**
- *Mục đích*: Cập nhật bản nháp, hỗ trợ tính năng auto-save từ frontend.
- *Request*: Nhận partial JSON của `sectionsData`.
```json
{
  "personalInfo": { "fullName": "John Doe", ... },
  "skills": ["React", "NodeJS"]
}
```
- *Response*: `{ "success": true, "message": "Saved" }`

**4. DELETE /api/cvs/:id/draft**
- *Mục đích*: Hủy bản nháp hiện tại, khôi phục lại trạng thái cũ.

### C. Version Control (Lịch sử & Phục hồi)

**5. GET /api/cvs/:id/versions**
- *Mục đích*: Lấy danh sách Timeline của CV.
- *Response*:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "versionNumber": 1, "createdAt": "..." },
    { "id": "uuid", "versionNumber": 2, "createdAt": "..." }
  ]
}
```

**6. GET /api/cvs/:id/versions/:versionId**
- *Mục đích*: Xem chi tiết JSON của một bản snapshot cũ.

**7. POST /api/cvs/:id/versions/:versionId/restore**
- *Mục đích*: Phục hồi `snapshotData` của phiên bản cũ và ghi đè vào `sectionsData` của Draft hiện hành.

### D. Localization (Đồng bộ ngôn ngữ)

**8. POST /api/cvs/:id/localizations/copy**
- *Mục đích*: Copy nội dung từ ngôn ngữ này sang bản nháp của ngôn ngữ khác (VD: Từ VI sang EN).
- *Request*: `{ "targetLanguageCode": "en" }`

## 5. Tác động tới Database (Phase 6 - Database Impact)

Như phân tích ở Phase 2, **KHÔNG CÓ TÁC ĐỘNG MỚI** tới thiết kế của Schema. Mọi API mới hoàn toàn có thể được thực thi bằng các truy vấn `SELECT`, `UPDATE`, `INSERT` lên hai bảng `CVProfile` và `CVVersionHistory` hiện tại. 

## 6. Lời khuyên Kiến trúc (Recommendation)
- **Về API**: Giữ lại các API phục vụ Workflow cũ (Approve, Reject, Search) vì chúng đã phục vụ tốt cho UI của TechLead/HR. Chỉ thay máu toàn bộ API của End-user (Employee).
- **Về Dữ liệu JSON**: Đẩy toàn bộ logic Validate dữ liệu JSON (độ dài text, mandatory fields) sang Zod và Validate Middleware thay vì nhồi nhét ở Service.
