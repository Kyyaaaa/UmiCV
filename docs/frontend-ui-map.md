# Sơ đồ Giao diện Người dùng (Frontend UI Map)

Tài liệu này mô tả danh sách các màn hình, luồng điều hướng, và các component có thể tái sử dụng đã được xây dựng trong ứng dụng Frontend (UmiCV).

## 1. Screens (Danh sách Màn hình)

Toàn bộ màn hình được lưu trong thư mục `code/frontend/src/pages/`.

### Authentication (`/auth`)
- **Login (`/login`)**: Màn hình đăng nhập chính. Có chức năng ghi nhớ đăng nhập.

### Dashboard (`/`)
- **Dashboard Overview (`/`)**: Bảng điều khiển tóm tắt thống kê CV, CV chờ duyệt, và thông báo mới nhất.

### CV Management (`/cv`)
- **CV Dashboard (`/cv`)**: Bảng điều khiển quản lý toàn bộ CV dạng Card (thay thế dạng List cũ).
- **CV Workspace (`/cv/:id/workspace`)**: Không gian chỉnh sửa CV 3 cột (Sidebar, Editor, Live Preview). Hỗ trợ Draft Space và Inline Editing.
- **Version History (`/cv/:id/history`)**: Lịch sử các phiên bản của CV.
- **Diff Viewer (`/cv/:id/diff`)**: So sánh thay đổi giữa 2 phiên bản.
- **Publish Review (`/cv/:id/publish`)**: Màn hình xác nhận các thay đổi trước khi Publish.

### Workflow & Approval (`/workflow`)
- **Approval Request List (`/workflow`)**: Danh sách các CV đang ở trạng thái `PendingApproval`.
- **Approval Detail (`/workflow/:id`)**: Xem chi tiết CV chờ duyệt kèm Lịch sử duyệt (Timeline) bên cột phải. Nút Approve/Reject.

### User Management (`/users`)
- **User List (`/users`)**: Quản lý danh sách nhân sự, tìm kiếm, bộ lọc vai trò. Nút Thêm mới/Khóa tài khoản.
- **User Form Modal**: Modal popup hỗ trợ Thêm mới và Chỉnh sửa thông tin nhân sự.

### Notifications & Profile (`/notifications`, `/profile`)
- **Notification Center (`/notifications`)**: Xem tất cả thông báo hệ thống, đánh dấu đã đọc.
- **User Profile (`/profile`)**: Xem thông tin tài khoản hiện tại và tính năng đổi mật khẩu.

## 2. Navigation Flow (Luồng điều hướng)

Ứng dụng sử dụng 2 Layout chính:

- **PublicLayout**: Được sử dụng cho các màn hình Auth. Tập trung vào Form giữa trang. Không có menu.
- **PrivateLayout**: Có Sidebar (Menu bên trái) và Header (Tên user, chuông thông báo bên trên).
  - Từ Sidebar, người dùng điều hướng nhanh đến Dashboard, Quản lý CV, Phê duyệt, Nhân sự.
  - Từ Header, người dùng có thể xem Notification, vào Profile hoặc Đăng xuất.
  - Các hành động trong Page (như "Thêm mới CV", "Sửa CV") sẽ điều hướng qua lại bằng `react-router-dom`.

## 3. Components (Danh sách Component dùng chung)

Các component được tạo theo kiến trúc tái sử dụng cao (`src/components/`):

### UI Components (`src/components/ui/`)
- `Button.tsx`: Nút bấm với nhiều biến thể (primary, secondary, outline, ghost, danger) và hỗ trợ trạng thái `isLoading`.
- `Input.tsx` / `Select.tsx`: Input và Select field chuẩn hóa kèm nhãn (label) và thông báo lỗi.
- `Card.tsx`: Container cho thẻ dữ liệu (Header, Title, Content, Footer).
- `Badge.tsx`: Nhãn hiển thị (màu sắc tùy chỉnh).

### Common Components (`src/components/common/`)
- `DataTable.tsx`: Bảng dữ liệu hỗ trợ render custom column.
- `StatusBadge.tsx`: Badge chuyên biệt hiển thị trạng thái CV, Vai trò User.
- `PageHeader.tsx`: Khối Tiêu đề + Description + Action buttons ở đầu mỗi trang.
- `Modal.tsx` & `ConfirmModal.tsx`: Hộp thoại Popup đa năng.
- `EmptyState.tsx` & `LoadingState.tsx`: Xử lý giao diện chờ/rỗng.
- `SearchBox.tsx` & `FilterPanel.tsx`: Công cụ tìm kiếm và lọc.

## 4. Future API Integration Points (Điểm tích hợp API tương lai)

Hệ thống hiện đang sử dụng Mock Data. Khi tích hợp API thật, cần cập nhật ở các vị trí sau:

1. **Auth**: Trong `LoginPage`, `UserProfilePage` cần gọi `POST /api/auth/login` thay vì `setTimeout()`.
2. **Data Fetching**: Thay thế việc import `mockCVs`, `mockUsers` thành các custom hook gọi API thực tế (ví dụ: `useQuery`).
3. **Form Submissions**:
   - `CVWorkspace`: Tự động gọi Save Draft (`PUT /api/cvs/draft`) khi chỉnh sửa.
   - `PublishReviewPage`: Gọi Publish/Approve.
   - `ApprovalDetailPage`: Gọi `POST /api/cvs/:id/approve` hoặc `reject`.
   - `UserListPage/UserFormModal`: Gọi các endpoint quản trị người dùng.
4. **State Management**: Có thể cài đặt thêm React Query (hoặc RTK Query) để quản lý server state hiệu quả hơn. Thay vì set state local, các tương tác sẽ trigger mutation.
