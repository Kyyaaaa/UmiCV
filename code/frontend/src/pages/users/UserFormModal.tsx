import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { User, Department } from '../../types';
import { userService } from '../../services/user.service';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  departments: Department[];
  onSave: () => void;
}

export function UserFormModal({ isOpen, onClose, user, departments, onSave }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const fieldLabels: Record<string, string> = {
          username: 'Tên đăng nhập',
          email: 'Email',
          fullName: 'Họ và tên',
          password: 'Mật khẩu',
          departmentId: 'Phòng ban',
          role: 'Vai trò'
        };
        const detailErrors = err.response.data.errors.map((e: any) => {
          const rawField = e.field.replace(/^(body\.|query\.|params\.)/, '');
          const label = fieldLabels[rawField] || rawField;
          return `${label} ${e.message}`;
        }).join(', ');
        setError(`${err.response?.data?.message} - Chi tiết: ${detailErrors}`);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân sự');
      }
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
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            label="Họ và tên" 
            required 
            value={formData.fullName}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
          <Input 
            label="Tên đăng nhập" 
            required 
            value={formData.username}
            readOnly={isEdit}
            disabled={isEdit}
            onChange={e => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <Input 
          type="email" 
          label="Email" 
          required 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
        {!isEdit && (
          <Input 
            type="password" 
            label="Mật khẩu (Tối thiểu 6 ký tự)" 
            required 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select 
            label="Phòng ban" 
            required
            value={formData.departmentId}
            onChange={e => setFormData({...formData, departmentId: e.target.value})}
            options={[
              { value: '', label: 'Chọn phòng ban...' },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
          <Select 
            label="Vai trò" 
            required
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value})}
            options={[
              { value: 'Admin', label: 'Quản trị viên' },
              { value: 'HR', label: 'Nhân sự (HR)' },
              { value: 'TechLead', label: 'Tech Lead' },
              { value: 'Employee', label: 'Nhân viên' },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
