# QA REPORT: FULL REGRESSION TEST FOR CV MANAGEMENT MODULE (PHASE B)

## 1. Mức Độ Bao Phủ (Coverage Overview)
Quá trình kiểm thử đã được tiến hành trên môi trường local (Backend: Port 3000, Frontend: Port 5173). Các luồng kiểm tra chính bao gồm CV Workspace, Draft Space, Version Control, Publish Flow, và Localization.

---

## 2. Passed Cases (Các chức năng hoạt động đúng)

* **Draft Space > Chỉnh sửa nội dung & Auto Save**: Cơ chế Debounce 2500ms hoạt động chính xác (`CVWorkspace.tsx`), không spam API. Gọi đúng API `PUT /api/cvs/:id/draft`.
* **Version Control > Timeline Loading**: Lịch sử phiên bản hiển thị đúng số lượng, sắp xếp giảm dần theo thời gian (Backend `cv.service.ts` orderBy `versionNumber: 'desc'`).
* **Version Control > Open Version (Preview Mode)**: `CVEditorPanel` nhận được prop `disabled=true`, vô hiệu hóa thành công các Input và Textarea.
* **Version Control > Auto-save Freeze**: Khi đang ở History Mode (`?tab=history`), Auto-save bị khóa hoàn toàn.
* **Version Control > Restore Version (Draft Safety)**: Có hiển thị popup cảnh báo xác nhận khôi phục đè lên bản nháp. Chức năng gọi đúng API `/restore` và dữ liệu được nạp lại.
* **Localization > Ngôn ngữ độc lập**: Dữ liệu Draft của CV tiếng Anh và tiếng Việt được lưu trong các bản ghi `cvProfile` riêng biệt trên cơ sở dữ liệu.

---

## 3. Failed Cases (Các lỗi được phát hiện)

### BUG-01: Mất dữ liệu Draft khi Reload / Đổi trang (Unsaved Changes Protection)
* **Severity**: Critical
* **Steps To Reproduce**: 
  1. Mở CV Workspace.
  2. Chỉnh sửa một trường bất kỳ trong Form.
  3. Bấm F5 (Refresh) trình duyệt HOẶC bấm nút `ArrowLeft` để quay lại ngay lập tức (trước khi Auto-save kịp chạy).
* **Expected Result**: Hiển thị popup của trình duyệt (`beforeunload`) hoặc popup của React Router báo "Có thay đổi chưa lưu".
* **Actual Result**: Trang bị load lại hoặc điều hướng ngay lập tức, làm mất vĩnh viễn nội dung người dùng vừa sửa.
* **Screenshot/Log**: Thiếu hook `useBlocker` hoặc sự kiện `window.onbeforeunload` trong `CVWorkspace.tsx`.
* **Network Request**: N/A.

### BUG-02: Quy trình Publish hoàn toàn bị Mock
* **Severity**: Critical
* **Steps To Reproduce**: 
  1. Mở CV Workspace.
  2. Bấm "Publish CV" để sang trang `/cv/:id/publish`.
  3. Bấm "Xác nhận Publish".
* **Expected Result**: Frontend gọi API `POST /api/cvs/:id/publish`. Backend tạo Version mới và cập nhật trạng thái CV.
* **Actual Result**: Frontend sử dụng hàm `setTimeout(..., 1500)` để mô phỏng tải trang và điều hướng trực tiếp về Dashboard (`PublishReviewPage.tsx`). Backend không hề có endpoint `/publish` trong `cv.controller.ts` hay `cv.service.ts`.
* **Network Request**: Không có request nào được gửi đi.

### BUG-03: Nút Publish CV vẫn hiển thị Active trong History Mode
* **Severity**: Medium
* **Steps To Reproduce**: 
  1. Mở CV Workspace.
  2. Bấm nút "Lịch sử" để chuyển sang History Mode.
  3. Chọn một phiên bản cũ trong Timeline.
  4. Quan sát thanh Header.
* **Expected Result**: Nút "Publish CV" bị disabled giống như nút "Lưu nháp".
* **Actual Result**: Nút "Publish CV" vẫn bấm được, cho phép người dùng ấn Publish trong khi họ đang xem preview của một Version cũ.
* **Screenshot/Log**: `<Button onClick={() => navigate(...)}>` thiếu thuộc tính `disabled={viewMode === 'history'}`.

### BUG-04: Thiếu kiểm tra Publish Empty Changes
* **Severity**: Low
* **Steps To Reproduce**: 
  1. Mở CV Workspace nhưng không thay đổi bất cứ thông tin nào.
  2. Bấm "Publish CV".
* **Expected Result**: Nút Publish bị vô hiệu hóa, hoặc hệ thống báo lỗi "Không có thay đổi nào để Publish".
* **Actual Result**: Do quá trình publish bị Mock (BUG-02), hệ thống vẫn cho phép người dùng vượt qua màn hình Publish Review dù không có dữ liệu mới.

---

## 4. Risk Assessment (Đánh giá Rủi ro)

> [!CAUTION]
> **Tình trạng: BLOCKED BY CRITICAL BUGS**
> Module CV Management (Phase B) **chưa sẵn sàng** cho UAT hay Production do vướng 2 Critical Bugs cực kỳ nghiêm trọng.

* **Rủi ro mất dữ liệu người dùng (BUG-01)**: Do cơ chế Auto-save sử dụng debounce 2.5s, việc thiếu chặn điều hướng trang (`beforeunload`) sẽ khiến mọi thay đổi của người dùng biến mất nếu họ thao tác chuyển trang nhanh.
* **Logic cốt lõi chưa hoàn thiện (BUG-02)**: Toàn bộ quá trình Publish - xương sống của Version Control - chưa được nối API và mới chỉ làm giao diện giả lập (Mock). Không thể xác minh tính toàn vẹn của dữ liệu Publish và Version Generation trên hệ thống.

### Đề xuất hành động:
1. Yêu cầu team Frontend bổ sung `window.onbeforeunload` và `useBlocker` ngay lập tức vào `CVWorkspace.tsx`.
2. Yêu cầu team Backend hoàn thiện endpoint `POST /api/cvs/:id/publish` và cung cấp tài liệu API Contract cập nhật.
3. Chặn nút Publish CV trên Frontend khi đang ở `History Mode` hoặc `unsavedChanges === 0`.
