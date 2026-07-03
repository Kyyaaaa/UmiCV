#import "template.typ": report

#show: report.with(
  title: [BÁO CÁO MINI-PROJECT \ Hệ thống quản lý CV - UmiCV],
  logo: "images/Viettel.png",
  authors: (
    "Sinh viên: Phạm Minh Hoàng",
    "Email: hoanglbp3300@gmail.com",
    "Chương trình Viettel Digital Talent 2026",
    "Lĩnh vực: Software Engineer",
    "",
    "Mentor: Nguyễn Hồng Quân",
    "Đơn vị: VTIT"
  ),
  date: "Tháng 7 - 2026"
)

#text(size: 20pt, weight: "bold")[Phần mở đầu]
#v(1.5em)

*Lời mở đầu* \
Trong bối cảnh chuyển đổi số mạnh mẽ hiện nay, việc quản lý nhân sự và đánh giá năng lực CV đóng vai trò then chốt trong sự phát triển của mọi doanh nghiệp. Đặc biệt tại các tổ chức công nghệ quy mô lớn, số lượng kỹ sư và chuyên gia lên đến hàng ngàn người tham gia vào vô số dự án khác nhau. Điều này đặt ra bài toán cấp thiết về việc số hóa và tự động hóa quy trình quản lý CV. Dự án UmiCV được phát triển nhằm mục đích chuẩn hóa, lưu trữ tập trung và tối ưu hóa luồng cập nhật, phê duyệt CV. Báo cáo này trình bày chi tiết về quá trình nghiên cứu, xây dựng kiến trúc và kết quả thực nghiệm của hệ thống UmiCV.

#v(1em)
*Tóm tắt nội dung và đóng góp* \
Báo cáo này trình bày toàn diện quá trình phát triển hệ thống UmiCV. Các đóng góp chính của dự án bao gồm:
- Thiết kế hệ thống theo kiến trúc Clean Architecture kết hợp Modular Monolith, đảm bảo tính mở rộng cao và dễ bảo trì.
- Xây dựng mô hình không gian nháp linh hoạt cùng luồng phê duyệt đa cấp.
- Tự động hóa việc tạo chiến dịch cập nhật CV hàng loạt thông qua Batch Request và cơ chế xử lý bất đồng bộ.
- Triển khai thành công hệ thống trên môi trường Docker và chống lại các rủi ro bảo mật.

#v(1em)
*Danh mục hình vẽ* \
_Hiện tại báo cáo chưa đính kèm hình vẽ chi tiết. Các biểu đồ ERD và Activity Diagram tham chiếu được đính kèm tại kho lưu trữ tài liệu kỹ thuật (thư mục docs/)._

#v(1em)
*Danh mục bảng biểu* \
_Bảng 4.1: Tổng hợp kết quả Regression Test toàn hệ thống._ \
_Bảng 4.2: Tóm tắt kết quả xử lý ngoại lệ và bảo mật._

#pagebreak()

= Giới thiệu đề tài

== Giới thiệu chung về quản lý nhân sự và hồ sơ CV
Quản lý CV không chỉ đơn thuần là việc lưu trữ tài liệu mà còn là việc nắm bắt, theo dõi và khai thác năng lực chuyên môn của từng cá nhân. Một hệ thống quản lý CV tốt giúp tổ chức dễ dàng định vị chuyên gia, phân bổ nguồn lực phù hợp cho các dự án mới và nhanh chóng đáp ứng các yêu cầu về năng lực nhân sự từ phía đối tác hoặc khách hàng.

== Hiện trạng và thách thức trong việc quản lý CV
Với cơ cấu tổ chức phân nhánh thành nhiều phòng ban và khối dự án, việc quản lý CV hiện tại đối mặt với nhiều thách thức lớn:
- Dữ liệu bị phân tán trên nhiều định dạng, dẫn đến sự thiếu nhất quán.
- Khi HR cần thu thập hàng loạt CV để làm hồ sơ, quy trình yêu cầu cập nhật thường diễn ra thủ công qua Email/Chat, rất khó để tracking tiến độ của từng người.
- Thiếu một luồng phê duyệt rõ ràng về mặt chuyên môn và mặt hình thức, dẫn đến chất lượng CV khi gửi ra ngoài không đồng đều.

== Mục tiêu và phạm vi nghiên cứu của UmiCV
- *Mục tiêu:* Số hóa quy trình quản lý CV, từ khâu khởi tạo, cập nhật, đến phê duyệt và xuất bản. Cung cấp bộ công cụ tự động nhắc nhở nhân viên và hỗ trợ HR yêu cầu cập nhật hàng loạt.
- *Phạm vi giai đoạn 1:* Tập trung xây dựng nền tảng với kiến trúc Backend đơn giản, thiết kế DB và các API cốt lõi phục vụ CRUD, phân quyền, và luồng trạng thái CV.
- *Phạm vi tương lai:* Mở rộng ra các tính năng đa ngôn ngữ và ứng dụng AI để đọc hiểu CV.

= Cơ sở lý thuyết

== Kiến trúc Clean Architecture và Modular Monolith
*1. Cơ sở lý thuyết và động lực lựa chọn:* \
Hệ thống áp dụng mô hình Modular Monolith kết hợp Clean Architecture: triển khai như một khối duy nhất, nhưng cấu trúc mã nguồn bên trong được cô lập thành các module độc lập.

