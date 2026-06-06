# Báo cáo sửa lỗi TypeScript (Manual Save Refactor)

Tài liệu này ghi nhận nguyên nhân gốc (Root Cause) và các giải pháp đã áp dụng để khắc phục lỗi TypeScript phát sinh sau khi refactor từ Auto Save sang Manual Save.

## 1. Root Cause Analysis

### Lỗi 1: `Cannot find name 'unsavedChanges'`
- **File**: `CVWorkspace.tsx`
- **Dòng**: 440
- **Nguyên nhân**: Trong quá trình chuyển đổi trạng thái (dirty state) từ dạng đếm số `unsavedChanges` sang boolean `isDirty`, tất cả các hàm setter và logic theo dõi đã được cập nhật. Tuy nhiên, khối code render giao diện Modal (hộp thoại Restore Version) nằm ở gần cuối file vẫn còn sót biểu thức `unsavedChanges > 0`. Trình biên dịch TypeScript báo lỗi vì biến này đã bị xóa khỏi scope.

### Lỗi 2: `Type '{ children: Element; }' has no properties in common with type 'IntrinsicAttributes'`
- **File**: `App.tsx`
- **Dòng**: 38
- **Nguyên nhân**: Quá trình chuyển đổi từ `<BrowserRouter>` sang `createBrowserRouter` đã chuyển đổi các Wrapper Route (như `<Route element={<ProtectedRoute />}>`) thành JSX element lồng nhau: `<ProtectedRoute><PrivateLayout /></ProtectedRoute>`. Tuy nhiên, component `ProtectedRoute` hiện tại được thiết kế như một Layout Component sử dụng `<Outlet />` bên trong để render sub-routes, không khai báo nhận `children` prop. Việc truyền `<PrivateLayout />` vào dưới dạng `children` vi phạm Contract Type của `ProtectedRoute` (vốn dĩ chỉ là `IntrinsicAttributes`).

## 2. Files Modified

1. `src/pages/cv/CVWorkspace.tsx`
2. `src/App.tsx`

## 3. Fix Applied

### Đối với CVWorkspace.tsx
- Thay thế hoàn toàn đoạn biểu thức điều kiện hiển thị Modal từ `unsavedChanges > 0` thành cờ `isDirty` (đây là Single Source of Truth duy nhất hiện tại cho trạng thái dirty).
- Không để sót bất kỳ reference nào liên quan tới biến đếm cũ.

### Đối với App.tsx
- Cấu trúc lại khai báo nested route của `createBrowserRouter`. 
- Thay vì bọc trực tiếp `<ProtectedRoute><PrivateLayout /></ProtectedRoute>`, hệ thống được chuẩn hóa lại để tận dụng cơ chế sub-routing của React Router v6:
  ```tsx
  {
    path: "/",
    element: <ProtectedRoute />, // Sử dụng Outlet nội tại
    children: [
      {
        element: <PrivateLayout />, // Sử dụng Outlet nội tại
        children: [
           // Các route con...
        ]
      }
    ]
  }
  ```
- Giải pháp này không can thiệp (xóa `children` hay sửa kiểu `any`) vào khai báo của `ProtectedRoute`, giữ nguyên thiết kế Layout Outlet chuẩn của component.

## 4. Build Result
- **Command**: `npm run build` và `npx tsc --noEmit`
- **Status**: **PASS**. Không còn bất kỳ lỗi TypeScript nào trong quá trình Type Checking. Các component đã đảm bảo Type-safe tuyệt đối.

## 5. Remaining Risks
- **Rủi ro hồi quy (Regression)**: Thấp. Việc sắp xếp lại cấu trúc route bên trong mảng cấu hình của `createBrowserRouter` tuân thủ chặt chẽ API của thư viện và đảm bảo Layout cascading diễn ra đúng thứ tự như lúc dùng `<Route>`. Tính năng chặn điều hướng (`useBlocker`) của Manual Save Model vẫn hoạt động hoàn hảo.
- **Tính trọn vẹn**: Cần đảm bảo tất cả các developers trong dự án biết về việc thay đổi `unsavedChanges` thành `isDirty` để tránh merge conflict hoặc tái sử dụng biến cũ trong các nhánh chưa merge.
