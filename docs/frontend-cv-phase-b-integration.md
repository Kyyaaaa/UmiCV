# Frontend CV Module Phase B Integration (Version Control)

Tài liệu mô tả quá trình tích hợp module CV Version Control (Phase B) trên Frontend với Backend thật.

## APIs sử dụng

Các API thuộc Version Control được thêm vào `cv.service.ts`:

1. **`GET /api/cvs/:id/versions`**: Lấy danh sách lịch sử các phiên bản của CV.
2. **`GET /api/cvs/:id/versions/:versionId`**: Lấy thông tin chi tiết một phiên bản (nội dung snapshotData) để xem trước.
3. **`POST /api/cvs/:id/versions/:versionId/restore`**: Khôi phục lại bản nháp hiện tại dựa trên một phiên bản lịch sử.

## Version History Flow & Dual Mode Workspace

Trải nghiệm Version History đã được hợp nhất trực tiếp vào `CVWorkspace.tsx` theo dạng Dual Mode nhằm tránh làm gián đoạn trải nghiệm người dùng, loại bỏ `VersionHistoryPage.tsx` cũ rườm rà.

1. **Chuyển đổi Mode**: Người dùng bấm nút **Lịch sử** trên CVDashboard hoặc trên Workspace Header. `CVWorkspace` chuyển sang chế độ `History Mode` thông qua query param `?tab=history`.
2. **VersionHistorySidebar**: Ở History Mode, cột điều hướng bên trái (`WorkspaceSidebar`) được thay thế bằng `VersionHistorySidebar` chứa danh sách Timeline các phiên bản từ mới nhất đến cũ nhất.

## Version Preview Flow

1. Khi người dùng click chọn 1 phiên bản trên Timeline, `getVersionById` được gọi để kéo nội dung `snapshotData` của phiên bản đó về.
2. Form của `CVEditorPanel` bị **vô hiệu hóa hoàn toàn** (thêm thuộc tính `disabled` vào toàn bộ input và textarea).
3. Auto-save tự động bị chặn.
4. Một thông báo Banner (Read-only) hiện lên trên Editor báo rằng người dùng đang xem phiên bản lịch sử, kèm nút "Quay lại Bản Nháp".
5. Giao diện Live Preview bên phải thay đổi tức thì sang nội dung của bản lịch sử, giúp đối chiếu dễ dàng.

## Restore Flow & Draft Safety

1. Ở mỗi item trên Timeline, nếu đang được select, sẽ hiện ra nút **Khôi phục bản này**.
2. **Cơ chế Draft Safety**: Trước khi gọi API, frontend sẽ kiểm tra biến `unsavedChanges` (đếm số lượng thay đổi chưa được Auto-save ở bản nháp hiện tại).
   - Nếu `unsavedChanges > 0`: Cảnh báo người dùng có dữ liệu chưa lưu sẽ bị mất nếu đồng ý ghi đè.
   - Nếu `unsavedChanges === 0`: Hỏi xác nhận thông thường.
3. Khi người dùng đồng ý, gọi API `restoreVersion`.
4. Sau khi thành công, gọi lại `fetchCV()` để cập nhật lại Draft mới nhất từ Server, reset các state preview và query param để trở về **Draft Mode**.

## Error Handling

- Các request API luôn có khối `try...catch` hiển thị error boundary nhẹ.
- Trạng thái Loading của danh sách version và quá trình tải snapshot đều có skeleton/spinner.
- Khôi phục thất bại (ví dụ: CV đang bị khóa PendingApproval) sẽ hiện Alert rõ ràng.

## Known Limitations

- Chưa có Diff Viewer do scope yêu cầu không làm ở Phase B.
- Component so sánh chưa hiển thị highlight khác biệt.
