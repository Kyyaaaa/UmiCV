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
Trong bối cảnh chuyển đổi số mạnh mẽ hiện nay, việc quản lý nhân sự và đánh giá năng lực CV đóng vai trò then chốt trong sự phát triển của mọi doanh nghiệp. Đặc biệt tại các tổ chức công nghệ quy mô lớn, số lượng kỹ sư và chuyên gia lên đến hàng ngàn người tham gia vào vô số dự án khác nhau. Điều này đặt ra bài toán cấp thiết về việc số hóa và tự động hóa quy trình quản lý CV. Dự án UmiCV được phát triển nhằm mục đích chuẩn hóa, lưu trữ tập trung và tối ưu hóa luồng cập nhật, phê duyệt CV. Báo cáo này trình bày chi tiết về quá trình nghiên cứu, xây dựng kiến trúc và kết quả thực nghiệm của hệ thống UmiCV.

#v(1em)
*Tóm tắt nội dung và đóng góp* \
Báo cáo này trình bày toàn diện quá trình phát triển hệ thống UmiCV. Các đóng góp chính của dự án bao gồm:
- Thiết kế hệ thống theo kiến trúc Clean Architecture kết hợp Modular Monolith, đảm bảo tính mở rộng cao và dễ bảo trì.
- Xây dựng mô hình không gian nháp linh hoạt cùng luồng phê duyệt đa cấp.
- Tự động hóa quy trình thu thập CV hàng loạt thông qua Batch Request và cơ chế xử lý bất đồng bộ.
- Triển khai thành công hệ thống trên môi trường Docker và chống lại các rủi ro bảo mật.

#v(1em)
*Danh mục hình vẽ* \
_Hiện tại báo cáo chưa đính kèm hình vẽ chi tiết. Các biểu đồ ERD và Activity Diagram tham chiếu được đính kèm tại kho lưu trữ tài liệu kỹ thuật (thư mục docs/)._

#image("images/ERD.png", width: 100%)

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
- Khi HR cần thu thập hàng loạt CV để làm hồ sơ, quy trình yêu cầu cập nhật diễn ra thủ công qua Email/Chat, rất khó để tracking tiến độ của từng người.
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

== Kiến trúc hệ thống tổng quan
- *Frontend:* Xây dựng bằng ReactJS, Vite và TailwindCSS.
- *Backend:* Node.js, Express và TypeScript.
- *Cơ sở dữ liệu:* PostgreSQL, sử dụng trường JSONB để lưu trữ nội dung CV động.

== Thiết kế cơ sở dữ liệu và không gian nháp
Khi nhân viên thực hiện chỉnh sửa CV, dữ liệu không ghi đè trực tiếp lên bản chính thức. Thay vào đó một bản sao nháp được sinh ra. Bản nháp này sau khi qua luồng phê duyệt mới chính thức được hợp nhất trở thành bản chính. Cơ chế này đảm bảo dữ liệu công khai luôn ở trạng thái hoàn hảo nhất.

== Quy trình yêu cầu cập nhật hàng loạt
Khi có dự án thầu, HR có thể gom một danh sách nhân viên để tạo chiến dịch cập nhật CV kèm theo Deadline. Ngay khi chiến dịch kích hoạt, trạng thái CV những người trong chiến dịch sẽ bị đánh dấu là `Chưa cập nhật` và hệ thống Cronjob sẽ tự động rà quét hằng ngày để gửi tin báo nhắc nhở tới những ai sắp quá hạn.

== Luồng phê duyệt đa cấp
Luồng phê duyệt được thiết kế chặt chẽ qua 3 bước:
1. *Employee:* Chỉnh sửa và nộp bản Draft.
2. *Tech Lead:* Kiểm duyệt sâu về mặt năng lực chuyên môn, skill set. Có quyền Approve để đẩy lên cấp tiếp theo hoặc Reject kèm lý do cụ thể.
3. *HR:* Kiểm tra lần cuối về format, chính tả trước khi chuyển sang trạng thái `Đã cập nhật`.

= Thực nghiệm và Đánh giá

== Tiêu chí Đánh giá
Hệ thống được đánh giá dựa trên:
1. Độ tin cậy và khả năng chống hồi quy (Regression test).
2. Tính chính xác trong việc xử lý luồng (End-to-End Test).
3. Khả năng phòng thủ bảo mật (Validation, Authorization).

