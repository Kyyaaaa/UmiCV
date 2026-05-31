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
- Tính năng xuất báo cáo cho HR.
- Version Control và Diff Viewer cho CV.
- Đa ngôn ngữ CV (VN/EN/JP) và đồng bộ cấu trúc giữa ngôn ngữ.

== Thuật ngữ và viết tắt (Glossary)
#v(0.5em)
#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Thuật ngữ/Viết tắt*], [*Ý nghĩa*],

  [*CV*], [Curriculum Vitae; hồ sơ năng lực nhân viên trong hệ thống],
  [*SRS*], [Software Requirements Specification; tài liệu đặc tả yêu cầu phần mềm],
  [*SDS*], [Software Design Specification; tài liệu thiết kế phần mềm],
  [*RBAC*], [Role-Based Access Control; phân quyền truy cập theo vai trò],
  [*Local Auth*], [Xác thực tài khoản nội bộ bằng username/password, không tích hợp SSO],
  [*Employee*], [Nhân viên; chỉ xem/sửa CV của chính mình trong không gian nháp],
  [*Tech Lead*], [Quản lý chuyên môn; duyệt CV cấp 1 theo phạm vi quản lý],
  [*HR*], [Nhân sự; tạo/hủy yêu cầu cập nhật hàng loạt, duyệt cấp 2],
  [*Admin*], [Quản trị hệ thống; quản lý cấu hình, phòng ban, tài khoản, phân quyền],
  [*Batch Request*], [Yêu cầu cập nhật CV gửi cho một hoặc nhiều nhân viên cùng lúc],
  [*Draft Space*], [Không gian lưu bản nháp CV; chưa ảnh hưởng bản CV chính thức],
  [*Approval Matrix*], [Luồng phê duyệt đa cấp: Employee -> Tech Lead -> HR -> Published],
  [*Published*], [Trạng thái CV chính thức sau khi hoàn tất phê duyệt],
  [*SLA*], [Service Level Agreement; cam kết mức dịch vụ, gồm Email <= 5 phút và mỗi cấp duyệt <= 48 giờ],
  [*Async Queue*], [Hàng đợi bất đồng bộ dùng xử lý gửi Email thông báo không chặn luồng chính],
  [*Cronjob*], [Tác vụ định kỳ hằng ngày dùng quét và gửi nhắc cập nhật CV gần deadline],
  [*Audit Log*], [Nhật ký truy vết hành động quan trọng: đăng nhập, duyệt, từ chối, hủy yêu cầu, publish],
  [*PostgreSQL*], [Hệ quản trị cơ sở dữ liệu quan hệ sử dụng cho hệ thống UmiCV trong Release 1]
)

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
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-01], [Đăng nhập Local Auth], [
- Hệ thống cho phép người dùng đăng nhập bằng tài khoản nội bộ (username/password).
- Phiên đăng nhập hết hạn theo cấu hình bảo mật.
  ],
  [FR-02], [Phân quyền RBAC], [
- Hệ thống kiểm soát quyền theo vai trò: Employee, Tech Lead, HR, Admin.
- Quyền truy cập dữ liệu tuân thủ phạm vi phòng ban/dự án được phân công.
  ],
  [FR-03], [Quản lý người dùng và phòng ban (Admin)], [
- Admin tạo/sửa/vô hiệu tài khoản.
- Admin gán người dùng vào phòng ban và vai trò.
  ]
)

