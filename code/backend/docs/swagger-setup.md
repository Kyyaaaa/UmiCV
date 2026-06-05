# Swagger & OpenAPI Setup Guide

## Swagger URL
Giao diện Swagger UI có thể truy cập thông qua trình duyệt web tại: 
[http://localhost:3000/api-docs](http://localhost:3000/api-docs) 
*(Lưu ý: Thay đổi port `3000` nếu biến môi trường `PORT` của bạn khác).*

## Authentication Guide
Hệ thống UmiCV sử dụng chuẩn bảo mật JWT (Bearer Token) và Cookie Http-Only.

1. **Với các API thao tác CV, Workflow, Batch Request**:
   - Nhấn vào nút **Authorize** (hình ổ khóa) ở góc trên cùng bên phải giao diện Swagger UI.
   - Dán chuỗi `accessToken` lấy được từ API `/api/auth/login` vào ô giá trị (Value).
   - Nhấn **Authorize**. (Swagger UI sẽ tự động gắn tiền tố `Bearer ` vào header `Authorization` khi bạn thực thi request).

2. **Với các API `/api/auth/refresh` và `/api/auth/logout`**:
   - Yêu cầu `refreshToken` phải được gửi thông qua Header `Cookie`.
   - Lưu ý: Swagger UI mặc định chặn gửi Cookie trên cross-origin hoặc khó mô phỏng Set-Cookie. Bạn nên dùng Postman hoặc tích hợp Frontend trực tiếp để kiểm thử luồng Refresh/Logout dễ dàng nhất, hoặc gọi API Login trực tiếp trên cùng domain của Swagger (localhost) để trình duyệt lưu Cookie tự động.

## OpenAPI Export
- Bộ định nghĩa OpenAPI 3.0.0 Specification (định dạng JSON) được tự động trích xuất trực tiếp từ các chú thích (JSDoc) trong mã nguồn thông qua thư viện `swagger-jsdoc`. 
- Thay vì duy trì một file `swagger.yaml` hay `swagger.json` độc lập cồng kềnh, toàn bộ tài liệu được tích hợp song song với file `.route.ts` để tối đa hóa khả năng bảo trì và đồng bộ.

## Known Limitations
1. **Schema Reusability**: Hiện tại tài liệu Swagger đang định nghĩa thẳng Schema ở trong từng JSDoc thay vì sử dụng `#components/schemas`. Điều này giúp đọc dễ hơn ở file route nhưng sẽ trùng lặp nếu DTO thay đổi. Có thể khắc phục bằng cách cài thêm plugin `@asteasolutions/zod-to-openapi` về sau.
2. **Cookie Handling**: Việc test token làm tươi (Refresh Token) qua Swagger UI khá hạn chế vì lý do bảo mật trình duyệt chặn set cookie qua UI.
