#import "template.typ": report

#show: report.with(
  title: "TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)",
  authors: ("Nhóm dự án VTIT", ""),
  date: "Tháng 5 năm 2026"
)

#let project_name = "UmiCV"

= Giới thiệu (Introduction)
== Mục đích (Purpose)
Tài liệu này đặc tả đầy đủ yêu cầu phần mềm cho dự án #project_name, làm cơ sở thống nhất giữa nghiệp vụ, phát triển, kiểm thử và vận hành.

== Phạm vi (Scope)
Hệ thống số hóa, chuẩn hóa, quản lý tập trung CV nhân viên VTIT; hỗ trợ HR tạo yêu cầu cập nhật hàng loạt, quản lý không gian nháp, phê duyệt đa cấp và nhắc nhở tự động theo deadline.

Phạm vi Release 1 gồm:
- Quản lý CV cơ bản (CRUD, tra cứu nâng cao).
- Workflow yêu cầu cập nhật từ HR và hủy yêu cầu.
- Draft Space và phê duyệt đa cấp: Employee -> Tech Lead -> HR -> Published.
- Thông báo bất đồng bộ qua Email và cronjob nhắc hằng ngày.
- RBAC theo vai trò và phòng ban.
- Triển khai đóng gói Docker.

Ngoài phạm vi Release 1 (Phase 2):
- Version Control và Diff Viewer cho CV.
- Đa ngôn ngữ CV (VN/EN/JP) và đồng bộ cấu trúc giữa ngôn ngữ.

#include "glossary.typ"

= Mô tả tổng quan (Overall Description)
== Bối cảnh sản phẩm (Product Perspective)
Hệ thống là ứng dụng nội bộ web-based phục vụ VTIT, kết nối người dùng theo mô hình phân quyền vai trò. Hệ thống đóng vai trò nguồn dữ liệu CV tập trung để phục vụ vận hành nhân sự, đấu thầu và gửi đối tác.

== Mục tiêu nghiệp vụ (Business Goals)
- Tăng tính nhất quán và độ tin cậy dữ liệu CV.
- Rút ngắn thời gian thu thập/cập nhật CV khi có yêu cầu gấp.
- Chuẩn hóa quy trình kiểm duyệt chuyên môn và hình thức.
- Tăng khả năng truy vết trách nhiệm qua lịch sử trạng thái và lý do từ chối.

== Nhóm người dùng (User Classes)
- *Employee:* Xem/sửa CV của chính mình trong không gian nháp; gửi duyệt; nhận thông báo.
- *Tech Lead:* Xem CV thành viên thuộc phạm vi quản lý; duyệt chuyên môn cấp 1; reject có lý do chi tiết.
- *HR:* Tạo/hủy batch request; xem toàn bộ CV; duyệt format/chính tả cấp 2; theo dõi tiến độ; xuất báo cáo.
- *Admin:* Quản trị cấu hình hệ thống, phòng ban, tài khoản, phân quyền.

== Môi trường hoạt động (Operating Environment)
- Ứng dụng Web chạy trên trình duyệt hiện đại.
- Xác thực Local Auth (không SSO).
- Cơ sở dữ liệu PostgreSQL.
- Thành phần triển khai đóng gói Docker và điều phối bằng docker-compose.

== Giả định và phụ thuộc (Assumptions & Dependencies)
- Dữ liệu phòng ban và cơ cấu tổ chức được cung cấp đầy đủ.
- Hạ tầng Email nội bộ sẵn sàng cho gửi thông báo tự động.
- Người dùng có tài khoản nội bộ hợp lệ do Admin quản trị.

= Yêu cầu chức năng (Functional Requirements)
== Quản lý định danh và truy cập (Identity & Access)
=== FR-01 Đăng nhập Local Auth
- Hệ thống cho phép người dùng đăng nhập bằng tài khoản nội bộ (username/password).
- Phiên đăng nhập hết hạn theo cấu hình bảo mật.

=== FR-02 Phân quyền RBAC
- Hệ thống kiểm soát quyền theo vai trò: Employee, Tech Lead, HR, Admin.
- Quyền truy cập dữ liệu tuân thủ phạm vi phòng ban/dự án được phân công.

=== FR-03 Quản lý người dùng và phòng ban (Admin)
- Admin tạo/sửa/vô hiệu tài khoản.
- Admin gán người dùng vào phòng ban và vai trò.

== Quản lý CV cơ bản (Core CV CRUD & Search)
=== FR-04 Tạo CV
- Employee hoặc HR có thể khởi tạo hồ sơ CV theo cấu trúc chuẩn.

