import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Save, Check, X } from 'lucide-react';
import { userService } from '../../services/user.service';
import { useAuth } from '../../hooks/useAuth';
import { handleApiError } from '../../utils/error.util';
import { validatePassword } from '../../utils/validation';

export function UserProfilePage() {
  const { logout } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});
  const [pwdFieldErrors, setPwdFieldErrors] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'error' } | null>(null);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        if (response.success && response.data) {
          setProfileData(response.data);
          setFullName(response.data.fullName || '');
          setEmail(response.data.email || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setProfileFieldErrors({});
    try {
      await userService.updateMe({ fullName, email });
      showToast('Cập nhật thông tin thành công!');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const { globalError, fieldErrors } = handleApiError(error, 'Cập nhật thất bại');
      setProfileFieldErrors(fieldErrors);
      showToast(globalError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdFieldErrors({});
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp!', 'error');
      setPwdFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setPwdFieldErrors({ newPassword: pwdError });
      return;
    }
    
    setIsPwdLoading(true);
    try {
      await userService.updatePassword({ oldPassword, newPassword });
      showToast('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      (e.target as HTMLFormElement).reset();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const { globalError, fieldErrors } = handleApiError(error, 'Đổi mật khẩu thất bại');
      setPwdFieldErrors(fieldErrors);
      showToast(globalError, 'error');
    } finally {
      setIsPwdLoading(false);
    }
  };

  if (!profileData) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
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
                src={`https://ui-avatars.com/api/?name=${profileData.fullName || profileData.username}&size=128&background=random`} 
                alt="Avatar" 
                className="h-32 w-32 rounded-full border-4 border-slate-50 shadow-sm"
              />
              <h3 className="mt-4 text-xl font-bold text-slate-900">{profileData.fullName || profileData.username}</h3>
              <p className="text-sm text-slate-500">{profileData.email}</p>
              <div className="mt-4 flex gap-2">
                <StatusBadge status={profileData.role} type="user" />
                <StatusBadge status={profileData.status || 'Active'} type="user" />
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
                <Input 
                  label="Họ và tên" 
                  value={fullName} 
                  error={profileFieldErrors.fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (profileFieldErrors.fullName) setProfileFieldErrors({...profileFieldErrors, fullName: ''});
                  }} 
                />
                <Input 
                  label="Tên đăng nhập" 
                  defaultValue={profileData.username} 
                  readOnly 
                  className="bg-slate-50"
                />
                <Input 
                  label="Email" 
                  type="email" 
                  value={email} 
                  error={profileFieldErrors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (profileFieldErrors.email) setProfileFieldErrors({...profileFieldErrors, email: ''});
                  }} 
                />
                <Input 
                  label="Phòng ban" 
                  defaultValue={profileData.department?.name || 'Chưa phân bổ'} 
                  readOnly 
                  className="bg-slate-50"
                />
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
                <Input 
                  label="Mật khẩu hiện tại" 
                  type="password" 
                  required 
                  value={oldPassword}
                  error={pwdFieldErrors.oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (pwdFieldErrors.oldPassword) setPwdFieldErrors({...pwdFieldErrors, oldPassword: ''});
                  }}
                />
                <Input 
                  label="Mật khẩu mới" 
                  type="password" 
                  required 
                  value={newPassword}
                  error={pwdFieldErrors.newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (pwdFieldErrors.newPassword) setPwdFieldErrors({...pwdFieldErrors, newPassword: ''});
                  }}
                />
                <Input 
                  label="Xác nhận mật khẩu mới" 
                  type="password" 
                  required 
                  value={confirmPassword}
                  error={pwdFieldErrors.confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (pwdFieldErrors.confirmPassword) setPwdFieldErrors({...pwdFieldErrors, confirmPassword: ''});
                  }}
                />
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center z-[200] animate-in slide-in-from-bottom-5 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toastMessage.type === 'error' ? <X className="h-5 w-5 mr-2 text-red-400" /> : <Check className="h-5 w-5 mr-2 text-green-400" />}
          {toastMessage.title}
        </div>
      )}
    </div>
  );
}
