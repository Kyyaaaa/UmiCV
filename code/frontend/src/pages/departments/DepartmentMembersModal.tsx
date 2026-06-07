import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Department, User } from '../../types';
import { userService } from '../../services/user.service';

interface DepartmentMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export function DepartmentMembersModal({ isOpen, onClose, department }: DepartmentMembersModalProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && department) {
      fetchData();
    }
  }, [isOpen, department]);

  const fetchData = async () => {
    if (!department) return;
    try {
      setIsLoading(true);
      setError('');
      
      const res = await userService.getUsers({ departmentId: department.id, limit: 100 });
      setMembers(res.data);
    } catch (err: any) {
      setError('Lỗi khi tải dữ liệu nhân sự');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Nhân sự phòng ${department?.name || ''}`}
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Danh sách nhân sự ({members.length})</h4>
          
          <div className="bg-slate-50 border border-slate-200 rounded-md overflow-hidden max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Đang tải...</div>
            ) : members.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {members.map(user => (
                  <li key={user.id} className="p-3 flex items-center gap-3 hover:bg-white transition-colors">
                    <img 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {user.role}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Không có nhân sự nào trực thuộc phòng ban này.
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