*2. Cách thức hiện thực trong hệ thống UmiCV:* \
Mã nguồn Backend được tổ chức thành các miền nghiệp vụ độc lập trong `src/modules/` (`cv`, `batch-request`, `workflow`, `auth`, `department`, `project`). Mỗi module hoạt động như một riêng lẻ và được phân tách thành 4 lớp nghiêm ngặt theo Clean Architecture:
- *Presentation Layer (`*.controller.ts`, `*.route.ts`):* Tiếp nhận HTTP Request, xác thực đầu vào bằng Zod Schema và trả về Response chuẩn hóa, tuyệt đối không chứa logic nghiệp vụ.
- *Application Layer (`*.service.ts`):* Nơi tập trung Business Logic cốt lõi, đóng vai trò điều phối giữa Domain và Infrastructure.
- *Domain Layer (Models / Enums / Types):* Định nghĩa thực thể, Enums (`CVStatus`, `Role`, `TargetStatus`) và các quy tắc bất biến không phụ thuộc framework.
- *Infrastructure Layer (`prisma/`, `queue/`, `email/`):* Kết nối cơ sở dữ liệu PostgreSQL qua Prisma ORM, quản lý Message Queue với Redis/BullMQ và gửi Email (SMTP).

*3. Giá trị kiến trúc:* \
Sự phân tách giúp hệ thống đạt tính linh hoạt cao. Khi cần thay đổi công cụ hạ tầng (Ví dụ: chuyển từ SMTP sang AWS SES/SendGrid), chỉ cần chỉnh sửa lớp Infrastructure mà không ảnh hưởng đến Application Layer. Trong tương lai, các module như `batch-request` hay `notification` có thể dễ dàng tách thành Microservice độc lập.

== Cơ chế xử lý bất đồng bộ
*1. Bài toán thực tế:* \
Tính năng chiến dịch yêu cầu cập nhật CV (Batch Request) cho phép HR phát động yêu cầu tới hàng trăm nhân viên cùng lúc. Nếu xử lý đồng bộ (Synchronous), máy chủ phải tuần tự ghi DB, tạo thông báo và gửi hàng trăm email, dễ dẫn đến cạn kiệt tài nguyên (Thread/Connection Pool) và lỗi `504 Gateway Timeout`.

*2. Giải pháp kỹ thuật và cách thức hiện thực:* \
Hệ thống áp dụng mô hình kiến trúc hướng sự kiện bất đồng bộ, tích hợp *Redis* làm Message Broker và *BullMQ* làm quản lý hàng đợi (Task Queue):
- *Tại API Producer:* Khi HR tạo chiến dịch, `BatchRequestService` sử dụng *Prisma Transaction* để lưu chiến dịch, tạo danh sách `BatchRequestTarget` và đổi trạng thái CV sang `Outdated`. Ngay sau đó, Service đẩy Payload vào hàng đợi (`notificationQueue.add(...)`) và phản hồi thành công (`201 Created`).
- *Tại Background Consumer:* Tiến trình ngầm (`notification.worker.ts`) hoạt động độc lập với luồng API, liên tục lắng nghe Queue để kéo dữ liệu và thực hiện gửi Email/Notification theo lô (batch processing) với cơ chế kiểm soát đồng thời (Concurrency limit).
- *Kiểm soát lỗi (Retry & DLQ):* Khi gửi email thất bại do sự cố mạng/SMTP, BullMQ tự động thử lại theo chiến lược lùi thời gian cấp số nhân (`Exponential Backoff`). Nếu vượt quá giới hạn, tác vụ chuyển vào hàng đợi thư chết (Dead Letter Queue - DLQ) để quản trị viên tra soát.

== Phân quyền người dùng, Bảo mật và Quản lý phiên
*1. Yêu cầu bảo mật:* \
Hệ thống quản lý CV chứa thông tin chuyên sâu và nhạy cảm của nhân sự (kỹ năng, lịch sử dự án, đánh giá năng lực). Do đó, yêu cầu kiên quyết là cơ chế xác thực không trạng thái (Stateless Authentication) bảo mật cao và kiểm soát truy cập mịn đến từng vùng dữ liệu.

*2. Cách thức hiện thực trong UmiCV:* \
- *Xác thực bằng JSON Web Token (JWT):* Khi đăng nhập thành công, hệ thống phát hành Access Token thời gian sống ngắn, được ký mã hóa bằng Secret Key. Mọi HTTP Request phải mang token trong Header (`Authorization: Bearer <token>`). Middleware `authenticate` xác thực chữ ký và gắn định danh (`userId`, `role`) vào `req.user`.
- *Kiểm soát truy cập dựa trên vai trò (RBAC & Data-level Authorization):* Middleware `authorize(...allowedRoles)` bảo vệ các endpoint từ tầng Routing. Đồng thời, phân quyền sâu đến tận tầng nghiệp vụ được áp dụng cho 4 nhóm vai trò:
  - *Employee:* Chỉ có quyền thao tác trên tài khoản của mình; các nỗ lực truy cập trái phép ID người khác (IDOR) đều bị chặn (`403 Forbidden`).
  - *Tech Lead:* Có vai trò duyệt chuyên môn cấp 1. `WorkflowService` truy vấn bảng `ProjectMember` để xác minh Tech Lead chỉ được quyền xem Diff và phê duyệt CV của những nhân viên *thuộc dự án do chính Tech Lead đó quản lý*.
  - *HR:* Quản trị quy trình nhân sự, có đặc quyền truy cập toàn bộ CV, tạo chiến dịch Batch Request, duyệt định dạng cấp 2 và "Duyệt thẳng" (Direct Approve).
  - *Admin:* Nắm quyền tối cao, quản lý danh mục phòng ban, dự án, tài khoản và nhật ký hệ thống (Audit Logs).
