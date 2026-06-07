import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Department } from '../../types';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Users } from 'lucide-react';
import { DepartmentFormModal } from './DepartmentFormModal';
import { DepartmentMembersModal } from './DepartmentMembersModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { departmentService } from '../../services/department.service';

export function DepartmentListPage() {
  const [treeData, setTreeData] = useState<Department[]>([]);
  const [flatList, setFlatList] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [deptForMembers, setDeptForMembers] = useState<Department | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [treeRes, listRes] = await Promise.all([
        departmentService.getDepartmentTree(),
        departmentService.getDepartments()
      ]);
      setTreeData(treeRes.data);
      setFlatList(listRes.data);
      
      // Auto expand first level
      const initialExpanded = new Set<string>();
      treeRes.data.forEach(d => initialExpanded.add(d.id));
      setExpandedNodes(initialExpanded);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedNodes(newSet);
  };

  const handleSave = () => {
    setIsFormOpen(false);
    setSelectedDept(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    try {
      setDeleteError('');
      await departmentService.deleteDepartment(deptToDelete.id);
      setIsDeleteOpen(false);
      setDeptToDelete(null);
      fetchData();
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng ban');
    }
  };

  const renderTree = (departments: Department[], level: number = 0) => {
    return departments.map(dept => {
      const hasChildren = dept.childDepartments && dept.childDepartments.length > 0;
      const isExpanded = expandedNodes.has(dept.id);
      
      return (
        <React.Fragment key={dept.id}>
          <div 
            className="flex items-center justify-between py-3 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors group"
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            <div className="flex items-center gap-2">
              <button 
                onClick={() => hasChildren && toggleExpand(dept.id)}
                className={`w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500 ${!hasChildren && 'invisible'}`}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div>
                <p className="font-medium text-slate-900">{dept.name}</p>
                <p className="text-xs text-slate-500">Mã: {dept.code}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                title="Danh sách nhân sự"
                onClick={() => { setDeptForMembers(dept); setIsMembersOpen(true); }}
              >
                <Users size={16} className="text-blue-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSelectedDept(dept); setIsFormOpen(true); }}
              >
                <Edit2 size={16} className="text-slate-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { 
                  setDeptToDelete(dept); 
                  setDeleteError('');
                  setIsDeleteOpen(true); 
                }}
              >
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          </div>
          
          {hasChildren && isExpanded && renderTree(dept.childDepartments!, level + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div>
      <PageHeader 
        title="Sơ đồ Tổ chức" 
        description="Quản lý cấu trúc phòng ban trong công ty" 
        actions={
          <Button onClick={() => { setSelectedDept(null); setIsFormOpen(true); }}>
            <Plus size={16} className="mr-2" />
            Thêm phòng ban
          </Button>
        }
      />

      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 font-semibold text-sm text-slate-700">
          Danh sách Phòng ban
        </div>
        <div className="divide-y divide-slate-100 min-h-[400px]">
          {treeData.length > 0 ? (
            renderTree(treeData)
          ) : (
            <div className="p-8 text-center text-slate-500">Chưa có dữ liệu phòng ban</div>
          )}
        </div>
      </div>

      <DepartmentFormModal 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        department={selectedDept}
        departmentsList={flatList}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Xóa phòng ban"
        description={`Bạn có chắc chắn muốn xóa phòng ban ${deptToDelete?.name}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        type="danger"
        error={deleteError}
      />

      <DepartmentMembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        department={deptForMembers}
      />
    </div>
  );
}
