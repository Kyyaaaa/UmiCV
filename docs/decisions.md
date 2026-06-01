# Quyết định Kiến trúc & Các vấn đề còn mở (Architecture Decisions)

## 1. Các Quyết định Kiến trúc (Architectural Decisions)
- **ADR-01: Sử dụng Modular Monolith:** Thay vì dùng Microservices ngay từ đầu, dự án sẽ xây dựng backend dạng Modular Monolith. Điều này giảm thiểu phức tạp vận hành và triển khai Docker, phù hợp cho quy mô ứng dụng nội bộ.
- **ADR-02: PostgreSQL JSONB cho CV Schema:** Do người dùng có thể tự do chỉnh sửa cấu trúc CV (thêm/bớt section) thông qua trình kéo thả, schema CV là động (dynamic). Việc sử dụng tính năng JSONB của PostgreSQL cho schema của CV giúp đảm bảo tính linh hoạt cực cao mà không cần đến NoSQL như MongoDB.
- **ADR-03: Queue với Redis & BullMQ:** Việc xử lý Email theo luồng đồng bộ sẽ dễ gây nghẽn (bottleneck) và vi phạm SLA (< 5 phút). Bắt buộc phải sử dụng Message Broker bất đồng bộ. Redis/BullMQ được chọn vì nhẹ và kết hợp luôn được tính năng Caching cho hệ thống.
- **ADR-04: Draft Space & Versioning:** Hệ thống không cập nhật đè (overwrite) dữ liệu khi HR yêu cầu Employee sửa. Employee thao tác trên bản Draft, sau khi được HR duyệt mới publish đè lên bản chính thức và tăng version number, copy bản cũ vào bảng lưu trữ lịch sử để xem Diff.

## 2. Các Giả định (Assumptions)
- Dữ liệu phòng ban, sơ đồ tổ chức là ổn định, hoặc có thể import từ hệ thống IAM/HRM khác của VTIT trong tương lai. Hiện tại coi như Admin tự quản trị nội bộ.
- Email server nội bộ của VTIT (SMTP) chịu tải tốt với luồng gửi hàng loạt (batch requests) và có thể sử dụng thông qua queue ở tần suất cao.

## 3. Các vấn đề còn mở & Cần xác nhận (Open Questions)
- **Đa ngôn ngữ đồng bộ Schema (BR-09):** Khi cấu trúc của bản gốc tiếng Việt thay đổi, hệ thống sẽ "cảnh báo yêu cầu đồng bộ" cho các bản dịch. *Cần xác nhận từ PO:* Nếu nhân sự không đồng bộ bản dịch thì bản dịch có bị khóa không, hay vẫn được xem bình thường nhưng hiển thị nhãn "Out of sync"?
- **Giới hạn số lượng trong 1 Batch Request:** Có giới hạn tối đa số lượng CV được yêu cầu cập nhật trong 1 Batch Request không? (VD: tối đa 500 người/batch để tránh quá tải RAM ở Notification Worker).
- **Phân quyền Tech Lead theo dự án chéo:** Nhân viên thuộc phòng KTCN nhưng tham gia làm dự án cho BU1. Tech Lead của BU1 có được quyền xem/duyệt CV của nhân viên này không? *Đề xuất:* Thiết kế thêm cơ chế phân quyền "Project_Members" để gán quyền linh hoạt cho Tech Lead ngoài cấu trúc "Department" cứng.