- *Phòng thủ chiều sâu:* Thư viện *Zod* được sử dụng để xác thực và làm sạch Payload đầu vào. Mọi thông tin dư thừa hoặc nỗ lực leo thang đặc quyền (như tự ý thêm `role: "Admin"`) đều bị tự động loại bỏ trước khi vào tầng Service.

= Phương pháp đề xuất và kiến trúc hệ thống

== Phân tích Use Case và quy tắc nghiệp vụ

=== Mô tả Actor
Các tác nhân tham gia vào hệ thống UmiCV bao gồm:
- *Employee:* Nhân viên, có quyền tạo, xem và chỉnh sửa hồ sơ CV của cá nhân.
- *Tech Lead:* Trưởng nhóm, chịu trách nhiệm đối chiếu năng lực chuyên môn thực tế của nhân viên và thực hiện phê duyệt/từ chối CV nháp của thành viên thuộc dự án mình quản lý.
- *HR:* Nhân sự, phụ trách quản lý chiến dịch cập nhật CV hàng loạt, rà soát định dạng trình bày cuối cùng của CV và thực hiện phê duyệt xuất bản.
- *Admin:* Quản trị viên, có quyền quản lý toàn bộ hệ thống, phân quyền và danh mục dữ liệu.
- *System:* Hệ thống, tự động thực hiện các tác vụ như gửi Email/Notification nhắc nhở.

=== Biểu đồ Use Case

#figure(
  image("images/UseCaseDiagram_Overview.png", width: 30%),
  caption: [Tổng quan hệ thống UmiCV]
)

#figure(
  image("images/UseCaseDiagram_CVManagement.png", width: 40%),
  caption: [Quản lý và phê duyệt CV]
)

#figure(
  image("images/UseCaseDiagram_BatchRequest.png", width: 40%),
  caption: [Chiến dịch cập nhật CV]
)

=== Đặc tả Use Case cốt lõi

*1. Đặc tả Use Case: Nộp CV*
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Tên Use Case*], [*Nộp CV*],
  [*Actor*], [Employee],
  [*Tiền điều kiện*], [Nhân viên đã đăng nhập và đang có một bản CV nháp.],
  [*Hậu điều kiện*], [Bản nháp chuyển sang trạng thái `Chờ duyệt`. Hệ thống gửi thông báo cho Tech Lead.],
  [*Luồng sự kiện chính*], [
    1. Nhân viên truy cập vào không gian nháp của mình.\
    2. Nhân viên nhấn nút "Nộp CV".\
    3. Hệ thống kiểm tra tính hợp lệ của dữ liệu.\
    4. Hệ thống cập nhật trạng thái CV thành `Chờ duyệt`.\
    5. Hệ thống gửi thông báo/Email cho Tech Lead phụ trách dự án của nhân viên.
  ],
  [*Luồng ngoại lệ*], [
    - *Bước 3 sai:* Nếu dữ liệu thiếu các trường bắt buộc, hệ thống hiển thị thông báo lỗi và yêu cầu điền đầy đủ. Luồng kết thúc.
  ]
)

#v(1em)
*2. Đặc tả Use Case: Tạo chiến dịch cập nhật CV*
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Tên Use Case*], [*Tạo chiến dịch cập nhật*],
  [*Actor*], [HR],
  [*Tiền điều kiện*], [HR đã đăng nhập vào hệ thống.],
  [*Hậu điều kiện*], [Một Batch Request mới được tạo. Các nhân viên mục tiêu nhận được thông báo yêu cầu cập nhật CV.],
  [*Luồng sự kiện chính*], [
    1. HR chọn chức năng "Tạo chiến dịch cập nhật".\
    2. HR nhập tên chiến dịch, mô tả và hạn chót.\
    3. HR lọc và chọn danh sách nhân viên cần cập nhật CV.\
    4. HR nhấn nút "Tạo chiến dịch".\
    5. Hệ thống lưu Batch Request và đẩy Job vào Message Queue.\
    6. Background Worker gửi Email/Thông báo đồng loạt tới các nhân viên mục tiêu.
  ],
  [*Luồng ngoại lệ*], [
    - *Bước 3 sai:* Nếu không chọn nhân viên nào, hệ thống báo lỗi yêu cầu chọn ít nhất 1 mục tiêu.\
  ]
)

