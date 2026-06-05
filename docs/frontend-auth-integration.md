# Frontend Auth Integration

Tài liệu này mô tả chi tiết cách hệ thống Frontend (UmiCV) xử lý Authentication với Backend.

## APIs sử dụng

Các API sau được cung cấp bởi Backend (theo API Contract):
- `POST /api/auth/login`: Xác thực người dùng bằng username và password. Trả về `accessToken` và thông tin `user` profile cơ bản. Backend thiết lập `refreshToken` qua HTTP-only cookie.
- `POST /api/auth/refresh`: Lấy `accessToken` mới. Yêu cầu có cookie `refreshToken` đính kèm theo request. Trả về `accessToken` mới.
- `POST /api/auth/logout`: Xóa session ở Backend, đưa `refreshToken` vào blacklist và yêu cầu trình duyệt xóa cookie.

## Auth Flow

Luồng xác thực của ứng dụng như sau:

1. **Đăng nhập (`/login`)**:
   - Người dùng nhập thông tin và gửi yêu cầu tới API `/api/auth/login`.
   - Nếu thành công, `accessToken` và thông tin `user` sẽ được lưu trong `localStorage` cũng như trên bộ nhớ của ứng dụng (quản lý bởi `AuthContext`). 
   - Backend sẽ trả về `refreshToken` qua thẻ `Set-Cookie` (HttpOnly).
   - Chuyển hướng người dùng vào các Private Routes.

2. **Duy trì phiên làm việc (Page Reload)**:
   - Khi người dùng tải lại trang, `AuthContext` (trong `useEffect`) sẽ khôi phục `accessToken` và `user` từ `localStorage`. Do backend hiện tại chỉ trả về `accessToken` chứ không trả về chi tiết profile của user khi dùng `/api/auth/refresh`, việc dùng `localStorage` để lưu `user` là điều kiện bắt buộc nhằm duy trì giao diện người dùng.

3. **Giao tiếp API (Token Strategy)**:
   - Mọi request cần quyền xác thực sẽ được đính kèm header `Authorization: Bearer <accessToken>` thông qua Axios Interceptors (`src/lib/axios.ts`).
   - Yêu cầu tới server luôn gửi kèm các thông tin cookies nhờ cấu hình `withCredentials: true` trên Axios.

4. **Tự động gia hạn Token (Refresh Token)**:
   - Khi `accessToken` hết hạn và một request tới backend trả về lỗi HTTP `401 Unauthorized`.
   - Response Interceptor của Axios sẽ chặn lỗi này, tự động gọi API `/api/auth/refresh` bằng `refreshToken` lưu trong cookie.
   - Nếu nhận được `accessToken` mới, nó sẽ tự động cập nhật `localStorage`, cập nhật lại Header Authorization và retry request ban đầu.
   - Nếu không thể cấp mới (ví dụ: `refreshToken` hết hạn hoặc bị blacklist), nó sẽ xóa toàn bộ trạng thái trong localStorage và đẩy người dùng về trang đăng nhập.

5. **Đăng xuất (`/logout`)**:
   - Khi nhấn "Đăng xuất" (tại `PrivateLayout`), hàm `logout` trong AuthContext được kích hoạt, đồng thời gọi `POST /api/auth/logout`.
   - Trạng thái `accessToken` và `user` ở cả React State và localStorage đều bị xóa bỏ.

## Error Handling

- Các request lỗi sẽ được bắt tại khối `catch` trong component (như `LoginPage.tsx`).
- Hệ thống hỗ trợ xử lý linh hoạt:
  - Báo lỗi `401 Unauthorized` bằng tin nhắn "Tên đăng nhập hoặc mật khẩu không chính xác."
  - Hiển thị nội dung lỗi được trả về từ phía backend (`err.response?.data?.message`).
  - Báo lỗi chung chung nếu xuất hiện lỗi Network/Internal Server Error.
- Interceptor của Axios sẽ tự động loại bỏ các lệnh retry Refresh Token bị mắc vòng lặp (`originalRequest._retry`).

## Known Limitations

- Do đặc thù của `/api/auth/refresh` không trả về object `user`, nếu user bị xóa hoặc bị thay đổi quyền phía server nhưng chưa đăng xuất, giao diện frontend có thể vẫn hiển thị quyền cũ cho đến khi gọi phải một API bị block do không đủ quyền thực sự ở backend.
- Phải lưu thông tin `user` ở localStorage. Dù không chứa password, `localStorage` vẫn có nguy cơ bị lộ nếu tồn tại các lỗ hổng XSS (Cross-Site Scripting).
