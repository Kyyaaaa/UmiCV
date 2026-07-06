import pytest
import re
from playwright.sync_api import Page, expect

@pytest.mark.smoke
def test_employee_login(page: Page):
    """
    Smoke test kiểm tra chức năng đăng nhập.
    """
    # 1. Truy cập trang web
    page.goto("http://localhost:5173")
    
    # 2. Nhập username
    # Tối ưu nhất là dùng get_by_placeholder dựa trên HTML bạn cung cấp
    page.get_by_placeholder("Nhập tên đăng nhập").fill("testemployee")
    
    # 3. Nhập password
    page.get_by_placeholder("Nhập mật khẩu").fill("123123123@As")
    
    # 4. Bấm nút đăng nhập
    # Dùng get_by_role thân thiện với người dùng và chính xác
    page.get_by_role("button", name="Đăng nhập").click()
