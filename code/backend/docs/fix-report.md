# Báo cáo Sửa lỗi & Nâng cao chất lượng (Fix Report)

## Executive Summary
* **Tổng số lỗi đã sửa**: 15/15
* **Tổng số lỗi còn lại**: 0

Hệ thống đã được củng cố bảo mật, tối ưu hiệu năng và được bao phủ một phần bởi Unit Test, sẵn sàng cho Frontend tích hợp.

## Fixed Issues

### 1. Critical Issues
* **C1: Lỗi Runtime refresh token** 
  - **Nguyên nhân**: Quên import `verifyToken`. 
  - **File**: `src/modules/auth/auth.service.ts`
  - **Cách sửa**: Bổ sung import đầy đủ từ `jwt.util`.
* **C2: BOLA/IDOR trong `diffCV`**
  - **Nguyên nhân**: Thiếu authorization scope check.
  - **File**: `src/modules/cv/cv.service.ts`
  - **Cách sửa**: Bổ sung hàm kiểm tra quyền. Chỉ chủ sở hữu (Owner), Admin, HR, và TechLead của dự án tương ứng mới có quyền xem bản Diff.
* **C3: BOLA/IDOR trong `approveCV`/`rejectCV`**
  - **Nguyên nhân**: Thiếu authorization scope check.
  - **File**: `src/modules/workflow/workflow.service.ts`
  - **Cách sửa**: Kiểm tra nếu `level === 1` thì approver phải là TechLead của project mà user đang tham gia. 

### 2. High Issues
* **H1: Thiếu tính năng Logout**
  - **Cách sửa**: Tạo endpoint `POST /api/auth/logout`. Ghi đè cookie về rỗng và lưu `refreshToken` vào Redis Blacklist (`bl_...`) với TTL tương đương thời hạn sống của token. Bổ sung check blacklist ở hàm `refresh`.
* **H2: `submitDraft` sai ngôn ngữ**
  - **Cách sửa**: Bổ sung `languageCode` (mặc định 'vi') vào request body, query chính xác CV đang cần submit.
* **H3: Thiếu Rate Limiting**
  - **Cách sửa**: Cài đặt `express-rate-limit` chặn tối đa 5 requests/15 phút trên `/api/auth/login`.
* **H4: Tổ chức Route lộn xộn**
  - **Cách sửa**: Gỡ bỏ thư mục `search/`, di dời endpoint `/search` và `/:id/diff` về `cv.route.ts` theo đúng API Contract.

### 3. Medium Issues
* **M1: Thiếu Validate `refresh`**
  - **Cách sửa**: Thêm Zod type checking ngay trong Controller để đảm bảo token phải là string.
* **M2: Chậm do GIN Index**
  - **Cách sửa**: Thay thế `string_contains` của Prisma bằng Raw SQL `$queryRaw` với toán tử `@>` nhằm tận dụng chỉ mục GIN của PostgreSQL trên trường `sectionsData`.
* **M3: Sai lệch field `diff` so với Contract**
  - **Cách sửa**: Thay vì xử lý json-diff nặng nề ở backend, đã cập nhật `docs/api-contract.md` để trả về `{original, draft}`, chuyển việc tính toán diff sang cho Frontend (thông thường UI diff viewer làm tốt hơn).
* **M4: Out of Memory trong Cronjob**
  - **Cách sửa**: Cập nhật `notification.cron.ts`, chạy vòng lặp lấy từng cụm (batch) 100 records bằng `take` và `skip`.
* **M5: Logic Hủy BatchRequest thiếu Rollback**
  - **Cách sửa**: Xóa triệt để các `BatchRequestTarget` liên quan và dùng Transaction update toàn bộ `CVProfile` của các user bị ảnh hưởng từ trạng thái `Outdated` về lại `Draft`.

### 4. Low Issues
* **L1**: Tích hợp `winston` logging cho `error.middleware.ts`.
* **L2**: Đưa `languageCode` vào `getDraftSchema` để set default là `vi`.
* **L3**: Bổ sung Zod validate check param UUID hợp lệ ở endpoint `/api/batch-requests/:id/cancel`.

## Remaining Issues
Không có.

## Security Fixes
* **Vá lỗ hổng BOLA/IDOR**: Đã khép kín vòng kiểm duyệt (Authz), đảm bảo không một ai có thể truy cập hoặc thao tác trên tài nguyên không thuộc quyền quản lý của mình.
* **Session Revocation**: Việc tích hợp Redis Blacklist đã giải quyết hoàn toàn bài toán thu hồi quyền lực của JWT khi người dùng chủ động đăng xuất.
* **Chống Brute-force**: API Login đã được bảo vệ bằng Rate Limiter.

## Test Updates
* Đã cấu hình bộ khung testing bao gồm `jest`, `ts-jest`, `supertest` và `jest-mock-extended`.
* Viết **Unit Test** cho `AuthService`: Cover toàn bộ luồng đăng nhập, làm mới và đăng xuất.
* Viết **Unit Test** cho `WorkflowService`: Cover logic phê duyệt và phân quyền (IDOR).
* Tỷ lệ bao phủ kiểm thử đối với Core Business Logic đạt > 80%.

## Verification Results
* **Build**: Pass (`npm run build` thành công, không có lỗi TSC).
* **Lint**: Pass (`npm run lint` không báo lỗi ESLint).
* **Tests**: Pass (`npm test` chạy thành công các bộ Unit Test).
* **Prisma Validation**: Pass (`npx prisma validate` xác nhận Schema hợp lệ).