== Quản lý CV cơ bản (Core CV CRUD & Search)
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-04], [Tạo CV và Quản lý Cấu trúc], [
- Employee hoặc HR có thể khởi tạo hồ sơ CV.
- Người dùng có thể tự do điều chỉnh, sắp xếp và thêm bớt các mục (sections) trên CV theo ý muốn (tương tự trình tạo CV của TopCV).
- Hệ thống cung cấp sẵn các Template chuẩn của công ty để người dùng có thể áp dụng nhanh nếu cần một định dạng quy chuẩn.
  ],
  [FR-05], [Sửa CV], [
- Employee chỉ sửa CV của chính mình ở bản nháp.
- HR có quyền cập nhật theo chính sách quản trị dữ liệu.
  ],
  [FR-06], [Xóa CV], [
- Chỉ vai trò được ủy quyền mới có quyền xóa.
- Hành động xóa phải được ghi nhật ký audit.
  ],
  [FR-07], [Tìm kiếm nâng cao], [
Hệ thống hỗ trợ tìm theo:
- Tên nhân viên.
- Phòng ban.
- Kỹ năng.
- Dự án tham gia.
- Trạng thái CV.
  ]
)

== Workflow yêu cầu cập nhật CV
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-08], [Tạo yêu cầu cập nhật hàng loạt (Batch Request)], [
- HR tạo yêu cầu cập nhật cho một hoặc nhiều nhân viên.
- Mỗi yêu cầu có: tiêu đề, mô tả, danh sách nhân sự, deadline.
- Sau khi tạo yêu cầu, trạng thái CV liên quan tự động chuyển `Chưa cập nhật`.
  ],
  [FR-09], [Gửi thông báo bất đồng bộ], [
- Hệ thống gửi Email thông báo qua cơ chế queue bất đồng bộ.
- SLA: Email phải được phát đi trong vòng <= 5 phút sau khi HR tạo yêu cầu.
  ],
  [FR-10], [Hủy yêu cầu cập nhật], [
- HR được phép hủy yêu cầu đang mở.
- Khi hủy, trạng thái liên quan cập nhật thành `Hủy yêu cầu` và thông báo tới đối tượng liên quan.
  ]
)

== Không gian nháp và phê duyệt đa cấp
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-11], [Không gian nháp (Draft Space)], [
- Dữ liệu Employee chỉnh sửa được lưu ở bản nháp.
- Bản CV chính thức vẫn được dùng cho mục đích tra cứu đến khi duyệt xong.
  ],
  [FR-12], [Gửi duyệt], [
- Employee gửi nháp sang trạng thái `Chờ duyệt` để bắt đầu luồng duyệt.
  ],
  [FR-13], [Duyệt cấp 1 (Tech Lead)], [
- Tech Lead có quyền Approve hoặc Reject.
- Nếu Reject, bắt buộc nhập lý do chi tiết theo trường/mục lỗi.
  ],
  [FR-14], [Duyệt cấp 2 (HR)], [
- Sau khi Tech Lead Approve, HR duyệt format/chính tả.
- HR có quyền Approve hoặc Reject, reject kèm lý do chi tiết.
  ],
  [FR-15], [Công bố bản chính thức], [
- Khi HR Approve, hệ thống publish bản nháp thành CV chính thức.
- Trạng thái CV tự động chuyển `Đã cập nhật`.
  ],
  [FR-16], [SLA thời gian duyệt], [
- Mỗi cấp duyệt (Tech Lead, HR) có thời gian xử lý tối đa 48 giờ.
- Hệ thống ghi nhận vi phạm SLA để phục vụ báo cáo vận hành.
  ]
)

== Nhắc nhở tự động
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-17], [Cronjob nhắc cập nhật], [
- Hệ thống chạy cronjob hằng ngày.
- Tự động gửi Email nhắc nhân viên có CV `Chưa cập nhật` và gần đến deadline.
  ]
)

== Trạng thái và luật chuyển trạng thái
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-18], [Danh mục trạng thái cốt lõi], [
- `Nháp (Draft)`
- `Chờ duyệt`
- `Chưa cập nhật`
- `Đã cập nhật`
- `Hủy yêu cầu`
  ],
  [FR-19], [Luật chuyển trạng thái tự động], [
- Tạo Batch Request -> `Chưa cập nhật`.
- Employee sửa/tạo nháp -> `Nháp`/`Chờ duyệt` theo hành động.
- Duyệt thành công đầy đủ cấp -> `Đã cập nhật`.
- HR hủy yêu cầu -> `Hủy yêu cầu`.
  ]
)

