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

== Hiệu năng và khả dụng (Performance & Availability)
- Thời gian phản hồi API thông thường: p95 <= 2 giây (không tính các tác vụ async như xuất báo cáo hay gửi email).
- Thời gian tải trang (Page Load Time) trên client: Lần tải đầu tiên (FCP) dưới 1.5s, TTI (Time to Interactive) dưới 3s.
- Hàng đợi thông báo (Message Queue) phải hỗ trợ xử lý khối lượng gửi batch mà không chặn (block) luồng xử lý chính của ứng dụng.
- Hệ thống hoạt động ổn định 99.9% (Uptime) trong giờ hành chính, tích hợp cơ chế tự động giám sát lỗi và retry khi thất bại (đặc biệt với gửi Email).

== Bảo mật (Security)
- Local Auth với mật khẩu băm an toàn (bcrypt/argon2), không lưu mật khẩu dạng plaintext.
- Cơ chế xác thực sử dụng *JWT (JSON Web Token)* kết hợp:
  - *Access Token:* Có thời hạn ngắn (ví dụ: 15-30 phút), truyền qua HTTP Authorization Header (Bearer).
  - *Refresh Token:* Có thời hạn dài, được lưu trữ an toàn qua `HTTP-only`, `Secure`, và `SameSite` Cookie để chống lại các cuộc tấn công XSS và CSRF.
- Mọi kết nối truy cập hệ thống (từ Client đến Server) bắt buộc phải được mã hóa qua HTTPS (TLS 1.2+).
- Kiểm soát truy cập dữ liệu chặt chẽ theo phân quyền RBAC và phân luồng dữ liệu dựa trên phạm vi quản lý của phòng ban/dự án.
- Ghi log hệ thống (Audit Log) cho toàn bộ các hành động quan trọng: đăng nhập, tạo/hủy request, phê duyệt/từ chối CV, publish CV.

== Trải nghiệm người dùng và Thẩm mỹ (UX/UI & Aesthetics)
- *Thiết kế hiện đại (Modern Design):* Hệ thống sử dụng phong cách thiết kế hiện đại, cao cấp với các dải màu nổi bật (vibrant colors), chế độ tối (dark mode), và hiệu ứng kính (glassmorphism).
- *Trải nghiệm tương tác động (Dynamic Interactions):* Giao diện cần phản hồi tốt với người dùng thông qua các vi hiệu ứng (micro-animations), hiệu ứng hover và bộ chuyển động mượt mà (smooth transitions).
- *Typography:* Sử dụng các font chữ hiện đại (như Inter, Roboto hoặc Outfit) thay vì font mặc định của trình duyệt để tạo cảm giác chuyên nghiệp.
- *Tính đáp ứng (Responsiveness):* Giao diện phải hiển thị tốt và có thể sử dụng dễ dàng trên màn hình Desktop, Tablet, và Mobile.

== Khả năng mở rộng và bảo trì (Scalability & Maintainability)
- Cấu trúc hệ thống tuân thủ thiết kế mô-đun (Modularity), tách biệt rõ ràng các domain nghiệp vụ (Auth, CV Management, Workflow, Notification, Reporting).
- Cho phép mở rộng tích hợp thêm các kênh thông báo trong tương lai (vd: Slack, Microsoft Teams, Zalo).
- Codebase Frontend phải xây dựng hệ thống Component tái sử dụng cao, định nghĩa Design Token rõ ràng qua CSS.

== Triển khai (Deployment)
- Tất cả các thành phần hệ thống (Frontend, Backend, Database, Queue) bắt buộc phải được đóng gói qua Docker (có Dockerfile riêng).
- Khởi chạy toàn bộ môi trường nội bộ/demo chỉ bằng một lệnh duy nhất (`docker-compose up`).

= Yêu cầu giao diện ngoài (External Interface Requirements)

== Giao diện người dùng (User Interface)
- *Dashboard Tổng quan:* Tùy biến theo vai trò (Employee, Tech Lead, HR). Hiển thị danh sách công việc cần xử lý (To-do list), biểu đồ thống kê trạng thái CV, và tiến độ hoàn thành các Batch Request.
- *Trình tạo CV thông minh (CV Builder):*
  - Giao diện kéo thả (Drag & Drop) trực quan để người dùng tự do thêm/bớt và sắp xếp các mục (sections).
  - Tích hợp thanh công cụ (Toolbar) cho phép định dạng văn bản nâng cao (Rich Text Editor).
  - Hiển thị bản xem trước (Live Preview) theo thời gian thực mỗi khi có thay đổi.
  - Cung cấp tính năng chọn Template chuẩn, cho phép thay đổi màu sắc chủ đạo của CV chỉ với 1 click.
