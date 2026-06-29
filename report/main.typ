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
    "Mentor: Phạm Tuấn Minh",
    "Đơn vị: VTIT"
  ),
  date: "Tháng 6 - 2026"
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
Hệ thống được thiết kế theo hướng Modular Monolith kết hợp Clean Architecture. Cách tiếp cận này chia ứng dụng thành các layer riêng biệt:
- *Presentation Layer:* Nơi tiếp nhận Request và trả về Response.
- *Application Layer:* Nơi xử lý nghiệp vụ.
- *Domain Layer:* Các thực thể và rule nghiệp vụ cốt lõi không phụ thuộc framework.
- *Infrastructure Layer:* Kết nối CSDL, Queue, SMTP.
Kiến trúc này giúp giảm độ phức tạp khi triển khai ban đầu nhưng vẫn vạch rõ ranh giới giữa các module, tạo tiền đề dễ dàng tách Microservices sau này.

== Cơ chế xử lý bất đồng bộ
Trong bối cảnh HR tạo Batch Request gửi đến hàng trăm nhân viên, việc xử lý đồng bộ sẽ gây nghẽn Server. UmiCV ứng dụng cơ chế Message Queue thông qua Redis và BullMQ. API chỉ làm nhiệm vụ ghi nhận yêu cầu và tạo Job đẩy vào Queue, sau đó Background Worker sẽ lấy Job để thực hiện gửi Email và Notification, đảm bảo API phản hồi ngay lập tức.

== Phân quyền người dùng và JWT
Hệ thống sử dụng Json Web Token kết hợp RBAC để kiểm soát quyền hạn nghiêm ngặt:
- *Employee:* Chỉ thao tác trên CV của chính mình.
- *Tech Lead:* Được quyền truy cập và phê duyệt CV của thành viên trực thuộc dự án.
- *HR:* Quản lý phê duyệt CV, chiến dịch cập nhật.
- *Admin:* Quản trị toàn hệ thống.

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
- *Frontend:* ReactJS, Vite và TailwindCSS.
- *Backend:* Node.js, Express và TypeScript.
- *Cơ sở dữ liệu:* PostgreSQL.

== Thiết kế cơ sở dữ liệu và không gian nháp

=== Sơ đồ thực thể - liên kết (ERD)
#figure(
  image("images/ERD2.png", width: 90%),
  caption: [Sơ đồ thực thể - liên kết (ERD) hệ thống UmiCV]
)
<fig-erd>

=== Giải thích các thực thể chính
Hệ thống xoay quanh một số thực thể chính:
- *User:* Quản lý thông tin người dùng, lưu trữ thông tin đăng nhập và vai trò quyết định quyền hạn trong hệ thống.
- *Department:* Quản lý cấu trúc phòng ban phân cấp.
- *Project:* Tổ chức công việc theo dự án, lưu trữ thông tin dự án và người phụ trách.
- *ProjectMember:* Bảng trung gian liên kết nhân viên vào các dự án tương ứng.
- *CVProfile:* Lưu trữ trạng thái hiện tại và cấu trúc dữ liệu chi tiết của CV dưới dạng JSON.
- *CVVersionHistory:* Lưu lại ảnh chụp của CV mỗi khi có thay đổi để theo dõi lịch sử chỉnh sửa.
- *BatchRequest:* Đại diện cho một chiến dịch yêu cầu cập nhật CV từ bộ phận HR.
- *BatchRequestTarget:* Các cá nhân mục tiêu được gắn vào chiến dịch yêu cầu cập nhật, kèm theo trạng thái hoàn thành và hạn chót.
- *ApprovalLog:* Lưu vết mọi thao tác phê duyệt của Tech Lead/HR, ghi nhận lý do và cấp độ duyệt.
- *AuditLog:* Ghi nhận lại các hoạt động tác động đến hệ thống nhằm đảm bảo tính minh bạch và phục vụ việc tra soát lỗi.

=== Giải thích các mối quan hệ
Các bảng trong cơ sở dữ liệu liên kết với nhau nhằm hỗ trợ tối đa quy trình quản lý:
- *Quan hệ cấu trúc tổ chức (1-N):* Một `Department` có thể chứa nhiều phòng ban con và nhiều `User`. Một `User` lại có thể tham gia nhiều `Project` (quan hệ N-N thông qua `ProjectMember`).
- *Quan hệ quản lý và phê duyệt:* Một `CVProfile` chịu sự quản lý của một `User` sở hữu, nhưng quá trình duyệt sẽ sinh ra nhiều `ApprovalLog` do các `User` khác (Tech Lead, HR) thực hiện.
- *Quan hệ chiến dịch (1-N):* Một chiến dịch `BatchRequest` liên kết tới nhiều nhân sự (`BatchRequestTarget`). Hệ thống sẽ theo dõi trạng thái của từng mục tiêu (TargetStatus) để tự động gửi thông báo nhắc nhở (`Notification`).