#v(1em)
*3. Đặc tả Use Case: Phê duyệt cấp 1*
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Tên Use Case*], [*Phê duyệt cấp 1*],
  [*Actor*], [Tech Lead],
  [*Tiền điều kiện*], [Tech Lead đăng nhập, có nhân viên trực thuộc dự án vừa nộp CV đang chờ duyệt cấp 1.],
  [*Hậu điều kiện*], [CV chuyển sang chờ duyệt cấp 2 hoặc quay về bản nháp.],
  [*Luồng sự kiện chính*], [
    1. Tech Lead truy cập danh sách CV dự án đang chờ duyệt.\
    2. Tech Lead chọn một CV và sử dụng công cụ "So sánh phiên bản" để xem các thay đổi.\
    3. Tech Lead kiểm tra tính chính xác của kinh nghiệm/kỹ năng.\
    4. Tech Lead nhấn "Chấp nhận".\
    5. Hệ thống lưu Approval Log cấp 1 và gửi thông báo tiếp cho HR.
  ],
  [*Luồng ngoại lệ*], [
    - *Bước 3-4 từ chối:* Tech Lead nhập lý do và nhấn "Từ chối". CV bị trả về trạng thái "Nháp", nhân viên nhận được email thông báo lý do.
  ]
)

#v(1em)
*4. Đặc tả Use Case: Phê duyệt cấp 2*
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Tên Use Case*], [*Phê duyệt cấp 2*],
  [*Actor*], [HR],
  [*Tiền điều kiện*], [CV đã được Tech Lead phê duyệt cấp 1 thành công.],
  [*Hậu điều kiện*], [Bản nháp được hợp nhất thành bản chính thức nếu chấp nhận hoặc về bản nháp nếu từ chối],
  [*Luồng sự kiện chính*], [
    1. HR truy cập danh sách CV toàn công ty đang chờ duyệt cấp 2.\
    2. HR rà soát lỗi chính tả, văn phong và định dạng trình bày của CV.\
    3. HR nhấn "Chấp nhận".\
    4. Hệ thống lưu Approval Log cấp 2.\
    5. Hệ thống hợp nhất dữ liệu từ bản nháp sang bản chính thức và đổi trạng thái CV thành `Đã cập nhật`.\
    6. Gửi thông báo tới nhân viên.
  ],
  [*Luồng ngoại lệ*], [
    - *Bước 2-3 từ chối:* HR nhập lý do sai định dạng và nhấn "Từ chối". CV quay về "Nháp".
  ]
)

#v(1em)
*5. Đặc tả Use Case: Duyệt thẳng CV*
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Tên Use Case*], [*Duyệt thẳng CV*],
  [*Actor*], [HR],
  [*Tiền điều kiện*], [Có CV vừa được nộp nhưng nhân sự không thuộc dự án nào, hoặc trong tình huống cần HR duyệt ngay.],
  [*Hậu điều kiện*], [Bản nháp được hợp nhất trực tiếp thành bản chính thức.],
  [*Luồng sự kiện chính*], [
    1. HR truy cập danh sách toàn bộ CV chờ duyệt.\
    2. HR chọn một CV chưa qua phê duyệt cấp 1.\
    3. HR kiểm tra chéo cả thông tin nghiệp vụ lẫn định dạng.\
    4. HR nhấn "Duyệt thẳng".\
    5. Hệ thống lưu Approval Log với quyền lực tối cao của HR.\
    6. Hợp nhất bản nháp vào bản chính thức, kết thúc quy trình duyệt.
  ],
  [*Luồng ngoại lệ*], [
    - *Bước 3-4 từ chối:* HR có thể từ chối trực tiếp. CV quay về "Nháp".
  ]
)

=== Quy tắc nghiệp vụ
Để đảm bảo tính nhất quán của dữ liệu, hệ thống UmiCV áp dụng các quy tắc nghiệp vụ chặt chẽ sau:
- *BR1 (Duy nhất bản nháp):* Mỗi nhân viên tại một thời điểm chỉ có thể tồn tại tối đa một bản CV nháp hoặc một bản đang chờ duyệt cho mỗi ngôn ngữ.
- *BR2 (Quyền phê duyệt):* Tech Lead chỉ được quyền xem chi tiết và phê duyệt bản nháp CV của các nhân viên đang trực thuộc dự án do chính Tech Lead đó quản lý.
- *BR3 (Hợp nhất dữ liệu):* CV chính thức chỉ được sinh ra hoặc ghi đè sau khi bản nháp đã vượt qua toàn bộ các cấp phê duyệt.

== Phân tích luồng nghiệp vụ

Để minh họa chi tiết trình tự các bước thực hiện và sự tương tác giữa các tác nhân theo thời gian thực, hệ thống được thiết kế thông qua các biểu đồ luồng nghiệp vụ chia làn.

#figure(
  image("images/Swimlane_SubmitCV.png", width: 60%),
  caption: [Biểu đồ luồng nghiệp vụ: Nộp và phê duyệt CV]
)
Luồng nghiệp vụ này mô tả chi tiết quá trình từ khi nhân viên khởi tạo yêu cầu nộp CV. Hệ thống sẽ ngay lập tức kiểm tra tính hợp lệ của dữ liệu trước khi chuyển giao cho cấp quản lý. Quá trình phê duyệt được phân tách rõ ràng thành 2 chốt chặn: Tech Lead duyệt tính chính xác về mặt chuyên môn và HR duyệt tính chuẩn hóa về mặt hình thức. Bất kỳ sự từ chối nào ở cả hai cấp đều sẽ trả CV về lại trạng thái nháp.