- *Màn hình Phê duyệt (Approval UI):*
  - Tích hợp tính năng đối chiếu (Diff Viewer) trực tiếp trên màn hình duyệt, highlight màu xanh cho nội dung thêm mới, màu đỏ cho nội dung bị xóa để Tech Lead và HR dễ dàng phát hiện điểm khác biệt.
  - Khung nhập lý do từ chối (Reject Reason) bắt buộc, có nút gọi ý các lỗi thường gặp (VD: Lỗi định dạng, Sai kỹ năng, Cần làm rõ dự án).
- *Thông báo (Notifications):* Có menu chuông thông báo hiển thị real-time ngay trên Navbar của giao diện web.

== Giao diện phần mềm (Software Interfaces)
- *Email Service (SMTP):* Tích hợp dịch vụ SMTP để gửi thông báo tự động, nhắc việc. Môi trường dev sử dụng Mailhog để giả lập.
- *Hệ thống hàng đợi (Message Broker):* Tích hợp Redis + BullMQ (hoặc công nghệ tương đương) để xử lý các luồng tác vụ nặng ở nền (như gửi email hàng loạt).
- *RESTful API:* Các module Backend cung cấp API nội bộ theo chuẩn RESTful cho Frontend, sử dụng chuẩn dữ liệu JSON.

== Giao diện dữ liệu (Data Interfaces)
- *Hệ quản trị CSDL:* PostgreSQL làm cơ sở dữ liệu chính để lưu trữ dữ liệu nghiệp vụ.
- *Cấu trúc lưu trữ linh hoạt:* Nội dung chi tiết của CV (chứa các sections linh động do người dùng định nghĩa) sẽ được lưu trữ dưới định dạng `JSONB` trong PostgreSQL, đảm bảo hệ thống có thể đáp ứng được khả năng tùy chỉnh cấu trúc từ trình tạo CV (CV Builder).

= Quy tắc nghiệp vụ (Business Rules)
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã BR*], [*Tên Quy tắc*], [*Mô tả chi tiết*],
  [BR-01], [Định danh Độc bản], [Mỗi nhân viên bắt buộc thuộc đúng một phòng ban tại một thời điểm. Việc phân quyền dữ liệu sẽ dựa trên sơ đồ tổ chức này.],
  [BR-02], [Quyền Riêng tư CV], [Employee tuyệt đối không được xem, tải xuống hoặc chỉnh sửa CV của nhân viên khác dưới bất kỳ hình thức nào.],
  [BR-03], [Lý do Từ chối (Reject)], [Hành động Reject ở bất kỳ cấp duyệt nào (Tech Lead hoặc HR) bắt buộc phải kèm theo lý do chi tiết để Employee biết đường chỉnh sửa.],
  [BR-04], [Nguyên tắc Publish], [CV chỉ được công bố (Publish) thành bản chính thức sau khi đã vượt qua đủ 2 cấp duyệt: Chuyên môn (Tech Lead) và Định dạng (HR).],
  [BR-05], [Thời hạn Yêu cầu], [Một Batch Request (Yêu cầu cập nhật hàng loạt) phải có deadline hợp lệ và luôn lớn hơn thời điểm tạo tối thiểu 24 giờ.],
  [BR-06], [Chặn duyệt luồng Hủy], [Khi Batch Request bị HR hủy, mọi quy trình duyệt đang dang dở liên quan đến Batch đó sẽ bị khóa cứng (freeze).],
  [BR-07], [Cách ly Bản nháp], [Dữ liệu trên không gian nháp (Draft Space) hoàn toàn độc lập và tuyệt đối không ghi đè lên CV bản chính thức đang hiện hành.],
  [BR-08], [Quản lý Phiên bản (Version)], [Khi một bản nháp được HR Approve, Version của CV tự động tăng lên (VD: v1.0 -> v2.0), snapshot bản cũ bị khóa (Read-only) để phục vụ tra cứu.],
  [BR-09], [Đồng bộ Đa ngôn ngữ], [Khi cấu trúc bản gốc thay đổi (thêm/xóa section), các bản dịch đa ngôn ngữ tương ứng sẽ tự động bật cảnh báo yêu cầu đồng bộ Schema.],
  [BR-10], [Phạm vi Phê duyệt], [Tech Lead chỉ có quyền xem và phê duyệt CV của những nhân sự trực thuộc dự án hoặc phòng ban mà Tech Lead đó đang quản lý.]
)

