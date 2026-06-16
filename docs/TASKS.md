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

---

## 👤 Phase 1.6: Chức năng Tự quản lý Hồ sơ Cá nhân (User Profile Self-Management)

Phần này bổ sung tính năng cho phép người dùng (tất cả các Role) có thể tự xem và chỉnh sửa thông tin cá nhân cơ bản của chính mình (như đổi mật khẩu, thông tin liên hệ, v.v.).

### ⚙️ Backend Agent Tasks

- [x] **TASK-1.17: Xây dựng API lấy thông tin cá nhân (`GET /api/users/me`)**
  - Xây dựng endpoint `GET /api/users/me` dựa vào `userId` lấy từ JWT token (Auth Middleware).
  - Trả về thông tin của User hiện tại kèm theo thông tin `Department` tương ứng (Join với bảng departments). Loại bỏ `password_hash` khỏi kết quả.
- [x] **TASK-1.18: Xây dựng API tự cập nhật thông tin (`PUT /api/users/me` và `PUT /api/users/me/password`)**
  - Xây dựng endpoint `PUT /api/users/me`: Cho phép user sửa các thông tin cơ bản (không bao gồm role và department_id để tránh leo thang đặc quyền).
  - Xây dựng endpoint `PUT /api/users/me/password`: Yêu cầu nhập mật khẩu cũ (oldPassword) và mật khẩu mới (newPassword). Validate mã hóa bcrypt trước khi đổi.

### 🎨 Frontend Agent Tasks

- [x] **TASK-1.19: Giao diện Trang Cá Nhân (Profile Page)**
  - Xây dựng trang `/profile` có thể truy cập được từ Menu người dùng (Avatar Dropdown góc phải trên cùng).
  - Tích hợp API `GET /api/users/me` để hiển thị thông tin Read-only (Role, Phòng ban) và thông tin có thể sửa.
  - Tích hợp API `PUT /api/users/me` vào Form lưu thông tin.
- [x] **TASK-1.20: Giao diện Đổi Mật Khẩu (Change Password Modal/Tab)**
  - Xây dựng form đổi mật khẩu bao gồm 3 trường: Mật khẩu hiện tại, Mật khẩu mới, Xác nhận mật khẩu mới.
  - Tích hợp API `PUT /api/users/me/password`, xử lý báo lỗi nếu sai mật khẩu cũ.
  - Xử lý hành động: Tự động Logout hoặc giữ nguyên đăng nhập sau khi đổi thành công (tùy theo logic bảo mật của hệ thống).

### 🕵️ QA Agent Tasks

- [x] **TASK-1.21: Kiểm thử bảo mật & Leo thang đặc quyền**
  - Đăng nhập với tư cách Employee. Gọi API `PUT /api/users/me` qua Postman, cố tình truyền thêm trường `role: "Admin"` hoặc đổi `department_id`.
  - Xác nhận Backend chặn các trường này và không thực sự cập nhật vào DB.
- [x] **TASK-1.22: Kiểm thử luồng Đổi mật khẩu (E2E)**
  - Sử dụng UI trang Profile đổi mật khẩu mới.
  - Đăng xuất ra và thử đăng nhập lại bằng mật khẩu cũ (Đảm bảo thất bại). Đăng nhập lại bằng mật khẩu mới (Đảm bảo thành công).

---

## 🛠️ Phase 6: Tối ưu hóa Error Message & Inline Validation (UX Refactoring)

Giai đoạn này tập trung vào việc làm rõ các thông báo lỗi từ Backend và nâng cấp trải nghiệm người dùng (UX) trên Frontend bằng cách hiển thị lỗi trực tiếp dưới từng ô nhập liệu (Inline Validation).

### ⚙️ Backend Agent Tasks

- [x] **TASK-6.1: Cập nhật Error Middleware**
  - Trong `error.middleware.ts`, sửa logic xử lý `ZodError`. Lấy lỗi đầu tiên trong mảng `err.errors` để làm `message` chính cấp cao nhất trả về cho Frontend (VD: `"Lỗi tại trường email: không đúng định dạng email"`).
- [x] **TASK-6.2: Cập nhật Global Zod Error Map**
  - Trong `zod.ts`, Việt hóa và làm rõ nghĩa các câu thông báo ở nhánh `default` và `custom` (thay cho chữ "Dữ liệu không hợp lệ" chung chung).
- [x] **TASK-6.3: Tinh chỉnh Business Logic Errors trong Services**
  - Rà soát các `BadRequestError` trong các service (VD: `project.service.ts`, `department.service.ts`). Thêm thông tin định danh (ID, mã code) vào thông báo lỗi để người dùng biết chính xác đối tượng nào đang bị lỗi (Lưu ý: Ngoại trừ lỗi Đăng nhập).

### 🎨 Frontend Agent Tasks

- [x] **TASK-6.4: Hỗ trợ đọc mảng `errors` từ API Response**
  - Đảm bảo cơ chế Axios hoặc Form Submit có thể lấy được mảng `errors` (chứa `field` và `message`) từ payload 400 Bad Request của Backend.
