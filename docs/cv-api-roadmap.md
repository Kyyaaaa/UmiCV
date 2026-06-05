# Lộ trình Triển khai API CV Module (Roadmap)

Dựa trên kết quả phân tích tại `docs/cv-api-review.md`, dưới đây là kế hoạch ưu tiên (Prioritization) để nâng cấp Backend API hỗ trợ UI/UX mới của hệ thống CV Workspace.

## Phase A: Bắt buộc (Core Workspace)

**Mục tiêu**: Xây dựng nền tảng để UI mới có thể chạy được (Hiển thị Dashboard, Vào được không gian Workspace, Chỉnh sửa được nội dung).

1. **`GET /api/cvs/me`**
   - Rất quan trọng để vẽ `CVDashboard` liệt kê các ngôn ngữ mà user đang tạo.
2. **`GET /api/cvs/:id`**
   - API lấy thông tin chi tiết (sectionsData) để render vào form Editor bên trái và Preview bên phải.
3. **`PUT /api/cvs/:id/draft`**
   - API lưu nháp. Chức năng Auto-save cực kỳ cần thiết để thay thế form Submit truyền thống.

*(Các API Submit duyệt, Approve, Reject tiếp tục sử dụng API của Workflow Module).*

## Phase B: Nâng cao (Version Control)

**Mục tiêu**: Khai thác sức mạnh của bảng `CVVersionHistory` để cung cấp cho người dùng hệ thống Quản lý Phiên bản chuyên nghiệp.

1. **`GET /api/cvs/:id/versions`**
   - Trả về danh sách để vẽ History Timeline.
2. **`GET /api/cvs/:id/versions/:versionId`**
   - Fetch snapshot cũ để UI có thể hiển thị song song ở tính năng Diff Viewer.
3. **`POST /api/cvs/:id/versions/:versionId/restore`**
   - Cho phép người dùng Rollback lại bản nháp nếu như họ thao tác sai và muốn lấy lại nội dung từ bản đã được duyệt trước đó.

## Phase C: Tương lai (Localization & AI)

**Mục tiêu**: Hỗ trợ khả năng viết CV đa ngôn ngữ một cách nhàn rỗi. 

1. **`POST /api/cvs/:id/localizations/copy`**
   - Kịch bản: Nhân viên có bản Tiếng Việt, họ muốn tạo bản Tiếng Anh. Thay vì gõ lại từng Company Name, University Name, API này sẽ clone cấu trúc JSON từ VI sang EN.
2. **Tích hợp tính năng tự động dịch thuật (Auto-translate)**
   - Mở rộng API copy để dịch vụ Backend gọi qua Third-party (như Google Translate API hoặc OpenAI) để dịch tự động các field Description sang ngôn ngữ đích.
