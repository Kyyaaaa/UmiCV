# Bảng Theo dõi Công việc Dự án UmiCV (Task Tracker)

Tài liệu này dùng để điều phối công việc giữa các Agent (Backend, Frontend, QA). Quy trình thực hiện tiêu chuẩn: **Backend Agent hoàn thiện API -> Frontend Agent tích hợp giao diện -> QA Agent kiểm thử và chốt hạ.**

> *Ghi chú: Đánh dấu `[x]` khi hoàn thành, `[/]` khi đang thực hiện.*

---

## Phase 1: Core Foundation (Auth & IAM)

### 🧑‍💻 Backend Agent Tasks

- [x] **TASK-1.1: Xây dựng Module Authentication & JWT**
  - Xây dựng API `POST /api/auth/login` (Xác thực mật khẩu, cấp Access/Refresh Token).
  - Xây dựng API `POST /api/auth/refresh` và `POST /api/auth/logout`.
  - Cài đặt Auth Guard / Middleware để verify JWT token.
  - Cài đặt Roles Guard để kiểm tra quyền hạn dựa trên enum `UserRole`.
- [x] **TASK-1.2: Cấu trúc Module Departments**
  - Khởi tạo Controller/Service cho Phòng ban.
  - Xây dựng API CRUD (Thêm, Sửa, Xóa, Lấy danh sách dạng cây parent-child).
- [x] **TASK-1.3: Cấu trúc Module Users**
  - Khởi tạo Controller/Service cho Người dùng.
  - Xây dựng API CRUD (Tạo tài khoản, Update role/phòng ban, Lấy danh sách có phân trang và search).
- [x] **TASK-1.4: Cấu trúc Module Projects & Project Members**
  - Khởi tạo Controller/Service cho Dự án.
  - Xây dựng API CRUD cho Project.
  - Xây dựng API Quản lý thành viên (Assign user vào dự án, Xóa user khỏi dự án).

---

### 🎨 Frontend Agent Tasks

- [x] **TASK-1.5: Thiết lập Authentication Flow & Interceptors**
  - Xây dựng trang Login UI (`/login`).
  - Cấu hình Axios Interceptors tự động gắn Access Token và tự động gọi API Refresh Token khi token hết hạn.
  - Cấu hình Protected Routes: Chặn người dùng chưa đăng nhập.
  - Layout cơ bản cho Admin Dashboard (Sidebar menu).
- [x] **TASK-1.6: Giao diện Quản lý Phòng ban**
  - Tích hợp API `GET /api/departments/tree` để render danh sách Phòng ban dạng sơ đồ tổ chức (Tree View).
  - Tích hợp API `POST/PUT /api/departments` vào Form tạo mới / chỉnh sửa thông tin phòng ban (xử lý chọn parent department).
  - Tích hợp API `DELETE /api/departments/:id`, xử lý catch lỗi 400 nếu phòng ban đang có nhân viên trực thuộc.
- [x] **TASK-1.7: Giao diện Quản lý Người dùng**
  - Tích hợp API `GET /api/users` vào Data Table hỗ trợ phân trang, tìm kiếm.
  - Tích hợp API `POST /api/users` vào Modal/Form thêm mới nhân viên, gán Role và gọi API lấy danh sách phòng ban để chọn Department.
- [x] **TASK-1.8: Giao diện Quản lý Dự án**
  - Tích hợp API `GET /api/projects` vào Trang danh sách Dự án (`/admin/projects`).
  - Tích hợp API `POST/PUT /api/projects` vào Form tạo dự án (Gán Tech Lead).
  - UI/Tab Quản lý thành viên: Tích hợp API `GET /api/projects/:id/members` để lấy danh sách.
  - Kéo/chọn nhân viên vào dự án: Tích hợp API `POST /api/projects/:id/members` và `DELETE /api/projects/:id/members/:userId`.

---

### 🕵️ QA Agent Tasks

- [x] **TASK-1.9: Kiểm thử Tích hợp (Integration Test) Auth Flow**
  - Chạy kịch bản Login với thông tin sai, kiểm tra bắt lỗi UI.
  - Kiểm tra Access Token hết hạn, tự động Refresh thành công hay không.
  - Test phân quyền: User thường truy cập vào đường dẫn Admin có bị chặn không.
- [x] **TASK-1.10: Kiểm thử End-to-End luồng Quản lý**
  - Tạo mới Department -> Tạo mới User gán vào Department -> Tạo mới Project -> Gán User vừa tạo vào Project. Đảm bảo toàn bộ luồng thông suốt không crash.
  - Kiểm thử xóa ràng buộc: Cố gắng xóa Department đang chứa User xem hệ thống có chặn đúng logic không.
