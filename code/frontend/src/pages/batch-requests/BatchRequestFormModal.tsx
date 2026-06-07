import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { batchRequestService } from '../../services/batch-request.service';
import { departmentService } from '../../services/department.service';
import { userService } from '../../services/user.service';
import { Department, User } from '../../types';

interface BatchRequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function BatchRequestFormModal({ isOpen, onClose, onSave }: BatchRequestFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      });
      setSelectedUsers(new Map());
      setSelectedDeptId('');
      setAvailableUsers([]);
      setError('');
      
      departmentService.getDepartmentTree().then(res => {
        const flatten = (depts: Department[], level = 0): any[] => {
          return depts.reduce((acc: any[], dept) => {
            acc.push({ ...dept, level });
            if (dept.childDepartments && dept.childDepartments.length > 0) {
              acc.push(...flatten(dept.childDepartments, level + 1));
            }
            return acc;
          }, []);
        };
        setDepartments(flatten(res.data));
      }).catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDeptId) {
      userService.getUsers({ departmentId: selectedDeptId, limit: 1000 }).then(res => {
        setAvailableUsers(res.data.filter(u => u.status === 'Active' && u.role !== 'Admin'));
      }).catch(err => console.error(err));
    } else {
      setAvailableUsers([]);
    }
  }, [selectedDeptId]);

  const handleToggleUser = (user: User) => {
    const next = new Map(selectedUsers);
    if (next.has(user.id)) next.delete(user.id);
    else next.set(user.id, user);
    setSelectedUsers(next);
  };

  const handleSelectAllInDept = () => {
    const next = new Map(selectedUsers);
    availableUsers.forEach(u => next.set(u.id, u));
    setSelectedUsers(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên chiến dịch');
      return;
    }
    
    if (!formData.deadline) {
      setError('Vui lòng chọn hạn chót cho chiến dịch');
      return;
    }
    
    if (selectedUsers.size === 0) {
      setError('Vui lòng chọn ít nhất 1 nhân sự mục tiêu');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await batchRequestService.createBatchRequest({
        title: formData.title,
        description: formData.description,
        deadline: new Date(formData.deadline).toISOString(),
        targetUserIds: Array.from(selectedUsers.keys()),
      });
      onSave();
    } catch (err: any) {
      if (err.response?.data?.errors && err.response.data.errors.length > 0) {
        const detailErrors = err.response.data.errors.map((e: any) => e.message).join(', ');
        setError(`${err.response?.data?.message} - Chi tiết: ${detailErrors}`);
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo chiến dịch');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khởi tạo chiến dịch cập nhật CV"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" form="batch-request-form" isLoading={isLoading}>
            Tạo chiến dịch ({selectedUsers.size} nhân sự)
          </Button>
        </>
      }
    >
      <form id="batch-request-form" onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Input 
              label="Tên chiến dịch (*)" 
              placeholder="VD: Cập nhật CV đợt đánh giá Q3/2026"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="col-span-1">
            <Input 
              label="Hạn chót (*)" 
              type="datetime-local"
              value={formData.deadline}
              onChange={e => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Input 
              label="Mô tả (Không bắt buộc)" 
              placeholder="Ghi chú thêm về chiến dịch này"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-2">
          <h4 className="font-medium text-slate-900 mb-2">Chọn nhân sự tham gia</h4>
          <p className="text-sm text-slate-500 mb-4">Lọc theo phòng ban để chọn nhanh danh sách nhân sự mục tiêu.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Lọc theo phòng ban"
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
                options={[
                  { value: '', label: '--- Chọn phòng ban ---' },
                  ...departments.map((d: any) => ({
                    value: d.id,
                    label: `${'\u00A0\u00A0'.repeat(d.level)}${d.level > 0 ? '↳ ' : ''}${d.name}`
                  }))
                ]}
              />

              {availableUsers.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Nhân sự thuộc phòng ban ({availableUsers.length})</span>
                    <button type="button" onClick={handleSelectAllInDept} className="text-sm text-blue-600 hover:text-blue-800">
                      Chọn tất cả
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-md">
                    <ul className="divide-y divide-slate-100">
                      {availableUsers.map(u => (
                        <li key={u.id} className="p-2 flex items-center gap-3 hover:bg-slate-50">
                          <input 
                            type="checkbox" 
                            id={`user-${u.id}`}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={selectedUsers.has(u.id)}
                            onChange={() => handleToggleUser(u)}
                          />
                          <label htmlFor={`user-${u.id}`} className="flex-1 cursor-pointer flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{u.fullName}</span>
                            <span className="text-xs text-slate-500">{u.email}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Đã chọn ({selectedUsers.size})</label>
              <div className="h-[312px] bg-slate-50 border border-slate-200 rounded-md p-4 overflow-y-auto">
                {selectedUsers.size === 0 ? (
                  <p className="text-sm text-slate-500 text-center mt-20">Chưa có nhân sự nào được chọn.</p>
                ) : (
                  <ul className="space-y-2">
                    {Array.from(selectedUsers.values()).map(u => (
                      <li key={u.id} className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded text-sm">
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-medium text-slate-900 truncate">{u.fullName}</span>
                          <span className="text-xs text-slate-500 truncate">{u.email}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleToggleUser(u)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
