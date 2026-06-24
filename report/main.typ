#import "template.typ": report

#show: report.with(
  title: [BÁO CÁO MINI-PROJECT \ Hệ thống Quản lý CV Nhân viên Toàn diện (UmiCV)],
  authors: (
    "Sinh viên: <Tên sinh viên thực hiện>",
    "Email: <Email sinh viên thực hiện>",
    "Chương trình Viettel Digital Talent 2026",
    "Lĩnh vực: Software Engineer",
    "",
    "Mentor: <Tên mentor>",
    "Đơn vị: VTIT"
  ),
  date: "Tháng 6/2026"
)

#text(size: 20pt, weight: "bold")[Phần mở đầu]
#v(1.5em)

*Lời mở đầu* \
Trong bối cảnh chuyển đổi số mạnh mẽ, việc quản lý nhân sự và đánh giá năng lực qua hồ sơ lý lịch (CV) đóng vai trò then chốt trong sự phát triển của doanh nghiệp. Dự án "Hệ thống Quản lý CV Nhân viên Toàn diện" (UmiCV) được phát triển nhằm mục đích chuẩn hóa, số hóa và tự động hóa quy trình quản lý CV tại Công ty Đầu tư Công nghệ Viettel (VTIT). Báo cáo này trình bày chi tiết về quá trình xây dựng, kiến trúc hệ thống và kết quả đạt được của dự án.

#v(1em)
*Tóm tắt nội dung và đóng góp* \
Báo cáo này trình bày toàn bộ quy trình phát triển hệ thống UmiCV từ khâu phân tích yêu cầu, thiết kế kiến trúc đến triển khai thực tế. Các đóng góp chính bao gồm:
- Thiết kế hệ thống theo kiến trúc Clean Architecture, đảm bảo tính mở rộng và dễ bảo trì.
- Xây dựng luồng phê duyệt đa cấp (Approval Matrix) và Không gian Nháp (Draft Space) linh hoạt.
- Tự động hóa gửi yêu cầu cập nhật CV và nhắc nhở (Auto Remind) qua Email/Notification dùng Queue (Redis, BullMQ).
- Áp dụng các công nghệ hiện đại: Node.js, React, PostgreSQL, Docker, Redis.

#v(1em)
*Danh mục hình vẽ* \
_Hiện tại báo cáo chưa đính kèm hình vẽ chi tiết, các biểu đồ ERD và Activity Diagram được tham chiếu tại các tài liệu kỹ thuật đính kèm (SDD/SRS)._

#v(1em)
*Danh mục đồ thị* \
_Không có đồ thị định lượng trong khuôn khổ báo cáo này._

#pagebreak()

= Giới thiệu

== Đặt vấn đề
Tại VTIT, với số lượng nhân sự lớn thuộc nhiều phòng ban/khối dự án, việc quản lý hồ sơ năng lực nhân sự theo cách truyền thống thường gặp khó khăn trong việc tìm kiếm, chuẩn hóa form mẫu và quản lý phiên bản. Đặc biệt khi bộ phận HR cần thu thập hàng loạt CV để chuẩn bị hồ sơ thầu, thời gian xử lý thủ công gây tốn kém công sức và dễ dẫn đến sai sót.

== Mục tiêu của báo cáo
Báo cáo này nhằm mô tả giải pháp phần mềm "Hệ thống Quản lý CV Nhân viên Toàn diện" (UmiCV), chứng minh khả năng của ứng dụng trong việc giải quyết bài toán quản lý CV thông qua tự động hóa quy trình (Batch Request, Cronjob) và phân quyền kiểm duyệt chặt chẽ (RBAC).

== Phạm vi triển khai công nghệ
Dự án tập trung vào phát triển hệ thống nền tảng Web bao gồm Frontend (React, Vite, TailwindCSS) và Backend (Node.js, Express, PostgreSQL), kết hợp với Message Broker (Redis, BullMQ) cho các tác vụ bất đồng bộ và được đóng gói toàn bộ qua Docker.

= Nội dung và phương pháp

== Kiến thức nền tảng
Hệ thống sử dụng các nguyên lý và công nghệ thiết kế phần mềm hiện đại:
- *Clean Architecture:* Tách biệt mã nguồn thành các layer (Presentation, Application, Domain, Infrastructure), giúp phần lõi nghiệp vụ (Domain) không bị phụ thuộc vào framework bên ngoài.
- *Asynchronous Processing:* Sử dụng Message Queue để xử lý các tác vụ nặng (như gửi email hàng loạt) nhằm tối ưu hiệu năng của API chính.
- *RBAC (Role-Based Access Control):* Phân quyền người dùng chi tiết dựa trên vai trò (Admin, HR, Tech Lead, Employee).