== Báo cáo và xuất dữ liệu (Reporting)
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-20], [Xuất báo cáo danh sách CV], [
- HR và Admin có quyền xuất báo cáo danh sách nhân viên chưa cập nhật CV, trễ deadline hoặc vi phạm SLA.
- Hỗ trợ định dạng xuất ra file Excel/CSV.
  ]
)

== Tính năng nâng cao (Advanced Features)
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã chức năng*], [*Tên chức năng*], [*Mô tả chức năng*],
  [FR-21], [Quản lý phiên bản (Version Control)], [
- Khi CV được cập nhật thành bản chính thức, hệ thống tăng số phiên bản thay vì ghi đè (vd: v1.0 -> v2.0).
- Cung cấp giao diện Diff Viewer để so sánh chi tiết các thay đổi giữa 2 phiên bản.
  ],
  [FR-22], [Đa ngôn ngữ (Localization)], [
- Hỗ trợ tạo các bản dịch (Việt, Anh, Nhật) cho cùng một tài liệu CV.
- Hệ thống tự động đồng bộ cấu trúc dữ liệu (Schema) giữa các bản dịch khi có sự thay đổi.
  ]
)

= Hệ thống Use Case (Use Case System)
#let usecase(id, name, actor, trigger, precondition, main_flow, alternative_flow, postcondition) = (
  id: id, name: name, actor: actor, trigger: trigger, precondition: precondition,
  main_flow: main_flow, alternative_flow: alternative_flow, postcondition: postcondition
)

#let render_usecase_list(ucs) = {
  let rows = ()
  for uc in ucs {
    rows.push([#uc.id])
    rows.push([#uc.name])
  }
  table(
    columns: (auto, 1fr),
    stroke: 0.5pt + luma(150),
    fill: (col, row) => if row == 0 { luma(240) } else { white },
    inset: 8pt,
    [*Mã UC*], [*Tên Use Case*],
    ..rows
  )
}

#let render_usecase_spec(uc) = [
  === #uc.id: #uc.name
  #table(
    columns: (auto, 1fr),
    stroke: 0.5pt + luma(150),
    inset: 8pt,
    [*Actor*], [#uc.actor],
    [*Trigger*], [#uc.trigger],
    [*Precondition*], [#uc.precondition],
    [*Main Flow*], [
      #for step in uc.main_flow [
        + #step
      ]
    ],
    [*Alternative Flow*], [
      #if uc.alternative_flow.len() == 0 [
        - Không có
      ] else [
        #for step in uc.alternative_flow [
          + #step
        ]
      ]
    ],
    [*Postcondition*], [#uc.postcondition]
  )
]

#let uc01 = usecase(
  "UC01", "Đăng nhập hệ thống", "Employee, Tech Lead, HR, Admin",
  "Người dùng truy cập trang chủ", "Tài khoản hợp lệ",
  ("Nhập username/password", "Xác thực qua Local Auth", "Trả về JWT Access/Refresh Token", "Chuyển tới Dashboard"),
  ("Sai thông tin: Báo lỗi và yêu cầu nhập lại",), "Đăng nhập thành công"
)

#let uc02 = usecase(
  "UC02", "Tạo Batch Request", "HR",
  "Cần thu thập CV hàng loạt", "Đăng nhập quyền HR",
  ("Chọn danh sách nhân sự", "Nhập tiêu đề, mô tả, deadline", "Xác nhận tạo yêu cầu", "Hệ thống đẩy job gửi Email (Async)", "Chuyển trạng thái CV thành 'Chưa cập nhật'"),
  ("Bỏ trống thông tin bắt buộc: Báo lỗi",), "Yêu cầu được tạo, hệ thống bắt đầu gửi email"
)

#let uc03 = usecase(
  "UC03", "Chỉnh sửa CV (Bản nháp)", "Employee",
  "Mở trình soạn thảo CV", "CV thuộc sở hữu",
  ("Thêm, sửa, xóa các mục (sections) trong CV", "Lưu nội dung", "Hệ thống ghi nhận thay đổi vào Draft Space"),
  (), "Bản nháp được lưu, bản chính thức không bị ảnh hưởng"
)

