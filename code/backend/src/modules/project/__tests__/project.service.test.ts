import { prismaMock } from '../../../__tests__/prismaMock';
import { ProjectService } from '../project.service';

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    service = new ProjectService();
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'tl-1', role: 'TechLead' } as any);
      prismaMock.project.create.mockResolvedValue({ id: 'proj-1', name: 'P1', code: 'P1', techLeadId: 'tl-1' } as any);

      const result = await service.createProject({ name: 'P1', code: 'P1', techLeadId: 'tl-1' });

      expect(result).toBeDefined();
      expect(prismaMock.project.create).toHaveBeenCalled();
    });

    it('should throw BadRequestError if user is not TechLead', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'emp-1', role: 'Employee' } as any);

      await expect(service.createProject({ name: 'P1', code: 'P1', techLeadId: 'emp-1' } as any)).rejects.toThrow(
        'User được chọn không phải là Tech Lead (ID: emp-1).'
      );
    });
  });

  describe('assignMembers', () => {
    it('should assign members successfully', async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' } as any);
      prismaMock.user.findMany.mockResolvedValue([{ id: 'emp-1' }, { id: 'emp-2' }] as any);
      prismaMock.projectMember.createMany.mockResolvedValue({ count: 2 } as any);

      const result = await service.assignMembers('proj-1', { userIds: ['emp-1', 'emp-2'] });

      expect(result.success).toBe(true);
      expect(prismaMock.projectMember.createMany).toHaveBeenCalled();
    });

    it('should throw BadRequestError if some users do not exist', async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' } as any);
      prismaMock.user.findMany.mockResolvedValue([{ id: 'emp-1' }] as any);

      await expect(service.assignMembers('proj-1', { userIds: ['emp-1', 'emp-2'] })).rejects.toThrow(
        'Một hoặc nhiều user không tồn tại hoặc đã bị khóa (Vui lòng kiểm tra lại danh sách ID).'
      );
    });
  });

  describe('getProjectMembers', () => {
    it('should return paginated members for a valid project', async () => {
      prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' } as any);
      prismaMock.projectMember.count.mockResolvedValue(1);
      prismaMock.projectMember.findMany.mockResolvedValue([
        { userId: 'user-1' } as any
      ]);

      const result = await service.getProjectMembers('proj-1', {});
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
