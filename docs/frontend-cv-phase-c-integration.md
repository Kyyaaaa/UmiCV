# Tích hợp Phase C: Localization & Dynamic Sections

Tài liệu này mô tả chi tiết cách tích hợp tính năng Đa ngôn ngữ (Localization) và Thêm mục tùy chỉnh (Custom Sections) vào module CV Workspace trên Frontend. Quá trình tích hợp diễn ra hoàn toàn khớp với Backend API Contract hiện tại và tuân thủ nguyên tắc không sử dụng Mock Data.

## Localization Flow

Hệ thống cung cấp một trải nghiệm liền mạch cho phép người dùng dịch hoặc nhân bản CV của họ sang các ngôn ngữ khác nhau. Các request đều được xử lý qua lớp `CVService`, cụ thể là hàm `copyLocalization(id, targetLanguageCode)`, giao tiếp với endpoint `POST /api/cvs/:id/localizations/copy`.

## Language Selector

Khu vực chọn ngôn ngữ (Language Selector) được tích hợp trực tiếp trên thanh công cụ Header của `CVWorkspace`. 
- **Active State**: Ngôn ngữ của bản CV hiện tại sẽ được đánh dấu rõ ràng (nền trắng chữ xanh).
- **Inactive State**: Các ngôn ngữ khác chưa được active sẽ khả dụng để click.
Khi người dùng bấm vào một ngôn ngữ Inactive, hệ thống không chỉ chuyển đổi trạng thái đơn thuần, mà kích hoạt **Copy Localization Flow**.

## Copy Localization Flow

Quy trình nhân bản CV sang ngôn ngữ mới được xử lý thông qua `CopyLocalizationModal`:
1. **Trigger**: Người dùng chọn một ngôn ngữ đích (hoặc bấm nút nhân bản) từ Header.
2. **Modal Cảnh Báo (Draft Safety)**: Một popup sẽ hiện lên để cảnh báo người dùng. Thông điệp cảnh báo rõ ràng chỉ định rằng nếu bản nháp ở ngôn ngữ đích đã tồn tại, nó sẽ bị ghi đè hoàn toàn bởi bản copy từ ngôn ngữ hiện tại.
3. **Execution**: Khi người dùng xác nhận bằng cách chọn ngôn ngữ đích từ danh sách, trạng thái Loading sẽ xuất hiện trên Modal.
4. **Redirection**: Sau khi Backend xử lý copy thành công và trả về dữ liệu CV mới (bao gồm `id` mới), Frontend lập tức dùng `react-router` để điều hướng người dùng tới `/cvs/{newCvId}/workspace`. Dữ liệu CV gốc được bảo toàn hoàn toàn không bị ảnh hưởng.

## Custom Section Flow

Để đáp ứng nhu cầu tùy chỉnh không giới hạn cấu trúc, hệ thống cho phép tạo các mục (Section) động:
1. **Tạo Section**: Tại `WorkspaceSidebar`, người dùng có thể nhấn nút `+ Thêm mục mới`. Hệ thống sẽ mở Prompt yêu cầu nhập Key cho Section (ví dụ: `awards`, `certificates`). Sau khi validate, key này được nạp vào `sectionsData` dưới dạng một mảng trống `[]`.
2. **Dynamic Editor (Render Động)**: Panel `CVEditorPanel` sẽ nhận diện các section không thuộc chuẩn hệ thống và tự động fallback về giao diện **Generic Custom Section Editor**. Tại đây, người dùng có thể thêm/xóa/sửa các Item dưới cấu trúc chuẩn `{ title: string, description: string }`.
3. **Dynamic Preview**: Tại `CVPreviewPanel`, một vòng lặp sẽ tự động trích xuất tất cả các key mở rộng từ `sectionsData` để hiển thị trên bản xem trước.
4. **TypeScript Safety**: File `src/types/index.ts` đã mở rộng kiểu `CVSections` bằng `[key: string]: any;`, nhờ đó JSON có thể thay đổi linh hoạt mà không gây lỗi trình biên dịch (Build PASS).

## Known Limitations

Dưới đây là một số giới hạn của hệ thống trong khuôn khổ thiết kế hiện tại:
- **Loose-schema Custom Sections**: Các Section mở rộng hiện đang bị giới hạn ở cấu trúc chung `{ title, description }`. Sẽ cần phát triển thêm tính linh hoạt nếu muốn hỗ trợ mảng đối tượng phức tạp hơn (VD: nested arrays) hoặc kiểu dữ liệu ngoài chuỗi (String).
- **Không tự động dịch (No Auto Translation)**: Thao tác Copy chỉ sao chép nguyên trạng (clone) text từ ngôn ngữ gốc sang ngôn ngữ đích. Người dùng vẫn phải tự dịch nội dung sang ngôn ngữ mà họ muốn.
- **Không Sync đa ngôn ngữ**: Nếu bạn sửa nội dung một mục ở bản Tiếng Việt, bản Tiếng Anh sẽ không tự động cập nhật lại. Đây là thiết kế chủ đích để giữ các phiên bản ngôn ngữ độc lập về bối cảnh (context isolation).