- [x] **TASK-6.5: Triển khai Inline Validation trên các Form chính**
  - Cập nhật các Form quan trọng (Tạo User, Sửa Profile, Quản lý Phòng ban, Tạo Chiến dịch) để ánh xạ trường `field` bị lỗi vào ô Input tương ứng, hiển thị text đỏ bên dưới ô nhập liệu.

### 🕵️ QA Agent Tasks

- [x] **TASK-6.6: Kiểm thử luồng Inline Validation**
  - Cố tình nhập sai định dạng email hoặc thiếu trường bắt buộc trên Form. Xác nhận UI hiển thị đúng lỗi dưới ô input tương ứng thay vì chỉ hiển thị một Toast "Dữ liệu không hợp lệ".
- [x] **TASK-6.7: Kiểm thử Business Error Messages**
  - Thử các nghiệp vụ lỗi như thêm User không tồn tại vào Project. Xác nhận Toast báo lỗi chứa thông điệp có định danh cụ thể của User đó.

---

## 🛡️ Phase 1.7: Cơ chế cách ly tài khoản Admin (Admin Isolation)

Bổ sung rào chắn bảo mật không cho phép Admin thao tác sửa, khóa, hay xóa lên tài khoản của một Admin khác.

### ⚙️ Backend Agent Tasks

- [x] **TASK-1.23: Cập nhật API Update/Delete User**
  - Chỉnh sửa `user.service.ts` tại các hàm `updateUser` và `deleteUser`.
  - Logic: Nếu `targetUser.role === 'Admin'` và `req.user.id !== targetUser.id`, bắn lỗi `403 Forbidden` với thông báo "Bạn không có quyền chỉnh sửa tài khoản Quản trị viên khác."
- [x] **TASK-1.24: Cập nhật API Lock/Unlock User**
  - Thực hiện logic tương tự cho các hàm `lockUser` và `unlockUser` trong `user.service.ts`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-1.25: Disable các thao tác trên giao diện Quản lý Người dùng**
  - Sửa đổi file `UserManagementPage.tsx` hoặc Component render danh sách Users.
  - Lấy `currentUser` từ Auth context. Nếu một row có `role === 'Admin'` và `id !== currentUser.id`, tiến hành làm mờ (disable) các nút Sửa, Khóa, Xóa ở cột hành động.
  - Bổ sung Tooltip giải thích lý do disable: "Không thể thao tác trên tài khoản Quản trị viên khác".

### 🕵️ QA Agent Tasks

- [x] **TASK-1.26: Kiểm thử bảo mật (E2E / API level)**
  - Đăng nhập Admin A. Truy cập giao diện Quản lý Người dùng, xác nhận các nút hành động trên dòng của Admin B đã bị khóa.
  - Thử lấy Access Token của Admin A và gọi API qua Postman để Xóa / Khóa Admin B. Xác nhận hệ thống trả về HTTP 403.
  - Kiểm tra Admin A tự sửa profile của chính mình qua `/api/users/me` vẫn hoạt động bình thường.

---

## 🎨 Phase 7: Tái cấu trúc UX/UI CV Editor (Continuous Scrolling)

Dựa trên việc tham khảo dự án `quickcv`, giai đoạn này sẽ thay đổi cách người dùng tương tác với Workspace từ việc bấm tab để chuyển form (rời rạc) sang việc cuộn một danh sách form dài (liền mạch).

### 🎨 Frontend Agent Tasks

- [x] **TASK-7.1: Chuyển đổi Layout của `CVWorkspace.tsx`**
  - Cập nhật cấu trúc màn hình Desktop từ 3 cột xuống còn 2 phần chính: Cột trái (Form nhập liệu) và Cột phải (Preview).
  - Tích hợp logic Responsive: Đối với màn hình Mobile/Tablet, sử dụng giao diện dạng Tabs (Tab "Chỉnh sửa" / Tab "Xem trước").
- [x] **TASK-7.2: Cải tạo `WorkspaceSidebar.tsx` thành Anchor Links**
  - Sidebar không còn lưu trữ state `activeSection` để render form cục bộ nữa.
  - Thay vào đó, khi click vào mục trên Sidebar, tiến hành thực thi Smooth Scroll tới thẻ ID chứa form tương ứng trong `CVEditorPanel`.
- [x] **TASK-7.3: Render dạng cuộn trong `CVEditorPanel.tsx`**
  - Xóa logic `if/else` để render từng form lẻ.
  - Thay bằng cơ chế render toàn bộ các form (`PersonalInfo`, `Experience`, `Education`, `Skills`,...) theo chiều dọc, phân tách nhau bằng khoảng trắng (gap) và có `id` rõ ràng để Sidebar trỏ tới.
  - Đảm bảo việc truyền hàm `handleSectionDataChange` cho từng phần không bị ảnh hưởng.

### 🕵️ QA Agent Tasks

- [x] **TASK-7.4: Kiểm thử trải nghiệm và tính liền mạch**
  - Xác nhận người dùng có thể dùng chuột cuộn mượt mà từ đầu đến cuối CV Editor mà không cần click Sidebar.
  - Bấm vào một mục trên Sidebar và chắc chắn màn hình cuộn đúng vị trí Form đó.
  - Thay đổi kích thước trình duyệt về Mobile và kiểm tra Tab Chỉnh sửa/Preview có hoạt động chính xác không.
  - Nhập liệu và đảm bảo tính năng **Auto-save / Lưu nháp** vẫn đồng bộ dữ liệu đúng như cũ.

