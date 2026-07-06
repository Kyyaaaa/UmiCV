import { prismaMock } from '../../../__tests__/prismaMock';
import { DepartmentService } from '../department.service';
import { BadRequestError, NotFoundError } from '../../../errors/AppError';

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(() => {
    service = new DepartmentService();
    jest.clearAllMocks();
  });

  describe('createDepartment', () => {
    it('should create department successfully', async () => {
      prismaMock.department.findUnique.mockResolvedValue(null as any);
      prismaMock.department.create.mockResolvedValue({ id: 'dep-1', name: 'IT', code: 'IT', parentDepartmentId: null } as any);

      const result = await service.createDepartment({ name: 'IT', code: 'IT' });

      expect(result).toBeDefined();
      expect(prismaMock.department.create).toHaveBeenCalled();
    });

    it('should throw BadRequestError if code exists', async () => {
      prismaMock.department.findUnique.mockResolvedValue({ id: 'dep-1' } as any);

      await expect(service.createDepartment({ name: 'IT', code: 'IT' }))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('getDepartmentTree', () => {
    it('should build tree correctly', async () => {
      const depts = [
        { id: '1', name: 'Root', parentDepartmentId: null },
        { id: '2', name: 'Child', parentDepartmentId: '1' },
      ];
      prismaMock.department.findMany.mockResolvedValue(depts as any);

      const tree = await service.getDepartmentTree();
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe('1');
      expect(tree[0].childDepartments[0].id).toBe('2');
    });
  });

  describe('deleteDepartment', () => {
    it('should throw BadRequestError if department has users', async () => {
      prismaMock.department.findUnique.mockResolvedValue({ id: 'dep-1' } as any);
      prismaMock.user.count.mockResolvedValue(1);

      await expect(service.deleteDepartment('dep-1')).rejects.toThrow(
        'Không thể xóa phòng ban đang có nhân viên trực thuộc (DepartmentID: dep-1).'
      );
    });
  });
});
