import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
        </CardDescription>
      </CardHeader>
      
      {success ? (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc hộp thư rác) của bạn.
          </div>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Quay lại màn hình đăng nhập
            </Link>
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleForgot}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Input 
              type="email"
              label="Địa chỉ Email" 
              placeholder="Nhập email của bạn" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Gửi yêu cầu
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