=== FR-05 Sửa CV
- Employee chỉ sửa CV của chính mình ở bản nháp.
- HR có quyền cập nhật theo chính sách quản trị dữ liệu.

=== FR-06 Xóa CV
- Chỉ vai trò được ủy quyền mới có quyền xóa.
- Hành động xóa phải được ghi nhật ký audit.

=== FR-07 Tìm kiếm nâng cao
Hệ thống hỗ trợ tìm theo:
- Tên nhân viên.
- Phòng ban.
- Kỹ năng.
- Dự án tham gia.
- Trạng thái CV.

== Workflow yêu cầu cập nhật CV
=== FR-08 Tạo yêu cầu cập nhật hàng loạt (Batch Request)
- HR tạo yêu cầu cập nhật cho một hoặc nhiều nhân viên.
- Mỗi yêu cầu có: tiêu đề, mô tả, danh sách nhân sự, deadline.
- Sau khi tạo yêu cầu, trạng thái CV liên quan tự động chuyển `Chưa cập nhật`.

=== FR-09 Gửi thông báo bất đồng bộ
- Hệ thống gửi Email thông báo qua cơ chế queue bất đồng bộ.
- SLA: Email phải được phát đi trong vòng <= 5 phút sau khi HR tạo yêu cầu.

=== FR-10 Hủy yêu cầu cập nhật
- HR được phép hủy yêu cầu đang mở.
- Khi hủy, trạng thái liên quan cập nhật thành `Hủy yêu cầu` và thông báo tới đối tượng liên quan.

== Không gian nháp và phê duyệt đa cấp
=== FR-11 Không gian nháp (Draft Space)
- Dữ liệu Employee chỉnh sửa được lưu ở bản nháp.
- Bản CV chính thức vẫn được dùng cho mục đích tra cứu đến khi duyệt xong.

=== FR-12 Gửi duyệt
- Employee gửi nháp sang trạng thái `Chờ duyệt` để bắt đầu luồng duyệt.

=== FR-13 Duyệt cấp 1 (Tech Lead)
- Tech Lead có quyền Approve hoặc Reject.
- Nếu Reject, bắt buộc nhập lý do chi tiết theo trường/mục lỗi.

=== FR-14 Duyệt cấp 2 (HR)
- Sau khi Tech Lead Approve, HR duyệt format/chính tả.
- HR có quyền Approve hoặc Reject, reject kèm lý do chi tiết.

=== FR-15 Công bố bản chính thức
- Khi HR Approve, hệ thống publish bản nháp thành CV chính thức.
- Trạng thái CV tự động chuyển `Đã cập nhật`.

=== FR-16 SLA thời gian duyệt
- Mỗi cấp duyệt (Tech Lead, HR) có thời gian xử lý tối đa 48 giờ.
- Hệ thống ghi nhận vi phạm SLA để phục vụ báo cáo vận hành.

== Nhắc nhở tự động
=== FR-17 Cronjob nhắc cập nhật
- Hệ thống chạy cronjob hằng ngày.
- Tự động gửi Email nhắc nhân viên có CV `Chưa cập nhật` và gần đến deadline.

== Trạng thái và luật chuyển trạng thái
=== FR-18 Danh mục trạng thái cốt lõi
- `Nháp (Draft)`
- `Chờ duyệt`
- `Chưa cập nhật`
- `Đã cập nhật`
- `Hủy yêu cầu`

=== FR-19 Luật chuyển trạng thái tự động
- Tạo Batch Request -> `Chưa cập nhật`.
- Employee sửa/tạo nháp -> `Nháp`/`Chờ duyệt` theo hành động.
- Duyệt thành công đầy đủ cấp -> `Đã cập nhật`.
- HR hủy yêu cầu -> `Hủy yêu cầu`.

= Ma trận phân quyền (RBAC Matrix)
| Chức năng | Employee | Tech Lead | HR | Admin |
|---|---|---|---|---|
| Xem CV bản thân | Có | Có | Có | Có |
| Xem CV toàn bộ | Không | Theo phạm vi quản lý | Có | Có |
| Sửa CV bản thân (nháp) | Có | Không | Có | Có |
| Tạo/Hủy Batch Request | Không | Không | Có | Có |
| Duyệt cấp 1 chuyên môn | Không | Có | Không | Có |
| Duyệt cấp 2 format/chính tả | Không | Không | Có | Có |
| Quản trị tài khoản/phòng ban | Không | Không | Không | Có |

