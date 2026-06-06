# Báo cáo Refactor UX Cảnh báo "Thay đổi chưa được lưu"

Tài liệu này ghi nhận quá trình thay thế toàn bộ các popup Native (`alert`, `window.confirm`) thành giao diện `Modal.tsx` đồng nhất trong module CV Workspace.

## 1. Root Cause Analysis
- **Trải nghiệm kém chuyên nghiệp**: Việc lạm dụng `window.confirm` khi chặn điều hướng (via `useBlocker` và nút Back) cũng như `alert` khi chặn thao tác chuyển đổi ngôn ngữ tạo ra sự đứt gãy về UI. Popup của trình duyệt thường có giao diện lỗi thời và không ăn nhập với Design System của ứng dụng.
- **Vấn đề Spam/Hỏi nhiều lần**: Do nút Back thủ công có chứa `window.confirm`, kết hợp với `useBlocker` cũng chạy kiểm tra nội bộ, dẫn tới tình trạng xung đột hoặc người dùng phải xác nhận nhiều lần mới thoát được trang.

## 2. Files Modified
1. `src/pages/cv/CVWorkspace.tsx`

## 3. UX Changes
### Hợp nhất State (`pendingUnsavedAction`)
Thay vì thực thi các hàm callback trực tiếp hoặc chặn luồng đồng bộ bằng `window.confirm`, hệ thống đưa mọi hành vi có nguy cơ mất dữ liệu vào một state chờ chung gọi là `pendingUnsavedAction`. State này lưu lại 2 hàm: `proceed` (thực thi tiếp) và `reset` (hủy bỏ).

### Tái cấu trúc `useBlocker`
- Khi `useBlocker` phát hiện chuyển hướng trang trong lúc `isDirty = true`, nó sẽ gán trạng thái Blocked. 
- Hệ thống đẩy callback `blocker.proceed()` và `blocker.reset()` vào `pendingUnsavedAction`.

### Loại bỏ `alert` & `window.confirm`
- **Nút Back**: Xóa hoàn toàn khối điều kiện kiểm tra `isDirty`. Trả lại nguyên bản `onClick={() => navigate('/cv')}`. Lệnh điều hướng này sẽ bị `useBlocker` bắt lại và hiện Modal. Điều này giải quyết triệt để lỗi **hỏi 2 lần**.
- **Chuyển ngôn ngữ**: Gỡ bỏ `alert("Vui lòng lưu nháp...")`. Nếu người dùng thao tác khi `isDirty = true`, thay vì văng `alert`, hệ thống set `pendingUnsavedAction` để mở Modal. Nếu người dùng chọn "Rời khỏi trang", thao tác chuyển đổi (mở CopyLocalizationModal) sẽ được thực thi ngay lập tức.
- **Trình duyệt Native**: `beforeunload` vẫn được giữ nguyên không suy suyển, đảm bảo 1 lớp phòng thủ vững chắc cho các sự kiện F5, Refresh hoặc Đóng Tab.

## 4. Verification Results

| Case | Scenario | Current Result (PASS) |
| :--- | :--- | :--- |
| **Case 1** | `isDirty = false`, thao tác Rời trang. | Không hiện popup. Đi thẳng. |
| **Case 2** | `isDirty = true`, thao tác Rời Dashboard. | Hiện 1 Modal chuyên nghiệp. Chọn Rời đi -> Thoát. Chọn Ở lại -> Giữ nguyên. |
| **Case 3** | `isDirty = true`, thao tác Đổi ngôn ngữ. | Hiện 1 Modal chuyên nghiệp. Bấm Rời đi -> Mở tiếp popup chọn Ngôn ngữ mới. |
| **Case 4** | `isDirty = true`, bấm F5. | Cảnh báo Native của Browser xuất hiện chặn lại. |
| **Case 5** | `isDirty = true`, bấm Đóng tab. | Cảnh báo Native của Browser xuất hiện chặn lại. |
| **Case 6** | Thao tác trên Dynamic Sections. | Cập nhật `isDirty` đúng chuẩn. Nằm trong luồng chặn chung. |

## 5. Build Result
- **Build Passed**: Cấu trúc khai báo type `UnsavedAction` an toàn và khép kín. Không có bất kỳ lỗi TypeScript hay ESLint nào phát sinh trong quá trình build Vite.