= Tiêu chí chấp nhận (Acceptance Criteria)
#table(
  columns: (auto, auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã AC*], [*Nhóm kiểm thử*], [*Mô tả tiêu chí nghiệm thu*],
  [AC-01], [Luồng Thông báo], [Khi HR tạo Batch Request thành công, toàn bộ nhân sự trong danh sách nhận được Email thông báo qua queue trong thời gian <= 5 phút.],
  [AC-02], [Chuyển trạng thái CV], [Trạng thái của các CV liên quan tự động chuyển thành `Chưa cập nhật` ngay sau khi Batch Request được khởi tạo.],
  [AC-03], [Không gian Nháp], [Mọi thay đổi của Employee khi "Lưu nháp" chỉ được ghi nhận ở Draft Space, không ảnh hưởng đến bản CV chính thức đang phục vụ hệ thống.],
  [AC-04], [Luồng Phê duyệt], [Tech Lead/HR có thể Approve hoặc Reject. Nếu chọn Reject thì form yêu cầu bắt buộc nhập Lý do từ chối, nếu bỏ trống form sẽ báo lỗi hệ thống.],
  [AC-05], [Hoàn tất Duyệt], [Một CV chỉ chuyển sang trạng thái `Đã cập nhật` và tự động tăng Version nếu có đủ lịch sử phê duyệt của cả 2 cấp: Chuyên môn và Định dạng.],
  [AC-06], [Cronjob Hệ thống], [Cronjob chạy tự động hằng ngày vào khung giờ quy định, gửi email nhắc nhở chính xác đến những nhân sự có CV sắp quá hạn deadline.],
  [AC-07], [Đánh giá SLA], [Hành động phê duyệt của Tech Lead hoặc HR nếu vượt quá 48 tiếng kể từ khi nhận được luồng duyệt sẽ bị tự động ghi nhận là "Vi phạm SLA".],
  [AC-08], [Bảo mật Auth], [Hệ thống từ chối (401 Unauthorized) các request gọi API bằng Access Token đã hết hạn. Đòi hỏi cấp mới thông qua Refresh Token lưu tại Http-Only Cookie.],
  [AC-09], [Phân quyền RBAC], [Hệ thống chặn truy cập (403 Forbidden) ngay lập tức nếu Employee dùng API để cố tình xem hoặc lấy dữ liệu CV của một nhân viên khác.],
  [AC-10], [Trình tạo CV (UI)], [Trong CV Builder, người dùng có thể kéo thả đổi vị trí section thành công, màn hình Live Preview phản hồi theo thời gian thực (real-time).],
  [AC-11], [Diff Viewer], [Khi có yêu cầu duyệt, màn hình duyệt (Approval UI) phải hiển thị được khối Diff rõ ràng: bôi xanh/highlight cho nội dung vừa thêm, gạch ngang màu đỏ cho nội dung xóa đi.]
)

= Truy vết yêu cầu (Requirements Traceability Matrix - RTM)
#table(
  columns: (auto, 2fr, 1.5fr, 1.5fr, 1.5fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Mã FR*], [*Mô tả ngắn*], [*Use Case (UC)*], [*Quy tắc (BR)*], [*Tiêu chí (AC)*],
  [FR-01..03], [Định danh và RBAC], [UC01, UC08], [BR-01], [AC-08, AC-09],
  [FR-04..07], [CRUD và Search CV], [UC03, UC09], [BR-02], [AC-03, AC-10],
  [FR-08..10], [Batch Request và Notify], [UC02, UC10], [BR-05, BR-06], [AC-01, AC-02],
  [FR-11..16], [Draft và Phê duyệt đa cấp], [UC04, UC05, UC06], [BR-03, BR-04, BR-07, BR-10], [AC-04, AC-05, AC-07],
  [FR-17], [Cronjob nhắc việc tự động], [-], [BR-05], [AC-06],
  [FR-18..19], [Quản lý trạng thái], [UC02, UC04, UC05, UC06], [BR-06], [AC-02, AC-05],
  [FR-20], [Báo cáo và xuất dữ liệu], [UC07], [-], [AC-07],
  [FR-21], [Quản lý Version & Diff Viewer], [UC11], [BR-08], [AC-11],
  [FR-22], [Quản lý Đa ngôn ngữ], [UC12], [BR-09], [-]
)
