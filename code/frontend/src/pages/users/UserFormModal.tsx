import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { User, Department } from '../../types';
import { userService } from '../../services/user.service';
import { handleApiError } from '../../utils/error.util';
import { useAuth } from '../../hooks/useAuth';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  departments: Department[];
  onSave: () => void;
}

export function UserFormModal({ isOpen, onClose, user, departments, onSave }: UserFormModalProps) {
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(user);
  const isSelfEditing = isEdit && user?.id === currentUser?.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'Employee',
    departmentId: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
        password: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'Employee',
        departmentId: '',
        password: '',
      });
    }
    setError('');
    setFieldErrors({});
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isEdit) {
        const updatePayload = {
          fullName: formData.fullName,
          role: formData.role,
          departmentId: formData.departmentId,
        };
        await userService.updateUser(user!.id, updatePayload);
      } else {
        await userService.createUser(formData);
      }
      onSave();
    } catch (err: any) {
      const { globalError, fieldErrors } = handleApiError(err, 'Có lỗi xảy ra khi lưu nhân sự');
      setError(globalError);
      setFieldErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa thông tin nhân sự' : 'Thêm nhân sự mới'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        {error && Object.keys(fieldErrors).length === 0 && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            label="Họ và tên" 
            required 
            value={formData.fullName}
            error={fieldErrors.fullName}
            onChange={e => {
              setFormData({...formData, fullName: e.target.value});
              if (fieldErrors.fullName) setFieldErrors({...fieldErrors, fullName: ''});
            }}
          />
          <Input 
            label="Tên đăng nhập" 
            required 
            value={formData.username}
            error={fieldErrors.username}
            readOnly={isEdit}
            disabled={isEdit}
            onChange={e => {
              setFormData({...formData, username: e.target.value});
              if (fieldErrors.username) setFieldErrors({...fieldErrors, username: ''});
            }}
          />
        </div>
        <Input 
          type="email" 
          label="Email" 
          required 
          value={formData.email}
          error={fieldErrors.email}
          onChange={e => {
            setFormData({...formData, email: e.target.value});
            if (fieldErrors.email) setFieldErrors({...fieldErrors, email: ''});
          }}
        />
        {!isEdit && (
          <Input 
            type="password" 
            label="Mật khẩu (Tối thiểu 6 ký tự)" 
            required 
            value={formData.password}
            error={fieldErrors.password}
            onChange={e => {
              setFormData({...formData, password: e.target.value});
              if (fieldErrors.password) setFieldErrors({...fieldErrors, password: ''});
            }}
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select 
            label="Phòng ban" 
            required
            value={formData.departmentId}
            error={fieldErrors.departmentId}
            onChange={e => {
              setFormData({...formData, departmentId: e.target.value});
              if (fieldErrors.departmentId) setFieldErrors({...fieldErrors, departmentId: ''});
            }}
            options={[
              { value: '', label: 'Chọn phòng ban...' },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
          <div>
            <Select 
              label="Vai trò" 
              required
              value={formData.role}
              error={fieldErrors.role}
              disabled={isSelfEditing}
              onChange={e => {
                setFormData({...formData, role: e.target.value});
                if (fieldErrors.role) setFieldErrors({...fieldErrors, role: ''});
              }}
              options={[
                { value: 'Admin', label: 'Quản trị viên' },
                { value: 'HR', label: 'Nhân sự (HR)' },
                { value: 'TechLead', label: 'Tech Lead' },
                { value: 'Employee', label: 'Nhân viên' },
              ]}
            />
            {isSelfEditing && (
              <p className="mt-1 text-xs text-red-500">Tài khoản của bạn không thể tự thay đổi phân quyền.</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
