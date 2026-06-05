# Báo cáo Kiểm thử Cuối cùng (Final QA Report)

## Executive Summary
- **Tổng số lỗi đã xác minh (Verified Fixes)**: 15/15
- **Tổng số lỗi còn tồn tại (Remaining Issues)**: 2 (API Contract)
- **Lỗi mới phát sinh (Regression Bugs)**: 1 (JSON Parsing)
- **Đánh giá tổng thể**: Backend Fix Agent đã hoàn thành xuất sắc nhiệm vụ xử lý triệt để các lỗi Bảo mật nghiêm trọng (BOLA/IDOR), Runtime Error (crash token) và cải tiến logic xử lý dữ liệu. Tuy nhiên, có một lỗi nhỏ phát sinh khi tìm kiếm JSONB bằng ký tự đặc biệt, và tài liệu API chưa được cập nhật đầy đủ. Backend đã ở trạng thái ổn định cơ bản.

## Verified Fixes
Tất cả các lỗi trong đợt audit trước đã được xác minh sửa thành công:
- **Critical**:
  - `[C1]` Hàm `refresh` đã hoạt động bình thường, `verifyToken` đã được import.
  - `[C2]` BOLA/IDOR trong API `diffCV` đã được vá. Chỉ cho phép Owner, TechLead phụ trách, HR và Admin truy cập.
  - `[C3]` BOLA/IDOR trong `approveCV`/`rejectCV` đã được vá với hàm `verifyApproverScope`.
- **High**:
  - `[H1]` Endpoint `POST /api/auth/logout` đã tồn tại, Refresh Token được đưa vào Redis Blacklist chính xác.
  - `[H2]` `submitDraft` đã sử dụng `languageCode` thông qua validation schema mới.
  - `[H3]` Rate Limit (`express-rate-limit`) đã được cài đặt.
  - `[H4]` Route `search` và `diff` đã chuyển về đúng module `cv`.
- **Medium**:
  - `[M1]` Refresh token đã được check type bằng code trong controller.
  - `[M2]` Raw query `$queryRaw` với toán tử `@>` đã được sử dụng.
  - `[M3]` API Contract đã được lược bỏ `diff`.
  - `[M4]` Cronjob đã được gắn phân trang (take/skip), giải quyết nguy cơ OOM.
  - `[M5]` Quá trình hủy BatchRequest đã bao gồm việc xóa Target và Rollback trạng thái CV về Draft.
- **Low**:
  - Các lỗi logging và validation nhỏ đã được vá gọn gàng.

## Partially Fixed Issues
- (Không có lỗi nào bị bỏ sót một phần. Tất cả đều đã có code xử lý logic).

## Remaining Issues
- **Low**: API Contract chưa cập nhật đồng bộ với code thực tế.
  - `docs/api-contract.md` đang thiếu mô tả cho endpoint `POST /api/auth/logout`.
  - `docs/api-contract.md` chưa bổ sung body `{ "languageCode": "vi" }` cho endpoint `POST /api/cvs/draft/submit`.

## Regression Findings
- **Medium: JSON Parsing Error trong `SearchService.searchCVs`**
  - **Mô tả:** Backend Agent sử dụng string template literal để inject biến `keyword` thẳng vào chuỗi JSON trước khi ép kiểu `::jsonb` cho PostgreSQL: 
    `${`{"skills": ["${keyword}"]}`}`
  - **Hậu quả:** Nếu người dùng gõ vào ô tìm kiếm một từ khóa chứa dấu nháy kép (VD: `React"`), chuỗi được parse sẽ trở thành `{"skills": ["React""]}`, đây là một định dạng JSON không hợp lệ. PostgreSQL sẽ throw lỗi 500 khi cast sang `::jsonb`.
  - **Cách khắc phục:** Cần sanitize `keyword` (thoát ký tự `"`) trước khi ghép chuỗi, hoặc sử dụng cơ chế truyền params chuẩn của Prisma `CAST($1 AS jsonb)` thay vì interpolate trên NodeJS.

## Security Verification
- **Trạng thái: AN TOÀN CAO**
- Các luồng truy xuất và phê duyệt dữ liệu nhạy cảm đã bị khóa chặt theo đúng Role và Scope quản lý.
- Vòng đời phiên đăng nhập (Session Lifecycle) đã an toàn nhờ có cơ chế Blacklist.
- Không còn nguy cơ rò rỉ dữ liệu CV nội bộ ra toàn công ty.

## Testing Coverage
- Tỷ lệ bao phủ đã tăng từ 0% lên mức đủ dùng cho các tính năng quan trọng nhất (Auth & Workflow).
- Cấu hình testing environment đã hoàn tất. Có thể tiếp tục viết test cho CV, Search và Batch Request trong Sprint tiếp theo.

## Release Readiness

**Trạng thái: READY WITH MINOR ISSUES**

**Lý do:**
1. Hệ thống đã xử lý xong 100% các lỗ hổng Critical & High. Việc backend crash lúc vận hành luồng chính không còn xảy ra.
2. Quá trình build, lint và test đã thành công trơn tru.
3. Vấn đề Regression duy nhất là tìm kiếm ký tự đặc biệt gây lỗi 500. Lỗi này chỉ ảnh hưởng cục bộ tới tính năng Search (Edge case), không chặn quy trình submit và approve CV cốt lõi.
4. Đội Frontend có thể sử dụng Backend này ngay lập tức cho môi trường Integration / Staging, trong khi Backend Engineer tranh thủ fix nốt lỗi JSON parse và bổ sung API Contract trong chưa tới 1 giờ.
