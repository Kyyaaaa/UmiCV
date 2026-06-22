import prisma from '../../config/db';
import { Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../errors/AppError';
import { CreateProjectInput, UpdateProjectInput, AssignMembersInput } from './project.dto';

export class ProjectService {
  async getProjects(params: { page?: number; limit?: number; techLeadId?: string; keyword?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      ...(params.techLeadId && { techLeadId: params.techLeadId }),
      ...(params.keyword && {
        OR: [
          { name: { contains: params.keyword, mode: 'insensitive' } },
          { code: { contains: params.keyword, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          techLead: { select: { id: true, fullName: true, email: true } },
          _count: { select: { members: true } },
        },
      }),
    ]);

    return { total, page, limit, data };
  }

  async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        techLead: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!project) throw new NotFoundError('Không tìm thấy dự án.');
    return project;
  }

  async createProject(data: CreateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { code: data.code } });
    if (existing) throw new BadRequestError(`Mã dự án đã tồn tại (${data.code}).`);

    const techLead = await prisma.user.findUnique({ where: { id: data.techLeadId } });
    if (!techLead) throw new BadRequestError(`Tech Lead không tồn tại (ID: ${data.techLeadId}).`);
    if (techLead.role !== 'TechLead') throw new BadRequestError(`User được chọn không phải là Tech Lead (ID: ${data.techLeadId}).`);

    return prisma.project.create({ data });
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    await this.getProjectById(id);

    if (data.code) {
      const existing = await prisma.project.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) throw new BadRequestError(`Mã dự án đã tồn tại (${data.code}).`);
    }

    if (data.techLeadId) {
      const techLead = await prisma.user.findUnique({ where: { id: data.techLeadId } });
      if (!techLead) throw new BadRequestError(`Tech Lead không tồn tại (ID: ${data.techLeadId}).`);
      if (techLead.role !== 'TechLead') throw new BadRequestError(`User được chọn không phải là Tech Lead (ID: ${data.techLeadId}).`);
    }

    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async deleteProject(id: string) {
    await this.getProjectById(id);
    await prisma.project.delete({ where: { id } }); // Will cascade delete project_members
    return { success: true };
  }

  async getProjectMembers(projectId: string, params: { page?: number, limit?: number } = {}) {
    await this.getProjectById(projectId);

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [total, members] = await Promise.all([
      prisma.projectMember.count({ where: { projectId } }),
      prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: { select: { id: true, fullName: true, email: true, role: true, departmentId: true } },
        },
        orderBy: { joinedAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    return { total, page, limit, data: members };
  }

  async assignMembers(projectId: string, data: AssignMembersInput) {
    await this.getProjectById(projectId);

    // Verify all users exist
    const users = await prisma.user.findMany({
      where: { id: { in: data.userIds }, deletedAt: null },
    });

    if (users.length !== data.userIds.length) {
      throw new BadRequestError('Một hoặc nhiều user không tồn tại hoặc đã bị khóa (Vui lòng kiểm tra lại danh sách ID).');
    }

    // Insert ignore/upsert using Prisma createMany (PostgreSQL specific skipDuplicates)
    await prisma.projectMember.createMany({
      data: data.userIds.map(userId => ({
        projectId,
        userId,
      })),
      skipDuplicates: true,
    });

    return { success: true };
  }

  async removeMember(projectId: string, userId: string) {
    await this.getProjectById(projectId);

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      throw new BadRequestError(`User không nằm trong dự án này (UserID: ${userId}).`);
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    return { success: true };
  }
}