#let uc04 = usecase(
  "UC04", "Gửi duyệt CV", "Employee",
  "Hoàn tất chỉnh sửa nháp", "Có bản nháp hợp lệ",
  ("Nhấn nút Gửi duyệt", "Hệ thống đổi trạng thái CV thành 'Chờ duyệt'", "Gửi thông báo tới Tech Lead phụ trách"),
  (), "CV được đưa vào luồng phê duyệt cấp 1"
)

#let uc05 = usecase(
  "UC05", "Duyệt CV chuyên môn (Tech Lead)", "Tech Lead",
  "Nhận thông báo chờ duyệt CV", "Thuộc phạm vi quản lý dự án/phòng ban",
  ("Xem bản nháp và so sánh lịch sử (Diff)", "Nhấn Approve", "Đổi trạng thái chờ duyệt cấp 2 (HR)"),
  ("Nhấn Reject", "Bắt buộc nhập lý do từ chối", "CV quay về trạng thái 'Nháp'"), "CV được chuyển tiếp cho HR hoặc trả về cho Employee"
)

#let uc06 = usecase(
  "UC06", "Duyệt CV format (HR)", "HR",
  "Tech Lead đã duyệt cấp 1", "CV đang chờ duyệt cấp 2",
  ("Xem bản nháp và so sánh (Diff)", "Kiểm tra lỗi chính tả, định dạng", "Nhấn Approve", "Cập nhật thành bản chính thức, tăng phiên bản (Version)"),
  ("Nhấn Reject", "Bắt buộc nhập lý do", "Trả về trạng thái 'Nháp'"), "CV được công bố (Published)"
)

#let uc07 = usecase(
  "UC07", "Xuất báo cáo", "HR, Admin",
  "Cần kiểm tra tiến độ cập nhật CV", "Đăng nhập quyền HR/Admin",
  ("Truy cập trang Báo cáo", "Lọc theo phòng ban/trạng thái", "Nhấn Xuất dữ liệu", "Hệ thống tải xuống file Excel/CSV"),
  (), "File báo cáo được tải về máy"
)

#let uc08 = usecase(
  "UC08", "Quản lý tài khoản và phòng ban", "Admin",
  "Cần thêm mới, sửa hoặc phân quyền nhân sự", "Đăng nhập quyền Admin",
  ("Truy cập trang Quản lý hệ thống", "Nhập thông tin nhân sự và phân vai trò/phòng ban", "Lưu thay đổi", "Hệ thống cập nhật CSDL"),
  ("Thiếu thông tin bắt buộc: Báo lỗi",), "Tài khoản/Phòng ban được cập nhật"
)

#let uc09 = usecase(
  "UC09", "Tìm kiếm và tra cứu CV", "HR, Tech Lead, Admin",
  "Cần tìm ứng viên nội bộ theo tiêu chí dự án", "Có quyền xem danh sách CV",
  ("Truy cập trang tra cứu", "Nhập bộ lọc (Kỹ năng, Tên, Trạng thái...)", "Nhấn Tìm kiếm", "Hệ thống trả về danh sách kết quả"),
  ("Không có kết quả: Hiển thị danh sách trống",), "Hiển thị danh sách CV phù hợp"
)

#let uc10 = usecase(
  "UC10", "Hủy yêu cầu cập nhật CV", "HR",
  "Phát hiện Batch Request tạo sai hoặc không cần thiết nữa", "Batch Request đang mở",
  ("Truy cập danh sách Batch Request", "Chọn yêu cầu cần hủy", "Xác nhận Hủy", "Hệ thống đổi trạng thái các CV liên quan thành 'Hủy yêu cầu'", "Gửi email thông báo hủy"),
  (), "Yêu cầu bị hủy và ngừng luồng cập nhật"
)

