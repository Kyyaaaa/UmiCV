== Thuật ngữ và viết tắt (Glossary)
#v(0.5em)
#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(150),
  fill: (col, row) => if row == 0 { luma(240) } else { white },
  inset: 8pt,
  [*Thuật ngữ*], [*Ý nghĩa*],
  
  [*CV Core*], [Phân hệ xử lý dữ liệu lõi của CV dưới định dạng JSON linh hoạt],
  
  [*Draft Space*], [Không gian lưu nháp tạm thời, cho phép nhân viên chỉnh sửa CV mới mà không làm ảnh hưởng đến bản CV chính thức đang sử dụng],
  
  [*Approval Matrix*], [Ma trận phê duyệt các cấp (Luồng duyệt tuần tự qua Tech Lead và HR)],
  
  [*Polyglot Persistence*], [Kiến trúc lưu trữ đa tầng sử dụng nhiều loại cơ sở dữ liệu khác nhau (MongoDB cho nội dung CV JSON, PostgreSQL cho dữ liệu quan hệ, AWS S3 cho file vật lý)]
)