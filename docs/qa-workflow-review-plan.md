# Kế hoạch Kiểm thử & Review Module Workflow (Dành cho QA Agent)

Tài liệu này cung cấp kịch bản kiểm thử (Test Plan) chi tiết cho QA Agent để rà soát chất lượng của **Module Workflow & Approval** vừa được Frontend Agent triển khai (Phase 1 & Phase 2).

## 1. Phạm vi Kiểm thử (Scope of Testing)
- **Màn hình:** `ApprovalRequestListPage` (`/workflow`) và `ApprovalDetailPage` (`/workflow/:id`).
- **Chức năng chính:** Liệt kê yêu cầu duyệt, Tìm kiếm/Lọc, Xem chi tiết CV dưới dạng Preview, Lịch sử phê duyệt (Timeline), và các hành động Approve/Reject.
- **Tích hợp API:** Đảm bảo Frontend đã gắn đúng endpoint và xử lý tốt các trạng thái (Loading, Success, Error).

## 2. Kịch bản Kiểm thử (Test Cases)

### 2.1. Màn hình Danh sách Yêu cầu Phê duyệt (`/workflow`)
1. **TC-01: Hiển thị danh sách**
   - *Hành động:* Truy cập `/workflow`.
   - *Kết quả mong đợi:* Giao diện hiển thị loading. Sau khi có data, render bảng danh sách CV đang chờ duyệt. Các CV hiển thị đúng trường `slaStatus` với màu sắc tương ứng (Xanh/Vàng/Đỏ).
2. **TC-02: Chức năng Tìm kiếm (SearchBox)**
   - *Hành động:* Gõ tên một nhân viên đang có trong danh sách vào ô Tìm kiếm.
   - *Kết quả mong đợi:* Bảng dữ liệu tự động lọc (client-side) để chỉ hiện đúng nhân viên đó.
3. **TC-03: Chức năng Lọc (FilterPanel)**
   - *Hành động:* Chọn trạng thái SLA "Quá hạn" trong Dropdown.
   - *Kết quả mong đợi:* Danh sách chỉ hiển thị các CV có cờ `slaStatus === 'Overdue'`.
4. **TC-04: Empty State**
   - *Hành động:* Tìm kiếm một tên không tồn tại.
   - *Kết quả mong đợi:* Hiển thị thông báo "Không tìm thấy yêu cầu duyệt nào khớp với từ khóa".

### 2.2. Màn hình Chi tiết Phê duyệt (`/workflow/:id`)
5. **TC-05: Hiển thị Layout 2 cột**
   - *Hành động:* Click vào một CV trong danh sách để vào trang chi tiết.
   - *Kết quả mong đợi:* Cột trái hiển thị CV Preview (y hệt bản ứng viên xem). Cột phải hiển thị `ApprovalTimeline` chứa log duyệt của những người trước đó.
6. **TC-06: Hành động Phê duyệt (Approve)**
   - *Hành động:* Nhấn nút "Phê duyệt", sau đó nhấn "Đồng ý" trong Modal.
   - *Kết quả mong đợi:* Nút chuyển sang trạng thái "Đang xử lý...", Frontend gọi API `POST /api/cvs/:id/approve`. Nếu thành công, điều hướng về trang `/workflow`.
7. **TC-07: Hành động Từ chối (Reject) - Validation Lỗi**
   - *Hành động:* Nhấn nút "Từ chối", bỏ trống ô Textarea nhập lý do và nhấn "Từ chối CV".
   - *Kết quả mong đợi:* Hệ thống chặn lại, viền đỏ ô Textarea và cảnh báo "Vui lòng nhập lý do từ chối".
8. **TC-08: Hành động Từ chối (Reject) - Luồng Thành công**
   - *Hành động:* Nhập "Kinh nghiệm mô tả quá sơ sài", nhấn "Từ chối CV".
   - *Kết quả mong đợi:* Nút chuyển trạng thái loading, Frontend gọi API `POST /api/cvs/:id/reject` kèm `reason`. Thành công thì đóng Modal và đưa về `/workflow`.

## 3. Các bước hành động cho QA Agent
1. **Rà soát Mã nguồn (Code Review):** Kiểm tra `ApprovalRequestListPage.tsx` và `ApprovalDetailPage.tsx` xem có còn sót bất kỳ Mock data (`mockCVs`, `mockApprovalLogs`) nào không (Mong đợi là đã bị gỡ sạch và thay bằng `workflowService`).
2. **Kiểm tra TypeScript:** Chạy lệnh `npm run build` hoặc `tsc -b` tại thư mục `code/frontend` để đảm bảo code không bị lỗi type mismatch sau khi gỡ mock.
3. **Mô phỏng (Mock Server/Interceptor):** Vì Backend chưa triển khai xong, QA Agent có thể đánh giá tính đúng đắn của code Frontend bằng cách kiểm tra việc khai báo service trong `src/services/workflow.service.ts` có truyền đúng Body Data (`level`, `reason`) và Query Param (`status`) hay không.
4. **Xuất báo cáo:** Sinh file `docs/qa-workflow-review-report.md` chứa kết quả đánh giá.