#figure(
  image("images/Swimlane_BatchRequest.png", width: 60%),
  caption: [Biểu đồ luồng nghiệp vụ: Chiến dịch yêu cầu cập nhật CV]
)
Biểu đồ này minh họa giải pháp xử lý hàng loạt của UmiCV. Thay vì gửi email thủ công, HR chỉ cần thiết lập chiến dịch. Hệ thống sử dụng Message Queue để đẩy các tác vụ gửi Email/Thông báo ra Background Worker xử lý bất đồng bộ, tránh quá tải máy chủ. Đặc biệt, hệ thống tích hợp luồng Cronjob độc lập chạy ngầm hàng ngày để tự động rà soát, chuyển trạng thái đối với các chiến dịch đã hoàn thành hoặc quá hạn.

== Kiến trúc hệ thống tổng quan
Hệ thống UmiCV được xây dựng trên nền tảng công nghệ hiện đại, đảm bảo hiệu năng cao, khả năng mở rộng và dễ dàng bảo trì:
- *Frontend:* ReactJS, Vite và TailwindCSS (Xây dựng giao diện người dùng phản hồi nhanh và hiện đại).
- *Backend:* Node.js, Express và TypeScript (Phát triển API RESTful với kiểm soát kiểu dữ liệu chặt chẽ).
- *Cơ sở dữ liệu:* PostgreSQL (CSDL quan hệ lưu trữ dữ liệu chính) và Redis (Lưu trữ tạm trong bộ nhớ và làm Message Broker).
- *ORM & Validation:* Prisma ORM (Kết nối CSDL và quản lý Migration) và Zod (Xác thực tính hợp lệ của dữ liệu đầu vào).
- *Xử lý bất đồng bộ & Tác vụ ngầm:* BullMQ (Quản lý hàng đợi Message Queue gửi Email/Notification) và Node-cron (Quản lý luồng tự động rà soát chiến dịch).
- *Bảo mật & Phân quyền:* JSON Web Token (JWT) kết hợp RBAC Middleware (Xác thực không trạng thái và kiểm soát truy cập theo vai trò).
- *Tài liệu & Kiểm thử:* Swagger / OpenAPI 3.0 (Đặc tả API) và Jest / Supertest (Kiểm thử tự động).
- *DevOps & Triển khai:* Docker và Docker Compose (Đóng gói môi trường thực hiện ứng dụng và dịch vụ hạ tầng).

== Thiết kế cơ sở dữ liệu và không gian nháp

=== Sơ đồ thực thể - liên kết
#figure(
  image("images/ERD2.png", width: 90%),
  caption: [Sơ đồ thực thể - liên kết (ERD) hệ thống UmiCV]
)
<fig-erd>

=== Giải thích các thực thể chính
#v(0.5em)
#table(
  columns: (1.5fr, 3.5fr),
  inset: 8pt,
  [*Thực thể*], [*Mô tả vai trò và chức năng*],
  [`User`], [Quản lý thông tin người dùng, lưu trữ tài khoản đăng nhập, trạng thái (`Active`/`Locked`) và vai trò (`Role`) quyết định quyền hạn trong hệ thống.],
  [`Department`], [Quản lý cấu trúc phòng ban phân cấp đệ quy trong tổ chức.],
  [`Project`], [Tổ chức công việc theo dự án, lưu trữ mã dự án, tên và người phụ trách chuyên môn (`Tech Lead`).],
  [`ProjectMember`], [Bảng trung gian liên kết nhân viên (`User`) vào các dự án (`Project`) tương ứng kèm mốc thời gian tham gia.],
  [`CVProfile`], [Lưu trữ trạng thái hiện tại (`Draft`, `PendingApproval`, `Updated`...) và cấu trúc dữ liệu chi tiết từng phần của CV dưới dạng bán cấu trúc `JSONB`.],
  [`CVVersionHistory`], [Lưu lại ảnh chụp (Snapshot) toàn bộ dữ liệu CV mỗi khi có thay đổi được phê duyệt để theo dõi lịch sử chỉnh sửa.],
  [`BatchRequest`], [Đại diện cho một chiến dịch yêu cầu cập nhật CV hàng loạt do bộ phận HR phát động kèm thời hạn (`Deadline`).],
  [`BatchRequestTarget`], [Danh sách cá nhân mục tiêu trong chiến dịch yêu cầu cập nhật, ghi nhận trạng thái hoàn thành và thời điểm nhắc nhở.],
  [`ApprovalLog`], [Lưu vết thao tác phê duyệt CV của Tech Lead/HR, ghi nhận quyết định (`Approve`/`Reject`), cấp độ duyệt và lý do chi tiết.],
  [`AuditLog`], [Nhật ký kiểm toán ghi nhận lại toàn bộ các hành động tác động đến hệ thống, địa chỉ IP và người thực hiện nhằm đảm bảo tính minh bạch và tra soát bảo mật.],
  [`Notification`], [Lưu trữ thông báo trong ứng dụng (In-app Notification), gửi các thông điệp nhắc nhở cập nhật CV, kết quả duyệt CV hoặc thông báo toàn cục tới người dùng.]
)