---

## 📄 Phase 8: Thiết kế lại CV Workspace & Tích hợp chức năng Xuất PDF

Giai đoạn này sẽ đồng bộ hoàn toàn thiết kế của CV Workspace theo bản thiết kế `QuickCVMockup.tsx`, loại bỏ sidebar và bổ sung thư viện xuất PDF native bằng `@react-pdf/renderer`.

### ⚙️ Backend Agent Tasks

- [x] **TASK-8.1: Thêm cơ chế Validate cấu trúc CV**
  - Bổ sung xác thực cấu trúc `sectionsData` khi gọi API lưu CV (Draft / Submit). Chỉ cho phép các trường mặc định (`personalInfo`, `skills`, `experience`, `education`, `projects`), từ chối lưu dữ liệu với cấu trúc custom ngoài danh sách định sẵn.
  - Xóa bỏ các API liên quan đến Custom Sections (nếu có riêng).

### 🎨 Frontend Agent Tasks

- [x] **TASK-8.2: Thiết kế lại Layout `CVWorkspace.tsx` & Xóa Sidebar**
  - Gỡ bỏ hoàn toàn component `WorkspaceSidebar`.
  - Bổ sung Top Navigation Bar chứa nút Zoom (`scale`), Chuyển đổi View Mode (`split`/`tabs`), và nút Export PDF.
  - Áp dụng cấu trúc lưới (Grid) để phân chia Editor và Previewer tuân thủ thiết kế từ `QuickCVMockup.tsx`.
- [x] **TASK-8.3: Cập nhật UI của `CVEditorPanel.tsx`**
  - Xóa bỏ mọi logic liên quan đến việc render "Custom Sections".
  - Áp dụng phong cách UI dạng khối thẻ (Card) trắng viền xám bóng đổ (shadow-sm) cho từng Section (Thông tin cá nhân, Kỹ năng, Kinh nghiệm, v.v.).
- [x] **TASK-8.4: Tích hợp `@react-pdf/renderer` & Render PDF**
  - Cài đặt thư viện `@react-pdf/renderer`.
  - Viết mới component `CVPdfDocument.tsx` dựa trên các tag `<Document>`, `<Page>`, `<View>`, `<Text>` để tái tạo lại giao diện của `ResumeViewer`.
  - Tích hợp hook xuất PDF vào nút Download PDF trên Toolbar.
  - Đảm bảo font chữ Tiếng Việt được đăng ký (registerFont) để không bị lỗi ký tự khi tạo PDF.


### 🕵️ QA Agent Tasks

- [x] **TASK-8.5: Kiểm thử UI Layout & Validation**
  - Xác nhận CV Workspace hiển thị giống mockup, các nút Zoom và thay đổi view Mode (Tabs/Split) chạy chính xác.
  - Gửi payload độc hại lên Backend chứa "Custom Section" kiểm tra xem API có chặn đứng không (Validation).
- [x] **TASK-8.6: Kiểm thử File PDF Xuất ra**
  - Nhập dữ liệu tiếng Việt có dấu, độ dài nhiều trang.
  - Nhấn Download PDF và xác nhận File PDF không bị vỡ font tiếng Việt.
  - Xác nhận file PDF phân trang (page break) hợp lý và giống nhất có thể so với bản Preview trên trình duyệt.

---

## 🎨 Phase 9: Đồng bộ Cấu trúc Dữ liệu và Responsive UI theo QuickCVMockup

Giai đoạn này tập trung vào việc chuẩn hóa lại cấu trúc JSONB của CV để khớp 100% với dữ liệu mẫu trong `QuickCVMockup` (sửa tên trường, thêm trường icon), đồng thời fix các lỗi vỡ layout (spilling over) trên màn hình Editor.

### ⚙️ Backend Agent Tasks

- [x] **TASK-9.1: Cập nhật Type và Zod Schema cho cấu trúc CV mới**
  - Đổi lại schema Validation trong Backend cho cấu trúc JSONB `sectionsData` để chấp nhận các trường mới:
    - `personalInfo`: `name, about, role, email, phone, location, website, github, linkedin`
    - `experience`: `company, title, date, desc`
    - `education`: `institution, date, qualification`
    - `projects`: `name, link, desc`
    - `skills`: `name, icon` (nhận chuỗi string `<svg>`)

### 🎨 Frontend Agent Tasks

- [x] **TASK-9.2: Cập nhật Data Types Frontend**
  - Sửa đổi `export interface CVSections` trong `src/types/index.ts` để đồng bộ với cấu trúc mới của Mockup.
- [x] **TASK-9.3: Đồng bộ Giao diện CVPreviewPanel**
  - Thay thế toàn bộ mã nguồn của `CVPreviewPanel.tsx` bằng component `ResumeViewer` từ `QuickCVMockup.tsx`.
  - Đảm bảo font chữ `Inter` và CSS inlines được giữ nguyên. Tích hợp dữ liệu thật từ `cvData` vào Preview thay cho dữ liệu cứng.
  - Áp dụng state `scale` từ Zoom Slider để thu phóng Preview chính xác.