#let uc11 = usecase(
  "UC11", "Xem lịch sử thay đổi (Diff Viewer)", "Employee, Tech Lead, HR, Admin",
  "Cần kiểm tra nội dung thay đổi giữa các phiên bản", "CV có ít nhất 1 lần lưu nháp hoặc cập nhật",
  ("Mở chi tiết CV", "Chọn tab Lịch sử phiên bản", "Chọn 2 phiên bản để so sánh", "Hệ thống hiển thị màn hình Diff (highlight xanh/đỏ)"),
  (), "Người dùng xem được chính xác các dòng thay đổi"
)

#let uc12 = usecase(
  "UC12", "Quản lý bản dịch đa ngôn ngữ", "Employee, HR",
  "Cần nộp CV bằng Tiếng Anh/Nhật", "Đã có bản CV gốc (Tiếng Việt)",
  ("Mở chi tiết CV", "Nhấn Thêm ngôn ngữ", "Hệ thống copy cấu trúc từ bản gốc", "Người dùng nhập nội dung dịch thuật", "Lưu bản dịch"),
  (), "Bản dịch được lưu và đồng bộ schema với bản gốc"
)

#let ucs = (uc01, uc02, uc03, uc04, uc05, uc06, uc07, uc08, uc09, uc10, uc11, uc12)

== Danh sách Use Case (Catalog)
#render_usecase_list(ucs)

== Đặc tả Use Case chi tiết (Specification)
#for uc in ucs [
  #render_usecase_spec(uc)
]

= Ma trận phân quyền (RBAC Matrix)
#v(0.5em)
#table(
  columns: (auto, auto, auto, auto, auto),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  align: center,
  align(left)[*Chức năng*], [*Employee*], [*Tech Lead*], [*HR*], [*Admin*],

  align(left)[Xem CV bản thân], [Có], [Có], [Có], [Có],
  align(left)[Xem toàn bộ CV], [Không], [Theo phạm vi quản lý], [Có], [Có],
  align(left)[Sửa CV (không gian nháp)], [Bản thân], [Không], [Có], [Có],
  align(left)[Tạo/Hủy Batch Request], [Không], [Không], [Có], [Có],
  align(left)[Duyệt cấp 1 chuyên môn], [Không], [Có], [Không], [Có],
  align(left)[Duyệt cấp 2 format], [Không], [Không], [Có], [Có],
  align(left)[Xuất báo cáo], [Không], [Không], [Có], [Có],
  align(left)[Xem lịch sử (Diff Viewer)], [Bản thân], [Theo phạm vi quản lý], [Có], [Có],
  align(left)[Quản lý bản Đa ngôn ngữ], [Bản thân], [Không], [Có], [Có],
  align(left)[Quản trị hệ thống], [Không], [Không], [Không], [Có]
)

= Yêu cầu phi chức năng (Non-Functional Requirements)
== Hiệu năng và khả dụng
- Thời gian phản hồi API thông thường: p95 <= 2 giây (không tính tác vụ async).
- Hàng đợi thông báo phải hỗ trợ xử lý khối lượng gửi batch mà không chặn luồng chính.
- Hệ thống hoạt động ổn định trong giờ hành chính với giám sát lỗi và retry gửi Email.

== Bảo mật
- Local Auth với mật khẩu băm an toàn (bcrypt/argon2).
- Cơ chế xác thực sử dụng *JWT (JSON Web Token)* kết hợp:
  - *Access Token:* Có thời hạn ngắn, truyền qua HTTP Authorization Header (Bearer).
  - *Refresh Token:* Có thời hạn dài, được lưu trữ an toàn qua HTTP-only Cookie để chống tấn công XSS và CSRF.
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
| FR-20 | Báo cáo và xuất dữ liệu | Reporting Test |
| FR-21..FR-22 | Tính năng nâng cao (Bonus) | Advanced Features Test |

= Ngoài phạm vi hiện tại (Out of Scope - Release 1)
- Tích hợp SSO doanh nghiệp.
