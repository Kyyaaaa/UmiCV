import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';
import { mockDepartments } from '../../mocks/users.mock';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: () => void;
}

export function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'Employee',
    departmentId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        departmentId: user.departmentId,
      });
    } else {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: 'Employee',
        departmentId: '',
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSave();
    }, 1000);
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Select 
            label="Phòng ban" 
            required
            value={formData.departmentId}
            onChange={e => setFormData({...formData, departmentId: e.target.value})}
            options={[
              { value: '', label: 'Chọn phòng ban...' },
              ...mockDepartments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
          <Select 
            label="Vai trò" 
            required
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value})}
            options={[
              { value: 'Employee', label: 'Employee' },
              { value: 'TechLead', label: 'Tech Lead' },
              { value: 'HR', label: 'HR' },
              { value: 'Admin', label: 'Admin' },
            ]}
          />
        </div>
        {!isEdit && (
          <div className="rounded-md bg-blue-50 p-3 mt-4">
            <p className="text-sm text-blue-700">
              Mật khẩu mặc định sẽ được gửi qua email của nhân sự.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