== Kịch bản và Môi trường Thử nghiệm
Toàn bộ môi trường thử nghiệm được chạy local với sự hỗ trợ của Jest (cho Unit Test) và Supertest (cho E2E Test trực tiếp vào REST API). Dữ liệu được cô lập bằng Prisma Mocking.

== Kết quả Kiểm thử Tổng thể (Full Regression Test)
Dựa trên tài liệu kiểm thử QA, hệ thống đạt được các chỉ số cực kỳ tích cực.

*Bảng 4.1: Tổng hợp kết quả Regression Test toàn hệ thống*

#table(
  columns: (auto, auto, auto, auto, auto),
  inset: 10pt,
  align: horizon,
  [*Cấp độ Test*], [*Số lượng Test Cases*], [*Mức độ bao phủ (Coverage)*], [*Kết quả*], [*Thời gian thực thi*],
  [Unit / Integration], [30], [`cv`, `batch-request`, `workflow`, `department`, `auth`, `project`, `user`], [*100% Pass*], [~ 8s],
  [E2E Testing], [Toàn diện Endpoints], [Xác thực, Phân quyền, Luồng Dữ liệu, Rủi ro Nghiệp vụ], [*100% Pass*], [Mượt mà]
)

*Bảng 4.2: Tóm tắt kết quả xử lý ngoại lệ và bảo mật*

#table(
  columns: (auto, auto, auto, auto),
  inset: 10pt,
  align: horizon,
  [*Nhóm Kiểm thử*], [*Kịch bản*], [*Kết quả hệ thống (Status Code)*], [*Đánh giá*],
  [*RBAC*], [Truy cập API với Token sai hoặc sai Role (Vd: Employee gọi API Admin)], [`401 Unauthorized` / `403 Forbidden`], [Chặn đứng hoàn toàn.],
  [*Bảo vệ Dữ liệu*], [Tấn công leo thang đặc quyền (Sửa Payload thêm `role: Admin`)], [`400 Bad Request`], [Zod schema loại bỏ mã độc triệt để.],
  [*Bảo vệ Dữ liệu*], [Gửi thiếu trường bắt buộc hoặc sai Format Data], [`400 Bad Request`], [Bắt lỗi chính xác tại cổng Middleware.],
  [*Nghiệp vụ*], [Thao tác (IDOR) trên đối tượng UUID không tồn tại], [`404 Not Found`], [Xử lý NotFoundError mượt mà, không Crash.]
)

*Nhận xét chung:* Kiến trúc hệ thống vô cùng vững chắc (Production-Ready). Việc thêm mới tính năng không hề phá hỏng logic cũ, đồng thời lớp phòng ngự đa tầng đảm bảo tính vẹn toàn cho dữ liệu.

= Kết luận và Hướng phát triển

== Những kết quả đạt được
Đồ án đã phân tích và hiện thực hóa thành công một giải pháp quản lý hồ sơ nhân sự (CV) toàn diện. UmiCV giải quyết triệt để vấn đề phân tán dữ liệu bằng kiến trúc Clean Architecture. Không gian nháp (Draft Space), hệ thống Queue xử lý Email và luồng Approval đã vận hành trơn tru và chứng minh được hiệu năng tốt.

== Hướng phát triển tương lai
Để biến UmiCV thành một nền tảng quản trị tri thức thực sự thông minh, dự án định hướng mở rộng hai tính năng đột phá:
1. *Đa ngôn ngữ (Localization):* Xây dựng bộ Schema động hỗ trợ nhân viên lưu trữ đồng thời các phiên bản CV Tiếng Việt, Tiếng Anh, Tiếng Nhật song song mà vẫn duy trì tính đồng nhất về mặt cấu trúc (Structure Sync).
2. *Ứng dụng Trí tuệ nhân tạo (AI/LLM) cho CV Parsing:* Tích hợp Mô hình Ngôn ngữ Lớn (LLM) và kỹ thuật RAG. Khi nhân viên tải lên một file CV truyền thống (PDF/Word), hệ thống sẽ tự động đọc hiểu (Parsing), phân loại kỹ năng (Skill Extraction) và điền sẵn vào các trường dữ liệu hệ thống. Điều này sẽ rút ngắn tối đa thời gian nhập liệu thủ công của người dùng, mang lại trải nghiệm phần mềm vượt trội.

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