- [x] **TASK-9.4: Sửa form nhập liệu và Fix lỗi Tràn Component**
  - Cập nhật lại các input trong `CVEditorPanel.tsx` (Personal, Exp, Edu, Project) theo đúng bộ field mới.
  - Form **Kỹ năng (Skills)**: Thêm Input/Textarea cho phép nhập chuỗi `<svg>`.
  - Sửa các lỗi tràn giao diện (Overflow) bằng CSS (thêm `overflow-hidden`, `min-w`, `flex-wrap`...) để responsive trên màn hình nhỏ và tránh tràn do Zoom.

### 🕵️ QA Agent Tasks

- [x] **TASK-9.5: Kiểm thử Cấu trúc Dữ liệu & UI**
  - Thử tạo CV mới, điền các trường `location`, `github`, `linkedin` xem có lưu đúng xuống Backend không.
  - Lấy mã thẻ `<svg>` và paste vào form Skills, đảm bảo hiển thị đúng kích thước logo trên Preview.
  - Phóng to Zoom lên 150% và test trên màn hình nhỏ xem có nút bấm/Form nào bị lỗi tràn (spilling) ra ngoài không.

---

## 🗑️ Phase 9.1: Loại bỏ tính năng nhập SVG Icon

Giai đoạn nhỏ này giải quyết yêu cầu gỡ bỏ tính năng dán mã SVG cho phần Kỹ năng (Skills) nhằm đơn giản hóa quá trình nhập liệu.

### ⚙️ Backend Agent Tasks

- [x] **TASK-9.6: Xóa trường Icon khỏi Schema**
  - Cập nhật lại Zod Schema trong các API quản lý CV (nếu có validate `sectionsData`), gỡ bỏ trường `icon` ra khỏi object `skills`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-9.7: Gỡ giao diện nhập và render SVG**
  - Sửa lại `export interface CVSections` trong `src/types/index.ts`, đổi `skills: { name: string; icon: string }[]` thành `skills: { name: string }[]`.
  - Trong `CVEditorPanel.tsx` (hoặc form con tương ứng), xóa bỏ các thẻ `<textarea>` hay `<input>` đang dùng để nhập SVG code.
  - Trong `CVPreviewPanel.tsx` và `CVPdfDocument.tsx`, xóa logic render HTML thẻ `<svg>` bên cạnh tên kỹ năng. Điều chỉnh lại căn lề/khoảng cách của text sao cho các nhãn kỹ năng (badge) trông cân đối khi không có icon.

### 🕵️ QA Agent Tasks

- [x] **TASK-9.8: Kiểm thử hồi quy UI Kỹ năng**
  - Thêm thử vài kỹ năng mới, xác nhận form không còn ô nhập icon.
  - Xem thử bản Preview và file PDF xuất ra để đảm bảo các nhãn kỹ năng không bị lỗi Layout khi mất đoạn thẻ icon.

---

## 🕒 Phase 5: Notifications & Cronjob (Hệ thống Bất đồng bộ)

Xây dựng Worker và Queue (Redis/BullMQ) chạy ngầm không ảnh hưởng UI. Giai đoạn này tập trung vào luồng gửi Email tự động và lập lịch Cronjob.

### ⚙️ Backend Agent Tasks

- [x] **TASK-5.1: Cài đặt và cấu hình Redis/BullMQ/Nodemailer**
  - Cài đặt các package cần thiết: `bullmq`, `ioredis`, `nodemailer`, `mailtrap`.
  - Thiết lập module Mailer sử dụng `MAILTRAP_API_KEY` đã có trong `.env`.
  - Khởi tạo kết nối Redis và cấu hình Queue (VD: `emailQueue`).
- [x] **TASK-5.2: Xây dựng Email Worker**
  - Tạo Worker để lắng nghe `emailQueue`.
  - Thiết kế logic render nội dung email tùy thuộc vào loại sự kiện:
    - Gửi mail báo cho HR/Tech Lead khi có CV mới.
    - Gửi mail báo cho Nhân viên khi CV bị Reject.
- [x] **TASK-5.3: Tích hợp Queue vào luồng API CV**
  - Trong các hàm xử lý nộp CV (Submit CV) và từ chối CV (Reject CV) ở Service, bổ sung logic đẩy (push) Job vào `emailQueue` thay vì gọi gửi mail đồng bộ.
- [x] **TASK-5.4: Thiết lập Daily Cronjob**
  - Sử dụng BullMQ Repeatable Jobs (hoặc `node-cron`) để tạo tác vụ chạy định kỳ vào 8:00 sáng mỗi ngày.
  - Logic Cronjob: Quét bảng `BatchRequestTarget`, tìm các target đang ở trạng thái `Outdated` sắp tới deadline, sau đó đẩy Job gửi mail hối thúc (Remind) vào `emailQueue`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-5.5: Thêm nút Gửi Hối thúc (Manual Remind) trên UI**
  - Tại giao diện Chi tiết Chiến dịch (Batch Request Details), thêm một nút "Nhắc nhở" bên cạnh các nhân viên đang nợ CV (trạng thái `Outdated`).
  - Gọi API backend (cần Backend bổ sung API này) để đẩy ngay một Job nhắc nhở vào Queue mà không cần đợi tới 8:00 sáng. Hiển thị Toast thông báo "Đã gửi email nhắc nhở".

