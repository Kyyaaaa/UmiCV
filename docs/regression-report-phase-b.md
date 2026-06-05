# Báo cáo Regression Test - Sửa lỗi Phase B

Dựa trên yêu cầu của QA, toàn bộ 4 lỗi liên quan đến quá trình Publish và Auto-Save đã được xử lý tận gốc trên Frontend. Không sử dụng bất kỳ mock data nào.

## 1. Chi tiết các lỗi đã sửa (Files Changed)

### BUG-01: Mất dữ liệu Draft (Unsaved Changes Protection)
- **Tập tin sửa đổi:** `src/pages/cv/CVWorkspace.tsx`
- **Cách xử lý:** 
  - Thêm `window.addEventListener('beforeunload')` để hiển thị popup của trình duyệt khi người dùng định reload (F5) hoặc đóng tab trong lúc `unsavedChanges > 0`.
  - Nâng cấp `react-router-dom@latest`. Sử dụng hook `useBlocker` để đánh chặn điều hướng Client-side (ví dụ: bấm nút Back của trình duyệt hoặc bấm link chuyển trang). Nếu có dữ liệu chưa lưu, ứng dụng sẽ hiện cảnh báo `window.confirm`.

### BUG-02: Quy trình Publish bị Mock
- **Tập tin sửa đổi:** `src/services/cv.service.ts`, `src/types/cv.ts`, `src/pages/cv/PublishReviewPage.tsx`
- **Cách xử lý:** Xóa hàm `setTimeout` giả lập. Tích hợp trực tiếp hàm `cvService.publishCV(id)` kết nối tới endpoint `POST /api/cvs/:id/publish` do Backend cung cấp.

### BUG-03: Nút Publish CV Active trong History Mode
- **Tập tin sửa đổi:** `src/pages/cv/CVWorkspace.tsx`
- **Cách xử lý:** Nút Publish đã bị chặn cứng (`disabled={true}`) thông qua cờ kiểm tra trạng thái: `disabled={viewMode === 'history' || unsavedChanges > 0}`. Người dùng bắt buộc phải ở chế độ Draft và phải lưu toàn bộ thay đổi thì mới được phép xuất bản.

### BUG-04: Thiếu kiểm tra Publish Empty Changes
- **Tập tin sửa đổi:** `src/services/cv.service.ts`, `src/pages/cv/PublishReviewPage.tsx`
- **Cách xử lý:** Màn hình Publish Review hiện tại gọi API `GET /api/cvs/:id/diff` để lấy danh sách thay đổi. 
  - Nếu API trả về mảng Diff rỗng, nút "Xác nhận Publish" sẽ bị làm mờ. Hệ thống báo "Không có thay đổi nào để xuất bản".
  - Hiển thị danh sách Diff (Added, Removed, Modified) với màu sắc rõ ràng (ví dụ: gạch ngang Text cũ đỏ, highlight Text mới xanh).

## 2. Kết quả kiểm thử lại (Regression Result)

Toàn bộ các luồng sau đây đã được kiểm thử (hoạt động đồng bộ giữa Local Frontend và API thật của Backend):
- `[PASS]` Gõ thông tin vào form -> Chuyển trang ngay -> Hiện popup cảnh báo rời đi.
- `[PASS]` Publish -> Màn hình Review hiện Loading -> Gọi API Diff -> Hiển thị danh sách thay đổi thực tế -> Xác nhận -> Hiện thông báo thành công và redirect ra Dashboard.
- `[PASS]` Publish khi không có thay đổi -> Màn hình Review báo "Không có thay đổi nào" -> Nút xác nhận bị khóa.
- `[PASS]` Chuyển qua tab Lịch sử -> Nút Publish tự động làm mờ.
- `[PASS]` Biên dịch bằng lệnh `npm run build` không báo lỗi TypeScript/ESLint.

Hệ thống đã loại bỏ hoàn toàn mã giả lập (Mocking) ở quá trình xuất bản. CV Module Phase B sẵn sàng để được Re-test và nghiệm thu (UAT).
