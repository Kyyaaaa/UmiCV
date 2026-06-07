import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Project, ProjectMember, User } from '../../types';
import { projectService } from '../../services/project.service';
import { userService } from '../../services/user.service';
import { Trash2 } from 'lucide-react';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

export function ProjectMembersModal({ isOpen, onClose, project }: ProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      fetchData();
    }
  }, [isOpen, project]);

  const fetchData = async () => {
    if (!project) return;
    try {
      setIsLoading(true);
      setError('');
      
      const [membersRes, usersRes] = await Promise.all([
        projectService.getProjectMembers(project.id),
        userService.getUsers({ limit: 100 }) // In real app, might want server side search
      ]);
      
      setMembers(membersRes.data);
      
      // Filter out users who are already members
      const memberUserIds = new Set(membersRes.data.map(m => m.userId));
      const notMembers = (usersRes.data || []).filter(u => !memberUserIds.has(u.id));
      setAvailableUsers(notMembers);
    } catch (err: any) {
      setError('Lỗi khi tải dữ liệu thành viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!project || !selectedUserId) return;
    try {
      setIsAdding(true);
      await projectService.assignMembers(project.id, [selectedUserId]);
      setSelectedUserId('');
      await fetchData(); // Refresh lists
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi thêm thành viên');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!project) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?')) return;
    
    try {
      await projectService.removeMember(project.id, userId);
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi xóa thành viên');
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thành viên dự án: ${project.name}`}
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
        
        {/* Add new member section */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="font-medium text-sm text-slate-800 mb-3">Thêm thành viên mới</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                options={[
                  { value: '', label: 'Tìm và chọn nhân viên...' },
                  ...availableUsers.map(u => ({ value: u.id, label: `${u.fullName} (${u.email})` }))
                ]}
              />
            </div>
            <Button 
              onClick={handleAddMember} 
              disabled={!selectedUserId || isAdding}
              isLoading={isAdding}
            >
              Thêm vào dự án
            </Button>
          </div>
        </div>

        {/* Members list section */}
        <div>
          <h4 className="font-medium text-sm text-slate-800 mb-3">Danh sách thành viên ({members.length})</h4>
          
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Đang tải...</div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Dự án chưa có thành viên nào</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nhân sự</th>
                    <th className="px-4 py-3 font-medium">Vai trò</th>
                    <th className="px-4 py-3 font-medium">Ngày tham gia</th>
                    <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {member.user?.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {member.user?.role}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveMember(member.userId)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