- [x] **TASK-1.11: Kiểm thử UI/UX Quản trị (Dựa trên Frontend Agent vừa hoàn thành)**
  - Kiểm tra giao diện Cây Phòng ban (Tree View) thu gọn/mở rộng, validate tạo phòng ban không chọn chính nó làm cha.
  - Kiểm tra chức năng Phân trang (Pagination) và Lọc (Filter) theo Role trên bảng Người dùng.
  - Kiểm tra Modal quản lý thành viên dự án: Thêm/Xóa thành viên, danh sách chọn không bị trùng lặp user đã có trong dự án.

---

## Phase 1.5: Fix Account Locking Bug

### 🧑‍💻 Backend Agent Tasks

- [x] **TASK-1.12: Cập nhật Middleware Xác thực (Auth Middleware)**
  - Sửa hàm `authenticate` trong `auth.middleware.ts` để query trực tiếp trạng thái User dưới Database sau khi giải mã token.
  - Xử lý logic nếu User không tồn tại, đã bị xóa (`deletedAt !== null`) hoặc bị khóa (`status === 'Locked'`) thì throw `UnauthorizedError` kèm theo message phù hợp.
- [x] **TASK-1.13: Cập nhật Service cấp lại Token (Refresh Token)**
  - Cập nhật luồng `refresh` trong `auth.service.ts` chặn việc cấp Refresh Token mới nếu tài khoản đang có trạng thái `Locked`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-1.14: Xử lý Lỗi 401 do Khóa tài khoản tại Axios Interceptor**
  - Trong `axios.ts`, bắt mã lỗi 401 và kiểm tra chuỗi message lỗi trả về từ Backend.
  - Chặn luồng Auto-Refresh Token nếu lỗi là do tài khoản bị khóa, tiến hành xóa `localStorage` và redirect về màn hình Đăng nhập kèm tham số báo lỗi.
- [x] **TASK-1.15: Hiển thị cảnh báo ở màn Đăng nhập**
  - Bổ sung UI trên trang Login (`LoginPage.tsx`) để hiển thị thông báo "Phiên đăng nhập đã hết hạn hoặc tài khoản của bạn đã bị khóa" nếu URL chứa param liên quan đến việc bị khóa.

### 🕵️ QA Agent Tasks

- [x] **TASK-1.16: Kiểm thử Xử lý tài khoản bị khóa**
  - Chạy kịch bản đăng nhập bằng User thường để lấy Token. Đứng từ một màn hình có gọi API.
  - Dùng Admin khóa User này lại. Quay lại màn hình User thường và bấm tương tác để gọi API.
  - Xác nhận ngay lập tức trình duyệt của User thường bị đẩy về màn hình Đăng nhập với thông báo đỏ báo lỗi bị khóa, và Token đã bị xóa khỏi Session.

---

## Phase 4: Batch Request (Chiến dịch Cập nhật Hàng loạt)

### 🧑‍💻 Backend Agent Tasks

- [x] **TASK-4.1: Xây dựng Module Batch Request (Tạo mới & Đồng bộ trạng thái)**
  - Khởi tạo Controller/Service cho `BatchRequest`.
  - Xây dựng API `POST /api/batch-requests`: Khởi tạo đợt yêu cầu (nhận Title, Deadline, `targetUserIds`).
  - **Logic quan trọng:** Khi tạo thành công `batch_requests`, hệ thống phải tạo các bản ghi `batch_request_targets` với trạng thái `Outdated`. Đồng thời, cập nhật cột `status` của bảng `cv_profiles` tương ứng của các User đó sang trạng thái `Outdated` (Dựa theo quyết định DBD-03).
- [x] **TASK-4.2: Xây dựng API Quản lý & Hủy chiến dịch**
  - Xây dựng API `GET /api/batch-requests` (Có phân trang, tìm kiếm theo tiêu đề/trạng thái Active/Cancelled).
  - Xây dựng API `GET /api/batch-requests/:id/targets` để trả về danh sách chi tiết tiến độ của các nhân sự trong chiến dịch (Xem ai còn Outdated, ai đã Updated).
  - Xây dựng API `POST /api/batch-requests/:id/cancel` để hủy chiến dịch (chuyển trạng thái sang `Cancelled`).

### 🎨 Frontend Agent Tasks

- [x] **TASK-4.3: Giao diện Quản lý Chiến dịch (Dành cho HR)**
  - Tích hợp API `GET /api/batch-requests` vào trang danh sách Chiến dịch (`/hr/batch-requests`).
  - Xây dựng màn hình Chi tiết Chiến dịch (`/hr/batch-requests/:id`), tích hợp API lấy `targets` để hiển thị danh sách nhân viên và trạng thái cập nhật CV của họ. Có nút Cancel để gọi API hủy chiến dịch.
