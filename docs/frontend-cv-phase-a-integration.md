# Frontend CV Module Phase A Integration

Tài liệu mô tả quá trình tích hợp module CV Management (Phase A: Core Workspace) trên Frontend với Backend thật.

## APIs sử dụng

Tất cả request đều được đi qua Axios Interceptor (tại `src/lib/axios.ts`) giúp tự động gắn JWT `Authorization: Bearer <token>` vào request headers.

1. **`GET /api/cvs/me`**: Lấy danh sách CV của nhân sự hiện tại, hiển thị trên Dashboard.
2. **`POST /api/cvs`**: Tạo một bản CV nháp mới. Body request gửi lên `{ languageCode: 'vi' }`.
3. **`GET /api/cvs/:id`**: Lấy thông tin chi tiết một bản CV dựa theo ID để load vào Workspace.
4. **`PUT /api/cvs/:id/draft`**: Lưu toàn bộ nội dung trong Editor (phần `sectionsData`) lên Database.

Các Service được đóng gói hoàn toàn trong `src/services/cv.service.ts` nhằm tách biệt logic gọi API với component giao diện.

## Flow Create CV

1. Người dùng bấm nút **Tạo Workspace Mới** trên màn hình `CVDashboard.tsx`.
2. Hệ thống gọi `cvService.createCV({ languageCode: 'vi' })` để tạo một bản CV rỗng ở Backend.
3. Khi Backend trả về response bao gồm `id` của CV vừa tạo, hệ thống tự động redirect sang URL `/cv/:id/workspace`.
4. Workspace sẽ load lại dữ liệu (chính là bản nháp trắng vừa được tạo).

## Flow Load CV

1. Component `CVWorkspace.tsx` đọc `id` từ react-router params.
2. Trong `useEffect`, hệ thống gọi `cvService.getCVById(id)` để fetch nội dung.
3. Trong lúc chờ fetch xong, hiển thị trạng thái Loading ("Đang tải Workspace...").
4. Khi nhận được dữ liệu, đổ vào state `cvData` để Editor và Previewer sử dụng render.

## Flow Save Draft

1. Nút **Lưu Nháp** gọi trực tiếp `handleSaveDraft` để submit dữ liệu qua phương thức `PUT /api/cvs/:id/draft`.
2. Trạng thái nút bấm và `DraftIndicator` được chuyển thành "Đang lưu..." (kèm icon xoay vòng `Loader2`).
3. Nếu thành công, hiển thị "Đã lưu lúc [thời gian]".
4. Lỗi network được catch và log ra console, đồng thời trạng thái "Đang lưu..." tự gỡ bỏ.

## Auto Save Strategy

Việc Auto Save được cài đặt bằng kỹ thuật `debounce` để tránh spam request:
- Mỗi khi `cvData.sectionsData` bị thay đổi (người dùng gõ text, thêm field), state `unsavedChanges` sẽ tăng lên.
- Một `useEffect` sẽ lắng nghe sự kiện này và khởi tạo `setTimeout(..., 2500)` (2.5 giây).
- Nếu trong 2.5 giây người dùng tiếp tục gõ, timeout cũ bị xóa (`clearTimeout`) và một đếm ngược mới được bắt đầu.
- Khi ngừng gõ đủ 2.5 giây, hàm `handleSaveDraft()` sẽ được tự động gọi mà không cần bấm nút thủ công.

## Known Limitations

- Chưa có chức năng xử lý lỗi toàn cục với mã `401 Unauthorized` nếu phiên bản nháp tự động lưu gặp lỗi Token Expired (mặc dù đã có Interceptor auto-refresh ở Auth, nhưng nếu refresh thất bại thì việc auto-save sẽ gây crash UI ở một số trường hợp nếu popup alert nhảy lên liên tục. Hiện tại chúng ta sử dụng `console.error` để catch).
- Các Module Version History, Diff Viewer, và Publish CV hiện tại vẫn đang bị disabled theo scope của Phase A.
