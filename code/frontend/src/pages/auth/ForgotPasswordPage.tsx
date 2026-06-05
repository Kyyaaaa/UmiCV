import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <Card className="w-full text-center py-6">
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-xl font-semibold">Đã gửi liên kết khôi phục</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư.
          </p>
          <Link to="/login" className="mt-4">
            <Button variant="outline" className="w-full">
              Quay lại trang đăng nhập
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
        <CardDescription>
          Nhập email được liên kết với tài khoản của bạn để nhận liên kết khôi phục.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input 
            type="email"
            label="Địa chỉ Email" 
            placeholder="Ví dụ: employee@umicv.com" 
            required 
          />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Gửi yêu cầu
          </Button>
          <Link to="/login" className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft size={16} className="mr-2" />
            Quay lại trang đăng nhập
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