= Yêu cầu phi chức năng (Non-Functional Requirements)
== Hiệu năng và khả dụng
- Thời gian phản hồi API thông thường: p95 <= 2 giây (không tính tác vụ async).
- Hàng đợi thông báo phải hỗ trợ xử lý khối lượng gửi batch mà không chặn luồng chính.
- Hệ thống hoạt động ổn định trong giờ hành chính với giám sát lỗi và retry gửi Email.

== Bảo mật
- Local Auth với mật khẩu băm an toàn.
- Mọi kết nối truy cập hệ thống qua HTTPS.
- Kiểm soát truy cập dữ liệu chặt chẽ theo RBAC và phạm vi tổ chức.
- Ghi audit log cho các hành động quan trọng: đăng nhập, tạo/hủy request, duyệt/reject, publish.

== Toàn vẹn dữ liệu
- Trạng thái CV và workflow phải nhất quán, không bỏ qua bước duyệt.
- Mọi thay đổi phê duyệt/reject phải lưu dấu vết người thao tác và thời gian thao tác.

== Triển khai
- Thành phần hệ thống bắt buộc có Dockerfile và docker-compose.yml.
- Môi trường demo khởi chạy bằng một lệnh docker compose.

== Khả năng bảo trì
- Thiết kế mô-đun tách biệt domain rõ ràng: Auth, CV, Workflow, Notification, Reporting.
- Cho phép mở rộng tích hợp thêm kênh thông báo trong tương lai.

= Yêu cầu giao diện ngoài (External Interface Requirements)
== Giao diện người dùng
- Dashboard theo vai trò, hiển thị danh sách việc cần xử lý và trạng thái CV.
- Màn hình chỉnh sửa CV dạng biểu mẫu có validate dữ liệu.
- Màn hình duyệt hiển thị thông tin CV, quyết định duyệt/từ chối và lý do.

== Giao diện phần mềm
- Tích hợp SMTP/Email service để gửi thông báo và nhắc việc.
- API nội bộ phục vụ CRUD CV, workflow phê duyệt, truy vấn báo cáo tiến độ.

== Giao diện dữ liệu
- PostgreSQL lưu dữ liệu nghiệp vụ chính: người dùng, phòng ban, CV, request, approval, notification log.

= Quy tắc nghiệp vụ (Business Rules)
- BR-01: Mỗi nhân viên bắt buộc thuộc đúng một phòng ban tại một thời điểm.
- BR-02: Employee không được truy cập CV nhân viên khác.
- BR-03: Reject bắt buộc có lý do chi tiết.
- BR-04: Không publish CV nếu chưa qua đủ 2 cấp duyệt.
- BR-05: Một yêu cầu cập nhật phải có deadline hợp lệ lớn hơn thời điểm tạo.
- BR-06: Khi yêu cầu bị hủy, không cho phép tiếp tục duyệt theo yêu cầu đó.

= Tiêu chí chấp nhận (Acceptance Criteria)
- AC-01: HR tạo batch request thành công, nhân sự nhận Email trong <= 5 phút.
- AC-02: Trạng thái CV tự chuyển `Chưa cập nhật` ngay sau khi tạo yêu cầu.
- AC-03: Employee chỉnh sửa ở Draft không làm thay đổi CV chính thức.
- AC-04: Tech Lead/HR có thể Approve hoặc Reject; reject bắt buộc lý do.
- AC-05: Duyệt đủ 2 cấp thì CV chuyển `Đã cập nhật`.
- AC-06: Cronjob hằng ngày gửi nhắc Email cho CV gần hết hạn nhưng chưa cập nhật.
- AC-07: Mỗi cấp duyệt vượt 48 giờ được đánh dấu vi phạm SLA trong báo cáo.

= Truy vết yêu cầu (Requirements Traceability Matrix - RTM)
| Mã yêu cầu | Mô tả ngắn | Nhóm kiểm thử |
|---|---|---|
| FR-01..FR-03 | Định danh và RBAC | Auth/RBAC Test |
| FR-04..FR-07 | CRUD và Search CV | CV Service Test |
| FR-08..FR-10 | Batch Request và Notify | Workflow + Async Test |
| FR-11..FR-16 | Draft và Approval Matrix | E2E Approval Test |
| FR-17 | Cronjob nhắc việc | Scheduler Test |
| FR-18..FR-19 | Trạng thái và chuyển trạng thái | State Machine Test |

= Ngoài phạm vi hiện tại (Out of Scope - Release 1)
- Version Control CV và Diff Viewer.
- Quản lý CV đa ngôn ngữ và đồng bộ cấu trúc liên ngôn ngữ.
- Tích hợp SSO doanh nghiệp.
