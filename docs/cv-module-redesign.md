# Thiết kế lại CV Management Module (UI/UX Redesign)

Tài liệu này ghi chú các thay đổi về mặt kiến trúc UI/UX của phân hệ CV Management, chuyển đổi từ mô hình CRUD cơ bản sang mô hình **Workspace** chuyên nghiệp (lấy cảm hứng từ TopCV, CakeResume).

## Information Architecture (Kiến trúc Thông tin)
1. **`/cv`**: `CVDashboard` - Bảng điều khiển quản lý toàn bộ CV. Sử dụng Card-based Layout thay cho Table truyền thống. Cung cấp thông tin trực quan về trạng thái, phiên bản và ngôn ngữ.
2. **`/cv/:id/workspace`**: `CVWorkspace` - Trái tim của module. Đây là không gian làm việc bao gồm 3 cột:
   - **Sidebar**: Chứa danh sách các Section (Thông tin cá nhân, Kỹ năng, Kinh nghiệm, v.v.).
   - **Editor Panel**: Form nhập liệu trực tiếp (Inline editing) dựa trên Section được chọn.
   - **Preview Panel**: Live Preview render CV theo thời gian thực dưới định dạng A4.
3. **`/cv/:id/history`**: `VersionHistoryPage` - Xem lại lịch sử các phiên bản của một CV theo dạng Timeline.
4. **`/cv/:id/diff`**: `DiffViewerPage` - Xem so sánh dạng Split-view (Trái: Phiên bản cũ, Phải: Phiên bản mới hoặc Bản nháp) với các highlight thay đổi.
5. **`/cv/:id/publish`**: `PublishReviewPage` - Màn hình tóm tắt các thay đổi từ bản nháp trước khi chính thức đưa lên hệ thống (Publish).

## User Flow (Luồng người dùng)
- **Quản lý**: User vào `CVDashboard` để xem tổng quan danh sách CV đang có.
- **Chỉnh sửa**: Thay vì chuyển trang liên tục, User ấn "Mở Workspace". Mọi thao tác chỉnh sửa nội dung, đổi ngôn ngữ, lưu nháp (Save Draft) đều diễn ra trong 1 màn hình duy nhất mà không bị reload lại form.
- **Theo dõi**: Draft Space trên header sẽ báo cáo số lượng thông tin "chưa được lưu". Người dùng có thể quyết định Lưu Nháp hoặc đưa thẳng tới màn Publish.
- **Xuất bản**: Màn hình Publish Review tổng hợp lại nội dung (e.g. "Bạn đã thêm Kỹ năng ReactJS") để người dùng ấn định trước khi phát hành phiên bản mới.

## Design Decisions (Quyết định Thiết kế)
- **Tập trung vào CV Editing Experience**: Việc giảm số lượng màn hình nhỏ lẻ và popup (modal) giúp người dùng không bị "lạc" khi sửa CV.
- **Live Preview là bắt buộc**: Người dùng cần thấy ngay nội dung họ sửa sẽ hiển thị ra sao trên bản PDF/A4 cuối cùng.
- **Split Layout (3 cột)**: Khắc phục nhược điểm của màn hình dọc truyền thống, tận dụng tối đa không gian màn hình Desktop.
- **Ngôn ngữ thiết kế (Design System)**: Professional, Clean. Màu Xanh/Trắng/Xám nhạt làm chủ đạo, không lạm dụng màu sắc nổi bật để giữ chất Enterprise.

## Mapping với API hiện tại
- Backend Model `CVProfile` không thay đổi.
- `CVSections` vẫn giữ nguyên cấu trúc JSON (`personalInfo`, `skills`, `experience`, `education`, `projects`). Form sẽ ánh xạ trực tiếp các trường này.
- Mọi logic Save Draft sẽ kích hoạt API `PUT /api/cvs/draft` (hiện tại được mock bằng state).
- Mọi logic Publish sẽ kích hoạt API duyệt tương ứng.