### 🕵️ QA Agent Tasks

- [x] **TASK-5.6: Kiểm thử hiệu năng (Async test)**
  - Click Submit / Reject CV trên giao diện, đo thời gian response của API. Phải đảm bảo API phản hồi cực nhanh (<300ms) trong khi hệ thống gửi mail vẫn đang chạy ngầm.
  - Kiểm tra hòm thư Mailtrap xem có nhận được đúng nội dung email không.
- [x] **TASK-5.7: Kiểm thử Cronjob**
  - Giả lập thời gian chạy Cronjob (hoặc điều chỉnh lịch Cron về `* * * * *` chạy mỗi phút) để xác nhận hệ thống tự động quét DB và đẩy email hối thúc chính xác.

---

## 🐞 Hotfix: Fix lỗi Disable nút thao tác trên Workspace

Mục đích: Sửa lỗi Frontend khóa tính năng "Lưu nháp" và "Nộp CV" khi trạng thái của CV đã được duyệt (`CVStatus.Updated`).

### 🎨 Frontend Agent Tasks

- [x] **TASK-HOTFIX.1: Sửa logic disable nút trong `CVWorkspace.tsx`**
  - Tìm nút **Lưu nháp** và **Nộp CV**.
  - Gỡ bỏ điều kiện `cvData.status === 'Updated'` ra khỏi prop `disabled` để cho phép người dùng lưu nháp phiên bản mới sau khi CV cũ đã được duyệt.
  - Sửa lại nội dung text hiển thị trên nút "Nộp CV" (hiện tại nếu trạng thái là `Updated` thì đang hiển thị "Đã duyệt", nhưng nếu người dùng sửa nháp thì nó nên trở lại thành "Nộp CV" hoặc "Cập nhật CV").

---

## 🔔 Phase 11: In-App Notifications

Hệ thống thông báo In-App đơn giản, không theo dõi trạng thái Đã đọc/Chưa đọc. Hỗ trợ thông báo cá nhân (Private) và thông báo chung toàn hệ thống (Global).

### ⚙️ Backend Agent Tasks

- [x] **TASK-11.1: Cập nhật Schema & Khởi tạo Module**
  - Đưa model `Notification` vào `schema.prisma` và chạy Prisma Push/Migrate.
  - Khởi tạo Controller, Service, Route cho module Notification.
- [x] **TASK-11.2: Xây dựng API Quản lý thông báo**
  - `GET /api/notifications`: Lấy danh sách thông báo (Private + Global) sắp xếp theo thời gian mới nhất (`createdAt: 'desc'`).
  - `POST /api/notifications/broadcast`: API dành cho Admin/HR để tạo thông báo với `isGlobal = true`.
- [x] **TASK-11.3: Tích hợp vào Workflow CV hiện tại**
  - Trong Service duyệt/từ chối CV, tự động tạo Notification cá nhân (gắn `userId`) thông báo kết quả cho chủ nhân CV.
  - Nếu CV bị Reject, nội dung thông báo kèm lý do từ chối.

### 🎨 Frontend Agent Tasks

- [x] **TASK-11.4: Tích hợp Polling vào Topbar**
  - Gỡ bỏ mock data trong `NotificationDropdown`. Dùng React Query gọi `GET /api/notifications` mỗi 30s (`refetchInterval: 30000`).
  - Gỡ bỏ con số Badge đỏ (Unread Count) trên chuông thông báo (chỉ hiển thị icon chuông).
  - Tích hợp link: Khi click vào Notification, nếu có trường `link`, tự động điều hướng sang trang tương ứng.
- [x] **TASK-11.5: Giao diện Broadcast (Admin/HR)**
  - Tạo Form trong màn hình Dashboard cho phép HR gửi "Thông báo toàn hệ thống" (gọi `POST /api/notifications/broadcast`).

### 🕵️ QA Agent Tasks

- [x] **TASK-11.6: Kiểm thử luồng thông báo**
  - Đăng nhập HR từ chối CV, kiểm tra xem màn hình của Nhân viên có tự cập nhật thông báo mới (trong vòng 30s) trên danh sách thả xuống không.
  - Dùng tài khoản Admin gửi Broadcast. Kiểm tra các tài khoản khác xem có hiện chung thông báo đó không.

---

## 👀 Phase 12: Xem phiên bản CV đã duyệt

Cho phép người dùng (nhân sự hoặc quản lý) xem nhanh bản CV chính thức đang được sử dụng (bản đã được duyệt gần nhất), tách biệt với bản nháp đang chỉnh sửa dở dang trong Workspace.

### ⚙️ Backend Agent Tasks