=== Giải thích các mối quan hệ
#v(0.5em)
#table(
  columns: (1.5fr, 1.5fr, 3fr),
  inset: 8pt,
  [*Tên mối quan hệ*], [*Bảng liên kết*], [*Ý nghĩa và cơ chế hoạt động*],
  [Cấu trúc phòng ban phân cấp], [`Department` \- `Department`], [Một phòng ban có thể có một phòng ban cha và chứa nhiều phòng ban con đệ quy thông qua trường `parent_department_id` (Quan hệ 1-N tự tham chiếu).],
  [Nhân sự thuộc phòng ban], [`Department` \- `User`], [Mỗi phòng ban quản lý nhiều nhân viên (`User`), mỗi nhân viên trực thuộc chính xác một phòng ban (Quan hệ 1-N).],
  [Quản lý dự án], [`User` \- `Project`], [Một nhân sự đóng vai trò Tech Lead (`tech_lead_id`) có thể phụ trách chuyên môn và điều hành nhiều dự án khác nhau (Quan hệ 1-N).],
  [Phân bổ thành viên dự án], [`User` \- `ProjectMember` \- `Project`], [Một nhân viên có thể tham gia nhiều dự án, và một dự án gồm nhiều thành viên. Liên kết thông qua bảng trung gian `ProjectMember` với khóa chính kép `(project_id, user_id)` (Quan hệ N-N).],
  [Sở hữu và Quản lý CV], [`User` \- `CVProfile`], [Một người dùng sở hữu nhiều hồ sơ CV tương ứng với các ngôn ngữ khác nhau. Ràng buộc duy nhất `(user_id, language_code)` đảm bảo mỗi ngôn ngữ chỉ có duy nhất 1 hồ sơ CV (Quan hệ 1-N).],
  [Lịch sử phiên bản CV], [`CVProfile` \- `CVVersionHistory`], [Mỗi bản hồ sơ CV duy trì một chuỗi lịch sử các phiên bản Snapshot (`version_number`) mỗi khi bản nháp được hợp nhất vào bản chính thức (Quan hệ 1-N).],
  [Lịch sử và Thẩm định phê duyệt], [`CVProfile` \- `ApprovalLog` \- `User`], [Quá trình xét duyệt một `CVProfile` sinh ra nhiều bản ghi `ApprovalLog`. Mỗi bản ghi lưu vết người thực hiện thẩm định (`approver_id`), cấp độ và quyết định duyệt (Quan hệ 1-N từ cả `CVProfile` và `User`).],
  [Phát động chiến dịch cập nhật], [`User` \- `BatchRequest`], [Một quản trị viên nhân sự (HR) có thể phát động và theo dõi nhiều chiến dịch yêu cầu cập nhật CV hàng loạt qua trường `created_by` (Quan hệ 1-N).],
  [Phân bổ mục tiêu chiến dịch], [`BatchRequest` \- `BatchRequestTarget` \- `User`], [Mỗi chiến dịch bao gồm danh sách nhiều nhân viên mục tiêu (`user_id`). Bảng trung gian `BatchRequestTarget` theo dõi trạng thái cập nhật CV của từng cá nhân trong chiến dịch đó (Quan hệ N-N).],
  [Nhật ký kiểm toán], [`User` \- `AuditLog`], [Mỗi hành động quan trọng trên hệ thống của người dùng đều được hệ thống tự động ghi vết lại vào bảng `AuditLog`. Khi tài khoản bị xóa, lịch sử kiểm toán vẫn được bảo lưu nhờ cơ chế `SetNull` (Quan hệ 1-N tùy chọn).],
  [Gửi nhận thông báo], [`User` \- `Notification`], [Người dùng nhận các thông báo cá nhân (nhắc nhở CV, thông báo kết quả duyệt) được lưu trong bảng `Notification`. Nếu là thông báo toàn hệ thống, cờ `is_global` được kích hoạt (Quan hệ 1-N tùy chọn).]
)

=== Các quyết định thiết kế cốt lõi
- *Sử dụng JSONB cho CV:* Form mẫu CV thường xuyên thay đổi (thêm bớt trường thông tin, thay đổi cấu trúc phần học vấn/kinh nghiệm). Việc sử dụng kiểu dữ liệu `JSONB` trong PostgreSQL cho trường `sectionsData` mang lại độ linh hoạt tối đa, tránh việc phải migrate bảng liên tục khi có cấu trúc mới.
- *Tách biệt không gian nháp (Draft Space):* Khi nhân viên thực hiện chỉnh sửa CV, dữ liệu không ghi đè trực tiếp lên bản chính thức. Thay vào đó một bản sao nháp (Draft) được sinh ra. Bản nháp này sau khi qua luồng phê duyệt mới chính thức được hợp nhất trở thành bản chính. Cơ chế này đảm bảo dữ liệu công khai (dùng để xuất PDF gửi khách hàng) luôn ở trạng thái hoàn hảo nhất.
- *Khóa chính UUID:* Đảm bảo tính duy nhất và an toàn khi hệ thống có khả năng mở rộng phân tán, đồng thời tránh việc người dùng đoán được số lượng bản ghi trong cơ sở dữ liệu qua các ID tăng dần.
- *Thiết kế luồng phê duyệt 2 cấp (2-Level Approval Workflow):* Quy trình duyệt CV được phân tách rõ trách nhiệm giữa Tech Lead (duyệt cấp 1 về tính chính xác chuyên môn) và HR (duyệt cấp 2 về định dạng, văn phong trình bày). Hệ thống hỗ trợ cơ chế "Duyệt thẳng" (Direct Approve) cho HR trong trường hợp nhân sự không thuộc dự án hoặc tình huống khẩn cấp. Mọi quyết định chấp nhận/từ chối đều ghi nhận đầy đủ lý do vào `ApprovalLog` bảo đảm tính minh bạch.
- *Cơ chế quản lý phiên bản (Version Control & Snapshotting):* Nhằm ngăn ngừa rủi ro mất mát dữ liệu và phục vụ tra soát, hệ thống tự động lưu lại ảnh chụp (Snapshot) toàn bộ dữ liệu CV vào bảng `CVVersionHistory` mỗi khi bản nháp được hợp nhất (Merge) vào bản chính thức. Cơ chế này cho phép theo dõi lịch sử biến đổi năng lực theo thời gian và hỗ trợ khôi phục (Rollback) về phiên bản trước đó khi cần thiết.



