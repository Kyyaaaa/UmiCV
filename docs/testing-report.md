# Testing Report

## Executive Summary
- **Tổng số lỗi**: 15 (3 Critical, 4 High, 5 Medium, 3 Low)
- **Tổng số rủi ro bảo mật**: 5
- **Đánh giá chất lượng backend**: 
  Backend có cấu trúc Modular Monolith rõ ràng và tuân thủ tốt Layered Architecture. Hệ thống sử dụng tốt PostgreSQL và Redis BullMQ như thiết kế. Tuy nhiên, hệ thống hoàn toàn thiếu Test Coverage (0%), tồn tại nhiều lỗ hổng bảo mật nghiêm trọng liên quan đến Broken Object Level Authorization (BOLA/IDOR), thiếu cơ chế quản lý vòng đời Session chặt chẽ, và có lỗi Runtime chí mạng ở module Auth. 
  **Kết luận**: Backend **CHƯA SẴN SÀNG** cho Frontend tích hợp. Cần sửa các lỗi Critical & High và bổ sung Automation Test trước.

## Critical Issues

1. **File**: `src/modules/auth/auth.service.ts` | **Hàm**: `refresh` | **Dòng**: 41
   - **Lỗi**: `ReferenceError: verifyToken is not defined`. Thiếu import `verifyToken` từ file tiện ích. Lỗi này làm hỏng hoàn toàn luồng Refresh Token.
   - **Đề xuất**: Cập nhật dòng 3: `import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.util';`.

2. **File**: `src/modules/search/search.route.ts` & `search.service.ts` | **Hàm**: `diffCV`
   - **Lỗi**: Lỗ hổng Broken Object Level Authorization (IDOR). Endpoint `GET /api/cvs/:id/diff` chỉ yêu cầu đăng nhập (`authenticate`) nhưng không kiểm tra quyền. Bất kỳ người dùng nào cũng có thể đọc CV của người khác.
   - **Đề xuất**: Thêm kiểm tra quyền trong Service: Người xem phải là chủ sở hữu của CV (`req.user.userId === cv.userId`) HOẶC có role `TechLead`/`HR`/`Admin` (kèm kiểm tra phạm vi dự án).

3. **File**: `src/modules/workflow/workflow.service.ts` | **Hàm**: `approveCV` & `rejectCV`
   - **Lỗi**: Lỗ hổng IDOR. Hệ thống cho phép bất kỳ user nào có role `TechLead` hoặc `HR` duyệt/từ chối BẤT KỲ CV nào trong hệ thống, không quan tâm `approverId` có phụ trách dự án hay phòng ban của CV đó hay không.
   - **Đề xuất**: Lấy dữ liệu `departmentId` và `projectId` của CV, đối chiếu với quyền hạn của `approverId` (TechLead phải thuộc dự án của Employee, HR phải quản lý phòng ban đó).

## High Issues

1. **File**: `src/modules/auth/auth.route.ts`
   - **Lỗi**: Thiếu tính năng Đăng xuất (Logout). Refresh Token sống vĩnh viễn trong 7 ngày và không thể bị thu hồi khi user đăng xuất, đổi mật khẩu hoặc bị vô hiệu hóa.
   - **Đề xuất**: Thêm endpoint `POST /api/auth/logout`, xóa HttpOnly cookie và lưu token vào Blacklist trên Redis.

2. **File**: `src/modules/workflow/workflow.service.ts` | **Hàm**: `submitDraft`
   - **Lỗi**: Khi gửi duyệt, hệ thống update toàn bộ các bản CV có trạng thái `Draft` hoặc `Outdated` của user thành `PendingApproval`. API Contract thiếu `languageCode`, dẫn đến việc submit sai ngôn ngữ mong muốn nếu user có nhiều bản dịch.
   - **Đề xuất**: Nhận `languageCode` từ payload (hoặc mặc định 'vi') và chỉ update đúng bản CV Profile đó.

3. **File**: `src/app.ts`
   - **Lỗi**: Không có Rate Limiting. Rất dễ bị tấn công Brute-force/Credential Stuffing vào API Login.
   - **Đề xuất**: Cài đặt `express-rate-limit` cho endpoint `/api/auth/login`.

4. **File**: `src/modules/cv/cv.route.ts`
   - **Lỗi**: Tổ chức Route lộn xộn. `GET /api/cvs/search` được tài liệu định nghĩa thuộc CV Management nhưng mã nguồn lại đặt trong `search.route.ts`. Gây khó khăn trong bảo trì.

## Medium Issues

1. **File**: `src/modules/auth/auth.route.ts` | **Hàm**: `refresh`
   - **Lỗi**: Không có Validate Middleware. Dù token lấy từ cookie, vẫn nên có schema validation để chuẩn hóa lỗi trả về (tránh crash hoặc lỗi không theo format chuẩn).

2. **File**: `src/modules/search/search.service.ts` | **Hàm**: `searchCVs`
   - **Lỗi**: Cú pháp tìm kiếm nội dung JSON (`string_contains`) sử dụng tính năng cơ bản của Prisma, không tận dụng được sức mạnh của GIN Index (toán tử `@>`) như thiết kế trên PostgreSQL, gây giảm hiệu năng khi dữ liệu lớn.
   - **Đề xuất**: Viết Raw SQL cho truy vấn tìm kiếm Text bên trong `sectionsData`.