- [x] **TASK-12.1: Bổ sung API lấy phiên bản đã duyệt gần nhất**
  - Tạo endpoint `GET /api/cvs/:id/latest-approved`.
  - Logic: Tìm trong bảng `CVVersionHistory` record có `cvProfileId = id` và `versionNumber` lớn nhất. 
  - Nếu không tìm thấy (CV chưa từng được duyệt, `versionNumber = 0`), trả về lỗi 404.
  - Quyền truy cập: Cùng rule truy cập như `getCVById` (Chủ nhân CV, TechLead của dự án, HR, Admin).

### 🎨 Frontend Agent Tasks

- [x] **TASK-12.2: Xây dựng trang Xem CV Read-only (CV Viewer)**
  - Tạo Page mới `CVViewerPage.tsx` gắn với route `/cv/:id/view`.
  - Gọi API `GET /api/cvs/:id/latest-approved`. 
  - Truyền `snapshotData` vào component `<CVPreviewPanel>` để render giao diện CV (chỉ xem, không có công cụ chỉnh sửa). Có thêm nút "Tải PDF".
- [x] **TASK-12.3: Bổ sung nút bấm vào Dashboard**
  - Sửa `CVDashboard.tsx`.
  - Nếu `cv.versionNumber > 0`, bổ sung nút **"Xem bản đã duyệt"** thay thế cho nút "Publish" (giữ cho giao diện gọn gàng).
  - Khi click nút này, điều hướng tới `/cv/:id/view`.

### 🕵️ QA Agent Tasks

- [x] **TASK-12.4: Kiểm thử hiển thị đúng Snapshot**
  - Thực hiện kịch bản: Tạo CV -> Nộp -> Duyệt (Bản duyệt v1). Vào lại Workspace thêm "Kỹ năng mới" và lưu nháp.
  - Ra Dashboard bấm "Xem bản đã duyệt". Xác nhận "Kỹ năng mới" không hiển thị ở đây (vì nó chỉ mới lưu nháp, chưa được duyệt).

---

## 🔴 Phase 13: Cải tiến Badge Thông báo (Red Dot)

Phục hồi dấu chấm đỏ báo hiệu có thông báo mới (giống Facebook) với kiến trúc cực nhẹ dùng `lastCheckedNotifAt`. Hệ thống có độ trễ nhỏ (30s) nhưng người dùng không cần F5.

### ⚙️ Backend Agent Tasks

- [ ] **TASK-13.1: Cập nhật Schema**
  - Thêm trường `lastCheckedNotifAt DateTime?` vào model `User` trong `schema.prisma`. Chạy Prisma Migrate/Push.
- [ ] **TASK-13.2: Viết API Kiểm tra thông báo mới**
  - Tạo endpoint `GET /api/notifications/check-new`.
  - Logic: Lấy thông báo mới nhất (Private của User hoặc Global). So sánh `createdAt` với `user.lastCheckedNotifAt`. Trả về `{ hasNew: boolean }`.
- [ ] **TASK-13.3: Viết API Đánh dấu đã kiểm tra**
  - Tạo endpoint `PUT /api/notifications/mark-checked`.
  - Logic: Cập nhật `user.lastCheckedNotifAt = new Date()`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-13.4: Tích hợp Polling lấy cờ Red Dot**
  - Sử dụng React Query gọi `GET /api/notifications/check-new` mỗi 30 giây (`refetchInterval: 30000`).
  - Nếu `hasNew: true`, hiển thị một dấu chấm đỏ nhỏ (Red Dot Badge) đè lên Icon Chuông thông báo trên Topbar.
- [x] **TASK-13.5: Xử lý thao tác Click**
  - Sửa logic khi người dùng click vào Icon Chuông:
    1. Gọi ngầm API `PUT /api/notifications/mark-checked`.
    2. Gỡ dấu chấm đỏ trên giao diện.

### 🕵️ QA Agent Tasks

- [x] **TASK-13.6: Kiểm thử Red Dot**
  - Dùng 2 trình duyệt: Trình duyệt A (Admin) gửi Broadcast. 
  - Xem Trình duyệt B (Nhân viên) sau tối đa 30s có tự nhảy ra dấu chấm đỏ không (không F5).
  - Bấm vào Chuông -> dấu đỏ mất. Tắt/Bật chuông lại -> dấu đỏ vẫn không hiện ra.

---

## ⏱️ Phase 14: Thực thi SLA Phê duyệt (SLA Enforcement)

Chuyển đổi SLA từ trạng thái hiển thị thụ động sang luồng xử lý chủ động. Hệ thống sẽ có Cronjob tự động quét các CV quá hạn/sắp quá hạn và "thúc giục" Tech Lead hoặc HR.

### ⚙️ Backend Agent Tasks

- [x] **TASK-14.1: Xây dựng Logic Quét SLA (SLA Scanner)**
  - Viết một Service (VD: `workflow.cron.ts`) tìm toàn bộ CV đang ở `PendingApproval`.
  - Tính toán số giờ kể từ `submittedAt`. Lọc ra các CV thuộc diện Warning (>= 24h) và Overdue (>= 48h).
  - Phân tích `approvalLogs` để tìm ra ai đang giữ trách nhiệm duyệt:
    - Chưa có log cấp 1: Tìm ID của TechLead (thông qua project của User nộp CV).
    - Đã duyệt cấp 1: Tìm ID của tất cả HR.