== Tổng quan về kiến trúc hệ thống
Hệ thống được thiết kế theo kiến trúc *Modular Monolith* ở giai đoạn Release 1 để giảm thiểu chi phí triển khai ban đầu, đồng thời duy trì ranh giới rõ ràng giữa các domain.
- *Tầng Giao diện (Frontend):* Cung cấp UI tương tác cao, quản trị CV đa ngôn ngữ và xem khác biệt (Diff Viewer).
- *Tầng Xử lý (Backend):* Cung cấp RESTful API, quản lý logic nghiệp vụ và xác thực/phân quyền (JWT).
- *Tầng Lưu trữ:* Sử dụng PostgreSQL để lưu trữ dữ liệu bền vững (quan hệ) và dữ liệu có cấu trúc linh hoạt (JSONB cho nội dung CV).

== Nội dung thực hiện
1. *Phân tích yêu cầu:* Xác định rõ bối cảnh và các Actor chính của hệ thống.
2. *Thiết kế CSDL (ERD):* Thiết lập mô hình dữ liệu quan hệ cho User, Department, CV, Versioning và Batch Request.
3. *Phát triển Backend API:* Lập trình các API CRUD cho CV, luồng duyệt (Approve/Reject) và tích hợp hệ thống nhắc nhở tự động định kỳ (Cronjob).
4. *Phát triển Frontend:* Xây dựng các màn hình quản lý, dashboard tổng quan và form nhập liệu CV đa năng.
5. *Đóng gói & Triển khai:* Tích hợp Dockerfile và `docker-compose.yml` để dễ dàng triển khai toàn bộ các service bằng một lệnh duy nhất.

= Kết quả thực hiện và đánh giá

== Mô tả quá trình thử nghiệm và triển khai
Ứng dụng đã được triển khai thử nghiệm trên môi trường Docker cục bộ. Toàn bộ các dịch vụ (PostgreSQL, Redis, Backend, Frontend) giao tiếp với nhau ổn định. Các luồng tính năng cốt lõi như tạo CV nháp, trình duyệt qua Tech Lead đến HR, cũng như việc gửi thông báo qua Queue đều hoạt động đúng theo thiết kế ban đầu.

== Kết quả đạt được
- Hệ thống đáp ứng đầy đủ các yêu cầu chức năng (Functional Requirements): Quản lý CV tập trung, Luồng duyệt nhiều cấp, Yêu cầu cập nhật hàng loạt và Nhắc nhở tự động.
- Hiệu suất (Performance) được bảo đảm nhờ cơ chế Async Queue đối với các tác vụ email và Cronjob.
- Kiến trúc phần mềm rõ ràng giúp quá trình nâng cấp, bảo trì sau này thuận lợi.

== Đánh giá hiệu quả
Dự án đã đưa ra một lời giải hoàn chỉnh cho bài toán quản lý và chuẩn hóa CV, giúp giảm thiểu đáng kể thời gian mà HR phải bỏ ra để tổng hợp hồ sơ. Sự minh bạch trong quy trình duyệt giúp loại bỏ tình trạng sai sót và mất mát dữ liệu vốn thường thấy ở việc quản lý file truyền thống.

= Kết luận

== Tóm tắt các phát hiện chính
Việc áp dụng Clean Architecture và hệ thống Message Queue đem lại độ linh hoạt và độ ổn định cao. Đặc biệt, tính năng Không gian Nháp (Draft Space) và Quản lý Phiên bản (Version Control) tạo ra sự an tâm cho người dùng khi cập nhật thông tin CV mà không lo ảnh hưởng đến bản CV chính thức đang lưu hành.

== Hướng phát triển tương lai
- Hỗ trợ xuất trực tiếp CV ra nhiều định dạng (PDF/Word) chuyên nghiệp thông qua template có thể tùy chỉnh trên UI.
- Ứng dụng AI/NLP để trích xuất tự động thông tin (kỹ năng, kinh nghiệm) từ file PDF/Word tải lên (Resume Parsing).
- Chuyển đổi kiến trúc sang dạng Microservices nếu quy mô người dùng tăng mạnh hoặc các module như Workflow phức tạp hơn theo thời gian.

= Tài liệu tham khảo
1. Viettel Digital Talent, _Tài liệu định hướng kiến trúc dự án_.
2. Robert C. Martin, _Clean Architecture: A Craftsman's Guide to Software Structure and Design_.
3. Các tài liệu thiết kế và phân tích Hệ thống UmiCV (`architecture.md`, `vtit_cv_management_context_prompt.md`).
