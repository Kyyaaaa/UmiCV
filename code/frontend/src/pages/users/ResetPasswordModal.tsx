import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User } from '../../types';
import { userService } from '../../services/user.service';
import { validatePassword } from '../../utils/validation';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export function ResetPasswordModal({ isOpen, onClose, user, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await userService.resetPassword(user.id, newPassword);
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt lại mật khẩu">
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <p className="text-sm text-slate-500">
          Cấp lại mật khẩu mới cho nhân sự <strong>{user?.fullName}</strong> ({user?.username}).
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <Input
            type="password"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
