import pytest
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def login_as_admin(page: Page):
    page.goto("http://localhost:5173/login")
    page.get_by_placeholder("Nhập tên đăng nhập").fill("admin")
    page.get_by_placeholder("Nhập mật khẩu").fill("password123")
    page.get_by_role("button", name="Đăng nhập").click()
    # Wait for dashboard to load
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
    return page

def test_project_crud_visibility(login_as_admin):
    page = login_as_admin
    # Navigate to projects
    page.get_by_text("Dự án").click()
    
    # Check if "Thêm dự án" is visible for Admin
    expect(page.get_by_role("button", name="Thêm dự án")).to_be_visible()

def test_view_cv_list(login_as_admin):
    page = login_as_admin
    # Navigate to CV
    page.get_by_text("Quản lý CV").click()
    
    # Check if a table or list exists
    expect(page.locator("table").first).to_be_visible()