3. **File**: `src/modules/search/search.service.ts` | **Hàm**: `diffCV`
   - **Lỗi**: Trả về dữ liệu không khớp API Contract. Backend chỉ trả về `original` và `draft` nhưng thiếu field `diff`. 
   - **Đề xuất**: Bổ sung hàm tính diff ở backend (bằng thư viện `json-diff` hoặc `jsdiff`) hoặc cập nhật lại API Contract để Frontend tự xử lý.

4. **File**: `src/modules/notification/notification.cron.ts`
   - **Lỗi**: Lấy toàn bộ `BatchRequestTarget` chưa cập nhật ra RAM bằng `findMany` mà không phân trang (pagination). Có nguy cơ tràn bộ nhớ (Out of Memory) với số lượng lớn.
   - **Đề xuất**: Dùng kỹ thuật xử lý hàng loạt (Batch Processing) với cấu trúc `take/skip` hoặc Cursor.

5. **File**: `src/modules/batch-request/batch-request.service.ts` | **Hàm**: `cancelBatchRequest`
   - **Lỗi**: Chỉ hủy trạng thái chiến dịch (`status = Cancelled`) mà bỏ quên việc cập nhật/hủy trạng thái các targets (`BatchRequestTarget`) và không rollback trạng thái của `CVProfile`.

## Low Issues

1. **File**: `src/middleware/error.middleware.ts`
   - Lỗi Unhandled Exception ghi log bằng `console.error` làm mất format, lộ stack trace ở môi trường development. Cần tích hợp Logger chuẩn như Winston/Pino.
2. **File**: `src/modules/cv/cv.controller.ts`
   - Việc `languageCode = (req.query.languageCode as string) || 'vi'` nên được xử lý bằng Zod Validator với default value thay vì hardcode ở Controller.
3. **File**: `src/modules/batch-request/batch-request.route.ts`
   - Thiếu middleware validate Zod cho endpoint `/cancel`.

## Security Findings
- **CRITICAL**: BOLA/IDOR cho phép duyệt, từ chối và đọc CV trái phép (Missing ownership and scope checks).
- **HIGH**: Không thể thu hồi JWT Refresh Token (Missing Session Revocation).
- **HIGH**: Nguy cơ Bruteforce Mật khẩu (Missing Rate Limit).
- **MEDIUM**: Không bắt ràng buộc độ khó cho mật khẩu trong Zod schema.

## Missing Tests
- **Test Coverage**: 0%
- Module, Service, Controller, Middleware chưa có bất kỳ file test nào.
- Thư mục `tests/` hoặc `__tests__/` hoàn toàn vắng mặt trong repo.

## Recommended Test Cases

### 1. Auth Module
- **TC1.1**: Login thành công với username và password hợp lệ -> Trả về 200 OK, Access Token và Refresh Token (Set-Cookie).
- **TC1.2**: Login thất bại với sai password -> Trả về 401 Unauthorized.
- **TC1.3**: Làm mới token thành công bằng cookie hợp lệ -> Trả về 200 OK, Access Token mới.
- **TC1.4**: Refresh token bị lỗi 401 khi không gửi cookie.

### 2. CV & Workflow Module
- **TC2.1**: Employee xem bản Draft của chính mình -> Trả về 200 OK và JSON schema.
- **TC2.2**: Employee gọi API Submit Draft với languageCode -> Trạng thái đổi thành `PendingApproval`.
- **TC2.3**: TechLead duyệt CV thuộc dự án quản lý -> Trả về 200 OK, tạo dòng log Approval (Level 1).
- **TC2.4**: TechLead cố gắng duyệt CV KHÔNG thuộc dự án của mình -> Trả về 403 Forbidden.
- **TC2.5**: Nhân sự cố gắng sửa CV khi trạng thái đang là `PendingApproval` -> Trả về 400 BadRequest.

### 3. Search & Batch Request Module
- **TC3.1**: Tìm kiếm keyword có trong JSONB -> Trả về danh sách CV phù hợp.
- **TC3.2**: HR tạo Batch Request -> Target Users được tạo, CV của các user bị đổi sang `Outdated`.

## Automation Plan
- **Bước 1**: Cài đặt Framework. Thêm `Jest`, `ts-jest`, `@types/jest`, và `supertest` vào `devDependencies`.
- **Bước 2**: Thiết lập Prisma Mocking (`jest-mock-extended`) để viết Unit Test cho tầng Service không phụ thuộc DB thật.
- **Bước 3**: Viết Unit Test cho `AuthService` và `WorkflowService` (Độ ưu tiên cao nhất, vì chứa business logic lõi và logic phê duyệt).
- **Bước 4**: Khởi tạo Test Container với PostgreSQL để chạy Integration Test. Viết test giả lập luồng: `Login -> Tạo Draft -> Submit -> TechLead Approve`.
- **Bước 5**: Tích hợp luồng chạy `npm run test` vào CI pipeline. Giới hạn Coverage tối thiểu phải đạt 80% trước khi cho phép Merge Code.