- [x] **TASK-14.2: Tích hợp Cảnh báo & Đăng ký Cronjob**
  - Dùng Module Notification (Phase 11) để tạo In-App Notification nhắc nhở đích danh những người duyệt này.
  - Đồng thời đẩy 1 Job nhắc nhở vào `emailQueue`. *(Lưu ý: Do SMTP hiện đang lỗi, Mailer worker có thể fail, nhưng logic push queue vẫn cần viết đúng chuẩn).*
  - Dùng BullMQ Repeatable Jobs (hoặc `node-cron`) hẹn lịch quét hàm này chạy định kỳ vào **8:00 sáng hàng ngày**.

### 🎨 Frontend Agent Tasks

- [x] **TASK-14.3: Bổ sung Cảnh báo SLA vào Màn hình Chi tiết**
  - Sửa `ApprovalDetailPage.tsx`.
  - Hiển thị một thanh Banner (Alert) màu Vàng hoặc Đỏ ngay sát dưới Header nếu CV đang xem ở trạng thái `Warning` hoặc `Overdue` SLA, nhằm tạo áp lực cho người duyệt xử lý ngay.

### 🕵️ QA Agent Tasks

- [x] **TASK-14.4: Kiểm thử luồng quét SLA**
  - Chỉnh sửa (mock) thời gian `submittedAt` của 1 CV dưới Database lùi về 30 tiếng trước (Warning) và 1 CV lùi về 50 tiếng (Overdue).
  - Gọi chạy Cronjob bằng tay.
  - Kiểm tra xem tài khoản TechLead tương ứng có nhận được chuông thông báo In-app "nhắc nhở duyệt" không.

---

## 🏁 Phase 15: Vòng đời Chiến dịch Cập nhật CV (Batch Request Lifecycle)

Bổ sung tính năng Tự động chốt sổ (Auto-Complete) khi tất cả nhân sự trong chiến dịch đã hoàn thành yêu cầu, giúp HR quản lý chiến dịch khép kín thay vì chỉ có trạng thái Active/Cancelled.

### ⚙️ Backend Agent Tasks

- [x] **TASK-15.1: Cập nhật Schema**
  - Bổ sung giá trị `Completed` vào enum `BatchRequestStatus` trong `schema.prisma`. Chạy Prisma Push/Migrate.
- [x] **TASK-15.2: Tự động Hoàn thành (Auto-Complete)**
  - Chỉnh sửa Service duyệt CV (`workflow.service.ts`): Khi duyệt CV thành công -> Cập nhật `BatchRequestTarget` thành `Updated`.
  - Kiểm tra các Target khác trong cùng chiến dịch. Nếu `count(status = 'Outdated') == 0`, đổi trạng thái `BatchRequest` thành `Completed`.
  - Gửi 1 In-App Notification cho người tạo chiến dịch (HR): `Chiến dịch "..." đã hoàn tất 100%`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-15.3: UI Hiển thị Trạng thái & Quá hạn**
  - Trong trang Danh sách và Chi tiết Chiến dịch: Hiển thị Badge `Completed` (Xanh lá).
  - Tự động tính toán hiển thị Badge **`Quá hạn`** (Màu cam/đỏ) nếu trạng thái đang là `Active` nhưng thời gian hiện tại đã vượt qua `deadline`. Giao diện có thể cảnh báo nhưng vẫn cho phép nộp.
  - Ẩn nút "Nhắc nhở", "Hủy chiến dịch" và "Sửa deadline" nếu trạng thái đã chuyển sang `Completed` hoặc `Cancelled`.

### 🕵️ QA Agent Tasks

- [x] **TASK-15.4: Kiểm thử vòng đời tự động**
  - Tạo 1 chiến dịch cho 2 nhân viên (A và B).
  - Đóng vai HR duyệt CV của nhân viên A -> Check chiến dịch vẫn là `Active`.
  - Đóng vai HR duyệt CV của nhân viên B -> Check chiến dịch tự nhảy sang `Completed` và có thông báo gửi về hệ thống cho HR.

---

## 🧹 Phase 16: Xóa bỏ Mockup & Cấu hình Dashboard Analytics

Thực hiện Hạng mục 1 trong kế hoạch làm sạch Technical Debt. Loại bỏ hoàn toàn dữ liệu cứng (mock data) trên trang Dashboard và thay thế bằng dữ liệu thật từ Backend API.

### ⚙️ Backend Agent Tasks

- [x] **TASK-16.1: Khởi tạo Module Dashboard**
  - Tạo thư mục `src/modules/dashboard` bao gồm controller, service và route.
  - Viết API `GET /api/dashboard/stats`: Group và đếm tổng số CV, số CV đang chờ duyệt (`PendingApproval`), số CV đã cập nhật (`Updated`), số CV lỗi thời (`Outdated`). Phân quyền: Employee chỉ xem thống kê của cá nhân, TechLead xem của dự án mình, HR/Admin xem toàn hệ thống.
  - Viết API `GET /api/dashboard/recent-cvs`: Trả về danh sách 5-10 CV vừa được cập nhật gần nhất (`orderBy { updatedAt: 'desc' }`).

### 🎨 Frontend Agent Tasks

