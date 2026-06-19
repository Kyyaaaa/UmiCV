import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { validatePassword } from '../../utils/validation';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã thiếu token.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    
    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đã xảy ra lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Liên kết không hợp lệ</CardTitle>
          <CardDescription>
            Đường dẫn đặt lại mật khẩu của bạn bị thiếu mã xác thực.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Yêu cầu lại đường dẫn mới
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Đặt lại mật khẩu mới</CardTitle>
        <CardDescription>
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      
      {success ? (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được tự động chuyển hướng đến trang đăng nhập trong giây lát...
          </div>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Đi đến trang đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Input 
              type="password"
              label="Mật khẩu mới" 
              placeholder="Nhập mật khẩu mới" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <Input 
              type="password"
              label="Xác nhận mật khẩu mới" 
              placeholder="Nhập lại mật khẩu mới" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Cập nhật mật khẩu
            </Button>
            <div className="text-center w-full">
              <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                Quay lại màn hình đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
