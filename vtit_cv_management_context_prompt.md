# CONTEXT PROMPT DỰ ÁN: HỆ THỐNG QUẢN LÝ CV NHÂN VIÊN (VTIT)

---

## 📌 THÔNG TIN CHUNG DỰ ÁN (METADATA)
- **Đơn vị chủ quản:** Công ty Đầu tư Công nghệ Viettel (VTIT)
- **Tên đề tài/dự án:** Hệ thống Quản lý CV Nhân viên Toàn diện (Employee CV Management System), Gọi tắt là UmiCV
- **Mục đích tài liệu:** Sử dụng làm Context Prompt (Bối cảnh hệ thống) cung cấp cho AI hoặc Đội ngũ phát triển để sinh mã nguồn, thiết kế DB, viết testcase hoặc xây dựng tài liệu kỹ thuật chi tiết.
- **Phiên bản:** 1.0 (Bản chuẩn hóa)

---

## 📑 1. BỐI CẢNH & MỤC TIÊU HỆ THỐNG
Hệ thống được thiết kế nhằm số hóa, chuẩn hóa và quản lý tập trung toàn bộ hồ sơ năng lực (CV) của nhân sự thuộc nhiều phòng ban/khối dự án trong công ty VTIT. Hệ thống giúp HR dễ dàng yêu cầu cập nhật thông tin hàng loạt phục vụ đấu thầu/gửi đối tác, đồng thời tự động hóa quy trình kiểm duyệt chất lượng CV qua các cấp quản lý và Tech Lead.

---

## 🛠️ 2. PHÂN HỆ VÀ CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)

### 2.1. Quản lý CV Cơ bản (Core CRUD & Search)
- **Thêm, Sửa, Xóa CV:** Cho phép nhân viên hoặc HR khởi tạo và quản lý thông tin CV.
- **Tìm kiếm nâng cao:** Hỗ trợ tìm kiếm CV theo Tên nhân viên, Phòng ban, Kỹ năng (Skills), Dự án tham gia, hoặc Trạng thái CV.

### 2.2. Quy trình Yêu cầu Cập nhật (Update Request Workflow)
- **Trigger Yêu cầu từ HR (Batch Request):** - HR có thể tạo yêu cầu cập nhật CV đến một hoặc một nhóm nhân viên (Ví dụ: *"Toàn bộ Dev thuộc dự án A cần update CV trước ngày mai để gửi khách hàng"*).
  - Hệ thống phải xử lý gửi Email/Notification hàng loạt theo cơ chế **Bất đồng bộ (Async Queue)** nhằm tránh nghẽn hệ thống.
- **Hủy yêu cầu:** HR có quyền hủy yêu cầu cập nhật nếu không còn cần thiết.
- **Hệ thống Trạng thái tự động:**
  - CV có các trạng thái cốt lõi: `Đã cập nhật`, `Chưa cập nhật`, `Hủy yêu cầu`, `Chờ duyệt`, `Nháp (Draft)`.
  - **Logic tự động 1:** Khi một yêu cầu cập nhật được tạo, trạng thái CV của nhân viên đó chuyển thành `Chưa cập nhật`.
  - **Logic tự động 2:** Sau khi CV được sửa đổi/tạo mới và được phê duyệt thành công, hệ thống tự động cập nhật trạng thái thành `Đã cập nhật`.

### 2.3. Không gian Nháp & Luồng Phê duyệt (Draft Space & Approval Matrix)
- **Không gian nháp (Draft Space):** Khi nhân viên cập nhật CV theo yêu cầu, dữ liệu mới sẽ nằm ở trạng thái `Draft` hoặc `Pending Approval`. Nhân viên vẫn sử dụng CV cũ bản chính thức để làm việc, dữ liệu mới chưa được áp dụng công khai cho đến khi được duyệt.
- **Luồng phê duyệt đa cấp (Approval Matrix):** - Quy trình duyệt chuẩn: `Nhân viên (Tạo/Sửa)` ➡️ `Tech Lead (Duyệt chuyên môn)` ➡️ `HR (Duyệt format, chính tả)` ➡️ `Chính thức (Published)`.
  - Quyền hạn: Trưởng phòng/Tech Lead/HR có quyền **Approve (Duyệt)** hoặc **Reject (Từ chối kèm lý do chi tiết vào từng dòng/trường thông tin lỗi)**.

### 2.4. Nhắc nhở Tự động (Auto Remind Cronjob)
- Hệ thống chạy một tác vụ tự động (**Cronjob**) quét hằng ngày.
- Tự động gửi thông báo qua các kênh (`Slack` / `Microsoft Teams` / `Email`) nhắc nhở các nhân viên chưa hoàn thành cập nhật CV (`Chưa cập nhật`) khi sắp đến Deadline.

---

## 🛡️ 3. QUY ĐỊNH VÀ RÀNG BUỘC KỸ THUẬT (NON-FUNCTIONAL REQUIREMENTS)

### 3.1. Cơ cấu Tổ chức & Phòng ban
Nhân viên trong hệ thống bắt buộc phải thuộc một phòng ban cụ thể. Ví dụ:
- Phòng Kỹ thuật Công nghệ (P.KTCN)
- Các khối đơn vị kinh doanh/sản xuất: BU1, BU2, BU3, BU4, BU5,...
- Phòng Quản lý Chất lượng (P.QLCL)

### 3.2. Phân quyền Truy cập (RBAC - Role-Based Access Control)
- **Nhân viên (Employee):** Chỉ được quyền xem/sửa CV của chính mình; nhận thông báo và cập nhật CV vào Không gian nháp.
- **Tech Lead:** Được xem CV của thành viên trong dự án/phòng ban mình phụ trách; duyệt chuyên môn CV (Giai đoạn 1).
- **HR (Quản trị nhân sự):** Tạo/Hủy yêu cầu cập nhật hàng loạt; xem toàn bộ CV; duyệt format/chính tả (Giai đoạn 2); xuất báo cáo.
- **Admin (Quản trị hệ thống):** Toàn quyền cấu hình hệ thống, phòng ban, phân quyền.

### 3.3. Đóng gói & Triển khai (Deployment)
- Toàn bộ ứng dụng (Backend, Frontend, Database, Caching...) phải được đóng gói bằng **Docker**.
- Cung cấp sẵn `Dockerfile` và `docker-compose.yml` để có thể triển khai môi trường Demo chỉ bằng 1 câu lệnh.

---

## 🌟 4. TÍNH NĂNG NÂNG CAO (BONUS POINTS)

### 4.1. Quản lý Phiên bản (Version Control cho CV)
- Khi nhân viên cập nhật CV, hệ thống không ghi đè trực tiếp lên dữ liệu cũ mà tăng số phiên bản (Ví dụ: từ `v1.0` lên `v2.0`).
- Cung cấp tính năng **So sánh phiên bản (Diff Viewer)** trực quan giống như Git Diff để HR/Tech Lead biết chính xác nhân viên đã sửa đổi, thêm bớt những từ ngữ hoặc kỹ năng nào.

### 4.2. Đa ngôn ngữ (Localization cho CV)
- Một nhân viên có thể sở hữu nhiều bản dịch ngôn ngữ cho cùng một CV (Tiếng Việt, Tiếng Anh, Tiếng Nhật).
- Hệ thống phải đảm bảo đồng bộ về cấu trúc dữ liệu (Schema/Sections) giữa các ngôn ngữ này khi có sự thay đổi.