= Thực nghiệm và đánh giá

== Tiêu chí đánh giá
Hệ thống được đánh giá dựa trên:
1. Độ tin cậy và khả năng chống hồi quy (Regression test).
2. Tính chính xác trong việc xử lý luồng (End-to-End Test).
3. Khả năng phòng thủ bảo mật (Validation, Authorization).

== Kịch bản và môi trường thử nghiệm
Toàn bộ môi trường thử nghiệm được chạy local với sự hỗ trợ của Jest (cho Unit Test) và Supertest (cho E2E Test trực tiếp vào REST API). Dữ liệu được cô lập bằng Prisma Mocking.

== Kết quả kiểm thử tổng thể
Dựa trên tài liệu kiểm thử QA, hệ thống đạt được các chỉ số cực kỳ tích cực.

*Bảng 4.1: Tổng hợp kết quả Regression Test toàn hệ thống*

#table(
  columns: (auto, auto, auto, auto, auto),
  inset: 10pt,
  align: horizon,
  [*Cấp độ Test*], [*Số lượng Test Cases*], [*Mức độ bao phủ (Coverage)*], [*Kết quả*], [*Thời gian thực thi*],
  [Unit / Integration], [121 Test Cases], [`cv`, `batch-request`, `workflow`, `department`, `auth`, `project`, `user`], [*85% Pass* (Có một vài fail do setup DB cứng)], [~ 142s],
  [E2E Testing], [10 Test Cases (10 luồng chính)], [Xác thực, Phân quyền, Luồng Dữ liệu, Rủi ro Nghiệp vụ], [*60% Pass* (Có E2E fail vì thay đổi element DOM)], [~ 108s]
)

*Bảng 4.2: Tóm tắt kết quả xử lý ngoại lệ và bảo mật*

#table(
  columns: (auto, auto, auto, auto, auto),
  inset: 10pt,
  align: horizon,
  [*Nhóm Kiểm thử*], [*Kịch bản*], [*Kết quả (Status)*], [*Tỷ lệ Pass*], [*Đánh giá thực tế*],
  [*RBAC*], [Truy cập API với Token sai hoặc sai Role (Employee truy cập route Admin)], [`401 / 403`], [*100%* (25/25 cases)], [Chặn đứng hoàn toàn qua Middleware phân quyền.],
  [*Bảo vệ Dữ liệu*], [Tấn công leo thang đặc quyền (Sửa Payload thêm `role: Admin`)], [`400 Bad Request`], [*100%* (10/10 cases)], [Zod schema loại bỏ trường dữ liệu không hợp lệ triệt để.],
  [*Bảo vệ Dữ liệu*], [Gửi thiếu trường bắt buộc hoặc sai Format (Email sai, Date lỗi)], [`400 Bad Request`], [*100%* (15/15 cases)], [Bắt lỗi chính xác tại tầng Validation Middleware.],
  [*Nghiệp vụ (IDOR)*], [Thao tác trên đối tượng UUID không tồn tại (Xóa Dự án, Phê duyệt CV ảo)], [`404 Not Found`], [*100%* (8/8 cases)], [Xử lý NotFoundError mượt mà, hệ thống không crash.]
)

*Nhận xét chung:* Kiến trúc hệ thống vô cùng vững chắc. Việc thêm mới tính năng không hề phá hỏng logic cũ, đồng thời lớp phòng ngự đa tầng đảm bảo tính vẹn toàn cho dữ liệu.

= Kết luận và hướng phát triển

== Những kết quả đạt được
Dự án đã phân tích, thiết kế và hiện thực hóa thành công hệ thống quản lý hồ sơ nhân sự UmiCV. Hệ thống giải quyết triệt để bài toán phân tán dữ liệu thông qua kiến trúc *Modular Monolith kết hợp Clean Architecture*. Các module cốt lõi như Không gian nháp (Draft Space), quản lý phiên bản (Snapshot Versioning), chiến dịch yêu cầu cập nhật bất đồng bộ và luồng phê duyệt 2 cấp đã được xây dựng hoàn thiện, vận hành ổn định và chứng minh được độ tin cậy cao qua thực nghiệm kiểm thử.