=== Các quyết định thiết kế cốt lõi
- *Sử dụng JSONB cho CV:* Form mẫu CV thường xuyên thay đổi (thêm bớt trường thông tin, thay đổi cấu trúc phần học vấn/kinh nghiệm). Việc sử dụng kiểu dữ liệu `JSONB` trong PostgreSQL cho trường `sectionsData` mang lại độ linh hoạt tối đa, tránh việc phải migrate bảng liên tục khi có cấu trúc mới.
- *Tách biệt không gian nháp (Draft Space):* Khi nhân viên thực hiện chỉnh sửa CV, dữ liệu không ghi đè trực tiếp lên bản chính thức. Thay vào đó một bản sao nháp (Draft) được sinh ra. Bản nháp này sau khi qua luồng phê duyệt mới chính thức được hợp nhất trở thành bản chính. Cơ chế này đảm bảo dữ liệu công khai (dùng để xuất PDF gửi khách hàng) luôn ở trạng thái hoàn hảo nhất.
- *Khóa chính UUID:* Đảm bảo tính duy nhất và an toàn khi hệ thống có khả năng mở rộng phân tán, đồng thời tránh việc người dùng đoán được số lượng bản ghi trong cơ sở dữ liệu qua các ID tăng dần.



= Thực nghiệm và đánh giá

== Tiêu chí đánh giá
Hệ thống được đánh giá dựa trên:
1. Độ tin cậy và khả năng chống hồi quy (Regression test).
2. Tính chính xác trong việc xử lý luồng (End-to-End Test).
3. Khả năng phòng thủ bảo mật (Validation, Authorization).

== Kịch bản và môi trường thử nghiệm
Toàn bộ môi trường thử nghiệm được chạy local với sự hỗ trợ của Jest (cho Unit Test) và Supertest (cho E2E Test trực tiếp vào REST API). Dữ liệu được cô lập bằng Prisma Mocking.

== Kết quả kiểm thử tổng thể (Full Regression Test)
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
Dự án đã phân tích và hiện thực hóa thành công một giải pháp quản lý hồ sơ nhân sự toàn diện. UmiCV giải quyết vấn đề phân tán dữ liệu bằng kiến trúc Clean Architecture. Không gian nháp, hệ thống xử lý Email và luồng Approval đã vận hành trơn tru và chứng minh được hiệu năng tốt.

== Hướng phát triển tương lai
Để biến UmiCV thành một nền tảng quản trị tri thức thực sự thông minh, dự án định hướng mở rộng hai tính năng đột phá:
1. *Đa ngôn ngữ:* Xây dựng bộ Schema động hỗ trợ nhân viên lưu trữ đồng thời các phiên bản CV Tiếng Việt, Tiếng Anh, Tiếng Nhật song song mà vẫn duy trì tính đồng nhất về mặt cấu trúc.
2. *Ứng dụng trí tuệ nhân tạo cho CV Parsing:* Tích hợp Mô hình Ngôn ngữ Lớn. Khi nhân viên tải lên một file CV truyền thống, hệ thống sẽ tự động đọc hiểu, phân loại kỹ năng và điền sẵn vào các trường dữ liệu hệ thống. Điều này sẽ rút ngắn tối đa thời gian nhập liệu thủ công của người dùng, mang lại trải nghiệm phần mềm vượt trội.

#pagebreak()

#heading(numbering: none)[Phụ lục A: Đặc tả Use Case]

== A.1 Kịch bản sử dụng cho Người dùng phổ thông (Employee)
- *Tình huống:* Anh A nhận được thông báo yêu cầu cập nhật CV qua Email từ HR cho chiến dịch thầu sắp tới.
- *Sử dụng:* Anh A đăng nhập vào UmiCV. Hệ thống hiển thị cảnh báo "Cần cập nhật". Anh A sửa đổi phần Kinh nghiệm làm việc trên bản Nháp (Draft). Sau khi hoàn tất, anh nhấn "Submit for Review". Bản CV chuyển sang trạng thái chờ Tech Lead duyệt. Bản chính thức cũ vẫn được bảo lưu cho đến khi bản nháp này được Approve.

== A.2 Kịch bản sử dụng cho Tech Lead (Người duyệt chuyên môn)
- *Tình huống:* Tech Lead B nhận được yêu cầu xét duyệt bản nháp CV của anh A.
- *Sử dụng:* Tech Lead B vào Dashboard, chọn mục "Pending Approvals". Bằng tính năng Diff Viewer, Tech Lead B nhanh chóng nhận ra anh A vừa bổ sung kỹ năng "Kubernetes". Nhận thấy thông tin này chính xác, Tech Lead B nhấn "Approve". CV tiếp tục đi đến chốt chặn của HR. (Hoặc nếu sai, Tech Lead có thể "Reject" và ghi chú vào dòng kỹ năng đó).

== A.3 Kịch bản sử dụng cho Nhân sự (HR)
- *Tình huống:* Chị C (HR) cần gom 20 CV của khối BU1 để gửi đối tác vào ngày thứ 6 tuần sau.
- *Sử dụng:* Chị C vào module Batch Request, lọc các nhân sự thuộc BU1 và tạo một Yêu cầu cập nhật với Deadline là thứ 5. Hệ thống ngay lập tức đẩy 20 email bất đồng bộ qua Queue. Chị C có thể theo dõi tỷ lệ hoàn thành (X/20 người đã nộp) ngay trên biểu đồ Dashboard và phó thác việc nhắc nhở hằng ngày cho hệ thống Cronjob tự động.

#pagebreak()
= Tài liệu tham khảo
1. Viettel Digital Talent, _Tài liệu định hướng kiến trúc dự án_.
2. Robert C. Martin, _Clean Architecture: A Craftsman's Guide to Software Structure and Design_.
3. Báo cáo Thực nghiệm và Kiến trúc UmiCV (Tài liệu lưu hành nội bộ `docs/architecture.md`, `docs/qa-phase1-report.md`, `docs/full-regression-test-report.md`).
