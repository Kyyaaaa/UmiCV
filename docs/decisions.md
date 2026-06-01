# Quyết định Kiến trúc & Các vấn đề còn mở (Architecture Decisions)

## 1. Các Quyết định Kiến trúc (Architectural Decisions)
- **ADR-01: Sử dụng Modular Monolith:** Thay vì dùng Microservices ngay từ đầu, dự án sẽ xây dựng backend dạng Modular Monolith. Điều này giảm thiểu phức tạp vận hành và triển khai Docker, phù hợp cho quy mô ứng dụng nội bộ.
- **ADR-02: PostgreSQL JSONB cho CV Schema:** Do người dùng có thể tự do chỉnh sửa cấu trúc CV (thêm/bớt section) thông qua trình kéo thả, schema CV là động (dynamic). Việc sử dụng tính năng JSONB của PostgreSQL cho schema của CV giúp đảm bảo tính linh hoạt cực cao mà không cần đến NoSQL như MongoDB.
- **ADR-03: Queue với Redis & BullMQ:** Việc xử lý Email theo luồng đồng bộ sẽ dễ gây nghẽn (bottleneck) và vi phạm SLA (< 5 phút). Bắt buộc phải sử dụng Message Broker bất đồng bộ. Redis/BullMQ được chọn vì nhẹ và kết hợp luôn được tính năng Caching cho hệ thống.
- **ADR-04: Draft Space & Versioning:** Hệ thống không cập nhật đè (overwrite) dữ liệu khi HR yêu cầu Employee sửa. Employee thao tác trên bản Draft, sau khi được HR duyệt mới publish đè lên bản chính thức và tăng version number, copy bản cũ vào bảng lưu trữ lịch sử để xem Diff.
- **ADR-05: Đa ngôn ngữ hiển thị cảnh báo (Warning Label):** Khi cấu trúc bản gốc tiếng Việt thay đổi, các bản dịch sẽ hiển thị nhãn "Out of sync" (Không đồng bộ) thay vì bị khóa. Nhân sự vẫn có thể sử dụng bản dịch cũ, nhưng được khuyến nghị cập nhật để khớp với cấu trúc mới.
- **ADR-06: Giới hạn Batch Request:** Hệ thống sẽ áp dụng giới hạn cứng tối đa 500 nhân sự cho mỗi Batch Request. Quyết định này giúp bảo vệ hệ thống Message Queue và SMTP server không bị quá tải (OOM) khi xử lý đồng loạt.
- **ADR-07: Phân quyền duyệt chéo dự án:** Để giải quyết bài toán nhân sự làm việc chéo khối, kiến trúc CSDL sẽ bổ sung thêm Domain `Project` và `Project_Members`. Tech Lead sẽ được phân quyền duyệt CV dựa trên cả Department gốc và các Project mà nhân sự đó tham gia.

## 2. Các Giả định (Assumptions)
- Dữ liệu phòng ban, sơ đồ tổ chức là ổn định, hoặc có thể import từ hệ thống IAM/HRM khác của VTIT trong tương lai. Hiện tại coi như Admin tự quản trị nội bộ.
- Email server nội bộ của VTIT (SMTP) chịu tải tốt với luồng gửi hàng loạt (batch requests) theo chunk dưới 500 emails/batch.

## 3. Các vấn đề còn mở & Cần xác nhận (Open Questions)
- (Đã giải quyết toàn bộ qua buổi Grill-me)
