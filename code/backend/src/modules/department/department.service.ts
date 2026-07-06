import prisma from '../../config/db';
import { Department, Prisma } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../errors/AppError';
import { CreateDepartmentInput, UpdateDepartmentInput } from './department.dto';

export class DepartmentService {
  async getDepartments() {
    return prisma.department.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parentDepartment: { select: { id: true, name: true, code: true } }
      }
    });
  }

  async getDepartmentTree() {
    // Lấy toàn bộ để linh hoạt
    const allDepartments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    // Khởi tạo map
    for (const dept of allDepartments) {
      map.set(dept.id, { ...dept, childDepartments: [] });
    }

    // Xây dựng cây
    for (const dept of allDepartments) {
      const node = map.get(dept.id);
      if (dept.parentDepartmentId) {
        const parent = map.get(dept.parentDepartmentId);
        if (parent) {
          parent.childDepartments.push(node);
        } else {
          // Fallback nếu parent bị lỗi/thiếu (để không mất dữ liệu)
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        parentDepartment: { select: { id: true, name: true, code: true } },
        childDepartments: true,
      }
    });

    if (!department) {
      throw new NotFoundError('Không tìm thấy phòng ban.');
    }

    return department;
  }

  async createDepartment(data: CreateDepartmentInput) {
    // Check code unique
    const existing = await prisma.department.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new BadRequestError(`Mã phòng ban đã tồn tại (${data.code}).`);
    }

    if (data.parentDepartmentId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentDepartmentId },
      });
      if (!parent) {
        throw new BadRequestError(`Không tìm thấy phòng ban cha (ID: ${data.parentDepartmentId}).`);
      }
    }

    return prisma.department.create({
      data,
    });
  }

  async updateDepartment(id: string, data: UpdateDepartmentInput) {
    const department = await this.getDepartmentById(id);

    if (data.code && data.code !== department.code) {
      const existing = await prisma.department.findUnique({
        where: { code: data.code },
      });
      if (existing) {
        throw new BadRequestError(`Mã phòng ban đã tồn tại (${data.code}).`);
      }
    }

    if (data.parentDepartmentId !== undefined && data.parentDepartmentId !== department.parentDepartmentId) {
      if (data.parentDepartmentId === id) {
        throw new BadRequestError(`Phòng ban cha không thể là chính nó (ID: ${id}).`);
      }

      if (data.parentDepartmentId) {
        // Kiểm tra xem parent mới có phải là con cháu của phòng ban hiện tại không (tránh vòng lặp đệ quy)
        let currentParentId: string | null = data.parentDepartmentId;
        while (currentParentId) {
          if (currentParentId === id) {
            throw new BadRequestError(`Không thể gán phòng ban cha là một trong các phòng ban con (ID: ${data.parentDepartmentId}).`);
          }
          const parentDept: Department | null = await prisma.department.findUnique({ where: { id: currentParentId } });
          currentParentId = parentDept?.parentDepartmentId || null;
        }
      }
    }

    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async deleteDepartment(id: string) {
    await this.getDepartmentById(id);

    // Kiểm tra xem có user nào thuộc phòng ban này không
    const userCount = await prisma.user.count({
      where: { departmentId: id },
    });

    if (userCount > 0) {
      throw new BadRequestError(`Không thể xóa phòng ban đang có nhân viên trực thuộc (DepartmentID: ${id}).`);
    }

    // Kiểm tra xem có phòng ban con nào không
    const childCount = await prisma.department.count({
      where: { parentDepartmentId: id },
    });

    if (childCount > 0) {
      throw new BadRequestError(`Không thể xóa phòng ban đang có phòng ban con trực thuộc (DepartmentID: ${id}). Vui lòng di chuyển các phòng ban con trước.`);
    }

    await prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }
}
