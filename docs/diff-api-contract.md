# CV Diff API Contract

Tài liệu này mô tả chi tiết Contract cho API lấy danh sách khác biệt (Diff) giữa bản CV đang soạn thảo (Draft) và bản CV đã được phát hành (Published Version). API này cung cấp dữ liệu thiết yếu cho tính năng `PublishReviewPage` và `Diff Viewer` trên Frontend.

## Endpoint

**`GET /api/cvs/:id/diff`**

- **Mục đích**: Lấy ra mảng các thay đổi chi tiết giữa bản nháp hiện tại và bản snapshot mới nhất trong lịch sử (nếu có).
- **Authentication**: Bắt buộc (Token Bearer).
- **Authorization**: Employee (Chủ sở hữu CV), TechLead (Quản lý dự án của Employee đó), HR, Admin.

---

## Response Schema

Hệ thống sẽ trả về một Response với trường `data` là một mảng `DiffChange[]`.

```typescript
type DiffType = 'added' | 'removed' | 'modified';

interface DiffChange {
  path: string;       // Đường dẫn tới trường bị thay đổi (nested notation)
  type: DiffType;     // Loại thay đổi
  oldValue: unknown;  // Giá trị cũ (ở bản snapshot)
  newValue: unknown;  // Giá trị mới (ở bản draft)
}
```

---

## Các Trường Hợp Trả Về (Examples)

Dưới đây là một số ví dụ minh họa về dữ liệu API sẽ sinh ra thông qua thuật toán Deep Compare của Backend.

### 1. Thêm mới một trường (Added)

**Ví dụ:** Người dùng bổ sung trường `summary` vào CV (trước đây chưa từng có).

```json
{
  "success": true,
  "data": [
    {
      "path": "summary",
      "type": "added",
      "oldValue": undefined,
      "newValue": "Tôi là kỹ sư phần mềm với 5 năm kinh nghiệm."
    }
  ]
}
```

### 2. Xóa một trường (Removed)

**Ví dụ:** Người dùng xóa thông tin `certifications` khỏi CV.

```json
{
  "success": true,
  "data": [
    {
      "path": "certifications",
      "type": "removed",
      "oldValue": ["AWS Certified Developer"],
      "newValue": undefined
    }
  ]
}
```

### 3. Thay đổi giá trị (Modified)

**Ví dụ:** Cập nhật thông tin số điện thoại.

```json
{
  "success": true,
  "data": [
    {
      "path": "personalInfo.phone",
      "type": "modified",
      "oldValue": "0987654321",
      "newValue": "0123456789"
    }
  ]
}
```

### 4. Thay đổi phần tử trong mảng (Nested Array Modifications)

**Ví dụ:** Cập nhật năm tốt nghiệp của trường học thứ nhất (`education[0]`) và thêm kỹ năng mới (`skills[2]`).

```json
{
  "success": true,
  "data": [
    {
      "path": "education[0].graduationYear",
      "type": "modified",
      "oldValue": 2021,
      "newValue": 2022
    },
    {
      "path": "skills[2]",
      "type": "added",
      "oldValue": undefined,
      "newValue": "Next.js"
    }
  ]
}
```

---

## Lưu ý (Edge Cases)

- **Draft rỗng / Original rỗng**: Nếu CV chưa từng được phát hành (không có lịch sử), toàn bộ nội dung trong Draft sẽ được coi là `"added"`.
- **Thứ tự mảng (Array Ordering)**: Thuật toán so sánh mảng bằng vị trí Index. Việc đổi thứ tự các phần tử trong mảng sẽ được tính là hàng loạt sự kiện `modified`.
- **Null & Undefined**: Thuật toán xử lý an toàn sự khác biệt giữa `null` và `undefined` khi so sánh JSON. Nếu trường không tồn tại, nó sẽ là `undefined`.