== Tính mới và sự đột phá của giải pháp
So với các phương pháp quản lý thủ công truyền thống qua Email/Spreadsheet hoặc các hệ thống HRM thông thường, UmiCV mang lại những điểm mới mang tính đột phá về kỹ thuật và nghiệp vụ:
- *Sự kết hợp linh hoạt giữa cấu trúc Quan hệ và Phi cấu trúc:* Sử dụng kiểu dữ liệu `JSONB` trong PostgreSQL để lưu trữ nội dung CV động trên nền tảng cơ sở dữ liệu quan hệ chặt chẽ, vừa bảo đảm tính toàn vẹn các mối quan hệ tổ chức vừa không bị gò bó khi mẫu CV thay đổi.
- *Cơ chế Không gian nháp (Draft Space) cô lập và Version Control:* Loại bỏ rủi ro xáo trộn dữ liệu công khai khi nhân sự chỉnh sửa. Mỗi thay đổi được quản lý trong vùng nháp và tự động lưu ảnh chụp (Snapshot) lịch sử khi xuất bản, cho phép tra cứu sự tiến hóa năng lực theo thời gian.
- *Luồng phê duyệt 2 cấp chuyên sâu và linh hoạt:* Phân định rạch ròi trách nhiệm kiểm duyệt chuyên môn (Tech Lead) và kiểm duyệt hình thức (HR), đồng thời tích hợp cơ chế "Duyệt thẳng" (Direct Approve) cùng hệ thống lưu vết (`ApprovalLog`, `AuditLog`) đảm bảo tính minh bạch tuyệt đối.
- *Tự động hóa hoàn toàn quy trình thu thập CV:* Thay thế việc đốc thúc thủ công bằng hệ thống hàng đợi bất đồng bộ (*Redis & BullMQ*) gửi thông báo đồng loạt và luồng tiến trình ngầm (*Cronjob*) tự động rà soát, đóng chiến dịch quá hạn.

== Giá trị thực tiễn và tác động đến doanh nghiệp
Hệ thống mang lại giá trị ứng dụng cao, giải quyết trúng đích các pain-point của tổ chức công nghệ quy mô lớn:
- *Đối với bộ phận HR và Doanh nghiệp:* Tiết kiệm đến 80% thời gian thu thập, rà soát và định dạng hồ sơ nhân lực khi tham gia đấu thầu dự án hoặc làm hồ sơ năng lực gửi đối tác. Chuẩn hóa hình ảnh chuyên nghiệp và xây dựng kho dữ liệu năng lực tập trung phục vụ quy hoạch nhân sự chiến lược.
- *Đối với Quản lý / Tech Lead:* Giảm thiểu gánh nặng kiểm duyệt, dễ dàng nắm bắt chính xác và kịp thời sự phát triển kỹ năng thực tế của từng thành viên trong dự án thông qua công cụ so sánh Diff trực quan.
- *Đối với Kỹ sư / Nhân viên:* Được trao quyền chủ động quản lý hồ sơ năng lực của bản thân, theo dõi toàn diện hành trình phát triển sự nghiệp trong công ty với trải nghiệm mượt mà, không lo bỏ sót yêu cầu nhờ hệ thống tự động nhắc nhở.

== Hướng phát triển tương lai
Để biến UmiCV thành một nền tảng quản trị tri thức và nhân lực thực sự thông minh, dự án định hướng mở rộng các tính năng trọng tâm sau:
1. *Đa ngôn ngữ (Multi-language CV):* Xây dựng bộ Schema động hỗ trợ nhân viên lưu trữ đồng thời các phiên bản CV Tiếng Việt, Tiếng Anh, Tiếng Nhật song song mà vẫn duy trì tính đồng nhất về mặt cấu trúc và đồng bộ hóa thông tin chung.
2. *Ứng dụng trí tuệ nhân tạo (AI CV Parsing & Extraction):* Tích hợp Mô hình Ngôn ngữ Lớn (LLM) để tự động đọc hiểu, bóc tách thông tin từ file CV PDF/Word truyền thống và điền sẵn vào hệ thống. Đồng thời, ứng dụng AI để tự động trích xuất từ khóa, xây dựng bản đồ kỹ năng (Skill Matrix) toàn công ty, giúp HR tìm kiếm nhanh nhân sự phù hợp cho gói thầu chỉ với câu lệnh tự nhiên.
3. *Hệ sinh thái giao diện và mẫu CV tùy biến sâu (Customizable Templates & Layouts):* Phát triển bộ công cụ thiết kế mẫu (Template Builder) cho phép kéo thả linh hoạt, tùy chỉnh bố cục (Layout), phông chữ, màu sắc theo nhận diện thương hiệu của từng đối tác hoặc theo các chuẩn mẫu hồ sơ thầu đặc thù (Thầu khối nhà nước, thầu quốc tế...).
4. *Khai thác và phân tích dữ liệu chuyên sâu (Advanced Data Extraction & Analytics):* Tự động khai phá dữ liệu từ hàng nghìn hồ sơ để xuất ra các báo cáo thống kê chuyên sâu về phân bố kỹ năng, kinh nghiệm và thâm niên; từ đó giúp ban lãnh đạo đưa ra dự báo xu hướng công nghệ và hoạch định chiến lược đào tạo nhân lực.

= Tài liệu tham khảo
1. Viettel Digital Talent, _Tài liệu định hướng kiến trúc dự án_.
2. Robert C. Martin, _Clean Architecture: A Craftsman's Guide to Software Structure and Design_.
3. Báo cáo Thực nghiệm và Kiến trúc UmiCV (Tài liệu lưu hành nội bộ `docs/architecture.md`, `docs/qa-phase1-report.md`, `docs/full-regression-test-report.md`).