- [x] **TASK-4.4: Màn hình/Modal Tạo mới Batch Request**
  - Xây dựng Form tạo chiến dịch (Nhập Tiêu đề, Chọn Deadline qua DatePicker).
  - Xây dựng Component chọn nhân viên mục tiêu: Có tính năng filter nhân viên theo Phòng ban (Department) để HR có thể dễ dàng chọn tất cả nhân sự của một phòng ban đẩy vào danh sách `targetUserIds`.
  - Tích hợp gọi API `POST /api/batch-requests` và xử lý thông báo thành công.

### 🕵️ QA Agent Tasks

- [x] **TASK-4.5: Kiểm thử luồng Khởi tạo & Đồng bộ trạng thái (E2E)**
  - Đứng từ tài khoản HR, tạo một Batch Request chọn 2 nhân viên (Ví dụ: User A và User B).
  - Đảm bảo API trả về thành công.
  - Đăng nhập vào tài khoản của User A hoặc User B, kiểm tra xem trạng thái CV của họ trên UI có bị chuyển sang "Chưa cập nhật (Outdated)" không.
- [x] **TASK-4.6: Kiểm thử bộ lọc & luồng Hủy chiến dịch (Cancel)**
  - Kiểm tra tính năng lọc nhân viên theo phòng ban lúc tạo Batch Request có hoạt động chính xác không.
  - Tạo một Batch Request, sau đó bấm nút Cancel. Xác nhận trạng thái trên lưới dữ liệu chuyển sang Cancelled và không xảy ra lỗi crash hệ thống.

---

## 📍 Phase 5: Cập nhật hệ thống phân quyền (RBAC Matrix)

Giai đoạn này tập trung vào việc định hình lại Role-Based Access Control (RBAC) cho hệ thống, đảm bảo các chức năng hoạt động đúng theo ma trận phân quyền đã được định nghĩa trong SRS.

### ⚙️ Backend Agent Tasks

- [x] **TASK-5.1: Cập nhật phân quyền User & Batch Request API**
  - Mở quyền API `GET /api/users` và `GET /api/users/:id` cho các Role `HR` và `TechLead` thay vì chỉ `Admin`.
  - Đảm bảo API `GET`, `POST`, `CANCEL` của Batch Request cho phép cả `HR` và `Admin`.
- [x] **TASK-5.2: Nâng cấp cơ chế IDOR & Phân quyền CV API**
  - Mở rộng middleware `authorize` của các endpoint trong `cv.route.ts` để cho phép `HR`, `Admin` đi vào hệ thống.
  - Sửa đổi logic trong `cv.service.ts` để HR và Admin được phép Sửa (`updateDraft`, `restore`, `copy`) bất kỳ CV nào. 
  - Tech Lead được phép Xem nhưng không được phép Sửa CV của thành viên dự án.
- [x] **TASK-5.3: Cập nhật phân quyền Workflow (Duyệt CV)**
  - Cập nhật `workflow.route.ts` cho phép `Admin` truy cập các endpoint `/approve` và `/reject`.
  - Cập nhật hàm `verifyApproverScope` trong `workflow.service.ts`:
    - Level 1: Cho phép `TechLead` (của dự án) và `Admin` được duyệt.
    - Level 2: Cho phép `HR` và `Admin` được duyệt.

### 🎨 Frontend Agent Tasks

- [x] **TASK-5.4: Điều chỉnh UI rào chặn theo Role**
  - Đảm bảo giao diện tuân thủ RBAC mới: HR và Admin sẽ thấy các chức năng chỉnh sửa CV/duyệt CV của nhân sự.
  - Tech Lead sẽ thấy màn hình phê duyệt (Duyệt cấp 1) cho các thành viên trong dự án của mình.

### 🕵️ QA Agent Tasks

- [x] **TASK-5.5: Kiểm thử phân quyền của HR và Admin**
  - Đăng nhập dưới quyền HR: Tạo Batch Request (kiểm tra API User đã được mở khóa chưa).
  - Đăng nhập dưới quyền Admin: Thử sửa một bản nháp CV của nhân viên khác. Thử thao tác duyệt CV trực tiếp cấp 1 và cấp 2.
- [x] **TASK-5.6: Kiểm thử phân quyền của Tech Lead**
  - Đăng nhập dưới quyền Tech Lead: Kiểm tra chỉ xem được CV của nhân viên trong dự án. Thử duyệt một CV đang ở trạng thái PendingApproval và đảm bảo log lưu đúng level 1.
