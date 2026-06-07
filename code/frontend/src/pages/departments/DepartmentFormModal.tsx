import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Department } from '../../types';
import { departmentService } from '../../services/department.service';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
  departmentsList: Department[];
  onSave: () => void;
}

export function DepartmentFormModal({ isOpen, onClose, department, departmentsList, onSave }: DepartmentFormModalProps) {
  const isEdit = Boolean(department);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<{name: string, code: string, parentDepartmentId: string}>({
    name: '',
    code: '',
    parentDepartmentId: '',
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        code: department.code,
        parentDepartmentId: department.parentDepartmentId || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        parentDepartmentId: '',
      });
    }
    setError('');
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        parentDepartmentId: formData.parentDepartmentId || null,
      };

      if (isEdit) {
        await departmentService.updateDepartment(department!.id, payload);
      } else {
        await departmentService.createDepartment(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu phòng ban');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent selecting itself or its children as parent
  const availableParents = departmentsList.filter(d => d.id !== department?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
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
      <form id="department-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        
        <Input 
          label="Tên phòng ban" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        
        <Input 
          label="Mã phòng ban" 
          required 
          value={formData.code}
          onChange={e => setFormData({...formData, code: e.target.value})}
        />
        
        <Select 
          label="Phòng ban cha" 
          value={formData.parentDepartmentId}
          onChange={e => setFormData({...formData, parentDepartmentId: e.target.value})}
          options={[
            { value: '', label: 'Không có (Cấp cao nhất)' },
            ...availableParents.map(d => ({ value: d.id, label: d.name }))
          ]}
        />
      </form>
    </Modal>
  );
}
