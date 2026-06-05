import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { currentUser } from '../../mocks/users.mock';
import { Save } from 'lucide-react';

export function UserProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPwdLoading(true);
    setTimeout(() => {
      setIsPwdLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title="Hồ sơ cá nhân" 
        description="Quản lý thông tin tài khoản và mật khẩu của bạn" 
      />

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar & Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <img 
                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.fullName}&size=128`} 
                alt="Avatar" 
                className="h-32 w-32 rounded-full border-4 border-slate-50 shadow-sm"
              />
              <h3 className="mt-4 text-xl font-bold text-slate-900">{currentUser.fullName}</h3>
              <p className="text-sm text-slate-500">{currentUser.email}</p>
              <div className="mt-4 flex gap-2">
                <StatusBadge status={currentUser.role} type="user" />
                <StatusBadge status={currentUser.status} type="user" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Họ và tên" defaultValue={currentUser.fullName} />
                <Input label="Tên đăng nhập" defaultValue={currentUser.username} readOnly />
                <Input label="Email" type="email" defaultValue={currentUser.email} />
                <Input label="Phòng ban" defaultValue="Engineering" readOnly />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={handleSaveProfile} isLoading={isLoading}>
                <Save size={16} className="mr-2" />
                Lưu thay đổi
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
            </CardHeader>
            <form onSubmit={handleUpdatePassword}>
              <CardContent className="space-y-4">
                <Input label="Mật khẩu hiện tại" type="password" required />
                <Input label="Mật khẩu mới" type="password" required />
                <Input label="Xác nhận mật khẩu mới" type="password" required />
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" isLoading={isPwdLoading}>
                  <Save size={16} className="mr-2" />
                  Cập nhật mật khẩu
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
