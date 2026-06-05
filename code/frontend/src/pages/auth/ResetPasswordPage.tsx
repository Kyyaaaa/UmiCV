import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Input 
            type="password"
            label="Mật khẩu mới" 
            placeholder="Nhập mật khẩu mới" 
            required 
          />
          <Input 
            type="password"
            label="Xác nhận mật khẩu" 
            placeholder="Nhập lại mật khẩu mới" 
            required 
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Cập nhật mật khẩu
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
