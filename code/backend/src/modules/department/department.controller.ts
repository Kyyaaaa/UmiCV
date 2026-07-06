import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
import { createDepartmentSchema, updateDepartmentSchema } from './department.dto';
import { z } from 'zod';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getDepartments(req: Request, res: Response) {
    const data = await departmentService.getDepartments();
    res.status(200).json({ success: true, data });
  }

  async getDepartmentTree(req: Request, res: Response) {
    const data = await departmentService.getDepartmentTree();
    res.status(200).json({ success: true, data });
  }

  async getDepartmentById(req: Request, res: Response) {
    const data = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json({ success: true, data });
  }

  async createDepartment(req: Request, res: Response) {
    const data = createDepartmentSchema.parse(req.body);
    const department = await departmentService.createDepartment(data);
    res.status(201).json({ success: true, data: department });
  }

  async updateDepartment(req: Request, res: Response) {
    const data = updateDepartmentSchema.parse(req.body);
    const department = await departmentService.updateDepartment(req.params.id, data);
    res.status(200).json({ success: true, data: department });
  }

  async deleteDepartment(req: Request, res: Response) {
    await departmentService.deleteDepartment(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa phòng ban thành công' });
  }
}