- [x] **TASK-16.2: Tích hợp API vào Dashboard**
  - Viết `dashboard.service.ts` để gọi 2 API trên.
  - Xóa bỏ file `src/mocks/cvs.mock.ts`.
  - Cập nhật file `DashboardOverview.tsx`: Sử dụng `useEffect` hoặc React Query để fetch dữ liệu từ Backend.
  - Render các con số ở 4 Card đầu trang và đổ dữ liệu thật vào bảng "CV Cập nhật gần đây".

### 🕵️ QA Agent Tasks

- [x] **TASK-16.3: Kiểm thử Dashboard phân quyền**
  - Đăng nhập bằng Account Nhân viên: Kiểm tra xem Dashboard có hiện đúng thông số của riêng nhân viên đó không.
  - Đăng nhập bằng Account Admin: Kiểm tra xem số tổng (VD: Tổng số CV toàn công ty) có khớp với dưới Database không.

---

## 📧 Phase 17: Kích hoạt SMTP Email Thực tế

Thực hiện Hạng mục 3 trong kế hoạch làm sạch Technical Debt. Cấu hình hệ thống SMTP thực tế để các Email thông báo (Nhắc nhở cập nhật, Duyệt CV, SLA) thực sự được gửi tới hòm thư của người dùng thay vì chỉ chạy log ngầm do lỗi xác thực.

### ⚙️ Backend Agent Tasks

- [x] **TASK-17.1: Cấu hình môi trường SMTP**
  - Đăng ký hoặc sử dụng thông tin tài khoản SMTP thật (Ví dụ: Mailtrap cho môi trường Test, hoặc tài khoản Gmail App Passwords).
  - Bổ sung cấu hình `SMTP_HOST`, `SMTP_PORT` (nếu cần) và cập nhật thông tin credentials thật vào file `.env` cũng như format mẫu tại `.env.example`.
- [x] **TASK-17.2: Rà soát module `mailer.ts` và BullMQ Worker**
  - Kiểm tra lại logic cấu hình Nodemailer Transport (`src/modules/notification/mailer.ts`).
  - Chắc chắn Worker xử lý `emailQueue` hoạt động bắt lỗi (try/catch) chuẩn xác và log rõ ràng trạng thái gửi.

### 🕵️ QA Agent Tasks

- [x] **TASK-17.3: Kiểm thử End-to-End quá trình gửi/nhận Email**
  - Sử dụng API hoặc giao diện để trigger 1 sự kiện gửi mail (ví dụ: Chuyển trạng thái Duyệt CV hoặc gửi Broadcast Notification nếu có tích hợp mail).
  - Kiểm tra hòm thư thực tế (hoặc Mailtrap Inbox) để xác nhận Email đã vào Inbox thành công, không bị rơi vào trạng thái Fail ngầm. Đảm bảo giao diện HTML của Email hiển thị đẹp mắt.

---

## 🔍 Phase 18: Tối ưu Lọc/Tìm kiếm luồng Phê duyệt (Server-side)

Thực hiện Hạng mục 4 trong kế hoạch làm sạch Technical Debt. Chuyển đổi logic filter và search từ việc fetch toàn bộ dữ liệu lên Frontend sang việc query tối ưu bằng Prisma ở Backend nhằm đảm bảo hiệu năng khi số lượng CV tăng lên.

### ⚙️ Backend Agent Tasks

- [x] **TASK-18.1: Nâng cấp hàm Search/Filter trong Workflow Service**
  - Tìm service chịu trách nhiệm trả về danh sách phê duyệt cho TechLead/HR (ví dụ: `cvService.searchCVs` hoặc API `/api/workflow/pending`).
  - Bổ sung logic Prisma để nhận tham số `?keyword=...` (tìm theo `user.fullName` hoặc `user.username` có chứa keyword).
  - Bổ sung logic nhận tham số `?slaStatus=...` (Warning / Overdue / Safe). Chú ý phải so sánh trường `submittedAt` với thời gian hiện tại (`NOW()`) ngay trong câu query hoặc tính toán động nếu cần.
  - Tích hợp thêm tính năng Phân trang (Pagination) với `skip` và `take`.

### 🎨 Frontend Agent Tasks

- [x] **TASK-18.2: Đẩy Params vào API & Giao diện Phân trang**
  - Sửa trang `ApprovalRequestListPage.tsx`.
  - Thay vì filter dữ liệu ở biến local (`filteredCVs = allCVs.filter(...)`), hãy map state của SearchBox và Dropdown Filter thành Query Params khi gọi API Backend.
  - Tích hợp debounce cho SearchBox (nhập xong 500ms mới gọi API).
  - Bổ sung thanh điều hướng Phân trang (Next/Prev Page) dưới bảng nếu Backend trả về dạng Pagination.

### 🕵️ QA Agent Tasks

- [x] **TASK-18.3: Kiểm thử Filter và Hiệu suất Search**
  - Gõ text tìm kiếm, kiểm tra Network tab xem có gọi API dạng `?keyword=text` không.
  - Đổi filter SLA, kiểm tra danh sách trả về có khớp chính xác với mốc thời gian cảnh báo hay không.
