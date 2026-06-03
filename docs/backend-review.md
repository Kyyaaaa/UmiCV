# Đánh giá Backend (Backend Review)

Tài liệu này đánh giá tổng quan về chất lượng kỹ thuật của hệ thống Backend UmiCV hiện tại.

## 1. Kiến trúc (Architecture)
- **Điểm mạnh:**
  - Áp dụng cấu trúc **Modular Monolith** rất tốt. Các logic được đóng gói theo Domain (Auth, CV, Workflow, Notification), giúp codebase rõ ràng và dễ bảo trì ở giai đoạn đầu.
  - Sử dụng Layered Architecture (Route -> Controller -> Service -> DB) khá bài bản. Tầng Router xử lý Validation và Auth, Controller điều phối HTTP, Service chịu trách nhiệm Business Logic.
  - Tách bạch logic xử lý email/thông báo sang hàng đợi bất đồng bộ (Redis BullMQ) và thiết kế Cronjob chuẩn chỉ. Điều này đáp ứng chính xác yêu cầu SLA < 5 phút theo tài liệu thiết kế.
- **Điểm yếu:**
  - Thiếu thiết kế **Dependency Injection (DI)** hoặc Inversion of Control (IoC). Trong Controller đang dùng lệnh `new Service()` để khởi tạo cứng các phụ thuộc. Điều này sinh ra Tight Coupling (liên kết chặt), khiến cho việc viết Unit Test bằng cách Mock Service rất khó khăn.

## 2. Coding Quality (Chất lượng Code)
- **Điểm mạnh:**
  - Khai báo kiểu dữ liệu TypeScript rõ ràng. 
  - Khai thác sức mạnh của thư viện `zod` để validate đầu vào chuẩn xác, tạo ra một lưới lọc (validation middleware) bảo vệ an toàn cho Controller.
  - Xử lý lỗi tập trung thông qua `errorHandler` và custom `AppError` giúp giữ HTTP response đồng nhất.
- **Điểm yếu:**
  - Quản lý Import cẩu thả dẫn đến lỗi Runtime (Quên import `verifyToken` nhưng IDE không chặn).
  - Controller thiếu `try/catch`. Dù dựa vào `express-async-errors` nhưng không có tài liệu hay comment quy định rõ ràng, người mới vào bảo trì có thể hiểu lầm hoặc vi phạm pattern.
  - Quá nhiều Hardcode, ví dụ như Role Level: `const level = req.user!.role === 'HR' ? 2 : 1;` thay vì quản lý theo enum hay permission database.

## 3. Maintainability (Khả năng Bảo trì)
- **Rủi ro lớn nhất (Báo động đỏ):** Hệ thống có tỷ lệ bao phủ kiểm thử (Test Coverage) là **0%**. Toàn bộ luồng phê duyệt trạng thái CV phức tạp hoàn toàn dựa vào code chay. Mọi sự thay đổi nhỏ lẻ đều có rủi ro gây ra Regression Bug nghiêm trọng (Lỗi luồng cũ khi thêm luồng mới).
- **Sự sai lệch giữa Code và Document:** Code đang thiếu tính năng Logout so với yêu cầu bảo mật, sai lệch kết quả API Diff so với contract, và mount Route sai cấu trúc (Search Controller quản lý CV Diff). Việc document và code không nhất quán sẽ làm giảm tốc độ Onboarding cho thành viên mới.

## 4. Performance (Hiệu năng)
- **Tương tác Cơ sở dữ liệu:** Prisma ORM được cấu hình khá tốt, có dùng Transaction (`$transaction`) cho các tác vụ nhiều thay đổi (Duyệt CV, Tạo Batch Request) để đảm bảo tính toàn vẹn (ACID).
- **Điểm nghẽn tiềm ẩn (Bottleneck):**
  - Trong logic chạy Cronjob (`notification.cron.ts`), code đang query toàn bộ dữ liệu Outdated từ DB vào RAM cùng một lúc (`findMany` không giới hạn). Khi số lượng nhân sự tăng lên vài ngàn, Node.js sẽ bị tràn bộ nhớ (Out of Memory).
  - Tìm kiếm toàn văn (Full-text search) trên trường JSONB hiện chưa tận dụng được GIN index (bằng toán tử `@>` của Postgres) mà Prisma đang map về string contains cơ bản, quét toàn bảng.

## 5. Scalability (Khả năng Mở rộng)
- **Mở rộng theo chiều ngang (Horizontal Scaling):**
  - Backend sử dụng JWT Stateless, không lưu trữ file local (chỉ lưu JSONB database) nên ứng dụng có thể dễ dàng tăng bản sao (replicas) qua Docker/Kubernetes. 
  - Tuy nhiên, việc thiếu cơ chế Invalidating Refresh Token (Redis Blacklist) đồng nghĩa với việc mở rộng ứng dụng sẽ đi kèm với sự suy giảm mức độ kiểm soát session an toàn.
- **Microservices Readiness:**
  - Logic gửi Email đã được chuyển giao cho hàng đợi (Redis Queue). Sau này khi tải hệ thống cao, module Notification/Worker này hoàn toàn có thể tách rời thành một dự án Microservice riêng biệt trong vòng chưa tới 1 ngày làm việc.

## Kết luận chung
Cấu trúc khung sườn (Skeleton) của backend rất tốt và bám sát tài liệu thiết kế. Tuy nhiên, khâu thực thi (Implementation) còn hời hợt, mắc nhiều sai sót từ lỗi cú pháp cơ bản cho đến bỏ quên khâu kiểm tra phân quyền bảo mật (BOLA/IDOR). Cần ưu tiên thiết lập Testing và fix các lỗi bảo mật trước khi bàn giao cho Frontend tích hợp.
